import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { runSync } from '../services/reviewSyncService';

const router = Router();
const prisma = new PrismaClient();

router.get('/logs', requireAuth, async (_req, res, next) => {
  try {
    const logs = await prisma.syncLog.findMany({
      orderBy: { startedAt: 'desc' },
      take: 50,
    });
    res.json(logs);
  } catch (e) { next(e); }
});

router.post('/:sourceId', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const source = await prisma.reviewSource.findUniqueOrThrow({
      where: { id: req.params.sourceId },
    });
    const log = await runSync(source.id);
    res.json(log);
  } catch (e) { next(e); }
});

export default router;
