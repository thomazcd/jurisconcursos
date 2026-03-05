import { NextResponse, NextRequest } from 'next/server';
import { requireAuth } from '@/lib/guards';
import { GoogleGenAI } from '@google/genai';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    const { error } = await requireAuth(['ADMIN', 'GESTOR']);
    if (error) return error;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: 'GEMINI_API_KEY não configurada no servidor (.env).' }, { status: 500 });
    }
    const ai = new GoogleGenAI({ apiKey });

    try {
        const formData = await req.formData();
        const file = formData.get('pdf') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'Nenhum arquivo PDF recebido.' }, { status: 400 });
        }

        const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB
        if (file.size > MAX_PDF_SIZE) {
            return NextResponse.json({ error: 'O PDF excede o limite de 10MB.' }, { status: 400 });
        }

        // Convert the file to an ArrayBuffer, then base64 for Gemini
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Data = buffer.toString('base64');

        const prompt = `
Vou te enviar um arquivo PDF orginal de Boletim ou Informativo de Jurisprudência inteiro do STJ/STF.
Sua missão é atuar como um Extrator Especialista de Dados e analisá-lo com sua visão multimodal.
Identifique e extraia TODOS os julgados (teses) presentes neste informativo.
Extraia primeiramente o número do Informativo, e a seguir a lista de todos os precedentes encontrados, no formato JSON abaixo:

{
  "informatoryNumber": "Identifique o número cardinal do informativo constante no PDF (ex: 876). Se não achar, retorne null.",
  "informatoryDate": "Identifique a data do informativo (ex: data de publicação geral), geralmente está no topo ao lado ou abaixo do número. Forneça no formato bancário YYYY-MM-DD. Se não achar, retorne null.",
  "precedents": [
    {
      "title": "Extraia o texto completo do Tema-Assunto original e oficial da tese, sem resumi-lo. Preservar o texto na sua inteireza.",
      "summary": "Crie um resumo sintético destacando as principais palavras-chave do Destaque, focado na tese. Facilite a leitura dinâmica. Obrigatório: Não utilize dois pontos (:) neste resumo.",
      "fullText": "Extraia o texto fiel do inteiro teor contido nas páginas do PDF que baseou esse julgado. Preserve a escrita jurídica.",
      "flashcardQuestion": "Crie uma assertiva estilo CESPE (V ou F) com base nessa tese. Que seja um pouco pegadinha mas correta em relação ao texto (ou deliberadamente incorreta se for mais didático).",
      "flashcardAnswer": true ou false (dependendo de como você formulou a questão),
      "processClass": "Identifique a classe e processo. Ex: HC 123.456, AgRg no REsp 999.888",
      "organ": "Identifique o órgão julgador (Ex: Terceira Seção, Segunda Turma, Tribunal Pleno)",
      "rapporteur": "Identifique o relator (Ex: Min. Rogério Schietti Cruz)",
      "judgmentDate": "Extraia a data de julgamento se houver no formato YYYY-MM-DD",
      "theme": "Identifique se foi julgado em 'Tema X', 'Recurso Repetitivo', 'Repercussão Geral'. Se não achar, deixe null."
    }
  ]
}

Retorne ESTRITAMENTE um objeto JSON puro (sem markdown, sem \`\`\`json).
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                {
                    inlineData: {
                        mimeType: 'application/pdf',
                        data: base64Data
                    }
                },
                prompt
            ],
            config: {
                temperature: 0.2, // Low temperature for extraction fidelity
                responseMimeType: 'application/json'
            }
        });

        const rawText = response.text || '';
        const jsonData = JSON.parse(rawText);

        return NextResponse.json(jsonData);
    } catch (error: any) {
        console.error('Erro no processamento do PDF pelo Gemini:', error);
        return NextResponse.json({ error: 'Erro ao processar PDF com a IA.' }, { status: 500 });
    }
}
