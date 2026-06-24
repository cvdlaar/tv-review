import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { TvCanvas } from './TvCanvas';
import { SlideRenderer } from './SlideRenderer';
import { ScreenFallbackSlide } from './ScreenFallbackSlide';
import { fetchTvScreen } from '../api/public';
import { TvScreenData, TvSlide, Brand, StyleOverride } from '../types';

export function TvScreenPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const key = searchParams.get('key') ?? '';

  const [data, setData] = useState<TvScreenData | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  const dataRef = useRef<TvScreenData | null>(null);
  dataRef.current = data;

  const load = useCallback(async () => {
    if (!slug || !key) { setError(true); setLoading(false); return; }
    try {
      const result = await fetchTvScreen(slug, key);
      setData(result);
      setError(false);
      setCurrentIndex(0);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [slug, key]);

  // Initial load
  useEffect(() => {
    load();
  }, [load]);

  // Auto-refresh data
  useEffect(() => {
    if (!data) return;
    const intervalMs = data.screen.refreshIntervalMinutes * 60 * 1000;
    const timer = setInterval(load, intervalMs);
    return () => clearInterval(timer);
  }, [data, load]);

  // Auto-advance slides with fade
  useEffect(() => {
    if (!data || data.slides.length <= 1) return;
    const duration = data.screen.slideDurationSeconds * 1000;

    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % (dataRef.current?.slides.length ?? 1));
        setVisible(true);
      }, 500);
    }, duration);

    return () => clearInterval(timer);
  }, [data]);

  // Hide cursor for TV display
  useEffect(() => {
    document.body.style.cursor = 'none';
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.cursor = '';
      document.body.style.overflow = '';
    };
  }, []);

  const currentSlide: TvSlide | null = data?.slides[currentIndex] ?? null;
  const brand: Brand | null = (data?.screen.brand as Brand | null) ?? null;
  const styleOverride = (data?.screen.config as { style?: StyleOverride } | null)?.style;

  // Map API slide format to TvSlide format
  // The server returns { type, review } for shop slides and { type, review, product } for product slides
  type RawSlide = {
    type: string;
    review?: import('../types').ShopReview & import('../types').ProductReview;
    positiveReview?: import('../types').ShopReview;
    improvementReview?: import('../types').ShopReview;
    product?: import('../types').Product | null;
  };
  const raw = currentSlide as unknown as RawSlide;
  const mappedSlide: TvSlide | null = currentSlide
    ? {
        type: raw.type as TvSlide['type'],
        review: raw.type !== 'product' ? raw.review as import('../types').ShopReview | undefined : undefined,
        positiveReview: raw.positiveReview,
        improvementReview: raw.improvementReview,
        productReview: raw.type === 'product' ? raw.review as import('../types').ProductReview | undefined : undefined,
        product: raw.product,
      }
    : null;

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#000' }}>
      <TvCanvas>
        <div
          style={{
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.5s ease-in-out',
            width: 1920,
            height: 1080,
          }}
        >
          {loading ? (
            <ScreenFallbackSlide type="loading" />
          ) : error ? (
            <ScreenFallbackSlide type="error" />
          ) : !mappedSlide ? (
            <ScreenFallbackSlide type="empty" />
          ) : (
            <SlideRenderer slide={mappedSlide} brand={brand} styleOverride={styleOverride} />
          )}
        </div>

        {/* Logo / label rechtsonder — buiten de fade-div zodat het altijd zichtbaar is */}
        {brand && (
          <div
            style={{
              position: 'absolute',
              bottom: 48,
              right: 64,
              zIndex: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}
          >
            {brand.logoUrl ? (
              <img
                src={brand.logoUrl}
                alt={brand.name}
                style={{ maxWidth: 220, maxHeight: 64, objectFit: 'contain', display: 'block' }}
              />
            ) : (
              <span
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.85)',
                  letterSpacing: '0.02em',
                  textShadow: '0 1px 4px rgba(0,0,0,0.4)',
                  fontFamily: 'sans-serif',
                }}
              >
                {brand.name}
              </span>
            )}
          </div>
        )}
      </TvCanvas>

      {/* Voortgangsbalk onderaan */}
      {data && data.slides.length > 1 && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            background: 'rgba(255,255,255,0.15)',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              height: '100%',
              background: '#e57200',
              width: `${((currentIndex + 1) / data.slides.length) * 100}%`,
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      )}
    </div>
  );
}
