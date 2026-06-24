import { useEffect, useRef, useState } from 'react';
import { Brand } from '../../types';
import { brandsApi } from '../../api/brands';
import api from '../../api/client';

export function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [feedUrl, setFeedUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingLogoFor, setUploadingLogoFor] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const logoTargetId = useRef<string | null>(null);

  useEffect(() => {
    brandsApi.list().then(setBrands).finally(() => setLoading(false));
  }, []);

  const openEdit = (brand: Brand) => {
    setFeedUrl(brand.channableFeedUrl ?? '');
    setEditingBrand(brand);
  };

  const openLogoUpload = (brandId: string) => {
    logoTargetId.current = brandId;
    logoInputRef.current?.click();
  };

  const onLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const id = logoTargetId.current;
    if (!file || !id) return;
    e.target.value = '';

    setUploadingLogoFor(id);
    try {
      const form = new FormData();
      form.append('file', file);
      const { url: logoUrl } = await api.post<{ url: string }>('/uploads', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then((r) => r.data);
      const updated = await api.put<Brand>(`/brands/${id}`, { logoUrl }).then((r) => r.data);
      setBrands((prev) => prev.map((b) => b.id === id ? { ...b, ...updated } : b));
    } catch {
      alert('Logo uploaden mislukt.');
    } finally {
      setUploadingLogoFor(null);
    }
  };

  const removeLogo = async (brand: Brand) => {
    if (!confirm(`Logo van ${brand.name} verwijderen?`)) return;
    const updated = await api.put<Brand>(`/brands/${brand.id}`, { logoUrl: null }).then((r) => r.data);
    setBrands((prev) => prev.map((b) => b.id === brand.id ? { ...b, ...updated } : b));
  };

  const saveFeedUrl = async () => {
    if (!editingBrand) return;
    setSaving(true);
    try {
      const updated = await api.put<Brand>(`/brands/${editingBrand.id}`, {
        channableFeedUrl: feedUrl || null,
      }).then((r) => r.data);
      setBrands((prev) => prev.map((b) => b.id === editingBrand.id ? { ...b, ...updated } : b));
      setEditingBrand(null);
    } catch {
      alert('Opslaan mislukt.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Laden...</div>;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Merken</h1>
        <p className="text-gray-500 mt-1">Beheer de merken en hun huisstijl</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {brands.map((brand) => {
          const feedUrl = brand.channableFeedUrl;
          return (
            <div key={brand.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  {/* Logo of initiaal */}
                  <div className="relative group">
                    {brand.logoUrl ? (
                      <img
                        src={brand.logoUrl}
                        alt={brand.name}
                        className="w-12 h-12 object-contain rounded-xl border border-gray-100 bg-white p-1"
                      />
                    ) : (
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                        style={{ background: brand.primaryColor }}
                      >
                        {brand.name.charAt(0)}
                      </div>
                    )}
                    <button
                      onClick={() => openLogoUpload(brand.id)}
                      disabled={uploadingLogoFor === brand.id}
                      className="absolute inset-0 rounded-xl bg-black/50 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      title="Logo uploaden"
                    >
                      {uploadingLogoFor === brand.id ? '...' : '↑'}
                    </button>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{brand.name}</div>
                    <div className="text-sm text-gray-400">{brand.domain}</div>
                    {brand.logoUrl && (
                      <button
                        onClick={() => removeLogo(brand)}
                        className="text-xs text-red-400 hover:text-red-600 mt-0.5"
                      >
                        Logo verwijderen
                      </button>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => openEdit(brand)}
                  className="text-sm text-[#005eb8] hover:underline"
                >
                  Feed instellen
                </button>
              </div>

              <div className="flex gap-2 mb-3">
                {[brand.primaryColor, brand.secondaryColor, brand.accentColor].map((color, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded border border-gray-200" style={{ background: color }} />
                    <span className="text-xs text-gray-500 font-mono">{color}</span>
                  </div>
                ))}
              </div>

              {feedUrl ? (
                <div className="flex items-center gap-2 bg-green-50 rounded-lg px-3 py-2">
                  <span className="text-green-600 text-xs">✓</span>
                  <span className="text-xs text-green-700 font-medium">Channable feed ingesteld</span>
                  <span className="text-xs text-gray-400 font-mono truncate flex-1">{feedUrl}</span>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-400">
                  Geen Channable feed-URL ingesteld
                </div>
              )}
            </div>
          );
        })}
        {brands.length === 0 && (
          <div className="col-span-2 text-center py-12 text-gray-400">Geen merken gevonden</div>
        )}
      </div>

      {/* Hidden logo file input */}
      <input
        ref={logoInputRef}
        type="file"
        accept="image/*"
        onChange={onLogoFileChange}
        className="hidden"
      />

      {/* Feed-URL modal */}
      {editingBrand && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Channable feed-URL</h2>
              <p className="text-sm text-gray-500 mt-0.5">{editingBrand.name}</p>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Feed-URL</label>
                <input
                  type="url"
                  value={feedUrl}
                  onChange={(e) => setFeedUrl(e.target.value)}
                  placeholder="https://feeds.channable.com/..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Te vinden in Channable → Export → jouw feed → Feed URL
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
                Producten worden automatisch bijgewerkt op de 1e van elke maand om 03:00.
                Wil je een ander tijdstip? Pas <code className="font-mono">FEED_CRON</code> aan in <code className="font-mono">.env</code>.
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setEditingBrand(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Annuleren
              </button>
              {feedUrl && (
                <button
                  onClick={() => setFeedUrl('')}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-gray-600"
                >
                  Verwijderen
                </button>
              )}
              <button
                onClick={saveFeedUrl}
                disabled={saving}
                className="px-5 py-2 bg-[#005eb8] text-white text-sm font-semibold rounded-lg hover:bg-[#004a93] transition-colors disabled:opacity-60"
              >
                {saving ? 'Opslaan...' : 'Opslaan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
