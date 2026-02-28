'use client';
import { useEffect, useState } from 'react';
import { Icons as SvgIcons } from '@/components/ui/Icons';

type Subject = { id: string; name: string };
type Precedent = {
    id: string; court: string; title: string; summary: string;
    fullTextOrLink?: string | null; subjectId: string;
    forAll: boolean; forProcurador: boolean; forJuizFederal: boolean; forJuizEstadual: boolean;
    judgmentDate?: string | null; isRG: boolean; rgTheme?: number | null;
    informatoryNumber?: string | null; processClass?: string | null;
    processNumber?: string | null; organ?: string | null; rapporteur?: string | null;
    theme?: string | null; tags: string[];
    subjects: { id: string; name: string }[];
};

const COURTS = ['STF', 'STJ', 'TRF', 'TJ'] as const;
const EMPTY_FORM = {
    court: 'STJ', title: '', summary: '', fullTextOrLink: '',
    subjectIds: [] as string[], forAll: false, forProcurador: false, forJuizFederal: false, forJuizEstadual: false,
    judgmentDate: '', isRG: false, rgTheme: '', informatoryNumber: '',
    processClass: '', processNumber: '', organ: '', rapporteur: '', theme: '', tags: '',
};

function visibilityLabel(p: Precedent) {
    if (p.forAll) return <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><SvgIcons.Sparkles size={14} /> Geral</span>;
    const t = [];
    if (p.forJuizEstadual) t.push(<span key="je" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><SvgIcons.Scale size={14} /> J.Est</span>);
    if (p.forJuizFederal) t.push(<span key="jf" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><SvgIcons.Landmark size={14} /> J.Fed</span>);
    if (p.forProcurador) t.push(<span key="pg" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><SvgIcons.Briefcase size={14} /> PGE</span>);

    if (t.length === 0) return '—';

    return (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {t}
        </div>
    );
}

function DetailRow({ label, value }: { label: string; value?: any }) {
    if (value === null || value === undefined || value === '' || value === false) return null;
    return (
        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.82rem', padding: '0.4rem 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-3)', minWidth: 130, flexShrink: 0 }}>{label}</span>
            <div style={{ color: 'var(--text)', fontWeight: 500, flex: 1 }}>
                {value === true ? 'Sim' : value}
            </div>
        </div>
    );
}

export default function AdminPrecedentsClient() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [precedents, setPrecedents] = useState<Precedent[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterSubject, setFilterSubject] = useState('');

    // Panel state
    const [panel, setPanel] = useState<Precedent | null>(null);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState<typeof EMPTY_FORM>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');

    // Create modal
    const [showCreate, setShowCreate] = useState(false);
    const [createForm, setCreateForm] = useState<typeof EMPTY_FORM>(EMPTY_FORM);

    async function fetchData() {
        setLoading(true);
        const [sRes, pRes] = await Promise.all([
            fetch('/api/admin/subjects'),
            fetch(`/api/admin/precedents?q=${search}&subjectId=${filterSubject}`),
        ]);
        const sData = await sRes.json();
        const pData = await pRes.json();
        setSubjects(sData.subjects ?? []);
        setPrecedents(pData.precedents ?? []);
        setLoading(false);
    }

    useEffect(() => { fetchData(); }, [search, filterSubject]);

    function openPanel(p: Precedent) {
        setPanel(p);
        setEditing(false);
        setForm({
            court: p.court, title: p.title, summary: p.summary,
            fullTextOrLink: p.fullTextOrLink ?? '',
            subjectIds: p.subjects?.map(s => s.id) ?? [],
            forAll: p.forAll, forProcurador: p.forProcurador,
            forJuizFederal: p.forJuizFederal, forJuizEstadual: p.forJuizEstadual,
            judgmentDate: p.judgmentDate ? p.judgmentDate.substring(0, 10) : '',
            isRG: p.isRG, rgTheme: p.rgTheme ? String(p.rgTheme) : '',
            informatoryNumber: p.informatoryNumber ?? '', processClass: p.processClass ?? '',
            processNumber: p.processNumber ?? '', organ: p.organ ?? '',
            rapporteur: p.rapporteur ?? '', theme: p.theme ?? '',
            tags: (p.tags ?? []).join(', '),
        });
    }

    async function handleUpdate() {
        if (!panel) return;
        setSaving(true); setFormError('');
        const body = {
            ...form,
            rgTheme: form.rgTheme ? parseInt(form.rgTheme as string) : null,
            tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
            judgmentDate: form.judgmentDate || null,
        };
        const res = await fetch(`/api/admin/precedents/${panel.id}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        setSaving(false);
        if (!res.ok) { setFormError(data.error ?? 'Erro ao salvar'); return; }
        setEditing(false);
        fetchData();
        setPanel({ ...panel, ...data.precedent });
    }

    async function handleCreate() {
        setSaving(true); setFormError('');
        const body = {
            ...createForm,
            rgTheme: createForm.rgTheme ? parseInt(createForm.rgTheme as string) : null,
            tags: createForm.tags ? createForm.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
            judgmentDate: createForm.judgmentDate || null,
        };
        const res = await fetch('/api/admin/precedents', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        setSaving(false);
        if (!res.ok) { setFormError(data.error ?? 'Erro ao criar'); return; }
        setShowCreate(false);
        setCreateForm(EMPTY_FORM);
        fetchData();
    }

    async function handleDelete(id: string, title: string) {
        if (!confirm(`Excluir "${title}"?`)) return;
        await fetch(`/api/admin/precedents/${id}`, { method: 'DELETE' });
        if (panel?.id === id) setPanel(null);
        fetchData();
    }


    function PrecedentForm({ f, setF, subjects }: { f: typeof EMPTY_FORM; setF: (v: any) => void; subjects: Subject[] }) {
        const set = (k: string, v: any) => setF((prev: any) => ({ ...prev, [k]: v }));

        // Auto-suggest subjects based on keywords
        useEffect(() => {
            const text = `${f.title} ${f.summary}`.toLowerCase();
            let newIds = [...f.subjectIds];
            let changed = false;

            const rules = [
                { id: 's-trib', keywords: ['tributário', 'imposto', 'refis', 'fiscal', 'contribuinte', 'icms', 'iss', 'irpf', 'irpj', 'iptu', 'itcmd'] },
                { id: 's-cproc', keywords: ['processual civil', 'cpc', 'honorários', 'recurso', 'agravo', 'apelação', 'competência', 'legitimidade', 'embargos'] },
                { id: 's-admin', keywords: ['administrativo', 'servidor', 'concurso', 'improbidade', 'licitação', 'poder público', 'estado', 'município'] },
                { id: 's-civil', keywords: ['civil', 'contrato', 'família', 'sucessões', 'danos morais', 'responsabilidade civil', 'propriedade'] },
                { id: 's-pen', keywords: ['penal', 'crime', 'delito', 'prisão', 'cpp', 'condenação', 'pena', 'tráfico', 'roubo', 'furto'] },
                { id: 's-cons', keywords: ['consumidor', 'código de defesa', 'cdc', 'vício', 'produto', 'serviço', 'propaganda'] }
            ];

            rules.forEach(rule => {
                const sub = subjects.find(s => s.id === rule.id || s.name.toLowerCase().includes(rule.id.split('-')[1]));
                const targetId = sub?.id;
                if (targetId && !newIds.includes(targetId) && rule.keywords.some(k => text.includes(k))) {
                    newIds.push(targetId);
                    changed = true;
                }
            });

            if (changed) set('subjectIds', newIds);
        }, [f.title, f.summary, subjects]); // Added subjects to dependency array

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label>Tribunal</label>
                        <select value={f.court} onChange={e => set('court', e.target.value)}>
                            {COURTS.map(c => <option key={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label>Data de julgamento</label>
                        <input type="date" value={f.judgmentDate} onChange={e => set('judgmentDate', e.target.value)} />
                    </div>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                    <label>Título</label>
                    <input value={f.title} onChange={e => set('title', e.target.value)} placeholder="Título do precedente" />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                    <label>Tese / Resumo (DESTAQUE)</label>
                    <textarea rows={3} value={f.summary} onChange={e => set('summary', e.target.value)} placeholder="Tese fixada no julgamento" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label>Classe processual</label>
                        <input value={f.processClass} onChange={e => set('processClass', e.target.value)} placeholder="REsp, RE, ADI…" />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label>Número do processo</label>
                        <input value={f.processNumber} onChange={e => set('processNumber', e.target.value)} placeholder="1.882.236-RS" />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label>Informativo nº</label>
                        <input value={f.informatoryNumber} onChange={e => set('informatoryNumber', e.target.value)} placeholder="878" />
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label>Órgão julgador</label>
                        <input value={f.organ} onChange={e => set('organ', e.target.value)} placeholder="Corte Especial, Plenário…" />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label>Relator</label>
                        <input value={f.rapporteur} onChange={e => set('rapporteur', e.target.value)} placeholder="Min. Fulano de Tal" />
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label>Tema (ex: Tema 1081)</label>
                        <input value={f.theme} onChange={e => set('theme', e.target.value)} placeholder="Tema 1081 / RG 123" />
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label>Matérias (Selecione múltiplas)</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', background: 'var(--surface2)', padding: '0.75rem', borderRadius: 12, border: '1px solid var(--border)' }}>
                            {subjects.map(s => (
                                <label key={s.id} style={{ fontSize: '0.8rem', display: 'flex', gap: '0.4rem', alignItems: 'center', cursor: 'pointer', padding: '4px 8px', background: f.subjectIds.includes(s.id) ? 'var(--accent-10)' : 'transparent', borderRadius: 6, border: f.subjectIds.includes(s.id) ? '1px solid var(--accent)' : '1px solid var(--border)' }}>
                                    <input
                                        type="checkbox"
                                        checked={f.subjectIds.includes(s.id)}
                                        onChange={e => {
                                            const next = e.target.checked
                                                ? [...f.subjectIds, s.id]
                                                : f.subjectIds.filter(id => id !== s.id);
                                            set('subjectIds', next);
                                        }}
                                    />
                                    {s.name}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                    <label>Link / Inteiro teor</label>
                    <input value={f.fullTextOrLink} onChange={e => set('fullTextOrLink', e.target.value)} placeholder="https://…" />
                </div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', padding: '0.25rem 0' }}>
                    <label style={{ fontSize: '0.82rem', display: 'flex', gap: '0.4rem', alignItems: 'center', cursor: 'pointer' }}>
                        <input type="checkbox" checked={f.isRG} onChange={e => set('isRG', e.target.checked)} /> <SvgIcons.Target size={14} /> RG (Repercussão Geral)
                    </label>
                    <label style={{ fontSize: '0.82rem', display: 'flex', gap: '0.4rem', alignItems: 'center', cursor: 'pointer' }}>
                        <input type="checkbox" checked={f.forAll} onChange={e => set('forAll', e.target.checked)} /> <SvgIcons.Sparkles size={14} /> Geral (todos)
                    </label>
                    <label style={{ fontSize: '0.82rem', display: 'flex', gap: '0.4rem', alignItems: 'center', cursor: 'pointer' }}>
                        <input type="checkbox" checked={f.forJuizEstadual} onChange={e => set('forJuizEstadual', e.target.checked)} /> <SvgIcons.Scale size={14} /> Juiz Estadual
                    </label>
                    <label style={{ fontSize: '0.82rem', display: 'flex', gap: '0.4rem', alignItems: 'center', cursor: 'pointer' }}>
                        <input type="checkbox" checked={f.forJuizFederal} onChange={e => set('forJuizFederal', e.target.checked)} /> <SvgIcons.Landmark size={14} /> Juiz Federal
                    </label>
                    <label style={{ fontSize: '0.82rem', display: 'flex', gap: '0.4rem', alignItems: 'center', cursor: 'pointer' }}>
                        <input type="checkbox" checked={f.forProcurador} onChange={e => set('forProcurador', e.target.checked)} /> <SvgIcons.Briefcase size={14} /> Procurador
                    </label>
                </div>
            </div>
        );
    }

    return (
        <div style={{ height: '100%', minHeight: 0 }}>
            {/* List Container */}
            <div style={{ width: '100%' }}>
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Precedentes</h1>
                        <p className="page-subtitle">{precedents.length} cadastrados</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => { setCreateForm(EMPTY_FORM); setShowCreate(true); }} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <SvgIcons.RefreshCw size={16} /> Novo
                    </button>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <input
                        style={{ flex: 1, padding: '0.4rem 0.75rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface2)', fontSize: '0.85rem' }}
                        placeholder="Buscar por título, tema ou processo…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <select
                        style={{ padding: '0.4rem 0.75rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface2)', fontSize: '0.85rem' }}
                        value={filterSubject}
                        onChange={e => setFilterSubject(e.target.value)}
                    >
                        <option value="">Todas matérias</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>

                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Inf.</th><th>Processo</th><th>Título</th><th>Tema</th><th>Tribunal</th><th>Matérias</th><th>Para</th><th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-3)' }}>Carregando…</td></tr>}
                                {!loading && precedents.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-3)' }}>Nenhum precedente.</td></tr>}
                                {!loading && precedents.map(p => (
                                    <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => openPanel(p)}>
                                        <td style={{ whiteSpace: 'nowrap', fontSize: '0.78rem', fontWeight: 600 }}>
                                            {p.informatoryNumber ? `STJ ${p.informatoryNumber}` : '—'}
                                        </td>
                                        <td style={{ whiteSpace: 'nowrap', fontSize: '0.78rem', color: 'var(--text-2)' }}>
                                            {p.processNumber || '—'}
                                        </td>
                                        <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.82rem' }}>{p.title}</td>
                                        <td>{p.theme ? <span style={{ fontSize: '0.72rem', background: 'rgba(201,138,0,0.12)', color: '#a06e00', padding: '1px 8px', borderRadius: 20, fontWeight: 600, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><SvgIcons.Pin size={12} /> {p.theme}</span> : <span style={{ color: 'var(--text-3)', fontSize: '0.75rem' }}>—</span>}</td>
                                        <td><span className={`badge badge-${p.court.toLowerCase()}`}>{p.court}</span></td>
                                        <td style={{ fontSize: '0.78rem' }}>
                                            {p.subjects?.map(s => s.name).join(', ') || '—'}
                                        </td>
                                        <td style={{ fontSize: '0.78rem' }}>{visibilityLabel(p)}</td>
                                        <td onClick={e => e.stopPropagation()}>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id, p.title)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <SvgIcons.X size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Detail / Edit Modal */}
            {panel && (
                <div className="modal-overlay" onClick={() => setPanel(null)}>
                    <div className="modal" style={{ maxWidth: 800, width: '95vw', background: 'var(--surface)', padding: '1.5rem' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span className={`badge badge-${panel.court.toLowerCase()}`}>{panel.court}</span>
                                <h2 className="modal-title" style={{ margin: 0, fontSize: '1.1rem' }}>
                                    {editing ? 'Editando precedente' : 'Detalhes do precedente'}
                                </h2>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {!editing && <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>Editar</button>}
                                {editing && <button className="btn btn-primary btn-sm" onClick={handleUpdate} disabled={saving}>{saving ? 'Salvando…' : 'Salvar'}</button>}
                                {editing && <button className="btn btn-secondary btn-sm" onClick={() => setEditing(false)}>Cancelar</button>}
                                <button className="modal-close" onClick={() => setPanel(null)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <SvgIcons.X size={18} />
                                </button>
                            </div>
                        </div>

                        {formError && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{formError}</div>}

                        <div style={{ maxHeight: '75vh', overflowY: 'auto', padding: '0.5rem 0' }}>
                            {editing ? (
                                <PrecedentForm f={form} setF={setForm} subjects={subjects} />
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    <div>
                                        <h3 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.5rem', color: 'var(--text-1)' }}>{panel.title}</h3>
                                        <div style={{ background: 'var(--surface2)', padding: '1rem', borderRadius: 12, border: '1px solid var(--border)', fontSize: '0.9rem', color: 'var(--text-1)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                                            {panel.summary}
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.75rem', background: 'var(--surface2)', padding: '1rem', borderRadius: 12, border: '1px solid var(--border)' }}>
                                        <DetailRow label="Matérias" value={panel.subjects?.map(s => s.name).join(', ')} />
                                        <DetailRow label="Tema" value={panel.theme} />
                                        <DetailRow label="Data de julgamento" value={panel.judgmentDate ? new Date(panel.judgmentDate).toLocaleDateString('pt-BR') : null} />
                                        <DetailRow label="Informativo" value={panel.informatoryNumber} />
                                        <DetailRow label="Processo" value={panel.processClass && panel.processNumber ? `${panel.processClass} ${panel.processNumber}` : (panel.processNumber ?? null)} />
                                        <DetailRow label="Órgão" value={panel.organ} />
                                        <DetailRow label="Relator" value={panel.rapporteur} />
                                        <DetailRow label="RG" value={panel.isRG ? `Sim${panel.rgTheme ? ` (Tema ${panel.rgTheme})` : ''}` : null} />
                                        <DetailRow label="Visível para" value={visibilityLabel(panel)} />
                                    </div>

                                    {panel.fullTextOrLink && (
                                        <a href={panel.fullTextOrLink} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                                            <SvgIcons.Link size={14} /> Ver inteiro teor no site do tribunal
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Create modal */}
            {showCreate && (
                <div className="modal-overlay" onClick={() => setShowCreate(false)}>
                    <div className="modal" style={{ maxWidth: 640, width: '95vw' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Novo precedente</h2>
                            <button className="modal-close" onClick={() => setShowCreate(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <SvgIcons.X size={18} />
                            </button>
                        </div>
                        {formError && <div className="alert alert-error" style={{ marginBottom: '0.5rem' }}>{formError}</div>}
                        <div style={{ maxHeight: '70vh', overflowY: 'auto', padding: '0.25rem 0' }}>
                            <PrecedentForm f={createForm} setF={setCreateForm} subjects={subjects} />
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancelar</button>
                            <button className="btn btn-primary" onClick={handleCreate} disabled={saving || !createForm.title || !createForm.summary || createForm.subjectIds.length === 0}>
                                {saving ? 'Criando…' : 'Criar precedente'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
