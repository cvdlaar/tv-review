import { ReviewProvider, ShopReviewInput, ProductReviewInput } from './types';

export const mockReviewProvider: ReviewProvider = {
  async fetchShopReviews() {
    return [
      {
        externalReviewId: `mock-shop-${Date.now()}-1`,
        rating: 5,
        reviewText: 'Uitstekende service en snelle levering! Precies wat we nodig hadden.',
        customerName: 'Mock Klant A',
        reviewDate: new Date(),
        sourceName: 'Mock Provider',
      },
      {
        externalReviewId: `mock-shop-${Date.now()}-2`,
        rating: 3,
        reviewText: 'Goede producten maar de levering kon sneller. Verder tevreden.',
        customerName: 'Mock Klant B',
        reviewDate: new Date(),
        sourceName: 'Mock Provider',
      },
    ] satisfies ShopReviewInput[];
  },

  async fetchProductReviews() {
    return [
      {
        externalReviewId: `mock-prod-${Date.now()}-1`,
        sku: 'LC001',
        rating: 5,
        reviewText: 'Top product, precies zoals beschreven.',
        customerName: 'Mock Klant C',
        reviewDate: new Date(),
        sourceName: 'Mock Provider',
      },
    ] satisfies ProductReviewInput[];
  },
};
