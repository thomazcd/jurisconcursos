'use client';

export function Logo({ size = 'medium', showText = true, vertical = false }: { size?: 'small' | 'medium' | 'large', showText?: boolean, vertical?: boolean }) {
    const iconSize = size === 'small' ? 32 : size === 'large' ? 68 : 46;
    const fontSize = size === 'small' ? '1.1rem' : size === 'large' ? '2.2rem' : '1.5rem';
    const subFontSize = size === 'small' ? '0.5rem' : size === 'large' ? '0.75rem' : '0.65rem';

    return (
        <div className="logo-container" style={{
            display: 'flex',
            flexDirection: vertical ? 'column' : 'row',
            alignItems: 'center',
            gap: vertical ? '0.85rem' : '1rem',
            textAlign: vertical ? 'center' : 'left',
            cursor: 'pointer',
            transition: 'transform 0.2s ease-in-out'
        }}>
            {/* Ícone Estilizado Premium */}
            <div style={{
                width: iconSize,
                height: iconSize,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
            }}>
                {/* Outer Glow Ring */}
                <div style={{
                    position: 'absolute',
                    inset: '-6px',
                    background: 'conic-gradient(from 0deg, var(--accent), #3b82f6, #8b5cf6, var(--accent))',
                    borderRadius: '38%',
                    opacity: 0.25,
                    filter: 'blur(10px)',
                    animation: 'spin 8s linear infinite'
                }} />

                {/* Main Hexagonal / Organic Shape */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                    borderRadius: '32%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 24px rgba(20,184,166,0.4)',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.2)'
                }}>
                    {/* Inner Gradient Shine */}
                    <div style={{
                        position: 'absolute',
                        top: '-50%',
                        left: '-50%',
                        width: '200%',
                        height: '200%',
                        background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
                        transform: 'rotate(45deg)'
                    }} />

                    <svg width={iconSize * 0.55} height={iconSize * 0.55} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'relative', zIndex: 1 }}>
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="white" fillOpacity="0.15" />
                        <path d="M12 2L3 7V12C3 17.5 7 21 12 22C17 21 21 17.5 21 12V7L12 2Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>

            {showText && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                    <div style={{
                        fontWeight: 950,
                        fontSize: fontSize,
                        color: 'var(--text)',
                        letterSpacing: '-0.06em',
                        lineHeight: 0.9,
                        marginTop: '2px',
                        display: 'flex',
                        alignItems: 'baseline'
                    }}>
                        <span style={{
                            background: 'linear-gradient(to bottom, var(--text) 20%, var(--text-2) 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>Juris</span>
                        <span style={{
                            width: 6,
                            height: 6,
                            background: 'var(--accent)',
                            borderRadius: '50%',
                            marginLeft: 2,
                            boxShadow: '0 0 10px var(--accent)'
                        }} />
                    </div>
                    <div style={{
                        fontWeight: 800,
                        fontSize: subFontSize,
                        color: 'var(--text-3)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.4em',
                        marginTop: '4px',
                        opacity: 0.8,
                        marginLeft: '1px'
                    }}>
                        CONCURSOS
                    </div>
                </div>
            )}

            <style jsx>{`
                .logo-container:hover { transform: scale(1.02); }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
