import { ProductReview, Product, Brand, StyleOverride } from '../../types';
import { StarRatingElement } from '../elements/StarRatingElement';
import { ProductImageElement } from '../elements/ProductImageElement';
import { resolveBackground, reviewFontSize, reviewMaxChars } from '../slideStyle';

interface Props {
  review: ProductReview;
  product: Product | null;
  screenBrand: Brand | null;
  styleOverride?: StyleOverride;
}

function truncate(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars).replace(/\s+\S*$/, '') + ' …';
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function ProductReviewSlide({ review, product, screenBrand, styleOverride }: Props) {
  // Gebruik het merk van de review zelf (bij gecombineerde schermen),
  // anders het scherm-merk als fallback
  const reviewBrand = review.brand;
  const primaryColor = styleOverride?.primaryColor ?? reviewBrand?.primaryColor ?? screenBrand?.primaryColor ?? '#005eb8';
  const accentColor  = styleOverride?.accentColor  ?? reviewBrand?.accentColor  ?? screenBrand?.accentColor  ?? '#e57200';
  const starClr      = styleOverride?.starColor ?? accentColor;
  const reviewClr    = styleOverride?.reviewTextColor ?? '#ffffff';
  const authorClr    = styleOverride?.authorTextColor ?? 'rgba(255,255,255,0.80)';
  const brandName    = reviewBrand?.name ?? screenBrand?.name ?? '';
  const hasImage     = styleOverride?.backgroundType === 'image' && styleOverride.backgroundImage;
  const overlayOp    = (styleOverride?.backgroundOverlayOpacity ?? 50) / 100;
  const bg           = resolveBackground(styleOverride, primaryColor);

  // Bepaal een subtiele tweede kleur voor gecombineerde weergave
  const isLc = brandName.toLowerCase().includes('concurrent');
  const badgeBg = isLc ? '#005eb8' : '#1a3a6c';

  // Product-specifieke stijl
  const productNameClr  = styleOverride?.productNameColor ?? '#ffffff';
  const productNameSz   = ({ small: 24, medium: 34, large: 46 } as const)[styleOverride?.productNameSize ?? 'medium'];
  const imgSize         = styleOverride?.productImageSize ?? 640;
  const showSku         = styleOverride?.showSku ?? true;
  const skuClr          = styleOverride?.skuColor ?? 'rgba(255,255,255,0.4)';
  const showPrice       = styleOverride?.showPrice ?? false;
  const labelText       = styleOverride?.productLabelText ?? 'Productfeedback';

  // Positie en breedte van het productvak (links)
  const prodOffsetX   = styleOverride?.productSectionOffsetX ?? 0;
  const prodWidth     = styleOverride?.productSectionWidth ?? 760;
  const prodLeft      = 80 + prodOffsetX;

  // Reviewkant past zich automatisch aan: begint na het productvak
  const sepLeft       = prodLeft + prodWidth + 40;
  const reviewLeft    = sepLeft + 50 + (styleOverride?.reviewOffsetX ?? 0);
  const reviewOffsetY = styleOverride?.reviewOffsetY ?? 0;
  const reviewWidth   = Math.max(200, 1920 - reviewLeft - 80);

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
      {hasImage ? (
        <>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${styleOverride!.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0 }} />
          <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${overlayOp})`, zIndex: 1 }} />
        </>
      ) : (
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${primaryColor} 0%, #0a1628 65%)`, opacity: 0.9 }} />
      )}

      {/* Decoratief diagonaal vlak */}
      <svg
        style={{ position: 'absolute', right: 0, bottom: 0, width: 700, height: 500 }}
        viewBox="0 0 700 500"
      >
        <polygon points="0,500 700,100 700,500" fill="rgba(255,255,255,0.03)" />
      </svg>

      {/* Oranje accent streep bovenaan rechts */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 1060,
          height: 6,
          background: accentColor,
        }}
      />

      {/* LINKERKANT: Productafbeelding — verticaal gecentreerd in de volledige slidehoogte */}
      <div
        style={{
          position: 'absolute',
          left: prodLeft,
          top: 0,
          width: prodWidth,
          height: 1080,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          gap: 28,
          zIndex: 10,
        }}
      >
        {/* Merk-badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: badgeBg,
            border: `1px solid rgba(255,255,255,0.2)`,
            color: '#ffffff',
            padding: '8px 20px',
            borderRadius: 100,
            fontSize: 20,
            fontWeight: 700,
          }}
        >
          {brandName}
        </div>

        <ProductImageElement
          imageUrl={product?.imageUrl}
          alt={product?.name ?? 'Product'}
          width={imgSize}
          height={imgSize}
        />

        <div>
          <div
            style={{
              fontSize: productNameSz,
              fontWeight: 800,
              color: productNameClr,
              lineHeight: 1.2,
              marginBottom: 6,
              maxWidth: imgSize,
              wordBreak: 'break-word',
            }}
          >
            {product?.name ?? 'Onbekend product'}
          </div>
          {showSku && (
            <div style={{ fontSize: 18, color: skuClr, fontFamily: 'monospace' }}>
              SKU {review.sku}
            </div>
          )}
          {showPrice && product?.price != null && (
            <div style={{ fontSize: 28, fontWeight: 700, color: accentColor, marginTop: 8 }}>
              € {product.price.toFixed(2)}
            </div>
          )}
        </div>
      </div>

      {/* RECHTERKANT: Review — verticaal gecentreerd; offset schuift vanuit het midden */}
      <div
        style={{
          position: 'absolute',
          left: reviewLeft,
          top: 0,
          width: reviewWidth,
          height: 1080,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 36,
          zIndex: 10,
          transform: reviewOffsetY !== 0 ? `translateY(${reviewOffsetY}px)` : undefined,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.5)',
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              marginBottom: 20,
            }}
          >
            {labelText}
          </div>
          <StarRatingElement rating={review.rating} size={56} color={starClr} />
        </div>

        <div
          style={{
            fontSize: reviewFontSize(styleOverride),
            color: reviewClr,
            fontStyle: 'italic',
            fontWeight: 400,
            lineHeight: 1.45,
          }}
        >
          &ldquo;{truncate(review.reviewText, reviewMaxChars(styleOverride))}&rdquo;
        </div>

        <div>
          <div style={{ fontSize: 28, fontWeight: 600, color: authorClr, marginBottom: 8 }}>
            {review.customerName ?? 'Anonieme klant'}
          </div>
          <div style={{ fontSize: 20, color: 'rgba(255,255,255,0.40)' }}>
            {formatDate(review.reviewDate)}
            {review.sourceName ? ` · ${review.sourceName}` : ''}
          </div>
        </div>
      </div>
    </div>
  );
}
