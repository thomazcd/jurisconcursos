import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Autenticação – Juris Concursos' };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
