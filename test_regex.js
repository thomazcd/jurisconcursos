const text = `*   **Órgão Julgador:** Corte Especial.
*   **Data de Julgamento:** 11/11/2025.
*   **Data de Publicação:** 18/11/2025.
*   **Número do Processo:** Processo em segredo de justiça.
*   **Relator:** Min. Og Fernandes.
*   **Relator para o acórdão:** N/A.
*   **Número do Tema:** 
*   **Ramos do Direito:** DIREITO CIVIL, DIREITO INTERNACIONAL, DIREITO PROCESSUAL CIVIL.
*   **Tema-Assunto:** Homologação de decisão estrangeira. Ato notarial estrangeiro. Testamento particular e partilha de bens situados no Brasil. Matéria reservada à jurisdição brasileira. Pedido de homologação. Inviabilidade.
*   **Destaque:** A homologação de ato notarial estrangeiro que versa sobre bens situados no Brasil contraria o art. 964 do CPC, que veda a homologação de decisões estrangeiras em hipóteses de competência exclusiva da jurisdição nacional.
*   **Inteiro Teor:** O caso concreto trata de recurso contra decisão que indeferiu o pedido de homologação de ato extrajudicial praticado por tabelião francês consistente no registro da declaração de espólio e na lavratura de ata de execução de testamento, compreendendo a partilha de bens situados no Brasil.
`;

const blocks = text.split(/(?=\*\s*\*\*Órgão Julgador:\*\*|\*\s*\*\*Número do Processo:\*\*)/g).filter(x => x.trim().length > 0);

for (const block of blocks) {
    const lines = block.split('\n');
    let orgaoObj = '';
    let julgamento = null;
    let publicacao = null;
    
    for (const line of lines) {
        if (line.includes('**Órgão Julgador:**')) { orgaoObj = line.replace(/\*?\s*\*\*Órgão Julgador:\*\*/, '').trim(); }
        else if (line.includes('**Data de Julgamento:**')) { 
            const dRaw = line.replace(/\*?\s*\*\*Data de Julgamento:\*\*/, '').trim().replace(/\.$/, ''); 
            if (dRaw.includes('/')) julgamento = dRaw.split('/').reverse().join('-'); 
        }
        else if (line.includes('**Data de Publicação:**')) { 
            const dRaw = line.replace(/\*?\s*\*\*Data de Publicação:\*\*/, '').trim().replace(/\.$/, '');
            if (dRaw.includes('/')) publicacao = dRaw.split('/').reverse().join('-'); 
        }
    }
    console.log({ orgaoObj, julgamento, publicacao });
}
