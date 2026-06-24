import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { runSync } from './reviewSyncService';
import { parseCsv, stripHtml } from '../utils/csvParser';

const prisma = new PrismaClient();

// Reviewsync: elke nacht 02:00 — aanpasbaar via SYNC_CRON in .env
const REVIEW_CRON = process.env.SYNC_CRON ?? '0 2 * * *';

// Productsync: elke 1e van de maand om 03:00 — aanpasbaar via FEED_CRON in .env
const FEED_CRON = process.env.FEED_CRON ?? '0 3 1 * *';

const SKU_FIELDS   = ['sku', 'id', 'mpn', 'product_id'];
const NAME_FIELDS  = ['title', 'name', 'product_title'];
const IMAGE_FIELDS = ['image_link', 'image', 'image_url', 'afbeelding'];
const URL_FIELDS   = ['link', 'url', 'product_url', 'product_link'];
const PRICE_FIELDS = ['price', 'prijs', 'sale_price', 'regular_price'];

function detectCol(headers: string[], candidates: string[]): string | null {
  return headers.find((h) => candidates.includes(h)) ?? null;
}

function pickCol(row: Record<string, string>, col: string | null): string | undefined {
  if (!col) return undefined;
  const v = row[col];
  return v && v.trim() !== '' ? v.trim() : undefined;
}

async function runDailySync() {
  console.log('[scheduler] Dagelijkse review-sync gestart');
  try {
    const sources = await prisma.reviewSource.findMany({ where: { active: true } });
    if (sources.length === 0) { console.log('[scheduler] Geen actieve bronnen'); return; }
    for (const source of sources) {
      try {
        const log = await runSync(source.id);
        console.log(`[scheduler] ${source.providerName} (${source.id}): ${log?.message ?? 'klaar'}`);
      } catch (e) {
        console.error(`[scheduler] Fout bij bron ${source.id}:`, e instanceof Error ? e.message : e);
      }
    }
  } finally {
    console.log('[scheduler] Dagelijkse review-sync voltooid');
  }
}

async function runMonthlyFeedSync() {
  console.log('[scheduler] Maandelijkse Channable-sync gestart');
  try {
    const brands = await prisma.brand.findMany({ where: { active: true } });
    const brandsWithFeed = brands.filter((b) => b.channableFeedUrl);

    if (brandsWithFeed.length === 0) {
      console.log('[scheduler] Geen merken met Channable feed-URL');
      return;
    }

    for (const brand of brandsWithFeed) {
      try {
        console.log(`[scheduler] Feed ophalen voor ${brand.name}: ${brand.channableFeedUrl}`);
        const res = await fetch(brand.channableFeedUrl!);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const csv = await res.text();

        const rows = parseCsv(csv);
        if (rows.length === 0) { console.warn(`[scheduler] Lege feed voor ${brand.name}`); continue; }

        const headers = Object.keys(rows[0]);
        const colSku   = detectCol(headers, SKU_FIELDS);
        const colName  = detectCol(headers, NAME_FIELDS);
        const colImage = detectCol(headers, IMAGE_FIELDS);
        const colUrl   = detectCol(headers, URL_FIELDS);
        const colPrice = detectCol(headers, PRICE_FIELDS);

        if (!colSku) {
          console.error(`[scheduler] Geen SKU-kolom gevonden in feed voor ${brand.name}`);
          continue;
        }

        type ProductRow = { sku: string; brandId: string; name: string; imageUrl: string | null; url: string | null; price: number | null };
        const products: ProductRow[] = [];
        for (const row of rows) {
          const sku = pickCol(row, colSku);
          if (!sku) continue;
          const rawName  = pickCol(row, colName);
          const name     = rawName ? stripHtml(rawName) : undefined;
          const imageUrl = pickCol(row, colImage) ?? null;
          const url      = pickCol(row, colUrl) ?? null;
          const priceRaw = pickCol(row, colPrice);
          const price    = priceRaw ? parseFloat(priceRaw.replace(',', '.').replace(/[^0-9.]/g, '')) : null;
          products.push({ sku, brandId: brand.id, name: name || sku, imageUrl, url, price: price && !isNaN(price) ? price : null });
        }

        await prisma.product.deleteMany({ where: { brandId: brand.id } });
        let imported = 0;
        const BATCH = 500;
        for (let i = 0; i < products.length; i += BATCH) {
          const result = await prisma.product.createMany({ data: products.slice(i, i + BATCH) });
          imported += result.count;
        }
        console.log(`[scheduler] ${brand.name}: ${imported} producten geïmporteerd (${products.length - imported} overgeslagen)`);
      } catch (e) {
        console.error(`[scheduler] Fout bij feed ${brand.name}:`, e instanceof Error ? e.message : e);
      }
    }
  } finally {
    console.log('[scheduler] Maandelijkse Channable-sync voltooid');
  }
}

export function startScheduler() {
  if (cron.validate(REVIEW_CRON)) {
    cron.schedule(REVIEW_CRON, () => {
      runDailySync().catch((e) => console.error('[scheduler] Crash review-sync:', e));
    });
    console.log(`[scheduler] Review-sync gepland op "${REVIEW_CRON}"`);
  } else {
    console.error(`[scheduler] Ongeldig SYNC_CRON patroon: "${REVIEW_CRON}"`);
  }

  if (cron.validate(FEED_CRON)) {
    cron.schedule(FEED_CRON, () => {
      runMonthlyFeedSync().catch((e) => console.error('[scheduler] Crash feed-sync:', e));
    });
    console.log(`[scheduler] Channable-sync gepland op "${FEED_CRON}"`);
  } else {
    console.error(`[scheduler] Ongeldig FEED_CRON patroon: "${FEED_CRON}"`);
  }
}
