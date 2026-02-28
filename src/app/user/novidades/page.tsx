import NovidadesClient from './NovidadesClient';

export const metadata = {
    title: 'Novidades | Juris Concursos',
    description: 'Confira as últimas atualizações do nosso banco de dados jurídico.',
};

export default function NovidadesPage() {
    return <NovidadesClient />;
}
