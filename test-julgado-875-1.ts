
import { PrismaClient, Court } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Inserting test julgado from Informativo 875...');

    // We use the first subject ID as the main subjectId to satisfy the constraint
    const mainSubjectId = 's-cproc'; // Direito Processual Civil

    const precedent = await prisma.precedent.create({
        data: {
            court: Court.STJ,
            title: 'Embargos à execução fiscal. Desistência ou renúncia para fins de adesão a programa de recuperação fiscal. Ajuste que inclui honorários advocatícios. Nova condenação em verba honorária na extinção dos embargos. Descabimento. Modulação de efeitos. Tema 1317.',
            summary: 'A extinção dos embargos à execução fiscal em face da desistência ou da renúncia do direito manifestada para fins de adesão a programa de recuperação fiscal em que já inserida a verba honorária pela cobrança da dívida pública não enseja nova condenação em honorários advocatícios.',
            fullTextOrLink: `A questão submetida a julgamento sob o rito dos recursos repetitivos, nos termos do art. 1.036 do Código de Processo Civil, para formação de precedente vinculante previsto no art. 927, III, do Código de Processo Civil, é a seguinte: "definir se, à luz do CPC, é cabível a condenação do contribuinte em honorários advocatícios sucumbenciais em embargos à execução fiscal extintos com fundamento na desistência ou na renúncia de direito manifestada para fins de adesão a programa de recuperação fiscal, em que já está inserida a cobrança de verba honorária no âmbito administrativo.". A jurisprudência que o Superior Tribunal de Justiça sedimentou na vigência do Código de Processo Civil de 1973 foi no sentido de haver autonomia, ainda que relativa, entre a execução fiscal e os embargos do devedor, o que, em regra, justificaria a incidência de honorários advocatícios em cada uma dessas demandas. No entanto, em se tratando de desistência de embargos destinados à adesão a parcelamento incentivado ou a programa de recuperação fiscal que já incluam verba honorária em seu custeio, a jurisprudência evoluiu para afastar a duplicidade de condenação.`,
            informatoryNumber: '875',
            informatoryYear: 2026,
            processClass: 'REsp',
            processNumber: '2.158.358/MG',
            rapporteur: 'Ministro Gurgel de Faria',
            organ: 'Primeira Seção',
            theme: 'Tema 1317',
            judgmentDate: new Date('2025-11-12'),
            publicationDate: new Date('2025-12-24'),
            forAll: true,
            subjectId: mainSubjectId, // Satisfy constraint
            subjects: {
                connect: [
                    { id: 's-cproc' }, // Direito Processual Civil
                    { id: 's-trib' }   // Direito Tributário
                ]
            }
        }
    });

    console.log('Inserted precedent ID:', precedent.id);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
