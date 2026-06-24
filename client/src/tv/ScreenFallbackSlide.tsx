interface Props {
  message?: string;
  type?: 'empty' | 'error' | 'loading';
}

export function ScreenFallbackSlide({ message, type = 'empty' }: Props) {
  const messages: Record<string, string> = {
    empty: 'Er zijn nog geen recente reviews beschikbaar.',
    error: 'De schermdata wordt momenteel vernieuwd.',
    loading: 'Even geduld…',
  };

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        background: '#005eb8',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decoratieve achtergrond */}
      <svg
        style={{ position: 'absolute', left: 0, bottom: 0, width: 600, height: 400 }}
        viewBox="0 0 600 400"
      >
        <polygon points="0,400 600,0 0,0" fill="rgba(255,255,255,0.04)" />
      </svg>

      <div style={{ textAlign: 'center', maxWidth: 800 }}>
        <div style={{ fontSize: 72, marginBottom: 40, opacity: 0.3 }}>
          {type === 'loading' ? '⏳' : type === 'error' ? '📡' : '💬'}
        </div>
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: '#ffffff',
            lineHeight: 1.3,
            marginBottom: 24,
            opacity: 0.7,
          }}
        >
          {message ?? messages[type]}
        </div>
        <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.4)' }}>
          Logistiekconcurrent.nl
        </div>
      </div>
    </div>
  );
}
