import { TvSlide, Brand, StyleOverride } from '../types';
import { PositiveReviewSlide } from './slides/PositiveReviewSlide';
import { ImprovementReviewSlide } from './slides/ImprovementReviewSlide';
import { SplitReviewSlide } from './slides/SplitReviewSlide';
import { ProductReviewSlide } from './slides/ProductReviewSlide';
import { BrandReviewSlide } from './slides/BrandReviewSlide';
import { ComposedReviewSlide } from './slides/ComposedReviewSlide';
import { ScreenFallbackSlide } from './ScreenFallbackSlide';

interface Props {
  slide: TvSlide;
  brand: Brand | null;
  styleOverride?: StyleOverride;
}

export function SlideRenderer({ slide, brand, styleOverride }: Props) {
  // Brand-split layout: foto links, witte rechterkant met chevron-scheiding
  if (styleOverride?.layoutStyle === 'brand-split' && (slide.type === 'positive' || slide.type === 'improvement')) {
    const review = slide.review;
    if (!review) return <ScreenFallbackSlide type="empty" />;
    return <BrandReviewSlide review={review} brand={brand} styleOverride={styleOverride} isImprovement={slide.type === 'improvement'} />;
  }

  // Composed layout: pre-samengestelde achtergrondafbeelding, tekst als overlay
  if (styleOverride?.layoutStyle === 'composed' && (slide.type === 'positive' || slide.type === 'improvement')) {
    const review = slide.review;
    if (!review) return <ScreenFallbackSlide type="empty" />;
    return <ComposedReviewSlide review={review} brand={brand} styleOverride={styleOverride} isImprovement={slide.type === 'improvement'} />;
  }

  switch (slide.type) {
    case 'positive':
      if (!slide.review) return <ScreenFallbackSlide type="empty" />;
      return <PositiveReviewSlide review={slide.review} brand={brand} styleOverride={styleOverride} />;

    case 'improvement':
      if (!slide.review) return <ScreenFallbackSlide type="empty" />;
      return <ImprovementReviewSlide review={slide.review} brand={brand} styleOverride={styleOverride} />;

    case 'split':
      if (!slide.positiveReview || !slide.improvementReview) return <ScreenFallbackSlide type="empty" />;
      return (
        <SplitReviewSlide
          positiveReview={slide.positiveReview}
          improvementReview={slide.improvementReview}
          brand={brand}
          styleOverride={styleOverride}
        />
      );

    case 'product':
      if (!slide.productReview) return <ScreenFallbackSlide type="empty" />;
      return (
        <ProductReviewSlide
          review={slide.productReview}
          product={slide.product ?? null}
          screenBrand={brand}
          styleOverride={styleOverride}
        />
      );

    case 'empty':
      return <ScreenFallbackSlide type="empty" />;

    default:
      return <ScreenFallbackSlide type="empty" />;
  }
}
