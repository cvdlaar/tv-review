import { Router } from 'express';
import { z } from 'zod';
import * as https from 'https';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { parseCsv, stripHtml } from '../utils/csvParser';

const sslAgent = new https.Agent({ rejectUnauthorized: false });

function fetchFeedCsv(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const isHttps = parsed.protocol === 'https:';
    const mod = isHttps ? https : require('http');
    const opts = {
      hostname: parsed.hostname,
      port: parsed.port || (isHttps ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: 'GET',
      ...(isHttps ? { agent: sslAgent } : {}),
    };
    const req = mod.request(opts, (res: import('http').IncomingMessage) => {
      if (res.statusCode && res.statusCode >= 400) {
        reject(new Error(`HTTP ${res.statusCode}`)); return;
      }
      const chunks: Buffer[] = [];
      res.on('data', (c: Buffer) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    });
    req.on('error', reject);
    req.end();
  });
}

const router = Router();
const prisma = new PrismaClient();

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { brandId } = req.query;
    const products = await prisma.product.findMany({
      where: brandId ? { brandId: brandId as string } : {},
      orderBy: { name: 'asc' },
    });
    res.json(products);
  } catch (e) { next(e); }
});

const importSchema = z.object({
  brandId: z.string().min(1),
  csv: z.string().min(1),
});

const SKU_FIELDS   = ['sku', 'id', 'mpn', 'product_id'];
const NAME_FIELDS  = ['title', 'name', 'product_title'];
const IMAGE_FIELDS = ['image_link', 'image', 'image_url', 'afbeelding'];
const URL_FIELDS   = ['link', 'url', 'product_url', 'product_link'];
const PRICE_FIELDS = ['price', 'prijs', 'sale_price', 'regular_price'];

function detectColumn(headers: string[], candidates: string[]): string | null {
  return headers.find((h) => candidates.includes(h)) ?? null;
}

function pickByCol(row: Record<string, string>, col: string | null): string | undefined {
  if (!col) return undefined;
  const val = row[col];
  return val && val.trim() !== '' ? val.trim() : undefined;
}

router.delete('/all', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { brandId } = req.query;
    const { count } = await prisma.product.deleteMany({
      where: brandId ? { brandId: brandId as string } : {},
    });
    res.json({ deleted: count });
  } catch (e) { next(e); }
});

router.post('/import', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const body = importSchema.safeParse(req.body);
    if (!body.success) { res.status(400).json({ error: body.error.flatten() }); return; }

    const { brandId, csv } = body.data;

    await prisma.brand.findUniqueOrThrow({ where: { id: brandId } });

    const rows = parseCsv(csv);
    if (rows.length === 0) { res.status(400).json({ error: 'CSV bevat geen rijen' }); return; }

    // Detect which column maps to each field — done once on the header row
    const headers = Object.keys(rows[0]);
    const colSku   = detectColumn(headers, SKU_FIELDS);
    const colName  = detectColumn(headers, NAME_FIELDS);
    const colImage = detectColumn(headers, IMAGE_FIELDS);
    const colUrl   = detectColumn(headers, URL_FIELDS);
    const colPrice = detectColumn(headers, PRICE_FIELDS);

    if (!colSku) {
      res.status(400).json({
        error: `Geen SKU-kolom gevonden. Verwacht een van: ${SKU_FIELDS.join(', ')}. Gevonden kolommen: ${headers.join(', ')}`,
      });
      return;
    }

    // Report which columns were matched
    const fieldMap: Record<string, string> = { sku: colSku };
    if (colName)  fieldMap.name     = colName;
    if (colImage) fieldMap.imageUrl  = colImage;
    if (colUrl)   fieldMap.url       = colUrl;
    if (colPrice) fieldMap.price     = colPrice;

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const row of rows) {
      const sku = pickByCol(row, colSku);
      if (!sku) { skipped++; continue; }

      const name     = pickByCol(row, colName);
      const imageUrl = pickByCol(row, colImage);
      const url      = pickByCol(row, colUrl);
      const priceRaw = pickByCol(row, colPrice);
      const price    = priceRaw ? parseFloat(priceRaw.replace(',', '.').replace(/[^0-9.]/g, '')) : undefined;

      try {
        await prisma.product.upsert({
          where: { sku_brandId: { sku, brandId } },
          update: {
            ...(name     !== undefined ? { name }     : {}),
            ...(imageUrl !== undefined ? { imageUrl } : {}),
            ...(url      !== undefined ? { url }      : {}),
            ...(price !== undefined && !isNaN(price) ? { price } : {}),
          },
          create: {
            sku,
            brandId,
            name: name ?? sku,
            imageUrl: imageUrl ?? null,
            url: url ?? null,
            price: price && !isNaN(price) ? price : null,
          },
        });
        imported++;
      } catch (e) {
        errors.push(`SKU ${sku}: ${e instanceof Error ? e.message : 'onbekende fout'}`);
      }
    }

    res.json({ imported, skipped, errors: errors.slice(0, 20), fieldMap });
  } catch (e) { next(e); }
});

const FEED_BATCH = 500;

router.post('/sync-feed', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { brandId } = z.object({ brandId: z.string().min(1) }).parse(req.body);
    const brand = await prisma.brand.findUniqueOrThrow({ where: { id: brandId } });

    if (!brand.channableFeedUrl) {
      res.status(400).json({ error: 'Geen Channable feed-URL ingesteld voor dit merk. Ga naar Merken om de URL in te stellen.' });
      return;
    }

    console.log(`[feed-sync] ${brand.name}: ophalen van ${brand.channableFeedUrl}`);
    const csv = await fetchFeedCsv(brand.channableFeedUrl);
    const rows = parseCsv(csv);

    if (rows.length === 0) { res.status(400).json({ error: 'Feed bevat geen rijen' }); return; }

    const headers = Object.keys(rows[0]);
    const colSku   = detectColumn(headers, SKU_FIELDS);
    const colName  = detectColumn(headers, NAME_FIELDS);
    const colImage = detectColumn(headers, IMAGE_FIELDS);
    const colUrl   = detectColumn(headers, URL_FIELDS);
    const colPrice = detectColumn(headers, PRICE_FIELDS);

    if (!colSku) {
      res.status(400).json({ error: `Geen SKU-kolom gevonden. Verwacht: ${SKU_FIELDS.join(', ')}. Gevonden: ${headers.join(', ')}` });
      return;
    }

    const fieldMap: Record<string, string> = { sku: colSku };
    if (colName)  fieldMap.name     = colName;
    if (colImage) fieldMap.imageUrl = colImage;
    if (colUrl)   fieldMap.url      = colUrl;
    if (colPrice) fieldMap.price    = colPrice;

    // Build product array in memory first (parse only, no DB yet)
    type ProductRow = { sku: string; brandId: string; name: string; imageUrl: string | null; url: string | null; price: number | null };
    const products: ProductRow[] = [];
    let skipped = 0;

    for (const row of rows) {
      const sku = pickByCol(row, colSku);
      if (!sku) { skipped++; continue; }
      const rawName  = pickByCol(row, colName);
      const name     = rawName ? stripHtml(rawName) : undefined;
      const imageUrl = pickByCol(row, colImage) ?? null;
      const url      = pickByCol(row, colUrl) ?? null;
      const priceRaw = pickByCol(row, colPrice);
      const price    = priceRaw ? parseFloat(priceRaw.replace(',', '.').replace(/[^0-9.]/g, '')) : null;
      products.push({ sku, brandId, name: name || sku, imageUrl, url, price: price && !isNaN(price) ? price : null });
    }

    // Delete existing and insert in batches — 18k upserts → 1 delete + ~36 createMany
    console.log(`[feed-sync] ${brand.name}: ${products.length} producten verwerken in batches van ${FEED_BATCH}`);
    await prisma.product.deleteMany({ where: { brandId } });

    let imported = 0;
    for (let i = 0; i < products.length; i += FEED_BATCH) {
      const batch = products.slice(i, i + FEED_BATCH);
      const result = await prisma.product.createMany({ data: batch });
      imported += result.count;
      console.log(`[feed-sync] ${brand.name}: batch ${Math.ceil((i + 1) / FEED_BATCH)}/${Math.ceil(products.length / FEED_BATCH)} — ${imported}/${products.length}`);
    }

    console.log(`[feed-sync] ${brand.name}: klaar — ${imported} geïmporteerd, ${skipped} overgeslagen`);
    res.json({ imported, skipped, errors: [], fieldMap });
  } catch (e) { next(e); }
});

export default router;
