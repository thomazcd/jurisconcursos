import React from 'react';
import { Icons as SvgIcons } from '@/components/ui/Icons';

interface NotesModalProps {
    notesModal: { id: string, notes: string | null } | null;
    setNotesModal: (val: { id: string, notes: string | null } | null) => void;
    saveNote: (id: string, notes: string) => void;
}

export const NotesModal: React.FC<NotesModalProps> = ({ notesModal, setNotesModal, saveNote }) => {
    if (!notesModal) return null;

    return (
        <div className="modal-overlay" onClick={() => setNotesModal(null)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="modal-content-animated" onClick={e => e.stopPropagation()} style={{ width: '90%', maxWidth: '500px', padding: '2rem', borderRadius: '24px', background: 'var(--surface)', border: '1px solid var(--border-strong)', boxShadow: '0 30px 60px rgba(0,0,0,0.3)', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '10px' }}><SvgIcons.MessageSquare size={24} /> Minhas Anotações</h3>
                    <button onClick={() => setNotesModal(null)} style={{ border: 'none', background: 'var(--surface2)', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontWeight: 900, display: 'flex', alignItems: 'center', justifySelf: 'center', padding: 8 }}><SvgIcons.X size={16} /></button>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-3)', marginBottom: '1rem', lineHeight: '1.4' }}>
                    Escreva mnemônicos, observações ou pontos importantes para revisar depois.
                </p>

                <textarea
                    autoFocus
                    value={notesModal.notes || ''}
                    onChange={(e) => setNotesModal({ ...notesModal, notes: e.target.value })}
                    placeholder="Digite sua nota aqui..."
                    style={{
                        width: '100%',
                        height: '200px',
                        padding: '1rem',
                        borderRadius: '12px',
                        border: '2px solid var(--border)',
                        background: 'var(--surface2)',
                        color: 'var(--text)',
                        fontSize: '0.95rem',
                        lineHeight: '1.6',
                        resize: 'none',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
                />

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                    <button
                        onClick={() => {
                            saveNote(notesModal.id, notesModal.notes || '');
                            setNotesModal(null);
                        }}
                        className="btn btn-primary"
                        style={{ flex: 1, height: '45px', borderRadius: '12px', fontWeight: 800 }}
                    >
                        Salvar Nota
                    </button>
                    <button
                        onClick={() => setNotesModal(null)}
                        className="btn btn-ghost"
                        style={{ flex: 1, height: '45px', borderRadius: '12px', fontWeight: 700 }}
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};
