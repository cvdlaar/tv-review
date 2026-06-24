import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient, Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

const screenSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  brandId: z.string().optional().nullable(),
  templateId: z.string(),
  type: z.string().min(1),
  config: z.record(z.unknown()).optional().default({}),
  active: z.boolean().optional(),
  refreshIntervalMinutes: z.number().int().min(1).optional(),
  slideDurationSeconds: z.number().int().min(3).optional(),
});

router.get('/', requireAuth, async (_req, res, next) => {
  try {
    const screens = await prisma.screen.findMany({
      include: {
        brand: { select: { name: true, primaryColor: true, accentColor: true } },
        template: { select: { name: true, type: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(screens);
  } catch (e) { next(e); }
});

router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const screen = await prisma.screen.findUnique({
      where: { id: req.params.id },
      include: {
        brand: { select: { name: true, primaryColor: true, accentColor: true } },
        template: { select: { name: true, type: true } },
      },
    });
    if (!screen) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(screen);
  } catch (e) { next(e); }
});

router.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const body = screenSchema.safeParse(req.body);
    if (!body.success) { res.status(400).json({ error: body.error.flatten() }); return; }
    const { config, brandId, ...rest } = body.data;
    const screen = await prisma.screen.create({
      data: {
        ...rest,
        brandId: brandId ?? undefined,
        config: (config ?? {}) as Prisma.InputJsonValue,
        screenKey: randomUUID(),
      },
      include: { brand: true, template: true },
    });
    res.status(201).json(screen);
  } catch (e) { next(e); }
});

router.put('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const body = screenSchema.partial().safeParse(req.body);
    if (!body.success) { res.status(400).json({ error: body.error.flatten() }); return; }
    const { config, brandId, ...rest } = body.data;
    const updateData: Prisma.ScreenUpdateInput = {
      ...rest,
      ...(brandId !== undefined ? { brand: brandId ? { connect: { id: brandId } } : { disconnect: true } } : {}),
      ...(config !== undefined ? { config: config as Prisma.InputJsonValue } : {}),
    };
    const screen = await prisma.screen.update({
      where: { id: req.params.id },
      data: updateData,
      include: { brand: true, template: true },
    });
    res.json(screen);
  } catch (e) { next(e); }
});

router.post('/:id/regenerate-key', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const screen = await prisma.screen.update({
      where: { id: req.params.id },
      data: { screenKey: randomUUID() },
    });
    res.json({ screenKey: screen.screenKey });
  } catch (e) { next(e); }
});

export default router;
