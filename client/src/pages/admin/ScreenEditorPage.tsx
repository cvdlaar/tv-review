import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';
import { Screen, StyleOverride, Brand, ShopReview, ProductReview, Product, TvSlide } from '../../types';
import { screensApi } from '../../api/screens';
import { SlideRenderer } from '../../tv/SlideRenderer';

const MOCK_REVIEW: ShopReview = {
  id: 'preview', brandId: '', sourceId: '', externalReviewId: '',
  rating: 5,
  reviewText: 'Snelle levering en uitstekende service. Het product was precies wat ik verwachtte en de communicatie was altijd vriendelijk en professioneel. Ik bestel zeker vaker bij jullie!',
  customerName: 'M. de Vries', reviewDate: '2026-06-10', sourceName: 'Kiyoh', createdAt: '',
};

const MOCK_PRODUCT_REVIEW: ProductReview = {
  id: 'preview', brandId: '', sourceId: '', externalReviewId: '',
  sku: 'SAMPLE-001', rating: 4,
  reviewText: 'Uitstekend product dat precies doet wat het moet doen. Goede kwaliteit voor de prijs, snel geleverd.',
  customerName: 'T. Janssen', reviewDate: '2026-06-10', sourceName: 'Kiyoh', createdAt: '',
};

const MOCK_PRODUCT: Product = {
  id: 'preview', brandId: '', sku: 'SAMPLE-001',
  name: 'Voorbeeldproduct Premium XL',
  url: null, imageUrl: null, price: 29.95,
};

const MOCK_SHOP_SLIDE: TvSlide = { type: 'positive', review: MOCK_REVIEW };
const MOCK_PRODUCT_SLIDE: TvSlide = { type: 'product', productReview: MOCK_PRODUCT_REVIEW, product: MOCK_PRODUCT };

// Schaal de 1920×1080 slide naar de breedte van de container
function SlidePreview({ brand, style, screenType }: { brand: Brand | null; style: StyleOverride; screenType: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setScale(containerRef.current.clientWidth / 1920);
      }
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const previewHeight = Math.round(1080 * scale);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: previewHeight, background: '#111', position: 'relative', overflow: 'hidden', borderRadius: 12 }}
    >
      <div
        style={{
          width: 1920,
          height: 1080,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        <SlideRenderer
          slide={screenType === 'product_reviews' ? MOCK_PRODUCT_SLIDE : MOCK_SHOP_SLIDE}
          brand={brand}
          styleOverride={style}
        />
      </div>
    </div>
  );
}

// Kleurpicker + hex-input gecombineerd
function ColorField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value || placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-9 h-9 rounded cursor-pointer border border-gray-200 p-0.5 flex-shrink-0"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#005eb8]/30"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="text-gray-300 hover:text-gray-500 text-xs"
            title="Resetten naar standaard"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

// Afbeelding upload + preview
function ImageUploadField({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setError('');
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await api.post<{ url: string }>('/uploads', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange(res.data.url);
    } catch {
      setError('Upload mislukt. Probeer een jpg/png/webp onder 10 MB.');
    } finally {
      setUploading(false);
    }
  }, [onChange]);

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-gray-600">Achtergrondafbeelding</label>

      {/* Drop-zone / klik */}
      <div
        className={`relative border-2 border-dashed rounded-xl transition-colors cursor-pointer ${
          uploading ? 'border-gray-200 bg-gray-50' : 'border-gray-200 hover:border-[#005eb8]/50 hover:bg-blue-50/30'
        }`}
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
      >
        {value ? (
          <div className="relative">
            <img
              src={value}
              alt="Achtergrond"
              className="w-full h-32 object-cover rounded-xl"
            />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors rounded-xl flex items-center justify-center opacity-0 hover:opacity-100">
              <span className="text-white text-sm font-medium">Vervangen</span>
            </div>
          </div>
        ) : (
          <div className="py-8 flex flex-col items-center gap-2 text-gray-400">
            {uploading ? (
              <span className="text-sm">Uploaden...</span>
            ) : (
              <>
                <span className="text-2xl">↑</span>
                <span className="text-sm">Klik of sleep een afbeelding</span>
                <span className="text-xs">JPG, PNG of WebP · max 10 MB</span>
              </>
            )}
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />

      {error && <p className="text-xs text-red-500">{error}</p>}

      {value && (
        <button
          onClick={() => onChange('')}
          className="text-xs text-gray-400 hover:text-red-500 underline"
        >
          Afbeelding verwijderen
        </button>
      )}
    </div>
  );
}

// Sectietitel
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1.5">{title}</div>
      {children}
    </div>
  );
}

export function ScreenEditorPage() {
  const { id } = useParams<{ id: string }>();

  const [screen, setScreen] = useState<Screen | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [style, setStyle] = useState<StyleOverride>({});

  useEffect(() => {
    if (!id) return;
    screensApi.get(id).then((s) => {
      setScreen(s);
      const cfg = s.config as { style?: StyleOverride };
      setStyle(cfg.style ?? {});
    }).finally(() => setLoading(false));
  }, [id]);

  const set = <K extends keyof StyleOverride>(key: K, value: StyleOverride[K]) => {
    setStyle((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const unset = <K extends keyof StyleOverride>(key: K) => {
    setStyle((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setSaved(false);
  };

  const save = async () => {
    if (!screen) return;
    setSaving(true);
    try {
      const existingConfig = screen.config as Record<string, unknown>;
      const updated = await screensApi.update(screen.id, {
        config: { ...existingConfig, style },
      });
      setScreen((prev) => prev ? { ...prev, config: updated.config } : prev);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Laden...</div>;
  if (!screen) return <div className="p-8 text-red-500">Scherm niet gevonden.</div>;

  const brand = screen.brand
    ? ({ ...screen.brand, id: screen.brandId ?? '', domain: '', logoUrl: null, channableFeedUrl: null, secondaryColor: '', active: true, createdAt: '', updatedAt: '' } as Brand)
    : null;

  const primaryFallback = brand?.primaryColor ?? '#005eb8';
  const accentFallback = brand?.accentColor ?? '#e57200';

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/admin/screens" className="text-gray-400 hover:text-gray-700 text-sm">
            ← TV-schermen
          </Link>
          <div className="w-px h-4 bg-gray-200" />
          <div>
            <span className="font-semibold text-gray-900">{screen.name}</span>
            <span className="text-gray-400 text-sm ml-2">— Stijleditor</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-sm text-green-600 font-medium">✓ Opgeslagen</span>}
          <button
            onClick={save}
            disabled={saving}
            className="px-5 py-2 bg-[#005eb8] text-white text-sm font-semibold rounded-lg hover:bg-[#004a93] transition-colors disabled:opacity-60"
          >
            {saving ? 'Opslaan...' : 'Opslaan'}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0">
        {/* Preview */}
        <div className="flex-1 p-6 flex flex-col gap-4 overflow-hidden">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Voorbeeld — {screen.type === 'product_reviews' ? 'ProductReviewSlide' : 'PositiveReviewSlide'}
          </div>
          <SlidePreview brand={brand} style={style} screenType={screen.type} />
          <p className="text-xs text-gray-400 text-center">
            Preview gebruikt mockdata · echte reviews worden op de TV getoond
          </p>
        </div>

        {/* Controls */}
        <div className="w-96 bg-white border-l border-gray-100 overflow-y-auto flex-shrink-0">
          <div className="p-6 space-y-7">

            <Section title="Layout">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Slide stijl</label>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { value: 'default', label: 'Donker', desc: 'Gradient achtergrond, witte tekst' },
                    { value: 'brand-split', label: 'Brand Split', desc: 'Foto links met chevron-scheiding, witte rechterkant' },
                    { value: 'composed', label: 'Samengesteld', desc: 'Eigen achtergrond met scheiding, tekst als overlay' },
                  ] as const).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => set('layoutStyle', opt.value)}
                      className={`p-3 rounded-xl border-2 text-left transition-colors ${
                        (style.layoutStyle ?? 'default') === opt.value
                          ? 'border-[#005eb8] bg-[#005eb8]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`text-sm font-semibold mb-0.5 ${(style.layoutStyle ?? 'default') === opt.value ? 'text-[#005eb8]' : 'text-gray-700'}`}>
                        {opt.label}
                      </div>
                      <div className="text-xs text-gray-400 leading-snug">{opt.desc}</div>
                    </button>
                  ))}
                </div>
                {(style.layoutStyle ?? 'default') === 'brand-split' && (
                  <p className="text-xs text-[#005eb8]/70 mt-2 bg-[#005eb8]/5 rounded-lg px-3 py-2">
                    Upload een foto als achtergrond — die komt links van de chevron-scheiding.
                  </p>
                )}
                {(style.layoutStyle ?? 'default') === 'composed' && (
                  <>
                    <p className="text-xs text-[#005eb8]/70 mt-2 bg-[#005eb8]/5 rounded-lg px-3 py-2">
                      Maak je achtergrond (1920×1080) in Canva of Photoshop — inclusief de scheiding. Upload hem hieronder.
                    </p>
                    <div className="mt-3">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Tekst begint op: {style.composedTextLeft ?? 980}px
                      </label>
                      <input
                        type="range"
                        min={400}
                        max={1600}
                        step={20}
                        value={style.composedTextLeft ?? 980}
                        onChange={(e) => set('composedTextLeft', Number(e.target.value))}
                        className="w-full accent-[#005eb8]"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                        <span>Links</span><span>Rechts</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Section>

            {(style.layoutStyle === 'brand-split' || style.layoutStyle === 'composed') && (
              <Section title="Titel links">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => set('headingOnLeft', !(style.headingOnLeft ?? false))}
                    className={`w-10 h-6 rounded-full transition-colors flex-shrink-0 flex items-center px-0.5 ${
                      style.headingOnLeft ? 'bg-[#005eb8]' : 'bg-gray-200'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${style.headingOnLeft ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700">Titel op de foto zijde</div>
                    <div className="text-xs text-gray-400">Toont "Dit / Gaat / Goed" gestapeld links — laatste woord in de accentkleur</div>
                  </div>
                </label>
              </Section>
            )}

            <Section title="Kleuren">
              <ColorField
                label="Primaire kleur"
                value={style.primaryColor ?? ''}
                placeholder={primaryFallback}
                onChange={(v) => v ? set('primaryColor', v) : unset('primaryColor')}
              />
              <ColorField
                label="Accentkleur"
                value={style.accentColor ?? ''}
                placeholder={accentFallback}
                onChange={(v) => v ? set('accentColor', v) : unset('accentColor')}
              />
              <ColorField
                label="Sterkleur"
                value={style.starColor ?? ''}
                placeholder={style.accentColor ?? accentFallback}
                onChange={(v) => v ? set('starColor', v) : unset('starColor')}
              />
              <ColorField
                label="Reviewtekst kleur"
                value={style.reviewTextColor ?? ''}
                placeholder="#ffffff"
                onChange={(v) => v ? set('reviewTextColor', v) : unset('reviewTextColor')}
              />
              <ColorField
                label="Auteursnaam kleur"
                value={style.authorTextColor ?? ''}
                placeholder="rgba(255,255,255,0.80)"
                onChange={(v) => v ? set('authorTextColor', v) : unset('authorTextColor')}
              />
            </Section>

            <Section title="Achtergrond">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Type achtergrond</label>
                <select
                  value={style.backgroundType ?? 'default'}
                  onChange={(e) => set('backgroundType', e.target.value as StyleOverride['backgroundType'])}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005eb8]/30"
                >
                  <option value="default">Standaard (gradient)</option>
                  <option value="color">Effen kleur</option>
                  <option value="gradient">Aangepast verloop</option>
                  <option value="image">Afbeelding</option>
                </select>
              </div>

              {style.backgroundType === 'color' && (
                <ColorField
                  label="Achtergrondkleur"
                  value={style.backgroundColor ?? ''}
                  placeholder={primaryFallback}
                  onChange={(v) => v ? set('backgroundColor', v) : unset('backgroundColor')}
                />
              )}

              {style.backgroundType === 'gradient' && (
                <>
                  <ColorField
                    label="Verloop van"
                    value={style.backgroundFrom ?? ''}
                    placeholder={primaryFallback}
                    onChange={(v) => v ? set('backgroundFrom', v) : unset('backgroundFrom')}
                  />
                  <ColorField
                    label="Verloop naar"
                    value={style.backgroundTo ?? ''}
                    placeholder="#0a1628"
                    onChange={(v) => v ? set('backgroundTo', v) : unset('backgroundTo')}
                  />
                </>
              )}

              {style.backgroundType === 'image' && (
                <>
                  <ImageUploadField
                    value={style.backgroundImage ?? ''}
                    onChange={(url) => url ? set('backgroundImage', url) : unset('backgroundImage')}
                  />
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Overlay donkerte: {style.backgroundOverlayOpacity ?? 50}%
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={90}
                      value={style.backgroundOverlayOpacity ?? 50}
                      onChange={(e) => set('backgroundOverlayOpacity', Number(e.target.value))}
                      className="w-full accent-[#005eb8]"
                    />
                  </div>
                </>
              )}
            </Section>

            <Section title="Tekst">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Hoofdtitel slide</label>
                <input
                  type="text"
                  value={style.headingText ?? ''}
                  onChange={(e) => e.target.value ? set('headingText', e.target.value) : unset('headingText')}
                  placeholder="Dit gaat goed"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005eb8]/30"
                />
                <p className="text-xs text-gray-400 mt-1">Leeg = standaard tekst</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Ondertitel</label>
                <input
                  type="text"
                  value={style.subtitleText ?? ''}
                  onChange={(e) => e.target.value ? set('subtitleText', e.target.value) : unset('subtitleText')}
                  placeholder="Wat klanten recent over ons zeggen"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005eb8]/30"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Reviewtekst grootte</label>
                <div className="flex gap-2">
                  {(['small', 'medium', 'large'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => set('reviewTextSize', size)}
                      className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${
                        (style.reviewTextSize ?? 'medium') === size
                          ? 'border-[#005eb8] bg-[#005eb8]/10 text-[#005eb8] font-medium'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {size === 'small' ? 'Klein' : size === 'medium' ? 'Middel' : 'Groot'}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Klein = meer tekst · Groot = minder tekst, grotere letters
                </p>
              </div>
            </Section>

            <Section title={screen.type === 'product_reviews' ? 'Positie reviewtekst (rechterkant)' : 'Positie reviewtekst'}>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Horizontaal verschuiven: {style.reviewOffsetX ?? 0}px
                </label>
                <input
                  type="range"
                  min={-300}
                  max={300}
                  value={style.reviewOffsetX ?? 0}
                  onChange={(e) => set('reviewOffsetX', Number(e.target.value))}
                  className="w-full accent-[#005eb8]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Verticaal verschuiven: {style.reviewOffsetY ?? 0}px
                </label>
                <input
                  type="range"
                  min={-300}
                  max={300}
                  value={style.reviewOffsetY ?? 0}
                  onChange={(e) => set('reviewOffsetY', Number(e.target.value))}
                  className="w-full accent-[#005eb8]"
                />
              </div>
              {((style.reviewOffsetX ?? 0) !== 0 || (style.reviewOffsetY ?? 0) !== 0) && (
                <button
                  onClick={() => { set('reviewOffsetX', 0); set('reviewOffsetY', 0); }}
                  className="text-xs text-gray-400 hover:text-gray-600 underline"
                >
                  Positie resetten
                </button>
              )}
            </Section>

            <Section title="Tekstvak afmetingen">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Breedte: {style.reviewMaxWidth ?? 980}px
                </label>
                <input
                  type="range"
                  min={300}
                  max={1800}
                  step={20}
                  value={style.reviewMaxWidth ?? 980}
                  onChange={(e) => set('reviewMaxWidth', Number(e.target.value))}
                  className="w-full accent-[#005eb8]"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                  <span>Smal</span><span>Breed</span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-gray-600">
                    Max hoogte: {style.reviewMaxHeight ? `${style.reviewMaxHeight}px` : 'onbeperkt'}
                  </label>
                  {style.reviewMaxHeight && (
                    <button
                      onClick={() => unset('reviewMaxHeight')}
                      className="text-xs text-gray-400 hover:text-gray-600 underline"
                    >
                      Verwijderen
                    </button>
                  )}
                </div>
                <input
                  type="range"
                  min={0}
                  max={600}
                  step={20}
                  value={style.reviewMaxHeight ?? 0}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    v > 0 ? set('reviewMaxHeight', v) : unset('reviewMaxHeight');
                  }}
                  className="w-full accent-[#005eb8]"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Schuif naar links = geen limiet · tekst die te lang is wordt afgekapt
                </p>
              </div>
            </Section>

            {screen.type === 'product_reviews' && (
              <Section title="Product elementen">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Breedte productvak: {style.productSectionWidth ?? 760}px
                  </label>
                  <input
                    type="range"
                    min={300}
                    max={1100}
                    step={20}
                    value={style.productSectionWidth ?? 760}
                    onChange={(e) => set('productSectionWidth', Number(e.target.value))}
                    className="w-full accent-[#005eb8]"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                    <span>Smal</span><span>Breed</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Positie productvak: {style.productSectionOffsetX ?? 0}px
                  </label>
                  <input
                    type="range"
                    min={-200}
                    max={400}
                    step={10}
                    value={style.productSectionOffsetX ?? 0}
                    onChange={(e) => set('productSectionOffsetX', Number(e.target.value))}
                    className="w-full accent-[#005eb8]"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                    <span>Links</span><span>Rechts</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Label boven beoordeling</label>
                  <input
                    type="text"
                    value={style.productLabelText ?? ''}
                    onChange={(e) => e.target.value ? set('productLabelText', e.target.value) : unset('productLabelText')}
                    placeholder="Productfeedback"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005eb8]/30"
                  />
                </div>

                <ColorField
                  label="Productnaam kleur"
                  value={style.productNameColor ?? ''}
                  placeholder="#ffffff"
                  onChange={(v) => v ? set('productNameColor', v) : unset('productNameColor')}
                />

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">Productnaam grootte</label>
                  <div className="flex gap-2">
                    {(['small', 'medium', 'large'] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => set('productNameSize', size)}
                        className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${
                          (style.productNameSize ?? 'medium') === size
                            ? 'border-[#005eb8] bg-[#005eb8]/10 text-[#005eb8] font-medium'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {size === 'small' ? 'Klein' : size === 'medium' ? 'Middel' : 'Groot'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Productafbeelding grootte: {style.productImageSize ?? 640}px
                  </label>
                  <input
                    type="range"
                    min={200}
                    max={740}
                    step={20}
                    value={style.productImageSize ?? 640}
                    onChange={(e) => set('productImageSize', Number(e.target.value))}
                    className="w-full accent-[#005eb8]"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                    <span>Klein</span><span>Groot</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div
                      onClick={() => set('showSku', !(style.showSku ?? true))}
                      className={`w-10 h-6 rounded-full transition-colors flex-shrink-0 flex items-center px-0.5 ${
                        (style.showSku ?? true) ? 'bg-[#005eb8]' : 'bg-gray-200'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${(style.showSku ?? true) ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                    <span className="text-sm text-gray-700">SKU weergeven</span>
                  </label>

                  {(style.showSku ?? true) && (
                    <ColorField
                      label="SKU kleur"
                      value={style.skuColor ?? ''}
                      placeholder="rgba(255,255,255,0.4)"
                      onChange={(v) => v ? set('skuColor', v) : unset('skuColor')}
                    />
                  )}

                  <label className="flex items-center gap-3 cursor-pointer">
                    <div
                      onClick={() => set('showPrice', !(style.showPrice ?? false))}
                      className={`w-10 h-6 rounded-full transition-colors flex-shrink-0 flex items-center px-0.5 ${
                        (style.showPrice ?? false) ? 'bg-[#005eb8]' : 'bg-gray-200'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${(style.showPrice ?? false) ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                    <span className="text-sm text-gray-700">Prijs weergeven</span>
                  </label>
                </div>
              </Section>
            )}

            <Section title="Overige instellingen">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Slide duur (sec)</label>
                  <input
                    type="number"
                    min={3}
                    max={60}
                    defaultValue={screen.slideDurationSeconds}
                    onBlur={(e) => {
                      const v = Number(e.target.value);
                      if (v >= 3) screensApi.update(screen.id, { slideDurationSeconds: v }).then((u) => setScreen((prev) => prev ? { ...prev, slideDurationSeconds: u.slideDurationSeconds } : prev));
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005eb8]/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Refresh (min)</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    defaultValue={screen.refreshIntervalMinutes}
                    onBlur={(e) => {
                      const v = Number(e.target.value);
                      if (v >= 1) screensApi.update(screen.id, { refreshIntervalMinutes: v }).then((u) => setScreen((prev) => prev ? { ...prev, refreshIntervalMinutes: u.refreshIntervalMinutes } : prev));
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005eb8]/30"
                  />
                </div>
              </div>
            </Section>

            <div className="pt-2">
              <button
                onClick={save}
                disabled={saving}
                className="w-full py-3 bg-[#005eb8] text-white font-semibold rounded-xl hover:bg-[#004a93] transition-colors disabled:opacity-60"
              >
                {saving ? 'Opslaan...' : saved ? '✓ Opgeslagen' : 'Stijl opslaan'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
