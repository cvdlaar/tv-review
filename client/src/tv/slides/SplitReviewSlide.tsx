import { ShopReview, Brand, StyleOverride } from '../../types';
import { StarRatingElement } from '../elements/StarRatingElement';
import { resolveBackground } from '../slideStyle';

interface Props {
  positiveReview: ShopReview;
  improvementReview: ShopReview;
  brand: Brand | null;
  styleOverride?: StyleOverride;
}

function truncate(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars).replace(/\s+\S*$/, '') + ' …';
}

export function SplitReviewSlide({ positiveReview, improvementReview, brand, styleOverride }: Props) {
  const primary = styleOverride?.primaryColor ?? brand?.primaryColor ?? '#005eb8';
  const accent  = styleOverride?.accentColor  ?? brand?.accentColor  ?? '#e57200';
  const hasImage = styleOverride?.backgroundType === 'image' && styleOverride.backgroundImage;
  const overlayOp = (styleOverride?.backgroundOverlayOpacity ?? 50) / 100;
  const bg = resolveBackground(styleOverride, primary);

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        ...bg,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'Rethink Sans, sans-serif',
      }}
    >
      {hasImage && (
        <>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${styleOverride!.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0 }} />
          <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${overlayOp})`, zIndex: 1 }} />
        </>
      )}

      {/* Rechterhelft lichter blauw */}
      <svg
        style={{ position: 'absolute', left: 0, top: 0, width: 1920, height: 1080 }}
        viewBox="0 0 1920 1080"
        preserveAspectRatio="none"
      >
        <polygon points="920,0 1920,0 1920,1080 980,1080" fill="rgba(255,255,255,0.07)" />
      </svg>

      {/* Diagonale middenscheider */}
      <svg
        style={{ position: 'absolute', left: 0, top: 0, width: 1920, height: 1080 }}
        viewBox="0 0 1920 1080"
        preserveAspectRatio="none"
      >
        <polygon points="930,0 990,0 950,1080 890,1080" fill={accent} />
      </svg>

      {/* Centraal logo / merk */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 32,
          textAlign: 'center',
          fontSize: 24,
          fontWeight: 700,
          color: 'rgba(255,255,255,0.55)',
          letterSpacing: 0.5,
          zIndex: 10,
        }}
      >
        {brand?.name ? `${brand.name} · Klantfeedback` : 'Klantfeedback'}
      </div>

      {/* LINKERKANT — Positief */}
      <div
        style={{
          position: 'absolute',
          left: 72,
          top: 100,
          width: 780,
        }}
      >
        {/* Label */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: accent,
            color: '#fff',
            padding: '7px 20px',
            borderRadius: 100,
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            marginBottom: 28,
          }}
        >
          ★ Dit gaat goed
        </div>

        <div style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.05, marginBottom: 24 }}>
          <span style={{ color: '#fff' }}>Dit gaat </span>
          <span style={{ color: accent }}>goed</span>
        </div>

        <div style={{ marginBottom: 28 }}>
          <StarRatingElement rating={positiveReview.rating} size={42} color={accent} />
        </div>

        <div
          style={{
            fontSize: 40,
            color: '#ffffff',
            fontStyle: 'italic',
            fontWeight: 400,
            lineHeight: 1.45,
            marginBottom: 36,
          }}
        >
          &ldquo;{truncate(positiveReview.reviewText, 180)}&rdquo;
        </div>

        <div style={{ fontSize: 24, fontWeight: 600, color: 'rgba(255,255,255,0.75)' }}>
          {positiveReview.customerName ?? 'Anonieme klant'}
        </div>
      </div>

      {/* RECHTERKANT — Verbeterpunt */}
      <div
        style={{
          position: 'absolute',
          left: 1060,
          top: 100,
          width: 780,
        }}
      >
        {/* Label */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(255,255,255,0.15)',
            color: '#fff',
            padding: '7px 20px',
            borderRadius: 100,
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            marginBottom: 28,
          }}
        >
          ↑ Dit kan beter
        </div>

        <div style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.05, marginBottom: 24 }}>
          <span style={{ color: '#fff' }}>Dit </span>
          <span style={{ color: accent }}>kan</span>
          <span style={{ color: '#fff' }}> beter</span>
        </div>

        <div style={{ marginBottom: 28 }}>
          <StarRatingElement rating={improvementReview.rating} size={42} color="rgba(255,255,255,0.5)" />
        </div>

        <div
          style={{
            fontSize: 40,
            color: 'rgba(255,255,255,0.88)',
            fontStyle: 'italic',
            fontWeight: 400,
            lineHeight: 1.45,
            marginBottom: 36,
          }}
        >
          &ldquo;{truncate(improvementReview.reviewText, 180)}&rdquo;
        </div>

        <div style={{ fontSize: 24, fontWeight: 600, color: 'rgba(255,255,255,0.65)' }}>
          {improvementReview.customerName ?? 'Anonieme klant'}
        </div>
      </div>

      {/* Onderste balk */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 6,
          background: `linear-gradient(to right, ${accent}, ${primary}, ${accent})`,
        }}
      />

      {/* Propositie onderaan */}
      <div
        style={{
          position: 'absolute',
          bottom: 28,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontSize: 20,
          fontWeight: 500,
          color: 'rgba(255,255,255,0.45)',
          letterSpacing: 0.3,
        }}
      >
        Zodat onze klanten lekker door kunnen
      </div>
    </div>
  );
}
