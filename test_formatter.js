const legalConnectors = [
    "Assim,", "Dessa forma,", "Nesse contexto,", "Neste cenário,",
    "Nesse sentido,", "Portanto,", "Desse modo,", "Com efeito,",
    "Nesse raciocínio,", "Ademais,", "Outrossim,", "Saliente-se que,",
    "Destaca-se que,", "Na hipótese,", "Nessa linha de intelecção,",
    "Todavia,", "Entretanto,", "Contudo,", "Inicialmente,"
];

const text = `A homologação de sentenças estrangeiras no Brasil, exige requisitos. Na hipótese, todavia, o pedido envolve a homologação de atos notariais estrangeiros que importam diretamente a confirmação de testamento hológrafo e a partilha de bens situados no Brasil. A matéria encontra-se sob reserva de jurisdição.

Com efeito, consoante disposto na legislação de regência, compete exclusivamente à autoridade.
Portanto, a eficácia de disposições testamentárias que recaiam sobre patrimônio situado no Brasil depende de controle jurisdicional interno, em respeito à ordem pública e à soberania nacional.
De igual modo, a alegação de consenso entre as herdeiras não tem o condão de afastar o controle jurisdicional incidente sobre o testamento hológrafo. Eventual acordo poderá ser validamente submetido ao juízo nacional competente.
Ademais, o próprio Código Civil estabelece regramento específico.
Dessa forma, a homologação de ato notarial estrangeiro não pode substituir o devido processo perante a jurisdição brasileira.`;

function formatLegalText(text) {
    if (!text) return '';
    let result = text;
    legalConnectors.forEach(conn => {
        // Regex to find connector preceded by end-of-sentence punctuation (. ! ? ;) and whitespace
        // $1 is the punctuation, $2 is the whitespace, $3 is the connector
        const regex = new RegExp(`([.!?;]["']?)(\\s+)(${conn})`, 'gi');
        result = result.replace(regex, `$1\n\n$3`);
    });
    
    // Clean up excessive newlines
    result = result.replace(/\n{3,}/g, '\n\n');
    return result;
}

console.log(formatLegalText(text));
