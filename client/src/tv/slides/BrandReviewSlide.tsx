import { ShopReview, Brand, StyleOverride } from '../../types';
import { StarRatingElement } from '../elements/StarRatingElement';
import { reviewFontSize, reviewMaxChars } from '../slideStyle';

interface Props {
  review: ShopReview;
  brand: Brand | null;
  styleOverride?: StyleOverride;
  isImprovement?: boolean;
}

// Chevron-vorm: de foto heeft een pijlpunt naar rechts als rechterrand
//   Top-rand van foto:   x = CHEV_BASE
//   Pijlpunt (midden):   x = CHEV_POINT, y = 540
//   Bottom-rand van foto: x = CHEV_BASE
// Dit geeft de kenmerkende "> " scheidingsvorm uit de merkafbeelding.
const CHEV_BASE  = 760;   // fotobreedte boven en onder
const CHEV_POINT = 980;   // verste punt van de pijl (horizontaal)

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, '') + ' …';
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function BrandReviewSlide({ review, brand, styleOverride, isImprovement = false }: Props) {
  const primary   = styleOverride?.primaryColor ?? brand?.primaryColor ?? '#005eb8';
  const accent    = styleOverride?.accentColor  ?? brand?.accentColor  ?? '#e57200';
  const starColor = styleOverride?.starColor    ?? accent;
  const reviewClr = styleOverride?.reviewTextColor ?? '#1a2744';
  const authorClr = styleOverride?.authorTextColor ?? '#1a2744';
  const bgImage      = styleOverride?.backgroundImage;
  const offsetX      = styleOverride?.reviewOffsetX ?? 0;
  const offsetY      = styleOverride?.reviewOffsetY ?? 0;
  const maxW         = styleOverride?.reviewMaxWidth ?? 800;
  const maxH         = styleOverride?.reviewMaxHeight;
  const headingLeft  = styleOverride?.headingOnLeft ?? false;

  // Foto clip: rechthoek links + chevron (pijlpunt rechts)
  const photoClip = `polygon(0px 0px, ${CHEV_BASE}px 0px, ${CHEV_POINT}px 540px, ${CHEV_BASE}px 1080px, 0px 1080px)`;

  // Wit vlak: alles rechts van de chevron (als SVG voor pixel-scherpe rand)
  const whitePoints = `${CHEV_BASE},0 1920,0 1920,1080 ${CHEV_BASE},1080 ${CHEV_POINT},540`;

  // Tekst begint ruim rechts van de chevron-punt
  const textLeft = CHEV_POINT + 60;

  // Gestapeld titeltekst voor de linkerkant — splits op spatie, elk woord een regel
  const headingWords = (styleOverride?.headingText ?? (isImprovement ? 'Dit\nKan\nBeter' : 'Dit\nGaat\nGoed')).split(/[\s\n]+/);

  return (
    <div style={{ width: 1920, height: 1080, background: '#ffffff', position: 'relative', overflow: 'hidden', fontFamily: 'Rethink Sans, sans-serif' }}>

      {/* Foto of kleur-fallback — geclipped naar de chevron-vorm */}
      {bgImage ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            clipPath: photoClip,
            zIndex: 1,
          }}
        />
      ) : (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(160deg, ${primary} 0%, #0a1628 100%)`,
            clipPath: photoClip,
            zIndex: 1,
          }}
        />
      )}

      {/* Wit vlak rechts — SVG voor pixel-perfecte aansluiting op de chevron */}
      <svg
        style={{ position: 'absolute', inset: 0, width: 1920, height: 1080, zIndex: 2 }}
        viewBox="0 0 1920 1080"
        preserveAspectRatio="none"
      >
        <polygon points={whitePoints} fill="#ffffff" />
      </svg>

      {/* Chevron-accentlijn in de merkkleur — twee lijnen die de pijlpunt vormen */}
      <svg
        style={{ position: 'absolute', inset: 0, width: 1920, height: 1080, zIndex: 3 }}
        viewBox="0 0 1920 1080"
      >
        <polyline
          points={`${CHEV_BASE},0 ${CHEV_POINT},540 ${CHEV_BASE},1080`}
          fill="none"
          stroke={accent}
          strokeWidth={10}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>

      {/* Reviewcontent rechts */}
      <div
        style={{
          position: 'absolute',
          left: textLeft + offsetX,
          top: 90 + offsetY,
          right: 72,
          zIndex: 4,
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

        {/* Hoofdtitel — alleen rechts tonen als headingOnLeft uit staat */}
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
            opacity: 0.88,
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

      {/* Gestapelde titel op de foto-zijde (optioneel) */}
      {headingLeft && (
        <div
          style={{
            position: 'absolute',
            left: 56,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 5,
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
                color: i === headingWords.length - 1 ? accent : '#ffffff',
                textShadow: '0 2px 12px rgba(0,0,0,0.35)',
                display: 'block',
              }}
            >
              {word}
            </span>
          ))}
        </div>
      )}

      {/* Merknaam linksboven op de foto */}
      {brand?.name && (
        <div
          style={{
            position: 'absolute',
            left: 56,
            top: 52,
            color: 'rgba(255,255,255,0.90)',
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: 0.3,
            zIndex: 5,
            textShadow: '0 1px 6px rgba(0,0,0,0.5)',
          }}
        >
          {brand.name}
        </div>
      )}
    </div>
  );
}
