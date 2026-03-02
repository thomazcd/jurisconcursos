import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;

// Initialize the Gemini SDK if the key is present
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
        const body = await req.json();
        const { text } = body;

        if (!text || typeof text !== 'string') {
            return NextResponse.json({ error: 'Texto não fornecido.' }, { status: 400 });
        }

        const prompt = `
Irei colar abaixo o "Inteiro Teor" / "Destaque" / "Acrádão" cru copiado direto do site do STJ/STF.
Sua missão é extrair e estruturar os dados desse julgado para o meu sistema de Flashcards de concurso público.

Por favor, analise o texto e me responda estritamente no seguinte formato JSON (não use markdown, tags ou expliações, apenas o JSON purinho):

{
  "title": "Crie um título curto e chamativo para o assunto principal (Tese principal). Ex: Tráfico e Violação Domiciliar",
  "summary": "Crie um resumo (Destaque Institucional) com no máximo 4 linhas, direto e reto que ajude um concorseiro a saber a tese do tribunal.",
  "flashcardQuestion": "Crie uma assertiva estilo CESPE (V ou F) com base nessa tese. Que seja um pouco pegadinha mas correta em relação ao texto (ou deliberadamente incorreta se for mais didático).",
  "flashcardAnswer": true ou false (dependendo de como você formulou a questão),
  "processClass": "Identifique a classe e processo. Ex: HC 123.456, AgRg no REsp 999.888",
  "organ": "Identifique o órgão julgador (Ex: Terceira Seção, Segunda Turma, Tribunal Pleno)",
  "rapporteur": "Identifique o relator (Ex: Min. Rogério Schietti Cruz)",
  "judgmentDate": "Extraia a data de julgamento se houver no formato YYYY-MM-DD",
  "theme": "Identifique se foi julgado em 'Tema X', 'Recurso Repetitivo', 'Repercussão Geral'. Se não achar, deixe null."
}

Texto colado:
"""
${text}
"""
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.2, // Low temperature for factual extraction
                responseMimeType: 'application/json'
            }
        });

        const rawText = response.text || '';
        const jsonData = JSON.parse(rawText);

        return NextResponse.json({ suggestion: jsonData });
    } catch (error: any) {
        console.error('Erro no processamento do Gemini:', error);
        return NextResponse.json({ error: error.message || 'Erro ao processar texto com a IA.' }, { status: 500 });
    }
}
