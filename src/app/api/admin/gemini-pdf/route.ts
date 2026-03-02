import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GoogleGenAI } from '@google/genai';
const pdfParse = require('pdf-parse');

export const maxDuration = 60;

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const val = session.user as any;
    if (val.role !== 'GESTOR' && val.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Proibido' }, { status: 403 });
    }

    if (!ai) {
        return NextResponse.json({ error: 'GEMINI_API_KEY não configurada no servidor (.env).' }, { status: 500 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get('pdf') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'Nenhum arquivo PDF recebido.' }, { status: 400 });
        }

        // Convert the file to an ArrayBuffer, then Buffer for pdf-parse
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const pdfData = await pdfParse(buffer);
        const parsedText = pdfData.text;

        if (!parsedText || parsedText.trim() === '') {
            return NextResponse.json({ error: 'O PDF parece estar vazio ou é uma imagem sem texto (necessita OCR não suportado nesta camada).' }, { status: 400 });
        }

        const prompt = `
Vou te passar o texto extraído de um arquivo PDF de Boletim ou Informativo de Jurisprudência inteiro.
Sua missão é atuar como um Extrator Especialista de Dados. 
Identifique e extraia TODOS os julgados (teses) presentes neste informativo.
Para CADA julgado identificado, extraia e preencha o seguinte formato JSON:

[
  {
    "title": "Crie um título curto e chamativo para o assunto principal (Tese principal). Ex: Tráfico e Violação Domiciliar",
    "summary": "Crie um resumo (Destaque Institucional) com no máximo 4 linhas, direto e reto que ajude um concorseiro a saber a tese do tribunal.",
    "fullText": "Extraia o texto do inteiro teor que baseou esse julgado. Preserve a escrita jurídica.",
    "flashcardQuestion": "Crie uma assertiva estilo CESPE (V ou F) com base nessa tese. Que seja um pouco pegadinha mas correta em relação ao texto (ou deliberadamente incorreta se for mais didático).",
    "flashcardAnswer": true ou false (dependendo de como você formulou a questão),
    "processClass": "Identifique a classe e processo. Ex: HC 123.456, AgRg no REsp 999.888",
    "organ": "Identifique o órgão julgador (Ex: Terceira Seção, Segunda Turma, Tribunal Pleno)",
    "rapporteur": "Identifique o relator (Ex: Min. Rogério Schietti Cruz)",
    "judgmentDate": "Extraia a data de julgamento se houver no formato YYYY-MM-DD",
    "theme": "Identifique se foi julgado em 'Tema X', 'Recurso Repetitivo', 'Repercussão Geral'. Se não achar, deixe null."
  }
]

Retorne ESTRITAMENTE um array JSON puro (sem markdown, sem \`\`\`json) contendo os objetos.

Texto do PDF:
"""
${parsedText}
"""
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.2, // Low temperature for extraction fidelity
                responseMimeType: 'application/json'
            }
        });

        const rawText = response.text || '';
        const jsonData = JSON.parse(rawText);

        return NextResponse.json({ precedents: jsonData });
    } catch (error: any) {
        console.error('Erro no processamento do PDF pelo Gemini:', error);
        return NextResponse.json({ error: error.message || 'Erro ao processar PDF com a IA.' }, { status: 500 });
    }
}
