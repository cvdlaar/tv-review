interface Props {
  imageUrl: string | null | undefined;
  alt?: string;
  width?: number;
  height?: number;
}

export function ProductImageElement({ imageUrl, alt = 'Product', width = 640, height = 640 }: Props) {
  if (!imageUrl) {
    return (
      <div
        style={{
          width,
          height,
          background: 'rgba(255,255,255,0.1)',
          borderRadius: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <svg width={80} height={80} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={1}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 20 }}>Geen afbeelding</span>
      </div>
    );
  }

  return (
    <div
      style={{
        width,
        height,
        borderRadius: 24,
        overflow: 'hidden',
        background: 'rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <img
        src={imageUrl}
        alt={alt}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
          display: 'block',
        }}
      />
    </div>
  );
}
