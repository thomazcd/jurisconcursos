'use client';
import { useState } from 'react';

interface PrecedentCardProps {
    precedent: {
        id: string;
        court: string;
        title: string;
        summary: string;
        fullTextOrLink?: string | null;
        applicability: string;
        tags: string[];
        createdAt: string;
        isRead: boolean;
        subject?: { name: string };
    };
    onToggleRead: (id: string, read: boolean) => void;
}

const COURT_BADGE: Record<string, string> = {
    STF: 'badge badge-stf',
    STJ: 'badge badge-stj',
};
const APPL_BADGE: Record<string, string> = {
    GERAL: 'badge badge-geral',
    JUIZ: 'badge badge-juiz',
    PROCURADOR: 'badge badge-proc',
    AMBOS: 'badge badge-ambos',
};
const APPL_LABEL: Record<string, string> = {
    GERAL: 'Geral',
    JUIZ: 'Juiz',
    PROCURADOR: 'Procurador',
    AMBOS: 'Ambos',
};

export function PrecedentCard({ precedent: p, onToggleRead }: PrecedentCardProps) {
    const [expanded, setExpanded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isRead, setIsRead] = useState(p.isRead);

    async function handleToggle() {
        setLoading(true);
        const next = !isRead;
        try {
            await fetch('/api/user/reads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ precedentId: p.id, read: next }),
            });
            setIsRead(next);
            onToggleRead(p.id, next);
        } finally {
            setLoading(false);
        }
    }

    const date = new Date(p.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

    return (
        <div className={`precedent-card ${isRead ? 'read' : 'unread'}`}>
            <div className="precedent-header">
                <div style={{ flex: 1 }}>
                    <div className="flex items-center gap-1" style={{ marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                        <span className={COURT_BADGE[p.court] ?? 'badge'}>{p.court}</span>
                        <span className={APPL_BADGE[p.applicability] ?? 'badge'}>{APPL_LABEL[p.applicability]}</span>
                        {!isRead && <span className="badge badge-unread" style={{ fontSize: '0.7rem' }}>Não lido</span>}
                        {isRead && <span className="badge badge-read" style={{ fontSize: '0.7rem' }}>✓ Lido</span>}
                    </div>
                    <div className="precedent-title">{p.title}</div>
                </div>
                <button
                    className={`btn-read-toggle ${isRead ? '' : 'unread'}`}
                    onClick={handleToggle}
                    disabled={loading}
                    title={isRead ? 'Marcar como não lido' : 'Marcar como lido'}
                    style={{ flexShrink: 0 }}
                >
                    {loading ? '…' : isRead ? '↩ Não lido' : '✓ Lido'}
                </button>
            </div>

            <p className="precedent-summary" style={{ display: expanded ? 'block' : '-webkit-box', WebkitLineClamp: expanded ? undefined : 2, WebkitBoxOrient: 'vertical', overflow: expanded ? 'visible' : 'hidden' }}>
                {p.summary}
            </p>

            {p.summary.length > 200 && (
                <button className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start', padding: '0 0' }} onClick={() => setExpanded(!expanded)}>
                    {expanded ? '▲ Ver menos' : '▼ Ver mais'}
                </button>
            )}

            <div className="precedent-meta">
                <span>📅 {date}</span>
                {p.subject && <span>• {p.subject.name}</span>}
                {p.fullTextOrLink && (
                    <span>• <a href={p.fullTextOrLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-h)' }}>Ver inteiro teor ↗</a></span>
                )}
            </div>

            {p.tags.length > 0 && (
                <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
                    {p.tags.map((t) => (
                        <span key={t} className="tag">{t}</span>
                    ))}
                </div>
            )}
        </div>
    );
}
