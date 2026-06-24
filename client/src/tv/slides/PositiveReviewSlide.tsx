import { ShopReview, Brand, StyleOverride } from '../../types';
import { StarRatingElement } from '../elements/StarRatingElement';
import { resolveBackground, reviewFontSize, reviewMaxChars } from '../slideStyle';

interface Props {
  review: ShopReview;
  brand: Brand | null;
  styleOverride?: StyleOverride;
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, '') + ' …';
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function PositiveReviewSlide({ review, brand, styleOverride }: Props) {
  const primary  = styleOverride?.primaryColor ?? brand?.primaryColor ?? '#005eb8';
  const accent   = styleOverride?.accentColor  ?? brand?.accentColor  ?? '#e57200';
  const starClr  = styleOverride?.starColor    ?? accent;
  const reviewClr  = styleOverride?.reviewTextColor ?? '#ffffff';
  const authorClr  = styleOverride?.authorTextColor ?? 'rgba(255,255,255,0.80)';
  const offsetX  = styleOverride?.reviewOffsetX ?? 0;
  const offsetY  = styleOverride?.reviewOffsetY ?? 0;
  const bg       = resolveBackground(styleOverride, primary);
  const hasImage = styleOverride?.backgroundType === 'image' && styleOverride.backgroundImage;
  const overlayOpacity = (styleOverride?.backgroundOverlayOpacity ?? 50) / 100;
  const maxW     = styleOverride?.reviewMaxWidth ?? 980;
  const maxH     = styleOverride?.reviewMaxHeight;

  return (
    <div style={{ width: 1920, height: 1080, ...bg, position: 'relative', overflow: 'hidden', fontFamily: 'Rethink Sans, sans-serif' }}>

      {/* Achtergrondafbeelding */}
      {hasImage && (
        <>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${styleOverride!.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0 }} />
          <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${overlayOpacity})`, zIndex: 1 }} />
        </>
      )}

      {/* Decoratieve vlakken */}
      <svg style={{ position: 'absolute', right: 0, top: 0, width: 760, height: 1080, zIndex: 2 }} viewBox="0 0 760 1080" preserveAspectRatio="none">
        <polygon points="280,0 760,0 760,1080 0,1080" fill="rgba(255,255,255,0.055)" />
        <polygon points="480,0 760,0 760,1080 260,1080" fill="rgba(255,255,255,0.04)" />
      </svg>

      {/* Accent driehoek rechtsonder */}
      <svg style={{ position: 'absolute', right: 0, bottom: 0, width: 560, height: 340, zIndex: 2 }} viewBox="0 0 560 340">
        <polygon points="0,340 560,0 560,340" fill={accent} opacity="0.9" />
      </svg>

      {/* Bovenste streep */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 200, height: 8, background: accent, zIndex: 3 }} />

      {/* Merknaam rechtsboven */}
      <div style={{ position: 'absolute', right: 80, top: 56, color: 'rgba(255,255,255,0.70)', fontSize: 24, fontWeight: 700, letterSpacing: 0.5, zIndex: 30 }}>
        {brand?.name ?? ''}
      </div>

      {/* Propositie rechtsonder */}
      <div style={{ position: 'absolute', right: 90, bottom: 160, fontSize: 22, fontWeight: 600, color: 'rgba(255,255,255,0.90)', textAlign: 'right', zIndex: 30, letterSpacing: 0.3 }}>
        Zodat onze klanten<br />lekker door kunnen
      </div>

      {/* Hoofdcontent — verticaal gecentreerd, offset schuift vanuit het midden */}
      <div style={{
        position: 'absolute',
        left: 96 + offsetX,
        top: 0,
        height: 1080,
        maxWidth: maxW,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 0,
        zIndex: 3,
        transform: offsetY !== 0 ? `translateY(${offsetY}px)` : undefined,
      }}>
        {/* Badge */}
        <div style={{ background: accent, color: '#fff', padding: '10px 28px', borderRadius: 100, fontSize: 22, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start', marginBottom: 28 }}>
          <span>★</span><span>Klantfeedback</span>
        </div>

        {/* Hoofdkop */}
        <div style={{ fontSize: 92, fontWeight: 900, lineHeight: 1.05, letterSpacing: -1, marginBottom: 24 }}>
          {styleOverride?.headingText ? (
            <span style={{ color: '#ffffff' }}>{styleOverride.headingText}</span>
          ) : (
            <><span style={{ color: '#ffffff' }}>Dit gaat </span><span style={{ color: accent }}>goed</span></>
          )}
        </div>

        {/* Accent lijn */}
        <div style={{ width: 80, height: 6, background: accent, borderRadius: 3, marginBottom: 28 }} />

        {/* Sterren */}
        <div style={{ marginBottom: 36 }}>
          <StarRatingElement rating={review.rating} size={52} color={starClr} />
        </div>

        {/* Review quote */}
        <div style={{ fontSize: reviewFontSize(styleOverride), color: reviewClr, fontStyle: 'italic', fontWeight: 400, lineHeight: 1.45, opacity: 0.95, marginBottom: 36, maxHeight: maxH, overflow: maxH ? 'hidden' : undefined }}>
          &ldquo;{truncate(review.reviewText, reviewMaxChars(styleOverride))}&rdquo;
        </div>

        {/* Auteur */}
        <div style={{ fontSize: 28, fontWeight: 600, color: authorClr, letterSpacing: 0.3, marginBottom: 8 }}>
          {review.customerName ?? 'Anonieme klant'}
        </div>
        <div style={{ fontSize: 22, color: 'rgba(255,255,255,0.50)', letterSpacing: 0.2 }}>
          {formatDate(review.reviewDate)}{review.sourceName ? ` · ${review.sourceName}` : ''}
        </div>
      </div>
    </div>
  );
}
