'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

const TRACKS = [
    { value: 'JUIZ_ESTADUAL', icon: '⚖️', label: 'Juiz Estadual', desc: 'Magistratura Estadual' },
    { value: 'JUIZ_FEDERAL', icon: '🏛️', label: 'Juiz Federal', desc: 'Magistratura Federal' },
    { value: 'PROCURADOR', icon: '📋', label: 'Procurador do Estado', desc: 'Procuradoria do Estado' },
];

export default function UserSettingsPage() {
    const { data: session } = useSession();
    const [track, setTrack] = useState('JUIZ_ESTADUAL');
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetch('/api/user/profile').then((r) => r.json()).then((d) => {
            if (d.profile?.activeTrack) setTrack(d.profile.activeTrack);
        });
    }, []);

    async function handleSwitch(newTrack: string) {
        if (newTrack === track) return;
        setSaving(true);
        setSuccess('');
        await fetch('/api/user/profile', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ activeTrack: newTrack }),
        });
        setTrack(newTrack);
        setSaving(false);
        const label = TRACKS.find((t) => t.value === newTrack)?.label ?? newTrack;
        setSuccess(`Perfil alterado para ${label} com sucesso!`);
    }

    async function resetAllReads() {
        if (!confirm('Deseja marcar TODOS os julgados como não lidos? Isso zerará o contador de leituras de todo o sistema.')) return;
        setSaving(true);
        try {
            await fetch('/api/user/read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'bulk_reset_reads', precedentId: 'ALL' }),
            });
            setSuccess('Todas as leituras foram resetadas com sucesso!');
        } catch (err) {
            console.error(err);
            alert('Erro ao resetar leituras');
        } finally {
            setSaving(false);
        }
    }

    async function resetAllStats() {
        if (!confirm('Deseja zerar TODAS as estatísticas de desempenho (V/F)? Esta ação não pode ser desfeita.')) return;
        setSaving(true);
        try {
            await fetch('/api/user/read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'bulk_reset_stats', precedentId: 'ALL' }),
            });
            alert('Estatísticas resetadas com sucesso!');
        } catch (err) {
            console.error(err);
            alert('Erro ao resetar estatísticas');
        } finally {
            setSaving(false);
        }
    }

    const activeTrack = TRACKS.find((t) => t.value === track);

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Configurações</h1>
                    <p className="page-subtitle">Gerencie seu perfil de estudo</p>
                </div>
            </div>

            {success && <div className="alert alert-success">{success}</div>}

            <div className="card" style={{ maxWidth: '520px' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Conta</h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-2)', marginBottom: '1.25rem' }}>
                    {session?.user?.name} &mdash; {session?.user?.email}
                </p>

                <div className="divider" />

                <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '1.25rem 0 0.35rem' }}>Trilha de concurso ativa</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginBottom: '1rem' }}>
                    A trilha determina quais matérias e precedentes você verá no dashboard.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: 0 }}>
                    {TRACKS.map((t) => (
                        <button
                            key={t.value}
                            onClick={() => handleSwitch(t.value)}
                            disabled={saving}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                padding: '0.75rem 1rem', borderRadius: '10px', cursor: 'pointer',
                                border: '2px solid', textAlign: 'left',
                                borderColor: track === t.value ? 'var(--accent)' : 'var(--border)',
                                background: track === t.value ? 'var(--accent)' : 'var(--surface2)',
                                color: track === t.value ? '#fff' : 'var(--text)',
                                transition: 'all 0.15s',
                            }}
                        >
                            <span style={{ fontSize: '1.3rem' }}>{t.icon}</span>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{t.label}</div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{t.desc}</div>
                            </div>
                            {track === t.value && <span style={{ marginLeft: 'auto', fontSize: '0.8rem' }}>✓ Ativo</span>}
                        </button>
                    ))}
                </div>

                {activeTrack && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginTop: '0.75rem' }}>
                        {activeTrack.icon} Trilha <strong>{activeTrack.label}</strong> ativa. Você verá matérias e precedentes específicos desta carreira.
                    </p>
                )}

                <div className="divider" style={{ margin: '1.5rem 0' }} />

                <h2 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ef4444', marginBottom: '0.5rem' }}>🔥 Zona de Perigo</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-3)', marginBottom: '1.5rem' }}>
                    Ações irreversíveis sobre seus dados de estudo. Tenha cuidado!
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button
                        onClick={resetAllReads}
                        disabled={saving}
                        style={{
                            padding: '0.75rem 1rem',
                            borderRadius: '12px',
                            border: '1.5px solid #ef4444',
                            background: 'transparent',
                            color: '#ef4444',
                            fontSize: '0.85rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            textAlign: 'center'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'none'; }}
                    >
                        ♻️ Resetar Marcas de "Lido" (Informativos)
                    </button>

                    <button
                        onClick={resetAllStats}
                        disabled={saving}
                        style={{
                            padding: '0.75rem 1rem',
                            borderRadius: '12px',
                            border: '1.5px solid #ef4444',
                            background: 'transparent',
                            color: '#ef4444',
                            fontSize: '0.85rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            textAlign: 'center'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'none'; }}
                    >
                        📊 Zerar Estatísticas (V/F)
                    </button>

                    <button
                        onClick={() => alert('Para excluir sua conta, entre em contato com o suporte.')}
                        disabled={saving}
                        style={{
                            padding: '0.75rem 1rem',
                            borderRadius: '12px',
                            border: '1.5px solid var(--border)',
                            background: 'var(--surface2)',
                            color: 'var(--text-3)',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            textAlign: 'center',
                            marginTop: '0.5rem'
                        }}
                    >
                        Excluir Minha Conta
                    </button>
                </div>
            </div>
        </div>
    );
}
