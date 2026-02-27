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
    forAll: boolean;
    forProcurador: boolean;
    forJuizFederal: boolean;
    forJuizEstadual: boolean;
    judgmentDate?: string | null;
    isRG: boolean;
    rgTheme?: number | null;
    informatoryNumber?: string | null;
    processClass?: string | null;
    processNumber?: string | null;
    organ?: string | null;
    rapporteur?: string | null;
    tags: string[];
    createdAt: string;
    subject: { name: string };
};

const emptyForm = {
    court: 'STF',
    title: '',
    summary: '',
    fullTextOrLink: '',
    subjectId: '',
    forAll: true,
    forProcurador: false,
    forJuizFederal: false,
    forJuizEstadual: false,
    judgmentDate: '',
    isRG: false,
    rgTheme: '',
    informatoryNumber: '',
    processClass: '',
    processNumber: '',
    organ: '',
    rapporteur: '',
    tagsStr: '',
};

const SCOPE_LABEL: Record<string, string> = {
    COMMON: '🌐 Comum',
    PROCURADOR: '📋 Procurador',
    JUIZ_FEDERAL: '⚖️ Juiz Federal',
    JUIZ_ESTADUAL: '⚖️ Juiz Estadual',
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
            forAll: p.forAll,
            forProcurador: p.forProcurador,
            forJuizFederal: p.forJuizFederal,
            forJuizEstadual: p.forJuizEstadual,
            judgmentDate: p.judgmentDate ? p.judgmentDate.substring(0, 10) : '',
            isRG: p.isRG,
            rgTheme: p.rgTheme != null ? String(p.rgTheme) : '',
            informatoryNumber: p.informatoryNumber ?? '',
            processClass: p.processClass ?? '',
            processNumber: p.processNumber ?? '',
            organ: p.organ ?? '',
            rapporteur: p.rapporteur ?? '',
            tagsStr: p.tags.join(', '),
        });
        setError('');
        setShowModal(true);
    }

    async function handleSave() {
        setSaving(true);
        setError('');
        const tags = form.tagsStr.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
        const payload = {
            court: form.court,
            title: form.title,
            summary: form.summary,
            fullTextOrLink: form.fullTextOrLink || null,
            subjectId: form.subjectId,
            forAll: form.forAll,
            forProcurador: form.forProcurador,
            forJuizFederal: form.forJuizFederal,
            forJuizEstadual: form.forJuizEstadual,
            judgmentDate: form.judgmentDate || null,
            isRG: form.isRG,
            rgTheme: form.rgTheme ? parseInt(String(form.rgTheme)) : null,
            informatoryNumber: form.informatoryNumber || null,
            processClass: form.processClass || null,
            processNumber: form.processNumber || null,
            organ: form.organ || null,
            rapporteur: form.rapporteur || null,
            tags,
        };
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
        if (!confirm(`Excluir "${title.substring(0, 60)}"?`)) return;
        await fetch(`/api/admin/precedents/${id}`, { method: 'DELETE' });
        fetchPrecedents(page, courtFilter, subjectFilter);
    }

    const totalPages = Math.ceil(total / limit);

    function applicabilityLabel(p: Precedent) {
        if (p.forAll) return <span className="badge badge-geral">Geral</span>;
        const parts = [];
        if (p.forProcurador) parts.push('PGE');
        if (p.forJuizFederal) parts.push('J.Fed');
        if (p.forJuizEstadual) parts.push('J.Est');
        return <span className="badge badge-juiz">{parts.join(' + ')}</span>;
    }

    // Group subjects by scope for the select
    const subjectsByScope = subjects.reduce((acc, s) => {
        const key = s.trackScope;
        if (!acc[key]) acc[key] = [];
        acc[key].push(s);
        return acc;
    }, {} as Record<string, Subject[]>);

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Precedentes</h1>
                    <p className="page-subtitle">Gerencie os precedentes do STF, STJ, TRF e TJ ({total} no total)</p>
                </div>
                <button className="btn btn-primary" onClick={openCreate}>+ Novo precedente</button>
            </div>

            <div className="filters-bar" style={{ marginBottom: '1rem' }}>
                <select value={courtFilter} onChange={(e) => { setCourtFilter(e.target.value); setPage(1); }}>
                    <option value="">Tribunal: Todos</option>
                    <option value="STF">STF</option>
                    <option value="STJ">STJ</option>
                    <option value="TRF">TRF</option>
                    <option value="TJ">TJ</option>
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
                                <th>Data</th>
                                <th>Título</th>
                                <th>Tribunal</th>
                                <th>Matéria</th>
                                <th>Aplicabilidade</th>
                                <th style={{ textAlign: 'right' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-3)' }}>Carregando…</td></tr>}
                            {!loading && precedents.map((p) => (
                                <tr key={p.id}>
                                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.82rem', color: 'var(--text-3)' }}>
                                        {p.judgmentDate ? new Date(p.judgmentDate).toLocaleDateString('pt-BR') : '—'}
                                    </td>
                                    <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {p.isRG && <span style={{ fontSize: '0.7rem', background: 'var(--gold)', color: '#fff', borderRadius: '3px', padding: '1px 5px', marginRight: '5px' }}>RG {p.rgTheme}</span>}
                                        {p.title}
                                    </td>
                                    <td><span className={`badge badge-${p.court.toLowerCase()}`}>{p.court}</span></td>
                                    <td style={{ fontSize: '0.8rem' }}>{p.subject?.name}</td>
                                    <td>{applicabilityLabel(p)}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
                                            <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}>Editar</button>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id, p.title)}>Excluir</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!loading && precedents.length === 0 && (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-3)' }}>Nenhum precedente encontrado.</td></tr>
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
                    <div className="modal" style={{ maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{editing ? 'Editar precedente' : 'Novo precedente'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>

                        {error && <div className="alert alert-error">{error}</div>}

                        {/* Linha 1: Tribunal + Data */}
                        <div className="form-row">
                            <div className="form-group mb-0">
                                <label>Tribunal *</label>
                                <select value={form.court} onChange={(e) => setForm({ ...form, court: e.target.value })}>
                                    <option value="STF">STF – Supremo Tribunal Federal</option>
                                    <option value="STJ">STJ – Superior Tribunal de Justiça</option>
                                    <option value="TRF">TRF – Tribunal Regional Federal</option>
                                    <option value="TJ">TJ – Tribunal de Justiça</option>
                                </select>
                            </div>
                            <div className="form-group mb-0">
                                <label>Data do julgamento</label>
                                <input type="date" value={form.judgmentDate} onChange={(e) => setForm({ ...form, judgmentDate: e.target.value })} />
                            </div>
                        </div>

                        {/* Matéria */}
                        <div className="form-group mt-2">
                            <label>Matéria *</label>
                            <select value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })}>
                                <option value="">Selecione uma matéria…</option>
                                {Object.entries(subjectsByScope).map(([scope, subs]) => (
                                    <optgroup key={scope} label={SCOPE_LABEL[scope] ?? scope}>
                                        {subs.map((s) => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                        </div>

                        {/* Aplicabilidade (multi-trilha) */}
                        <div className="form-group">
                            <label>Aplicabilidade (quem deve ver este precedente)</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.4rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontWeight: 500 }}>
                                    <input type="checkbox" checked={form.forAll} onChange={(e) => setForm({ ...form, forAll: e.target.checked })} />
                                    🌐 Geral (todos)
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={form.forProcurador} onChange={(e) => setForm({ ...form, forProcurador: e.target.checked })} />
                                    📋 Procurador do Estado
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={form.forJuizFederal} onChange={(e) => setForm({ ...form, forJuizFederal: e.target.checked })} />
                                    ⚖️ Juiz Federal
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={form.forJuizEstadual} onChange={(e) => setForm({ ...form, forJuizEstadual: e.target.checked })} />
                                    ⚖️ Juiz Estadual
                                </label>
                            </div>
                        </div>

                        {/* Título */}
                        <div className="form-group">
                            <label>Título / Identificador *</label>
                            <input
                                type="text"
                                placeholder="Ex: RE 593.068 – Proibição do retrocesso social"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                            />
                        </div>

                        {/* Resumo */}
                        <div className="form-group">
                            <label>Resumo / Tese fixada *</label>
                            <textarea
                                rows={4}
                                placeholder="Descreva a tese fixada pelo tribunal…"
                                value={form.summary}
                                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                                style={{ resize: 'vertical' }}
                            />
                        </div>

                        {/* Dados processuais */}
                        <div className="form-row">
                            <div className="form-group mb-0">
                                <label>Classe processual</label>
                                <input type="text" placeholder="Ex: RE, ADI, REsp, ADPF" value={form.processClass} onChange={(e) => setForm({ ...form, processClass: e.target.value })} />
                            </div>
                            <div className="form-group mb-0">
                                <label>Número do processo</label>
                                <input type="text" placeholder="Ex: 593.068/SP" value={form.processNumber} onChange={(e) => setForm({ ...form, processNumber: e.target.value })} />
                            </div>
                        </div>

                        <div className="form-row mt-2">
                            <div className="form-group mb-0">
                                <label>Órgão julgador</label>
                                <input type="text" placeholder="Ex: Plenário, 1ª Turma" value={form.organ} onChange={(e) => setForm({ ...form, organ: e.target.value })} />
                            </div>
                            <div className="form-group mb-0">
                                <label>Relator</label>
                                <input type="text" placeholder="Ex: Min. Alexandre de Moraes" value={form.rapporteur} onChange={(e) => setForm({ ...form, rapporteur: e.target.value })} />
                            </div>
                        </div>

                        {/* RG + Informativo */}
                        <div className="form-row mt-2">
                            <div className="form-group mb-0">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <input type="checkbox" checked={form.isRG} onChange={(e) => setForm({ ...form, isRG: e.target.checked })} />
                                    Repercussão Geral (STF)
                                </label>
                                {form.isRG && (
                                    <input type="number" placeholder="Nº do Tema" style={{ marginTop: '0.4rem' }} value={String(form.rgTheme)} onChange={(e) => setForm({ ...form, rgTheme: e.target.value })} />
                                )}
                            </div>
                            <div className="form-group mb-0">
                                <label>Nº do Informativo</label>
                                <input type="text" placeholder="Ex: 1123" value={form.informatoryNumber} onChange={(e) => setForm({ ...form, informatoryNumber: e.target.value })} />
                            </div>
                        </div>

                        {/* Link + Tags */}
                        <div className="form-group mt-2">
                            <label>Link / Texto integral <span style={{ color: 'var(--text-3)' }}>(opcional)</span></label>
                            <input type="text" placeholder="https://jurisprudencia.stf.jus.br/…" value={form.fullTextOrLink} onChange={(e) => setForm({ ...form, fullTextOrLink: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Tags <span style={{ color: 'var(--text-3)' }}>(separadas por vírgula)</span></label>
                            <input type="text" placeholder="ex: bem de família, fiador, locação" value={form.tagsStr} onChange={(e) => setForm({ ...form, tagsStr: e.target.value })} />
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
