export type Role = 'admin' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface Brand {
  id: string;
  name: string;
  domain: string;
  logoUrl: string | null;
  channableFeedUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewSource {
  id: string;
  brandId: string;
  brand?: { name: string };
  type: 'shop_review' | 'product_review';
  providerName: string;
  apiUrl: string | null;
  apiKeyReference: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShopReview {
  id: string;
  brandId: string;
  sourceId: string;
  externalReviewId: string;
  rating: number;
  reviewText: string;
  customerName: string | null;
  reviewDate: string;
  sourceName: string | null;
  createdAt: string;
}

export interface ProductReview {
  id: string;
  brandId: string;
  brand?: { name: string; primaryColor: string; accentColor: string };
  sourceId: string;
  externalReviewId: string;
  sku: string;
  rating: number;
  reviewText: string;
  customerName: string | null;
  reviewDate: string;
  sourceName: string | null;
  createdAt: string;
}

export interface Product {
  id: string;
  brandId: string;
  sku: string;
  name: string;
  url: string | null;
  imageUrl: string | null;
  price: number | null;
}

export interface SlideTemplate {
  id: string;
  name: string;
  type: string;
  aspectRatio: string;
  canvasWidth: number;
  canvasHeight: number;
  backgroundConfig: BackgroundConfig;
  elements: TemplateElement[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BackgroundConfig {
  type: 'solid' | 'gradient' | 'image' | 'diagonal' | 'split';
  color?: string;
  leftColor?: string;
  rightColor?: string;
  baseColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  angle?: number;
  imageUrl?: string;
  imageFit?: 'cover' | 'contain';
  overlay?: { enabled: boolean; color: string; opacity: number };
}

export interface TemplateElement {
  id: string;
  type: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  zIndex?: number;
  locked?: boolean;
  visible?: boolean;
  content?: string;
  style?: Record<string, unknown>;
  dataBinding?: { source: string; field: string };
}

export interface Screen {
  id: string;
  name: string;
  slug: string;
  brandId: string | null;
  brand?: { name: string; primaryColor: string; accentColor?: string } | null;
  templateId: string;
  template?: { name: string; type: string } | null;
  type: string;
  config: Record<string, unknown>;
  screenKey: string;
  active: boolean;
  refreshIntervalMinutes: number;
  slideDurationSeconds: number;
  createdAt: string;
  updatedAt: string;
}

export interface SyncLog {
  id: string;
  source: string;
  status: 'running' | 'success' | 'error';
  message: string | null;
  startedAt: string;
  finishedAt: string | null;
}

export interface StyleOverride {
  primaryColor?: string;
  accentColor?: string;
  headingText?: string;
  subtitleText?: string;
  // Achtergrond
  backgroundType?: 'default' | 'color' | 'gradient' | 'image';
  backgroundColor?: string;
  backgroundFrom?: string;
  backgroundTo?: string;
  backgroundImage?: string;
  backgroundOverlayOpacity?: number;
  // Element kleuren
  reviewTextColor?: string;
  authorTextColor?: string;
  starColor?: string;
  // Tekst grootte
  reviewTextSize?: 'small' | 'medium' | 'large';
  // Positie-offset (px)
  reviewOffsetX?: number;
  reviewOffsetY?: number;
  // Tekstvak afmetingen (px)
  reviewMaxWidth?: number;
  reviewMaxHeight?: number;
  // Slide layout
  layoutStyle?: 'default' | 'brand-split' | 'composed';
  // Voor composed: startpositie van het tekstblok (px vanaf links), default 980
  composedTextLeft?: number;
  // Toon de hoofdtitel gestapeld op de linkerkant (foto-zijde) in plaats van rechts
  headingOnLeft?: boolean;
  // Product review elementen
  productNameColor?: string;
  productNameSize?: 'small' | 'medium' | 'large';
  productImageSize?: number;
  showSku?: boolean;
  skuColor?: string;
  showPrice?: boolean;
  productLabelText?: string;
  // Product sectie positie en breedte
  productSectionWidth?: number;
  productSectionOffsetX?: number;
}

// TV slide types
export type SlideType = 'positive' | 'improvement' | 'split' | 'product' | 'empty';

export interface TvSlide {
  type: SlideType;
  review?: ShopReview;
  positiveReview?: ShopReview;
  improvementReview?: ShopReview;
  productReview?: ProductReview;
  product?: Product | null;
}

export interface TvScreenData {
  screen: {
    id: string;
    name: string;
    type: string;
    slideDurationSeconds: number;
    refreshIntervalMinutes: number;
    brand: Brand | null;
    template: SlideTemplate;
    config?: Record<string, unknown>;
  };
  slides: TvSlide[];
}
