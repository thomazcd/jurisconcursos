'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [form, setForm] = useState({ name: '', email: '', password: '' });

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
                {success && <div className="alert alert-success">{success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Nome completo</label>
                        <input
                            id="name"
                            type="text"
                            placeholder="Seu nome"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                            minLength={2}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="reg-email">E-mail</label>
                        <input
                            id="reg-email"
                            type="email"
                            placeholder="seu@email.com"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="reg-password">Senha <span style={{ color: 'var(--text-3)' }}>(mín. 6 chars)</span></label>
                        <input
                            id="reg-password"
                            type="password"
                            placeholder="••••••"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required
                            minLength={6}
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '0.5rem' }}
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
        </div>
    );
}
