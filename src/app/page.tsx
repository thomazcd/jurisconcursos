import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { Icons as SvgIcons } from '@/components/ui/Icons';
import { APP_VERSION } from '@/lib/version';
import './landing.css';

export default async function HomePage() {
    const session = await getServerSession(authOptions);

    // Redirect if already logged in
    if (session) {
        const role = (session.user as any)?.role;
        if (role === 'ADMIN' || role === 'GESTOR') redirect('/admin');
        redirect('/user/dashboard');
    }

    return (
        <div className="landing-container" style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', overflowX: 'hidden' }}>
            {/* Navigation */}
            <nav className="nav-glass">
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Logo size="small" />
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <Link href="/login" className="btn btn-ghost btn-sm" style={{ fontWeight: 700 }}>Entrar</Link>
                        <Link href="/register" className="btn btn-primary btn-sm" style={{ fontWeight: 800, borderRadius: '10px', padding: '0.5rem 1.25rem' }}>Criar Conta</Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="hero-section">
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <div className="badge-version">
                        <span className="badge-dot"></span>
                        Versão {APP_VERSION} disponível agora
                    </div>
                    <h1 className="hero-gradient-text" style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '1.5rem' }}>
                        Transforme Jurisprudência em <br /> <span className="hero-accent-text">Memorização Ágil.</span>
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-3)', maxWidth: '650px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
                        A primeira plataforma baseada em Flashcards Ativos com Inteligência Artificial para as carreiras de elite do Direito.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link href="/register" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', borderRadius: '14px', fontWeight: 800 }}>
                            Começar Agora Gratuitamente <SvgIcons.ArrowRight size={20} />
                        </Link>
                    </div>
                </div>
            </header>

            {/* Features Section */}
            <section style={{ padding: '6rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem' }}>Preparação de Alto Nível</h2>
                    <p style={{ color: 'var(--text-3)' }}>Tudo que você precisa para dominar os informativos do STF e STJ.</p>
                </div>

                <div className="feature-grid">
                    <FeatureCard
                        icon={<SvgIcons.Brain size={32} />}
                        title="IA Generativa Jurídica"
                        description="Nossa IA cria assertivas desafiadoras (V/F) parafraseando teses e alterando requisitos para testar sua atenção real."
                    />
                    <FeatureCard
                        icon={<SvgIcons.Rocket size={32} />}
                        title="Foco em Informativos"
                        description="Repositório completo e organizado de informativos do STF e STJ com summaries executivos editados."
                    />
                    <FeatureCard
                        icon={<SvgIcons.Chart size={32} />}
                        title="Rastreio de Desempenho"
                        description="Saiba exatamente onde você está falhando com métricas de acerto por matéria e repetições necessárias."
                    />
                    <FeatureCard
                        icon={<SvgIcons.Gavel size={32} />}
                        title="Trilhas Específicas"
                        description="Conteúdo filtrado para Magistratura Estadual, Federal ou Procuradoria, focando no que cai na sua prova."
                    />
                </div>
            </section>

            {/* Dashboard Preview / CTA Section */}
            <section style={{ padding: '6rem 2rem', background: 'var(--surface2)', textAlign: 'center' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '1.5rem' }}>Diga adeus à leitura passiva de PDF.</h2>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-2)', marginBottom: '3rem' }}>
                        Estude de forma ativa. Marque como lido, favorite e treine com flashcards personalizados em uma interface pensada para o seu foco.
                    </p>

                    <div className="preview-container">
                        <div style={{ textAlign: 'center', opacity: 0.6 }}>
                            <Logo size="large" showText={false} />
                            <p style={{ marginTop: '1rem', fontWeight: 700, fontSize: '0.9rem' }}>Dashboard do Aluno</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section style={{ padding: '8rem 2rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '2rem' }}>Pronto para elevar seu nível?</h2>
                <Link href="/register" className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.2rem', borderRadius: '16px', fontWeight: 800 }}>
                    Criar Minha Conta Agora
                </Link>
            </section>

            {/* Footer */}
            <footer style={{ padding: '4rem 2rem', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <Logo size="small" />
                    <p style={{ marginTop: '1.5rem', color: 'var(--text-3)', fontSize: '0.85rem' }}>
                        © 2026 Juris Concursos. Domine a jurisprudência com eficiência.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-3)' }}>
                        <Link href="/login">Entrar</Link>
                        <Link href="/register">Cadastre-se</Link>
                        <a href="#">Termos</a>
                        <a href="#">Privacidade</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: any, title: string, description: string }) {
    return (
        <div className="feature-card" style={{
            background: 'var(--surface)', padding: '2.5rem', borderRadius: '24px',
            border: '1px solid var(--border)', transition: 'all 0.3s ease',
            boxShadow: 'var(--shadow-sm)'
        }}>
            <div className="feature-icon-box">
                {icon}
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem' }}>{title}</h3>
            <p style={{ fontSize: '0.925rem', color: 'var(--text-2)', lineHeight: 1.6 }}>{description}</p>
        </div>
    );
}
