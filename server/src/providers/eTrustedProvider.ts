import { ReviewSource } from '@prisma/client';
import * as https from 'https';
import { ReviewProvider, ShopReviewInput, ProductReviewInput } from './types';

const TOKEN_URL = 'https://login.etrusted.com/oauth/token';
const API_BASE  = 'https://api.etrusted.com';
const PAGE_SIZE = 100;

// SSL-agent die corporate certificate inspection omzeilt (zelfde aanpak als Prisma)
const agent = new https.Agent({ rejectUnauthorized: false });

interface TokenCache { token: string; expiresAt: number }
interface EtrustedReview {
  id: string; rating: number; comment?: string;
  submittedAt?: string; updatedAt?: string;
  status?: string;
  reviewer?: { firstName?: string; lastName?: string; name?: string };
  product?: { sku?: string; name?: string };
}
interface ReviewsResponse {
  items: EtrustedReview[];
  totalElements?: number;
  pagination?: { count: number; page: number; total: number };
}

const tokenCaches = new Map<string, TokenCache>();

function httpsRequest(url: string, options: https.RequestOptions, body?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = https.request(
      { ...options, hostname: parsed.hostname, path: parsed.pathname + parsed.search, agent },
      (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          } else {
            resolve(data);
          }
        });
      },
    );
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function parseRef(ref: string): { credentialKey: string; channelRef: string } {
  const i = ref.indexOf('|');
  return i === -1
    ? { credentialKey: '', channelRef: ref }
    : { credentialKey: ref.slice(0, i).toUpperCase(), channelRef: ref.slice(i + 1) };
}

function getCredentials(credentialKey: string): { clientId: string; clientSecret: string } {
  const prefix = credentialKey ? `TRUSTED_SHOPS_${credentialKey}_` : 'TRUSTED_SHOPS_';
  const clientId     = process.env[`${prefix}CLIENT_ID`]?.trim();
  const clientSecret = process.env[`${prefix}CLIENT_SECRET`]?.trim();
  if (!clientId || !clientSecret) {
    throw new Error(`${prefix}CLIENT_ID en ${prefix}CLIENT_SECRET ontbreken in .env`);
  }
  console.log(`[etrusted] Credentials geladen voor "${credentialKey}": client_id="${clientId}" (${clientId.length} tekens), secret (${clientSecret.length} tekens)`);
  return { clientId, clientSecret };
}

async function getToken(credentialKey: string): Promise<string> {
  const cached = tokenCaches.get(credentialKey);
  if (cached && Date.now() < cached.expiresAt - 60_000) return cached.token;

  const { clientId, clientSecret } = getCredentials(credentialKey);
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  }).toString();

  console.log(`[etrusted] Token ophalen: POST ${TOKEN_URL}`);
  console.log(`[etrusted]   client_id="${clientId}" (${clientId.length} chars)`);
  console.log(`[etrusted]   body="${body}"`);

  const raw = await httpsRequest(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(body),
      'Accept': 'application/json',
      'User-Agent': 'tv-slides/1.0',
    },
  }, body).catch((e) => { throw new Error(`Token-aanvraag mislukt: ${e.message}`); });

  console.log(`[etrusted] Token ontvangen voor "${credentialKey}"`);
  const data = JSON.parse(raw) as { access_token: string; expires_in: number };
  const entry: TokenCache = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  tokenCaches.set(credentialKey, entry);
  return entry.token;
}

async function fetchAllReviews(channelRef: string, token: string): Promise<EtrustedReview[]> {
  const all: EtrustedReview[] = [];
  let page = 0;

  while (true) {
    // Endpoint matched to working PHP implementation (no /v1/ prefix, "channels" param)
    const url = new URL(`${API_BASE}/reviews`);
    url.searchParams.set('channels', channelRef);
    url.searchParams.set('count', String(PAGE_SIZE));
    url.searchParams.set('page', String(page));
    url.searchParams.set('orderBy', 'submittedAt');

    const raw = await httpsRequest(url.toString(), {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });

    const data = JSON.parse(raw) as ReviewsResponse;
    const items = (data.items ?? []).filter((r) => r.status !== 'REJECTED');
    all.push(...items);

    const total = data.totalElements ?? data.pagination?.total ?? items.length;
    if (all.length >= total || items.length < PAGE_SIZE) break;
    page++;
  }

  return all;
}

function reviewerName(r?: EtrustedReview['reviewer']): string | undefined {
  if (!r) return undefined;
  if (r.name) return r.name;
  const parts = [r.firstName, r.lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : undefined;
}

function resolveSource(source: ReviewSource) {
  if (!source.apiKeyReference) throw new Error(`ReviewSource ${source.id} heeft geen channelRef`);
  return parseRef(source.apiKeyReference);
}

export const eTrustedProvider: ReviewProvider = {
  async fetchShopReviews({ source }: { source: ReviewSource }): Promise<ShopReviewInput[]> {
    const { credentialKey, channelRef } = resolveSource(source);
    const token = await getToken(credentialKey);
    const items = await fetchAllReviews(channelRef, token);
    return items
      .filter((r) => r.comment?.trim())
      .map((r) => ({
        externalReviewId: r.id,
        rating: Math.round(r.rating),
        reviewText: r.comment!.trim(),
        customerName: reviewerName(r.reviewer),
        reviewDate: new Date(r.submittedAt ?? r.updatedAt ?? Date.now()),
        sourceName: 'Trusted Shops',
      }));
  },

  async fetchProductReviews({ source }: { source: ReviewSource }): Promise<ProductReviewInput[]> {
    const { credentialKey, channelRef } = resolveSource(source);
    const token = await getToken(credentialKey);
    const items = await fetchAllReviews(channelRef, token);
    return items
      .filter((r) => r.comment?.trim() && r.product?.sku)
      .map((r) => ({
        externalReviewId: r.id,
        sku: r.product!.sku!,
        rating: Math.round(r.rating),
        reviewText: r.comment!.trim(),
        customerName: reviewerName(r.reviewer),
        reviewDate: new Date(r.submittedAt ?? r.updatedAt ?? Date.now()),
        sourceName: 'Trusted Shops',
      }));
  },
};
