'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export default function UserSettingsPage() {
    const { data: session } = useSession();
    const [track, setTrack] = useState('JUIZ');
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
        setSuccess(`Perfil alterado para ${newTrack === 'JUIZ' ? 'Magistrado (Juiz)' : 'Procurador do Estado'} com sucesso!`);
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Configurações</h1>
                    <p className="page-subtitle">Gerencie seu perfil de estudo</p>
                </div>
            </div>

            {success && <div className="alert alert-success">{success}</div>}

            <div className="card" style={{ maxWidth: '480px' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Conta</h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-2)', marginBottom: '1.25rem' }}>
                    {session?.user?.name} &mdash; {session?.user?.email}
                </p>

                <div className="divider" />

                <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '1.25rem 0 0.35rem' }}>Perfil de concurso ativo</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginBottom: '1rem' }}>
                    O perfil determina quais matérias e precedentes você verá no dashboard.
                </p>

                <div className="profile-selector" style={{ margin: 0 }}>
                    <button
                        className={`profile-option ${track === 'JUIZ' ? 'active-juiz' : ''}`}
                        onClick={() => handleSwitch('JUIZ')}
                        disabled={saving}
                    >
                        <div className="icon">⚖️</div>
                        <strong>Magistrado (Juiz)</strong>
                        <span>Carreira da Magistratura</span>
                    </button>
                    <button
                        className={`profile-option ${track === 'PROCURADOR' ? 'active-procurador' : ''}`}
                        onClick={() => handleSwitch('PROCURADOR')}
                        disabled={saving}
                    >
                        <div className="icon">📋</div>
                        <strong>Procurador do Estado</strong>
                        <span>Carreira da Procuradoria</span>
                    </button>
                </div>

                <p style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginTop: '0.75rem' }}>
                    {track === 'JUIZ'
                        ? '⚖️ Você verá matérias comuns + específicas de Magistratura, e precedentes GERAL / JUIZ / AMBOS.'
                        : '📋 Você verá matérias comuns + específicas de Procuradoria, e precedentes GERAL / PROCURADOR / AMBOS.'}
                </p>
            </div>
        </div>
    );
}
