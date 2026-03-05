import { prisma } from '@/lib/prisma';
import RegisterClient from './RegisterClient';
import Link from 'next/link';
import { APP_VERSION } from '@/lib/version';

export default async function RegisterPage() {
    const setting = await prisma.systemSetting.findUnique({
        where: { key: 'registration_open' }
    });

    // By default, registration is open if the key doesn't exist
    const isRegistrationOpen = setting ? setting.value === 'true' : true;

    if (!isRegistrationOpen) {
        return (
            <div className="auth-page">
                <div className="auth-card" style={{ textAlign: 'center' }}>
                    <div className="auth-logo">
                        <h1>⚖️ Juris Concursos</h1>
                        <p>Plataforma de Estudos</p>
                    </div>

                    <div style={{ margin: '2rem 0', padding: '1.5rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        <h2 style={{ fontSize: '1.25rem', color: '#ef4444', marginBottom: '0.5rem', fontWeight: 800 }}>Cadastros Fechados</h2>
                        <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                            O cadastro de novos alunos está temporariamente inabilitado.
                            <br />
                            Aguarde a reabertura de novas vagas ou tente novamente mais tarde.
                        </p>
                    </div>

                    <div className="auth-footer">
                        Já tem conta?{' '}
                        <Link href="/login">Faça login aqui</Link>
                    </div>

                    <div style={{ marginTop: '0.75rem', fontSize: '0.7rem', color: 'var(--text-3)', textAlign: 'center', opacity: 0.6 }}>
                        v{APP_VERSION} · Desenvolvido por Thomaz C. Drumond
                    </div>
                </div>
            </div>
        );
    }

    return <RegisterClient />;
}
