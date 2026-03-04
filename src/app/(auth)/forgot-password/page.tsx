'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (res.ok) {
                setMessage(data.message);
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Erro ao processar solicitação.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">
                    <Logo size="large" vertical={true} />
                </div>

                <h2 style={{ fontSize: '1.2rem', fontWeight: 900, textAlign: 'center', marginBottom: '0.5rem' }}>Recuperar Senha</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-3)', textAlign: 'center', marginBottom: '1.5rem' }}>
                    Informe o seu e-mail e enviaremos um link para você definir uma nova senha.
                </p>

                {message && <div className="alert alert-success">{message}</div>}
                {error && <div className="alert alert-error">{error}</div>}

                {!message && (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email">E-mail cadastrado</label>
                            <input
                                id="email" type="email" placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required autoComplete="email"
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', marginTop: '0.5rem' }}
                            disabled={loading}
                        >
                            {loading ? 'Enviando...' : 'Enviar Link'}
                        </button>
                    </form>
                )}

                <div className="auth-footer">
                    <Link href="/login">Voltar para Login</Link>
                </div>
            </div>
        </div>
    );
}
