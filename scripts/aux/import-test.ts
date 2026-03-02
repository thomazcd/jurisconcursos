
import { PrismaClient, Court } from '@prisma/client';

const prisma = new PrismaClient();

const DATA = [
    {
        id: 1,
        process: 'REsp 2.158.358/MG',
        relator: 'Ministro Gurgel de Faria',
        organ: 'Primeira Seção',
        subjects: ['Direito Processual Civil', 'Direito Tributário'],
        subjectIds: ['s-cproc', 's-trib'],
        title: 'Honorários em Embargos à Execução Fiscal por Adesão ao REFIS Tema 1317',
        summary: 'A extinção dos embargos à execução fiscal em face da desistência ou da renúncia do direito manifestada para fins de adesão a programa de recuperação fiscal em que já inserida a verba honorária pela cobrança da dívida pública não enseja nova condenação em honorários advocatícios.',
        full: `A questão submetida a julgamento sob o rito dos recursos repetitivos, nos termos do art. 1.036 do Código de Processo Civil, para formação de precedente vinculante previsto no art. 927, III, do Código de Processo Civil, é a seguinte: "definir se, à luz do CPC, é cabível a condenação do contribuinte em honorários advocatícios sucumbenciais em embargos à execução fiscal extintos com fundamento na desistência ou na renúncia de direito manifestada para fins de adesão a programa de recuperação fiscal, em que já está inserida a cobrança de verba honorária no âmbito administrativo.". 

A jurisprudência que o Superior Tribunal de Justiça sedimentou na vigência do Código de Processo Civil de 1973 foi no sentido de haver autonomia, ainda que relativa, entre a execução fiscal e os embargos do devedor, o que, em regra, justificaria a incidência de honorários advocatícios em cada uma dessas demandas. 

No entanto, em se tratando de desistência de embargos destinados à adesão a parcelamento incentivado ou a programa de recuperação fiscal que já incluam verba honorária em seu custeio, a jurisprudência evoluiu para afastar a duplicidade de condenação. 

Pelo princípio da causalidade, os honorários incidentes sobre o débito objeto de programa de recuperação fiscal substituem aqueles que seriam fixados na extinção dos embargos do devedor, evitando o bis in idem.`,
        judgment: '2025-11-12',
        publication: '2025-12-24'
    }
];

async function main() {
    console.log('--- RESETTING DATABASE PRECEDENTS ---');
    await prisma.precedent.deleteMany();

    console.log('--- IMPORTING TEST JULGADO (INF. 875) ---');

    for (const item of DATA) {
        console.log(`Importing: ${item.process} - ${item.title}`);

        await prisma.precedent.create({
            data: {
                court: Court.STJ,
                title: item.title,
                summary: item.summary,
                fullTextOrLink: item.full,
                informatoryNumber: '875',
                informatoryYear: 2026,
                processClass: item.process.split(' ')[0],
                processNumber: item.process.split(' ').slice(1).join(' '),
                rapporteur: item.relator,
                organ: item.organ,
                judgmentDate: item.judgment ? new Date(item.judgment) : null,
                publicationDate: item.publication ? new Date(item.publication) : null,
                forAll: true,
                subjectId: item.subjectIds[0],
                subjects: {
                    connect: item.subjectIds.map(id => ({ id }))
                }
            }
        });
    }

    console.log('--- TEST IMPORT COMPLETED SUCCESSFULLY! ---');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
