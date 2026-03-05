import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/guards';
import { PublishStatus, Court } from '@prisma/client';
import { z } from 'zod';

const importSchema = z.object({
    informatory: z.object({
        court: z.enum(['STF', 'STJ', 'TRF', 'TJ']),
        number: z.string(),
        year: z.number().int().optional().nullable(),
        publicationDate: z.string().optional().nullable(),
    }),
    precedents: z.array(z.object({
        title: z.string().min(2),
        summary: z.string().min(2),
        fullTextOrLink: z.string().optional().nullable(),
        processClass: z.string().optional().nullable(),
        processNumber: z.string().optional().nullable(),
        organ: z.string().optional().nullable(),
        rapporteur: z.string().optional().nullable(),
        theme: z.string().optional().nullable(),
        judgmentDate: z.string().optional().nullable(),
        publicationDate: z.string().optional().nullable(),
        tags: z.array(z.string()).optional().default([]),
        flashcardQuestion: z.string().optional().nullable(),
        flashcardAnswer: z.boolean().default(true),
        forAll: z.boolean().default(false),
        forProcurador: z.boolean().default(false),
        forJuizFederal: z.boolean().default(false),
        forJuizEstadual: z.boolean().default(false),
    })).min(1),
});

export async function POST(req: NextRequest) {
    const { error } = await requireAuth(['ADMIN', 'GESTOR']);
    if (error) return error;

    try {
        const body = await req.json();
        const parsed = importSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten() }, { status: 400 });
        }

        const { informatory, precedents } = parsed.data;

        // Criar ou atualizar o Informativo
        const inf = await prisma.informatory.upsert({
            where: {
                court_number: {
                    court: informatory.court as Court,
                    number: informatory.number,
                }
            },
            update: {
                year: informatory.year,
                publicationDate: informatory.publicationDate ? new Date(informatory.publicationDate) : null,
                status: 'PUBLISHED' as PublishStatus
            },
            create: {
                court: informatory.court as Court,
                number: informatory.number,
                year: informatory.year,
                publicationDate: informatory.publicationDate ? new Date(informatory.publicationDate) : null,
                status: 'PUBLISHED' as PublishStatus
            }
        });

        // Prepare subject auto-mapping rules
        const subjects = await prisma.subject.findMany();
        const rules = [
            { id: 's-ptrib', keywords: ['processo tributário'] },
            { id: 's-trib', keywords: ['tributário', 'imposto', 'refis', 'fiscal', 'contribuinte', 'icms', 'iss', 'irpf', 'irpj', 'iptu', 'itcmd'] },
            { id: 's-cproc', keywords: ['processo civil', 'processual civil', 'cpc', 'honorários', 'recurso', 'agravo', 'apelação', 'competência', 'legitimidade', 'embargos'] },
            { id: 's-admin', keywords: ['administrativo', 'servidor', 'concurso', 'improbidade', 'licitação', 'poder público', 'estado', 'município'] },
            { id: 's-civil', keywords: ['civil', 'contrato', 'família', 'sucessões', 'danos morais', 'responsabilidade civil', 'propriedade'] },
            { id: 's-pproc', keywords: ['processo penal', 'processual penal', 'cpp'] },
            { id: 's-pen', keywords: ['penal', 'crime', 'delito', 'prisão', 'condenação', 'pena', 'tráfico', 'roubo', 'furto'] },
            { id: 's-cons', keywords: ['consumidor', 'código de defesa', 'cdc', 'vício', 'produto', 'serviço', 'propaganda'] },
            { id: 's-const', keywords: ['constitucional', 'constituição', 'inconstitucional'] },
            { id: 's-empr', keywords: ['empresarial', 'societário', 'falência', 'recuperação judicial', 'sociedade', 'empresa'] },
            { id: 's-ambi', keywords: ['ambiental', 'meio ambiente', 'ibama', 'desmatamento'] },
            { id: 's-prev', keywords: ['previdenciário', 'inss', 'aposentadoria', 'pensão'] },
            { id: 's-intl', keywords: ['internacional', 'tratado', 'extradição'] },
            { id: 's-econ', keywords: ['econômico', 'cade'] },
            { id: 's-elei', keywords: ['eleitoral', 'tse', 'eleição', 'partido'] },
            { id: 's-eca', keywords: ['criança', 'adolescente', 'eca', 'menor'] },
            { id: 's-trab', keywords: ['trabalho', 'clt', 'empregador', 'empregado'] },
            { id: 's-ptrab', keywords: ['processo do trabalho'] },
        ];

        // Criar os Precedentes vinculados e mapear os subjects
        let insertedCount = 0;
        for (const p of precedents) {
            let matchedSubjectIds = new Set<string>();

            // 1. Tag based match
            const tags = p.tags || [];
            for (const t of tags) {
                const tNorm = t.toLowerCase().trim();
                for (const s of subjects) {
                    if (tNorm.includes(s.name.toLowerCase()) || s.name.toLowerCase().includes(tNorm.replace(/^direito /, ''))) {
                        matchedSubjectIds.add(s.id);
                    }
                }
            }

            // 2. Keyword based match
            const textToSearch = `${tags.join(' ')} ${p.title} ${p.summary}`.toLowerCase();
            for (const rule of rules) {
                if (rule.keywords.some(k => textToSearch.includes(k))) {
                    matchedSubjectIds.add(rule.id);
                }
            }

            const connectSubjects = Array.from(matchedSubjectIds).map(id => ({ id }));

            await prisma.precedent.create({
                data: {
                    title: p.title,
                    summary: p.summary,
                    fullTextOrLink: p.fullTextOrLink,
                    processClass: p.processClass || null,
                    processNumber: p.processNumber || null,
                    organ: p.organ || null,
                    rapporteur: p.rapporteur || null,
                    theme: p.theme || null,
                    judgmentDate: p.judgmentDate ? new Date(p.judgmentDate) : null,
                    publicationDate: p.publicationDate ? new Date(p.publicationDate) : null,
                    tags: tags,
                    flashcardQuestion: p.flashcardQuestion || null,
                    flashcardAnswer: p.flashcardAnswer,
                    forAll: p.forAll,
                    forProcurador: p.forProcurador,
                    forJuizFederal: p.forJuizFederal,
                    forJuizEstadual: p.forJuizEstadual,
                    status: 'PUBLISHED' as PublishStatus,
                    informatory: { connect: { id: inf.id } },
                    court: informatory.court as Court,
                    informatoryNumber: informatory.number,
                    informatoryYear: informatory.year,
                    subjects: { connect: connectSubjects }
                }
            });
            insertedCount++;
        }

        return NextResponse.json({ success: true, informatoryId: inf.id, inserted: insertedCount });
    } catch (error: any) {
        console.error('Erro na Importação do Informativo:', error);
        return NextResponse.json({ error: error.message || 'Erro Interno' }, { status: 500 });
    }
}
