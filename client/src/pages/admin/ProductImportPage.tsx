import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Brand, Product } from '../../types';
import { brandsApi } from '../../api/brands';
import api from '../../api/client';

interface SyncResult {
  imported: number;
  skipped: number;
  errors: string[];
  fieldMap?: Record<string, string>;
}

const FIELD_LABELS: Record<string, string> = {
  sku: 'SKU',
  name: 'Naam',
  imageUrl: 'Afbeelding',
  url: 'URL',
  price: 'Prijs',
};

export function ProductImportPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandId, setBrandId] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    brandsApi.list().then((b) => {
      setBrands(b);
      if (b.length > 0) setBrandId(b[0].id);
    });
  }, []);

  useEffect(() => {
    if (!brandId) return;
    setLoadingProducts(true);
    api.get<Product[]>(`/products?brandId=${brandId}`)
      .then((r) => setProducts(r.data))
      .finally(() => setLoadingProducts(false));
  }, [brandId, result]);

  const selectedBrand = brands.find((b) => b.id === brandId);

  const syncFeed = async () => {
    if (!brandId) return;
    setSyncing(true);
    setResult(null);
    try {
      const res = await api.post<SyncResult>('/products/sync-feed', { brandId });
      setResult(res.data);
    } catch (e: unknown) {
      const data = (e as { response?: { data?: { error?: string } } })?.response?.data;
      setResult({ imported: 0, skipped: 0, errors: [data?.error ?? 'Onbekende fout — controleer de server-terminal'] });
    } finally {
      setSyncing(false);
    }
  };

  const deleteAll = async () => {
    if (!brandId) return;
    if (!confirm(`Alle producten van ${selectedBrand?.name ?? 'dit merk'} verwijderen?`)) return;
    await api.delete(`/products/all?brandId=${brandId}`);
    setProducts([]);
    setResult(null);
  };

  const isSuccess = result && result.imported > 0;
  const hasErrors = result && result.errors.length > 0;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Producten</h1>
        <p className="text-gray-500 mt-1">
          Haal de Channable productfeed op om producten bij te werken.
        </p>
      </div>

      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3 space-y-5">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-4">Channable feed ophalen</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Merk</label>
              <select
                value={brandId}
                onChange={(e) => { setBrandId(e.target.value); setResult(null); }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            {/* Feed-URL status */}
            {selectedBrand && (
              <div className={`rounded-lg px-4 py-3 mb-4 text-sm ${
                selectedBrand.channableFeedUrl
                  ? 'bg-green-50 text-green-800'
                  : 'bg-amber-50 text-amber-800'
              }`}>
                {selectedBrand.channableFeedUrl ? (
                  <div>
                    <span className="font-medium">Feed-URL ingesteld</span>
                    <div className="font-mono text-xs mt-0.5 truncate text-green-600">
                      {selectedBrand.channableFeedUrl}
                    </div>
                  </div>
                ) : (
                  <div>
                    Geen feed-URL ingesteld voor {selectedBrand.name}.{' '}
                    <Link to="/admin/brands" className="underline font-medium">Stel in bij Merken →</Link>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={syncFeed}
                disabled={!brandId || !selectedBrand?.channableFeedUrl || syncing}
                className="flex-1 py-3 bg-[#005eb8] text-white font-semibold rounded-xl hover:bg-[#004a93] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {syncing ? 'Ophalen...' : 'Nu ophalen'}
              </button>
              <button
                onClick={deleteAll}
                disabled={!brandId || products.length === 0}
                className="px-4 py-3 text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-sm font-medium"
              >
                Alles wissen
              </button>
            </div>

            <p className="text-xs text-gray-400 mt-3">
              Automatische sync: elke 1e van de maand om 03:00 (instelbaar via <code>FEED_CRON</code> in .env).
            </p>
          </div>

          {result && (
            <div className={`rounded-xl p-5 border ${hasErrors && !isSuccess ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
              <div className="font-semibold text-gray-900 mb-3">Resultaat</div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700">{result.imported}</div>
                  <div className="text-xs text-gray-500">Geïmporteerd</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-400">{result.skipped}</div>
                  <div className="text-xs text-gray-500">Overgeslagen</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${hasErrors ? 'text-red-500' : 'text-gray-300'}`}>{result.errors.length}</div>
                  <div className="text-xs text-gray-500">Fouten</div>
                </div>
              </div>

              {result.fieldMap && Object.keys(result.fieldMap).length > 0 && (
                <div className="bg-white rounded-lg p-3 mb-3">
                  <div className="text-xs font-medium text-gray-500 mb-2">Gemapte velden:</div>
                  <div className="space-y-1">
                    {Object.entries(result.fieldMap).map(([field, col]) => (
                      <div key={field} className="flex items-center gap-2 text-xs">
                        <span className="font-medium text-gray-700 w-20">{FIELD_LABELS[field] ?? field}</span>
                        <span className="text-gray-400">←</span>
                        <span className="font-mono text-blue-600">{col}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {hasErrors && (
                <div className="bg-white rounded-lg p-3 text-xs text-red-700 font-mono space-y-1 max-h-32 overflow-auto">
                  {result.errors.map((e, i) => <div key={i}>{e}</div>)}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Producten ({products.length})</h2>
              {loadingProducts && <span className="text-xs text-gray-400">Laden...</span>}
            </div>
            <div className="divide-y divide-gray-50 max-h-[600px] overflow-auto">
              {products.map((p) => (
                <div key={p.id} className="flex items-center gap-3 px-5 py-3">
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-12 h-12 object-contain rounded-lg border border-gray-100 flex-shrink-0 bg-white"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-300 text-xl">📦</div>
                  )}
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{p.name}</div>
                    <div className="text-xs text-gray-400 font-mono">{p.sku}</div>
                    {p.price != null && <div className="text-xs text-gray-500">€{p.price.toFixed(2)}</div>}
                  </div>
                </div>
              ))}
              {!loadingProducts && products.length === 0 && (
                <div className="px-5 py-10 text-center text-gray-400 text-sm">Nog geen producten voor dit merk</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
