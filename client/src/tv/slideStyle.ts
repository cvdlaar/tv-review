import type { CSSProperties } from 'react';
import { StyleOverride } from '../types';

export function resolveBackground(so: StyleOverride | undefined, primaryColor: string): CSSProperties {
  const type = so?.backgroundType ?? 'default';
  if (type === 'color')    return { background: so?.backgroundColor ?? primaryColor };
  if (type === 'gradient') return { background: `linear-gradient(135deg, ${so?.backgroundFrom ?? primaryColor} 0%, ${so?.backgroundTo ?? '#0a1628'} 100%)` };
  if (type === 'image' && so?.backgroundImage) return { background: '#000' };
  return { background: `linear-gradient(135deg, ${primaryColor} 0%, #0a1628 65%)` };
}

export function reviewFontSize(so: StyleOverride | undefined): number {
  return ({ small: 36, medium: 44, large: 56 } as const)[so?.reviewTextSize ?? 'medium'];
}

export function reviewMaxChars(so: StyleOverride | undefined): number {
  return ({ small: 300, medium: 220, large: 160 } as const)[so?.reviewTextSize ?? 'medium'];
}
