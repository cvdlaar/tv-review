import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { normalizeSku } from '../services/skuNormalizer';

const router = Router();
const prisma = new PrismaClient();

router.get('/screens/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { key } = req.query;

    const screen = await prisma.screen.findUnique({
      where: { slug },
      include: { brand: true, template: true },
    });

    if (!screen || !screen.active || screen.screenKey !== key) {
      res.status(404).json({ error: 'Scherm niet gevonden of ongeldige sleutel' });
      return;
    }

    let slides: unknown[] = [];

    if (screen.type === 'shop_reviews') {
      const cfg = screen.config as { minRatingPositive?: number; maxRatingImprovement?: number; maxReviews?: number; showSplitSlide?: boolean };
      const minPositive = cfg.minRatingPositive ?? 4;
      const maxImprovement = cfg.maxRatingImprovement ?? 3;
      const maxReviews = cfg.maxReviews ?? 10;
      const brandFilter = screen.brandId ? { brandId: screen.brandId } : {};

      const [positiveReviews, improvementReviews] = await Promise.all([
        prisma.shopReview.findMany({
          where: { ...brandFilter, rating: { gte: minPositive } },
          orderBy: { reviewDate: 'desc' },
          take: Math.ceil(maxReviews * 0.7),
        }),
        prisma.shopReview.findMany({
          where: { ...brandFilter, rating: { lte: maxImprovement } },
          orderBy: { reviewDate: 'desc' },
          take: Math.ceil(maxReviews * 0.4),
        }),
      ]);

      const maxLen = Math.max(positiveReviews.length, improvementReviews.length);
      for (let i = 0; i < maxLen; i++) {
        if (i < positiveReviews.length) slides.push({ type: 'positive', review: positiveReviews[i] });
        if (i < improvementReviews.length) slides.push({ type: 'improvement', review: improvementReviews[i] });
      }

      if (cfg.showSplitSlide && positiveReviews.length > 0 && improvementReviews.length > 0) {
        slides.push({ type: 'split', positiveReview: positiveReviews[0], improvementReview: improvementReviews[0] });
      }

    } else if (screen.type === 'product_reviews') {
      const cfg = screen.config as { maxReviews?: number };
      // brandId null = gecombineerd van alle merken
      const brandFilter = screen.brandId ? { brandId: screen.brandId } : {};

      const productReviews = await prisma.productReview.findMany({
        where: brandFilter,
        orderBy: { reviewDate: 'desc' },
        take: cfg.maxReviews ?? 15,
        include: {
          brand: { select: { name: true, primaryColor: true, accentColor: true } },
        },
      });

      // Haal producten op voor alle gevonden SKU's (over alle merken)
      const normalizedSkus = [...new Set(productReviews.map((r) => normalizeSku(r.sku)))];
      const products = await prisma.product.findMany({
        where: { sku: { in: normalizedSkus } },
      });

      // Prioriteer product van hetzelfde merk, val terug op elk ander merk
      const productsBySkuAndBrand = new Map<string, typeof products[number]>();
      const productsBySkuAny = new Map<string, typeof products[number]>();
      for (const p of products) {
        const key = `${normalizeSku(p.sku)}:${p.brandId}`;
        productsBySkuAndBrand.set(key, p);
        productsBySkuAny.set(normalizeSku(p.sku), p);
      }

      slides = productReviews.map((review) => {
        const nSku = normalizeSku(review.sku);
        const product =
          productsBySkuAndBrand.get(`${nSku}:${review.brandId}`) ??
          productsBySkuAny.get(nSku) ??
          null;
        if (!product) console.warn(`Geen product gevonden voor SKU: ${review.sku}`);
        return { type: 'product', review, product };
      });
    }

    if (slides.length === 0) slides = [{ type: 'empty' }];

    res.json({
      screen: {
        id: screen.id,
        name: screen.name,
        type: screen.type,
        slideDurationSeconds: screen.slideDurationSeconds,
        refreshIntervalMinutes: screen.refreshIntervalMinutes,
        brand: screen.brand,
        template: screen.template,
        config: screen.config,
      },
      slides,
    });
  } catch (e) { next(e); }
});

export default router;
