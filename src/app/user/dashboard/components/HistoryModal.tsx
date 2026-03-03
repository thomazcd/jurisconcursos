import React from 'react';
import { Icons as SvgIcons } from '@/components/ui/Icons';

interface HistoryModalProps {
    historyModal: { id: string, events: string[] } | null;
    setHistoryModal: (val: { id: string, events: string[] } | null) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ historyModal, setHistoryModal }) => {
    if (!historyModal) return null;

    return (
        <div className="modal-overlay" style={{ zIndex: 30000 }} onClick={() => setHistoryModal(null)}>
            <div className="modal-content-animated" onClick={e => e.stopPropagation()} style={{
                background: 'var(--surface)',
                border: '1px solid var(--border-strong)',
                borderRadius: 20,
                padding: '1.5rem',
                maxWidth: '320px',
                width: 'calc(100% - 2rem)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
                position: 'relative'
            }}>
                <button onClick={() => setHistoryModal(null)} style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'var(--surface2)', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <SvgIcons.History size={18} style={{ color: 'var(--accent)' }} /> Histórico de Leitura
                </h3>
                <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
                    {historyModal.events.length > 0 ? [...historyModal.events].reverse().map((e, idx) => (
                        <div key={idx} style={{
                            padding: '8px 12px',
                            background: 'var(--surface2)',
                            borderRadius: 10,
                            fontSize: '0.85rem',
                            border: '1px solid var(--border)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span style={{ fontWeight: 700, color: 'var(--accent)' }}>#{historyModal.events.length - idx}</span>
                            <span style={{ color: 'var(--text)' }}>
                                {new Date(e).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    )) : (
                        <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-3)', fontSize: '0.9rem' }}>Nenhum evento registrado.</div>
                    )}
                </div>
            </div>
        </div>
    );
};
