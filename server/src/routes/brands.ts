import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

const brandSchema = z.object({
  name: z.string().min(1),
  domain: z.string().min(1),
  logoUrl: z.string().min(1).optional().nullable(),
  channableFeedUrl: z.string().url().optional().nullable(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  active: z.boolean().optional(),
});

router.get('/', requireAuth, async (_req, res, next) => {
  try {
    const brands = await prisma.brand.findMany({ orderBy: { name: 'asc' } });
    res.json(brands);
  } catch (e) { next(e); }
});

router.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const body = brandSchema.safeParse(req.body);
    if (!body.success) { res.status(400).json({ error: body.error.flatten() }); return; }
    const brand = await prisma.brand.create({ data: body.data });
    res.status(201).json(brand);
  } catch (e) { next(e); }
});

router.put('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const body = brandSchema.partial().safeParse(req.body);
    if (!body.success) { res.status(400).json({ error: body.error.flatten() }); return; }
    const brand = await prisma.brand.update({ where: { id: req.params.id }, data: body.data });
    res.json(brand);
  } catch (e) { next(e); }
});

export default router;
