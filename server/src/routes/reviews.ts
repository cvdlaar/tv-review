import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/shop', requireAuth, async (req, res, next) => {
  try {
    const { brandId, minRating, maxRating, limit = '20' } = req.query;
    const where: Record<string, unknown> = {};
    if (brandId) where.brandId = brandId as string;
    if (minRating || maxRating) {
      where.rating = {};
      if (minRating) (where.rating as Record<string, number>).gte = parseInt(minRating as string);
      if (maxRating) (where.rating as Record<string, number>).lte = parseInt(maxRating as string);
    }
    const reviews = await prisma.shopReview.findMany({
      where,
      orderBy: { reviewDate: 'desc' },
      take: parseInt(limit as string),
      include: { brand: { select: { name: true } } },
    });
    res.json(reviews);
  } catch (e) { next(e); }
});

router.get('/product', requireAuth, async (req, res, next) => {
  try {
    const { brandId, limit = '20' } = req.query;
    const reviews = await prisma.productReview.findMany({
      where: brandId ? { brandId: brandId as string } : {},
      orderBy: { reviewDate: 'desc' },
      take: parseInt(limit as string),
      include: { brand: { select: { name: true } } },
    });
    res.json(reviews);
  } catch (e) { next(e); }
});

export default router;
