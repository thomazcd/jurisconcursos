'use client';
import React, { useState } from 'react';
import { Icons as SvgIcons } from '@/components/ui/Icons';
import { useRouter } from 'next/navigation';

export default function AdminImportClient() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Estrutura do Informativo Pai
    const [infCourt, setInfCourt] = useState('STJ');
    const [infNumber, setInfNumber] = useState('');
    const [infYear, setInfYear] = useState(new Date().getFullYear().toString());
    const [pubDate, setPubDate] = useState('');

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
                        <div>
                            <label className="form-label" style={{ color: 'var(--accent)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <SvgIcons.FileText size={16} /> Inteiro Teor Protegido *
                            </label>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginBottom: '6px' }}>Cole o texto corrido do tribunal aqui. Os parágrafos (Espaces) serão preservados exatamente como você vê abaixo para os alunos.</p>
                            <textarea className="form-input" required rows={10} style={{ fontFamily: 'var(--font-mono), monospace', fontSize: '0.85rem' }} value={fullText} onChange={e => setFullText(e.target.value)} placeholder="Cole o Inteiro Teor aqui..." />
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
