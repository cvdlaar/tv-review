import { ShopReview, Brand, StyleOverride } from '../../types';
import { StarRatingElement } from '../elements/StarRatingElement';
import { reviewFontSize, reviewMaxChars } from '../slideStyle';

interface Props {
  review: ShopReview;
  brand: Brand | null;
  styleOverride?: StyleOverride;
  isImprovement?: boolean;
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, '') + ' …';
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function ComposedReviewSlide({ review, brand, styleOverride, isImprovement = false }: Props) {
  const primary   = styleOverride?.primaryColor ?? brand?.primaryColor ?? '#005eb8';
  const accent    = styleOverride?.accentColor  ?? brand?.accentColor  ?? '#e57200';
  const starColor = styleOverride?.starColor    ?? accent;
  // Standaard donkere tekst omdat de achtergrond een witte rechterkant heeft
  const reviewClr = styleOverride?.reviewTextColor ?? '#1a2744';
  const authorClr = styleOverride?.authorTextColor ?? '#1a2744';
  const bgImage      = styleOverride?.backgroundImage;
  const offsetX      = styleOverride?.reviewOffsetX ?? 0;
  const offsetY      = styleOverride?.reviewOffsetY ?? 0;
  const maxW         = styleOverride?.reviewMaxWidth ?? 820;
  const maxH         = styleOverride?.reviewMaxHeight;
  const headingLeft  = styleOverride?.headingOnLeft ?? false;
  const textLeft     = (styleOverride?.composedTextLeft ?? 980) + offsetX;
  const headingWords = (styleOverride?.headingText ?? (isImprovement ? 'Dit\nKan\nBeter' : 'Dit\nGaat\nGoed')).split(/[\s\n]+/);

  return (
    <div style={{ width: 1920, height: 1080, position: 'relative', overflow: 'hidden', fontFamily: 'Rethink Sans, sans-serif', background: '#ffffff' }}>

      {/* Volledig beeld als achtergrond — geen clipping */}
      {bgImage && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 1,
          }}
        />
      )}

      {/* Gestapelde titel op de linkerkant (optioneel) */}
      {headingLeft && (
        <div
          style={{
            position: 'absolute',
            left: 56,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            lineHeight: 1,
          }}
        >
          {headingWords.map((word, i) => (
            <span
              key={i}
              style={{
                fontSize: 130,
                fontWeight: 900,
                letterSpacing: -2,
                color: i === headingWords.length - 1 ? accent : primary,
                display: 'block',
              }}
            >
              {word}
            </span>
          ))}
        </div>
      )}

      {/* Tekst-overlay op de witte rechterkant van de afbeelding */}
      <div
        style={{
          position: 'absolute',
          left: textLeft,
          top: 90 + offsetY,
          right: 72,
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: accent,
            color: '#ffffff',
            padding: '10px 26px',
            borderRadius: 100,
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            alignSelf: 'flex-start',
            marginBottom: 30,
          }}
        >
          <span>★</span>
          <span>{isImprovement ? 'Verbeterpunt' : 'Klantfeedback'}</span>
        </div>

        {/* Hoofdtitel — alleen rechts als headingOnLeft uit staat */}
        {!headingLeft && (
          <div
            style={{
              fontSize: 82,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -0.5,
              marginBottom: 22,
              color: primary,
            }}
          >
            {styleOverride?.headingText ? (
              styleOverride.headingText
            ) : isImprovement ? (
              <>Dit kan <span style={{ color: accent }}>beter</span></>
            ) : (
              <>Dit gaat <span style={{ color: accent }}>goed</span></>
            )}
          </div>
        )}

        {/* Sterren */}
        <div style={{ marginBottom: 24 }}>
          <StarRatingElement rating={review.rating} size={46} color={starColor} />
        </div>

        {/* Review quote */}
        <div
          style={{
            fontSize: reviewFontSize(styleOverride),
            color: reviewClr,
            fontStyle: 'italic',
            lineHeight: 1.55,
            maxWidth: maxW,
            maxHeight: maxH ?? undefined,
            overflow: maxH ? 'hidden' : undefined,
            marginBottom: 28,
            opacity: 0.9,
          }}
        >
          &ldquo;{truncate(review.reviewText, reviewMaxChars(styleOverride))}&rdquo;
        </div>

        {/* Auteur */}
        <div style={{ fontSize: 26, fontWeight: 700, color: authorClr, marginBottom: 6 }}>
          {review.customerName ?? 'Anonieme klant'}
        </div>
        <div style={{ fontSize: 20, color: '#718096' }}>
          {formatDate(review.reviewDate)}{review.sourceName ? ` · ${review.sourceName}` : ''}
        </div>
      </div>
    </div>
  );
}
