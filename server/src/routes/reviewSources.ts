import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient, ReviewType } from '@prisma/client';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

const sourceSchema = z.object({
  brandId: z.string(),
  type: z.nativeEnum(ReviewType),
  providerName: z.string().min(1),
  apiUrl: z.string().url().optional().nullable(),
  apiKeyReference: z.string().optional().nullable(),
  active: z.boolean().optional(),
});

router.get('/', requireAuth, async (_req, res, next) => {
  try {
    const sources = await prisma.reviewSource.findMany({
      include: { brand: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(sources);
  } catch (e) { next(e); }
});

router.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const body = sourceSchema.safeParse(req.body);
    if (!body.success) { res.status(400).json({ error: body.error.flatten() }); return; }
    const source = await prisma.reviewSource.create({ data: body.data });
    res.status(201).json(source);
  } catch (e) { next(e); }
});

router.put('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const body = sourceSchema.partial().safeParse(req.body);
    if (!body.success) { res.status(400).json({ error: body.error.flatten() }); return; }
    const source = await prisma.reviewSource.update({ where: { id: req.params.id }, data: body.data });
    res.json(source);
  } catch (e) { next(e); }
});

export default router;
