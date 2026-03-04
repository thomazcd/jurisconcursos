import { GoogleGenAI } from '@google/genai';

export class AIService {
    private static ai: GoogleGenAI | null = null;

    private static getAI() {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY não configurada no servidor.');
        }
        if (!this.ai) {
            this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        }
        return this.ai;
    }

    /**
     * Gera uma questão de flashcard difícil baseada em inteligência jurídica.
     * Alterna entre assertivas verdadeiras e falsas.
     */
    static async generateFlashcard(summary: string) {
        const ai = this.getAI();

        const prompt = `
            Você é um especialista em concursos de alto nível (Magistratura e Procuradoria). 
            Com base na tese jurídica abaixo, crie uma assertiva estilo CESPE (Verdadeiro ou Falso).
            
            DIRETRIZES:
            1. Seja desafiador e técnico, mas sem inventar fatos novos.
            2. A assertiva pode ser VERDADEIRA (parafraseada para testar o conhecimento) ou FALSA (alterando um requisito essencial, invertendo a lógica ou omitindo exceções cruciais).
            3. Use terminologia jurídica adequada.
            
            Tese:
            """
            ${summary}
            """
            
            Retorne ESTRITAMENTE um JSON no seguinte formato:
            {
                "question": "A assertiva criada aqui...",
                "answer": true ou false (seja true se a assertiva for correta segundo a tese, false se for incorreta)
            }
        `;

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-1.5-flash',
                contents: prompt,
                config: {
                    temperature: 0.7, // Variar as assertivas entre V e F
                    responseMimeType: 'application/json'
                }
            });

            const rawText = (response as any).text || '';
            const data = JSON.parse(rawText);
            return {
                question: data.question as string,
                answer: data.answer as boolean
            };
        } catch (error) {
            console.error('Erro ao gerar flashcard com IA:', error);
            throw error;
        }
    }
}
