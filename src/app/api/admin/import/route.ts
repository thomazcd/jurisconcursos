import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PublishStatus, Court } from '@prisma/client';

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const val = session.user as any;
    if (val.role !== 'GESTOR' && val.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Proibido' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { informatory, precedents } = body;

        if (!informatory || !precedents || !Array.isArray(precedents) || precedents.length === 0) {
            return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
        }

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

        // Criar os Precedentes vinculados
        const records = precedents.map((p: any) => ({
            title: p.title,
            summary: p.summary,
            fullTextOrLink: p.fullTextOrLink,
            processClass: p.processClass || null,
            processNumber: p.processNumber || null,
            organ: p.organ || null,
            rapporteur: p.rapporteur || null,
            theme: p.theme || null,
            judgmentDate: p.judgmentDate ? new Date(p.judgmentDate) : null,
            flashcardQuestion: p.flashcardQuestion || null,
            flashcardAnswer: p.flashcardAnswer,
            forAll: p.forAll,
            forProcurador: p.forProcurador,
            forJuizFederal: p.forJuizFederal,
            forJuizEstadual: p.forJuizEstadual,
            status: 'PUBLISHED' as PublishStatus,
            informatoryId: inf.id,
            court: informatory.court as Court,
            informatoryNumber: informatory.number,
            informatoryYear: informatory.year,
        }));

        await prisma.precedent.createMany({
            data: records
        });

        return NextResponse.json({ success: true, informatoryId: inf.id, inserted: records.length });
    } catch (error: any) {
        console.error('Erro na Importação do Informativo:', error);
        return NextResponse.json({ error: error.message || 'Erro Interno' }, { status: 500 });
    }
}
