import { ReactNode } from 'react';

const CANVAS_W = 1920;

interface Props {
  children: ReactNode;
}

export function TvCanvas({ children }: Props) {
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
