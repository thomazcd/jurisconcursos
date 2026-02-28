'use client';
import { useState } from 'react';
import Link from 'next/link';

const TRACKS = [
    { value: 'JUIZ_ESTADUAL', label: '⚖️ Juiz Estadual' },
    { value: 'JUIZ_FEDERAL', label: '🏛️ Juiz Federal' },
    { value: 'PROCURADOR', label: '📋 Procurador' },
];

export default function RegisterPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({ name: '', email: '', password: '', track: 'JUIZ_ESTADUAL' });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        });
        const data = await res.json();
        setLoading(false);
        if (res.ok) {
            window.location.href = '/login?registered=true';
        } else {
            setError(data.details || data.error || 'Erro ao criar conta');
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">
                    <h1>⚖️ Juris Concursos</h1>
                    <p>Crie sua conta e comece a estudar</p>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Nome completo</label>
                        <input
                            id="name" type="text" placeholder="Seu nome"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required minLength={2}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="reg-email">E-mail</label>
                        <input
                            id="reg-email" type="email" placeholder="seu@email.com"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="reg-password">Senha <span style={{ color: 'var(--text-3)' }}>(mín. 6 chars)</span></label>
                        <input
                            id="reg-password" type="password" placeholder="••••••"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required minLength={6}
                        />
                    </div>
                    <div className="form-group">
                        <label>Trilha de estudo</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.25rem' }}>
                            {TRACKS.map(t => (
                                <label key={t.value} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', padding: '0.4rem 0.6rem', borderRadius: 8, border: `1px solid ${form.track === t.value ? 'var(--accent)' : 'var(--border)'}`, background: form.track === t.value ? 'rgba(58,125,68,0.07)' : 'transparent' }}>
                                    <input
                                        type="radio"
                                        name="track"
                                        value={t.value}
                                        checked={form.track === t.value}
                                        onChange={() => setForm({ ...form, track: t.value })}
                                    />
                                    {t.label}
                                </label>
                            ))}
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '0.75rem' }}
                        disabled={loading}
                    >
                        {loading ? 'Criando conta…' : 'Criar conta'}
                    </button>
                </form>

                <div className="auth-footer">
                    Já tem conta?{' '}
                    <Link href="/login">Faça login</Link>
                </div>
            </div>
            <div style={{ marginTop: '0.75rem', fontSize: '0.7rem', color: 'var(--text-3)', textAlign: 'center', opacity: 0.6 }}>
                v1.00009
            </div>
        </div>
    );
}
