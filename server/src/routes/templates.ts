import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient, Prisma } from '@prisma/client';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

const templateSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  aspectRatio: z.string().optional(),
  canvasWidth: z.number().int().optional(),
  canvasHeight: z.number().int().optional(),
  backgroundConfig: z.record(z.unknown()),
  elements: z.array(z.record(z.unknown())),
  active: z.boolean().optional(),
});

router.get('/', requireAuth, async (_req, res, next) => {
  try {
    const templates = await prisma.slideTemplate.findMany({ orderBy: { name: 'asc' } });
    res.json(templates);
  } catch (e) { next(e); }
});

router.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const body = templateSchema.safeParse(req.body);
    if (!body.success) { res.status(400).json({ error: body.error.flatten() }); return; }
    const { backgroundConfig, elements, ...rest } = body.data;
    const template = await prisma.slideTemplate.create({
      data: {
        ...rest,
        backgroundConfig: backgroundConfig as Prisma.InputJsonValue,
        elements: elements as Prisma.InputJsonValue,
      },
    });
    res.status(201).json(template);
  } catch (e) { next(e); }
});

router.put('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const body = templateSchema.partial().safeParse(req.body);
    if (!body.success) { res.status(400).json({ error: body.error.flatten() }); return; }
    const { backgroundConfig, elements, ...rest } = body.data;
    const template = await prisma.slideTemplate.update({
      where: { id: req.params.id },
      data: {
        ...rest,
        ...(backgroundConfig !== undefined ? { backgroundConfig: backgroundConfig as Prisma.InputJsonValue } : {}),
        ...(elements !== undefined ? { elements: elements as Prisma.InputJsonValue } : {}),
      },
    });
    res.json(template);
  } catch (e) { next(e); }
});

router.post('/:id/duplicate', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const original = await prisma.slideTemplate.findUniqueOrThrow({ where: { id: req.params.id } });
    const { id: _id, createdAt: _c, updatedAt: _u, backgroundConfig, elements, ...rest } = original;
    const copy = await prisma.slideTemplate.create({
      data: {
        ...rest,
        name: `${rest.name} (kopie)`,
        backgroundConfig: backgroundConfig as Prisma.InputJsonValue,
        elements: elements as Prisma.InputJsonValue,
      },
    });
    res.status(201).json(copy);
  } catch (e) { next(e); }
});

export default router;
