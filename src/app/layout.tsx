import type { Metadata } from 'next';
import './globals.css';
import { SessionProvider } from '@/components/SessionProvider';

export const metadata: Metadata = {
    title: 'Juris Concursos – Jurisprudência para Concursos',
    description: 'Plataforma de estudo de jurisprudência do STF e STJ para Magistratura e Procuradoria',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="pt-BR">
            <head>
                <script dangerouslySetInnerHTML={{
                    __html: `
                        (function() {
                            try {
                                const theme = localStorage.getItem('juris-theme');
                                if (theme === 'dark') {
                                    document.documentElement.classList.add('dark-theme');
                                }
                            } catch (e) {}
                        })();
                    `
                }} />
            </head>
            <body>
                <SessionProvider>{children}</SessionProvider>
            </body>
        </html>
    );
}
