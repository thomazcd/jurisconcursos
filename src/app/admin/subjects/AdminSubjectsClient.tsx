'use client';
import { useEffect, useState } from 'react';

type Subject = {
    id: string;
    name: string;
    trackScope: string;
    forProcurador: boolean;
    forJuizFederal: boolean;
    forJuizEstadual: boolean;
    createdAt: string;
};

function scopeLabel(s: Subject): string {
    const tracks: string[] = [];
    if (s.forJuizEstadual) tracks.push('J.Est');
    if (s.forJuizFederal) tracks.push('J.Fed');
    if (s.forProcurador) tracks.push('PGE');
    if (tracks.length === 3) return 'Comum (todos)';
    return tracks.join(' + ') || s.trackScope;
}

function scopeBadgeClass(s: Subject): string {
    const all3 = s.forJuizEstadual && s.forJuizFederal && s.forProcurador;
    if (all3) return 'badge-geral';
    if (s.forProcurador && !s.forJuizFederal && !s.forJuizEstadual) return 'badge-proc';
    if (s.forJuizFederal && !s.forJuizEstadual && !s.forProcurador) return 'badge-stf';
    if (s.forJuizEstadual && !s.forJuizFederal && !s.forProcurador) return 'badge-stj';
    return 'badge-geral';
}

export default function AdminSubjectsClient() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Subject | null>(null);
    const [form, setForm] = useState({
        name: '',
        trackScope: 'COMMON',
        forProcurador: false,
        forJuizFederal: false,
        forJuizEstadual: false,
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    async function fetchSubjects() {
        setLoading(true);
        const res = await fetch('/api/admin/subjects');
        const data = await res.json();
        setSubjects(data.subjects ?? []);
        setLoading(false);
    }

    useEffect(() => { fetchSubjects(); }, []);

    function openCreate() {
        setEditing(null);
        setForm({ name: '', trackScope: 'COMMON', forProcurador: false, forJuizFederal: false, forJuizEstadual: false });
        setError('');
        setShowModal(true);
    }

    function openEdit(s: Subject) {
        setEditing(s);
        setForm({ name: s.name, trackScope: s.trackScope, forProcurador: s.forProcurador, forJuizFederal: s.forJuizFederal, forJuizEstadual: s.forJuizEstadual });
        setError('');
        setShowModal(true);
    }

    async function handleSave() {
        setSaving(true);
        setError('');
        const url = editing ? `/api/admin/subjects/${editing.id}` : '/api/admin/subjects';
        const method = editing ? 'PUT' : 'POST';
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        });
        const data = await res.json();
        setSaving(false);
        if (!res.ok) { setError(data.error ?? 'Erro ao salvar.'); return; }
        setShowModal(false);
        fetchSubjects();
    }

    async function handleDelete(id: string, name: string) {
        if (!confirm(`Deletar matéria "${name}"? Todos os precedentes vinculados serão bloqueados.`)) return;
        await fetch(`/api/admin/subjects/${id}`, { method: 'DELETE' });
        fetchSubjects();
    }

    function toggleTrack(field: 'forProcurador' | 'forJuizFederal' | 'forJuizEstadual') {
        setForm(f => ({ ...f, [field]: !f[field] }));
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Matérias</h1>
                    <p className="page-subtitle">Gerencie as matérias disponíveis no sistema</p>
                </div>
                <button className="btn btn-primary" onClick={openCreate}>+ Nova matéria</button>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Visível para</th>
                                <th>Cadastro</th>
                                <th style={{ textAlign: 'right' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && (
                                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-3)' }}>Carregando…</td></tr>
                            )}
                            {!loading && subjects.map((s) => (
                                <tr key={s.id}>
                                    <td>{s.name}</td>
                                    <td>
                                        <span className={`badge ${scopeBadgeClass(s)}`}>
                                            {scopeLabel(s)}
                                        </span>
                                    </td>
                                    <td>{new Date(s.createdAt).toLocaleDateString('pt-BR')}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
                                            <button className="btn btn-secondary btn-sm" onClick={() => openEdit(s)}>Editar</button>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id, s.name)}>Excluir</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!loading && subjects.length === 0 && (
                                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-3)' }}>Nenhuma matéria cadastrada.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{editing ? 'Editar matéria' : 'Nova matéria'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>

                        {error && <div className="alert alert-error">{error}</div>}

                        <div className="form-group">
                            <label>Nome da matéria</label>
                            <input type="text" value={form.name} onChange={(e: any) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Direito Constitucional" />
                        </div>

                        <div className="form-group">
                            <label>Visível para quais trilhas</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.25rem' }}>
                                {([
                                    { field: 'forJuizEstadual', label: '⚖️ Juiz Estadual' },
                                    { field: 'forJuizFederal', label: '🏛️ Juiz Federal' },
                                    { field: 'forProcurador', label: '📋 Procurador do Estado' },
                                ] as const).map(({ field, label }) => (
                                    <label key={field} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                                        <input type="checkbox" checked={form[field]} onChange={() => toggleTrack(field)} />
                                        {label}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                            <button className="btn btn-primary" onClick={handleSave} disabled={saving || !form.name.trim()}>
                                {saving ? 'Salvando…' : editing ? 'Atualizar' : 'Criar matéria'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
