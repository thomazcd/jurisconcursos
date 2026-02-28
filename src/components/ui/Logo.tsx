'use client';

export function Logo({ size = 'medium', showText = true, vertical = false }: { size?: 'small' | 'medium' | 'large', showText?: boolean, vertical?: boolean }) {
    const iconSize = size === 'small' ? 30 : size === 'large' ? 60 : 40;
    const fontSize = size === 'small' ? '0.9rem' : size === 'large' ? '1.8rem' : '1.2rem';
    const subFontSize = size === 'small' ? '0.55rem' : size === 'large' ? '0.8rem' : '0.65rem';

    return (
        <div style={{
            display: 'flex',
            flexDirection: vertical ? 'column' : 'row',
            alignItems: 'center',
            gap: vertical ? '0.75rem' : '0.85rem',
            textAlign: vertical ? 'center' : 'left'
        }}>
            {/* Ícone Estilizado */}
            <div style={{
                width: iconSize,
                height: iconSize,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
            }}>
                {/* Background Glow */}
                <div style={{
                    position: 'absolute',
                    inset: '-4px',
                    background: 'linear-gradient(135deg, var(--accent) 0%, #0ea5e9 100%)',
                    borderRadius: iconSize / 2.8,
                    opacity: 0.15,
                    filter: 'blur(8px)',
                }} />

                {/* Shape Principal */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(135deg, var(--accent) 0%, #0ea5e9 100%)',
                    borderRadius: iconSize / 2.8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(20,184,166,0.3)',
                    transform: 'rotate(-2deg)',
                }}>
                    <svg width={iconSize * 0.6} height={iconSize * 0.6} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L3 7V12C3 17.5 7 21 12 22C17 21 21 17.5 21 12V7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="rgba(255,255,255,0.1)" />
                        <path d="M9 12L12 15L15 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>

            {showText && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: vertical ? '2px' : '0' }}>
                    <div style={{
                        fontWeight: 900,
                        fontSize: fontSize,
                        color: 'var(--text)',
                        letterSpacing: '-0.04em',
                        lineHeight: 1,
                        background: 'linear-gradient(to right, var(--text), var(--text-2))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        Juris
                    </div>
                    <div style={{
                        fontWeight: 800,
                        fontSize: subFontSize,
                        color: 'var(--accent)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.15em',
                        lineHeight: 1.1,
                        opacity: 0.9
                    }}>
                        Concursos
                    </div>
                </div>
            )}
        </div>
    );
}
