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
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <Link href="/login" className="btn btn-ghost btn-sm" style={{ fontWeight: 700 }}>Entrar</Link>
                        <Link href="/register" className="btn btn-primary btn-sm" style={{ fontWeight: 800, borderRadius: '10px' }}>Começar Agora</Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="hero-section">
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <div className="badge-version">
                        Versão {APP_VERSION} • Inteligência Artificial Jurídica
                    </div>
                    <h1 className="hero-gradient-text" style={{ fontSize: 'clamp(2rem, 7vw, 3.8rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '1rem' }}>
                        Memorização Ágil para <br /> <span className="hero-accent-text">Carreiras de Elite.</span>
                    </h1>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-3)', maxWidth: '600px', margin: '0 auto 2rem', lineHeight: 1.5 }}>
                        Flashcards inteligentes baseados em informativos do STF e STJ. Pare de apenas ler, comece a reter.
                    </p>

                    {/* Live Preview / Mockup with Scanner Animation */}
                    <div className="preview-container" style={{ marginBottom: '3rem' }}>
                        <img
                            src="/dashboard-preview.png"
                            alt="Dashboard Preview"
                            className="preview-image"
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link href="/register" className="btn btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '1.1rem', borderRadius: '14px', fontWeight: 800 }}>
                            Criar Conta Grátis <SvgIcons.ArrowRight size={20} />
                        </Link>
                    </div>
                </div>
            </header>

            {/* Features Section - More Compact */}
            <section style={{ padding: '4rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
                <div className="feature-grid">
                    <FeatureCard
                        icon={<SvgIcons.Brain size={24} />}
                        title="Questões IA"
                        description="Nossa IA gera assertivas (V/F) desafiadoras a partir de teses reais."
                    />
                    <FeatureCard
                        icon={<SvgIcons.Target size={24} />}
                        title="Trilhas Reais"
                        description="Filtragem focada em Magistratura, Procuradoria e Federal."
                    />
                    <FeatureCard
                        icon={<SvgIcons.Chart size={24} />}
                        title="Analytics"
                        description="Acompanhe seu desempenho por matéria e evolução diária."
                    />
                    <FeatureCard
                        icon={<SvgIcons.Fire size={24} />}
                        title="Foco Total"
                        description="Interface limpa e modo foco para evitar distrações."
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

function FeatureCard({ icon, title, description }: { icon: any, title: string, description: string }) {
    return (
        <div className="feature-card" style={{
            background: 'var(--surface)', padding: '1.5rem', borderRadius: '18px',
            border: '1px solid var(--border)', transition: 'all 0.3s ease',
            boxShadow: 'var(--shadow-sm)', textAlign: 'left'
        }}>
            <div className="feature-icon-box">
                {icon}
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>{title}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', lineHeight: 1.5 }}>{description}</p>
        </div>
    );
}
