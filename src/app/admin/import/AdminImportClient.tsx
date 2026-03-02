'use client';
import React, { useState } from 'react';
import { Icons as SvgIcons } from '@/components/ui/Icons';
import { useRouter } from 'next/navigation';

export default function AdminImportClient() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);

    // Estrutura do Informativo Pai
    const [infCourt, setInfCourt] = useState('STJ');
    const [infNumber, setInfNumber] = useState('');
    const [infYear, setInfYear] = useState(new Date().getFullYear().toString());
    const [pubDate, setPubDate] = useState('');

    const [pdfLoading, setPdfLoading] = useState(false);
    const [importMode, setImportMode] = useState<'pdf' | 'text'>('pdf');
    const [rawBulkText, setRawBulkText] = useState('');
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Precedente sendo editado
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [fullText, setFullText] = useState('');

    // Metadados do Precedente
    const [processClass, setProcessClass] = useState('');
    const [processNumber, setProcessNumber] = useState('');
    const [organ, setOrgan] = useState('');
    const [rapporteur, setRapporteur] = useState('');
    const [judgmentDate, setJudgmentDate] = useState('');
    const [theme, setTheme] = useState('');

    // Flashcard
    const [flashcardQuestion, setFlashcardQuestion] = useState('');
    const [flashcardAnswer, setFlashcardAnswer] = useState(true);

    // Trilhas (Aplicabilidade multi-trilha)
    const [isGeral, setIsGeral] = useState(true);
    const [isPGE, setIsPGE] = useState(false);
    const [isFed, setIsFed] = useState(false);
    const [isEst, setIsEst] = useState(false);

    const [precedentsDrafts, setPrecedentsDrafts] = useState<any[]>([]);

    function handleAddDraft(e: React.FormEvent) {
        e.preventDefault();

        if (!title || !summary || !fullText) {
            alert('Título, Resumo (Tese) e Inteiro Teor são obrigatórios!');
            return;
        }

        const newPrecedent = {
            id: Date.now().toString(),
            title,
            summary,
            fullTextOrLink: fullText, // <-- Mantém as quebras de linha "\n\n" cruas do textarea!
            processClass, processNumber, organ, rapporteur, theme,
            judgmentDate: judgmentDate || null,
            flashcardQuestion, flashcardAnswer,
            forAll: isGeral,
            forProcurador: isPGE,
            forJuizFederal: isFed,
            forJuizEstadual: isEst,
        };

        setPrecedentsDrafts([newPrecedent, ...precedentsDrafts]);

        // Limpar os campos do precedente
        setTitle(''); setSummary(''); setFullText('');
        setProcessClass(''); setProcessNumber(''); setOrgan(''); setRapporteur('');
        setFlashcardQuestion(''); setTheme('');
    }

    function removeDraft(id: string) {
        setPrecedentsDrafts(precedentsDrafts.filter(d => d.id !== id));
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
                    informatory: { court: infCourt, number: infNumber, year: parseInt(infYear), publicationDate: pubDate || null },
                    precedents: precedentsDrafts
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
            const res = await fetch('/api/admin/gemini-pdf', {
                method: 'POST',
                body: formData
            });

            const rawText = await res.text();
            let data: any;
            try {
                data = JSON.parse(rawText);
            } catch (e) {
                console.error('Resposta não-JSON recebida:', rawText);
                throw new Error('O servidor demorou muito a responder ou retornou um formato inválido (timeout da Vercel).');
            }

            if (!res.ok) throw new Error(data?.error || 'Erro Gemini PDF');

            if (data.precedents && Array.isArray(data.precedents)) {
                const aiDrafts = data.precedents.map((p: any) => ({
                    id: Date.now().toString() + Math.random().toString(36).substring(7),
                    title: p.title || '',
                    summary: p.summary || '',
                    fullTextOrLink: p.fullText || '', // Gemini may return it without exact formatting, but we dump it
                    processClass: p.processClass || '',
                    processNumber: '', // usually merged in processClass by IA
                    organ: p.organ || '',
                    rapporteur: p.rapporteur || '',
                    judgmentDate: p.judgmentDate || null,
                    theme: p.theme || '',
                    flashcardQuestion: p.flashcardQuestion || '',
                    flashcardAnswer: p.flashcardAnswer !== undefined ? p.flashcardAnswer : true,
                    forAll: true,
                    forProcurador: false,
                    forJuizFederal: false,
                    forJuizEstadual: false,
                }));

                // Add to the top of the queue
                setPrecedentsDrafts(prev => [...aiDrafts, ...prev]);
                alert(`✨ Leitura concluída! ${aiDrafts.length} teses extraídas e adicionadas à fila para revisão.`);
            } else {
                alert('Nenhuma tese compreensível foi extraída. Verifique se o PDF tem formato de texto pesquisável.');
            }

        } catch (err: any) {
            console.error(err);
            alert(`Falha ao ler o PDF: ${err.message}`);
        } finally {
            setPdfLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = ''; // reset file
        }
    }

    async function handleBulkTextUpload() {
        if (!rawBulkText.trim()) return alert("Cole o texto do informativo primeiro.");

        setPdfLoading(true);
        try {
            const res = await fetch('/api/admin/gemini', { // We can reuse the JSON logic or similar
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: rawBulkText, isBulk: true })
            });

            const rawResponse = await res.text();
            let data: any;
            try { data = JSON.parse(rawResponse); } catch (e) { throw new Error("Erro no processamento da IA (Timeout ou Formato Inválido)."); }

            if (!res.ok) throw new Error(data?.error || 'Erro Gemini');

            const results = data.precedents || [data.suggestion]; // Handle both single and array returns
            const aiDrafts = (Array.isArray(results) ? results : [results]).map((p: any) => ({
                id: Date.now().toString() + Math.random().toString(36).substring(7),
                title: p.title || '',
                summary: p.summary || '',
                fullTextOrLink: p.fullText || p.fullTextOrLink || '',
                processClass: p.processClass || '',
                processNumber: '',
                organ: p.organ || '',
                rapporteur: p.rapporteur || '',
                judgmentDate: p.judgmentDate || null,
                theme: p.theme || '',
                flashcardQuestion: p.flashcardQuestion || '',
                flashcardAnswer: p.flashcardAnswer !== undefined ? p.flashcardAnswer : true,
                forAll: true,
                forProcurador: false,
                forJuizFederal: false,
                forJuizEstadual: false,
            }));

            setPrecedentsDrafts(prev => [...aiDrafts, ...prev]);
            setRawBulkText('');
            alert(`✨ Sucesso! ${aiDrafts.length} teses extraídas do texto e adicionadas para revisão.`);
        } catch (err: any) {
            console.error(err);
            alert(`Falha na extração por texto: ${err.message}`);
        } finally {
            setPdfLoading(false);
        }
    }

    async function handleGeminiFill() {
        if (!fullText) return alert("Cole o 'Inteiro Teor' ou pedaço do Acórdão na caixa primeiro para a IA ler.");
        setAiLoading(true);
        try {
            const res = await fetch('/api/admin/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: fullText }),
            });
            const rawText = await res.text();
            let data: any;
            try {
                data = JSON.parse(rawText);
            } catch (e) {
                console.error('Resposta não-JSON recebida:', rawText);
                throw new Error('O servidor demorou muito a responder ou retornou um formato inválido (timeout da Vercel).');
            }

            if (!res.ok) throw new Error(data?.error || 'Erro Gemini');

            const sug = data.suggestion;
            if (sug.title) setTitle(sug.title);
            if (sug.summary) setSummary(sug.summary);
            if (sug.flashcardQuestion) setFlashcardQuestion(sug.flashcardQuestion);
            if (sug.flashcardAnswer !== undefined) setFlashcardAnswer(sug.flashcardAnswer);
            if (sug.processClass) setProcessClass(sug.processClass);
            if (sug.organ) setOrgan(sug.organ);
            if (sug.rapporteur) setRapporteur(sug.rapporteur);
            if (sug.judgmentDate && sug.judgmentDate !== 'null') setJudgmentDate(sug.judgmentDate);
            if (sug.theme && sug.theme !== 'null') setTheme(sug.theme);

            alert('✨ IA preencheu os campos com sucesso! Revise antes de adicionar.');
        } catch (error: any) {
            console.error(error);
            alert(`Falha ao contactar Gemini: ${error.message}`);
        } finally {
            setAiLoading(false);
        }
    }

    return (
        <div style={{ paddingBottom: '3rem' }}>
            <div className="page-header" style={{ marginBottom: '1.5rem' }}>
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <SvgIcons.Sparkles size={24} /> O Importador Mágico (v2.0)
                    </h1>
                    <p className="page-subtitle">Publique novos Informativos mantendo a formatação perfeita (parágrafos do Inteiro Teor protejidos).</p>
                </div>
            </div>

            {/* Painel do Informativo (PAI) */}
            <div className="card" style={{ marginBottom: '2rem', border: '2px solid var(--border)' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text)', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                    1. Dados do Informativo (Fonte Única)
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
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
                        <label className="form-label">Data Pub. Info (Opcional)</label>
                        <input className="form-input" type="date" value={pubDate} onChange={e => setPubDate(e.target.value)} />
                    </div>
                </div>

                {/* BOTÃO MÁGICO DO PDF / TEXTO */}
                <div style={{ marginTop: '1.5rem', background: 'rgba(201, 138, 0, 0.05)', border: '1px dashed #c98a00', padding: '1.5rem', borderRadius: 12 }}>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                        <button type="button" onClick={() => setImportMode('pdf')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #c98a00', background: importMode === 'pdf' ? '#c98a00' : 'transparent', color: importMode === 'pdf' ? '#fff' : '#c98a00', fontWeight: 800, cursor: 'pointer' }}>Via Arquivo PDF</button>
                        <button type="button" onClick={() => setImportMode('text')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #c98a00', background: importMode === 'text' ? '#c98a00' : 'transparent', color: importMode === 'text' ? '#fff' : '#c98a00', fontWeight: 800, cursor: 'pointer' }}>Via Texto Copiado</button>
                    </div>

                    {importMode === 'pdf' ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ fontWeight: 800, color: '#a06e00', fontSize: '0.9rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}><SvgIcons.Brain size={16} /> Auto-Preencher com PDF</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Ideal para PDFs de até 15-20 páginas para evitar o limite de tempo do servidor.</div>
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
                            <div style={{ fontWeight: 800, color: '#a06e00', fontSize: '0.9rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><SvgIcons.Brain size={16} /> Colar Texto do Informativo Integrado</div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginBottom: '10px' }}>Copie o conteúdo do informativo no site do tribunal ou no seu leitor de PDF e cole abaixo. A IA vai separar todas as teses automaticamente.</p>
                            <textarea className="form-input" rows={6} value={rawBulkText} onChange={e => setRawBulkText(e.target.value)} placeholder="Cole aqui o texto bruto do informativo (pode ser o documento inteiro)..." style={{ background: '#fff', border: '1px solid #e2e8f0', marginBottom: '1rem' }} />
                            <button type="button" onClick={handleBulkTextUpload} disabled={pdfLoading || !rawBulkText} className="btn" style={{ width: '100%', background: '#a06e00', color: '#fff', fontWeight: 800, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                {pdfLoading ? <span className="spinner" style={{ width: 14, height: 14, borderColor: '#fff', borderTopColor: 'transparent' }} /> : <SvgIcons.Plus size={14} />}
                                {pdfLoading ? 'Processando Grandes Dados...' : 'Extrair Múltiplas Teses deste Texto'}
                            </button>
                        </div>
                    )}
                </div>
            </div>


            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

                {/* Painel do Precedente (FILHO) */}
                <div className="card">
                    <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text)', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                        2. Editor de Precedente
                        <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-3)' }}>(Adicionando no Info {infNumber || '?'})</span>
                    </h2>

                    <form onSubmit={handleAddDraft} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label className="form-label">Título da Tese *</label>
                            <input className="form-input" required placeholder="Ex: Tráfico de Drogas e Violação de Domicílio" value={title} onChange={e => setTitle(e.target.value)} />
                        </div>
                        <div>
                            <label className="form-label">Resumo / Destaque Institucional *</label>
                            <textarea className="form-input" required rows={3} placeholder="A entrada forçada..." value={summary} onChange={e => setSummary(e.target.value)} />
                        </div>

                        {/* O Coração da Proteção do Inteiro Teor */}
                        <div style={{ padding: '4px', border: '1px solid var(--accent)', borderRadius: '12px', background: 'rgba(20, 184, 166, 0.03)' }}>
                            <div style={{ padding: '12px' }}>
                                <label className="form-label" style={{ color: 'var(--accent)', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><SvgIcons.FileText size={16} /> 1. Cole aqui o Texto do Tribunal</span>

                                    <button type="button" onClick={handleGeminiFill} disabled={aiLoading || !fullText} className="btn" style={{ background: 'var(--accent)', color: '#fff', fontSize: '0.8rem', fontWeight: 800, padding: '4px 12px', border: 'none', display: 'flex', alignItems: 'center', gap: '4px', opacity: (aiLoading || !fullText) ? 0.6 : 1, cursor: (aiLoading || !fullText) ? 'not-allowed' : 'pointer' }}>
                                        {aiLoading ? <span className="spinner" style={{ width: 14, height: 14, borderColor: '#fff', borderTopColor: 'transparent' }} /> : <SvgIcons.Brain size={14} />}
                                        {aiLoading ? 'Pensando...' : '2. Extrair p/ Flashcard com IA'}
                                    </button>
                                </label>
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginBottom: '8px', lineHeight: '1.4' }}>Os parágrafos (\n) que você colar aqui serão integralmente preservados para leitura do Aluno.</p>
                                <textarea className="form-input" required rows={7} style={{ fontFamily: 'var(--font-mono), monospace', fontSize: '0.85rem' }} value={fullText} onChange={e => setFullText(e.target.value)} placeholder="Após colar a cópia fiel do inteiro teor, clique na Extração IA ali em cima ↗️ para ela formatar o restante." />
                            </div>
                        </div>

                        <div style={{ padding: '1rem', background: 'var(--surface2)', borderRadius: 12 }}>
                            <h3 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-2)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Flashcard Inteligente</h3>
                            <div style={{ marginBottom: '0.5rem' }}>
                                <label className="form-label">Frase para V ou F</label>
                                <textarea className="form-input" rows={2} value={flashcardQuestion} onChange={e => setFlashcardQuestion(e.target.value)} placeholder="É lícita a busca domiciliar feita às escuras se o policial jurar que sentiu cheiro." />
                            </div>
                            <div>
                                <label className="form-label">Resposta Certa</label>
                                <select className="form-input" value={flashcardAnswer ? 'true' : 'false'} onChange={e => setFlashcardAnswer(e.target.value === 'true')}>
                                    <option value="true">Verdadeiro (Correto)</option>
                                    <option value="false">Falso (Errado)</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label className="form-label">Classe/Processo</label>
                                <input className="form-input" placeholder="HC 123.456, AgRg no REsp" value={processClass} onChange={e => setProcessClass(e.target.value)} />
                            </div>
                            <div>
                                <label className="form-label">Tema RG</label>
                                <input className="form-input" placeholder="Tema 1081" value={theme} onChange={e => setTheme(e.target.value)} />
                            </div>
                            <div>
                                <label className="form-label">Relator</label>
                                <input className="form-input" placeholder="Min. Schietti" value={rapporteur} onChange={e => setRapporteur(e.target.value)} />
                            </div>
                            <div>
                                <label className="form-label">Órgão Julgador</label>
                                <input className="form-input" placeholder="3ª Seção" value={organ} onChange={e => setOrgan(e.target.value)} />
                            </div>
                            <div>
                                <label className="form-label">Data do Julgamento</label>
                                <input className="form-input" type="date" value={judgmentDate} onChange={e => setJudgmentDate(e.target.value)} />
                            </div>
                        </div>

                        <div style={{ margin: '1rem 0' }}>
                            <label className="form-label">Aparece para as Trilhas:</label>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.8rem' }}>
                                <label><input type="checkbox" checked={isGeral} onChange={e => setIsGeral(e.target.checked)} /> Geral (Todas)</label>
                                <label><input type="checkbox" checked={isPGE} onChange={e => setIsPGE(e.target.checked)} /> PGE</label>
                                <label><input type="checkbox" checked={isFed} onChange={e => setIsFed(e.target.checked)} /> J. Fed</label>
                                <label><input type="checkbox" checked={isEst} onChange={e => setIsEst(e.target.checked)} /> J. Est</label>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ height: '48px', fontSize: '1rem', fontWeight: 800 }}>
                            <SvgIcons.Plus size={18} /> Adicionar Tese à Fila ({precedentsDrafts.length})
                        </button>
                    </form>
                </div>

                {/* Painel de Preview e Fila (LISTA) */}
                <div>
                    <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text)', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        3. Revisão e Fila de Publicação
                        {precedentsDrafts.length > 0 && (
                            <button onClick={handlePublish} disabled={loading} className="btn" style={{ background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: 900 }}>
                                {loading ? 'Publicando...' : `Salvar Info ${infNumber} com ${precedentsDrafts.length} teses`}
                            </button>
                        )}
                    </h2>

                    {precedentsDrafts.length === 0 && (
                        <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-3)', border: '2px dashed var(--border)', borderRadius: 16 }}>
                            Nenhuma tese rascunhada para este informativo ainda.
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {precedentsDrafts.map(d => (
                            <div key={d.id} className="card" style={{ padding: '1rem', position: 'relative', borderLeft: '4px solid var(--accent)' }}>
                                <button onClick={() => removeDraft(d.id)} style={{ position: 'absolute', top: '10px', right: '10px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Remover"><SvgIcons.X size={14} /></button>

                                <div style={{ fontSize: '0.9rem', fontWeight: 900, marginBottom: '0.5rem', paddingRight: '2rem' }}>{d.title}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-2)', marginBottom: '1rem' }}>{d.summary}</div>

                                {d.fullTextOrLink && (
                                    <div style={{ background: 'var(--surface2)', padding: '0.75rem', borderRadius: 8, fontSize: '0.75rem', color: 'var(--text-2)', maxHeight: '150px', overflowY: 'auto' }}>
                                        <strong style={{ display: 'block', marginBottom: '4px', fontSize: '0.7rem' }}>Preview do Inteiro Teor (Como o Aluno Verá):</strong>
                                        <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)' }}>
                                            {d.fullTextOrLink}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
