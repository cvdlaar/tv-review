import { useEffect, useState, ReactNode } from 'react';

const CANVAS_W = 1920;
const CANVAS_H = 1080;

interface Props {
  children: ReactNode;
}

function calcScale() {
  const w = window.innerWidth || screen.width || CANVAS_W;
  const h = window.innerHeight || screen.height || CANVAS_H;
  return Math.min(w / CANVAS_W, h / CANVAS_H);
}

export function TvCanvas({ children }: Props) {
  const [scale, setScale] = useState(calcScale);

  useEffect(() => {
    const update = () => setScale(calcScale());
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: CANVAS_W,
          height: CANVAS_H,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {children}
      </div>
    </div>
  );
}
