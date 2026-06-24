import { PrismaClient, Role, ReviewType, SyncStatus } from '@prisma/client';
import bcryptjs from 'bcryptjs';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Users
  const adminHash = await bcryptjs.hash('Admin2024!', 12);
  const viewerHash = await bcryptjs.hash('Viewer2024!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@logistiekconcurrent.nl' },
    update: {},
    create: { email: 'admin@logistiekconcurrent.nl', name: 'Admin', passwordHash: adminHash, role: Role.admin },
  });
  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@logistiekconcurrent.nl' },
    update: {},
    create: { email: 'viewer@logistiekconcurrent.nl', name: 'Viewer', passwordHash: viewerHash, role: Role.viewer },
  });
  console.log(`Gebruikers: ${admin.email}, ${viewer.email}`);

  // Brands
  const lc = await prisma.brand.upsert({
    where: { domain: 'logistiekconcurrent.nl' },
    update: {},
    create: { name: 'Logistiekconcurrent.nl', domain: 'logistiekconcurrent.nl', primaryColor: '#005eb8', secondaryColor: '#ffffff', accentColor: '#e57200' },
  });
  const ld = await prisma.brand.upsert({
    where: { domain: 'logistiekdirect.be' },
    update: {},
    create: { name: 'Logistiekdirect.be', domain: 'logistiekdirect.be', primaryColor: '#1a3a6c', secondaryColor: '#ffffff', accentColor: '#e57200' },
  });
  console.log(`Merken: ${lc.name}, ${ld.name}`);

  // Review sources
  const lcShopSource = await prisma.reviewSource.upsert({
    where: { id: 'seed-lc-shop' },
    update: {},
    create: { id: 'seed-lc-shop', brandId: lc.id, type: ReviewType.shop_review, providerName: 'mock' },
  });
  const ldShopSource = await prisma.reviewSource.upsert({
    where: { id: 'seed-ld-shop' },
    update: {},
    create: { id: 'seed-ld-shop', brandId: ld.id, type: ReviewType.shop_review, providerName: 'mock' },
  });
  const lcProductSource = await prisma.reviewSource.upsert({
    where: { id: 'seed-lc-product' },
    update: {},
    create: { id: 'seed-lc-product', brandId: lc.id, type: ReviewType.product_review, providerName: 'mock' },
  });
  const ldProductSource = await prisma.reviewSource.upsert({
    where: { id: 'seed-ld-product' },
    update: {},
    create: { id: 'seed-ld-product', brandId: ld.id, type: ReviewType.product_review, providerName: 'mock' },
  });

  // --- Shopreviews Logistiekconcurrent ---
  const lcShopReviews = [
    { id: 'lc-sr-1', rating: 5, reviewText: 'Geweldige service! De levering was supersnel en de pakketten waren perfect verpakt. Zeker terugkomen.', customerName: 'Jan de Vries', reviewDate: daysAgo(3) },
    { id: 'lc-sr-2', rating: 5, reviewText: 'Ongelofelijk hoe snel de bestelling werd verwerkt. Binnen 24 uur in huis! De klantenservice was ook vriendelijk en behulpzaam.', customerName: 'Sarah Bakker', reviewDate: daysAgo(7) },
    { id: 'lc-sr-3', rating: 4, reviewText: 'Goede service en snelle levering. De producten zijn precies zoals beschreven. Verpakking had iets steviger gekund.', customerName: 'Peter Janssen', reviewDate: daysAgo(14) },
    { id: 'lc-sr-4', rating: 5, reviewText: 'Al meerdere jaren trouwe klant en nooit teleurgesteld. Levering altijd op tijd, uitstekende kwaliteit. Zodat wij lekker door kunnen draaien.', customerName: 'Maria Klassen', reviewDate: daysAgo(5) },
    { id: 'lc-sr-5', rating: 5, reviewText: 'Wij bestellen hier al jaren en de kwaliteit is altijd consistent. Het warehouse-team werkt snel en accuraat. Retournen gaat ook vlekkeloos.', customerName: 'Henk Visser', reviewDate: daysAgo(2) },
    { id: 'lc-sr-6', rating: 3, reviewText: 'De producten zijn goed maar de levertijd viel me wat tegen. Communicatie was wel oké.', customerName: 'Anna Smit', reviewDate: daysAgo(4) },
    { id: 'lc-sr-7', rating: 2, reviewText: 'Het bestellen ging makkelijk maar ik heb drie keer contact moeten opnemen voor een update. Automatische berichten zouden fijn zijn.', customerName: 'Bas de Groot', reviewDate: daysAgo(8) },
    { id: 'lc-sr-8', rating: 3, reviewText: 'Kwaliteit is prima maar één product miste een onderdeel. Klantenservice loste het snel op, maar liever voorkomen.', customerName: 'Lisa Vermeer', reviewDate: daysAgo(11) },
  ];
  for (const r of lcShopReviews) {
    await prisma.shopReview.upsert({
      where: { externalReviewId_sourceId: { externalReviewId: r.id, sourceId: lcShopSource.id } },
      update: {},
      create: { ...r, externalReviewId: r.id, brandId: lc.id, sourceId: lcShopSource.id, sourceName: 'Logistiekconcurrent.nl' },
    });
  }

  // --- Shopreviews Logistiekdirect ---
  const ldShopReviews = [
    { id: 'ld-sr-1', rating: 5, reviewText: 'Uitstekende bezorging! De chauffeur nam de tijd om alles netjes te plaatsen. Echt persoonlijke service.', customerName: 'Kees van Dam', reviewDate: daysAgo(3) },
    { id: 'ld-sr-2', rating: 5, reviewText: 'Snel, betrouwbaar en goede kwaliteit. Onze processen lopen een stuk soepeler dankzij jullie service.', customerName: 'Emma de Jong', reviewDate: daysAgo(5) },
    { id: 'ld-sr-3', rating: 4, reviewText: 'Goede ervaring. De prijs is competitief en de kwaliteit prima. Bezorging een dag later maar ze waarschuwden me tijdig.', customerName: 'Mark Pietersen', reviewDate: daysAgo(9) },
    { id: 'ld-sr-4', rating: 3, reviewText: 'Het product is goed maar de verpakking was licht beschadigd bij aankomst. Product zelf was gelukkig intact.', customerName: 'Sophie van Leeuwen', reviewDate: daysAgo(3) },
    { id: 'ld-sr-5', rating: 2, reviewText: 'Verwachtte snellere levering op basis van de website. Uiteindelijk 3 dagen later dan beloofd.', customerName: 'Dirk Mol', reviewDate: daysAgo(15) },
  ];
  for (const r of ldShopReviews) {
    await prisma.shopReview.upsert({
      where: { externalReviewId_sourceId: { externalReviewId: r.id, sourceId: ldShopSource.id } },
      update: {},
      create: { ...r, externalReviewId: r.id, brandId: ld.id, sourceId: ldShopSource.id, sourceName: 'Logistiekdirect.be' },
    });
  }
  console.log('Shopreviews aangemaakt');

  // --- Producten (dezelfde SKUs voor beide merken) ---
  const productDefs = [
    { sku: 'LC001', name: 'Rolcontainer 600x400x1800mm', imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&h=600&fit=crop', price: 189.0 },
    { sku: 'LC002', name: 'Magazijnstelling 90x45x200cm', imageUrl: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=600&h=600&fit=crop', price: 149.0 },
    { sku: 'LC003', name: 'Palletstelling startersconfiguratie', imageUrl: 'https://images.unsplash.com/photo-1601598851547-4302969d0614?w=600&h=600&fit=crop', price: 549.0 },
  ];
  for (const p of productDefs) {
    await prisma.product.upsert({ where: { sku_brandId: { sku: p.sku, brandId: lc.id } }, update: {}, create: { ...p, brandId: lc.id } });
    await prisma.product.upsert({ where: { sku_brandId: { sku: p.sku, brandId: ld.id } }, update: {}, create: { ...p, brandId: ld.id } });
  }
  console.log('Producten aangemaakt voor LC en LD');

  // --- Productreviews Logistiekconcurrent ---
  const lcProductReviews = [
    { id: 'lc-pr-1', sku: 'LC001', rating: 5, reviewText: 'De rolcontainer is stevig en beweegt soepel. Al 6 maanden dagelijks gebruik en nog geen slijtage.', customerName: 'Jeroen Kuiper', reviewDate: daysAgo(7) },
    { id: 'lc-pr-2', sku: 'LC002', rating: 4, reviewText: 'Goede stelling, makkelijk op te bouwen. We hebben er inmiddels 5 staan in ons distributiecentrum.', customerName: 'Linda Brouwer', reviewDate: daysAgo(14) },
    { id: 'lc-pr-3', sku: 'LC003', rating: 5, reviewText: 'Uitstekende kwaliteit voor de prijs. Snel geleverd, eenvoudig gemonteerd en belastbaar genoeg voor onze pallets.', customerName: 'Tom de Boer', reviewDate: daysAgo(3) },
  ];
  for (const r of lcProductReviews) {
    await prisma.productReview.upsert({
      where: { externalReviewId_sourceId: { externalReviewId: r.id, sourceId: lcProductSource.id } },
      update: {},
      create: { ...r, externalReviewId: r.id, brandId: lc.id, sourceId: lcProductSource.id, sourceName: 'Logistiekconcurrent.nl' },
    });
  }

  // --- Productreviews Logistiekdirect ---
  const ldProductReviews = [
    { id: 'ld-pr-1', sku: 'LC001', rating: 5, reviewText: 'Perfect voor ons magazijn. De wieltjes lopen soepel en de constructie voelt robuust. Snel geleverd ook!', customerName: 'Nico Vermeulen', reviewDate: daysAgo(5) },
    { id: 'ld-pr-2', sku: 'LC003', rating: 4, reviewText: 'Stevige palletstellingen voor een eerlijke prijs. Montage nam wat tijd maar het resultaat is prima.', customerName: 'Katrien Peeters', reviewDate: daysAgo(10) },
  ];
  for (const r of ldProductReviews) {
    await prisma.productReview.upsert({
      where: { externalReviewId_sourceId: { externalReviewId: r.id, sourceId: ldProductSource.id } },
      update: {},
      create: { ...r, externalReviewId: r.id, brandId: ld.id, sourceId: ldProductSource.id, sourceName: 'Logistiekdirect.be' },
    });
  }
  console.log('Productreviews aangemaakt voor LC en LD');

  // --- Templates ---
  const positiveTemplate = await upsertTemplate('seed-tmpl-positive', {
    name: 'Positieve review slide', type: 'positive_review',
    backgroundConfig: { type: 'solid', color: '#005eb8' },
    elements: [
      { id: 'tag', type: 'tag', content: 'Klantfeedback', x: 80, y: 80, zIndex: 10, locked: true, visible: true },
      { id: 'heading', type: 'text', content: 'Dit gaat goed', x: 80, y: 160, zIndex: 10, locked: true, visible: true, style: { fontSize: 88, fontWeight: 800, color: '#ffffff' } },
      { id: 'stars', type: 'stars', x: 80, y: 315, zIndex: 10, locked: true, visible: true, dataBinding: { source: 'review', field: 'rating' } },
      { id: 'quote', type: 'reviewQuote', x: 80, y: 410, zIndex: 10, locked: true, visible: true, dataBinding: { source: 'review', field: 'reviewText' }, style: { maxLines: 5 } },
      { id: 'customer', type: 'customerName', x: 80, y: 800, zIndex: 10, locked: true, visible: true, dataBinding: { source: 'review', field: 'customerName' } },
      { id: 'logo', type: 'logo', x: 1760, y: 40, zIndex: 20, locked: true, visible: true },
    ],
  });

  const improvementTemplate = await upsertTemplate('seed-tmpl-improvement', {
    name: 'Verbeterpunt slide', type: 'improvement_review',
    backgroundConfig: { type: 'split', leftColor: '#005eb8', rightColor: '#f2f2f2' },
    elements: [
      { id: 'heading', type: 'text', content: 'Dit kan beter', x: 72, y: 200, zIndex: 10, locked: true, visible: true, style: { fontSize: 76, fontWeight: 800, color: '#ffffff' } },
      { id: 'stars', type: 'stars', x: 800, y: 180, zIndex: 10, locked: true, visible: true, dataBinding: { source: 'review', field: 'rating' } },
      { id: 'quote', type: 'reviewQuote', x: 800, y: 300, zIndex: 10, locked: true, visible: true, dataBinding: { source: 'review', field: 'reviewText' } },
      { id: 'logo', type: 'logo', x: 72, y: 900, zIndex: 20, locked: true, visible: true },
    ],
  });

  const splitTemplate = await upsertTemplate('seed-tmpl-split', {
    name: 'Split review slide', type: 'split_review',
    backgroundConfig: { type: 'diagonal', baseColor: '#005eb8', secondaryColor: '#1a3a6c', accentColor: '#e57200', angle: -10 },
    elements: [],
  });

  const productTemplate = await upsertTemplate('seed-tmpl-product', {
    name: 'Productreview slide', type: 'product_review',
    backgroundConfig: { type: 'solid', color: '#0a1628' },
    elements: [
      { id: 'product-image', type: 'productImage', x: 80, y: 80, zIndex: 10, locked: true, visible: true, dataBinding: { source: 'product', field: 'imageUrl' } },
      { id: 'stars', type: 'stars', x: 950, y: 220, zIndex: 10, locked: true, visible: true, dataBinding: { source: 'review', field: 'rating' } },
      { id: 'quote', type: 'reviewQuote', x: 950, y: 320, zIndex: 10, locked: true, visible: true, dataBinding: { source: 'review', field: 'reviewText' } },
    ],
  });

  console.log('Templates aangemaakt');

  // --- Screens ---
  const lcScreen = await upsertScreen('seed-screen-lc', {
    name: 'Logistiekconcurrent Shopreviews',
    slug: 'logistiekconcurrent-reviews',
    brandId: lc.id,
    templateId: positiveTemplate.id,
    type: 'shop_reviews',
    config: { minRatingPositive: 4, maxRatingImprovement: 3, maxReviews: 10, showSplitSlide: true },
    refreshIntervalMinutes: 5,
    slideDurationSeconds: 10,
  });

  const ldScreen = await upsertScreen('seed-screen-ld', {
    name: 'Logistiekdirect Shopreviews',
    slug: 'logistiekdirect-reviews',
    brandId: ld.id,
    templateId: positiveTemplate.id,
    type: 'shop_reviews',
    config: { minRatingPositive: 4, maxRatingImprovement: 3, maxReviews: 10, showSplitSlide: false },
    refreshIntervalMinutes: 5,
    slideDurationSeconds: 10,
  });

  // Gecombineerd productreviews-scherm: brandId null = beide merken
  const productScreen = await upsertScreen('seed-screen-products', {
    name: 'Productreviews (LC + LD)',
    slug: 'productreviews',
    brandId: null,
    templateId: productTemplate.id,
    type: 'product_reviews',
    config: { maxReviews: 15 },
    refreshIntervalMinutes: 10,
    slideDurationSeconds: 12,
  });

  await prisma.syncLog.create({
    data: { source: 'seed', status: SyncStatus.success, message: 'Seed data geladen', startedAt: new Date(), finishedAt: new Date() },
  });

  console.log('\nSchermen aangemaakt:');
  console.log(`  LC:       /screens/${lcScreen.slug}?key=${lcScreen.screenKey}`);
  console.log(`  LD:       /screens/${ldScreen.slug}?key=${ldScreen.screenKey}`);
  console.log(`  Producten: /screens/${productScreen.slug}?key=${productScreen.screenKey}`);
  console.log('\nDone!');
}

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

async function upsertTemplate(id: string, data: {
  name: string; type: string;
  backgroundConfig: object; elements: object[];
}) {
  return prisma.slideTemplate.upsert({
    where: { id },
    update: {},
    create: {
      id,
      name: data.name,
      type: data.type,
      aspectRatio: '16:9',
      canvasWidth: 1920,
      canvasHeight: 1080,
      backgroundConfig: data.backgroundConfig,
      elements: data.elements,
      active: true,
    },
  });
}

async function upsertScreen(id: string, data: {
  name: string; slug: string; brandId: string | null; templateId: string;
  type: string; config: object; refreshIntervalMinutes: number; slideDurationSeconds: number;
}) {
  return prisma.screen.upsert({
    where: { id },
    update: {},
    create: {
      id,
      ...data,
      screenKey: randomUUID(),
      active: true,
    },
  });
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
