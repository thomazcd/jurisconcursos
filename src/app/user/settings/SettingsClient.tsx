'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Icons as SvgIcons } from '@/components/ui/Icons';

export default function UserSettingsPage() {
    const { data: session } = useSession();
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');

    async function resetAllReads() {
        if (!confirm('Deseja marcar TODOS os julgados como não lidos? Isso zerará o contador de leituras de todo o sistema.')) return;
        setSaving(true);
        setSuccess('');
        try {
            const res = await fetch('/api/user/read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'bulk_reset_reads', precedentId: 'ALL' }),
            });
            if (!res.ok) throw new Error();
            setSuccess('Todas as leituras foram resetadas com sucesso!');
        } catch (err) {
            alert('Erro ao resetar leituras');
        } finally {
            setSaving(false);
        }
    }

    async function resetAllStats() {
        if (!confirm('Deseja zerar TODAS as estatísticas de desempenho (V/F)? Esta ação não pode ser desfeita.')) return;
        setSaving(true);
        setSuccess('');
        try {
            const res = await fetch('/api/user/read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'bulk_reset_stats', precedentId: 'ALL' }),
            });
            if (!res.ok) throw new Error();
            setSuccess('Estatísticas resetadas com sucesso!');
        } catch (err) {
            alert('Erro ao resetar estatísticas');
        } finally {
            setSaving(false);
        }
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Configurações</h1>
                    <p className="page-subtitle">Gerencie sua conta e dados de estudo</p>
                </div>
            </div>

            {success && <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>{success}</div>}

            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '0.25rem' }}>Meu Perfil</h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-2)', marginBottom: '1.5rem' }}>
                    Informações da sua conta Juris
                </p>

                <div style={{ background: 'var(--surface2)', padding: '1.25rem', borderRadius: 16, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.2rem', fontWeight: 900 }}>
                        {session?.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div style={{ fontWeight: 800, color: 'var(--text)' }}>{session?.user?.name}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-3)' }}>{session?.user?.email}</div>
                    </div>
                </div>
            </div>

            <PasswordChangeSection setSaving={setSaving} setSuccess={setSuccess} saving={saving} />

            <div className="card" style={{ border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ef4444', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <SvgIcons.Fire size={20} fill="#ef4444" /> Zona de Perigo
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-3)', marginBottom: '1.5rem' }}>
                    Ações irreversíveis sobre seus dados de estudo. Tenha cuidado!
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface2)', padding: '1rem', borderRadius: 12, border: '1px solid var(--border)' }}>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Resetar Leituras</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Marca todos os julgados como "não lidos".</div>
                        </div>
                        <button
                            onClick={resetAllReads}
                            disabled={saving}
                            className="btn btn-secondary"
                            style={{ color: '#ef4444', borderColor: '#ef4444', minWidth: '120px' }}
                        >
                            Resetar
                        </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface2)', padding: '1rem', borderRadius: 12, border: '1px solid var(--border)' }}>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Zerar Desempenho</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Apaga seu histórico de acertos e erros (V/F).</div>
                        </div>
                        <button
                            onClick={resetAllStats}
                            disabled={saving}
                            className="btn btn-secondary"
                            style={{ color: '#ef4444', borderColor: '#ef4444', minWidth: '120px' }}
                        >
                            Zerar
                        </button>
                    </div>

                    <div style={{ height: '1px', background: 'var(--border)', margin: '0.5rem 0' }} />

                    <button
                        onClick={() => alert('Para excluir sua conta definitivamente, envie um e-mail para suporte@jurisconcursos.com.br')}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-4)', fontSize: '0.75rem', cursor: 'pointer', textAlign: 'left', textDecoration: 'underline' }}
                    >
                        Desejo excluir minha conta permanentemente
                    </button>
                </div>
            </div>
        </div>
    );
}

function PasswordChangeSection({ setSaving, setSuccess, saving }: { setSaving: (v: boolean) => void, setSuccess: (v: string) => void, saving: boolean }) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');

    async function handlePasswordChange(e: React.FormEvent) {
        e.preventDefault();
        if (!currentPassword || !newPassword) {
            setError('Todos os campos são obrigatórios');
            return;
        }
        if (newPassword.length < 6) {
            setError('A nova senha deve ter pelo menos 6 caracteres');
            return;
        }

        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch('/api/user/profile/password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Erro ao alterar senha');

            setSuccess('Senha alterada com sucesso!');
            setCurrentPassword('');
            setNewPassword('');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '0.25rem' }}>Segurança</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-2)', marginBottom: '1.5rem' }}>
                Altere sua senha de acesso
            </p>

            <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {error && <div className="alert alert-error" style={{ fontSize: '0.8rem', padding: '0.5rem' }}>{error}</div>}

                <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-3)' }}>Senha Atual</label>
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        style={{ height: '42px' }}
                    />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-3)' }}>Nova Senha</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        style={{ height: '42px' }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    className="btn btn-primary"
                    style={{ marginTop: '0.5rem', alignSelf: 'flex-start', minWidth: '150px' }}
                >
                    {saving ? 'Processando...' : 'Alterar Senha'}
                </button>
            </form>
        </div>
    );
}
