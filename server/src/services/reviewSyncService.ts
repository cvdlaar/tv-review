import { PrismaClient, SyncStatus } from '@prisma/client';
import { getProvider } from '../providers/providerFactory';

const prisma = new PrismaClient();

export async function runSync(sourceId: string) {
  const log = await prisma.syncLog.create({
    data: { source: sourceId, status: SyncStatus.running, startedAt: new Date() },
  });

  try {
    const source = await prisma.reviewSource.findUniqueOrThrow({ where: { id: sourceId } });
    const provider = getProvider(source.providerName);

    if (source.type === 'shop_review') {
      const reviews = await provider.fetchShopReviews({ source });
      let imported = 0;
      for (const r of reviews) {
        await prisma.shopReview.upsert({
          where: { externalReviewId_sourceId: { externalReviewId: r.externalReviewId, sourceId } },
          update: { rating: r.rating, reviewText: r.reviewText, customerName: r.customerName },
          create: { ...r, brandId: source.brandId, sourceId },
        });
        imported++;
      }
      await prisma.syncLog.update({
        where: { id: log.id },
        data: { status: SyncStatus.success, message: `${imported} reviews gesynchroniseerd`, finishedAt: new Date() },
      });
    } else {
      const reviews = await provider.fetchProductReviews({ source });
      let imported = 0;
      for (const r of reviews) {
        await prisma.productReview.upsert({
          where: { externalReviewId_sourceId: { externalReviewId: r.externalReviewId, sourceId } },
          update: { rating: r.rating, reviewText: r.reviewText, customerName: r.customerName },
          create: { ...r, brandId: source.brandId, sourceId },
        });
        imported++;
      }
      await prisma.syncLog.update({
        where: { id: log.id },
        data: { status: SyncStatus.success, message: `${imported} productreviews gesynchroniseerd`, finishedAt: new Date() },
      });
    }
  } catch (e) {
    await prisma.syncLog.update({
      where: { id: log.id },
      data: {
        status: SyncStatus.error,
        message: e instanceof Error ? e.message : 'Onbekende fout',
        finishedAt: new Date(),
      },
    });
    throw e;
  }

  return prisma.syncLog.findUnique({ where: { id: log.id } });
}
