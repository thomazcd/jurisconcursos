
import { PrismaClient, Court } from '@prisma/client';

const prisma = new PrismaClient();

const JULGADO_1_FULL_TEXT = `A questão submetida a julgamento sob o rito dos recursos repetitivos, nos termos do art. 1.036 do Código de Processo Civil, para formação de precedente vinculante previsto no art. 927, III, do Código de Processo Civil, é a seguinte: "definir se, à luz do CPC, é cabível a condenação do contribuinte em honorários advocatícios sucumbenciais em embargos à execução fiscal extintos com fundamento na desistência ou na renúncia de direito manifestada para fins de adesão a programa de recuperação fiscal, em que já está inserida a cobrança de verba honorária no âmbito administrativo.".

A jurisprudência que o Superior Tribunal de Justiça sedimentou na vigência do Código de Processo Civil de 1973 foi no sentido de haver autonomia, ainda que relativa, entre a execução fiscal e os embargos, de modo a admitir a condenação em honorários advocatícios em ambos os processos, mas com a limitação de que a soma dos valores arbitrados não superasse o percentual máximo de 20% então previsto no art. 20, § 3º, do CPC/1973, reconhecida a faculdade de o magistrado proceder a esse arbitramento cumulativo numa única decisão.

Seguindo essa orientação, as Turmas de Direito Público, interpretando o art. 26 do CPC/1973 (atual art. 90 do CPC/2015), adotaram o posicionamento pelo cabimento da condenação em honorários advocatícios em face da desistência ou da renúncia manifestadas nos embargos à execução fiscal para fins de adesão a programa de parcelamento, excepcionando a aplicação dessa regra geral na hipótese de a lei de regência do benefício fiscal disciplinar de forma diversa.

Ocorre que o CPC/2015 inovou ao estabelecer regra específica sobre honorários advocatícios nos casos de rejeição de embargos à execução de título executivo extrajudicial, categoria que também abrange a espécie Certidão de Dívida Ativa (CDA).

Agora prevê o art. 827, § 2º, que, quando a defense apresentada pelo devedor não logra êxito na desconstituição total ou parcial da dívida cobrada, seja em sede de embargos, seja nos próprios autos da execução, caberá ao magistrado majorar a verba honorária já estabelecida inicialmente em 10% (dez por cento), observado o limite de 20% (vinte por cento) sobre o valor do crédito exequendo.

Portanto, a verba honorária somente será devida em relação à cobrança da dívida (processo de execução), initially fixada em 10% e passível de majoração até 20% para remunerar o trabalho adicional do advogado do credor, não havendo mais condenação autônoma de honorários advocatícios na sentença extintiva dos embargos.

Aplicando esta nova disciplina normativa à controvérsia em julgamento, tem-se que, havendo inclusão de honorários advocatícios referentes à cobrança de dívida pública por ocasião de adesão ao programa de recuperação fiscal, a Fazenda Pública não poderá exigir judicialmente valor adicional a título de verba honorária, sob pena de bis in idem, pois o acerto dos honorários no momento da adesão ao parcelamento configura verdadeira transação sobre esse crédito.

Assim, fixa-se a seguinte tese do Tema Repetitivo 1.317/STJ: "A extinção dos embargos à execução fiscal em face da desistência ou da renúncia do direito manifestada para fins de adesão a programa de recuperação fiscal em que já inserida a verba honorária pela cobrança da dívida pública não enseja nova condenação em honorários advocatícios."

Modulação de efeitos: preservados os pagamentos de honorários advocatícios já recolhidos quando decorrentes de sentença que extingue embargos à execução fiscal em face da adesão a programa de recuperação fiscal que já contemplava verba honorária pela cobrança da dívida pública, se não foram (os pagamentos) objeto de impugnação apresentada pela parte embargante até 18 de março de 2025 - data de encerramento da sessão virtual em que foi afetado o presente tema.`;

async function main() {
    console.log('--- RESETTING DATABASE PRECEDENTS ---');
    await prisma.precedent.deleteMany();

    console.log('--- IMPORTING FINAL VERSION OF JULGADO 1 (INF. 875) WITH MULTIPLE PROCESSES ---');

    await prisma.precedent.create({
        data: {
            court: Court.STJ,
            title: 'Honorários em Embargos à Execução Fiscal por Adesão ao REFIS Tema 1317',
            summary: 'A extinção dos embargos à execução fiscal em face da desistência ou da renúncia do direito manifestada para fins de adesão a programa de recuperação fiscal em que já inserida a verba honorária pela cobrança da dívida pública não enseja nova condenação em honorários advocatícios.',
            fullTextOrLink: JULGADO_1_FULL_TEXT,
            informatoryNumber: '875',
            informatoryYear: 2026,
            processClass: 'REsp',
            // Simulating multiple process numbers separated by comma
            processNumber: '2.158.358/MG, REsp 2.158.359/MG',
            rapporteur: 'Ministro Gurgel de Faria',
            organ: 'Primeira Seção',
            judgmentDate: new Date('2025-11-12'),
            publicationDate: new Date('2025-12-24'),
            forAll: true,
            theme: 'Tema 1317', // Back to the specific field
            subjectId: 's-cproc',
            subjects: {
                connect: [
                    { id: 's-cproc' },
                    { id: 's-trib' }
                ]
            }
        }
    });

    console.log('--- FINAL TEST IMPORT WITH TEMA AND MULTIPLE PROCESSES COMPLETED! ---');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
