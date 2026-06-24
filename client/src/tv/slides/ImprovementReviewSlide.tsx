import { ShopReview, Brand, StyleOverride } from '../../types';
import { StarRatingElement } from '../elements/StarRatingElement';
import { reviewFontSize, reviewMaxChars } from '../slideStyle';

interface Props {
  review: ShopReview;
  brand: Brand | null;
  styleOverride?: StyleOverride;
}

function truncate(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars).replace(/\s+\S*$/, '') + ' …';
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function ImprovementReviewSlide({ review, brand, styleOverride }: Props) {
  const primary    = styleOverride?.primaryColor ?? brand?.primaryColor ?? '#005eb8';
  const accent     = styleOverride?.accentColor  ?? brand?.accentColor  ?? '#e57200';
  const reviewClr  = styleOverride?.reviewTextColor ?? 'rgba(255,255,255,0.90)';
  const authorClr  = styleOverride?.authorTextColor ?? 'rgba(255,255,255,0.70)';
  const offsetX    = styleOverride?.reviewOffsetX ?? 0;
  const offsetY    = styleOverride?.reviewOffsetY ?? 0;
  const maxW       = styleOverride?.reviewMaxWidth ?? 1040;
  const maxH       = styleOverride?.reviewMaxHeight;
  const hasImage   = styleOverride?.backgroundType === 'image' && styleOverride.backgroundImage;
  const overlayOp  = (styleOverride?.backgroundOverlayOpacity ?? 50) / 100;
  const bgColor    = styleOverride?.backgroundType === 'color' ? (styleOverride.backgroundColor ?? shiftDarker(primary))
                   : styleOverride?.backgroundType === 'gradient' ? undefined
                   : shiftDarker(primary);
  const bgStyle    = styleOverride?.backgroundType === 'gradient'
    ? { background: `linear-gradient(135deg, ${styleOverride.backgroundFrom ?? primary} 0%, ${styleOverride.backgroundTo ?? '#0a1628'} 100%)` }
    : { background: bgColor };

  return (
    <div style={{ width: 1920, height: 1080, ...bgStyle, position: 'relative', overflow: 'hidden', fontFamily: 'Rethink Sans, sans-serif' }}>

      {hasImage && (
        <>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${styleOverride!.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0 }} />
          <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${overlayOp})`, zIndex: 1 }} />
        </>
      )}

      {/* Diagonale vormen — gespiegeld t.o.v. positive slide */}
      <svg style={{ position: 'absolute', left: 0, top: 0, width: 680, height: 1080 }} viewBox="0 0 680 1080" preserveAspectRatio="none">
        <polygon points="0,0 680,0 400,1080 0,1080" fill="rgba(255,255,255,0.045)" />
        <polygon points="0,0 460,0 240,1080 0,1080" fill="rgba(255,255,255,0.035)" />
      </svg>

      {/* Oranje accent driehoek linksonder */}
      <svg style={{ position: 'absolute', left: 0, bottom: 0, width: 500, height: 300 }} viewBox="0 0 500 300">
        <polygon points="0,0 0,300 500,300" fill={accent} opacity="0.85" />
      </svg>

      {/* Dunne oranje balk rechtsboven */}
      <div style={{ position: 'absolute', top: 0, right: 0, width: 1820, height: 8, background: accent }} />

      {/* Merknaam rechtsboven */}
      <div style={{ position: 'absolute', right: 80, top: 56, color: 'rgba(255,255,255,0.60)', fontSize: 24, fontWeight: 700, letterSpacing: 0.5, zIndex: 30 }}>
        {brand?.name ?? ''}
      </div>

      {/* Propositie rechtsonder */}
      <div style={{ position: 'absolute', right: 96, bottom: 130, fontSize: 22, fontWeight: 600, color: 'rgba(255,255,255,0.85)', textAlign: 'right', zIndex: 30 }}>
        Feedback helpt ons<br />onze klanten beter te helpen
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
        <div style={{ background: 'rgba(255,255,255,0.15)', border: `2px solid ${accent}`, color: '#fff', padding: '9px 26px', borderRadius: 100, fontSize: 22, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start', marginBottom: 28 }}>
          <span style={{ color: accent }}>↑</span>
          <span>Verbeterpunt</span>
        </div>

        {/* Hoofdkop */}
        <div style={{ fontSize: 92, fontWeight: 900, lineHeight: 1.05, letterSpacing: -1, marginBottom: 20 }}>
          <span style={{ color: '#ffffff' }}>{styleOverride?.headingText ?? 'Dit kan '}</span>
          {!styleOverride?.headingText && <span style={{ color: accent }}>beter</span>}
        </div>

        {/* Subtitel */}
        <div style={{ fontSize: 28, color: 'rgba(255,255,255,0.60)', fontStyle: 'italic', maxWidth: 700, marginBottom: 24 }}>
          {styleOverride?.subtitleText ?? 'Recente feedback waar we van kunnen leren'}
        </div>

        {/* Accent lijn */}
        <div style={{ width: 80, height: 6, background: accent, borderRadius: 3, marginBottom: 28 }} />

        {/* Sterren */}
        <div style={{ marginBottom: 36 }}>
          <StarRatingElement rating={review.rating} size={48} color="rgba(255,255,255,0.55)" />
        </div>

        {/* Review quote */}
        <div style={{ fontSize: reviewFontSize(styleOverride), color: reviewClr, fontStyle: 'italic', fontWeight: 400, lineHeight: 1.45, marginBottom: 40, maxHeight: maxH, overflow: maxH ? 'hidden' : undefined }}>
          &ldquo;{truncate(review.reviewText, reviewMaxChars(styleOverride))}&rdquo;
        </div>

        {/* Auteur */}
        <div style={{ fontSize: 26, fontWeight: 600, color: authorClr, marginBottom: 8 }}>
          {review.customerName ?? 'Anonieme klant'}
        </div>
        <div style={{ fontSize: 20, color: 'rgba(255,255,255,0.40)' }}>
          {formatDate(review.reviewDate)}{review.sourceName ? ` · ${review.sourceName}` : ''}
        </div>
      </div>
    </div>
  );
}

function shiftDarker(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const darken = (v: number) => Math.max(0, Math.round(v * 0.8)).toString(16).padStart(2, '0');
  return `#${darken(r)}${darken(g)}${darken(b)}`;
}
