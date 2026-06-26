import { useEffect, ReactNode } from 'react';

const CANVAS_W = 1920;
const CANVAS_H = 1080;

interface Props {
  children: ReactNode;
}

export function TvCanvas({ children }: Props) {
  // Forceer viewport op 1920 zodat de Pi dezelfde basisbreedte gebruikt als desktop
  useEffect(() => {
    const meta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement | null;
    const original = meta?.getAttribute('content') ?? '';
    meta?.setAttribute('content', 'width=1920, initial-scale=1');
    return () => { meta?.setAttribute('content', original); };
  }, []);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: '#000',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div
        style={{
          width: CANVAS_W,
          height: CANVAS_H,
          position: 'absolute',
          top: '50%',
          left: '50%',
          // Pure CSS schaling: 100vw / 1920 geeft altijd de juiste verhouding
          transform: `translate(-50%, -50%) scale(calc(100vw / ${CANVAS_W}))`,
          transformOrigin: 'center center',
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  );
}
