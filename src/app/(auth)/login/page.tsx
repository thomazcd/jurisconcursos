'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({ email: '', password: '' });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');
        const res = await signIn('credentials', { ...form, redirect: false });
        setLoading(false);
        if (res?.error) {
            setError('E-mail ou senha inválidos.');
        } else {
            router.push('/user/dashboard');
            router.refresh();
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">
                    <h1>⚖️ Juris Concursos</h1>
                    <p>Estudo de jurisprudência para magistratura e procuradoria</p>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">E-mail</label>
                        <input
                            id="email" type="email" placeholder="seu@email.com"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required autoComplete="email"
                        />
                    </div>
                    <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label htmlFor="password">Senha</label>
                            <a href="mailto:admin@jurisconcursos.com" style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
                                Esqueceu a senha?
                            </a>
                        </div>
                        <input
                            id="password" type="password" placeholder="••••••"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required autoComplete="current-password"
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '0.5rem' }}
                        disabled={loading}
                    >
                        {loading ? 'Entrando…' : 'Entrar'}
                    </button>
                </form>

                <div className="auth-footer">
                    Não tem conta?{' '}
                    <Link href="/register">Cadastre-se</Link>
                </div>

                <div style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.68rem', color: 'var(--text-3)', opacity: 0.55 }}>
                    v1.00035
                </div>
            </div>
        </div>
    );
}
