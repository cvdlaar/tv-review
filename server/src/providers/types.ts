import { ReviewSource } from '@prisma/client';

export interface ShopReviewInput {
  externalReviewId: string;
  rating: number;
  reviewText: string;
  customerName?: string;
  reviewDate: Date;
  sourceName?: string;
}

export interface ProductReviewInput {
  externalReviewId: string;
  sku: string;
  rating: number;
  reviewText: string;
  customerName?: string;
  reviewDate: Date;
  sourceName?: string;
}

export interface ReviewProvider {
  fetchShopReviews(ctx: { source: ReviewSource }): Promise<ShopReviewInput[]>;
  fetchProductReviews(ctx: { source: ReviewSource }): Promise<ProductReviewInput[]>;
}
