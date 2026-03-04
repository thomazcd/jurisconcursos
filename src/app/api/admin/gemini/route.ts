import { NextResponse, NextRequest } from 'next/server';
import { requireAuth } from '@/lib/guards';
import { GoogleGenAI } from '@google/genai';

export const maxDuration = 60; // Max execution time for Vercel

export async function POST(req: NextRequest) {
    const { error } = await requireAuth(['ADMIN', 'GESTOR']);
    if (error) return error;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: 'GEMINI_API_KEY não configurada no servidor (.env).' }, { status: 500 });
    }
    const ai = new GoogleGenAI({ apiKey });

    try {
        const body = await req.json();
        const { text, isBulk } = body;

        if (!text || typeof text !== 'string') {
            return NextResponse.json({ error: 'Texto não fornecido.' }, { status: 400 });
        }

        if (text.length > 100_000) {
            return NextResponse.json({ error: 'Texto excede o limite de 100.000 caracteres.' }, { status: 400 });
        }

        const prompt = isBulk ? `
Vou te passar o texto bruto extraído de um arquivo PDF de Boletim ou Informativo de Jurisprudência (Informativo de Jurisprudência STF/STJ).
Sua missão é identificar TODOS os julgados (teses) presentes neste texto.
Para CADA julgado identificado, extraia e retorne os dados no formato de um ARRAY de Objetos JSON:

[
  {
    "title": "Crie um título curto e chamativo para o assunto principal. Ex: Tráfico e Violação Domiciliar",
    "summary": "Crie um resumo (Destaque Institucional) com no máximo 4 linhas.",
    "fullText": "Extraia o texto fiel do inteiro teor contido no texto que baseou esse julgado. Preserve a escrita jurídica.",
    "flashcardQuestion": "Crie uma assertiva estilo CESPE (V ou F) com base nessa tese.",
    "flashcardAnswer": true ou false,
    "processClass": "Identifique a classe e processo. Ex: HC 123.456, AgRg no REsp 999.888",
    "organ": "Identifique o órgão julgador (Ex: Terceira Seção, Segunda Turma)",
    "rapporteur": "Identifique o relator (Ex: Min. Rogério Schietti Cruz)",
    "judgmentDate": "Extraia a data de julgamento no formato YYYY-MM-DD",
    "theme": "Identifique se foi julgado em 'Tema X', 'Recurso Repetitivo'. Se não achar, null."
  }
]

Retorne ESTRITAMENTE o array JSON puro.

Texto:
"""
${text}
"""
` : `
Irei colar abaixo o "Inteiro Teor" / "Destaque" / "Acrádão" cru copiado direto do site do STJ/STF.
Sua missão é extrair e estruturar os dados desse julgado para o meu sistema de Flashcards de concurso público.

Por favor, analise o texto e me responda estritamente no seguinte formato JSON:

{
  "title": "Crie um título curto e chamativo para o assunto principal",
  "summary": "Crie um resumo com no máximo 4 linhas.",
  "flashcardQuestion": "Crie uma assertiva estilo CESPE (V ou F) com base nessa tese.",
  "flashcardAnswer": true,
  "processClass": "Ex: HC 123.456",
  "organ": "Ex: Terceira Seção",
  "rapporteur": "Ex: Min. Rogério Schietti Cruz",
  "judgmentDate": "YYYY-MM-DD",
  "theme": "null"
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

        if (isBulk) {
            return NextResponse.json({ precedents: jsonData });
        }
        return NextResponse.json({ suggestion: jsonData });
    } catch (error: any) {
        console.error('Erro no processamento do Gemini:', error);
        return NextResponse.json({ error: 'Erro ao processar texto com a IA.' }, { status: 500 });
    }
}
