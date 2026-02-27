'use client';
import { useEffect, useState, useCallback } from 'react';

type Subject = { id: string; name: string; trackScope: string };
type Precedent = {
    id: string;
    court: string;
    title: string;
    summary: string;
    fullTextOrLink?: string | null;
    subjectId: string;
    applicability: string;
    tags: string[];
    createdAt: string;
    subject: { name: string };
};

const APPL_LABEL: Record<string, string> = {
    GERAL: 'Geral',
    JUIZ: 'Juiz',
    PROCURADOR: 'Procurador',
    AMBOS: 'Ambos',
};

const emptyForm = {
    court: 'STF',
    title: '',
    summary: '',
    fullTextOrLink: '',
    subjectId: '',
    applicability: 'GERAL',
    tagsStr: '',
};

export default function AdminPrecedentsClient() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [precedents, setPrecedents] = useState<Precedent[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const limit = 20;
    const [loading, setLoading] = useState(true);
    const [courtFilter, setCourtFilter] = useState('');
    const [subjectFilter, setSubjectFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Precedent | null>(null);
    const [form, setForm] = useState({ ...emptyForm });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('/api/admin/subjects').then((r) => r.json()).then((d) => setSubjects(d.subjects ?? []));
    }, []);

    const fetchPrecedents = useCallback(async (pg: number, court: string, subject: string) => {
        setLoading(true);
        const params = new URLSearchParams({ page: String(pg), limit: String(limit) });
        if (court) params.set('court', court);
        if (subject) params.set('subjectId', subject);
        const res = await fetch(`/api/admin/precedents?${params}`);
        const data = await res.json();
        setPrecedents(data.precedents ?? []);
        setTotal(data.total ?? 0);
        setLoading(false);
    }, []);

    useEffect(() => { fetchPrecedents(page, courtFilter, subjectFilter); }, [page, courtFilter, subjectFilter, fetchPrecedents]);

    function openCreate() {
        setEditing(null);
        setForm({ ...emptyForm, subjectId: subjects[0]?.id ?? '' });
        setError('');
        setShowModal(true);
    }

    function openEdit(p: Precedent) {
        setEditing(p);
        setForm({
            court: p.court,
            title: p.title,
            summary: p.summary,
            fullTextOrLink: p.fullTextOrLink ?? '',
            subjectId: p.subjectId,
            applicability: p.applicability,
            tagsStr: p.tags.join(', '),
        });
        setError('');
        setShowModal(true);
    }

    async function handleSave() {
        setSaving(true);
        setError('');
        const tags = form.tagsStr.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
        const payload = { ...form, tags, tagsStr: undefined };
        const url = editing ? `/api/admin/precedents/${editing.id}` : '/api/admin/precedents';
        const method = editing ? 'PUT' : 'POST';
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const data = await res.json();
        setSaving(false);
        if (!res.ok) { setError(data.error ?? 'Erro ao salvar.'); return; }
        setShowModal(false);
        fetchPrecedents(page, courtFilter, subjectFilter);
    }

    async function handleDelete(id: string, title: string) {
        if (!confirm(`Excluir precedente "${title.substring(0, 60)}…"?`)) return;
        await fetch(`/api/admin/precedents/${id}`, { method: 'DELETE' });
        fetchPrecedents(page, courtFilter, subjectFilter);
    }

    const totalPages = Math.ceil(total / limit);

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Precedentes</h1>
                    <p className="page-subtitle">Gerencie os precedentes do STF e STJ ({total} no total)</p>
                </div>
                <button className="btn btn-primary" onClick={openCreate}>+ Novo precedente</button>
            </div>

            <div className="filters-bar" style={{ marginBottom: '1rem' }}>
                <select value={courtFilter} onChange={(e) => { setCourtFilter(e.target.value); setPage(1); }}>
                    <option value="">Tribunal: Todos</option>
                    <option value="STF">STF</option>
                    <option value="STJ">STJ</option>
                </select>
                <select value={subjectFilter} onChange={(e) => { setSubjectFilter(e.target.value); setPage(1); }}>
                    <option value="">Matéria: Todas</option>
                    {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Título</th>
                                <th>Tribunal</th>
                                <th>Matéria</th>
                                <th>Aplicabilidade</th>
                                <th>Tags</th>
                                <th>Data</th>
                                <th style={{ textAlign: 'right' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-3)' }}>Carregando…</td></tr>
                            )}
                            {!loading && precedents.map((p) => (
                                <tr key={p.id}>
                                    <td style={{ maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {p.title}
                                    </td>
                                    <td><span className={`badge badge-${p.court.toLowerCase()}`}>{p.court}</span></td>
                                    <td style={{ fontSize: '0.8rem' }}>{p.subject?.name}</td>
                                    <td>
                                        <span className={`badge badge-${p.applicability === 'GERAL' ? 'geral' : p.applicability === 'JUIZ' ? 'juiz' : p.applicability === 'PROCURADOR' ? 'proc' : 'ambos'}`}>
                                            {APPL_LABEL[p.applicability]}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>{p.tags.slice(0, 2).join(', ')}{p.tags.length > 2 ? '…' : ''}</td>
                                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.82rem' }}>{new Date(p.createdAt).toLocaleDateString('pt-BR')}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
                                            <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}>Editar</button>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id, p.title)}>Excluir</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!loading && precedents.length === 0 && (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-3)' }}>Nenhum precedente encontrado.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    <button className="page-btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>← Anterior</button>
                    {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                        const pg = i + 1;
                        return <button key={pg} className={`page-btn ${page === pg ? 'active' : ''}`} onClick={() => setPage(pg)}>{pg}</button>;
                    })}
                    <button className="page-btn" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Próxima →</button>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{editing ? 'Editar precedente' : 'Novo precedente'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>

                        {error && <div className="alert alert-error">{error}</div>}

                        <div className="form-row">
                            <div className="form-group mb-0">
                                <label>Tribunal</label>
                                <select value={form.court} onChange={(e) => setForm({ ...form, court: e.target.value })}>
                                    <option value="STF">STF – Supremo Tribunal Federal</option>
                                    <option value="STJ">STJ – Superior Tribunal de Justiça</option>
                                </select>
                            </div>
                            <div className="form-group mb-0">
                                <label>Aplicabilidade</label>
                                <select value={form.applicability} onChange={(e) => setForm({ ...form, applicability: e.target.value })}>
                                    <option value="GERAL">Geral – todos os perfis</option>
                                    <option value="JUIZ">Somente Juiz</option>
                                    <option value="PROCURADOR">Somente Procurador</option>
                                    <option value="AMBOS">Ambos (Juiz + Procurador)</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group mt-2">
                            <label>Matéria</label>
                            <select value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })}>
                                <option value="">Selecione uma matéria…</option>
                                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.trackScope})</option>)}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Título / Identificador</label>
                            <input
                                type="text"
                                placeholder="Ex: RE 593.068 – Proibição do retrocesso social"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label>Resumo / Ementa</label>
                            <textarea
                                rows={4}
                                placeholder="Descreva a tese fixada pelo tribunal…"
                                value={form.summary}
                                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                                style={{ resize: 'vertical' }}
                            />
                        </div>

                        <div className="form-group">
                            <label>Link / Texto integral <span style={{ color: 'var(--text-3)' }}>(opcional)</span></label>
                            <input
                                type="text"
                                placeholder="https://jurisprudencia.stf.jus.br/…"
                                value={form.fullTextOrLink}
                                onChange={(e) => setForm({ ...form, fullTextOrLink: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label>Tags <span style={{ color: 'var(--text-3)' }}>(separadas por vírgula)</span></label>
                            <input
                                type="text"
                                placeholder="ex: retrocesso social, direitos fundamentais, STF"
                                value={form.tagsStr}
                                onChange={(e) => setForm({ ...form, tagsStr: e.target.value })}
                            />
                        </div>

                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                            <button
                                className="btn btn-primary"
                                onClick={handleSave}
                                disabled={saving || !form.title.trim() || !form.summary.trim() || !form.subjectId}
                            >
                                {saving ? 'Salvando…' : editing ? 'Atualizar' : 'Criar precedente'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
