
import { PrismaClient, Court } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- RESETTING DATABASE PRECEDENTS ---');
    await prisma.precedent.deleteMany();

    console.log('--- IMPORTING JULGADO 1 (v1.1.025) ---');
    await prisma.precedent.create({
        data: {
            court: Court.STJ,
            title: 'Honorários em Embargos à Execução Fiscal por Adesão ao REFIS Tema 1317',
            summary: 'A extinção dos embargos à execução fiscal em face da desistência ou da renúncia do direito manifestada para fins de adesão a programa de recuperação fiscal em que já inserida a verba honorária pela cobrança da dívida pública não enseja nova condenação em honorários advocatícios.',
            fullTextOrLink: `A questão submetida a julgamento sob o rito dos recursos repetitivos, nos termos do art. 1.036 do Código de Processo Civil, para formação de precedente vinculante previsto no art. 927, III, do Código de Processo Civil, é a seguinte: "definir se, à luz do CPC, é cabível a condenação do contribuinte em honorários advocatícios sucumbenciais em embargos à execução fiscal extintos com fundamento na desistência ou na renúncia de direito manifestada para fins de adesão a programa de recuperação fiscal, em que já está inserida a cobrança de verba honorária no âmbito administrativo.".

A jurisprudência que o Superior Tribunal de Justiça sedimentou na vigência do Código de Processo Civil de 1973 foi no sentido de haver autonomia, ainda que relativa, entre a execução fiscal e os embargos, de modo a admitir a condenação em honorários advocatícios em ambos os processos, mas com a limitação de que a soma dos valores arbitrados não superasse o percentual máximo de 20% então previsto no art. 20, § 3º, do CPC/1973, reconhecida a faculdade de o magistrado proceder a esse arbitramento cumulativo numa única decisão.

Seguindo essa orientação, as Turmas de Direito Público, interpretando o art. 26 do CPC/1973 (atual art. 90 do CPC/2015), adotaram o posicionamento pelo cabimento da condenação em honorários advocatícios em face da desistência ou da renúncia manifestadas nos embargos à execução fiscal para fins de adesão a programa de parcelamento, excepcionando a aplicação dessa regra geral na hipótese de a lei de regência do benefício fiscal disciplinar de forma diversa.

Ocorre que o CPC/2015 inovou ao estabelecer regra específica sobre honorários advocatícios nos casos de rejeição de embargos à execução de título executivo extrajudicial, categoria que também abrange a espécie Certidão de Dívida Ativa (CDA).

Agora prevê o art. 827, § 2º, que, quando a defesa apresentada pelo devedor não logra êxito na desconstituição total ou parcial da dívida cobrada, seja em sede de embargos, seja nos próprios autos da execução, caberá ao magistrado majorar a verba honorária já estabelecida inicialmente em 10% (dez por cento), observado o limite de 20% (vinte por cento) sobre o valor do crédito exequendo.

Portanto, a verba honorária somente será devida em relação à cobrança da dívida (processo de execução), inicialmente fixada em 10% e passível de majoração até 20% para remunerar o trabalho adicional do advogado do credor, não havendo mais condenação autônoma de honorários advocatícios na sentença extintiva dos embargos.

Aplicando esta nova disciplina normativa à controvérsia em julgamento, tem-se que, havendo inclusão de honorários advocatícios referentes à cobrança de dívida pública por ocasião de adesão ao programa de recuperação fiscal, a Fazenda Pública não poderá exigir judicialmente valor adicional a título de verba honorária, sob pena de bis in idem, pois o acerto dos honorários no momento da adesão ao parcelamento configura verdadeira transação sobre esse crédito.

Assim, fixa-se a seguinte tese do Tema Repetitivo 1.317/STJ: "A extinção dos embargos à execução fiscal em face da desistência ou da renúncia do direito manifestada para fins de adesão a programa de recuperação fiscal em que já inserida a verba honorária pela cobrança da dívida pública não enseja nova condenação em honorários advocatícios."

Modulação de efeitos: preservados os pagamentos de honorários advocatícios já recolhidos quando decorrentes de sentença que extingue embargos à execução fiscal em face da adesão a programa de recuperação fiscal que já contemplava verba honorária pela cobrança da dívida pública, se não foram (os pagamentos) objeto de impugnação apresentada pela parte embargante até 18 de março de 2025 - data de encerramento da sessão virtual em que foi afetado o presente tema.`,
            informatoryNumber: '875',
            informatoryYear: 2026,
            processClass: 'REsp',
            processNumber: '2.158.358/MG',
            rapporteur: 'Ministro Gurgel de Faria',
            organ: 'Primeira Seção',
            judgmentDate: new Date('2025-11-12'),
            publicationDate: new Date('2025-12-24'),
            forAll: true,
            theme: 'Tema 1317 | Embargos à execução fiscal. Desistência ou renúncia para fins de adesão a programa de recuperação fiscal. Ajuste que inclui honorários advocatícios. Nova condenação em verba honorária na extinção dos embargos. Descabimento. Modulação de efeitos. Tema 1317.',
            subjectId: 's-cproc',
            subjects: { connect: [{ id: 's-cproc' }, { id: 's-trib' }] }
        }
    });

    console.log('--- IMPORTING JULGADO 2 (v1.1.025) ---');
    await prisma.precedent.create({
        data: {
            court: Court.STJ,
            title: 'Falta grave nos 12 meses anteriores ao decreto de comutação e necessidade de homologação judicial Tema 1195',
            summary: 'O período de 12 meses a que se refere o art. 4º, I, do Decreto n. 9.246/2017 caracteriza-se pela não ocorrência de falta grave, não se relacionando à data de sua apuração, desde que já instaurado o processo administrativo disciplinar.',
            fullTextOrLink: `A questão submetida a julgamento sob o rito dos recursos repetitivos é a seguinte: "A possibilidade de comutação de pena, nos casos em que, embora tenha ocorrido a prática de falta grave nos últimos doze meses que antecederam a publicação do Decreto n. 9.246/2017, não conste homologação em juízo no mesmo período.".

Nos termos do art. 4º, I, do Decreto n. 9.246/2017, o indulto natalino ou a comutação não será concedido às pessoas que "tenham sofrido sanção, aplicada pelo juízo competente em audiência de justificação, garantido o direito aos princípios do contraditório e da ampla defesa, em razão da prática de infração disciplinar de natureza grave, nos doze meses anteriores à data de publicação deste Decreto.".

De fato, à primeira vista pode parecer, em uma interpretação literal, que a vedação temporal à aplicação do benefício estaria configurada quando a sanção decorrente da prática de falta grave tenha sido efetivamente aplicada nos 12 meses anteriores à data do decreto.

Contudo, da própria Exposição de Motivos do Decreto em tela consta que o objetivo da regra é avaliar a ocorrência de falta disciplinar grave nos 12 meses anteriores, denotando que a redação adotada apenas não assumiu a melhor técnica, permitindo alguma ambiguidade.

Ademais, em decretos posteriores, a Presidência da República ajustou a redação, de modo a afastar a mencionada ambiguidade, a exemplo do art. 6º do Decreto n. 11.846/2023, que prevê a inexistência de falta grave "cometida nos doze meses de cumprimento de pena contados retroativamente a 25 de dezembro de 2023".

Não há dúvidas, portanto, de que o objetivo da norma foi o de verificar o bom cumprimento da pena no último ano decorrido, fator indicativo do bom comportamento do beneficiado, essencial ao "desconto" ofertado em sua pena como incentivo da sociedade para o mais breve retorno ao convívio em liberdade plena.

Assim, a interpretação do art. 4º, I, do Decreto n. 9.246/2017, que vincula a concessão da comutação à ausência de falta grave nos doze meses anteriores à publicação do decreto, deve ser realizada de forma lógica e sistemática, considerando o objetivo de avaliar o comportamento recente do apenado, o que afasta a influência da data de homologação da sanção.

Nesse sentido, no julgamento do ERESP 1.549.544/RS, a Terceira Seção do Superior Tribunal de Justiça consolidou entendimento "para considerar possível o indeferimento de indulto ou comutação de pena em razão de falta grave que tenha sido praticada nos doze meses anteriores ao decreto presidencial, ainda que homologada após a sua publicação." (EREsp 1.477.886/RS, Ministro Joel Ilan Paciornik, Terceira Seção, DJe de 17/8/2018).

Esse entendimento é compatível com o que recentemente definiu esta Corte Superior no julgamento do Tema 1347, segundo o qual "[a] regressão cautelar de regime prisional é medida de caráter provisório e está autorizada pelo poder geral de cautela do juízo da execução, podendo ser aplicada, mediante fundamentação idônea, até a apuração definitiva da falta.".

Note-se que interpretação diversa poderia efetivar a situação de um apenado que, por não ter a sanção decorrente de falta grave em apuração aplicada no período de 12 meses anteriores ao decreto, poderia estar em regressão cautelar de regime e ainda assim se beneficiar da comutação.

Por fim, importa registrar que a interpretação aqui acolhida não ofende os princípios que regem a aplicação da lei penal no tempo, uma vez que, em verdade, apenas garante que cada apenado receba as consequências positivas ou negativas derivadas de sua conduta naquele período de 12 meses, compatibilizando-se inclusive uma das três máximas atribuídas ao Direito pelo jurista Romano Ulpiano: "Dar a cada um o que é seu" (suum cuique tribuere).

Assim, fixa-se a seguinte tese do Tema Repetitivo 1195/STJ: "O período de 12 meses a que se refere o art. 4º, I, do Decreto n. 9.246/2017 caracteriza-se pela não ocorrência de falta grave, não se relacionando à data de sua apuração, desde que já instaurado o processo administrativo disciplinar."`,
            informatoryNumber: '875',
            informatoryYear: 2026,
            processClass: 'REsp',
            processNumber: '2.011.706/MG',
            rapporteur: 'Ministro Og Fernandes',
            organ: 'Terceira Seção',
            judgmentDate: new Date('2025-12-10'),
            forAll: true,
            theme: 'Tema 1195 | Comutação da pena. Decreto n. 9.246/2017. Prática de falta grave nos 12 meses anteriores ao decreto. Período impeditivo. Tema 1195.',
            subjectId: 's-pen',
            subjects: { connect: [{ id: 's-pen' }, { id: 's-pproc' }] }
        }
    });

    console.log('--- IMPORT COMPLETED! ---');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
