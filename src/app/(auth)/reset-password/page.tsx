'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';

export default function ResetPasswordPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!token) {
            setError('Token de recuperação não encontrado. Solicite um novo link.');
        }
    }, [token]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        if (newPassword.length < 6) {
            setError('A nova senha deve ter pelo menos 6 caracteres.');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword }),
            });
            const data = await res.json();
            if (res.ok) {
                setMessage('Senha redefinida com sucesso! Redirecionando para login...');
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
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
                
                <h2 style={{ fontSize: '1.2rem', fontWeight: 900, textAlign: 'center', marginBottom: '0.5rem' }}>Escolha a Nova Senha</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-3)', textAlign: 'center', marginBottom: '1.5rem' }}>
                    Defina agora a sua nova senha de acesso.
                </p>

                {message && <div className="alert alert-success">{message}</div>}
                {error && <div className="alert alert-error">{error}</div>}

                {(token && !message) && (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="newPassword">Nova Senha</label>
                            <input
                                id="newPassword" type="password" placeholder="••••••"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirmar Nova Senha</label>
                            <input
                                id="confirmPassword" type="password" placeholder="••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', marginTop: '0.5rem' }}
                            disabled={loading}
                        >
                            {loading ? 'Processando...' : 'Redefinir Senha'}
                        </button>
                    </form>
                )}

                <div className="auth-footer">
                    <a href="/login">Voltar para Login</a>
                </div>
            </div>
        </div>
    );
}
