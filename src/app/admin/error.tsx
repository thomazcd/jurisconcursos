'use client';

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
            <h2 style={{ color: 'red' }}>Erro no painel Admin</h2>
            <p><strong>Mensagem:</strong> {error.message}</p>
            <p><strong>Digest:</strong> {error.digest}</p>
            <pre style={{ background: '#f4f4f4', padding: '1rem', borderRadius: '8px', overflow: 'auto', fontSize: '0.8rem' }}>
                {error.stack}
            </pre>
            <button onClick={reset} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
                Tentar novamente
            </button>
        </div>
    );
}
