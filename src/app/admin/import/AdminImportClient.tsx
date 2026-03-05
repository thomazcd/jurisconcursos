'use client';
import React, { useState } from 'react';
import { Icons as SvgIcons } from '@/components/ui/Icons';
import { useRouter } from 'next/navigation';

export default function AdminImportClient() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState<string | null>(null); // Guardar o ID da tese em processamento

    // Estrutura do Informativo Pai
    const [infCourt, setInfCourt] = useState('STJ');
    const [infNumber, setInfNumber] = useState('');
    const [infYear, setInfYear] = useState(new Date().getFullYear().toString());
    const [pubDateInfo, setPubDateInfo] = useState('');

    const [pdfLoading, setPdfLoading] = useState(false);
    const [importMode, setImportMode] = useState<'pdf' | 'text'>('pdf');
    const [rawBulkText, setRawBulkText] = useState('');
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const [precedentsDrafts, setPrecedentsDrafts] = useState<any[]>([]);
    const [expandedDraftId, setExpandedDraftId] = useState<string | null>(null);

    // List of judicial connectors to automatically insert \n\n
    const legalConnectors = [
        "Assim,", "Dessa forma,", "Nesse contexto,", "Neste cenário,",
        "Nesse sentido,", "Portanto,", "Desse modo,", "Com efeito,",
        "Nesse raciocínio,", "Ademais,", "Outrossim,", "Saliente-se que,",
        "Destaca-se que,", "Na hipótese,", "Nessa linha de intelecção,",
        "Todavia,", "Entretanto,", "Contudo,", "Inicialmente,"
    ];

    function formatLegalText(text: string) {
        if (!text) return '';
        let result = text;
        legalConnectors.forEach(conn => {
            // Regex to find connector that is not at the start of a new line
            // adding two newlines before it
            const regex = new RegExp(`([^\\n])(\\s+)(${conn})`, 'gi');
            result = result.replace(regex, `$1\n\n$3`);
        });
        return result;
    }

    function removeDraft(id: string) {
        setPrecedentsDrafts(prev => prev.filter(d => d.id !== id));
        if (expandedDraftId === id) setExpandedDraftId(null);
    }

    function updateDraft(id: string, updates: any) {
        setPrecedentsDrafts(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
    }

    async function handlePublish() {
        if (!infNumber || !infYear) return alert('Defina o número e o ano do informativo.');
        if (precedentsDrafts.length === 0) return alert('Adicione pelo menos um precedente.');

        if (!confirm(`Deseja salvar e PUBLICAR O INFORMATIVO ${infCourt} ${infNumber}/${infYear} com ${precedentsDrafts.length} teses?`)) return;

        setLoading(true);
        try {
            const res = await fetch('/api/admin/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    informatory: { court: infCourt, number: infNumber, year: parseInt(infYear), publicationDate: pubDateInfo || null },
                    precedents: precedentsDrafts.map(d => ({
                        title: d.title,
                        summary: d.summary,
                        fullTextOrLink: d.fullTextOrLink,
                        processClass: d.processClass,
                        processNumber: d.processNumber,
                        organ: d.organ,
                        rapporteur: d.rapporteur,
                        theme: d.theme,
                        judgmentDate: d.judgmentDate,
                        publicationDate: d.publicationDate,
                        tags: d.tags || [],
                        flashcardQuestion: d.flashcardQuestion,
                        flashcardAnswer: d.flashcardAnswer,
                        forAll: d.forAll,
                        forProcurador: d.forProcurador,
                        forJuizFederal: d.forJuizFederal,
                        forJuizEstadual: d.forJuizEstadual,
                    }))
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Erro desconhecido');

            alert('✅ Informativo importado e publicado com sucesso!');
            router.push('/admin/precedents');
        } catch (error: any) {
            console.error(error);
            alert(`Erro na importação: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }

    async function handlePDFUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setPdfLoading(true);
        const formData = new FormData();
        formData.append('pdf', file);

        try {
            const res = await fetch('/api/admin/gemini-pdf', { method: 'POST', body: formData });
            const rawText = await res.text();
            let data: any;
            try { data = JSON.parse(rawText); } catch (e) { throw new Error('Servidor demorou a responder ou timeout na Vercel.'); }
            if (!res.ok) throw new Error(data?.error || 'Erro Gemini PDF');

            if (data.informatoryNumber) {
                setInfNumber(data.informatoryNumber.toString());
            }

            if (data.precedents && Array.isArray(data.precedents)) {
                pushAiDraftsToQueue(data.precedents);
            } else {
                alert('Nenhuma tese compreensível extraída.');
            }
        } catch (err: any) {
            console.error(err);
            alert(`Falha ao ler o PDF: ${err.message}`);
        } finally {
            setPdfLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }

    async function handleBulkTextUpload() {
        if (!rawBulkText.trim()) return alert("Cole o texto do informativo primeiro.");

        setPdfLoading(true);

        // Parseador Local para Textos Estruturados (NotebookLLM)
        if (rawBulkText.includes('**Órgão Julgador:**') || rawBulkText.includes('**Número do Processo:**')) {
            const drafts: any[] = [];

            // Define a raiz separadora baseada na primeira marcação de cada Tese
            let boundaryRegex = /(?=\*?\s*\*\*Órgão Julgador:\*\*)/g;
            if (!rawBulkText.includes('**Órgão Julgador:**')) {
                boundaryRegex = /(?=\*?\s*\*\*Número do Processo:\*\*)/g;
            }

            const blocks = rawBulkText.split(boundaryRegex).filter(x => x.trim().length > 0);

            for (const block of blocks) {
                const lines = block.split('\n');
                let processClass = '';
                let relator = '';
                let temaDesc = '';
                let destaque = '';
                let inteiroTeor = '';
                let temaNum = '';
                let tagsStr = '';
                let orgaoObj = '';
                let julgamento = null;
                let publicacao = null;

                let currentSection = '';
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    if (line.includes('**Órgão Julgador:**')) { currentSection = 'orgao'; orgaoObj = line.replace(/\*?\s*\*\*Órgão Julgador:\*\*/, '').trim(); }
                    else if (line.includes('**Data de Julgamento:**')) {
                        currentSection = 'julgamento';
                        const dRaw = line.replace(/\*?\s*\*\*Data de Julgamento:\*\*/, '').trim().replace(/\.$/, '');
                        if (dRaw.includes('/')) julgamento = dRaw.split('/').reverse().join('-');
                    }
                    else if (line.match(/\*\*Data d[ea] Publica[cç][aã]o.*?\*\*/i)) {
                        currentSection = 'publicacao';
                        const dRaw = line.replace(/\*?\s*\*\*Data d[ea] Publica[cç][aã]o.*?\*\*/i, '').trim().replace(/\.$/, '');
                        if (dRaw.includes('/')) publicacao = dRaw.split('/').reverse().join('-');
                    }
                    else if (line.includes('**Número do Processo:**')) { currentSection = 'processo'; processClass = line.replace(/\*?\s*\*\*Número do Processo:\*\*/, '').trim(); }
                    else if (line.includes('**Relator:**')) { currentSection = 'relator'; relator = line.replace(/\*?\s*\*\*Relator:\*\*/, '').trim(); }
                    else if (line.includes('**Relator para o acórdão:**')) {
                        currentSection = 'relatorAcordao';
                        const r2 = line.replace(/\*?\s*\*\*Relator para o acórdão:\*\*/, '').trim();
                        if (r2 && r2 !== 'N/A' && r2 !== 'N/A.') relator += ` (P/ Acórdão: ${r2})`;
                    }
                    else if (line.includes('**Número do Tema:**')) { currentSection = 'temaNum'; temaNum = line.replace(/\*?\s*\*\*Número do Tema:\*\*/, '').trim(); }
                    else if (line.match(/\*\*Ramo(s)? do [Dd]ireito.*?\*\*/i)) {
                        currentSection = 'tags';
                        tagsStr = line.replace(/\*?\s*\*\*Ramo(s)? do [Dd]ireito.*?\*\*/i, '').trim();
                    }
                    else if (line.includes('**Tema-Assunto:**')) { currentSection = 'temaAssunto'; temaDesc = line.replace(/\*?\s*\*\*Tema-Assunto:\*\*/, '').trim(); }
                    else if (line.includes('**Destaque:**')) { currentSection = 'destaque'; destaque = line.replace(/\*?\s*\*\*Destaque:\*\*/, '').trim(); }
                    else if (line.includes('**Inteiro Teor:**')) { currentSection = 'inteiroTeor'; inteiroTeor = line.replace(/\*?\s*\*\*Inteiro Teor:\*\*/, '').trim(); }
                    else {
                        if (currentSection === 'temaAssunto') temaDesc += '\n' + line;
                        else if (currentSection === 'destaque') destaque += '\n' + line;
                        else if (currentSection === 'inteiroTeor') inteiroTeor += '\n' + line;
                    }
                }

                if (destaque.trim() || inteiroTeor.trim()) {
                    const tagsArr = tagsStr.split(/,|\./).map(s => s.trim().replace(/^DIREITO /, '')).filter(s => s.length > 0);
                    drafts.push({
                        title: temaDesc.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim() || 'Sem Título',
                        summary: destaque.trim(),
                        fullText: inteiroTeor.trim(),
                        processClass: processClass.replace(/\.$/, ''),
                        rapporteur: relator.replace(/\.$/, ''),
                        organ: orgaoObj.replace(/\.$/, ''),
                        theme: temaNum.replace(/\.$/, '') || null,
                        judgmentDate: julgamento,
                        publicationDate: publicacao,
                        tags: tagsArr
                    });
                }
            }

            if (drafts.length > 0) {
                pushAiDraftsToQueue(drafts);
                setRawBulkText('');
                setPdfLoading(false);
                alert(`✨ Leitura Rápida! ${drafts.length} teses mapeadas automaticamente.`);
                return;
            }
        }

        try {
            const res = await fetch('/api/admin/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: rawBulkText, isBulk: true })
            });

            const rawResponse = await res.text();
            let data: any;
            try { data = JSON.parse(rawResponse); } catch (e) { throw new Error("Erro no processamento da IA."); }
            if (!res.ok) throw new Error(data?.error || 'Erro Gemini');

            const results = data.precedents || [data.suggestion];
            pushAiDraftsToQueue(results);
            setRawBulkText('');
            alert(`✨ Sucesso! ${results.length} teses extraídas.`);
        } catch (err: any) {
            console.error(err);
            alert(`Falha na extração por texto: ${err.message}`);
        } finally {
            setPdfLoading(false);
        }
    }

    function pushAiDraftsToQueue(items: any[]) {
        const mapped = items.map((p: any) => ({
            id: Date.now().toString() + Math.random().toString(36).substring(7),
            title: p.title || '',
            summary: p.summary || '',
            fullTextOrLink: p.fullText || p.fullTextOrLink || '',
            processClass: p.processClass || '',
            processNumber: '',
            organ: p.organ || '',
            rapporteur: p.rapporteur || '',
            theme: p.theme || '',
            judgmentDate: p.judgmentDate || null,
            publicationDate: p.publicationDate || null,
            tags: p.tags || [],
            flashcardQuestion: p.flashcardQuestion || '',
            flashcardAnswer: p.flashcardAnswer !== undefined ? p.flashcardAnswer : true,
            forAll: true,
            forProcurador: false,
            forJuizFederal: false,
            forJuizEstadual: false,
        }));
        setPrecedentsDrafts(prev => [...mapped, ...prev]);
        if (mapped.length > 0 && !expandedDraftId) {
            setExpandedDraftId(mapped[0].id); // Expand first one
        }
    }

    return (
        <div style={{ paddingBottom: '3rem', maxWidth: '1000px', margin: '0 auto' }}>
            <div className="page-header" style={{ marginBottom: '1.5rem' }}>
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <SvgIcons.Sparkles size={24} /> Importador Mágico (v3 Inline)
                    </h1>
                    <p className="page-subtitle">O seu centro de processamento de novos julgados e Informativos.</p>
                </div>
            </div>

            {/* ETAPA 1: DADOS DO INFORMATIVO */}
            <div className="card" style={{ marginBottom: '2rem', border: '2px solid var(--border)' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text)', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                    1. Dados do Informativo Matriz
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                    <div>
                        <label className="form-label">Tribunal *</label>
                        <select className="form-input" value={infCourt} onChange={e => setInfCourt(e.target.value)}>
                            <option value="STJ">STJ</option>
                            <option value="STF">STF</option>
                            <option value="TRF">TRF</option>
                            <option value="TJ">TJ</option>
                        </select>
                    </div>
                    <div>
                        <label className="form-label">Número do Info * (ex: 878)</label>
                        <input className="form-input" placeholder="878" value={infNumber} onChange={e => setInfNumber(e.target.value)} />
                    </div>
                    <div>
                        <label className="form-label">Ano *</label>
                        <input className="form-input" type="number" placeholder="2026" value={infYear} onChange={e => setInfYear(e.target.value)} />
                    </div>
                    <div>
                        <label className="form-label">Data Pub. do Informativo</label>
                        <input className="form-input" type="date" value={pubDateInfo} onChange={e => setPubDateInfo(e.target.value)} />
                    </div>
                </div>

                <div style={{ marginTop: '1.5rem', background: 'rgba(201, 138, 0, 0.05)', border: '1px dashed #c98a00', padding: '1.5rem', borderRadius: 12 }}>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                        <button type="button" onClick={() => setImportMode('pdf')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #c98a00', background: importMode === 'pdf' ? '#c98a00' : 'transparent', color: importMode === 'pdf' ? '#fff' : '#c98a00', fontWeight: 800, cursor: 'pointer' }}>Via Arquivo PDF (Max 50pgs)</button>
                        <button type="button" onClick={() => setImportMode('text')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #c98a00', background: importMode === 'text' ? '#c98a00' : 'transparent', color: importMode === 'text' ? '#fff' : '#c98a00', fontWeight: 800, cursor: 'pointer' }}>Via Texto Colado</button>
                    </div>

                    {importMode === 'pdf' ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ fontWeight: 800, color: '#a06e00', fontSize: '0.9rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}><SvgIcons.Brain size={16} /> Auto-Preencher com PDF</div>
                            </div>
                            <div>
                                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={pdfLoading} className="btn" style={{ background: '#a06e00', color: '#fff', fontSize: '0.8rem', fontWeight: 800, border: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    {pdfLoading ? <span className="spinner" style={{ width: 14, height: 14, borderColor: '#fff', borderTopColor: 'transparent' }} /> : <SvgIcons.FileText size={14} />}
                                    {pdfLoading ? 'Lendo...' : 'Selecionar Informativo PDF'}
                                </button>
                                <input type="file" accept="application/pdf" ref={fileInputRef} onChange={handlePDFUpload} style={{ display: 'none' }} />
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div style={{ fontWeight: 800, color: '#a06e00', fontSize: '0.9rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><SvgIcons.Brain size={16} /> Colar Caderno de Jurisprudência ou Estrutura do NotebookLLM</div>
                            <textarea className="form-input" rows={6} value={rawBulkText} onChange={e => setRawBulkText(e.target.value)} placeholder="Cole aqui o texto inteiro... (Reconhecimento instantâneo para padrão NotebookLLM ativo)" style={{ background: '#fff', border: '1px solid #e2e8f0', marginBottom: '1rem' }} />
                            <button type="button" onClick={handleBulkTextUpload} disabled={pdfLoading || !rawBulkText} className="btn" style={{ width: '100%', background: '#a06e00', color: '#fff', fontWeight: 800, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                {pdfLoading ? <span className="spinner" style={{ width: 14, height: 14, borderColor: '#fff', borderTopColor: 'transparent' }} /> : <SvgIcons.Plus size={14} />}
                                {pdfLoading ? 'Extraindo teses...' : 'Mapear e Extrair Teses Desse Texto'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ETAPA 2: FILA DE REVISÃO */}
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><SvgIcons.Book size={20} style={{ color: 'var(--accent)' }} /> 2. Fila de Revisão ({precedentsDrafts.length})</span>
                {precedentsDrafts.length > 0 && (
                    <button onClick={handlePublish} disabled={loading} className="btn" style={{ background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: 900 }}>
                        {loading ? 'Publicando...' : `Salvar Info e as ${precedentsDrafts.length} teses`}
                    </button>
                )}
            </h2>

            {precedentsDrafts.length === 0 && (
                <div style={{ padding: '4rem 1rem', textAlign: 'center', color: 'var(--text-3)', border: '2px dashed var(--border)', borderRadius: 16 }}>
                    A fila está vazia. Importe julgados ali em cima.
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {precedentsDrafts.map((d, index) => {
                    const isExpanded = expandedDraftId === d.id;

                    return (
                        <div key={d.id} className="card" style={{ padding: '1.5rem', position: 'relative', borderLeft: isExpanded ? '4px solid var(--accent)' : '4px solid var(--border)', background: isExpanded ? 'var(--bg)' : 'var(--surface)', transition: 'all 0.2s', boxShadow: isExpanded ? '0 10px 30px rgba(0,0,0,0.05)' : 'none' }}>
                            <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', gap: '8px' }}>
                                {!isExpanded && (
                                    <button onClick={() => setExpandedDraftId(d.id)} className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: '0.75rem', fontWeight: 800, height: '30px' }}>
                                        <SvgIcons.FileText size={14} /> Revisar Manualmente
                                    </button>
                                )}
                                <button onClick={() => removeDraft(d.id)} style={{ background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '8px', width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Descartar Tese">
                                    <SvgIcons.X size={14} />
                                </button>
                            </div>

                            {!isExpanded ? (
                                // ==== MINI PREVIEW CADEIA COLAPSADA ====
                                <div style={{ paddingRight: '10rem', cursor: 'pointer' }} onClick={() => setExpandedDraftId(d.id)}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent)', marginBottom: '8px', textTransform: 'uppercase' }}>Tese {index + 1} • {d.tags?.length > 0 ? d.tags.slice(0, 2).join(' / ') : 'Geral'}</div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 900, marginBottom: '0.5rem', color: 'var(--text)' }}>{d.title || 'Sem Título (Clique para editar)'}</h3>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{d.summary}</p>
                                </div>
                            ) : (
                                // ==== EDITOR INLINE EXPANDIDO ====
                                <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeIn 0.3s' }}>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '1px' }}>Revisão de Tese #{index + 1}</div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                                        <div>
                                            <label className="form-label">Título da Tese *</label>
                                            <input className="form-input" value={d.title} onChange={e => updateDraft(d.id, { title: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="form-label">Resumo / Destaque Institucional *</label>
                                            <textarea className="form-input" rows={3} value={d.summary} onChange={e => updateDraft(d.id, { summary: e.target.value })} />
                                        </div>
                                    </div>

                                    <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--surface2)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                            <label className="form-label" style={{ marginBottom: 0, color: 'var(--text-2)' }}><SvgIcons.FileText size={14} /> Inteiro Teor preservado</label>
                                            <button type="button" onClick={() => updateDraft(d.id, { fullTextOrLink: formatLegalText(d.fullTextOrLink) })} className="btn" style={{ background: 'var(--accent)', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '4px 10px', height: 'auto', border: 'none', display: 'flex', gap: '6px' }}>
                                                <SvgIcons.Sparkles size={12} /> Separar Parágrafos Automaticamente
                                            </button>
                                        </div>
                                        <textarea className="form-input" rows={7} style={{ fontFamily: 'var(--font-mono), monospace', fontSize: '0.8rem' }} value={d.fullTextOrLink} onChange={e => updateDraft(d.id, { fullTextOrLink: e.target.value })} />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                                        <div><label className="form-label">Classe/Nº Processo</label><input className="form-input" value={d.processClass} onChange={e => updateDraft(d.id, { processClass: e.target.value })} /></div>
                                        <div><label className="form-label">Órgão Julgador</label><input className="form-input" value={d.organ} onChange={e => updateDraft(d.id, { organ: e.target.value })} /></div>
                                        <div><label className="form-label">Relator</label><input className="form-input" value={d.rapporteur} onChange={e => updateDraft(d.id, { rapporteur: e.target.value })} /></div>
                                        <div><label className="form-label">Data Julgamento</label><input className="form-input" type="date" value={d.judgmentDate || ''} onChange={e => updateDraft(d.id, { judgmentDate: e.target.value })} /></div>
                                        <div><label className="form-label">Data Publicação (DJe)</label><input className="form-input" type="date" value={d.publicationDate || ''} onChange={e => updateDraft(d.id, { publicationDate: e.target.value })} /></div>
                                    </div>

                                    <div>
                                        <label className="form-label">Tags Extraídas (Ramos do Direito / Assunto)</label>
                                        <input className="form-input" placeholder="Separe por vírgulas" value={d.tags?.join(', ') || ''} onChange={e => updateDraft(d.id, { tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
                                        <p style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: 4 }}>O sistema salvará essas tags. Edite-as se necessário.</p>
                                    </div>

                                    <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
                                        <button onClick={() => setExpandedDraftId(null)} className="btn" style={{ background: 'var(--text)', color: 'var(--bg)', fontWeight: 800 }}>
                                            <SvgIcons.Check size={16} /> Fechar e Confirmar Tese
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            {/* INVISIBLE BUTTON to insert new blank drafts manually if wanted */}
            {precedentsDrafts.length > 0 && (
                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <button onClick={() => pushAiDraftsToQueue([{}])} className="btn btn-ghost" style={{ fontSize: '0.8rem', fontWeight: 800 }}>
                        + Adicionar Formato Vazio
                    </button>
                </div>
            )}
        </div>
    );
}
