import React from 'react';
import { Icons as SvgIcons } from '@/components/ui/Icons';

interface FocusModeOverlayProps {
    isFocusMode: boolean;
    setIsFocusMode: (val: boolean) => void;
    compactMode: boolean;
    setCompactMode: (val: boolean | ((prev: boolean) => boolean)) => void;
    setFontSize: (val: number | ((prev: number) => number)) => void;
    toggleTheme: () => void;
    isDark: boolean;
}

export const FocusModeOverlay: React.FC<FocusModeOverlayProps> = ({
    isFocusMode, setIsFocusMode, compactMode, setCompactMode, setFontSize, toggleTheme, isDark
}) => {
    if (!isFocusMode) return null;

    return (
        <div style={{
            position: 'fixed',
            top: '0.75rem',
            right: '1rem',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '6px 10px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            opacity: 0.6,
            transition: 'opacity 0.2s',
        }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}
        >
            <button
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={() => setIsFocusMode(false)}
                title="Sair do Modo Foco"
            >
                <SvgIcons.Minimize2 size={14} /> Sair Foco
            </button>

            <button
                onClick={toggleTheme}
                style={{
                    background: 'var(--surface2)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--text-3)',
                    transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                title={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
            >
                {isDark ? <SvgIcons.Sun size={18} /> : <SvgIcons.Moon size={18} />}
            </button>

            <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 2px' }} />

            <button
                className={`btn btn-sm ${compactMode ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                onClick={() => setCompactMode(c => !c)}
                title={compactMode ? 'Voltar ao modo completo' : 'Modo compacto: só título e tese'}
            >{compactMode ? <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><SvgIcons.Layout size={14} /> Completo</span> : <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><SvgIcons.Minimize2 size={14} /> Compacto</span>}</button>

            <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 2px' }} />

            <button className="btn btn-ghost btn-xs" style={{ fontSize: '0.75rem' }} onClick={() => setFontSize(f => Math.max(10, f - 1))} title="Diminuir fonte">A-</button>
            <button className="btn btn-ghost btn-xs" style={{ fontSize: '0.75rem' }} onClick={() => setFontSize(f => Math.min(24, f + 1))} title="Aumentar fonte">A+</button>
        </div>
    );
};
