'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Icons as SvgIcons } from '@/components/ui/Icons';

export default function UserSettingsPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [allSubjects, setAllSubjects] = useState<any[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [savedSelectedIds, setSavedSelectedIds] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');

    useEffect(() => {
        // Fetch All Subjects
        fetch('/api/user/subjects/all').then(r => r.json()).then(d => setAllSubjects(d.subjects || []));

        // Fetch Profile
        fetch('/api/user/profile').then(r => r.json()).then(d => {
            if (d.profile?.selectedSubjects) {
                const ids = d.profile.selectedSubjects.map((s: any) => s.id);
                setSelectedIds(ids);
                setSavedSelectedIds(ids);
            }
        });
    }, []);

    function handleToggleSubject(subjectId: string) {
        let newIds = [...selectedIds];
        if (newIds.includes(subjectId)) {
            newIds = newIds.filter(id => id !== subjectId);
        } else {
            newIds.push(subjectId);
        }
        setSelectedIds(newIds);
    }

    function handleSelectAll(all: boolean) {
        setSelectedIds(all ? allSubjects.map(s => s.id) : []);
    }

    async function handleSaveSubjects() {
        setSaving(true);
        setSuccess('');
        try {
            await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ selectedSubjectIds: selectedIds, activeTrack: 'TODAS' }), // Forçamos 'TODAS' para não usar restrição de carreira
            });
            setSavedSelectedIds(selectedIds);
            setSuccess('Matérias salvas com sucesso!');
            router.refresh();
        } catch (err) {
            console.error(err);
            alert('Erro ao salvar matérias.');
        } finally {
            setSaving(false);
        }
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

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Configurações</h1>
                    <p className="page-subtitle">Personalize seu ambiente de estudo</p>
                </div>
            </div>

            {success && <div className="alert alert-success">{success}</div>}

            <div className="card" style={{ maxWidth: '700px' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Perfil</h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-2)', marginBottom: '1.25rem' }}>
                    {session?.user?.name} &mdash; {session?.user?.email}
                </p>

                <div className="divider" />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1.25rem 0 0.5rem' }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Matérias do Dashboard</h2>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleSelectAll(true)} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>Marcar Todas</button>
                        <button onClick={() => handleSelectAll(false)} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>Limpar</button>
                    </div>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginBottom: '1.5rem' }}>
                    Selecione as matérias que você deseja estudar. Se nenhuma estiver marcada, você verá todas as matérias disponíveis.
                </p>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '0.75rem',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    padding: '4px',
                    marginBottom: '1.5rem',
                }}>
                    {allSubjects.map((s) => (
                        <div
                            key={s.id}
                            onClick={() => handleToggleSubject(s.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '10px 14px',
                                borderRadius: '12px',
                                background: selectedIds.includes(s.id) ? 'var(--accent)' : 'var(--surface2)',
                                color: selectedIds.includes(s.id) ? '#fff' : 'var(--text)',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                border: '1px solid',
                                borderColor: selectedIds.includes(s.id) ? 'var(--accent)' : 'var(--border)',
                                fontSize: '0.85rem',
                                fontWeight: 600
                            }}
                        >
                            <div style={{
                                width: 18,
                                height: 18,
                                borderRadius: 4,
                                border: '2px solid',
                                borderColor: selectedIds.includes(s.id) ? '#fff' : 'var(--text-3)',
                                background: selectedIds.includes(s.id) ? '#fff' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--accent)'
                            }}>
                                {selectedIds.includes(s.id) && <SvgIcons.Check size={14} />}
                            </div>
                            {s.name}
                        </div>
                    ))}
                </div>

                {JSON.stringify(selectedIds.sort()) !== JSON.stringify(savedSelectedIds.sort()) && (
                    <button
                        className="btn btn-primary"
                        onClick={handleSaveSubjects}
                        disabled={saving}
                        style={{ width: '100%' }}
                    >
                        {saving ? 'Salvando...' : 'Salvar Matérias'}
                    </button>
                )}

                <div className="divider" style={{ margin: '1.5rem 0' }} />

                <h2 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ef4444', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <SvgIcons.Fire size={20} fill="#ef4444" /> Zona de Perigo
                </h2>
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
                            textAlign: 'center',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'none'; }}
                    >
                        <SvgIcons.RefreshCw size={16} /> Resetar Marcas de "Lido" (Informativos)
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
                            textAlign: 'center',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'none'; }}
                    >
                        <SvgIcons.Chart size={16} /> Zerar Estatísticas (V/F)
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
