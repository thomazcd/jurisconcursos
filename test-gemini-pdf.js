const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
async function test() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return console.log('No key');
    const ai = new GoogleGenAI({ apiKey });

    // Create a dummy PDF bytes buffer (just the minimal %PDF-1.4 header and empty object to prevent throw)
    const buf = Buffer.from('%PDF-1.4\n1 0 obj\n<>\nendobj\nxref\n0 2\n0000000000 65535 f \n0000000009 00000 n \ntrailer\n<<\n/Size 2\n/Root 1 0 R\n>>\nstartxref\n29\n%%EOF', 'utf-8');

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                {
                    inlineData: {
                        data: buf.toString('base64'),
                        mimeType: 'application/pdf'
                    }
                },
                'What is in this PDF?'
            ]
        });
        console.log(response.text);
    } catch (e) { console.error('Error:', e); }
}
test();
