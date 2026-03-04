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
        const role = session.user.role;
        if (role === 'ADMIN' || role === 'GESTOR') redirect('/admin');
        redirect('/user/dashboard');
    }

    return (
        <div className="landing-container" style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', overflowX: 'hidden' }}>
            {/* Navigation */}
            <nav className="nav-glass">
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Logo size="small" />
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <Link href="/login" className="btn btn-ghost btn-sm" style={{ fontWeight: 700 }}>Entrar</Link>
                        <Link href="/register" className="btn btn-primary btn-sm" style={{ fontWeight: 800, borderRadius: '10px' }}>Começar Agora</Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="hero-section" style={{ paddingBottom: '2.5rem' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <div className="badge-version">
                        v{APP_VERSION}
                    </div>
                    <h1 className="hero-gradient-text" style={{ fontSize: 'clamp(2.5rem, 8vw, 4.2rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '1.5rem' }}>
                        Memorização Ágil <br /> <span className="hero-accent-text">para Carreiras de Elite.</span>
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-3)', maxWidth: '650px', margin: '0 auto 2rem', lineHeight: 1.4, fontWeight: 500 }}>
                        Flashcards inteligentes baseados em informativos do STF e STJ. <br />
                        Pare de apenas ler, comece a reter o que realmente importa.
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link href="/register" className="btn btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '1.1rem', borderRadius: '14px', fontWeight: 800, border: 'none' }}>
                            Começar agora <SvgIcons.ArrowRight size={20} />
                        </Link>
                    </div>
                </div>
            </header>

            {/* Features Section - Even More Compact */}
            <section style={{ padding: '0 2rem 3rem', maxWidth: '1100px', margin: '0 auto' }}>
                <div className="feature-grid">
                    <FeatureCard
                        icon={<SvgIcons.Target size={24} />}
                        title="Informativos Otimizados"
                        description="O foco total: STF e STJ filtrados e estruturados para máxima retenção."
                        isPrimary
                    />
                    <FeatureCard
                        icon={<SvgIcons.Brain size={24} />}
                        title="Flashcards com IA"
                        description="Questões V/F geradas automaticamente a partir das teses."
                    />
                    <FeatureCard
                        icon={<SvgIcons.Chart size={24} />}
                        title="Analytics"
                        description="Acompanhe sua evolução e desempenho por matéria."
                    />
                    <FeatureCard
                        icon={<SvgIcons.Fire size={24} />}
                        title="Foco Total"
                        description="Interface limpa projetada para evitar distrações."
                    />
                </div>
            </section>

            {/* Footer - Symmetrically Compact */}
            <footer style={{ padding: '3rem 2rem', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <Logo size="small" />
                    <p style={{ marginTop: '1rem', color: 'var(--text-3)', fontSize: '0.8rem' }}>
                        © 2026 Juris Concursos. Domine a jurisprudência com eficiência.
                    </p>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description, isPrimary }: { icon: any, title: string, description: string, isPrimary?: boolean }) {
    return (
        <div className="feature-card" style={{
            background: isPrimary ? 'linear-gradient(135deg, var(--surface) 0%, rgba(20, 184, 166, 0.05) 100%)' : 'var(--surface)',
            padding: '1.25rem',
            borderRadius: '18px',
            border: isPrimary ? '2px solid var(--accent)' : '1px solid var(--border)',
            transition: 'all 0.3s ease',
            boxShadow: 'var(--shadow-sm)',
            textAlign: 'left',
            position: 'relative'
        }}>
            {isPrimary && (
                <div style={{ position: 'absolute', top: '-10px', right: '15px', background: 'var(--accent)', color: 'white', fontSize: '0.65rem', fontWeight: 900, padding: '2px 8px', borderRadius: '10px', textTransform: 'uppercase' }}>
                    Principal
                </div>
            )}
            <div className="feature-icon-box" style={{ marginBottom: '0.75rem', width: '40px', height: '40px' }}>
                {icon}
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.4rem' }}>{title}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-2)', lineHeight: 1.4 }}>{description}</p>
        </div>
    );
}
