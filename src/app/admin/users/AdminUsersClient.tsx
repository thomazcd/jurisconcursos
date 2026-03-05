'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/ui/Sidebar';
import { useSession } from 'next-auth/react';

type UserData = {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: Date;
    lastLoginAt?: Date | null;
};

export default function AdminUsersClient({ initialUsers, initialRegistrationOpen }: { initialUsers: UserData[], initialRegistrationOpen: boolean }) {
    const { data: session } = useSession();
    const [users, setUsers] = useState<UserData[]>(initialUsers);
    const [registrationOpen, setRegistrationOpen] = useState(initialRegistrationOpen);
    const [savingSetting, setSavingSetting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    if (!session?.user) return null;

    async function handleDelete(id: string, name: string) {
        if (!confirm(`Deseja realmente EXCLUIR o usuário ${name} e todo o seu histórico? Esta ação é irreversível.`)) return;

        setDeletingId(id);
        try {
            const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Erro ao excluir usuário');

            setUsers(prev => prev.filter(u => u.id !== id));
            alert('Usuário excluído com sucesso.');
        } catch (err: any) {
            alert(err.message);
        } finally {
            setDeletingId(null);
        }
    }

    async function toggleRegistration() {
        if (!confirm(`Deseja ${registrationOpen ? 'FECHAR' : 'ABRIR'} novos cadastros na plataforma?`)) return;

        setSavingSetting(true);
        const newValue = !registrationOpen;
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'registration_open', value: newValue ? 'true' : 'false' })
            });
            if (!res.ok) throw new Error('Falha ao atualizar config');
            setRegistrationOpen(newValue);
            alert(`Novos cadastros agora estão ${newValue ? 'LIVRES' : 'BLOQUEADOS'}.`);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSavingSetting(false);
        }
    }

    return (
        <div className="layout">
            <Sidebar role={session.user.role} name={session.user.name ?? ''} email={session.user.email ?? ''} />
            <main className="main-content">
                <div className="page-header" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h1 className="page-title">Usuários Cadastrados</h1>
                        <p className="page-subtitle">Acompanhe quem está estudando na plataforma</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--surface2)', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>Novos Cadastros</span>
                            <span style={{ fontSize: '0.7rem', color: registrationOpen ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                                {registrationOpen ? 'PERMITIDOS' : 'BLOQUEADOS'}
                            </span>
                        </div>
                        <button
                            onClick={toggleRegistration}
                            disabled={savingSetting}
                            className={`btn ${registrationOpen ? 'btn-danger' : 'btn-primary'}`}
                            style={{ fontSize: '0.75rem', fontWeight: 800, padding: '6px 16px', borderRadius: '20px' }}
                        >
                            {savingSetting ? 'Salvando...' : registrationOpen ? 'Travar Entradas' : 'Habilitar Entradas'}
                        </button>
                    </div>
                </div>

                <div className="stats-row" style={{ marginBottom: '2rem' }}>
                    <div className="stat-card">
                        <div className="stat-number stat-emerald">{users.length}</div>
                        <div className="stat-label">Total de Usuários</div>
                    </div>
                </div>

                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Email</th>
                                    <th>Perfil</th>
                                    <th>Data Cadastro</th>
                                    <th>Último Login</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-3)' }}>Nenhum usuário.</td>
                                    </tr>
                                )}
                                {users.map(u => (
                                    <tr key={u.id}>
                                        <td style={{ fontWeight: 600 }}>{u.name}</td>
                                        <td style={{ fontSize: '0.8rem', color: 'var(--text-2)' }}>{u.email}</td>
                                        <td>
                                            <span className="badge" style={{
                                                background: u.role === 'USER' ? 'rgba(20,184,166,0.1)' : 'rgba(239,68,68,0.1)',
                                                color: u.role === 'USER' ? 'var(--accent)' : '#ef4444'
                                            }}>
                                                {u.role === 'USER' ? 'ALUNO' : 'ADMINISTRADOR'}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: '0.8rem' }}>{new Date(u.createdAt).toLocaleString('pt-BR', { timeZone: 'America/Rio_Branco' })}</td>
                                        <td style={{ fontSize: '0.8rem', color: u.lastLoginAt ? 'var(--text)' : 'var(--text-3)' }}>
                                            {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('pt-BR', { timeZone: 'America/Rio_Branco' }) : 'Nunca acessou'}
                                        </td>
                                        <td>
                                            {u.email === 'tt@tt.com' || u.email === 'thomazcd@gmail.com' ? (
                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>Protegido</span>
                                            ) : (
                                                <button
                                                    onClick={() => handleDelete(u.id, u.name)}
                                                    disabled={deletingId === u.id}
                                                    className="btn btn-danger btn-sm"
                                                    style={{ fontSize: '0.7rem', padding: '4px 10px', borderRadius: '6px' }}
                                                    title="Excluir Usuário"
                                                >
                                                    {deletingId === u.id ? 'Excluindo...' : 'Excluir'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
