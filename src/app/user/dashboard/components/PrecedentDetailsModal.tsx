import React from 'react';
import { Icons as SvgIcons } from '@/components/ui/Icons';
import { Precedent } from '../types';

interface PrecedentDetailsModalProps {
    selectedPrecedent: Precedent | null;
    setSelectedPrecedent: (val: Precedent | null) => void;
    setIsFocusMode: (val: boolean) => void;
    copyToClipboard: (text: string, id: string, e: React.MouseEvent) => void;
    copyingId: string | null;
}

export const PrecedentDetailsModal: React.FC<PrecedentDetailsModalProps> = ({
    selectedPrecedent, setSelectedPrecedent, setIsFocusMode, copyToClipboard, copyingId
}) => {
    const [fullData, setFullData] = React.useState<Precedent | null>(selectedPrecedent);
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        setFullData(selectedPrecedent);

        if (selectedPrecedent && selectedPrecedent.fullTextOrLink === undefined) {
            setLoading(true);
            fetch(`/api/user/precedents/${selectedPrecedent.id}`)
                .then(res => res.json())
                .then(data => {
                    setFullData(prev => ({ ...prev, ...data }));
                })
                .catch(err => console.error('Error fetching precedent details:', err))
                .finally(() => setLoading(false));
        }
    }, [selectedPrecedent]);

    if (!selectedPrecedent) return null;
    const p = fullData || selectedPrecedent;

    return (
        <div className="modal-overlay" onClick={() => { setSelectedPrecedent(null); setIsFocusMode(false); }}>
            <div className="modal-content" style={{ maxWidth: '650px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '24px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }} onClick={e => e.stopPropagation()}>
                <div className="modal-header" style={{ position: 'relative', justifyContent: 'center', padding: '1rem', borderBottom: '1px solid var(--border)' }}>
                    <h2 style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--text-3)', textAlign: 'center', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}><SvgIcons.Search size={14} /> Detalhes do Julgado</h2>
                    <button
                        onClick={() => { setSelectedPrecedent(null); setIsFocusMode(false); }}
                        className="btn-close"
                        style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', padding: 8, background: 'var(--surface2)', borderRadius: '50%' }}
                    ><SvgIcons.X size={16} /></button>
                </div>

                <div className="modal-body" style={{ overflowY: 'auto', padding: '1.25rem 1.75rem', fontSize: '0.9rem' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{
                            fontSize: '1.2rem',
                            fontWeight: 900,
                            color: 'var(--text)',
                            marginBottom: '1rem',
                            lineHeight: '1.3',
                            letterSpacing: '-0.01em',
                            display: 'block',
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word'
                        }}>{p.theme?.includes('|') ? p.theme.split('|')[1].trim() : p.title}</h3>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                            gap: '1rem',
                            padding: '1.25rem',
                            background: 'var(--surface2)',
                            borderRadius: 12,
                            fontSize: '0.8rem',
                            color: 'var(--text-2)',
                            border: '1px solid var(--border)',
                            marginBottom: '1.5rem'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <strong style={{ color: 'var(--text-3)', display: 'inline-flex', alignItems: 'center', gap: '4px', minWidth: '85px' }}>
                                    <SvgIcons.Pin size={12} /> Tema:
                                </strong>
                                <span>{(p.theme?.includes('|') && p.theme.split('|')[0].trim()) || 'Não afetado'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <strong style={{ color: 'var(--text-3)', display: 'inline-flex', alignItems: 'center', gap: '4px', minWidth: '85px' }}>
                                    <SvgIcons.Landmark size={12} /> Tribunal:
                                </strong>
                                <span>{p.court}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <strong style={{ color: 'var(--text-3)', display: 'inline-flex', alignItems: 'center', gap: '4px', minWidth: '85px' }}>
                                    <SvgIcons.FileText size={12} /> Informativo:
                                </strong>
                                <span>{p.informatoryNumber}{p.informatoryYear ? `/${p.informatoryYear}` : ''}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <strong style={{ color: 'var(--text-3)', display: 'inline-flex', alignItems: 'center', gap: '4px', minWidth: '85px' }}>
                                    <SvgIcons.Scale size={12} /> Processo:
                                </strong>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span>{[p.processClass, p.processNumber].filter(Boolean).join(' ') || '---'}</span>
                                    {p.processNumber && (
                                        <button
                                            onClick={(e) => copyToClipboard(p.processNumber || '', 'modal-' + p.id, e)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                border: '1px solid var(--border)',
                                                background: 'var(--surface2)',
                                                padding: '2px 8px',
                                                borderRadius: '6px',
                                                color: copyingId === 'modal-' + p.id ? 'var(--accent)' : 'var(--text-3)',
                                                fontSize: '0.65rem',
                                                fontWeight: 900,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                            title="Copiar número do processo"
                                        >
                                            {copyingId === 'modal-' + p.id ? (
                                                <><SvgIcons.Check size={10} /> número do processo copiado</>
                                            ) : (
                                                <><SvgIcons.Copy size={10} /> Copiar</>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <strong style={{ color: 'var(--text-3)', display: 'inline-flex', alignItems: 'center', gap: '4px', minWidth: '85px' }}>
                                    <SvgIcons.User size={12} /> Relator:
                                </strong>
                                <span>{p.rapporteur || '---'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <strong style={{ color: 'var(--text-3)', display: 'inline-flex', alignItems: 'center', gap: '4px', minWidth: '85px' }}>
                                    <SvgIcons.Gavel size={12} /> Órgão:
                                </strong>
                                <span>{p.organ || '---'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <strong style={{ color: 'var(--text-3)', display: 'inline-flex', alignItems: 'center', gap: '4px', minWidth: '85px' }}>
                                    <SvgIcons.Calendar size={12} /> Publicação:
                                </strong>
                                <span>{p.publicationDate ? new Date(p.publicationDate).toLocaleDateString('pt-BR') : '--'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <strong style={{ color: 'var(--text-3)', display: 'inline-flex', alignItems: 'center', gap: '4px', minWidth: '85px' }}>
                                    <SvgIcons.Scale size={12} /> Julgamento:
                                </strong>
                                <span>{p.judgmentDate ? new Date(p.judgmentDate).toLocaleDateString('pt-BR') : '---'}</span>
                            </div>
                        </div>

                        <div style={{
                            fontSize: '0.65rem',
                            fontWeight: 900,
                            color: 'var(--text-3)',
                            textTransform: 'uppercase',
                            marginBottom: '4px',
                            letterSpacing: '0.05em'
                        }}>
                            DESTAQUE:
                        </div>
                        <div style={{
                            fontSize: '0.92em',
                            fontWeight: 700,
                            color: 'var(--text-2)',
                            marginBottom: '1.5rem',
                            lineHeight: '1.5'
                        }}>
                            {p.summary}
                        </div>

                        {loading && (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-3)' }}>
                                <div className="skeleton-box" style={{ height: '20px', width: '60%', marginBottom: '1rem', borderRadius: 4 }} />
                                <div className="skeleton-box" style={{ height: '20px', width: '80%', marginBottom: '1rem', borderRadius: 4 }} />
                                <div className="skeleton-box" style={{ height: '20px', width: '100%', marginBottom: '1rem', borderRadius: 4 }} />
                                <p style={{ fontSize: '0.75rem', fontWeight: 600 }}>Carregando conteúdo completo...</p>
                            </div>
                        )}

                        {!loading && p.fullTextOrLink && !p.fullTextOrLink.startsWith('http') && (
                            <>
                                <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <SvgIcons.FileText size={12} /> INFORMAÇÕES DO INTEIRO TEOR:
                                </div>
                                <div style={{
                                    fontSize: '0.85em',
                                    color: 'var(--text-2)',
                                    lineHeight: '1.7',
                                    padding: '0',
                                    textAlign: 'justify',
                                    hyphens: 'auto'
                                }}>
                                    {p.fullTextOrLink.split('\n').map((line, i) => (
                                        <p key={i} style={{ marginBottom: line.trim() ? '1.2em' : '0' }}>{line}</p>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="modal-footer" style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)', padding: '1rem', borderRadius: '0 0 24px 24px', justifyContent: 'center' }}>
                    {!loading && p.fullTextOrLink && p.fullTextOrLink.startsWith('http') && (
                        <a href={p.fullTextOrLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm" style={{ minWidth: '150px', display: 'flex', alignItems: 'center', gap: '8px' }}><SvgIcons.ExternalLink size={16} /> Ver Inteiro Teor Online</a>
                    )}
                    {(!loading) && (
                        <button onClick={() => setSelectedPrecedent(null)} className="btn btn-ghost" style={{ fontSize: '0.8rem', fontWeight: 800 }}>Fechar Detalhes</button>
                    )}
                </div>
            </div>
        </div>
    );
};
