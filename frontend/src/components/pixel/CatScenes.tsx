import { useEffect, useRef, useState } from 'react';
import { drawSunsetBackground } from '../../assets/animations/catSceneBackground';
import { PIXEL_COLORS as COLORS, drawPixelText, fitCanvas, rect } from '../../assets/animations/pixelCanvas';
import { drawMouse, drawSpriteCat, type CatKind } from '../../assets/animations/pixelCatSprites';
import type { RiskLabel } from '../../types';
import { useAnimationPreference } from './useAnimationPreference';

export function CatTreeScene({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [enabled] = useAnimationPreference();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let raf = 0;
    const render = (now: number) => {
      const fitted = fitCanvas(canvas);
      if (!fitted) return;
      const { ctx, width, height } = fitted;
      const t = enabled ? now / 1000 : 0;
      const frame = now / 16;
      ctx.clearRect(0, 0, width, height);

      drawSunsetBackground(ctx, width, height, t);
      rect(ctx, width * 0.17, height - 115, 18, 92, COLORS.ink);
      rect(ctx, width * 0.15, height - 115, 78, 12, COLORS.accent);
      rect(ctx, width * 0.45, height - 165, 120, 12, COLORS.accent);
      rect(ctx, width * 0.54, height - 155, 16, 120, COLORS.ink);
      rect(ctx, width * 0.21, height - 73, 104, 10, COLORS.accent);
      rect(ctx, width * 0.28, height - 107, 11, 39, COLORS.ink);
      rect(ctx, width * 0.32, height - 92, 84, 9, COLORS.accent);

      const toyAnchorX = width * 0.67;
      const toyAnchorY = height - 151;
      const toyX = toyAnchorX + Math.sin(t * 2.1) * 28;
      const toyY = toyAnchorY + 58 + Math.cos(t * 2.1) * 6;
      ctx.strokeStyle = COLORS.ink;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(toyAnchorX, toyAnchorY);
      ctx.lineTo(toyX, toyY);
      ctx.stroke();
      rect(ctx, toyX - 5, toyY - 4, 10, 8, COLORS.deep);
      rect(ctx, toyX - 2, toyY - 7, 4, 14, COLORS.deep);

      drawSpriteCat(ctx, width * 0.48, height - 218 + Math.sin(t * 1.4) * 2, 2.8, 'grayTabby', {
        frame,
      });
      drawPixelText(ctx, 'Z', width * 0.61, height - 216 - ((t * 8) % 22), COLORS.ink);
      drawPixelText(ctx, 'Z', width * 0.65, height - 230 - ((t * 8 + 10) % 28), COLORS.deep);

      drawSpriteCat(ctx, width * 0.22, height - 141, 2.6, 'orangeTabby', {
        frame,
      });
      rect(ctx, width * 0.35, height - 86 + Math.sin(t * 5) * 4, 22, 5, COLORS.deep);

      if (enabled) raf = requestAnimationFrame(render);
    };

    render(0);
    const handleResize = () => render(0);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  return <canvas ref={canvasRef} className={`pixel-scene-canvas ${className}`} aria-hidden="true" />;
}

export function SleepingCat({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [enabled] = useAnimationPreference();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let raf = 0;
    const render = (now: number) => {
      const fitted = fitCanvas(canvas);
      if (!fitted) return;
      const { ctx, width, height } = fitted;
      const t = enabled ? now / 1000 : 0;
      const frame = now / 16;
      ctx.clearRect(0, 0, width, height);
      rect(ctx, width * 0.16, height * 0.65, width * 0.68, 18, COLORS.accent);
      rect(ctx, width * 0.23, height * 0.52, width * 0.54, 20, COLORS.light);
      drawSpriteCat(ctx, width * 0.32, height * 0.22 + Math.sin(t * 1.8) * 2, 3.1, 'grayTabby', {
        frame,
      });
      for (let i = 0; i < 3; i += 1) {
        const drift = enabled ? (t * 16 + i * 17) % 50 : i * 12;
        ctx.globalAlpha = enabled ? Math.max(0.15, 1 - drift / 50) : 0.65;
        drawPixelText(ctx, 'Z', width * 0.64 + i * 16, height * 0.36 - drift, i % 2 ? COLORS.deep : COLORS.ink);
        ctx.globalAlpha = 1;
      }
      if (enabled) raf = requestAnimationFrame(render);
    };

    render(0);
    const handleResize = () => render(0);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  return <canvas ref={canvasRef} className={`sleeping-cat-canvas ${className}`} aria-hidden="true" />;
}

export function KneadingCat({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [enabled] = useAnimationPreference();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let raf = 0;
    const render = (now: number) => {
      const fitted = fitCanvas(canvas);
      if (!fitted) return;
      const { ctx, width, height } = fitted;
      const frame = enabled ? now / 16 : 0;
      ctx.clearRect(0, 0, width, height);
      rect(ctx, width * 0.16, height * 0.76, width * 0.68, 12, COLORS.light);
      rect(ctx, width * 0.23, height * 0.66, width * 0.54, 14, COLORS.accent);
      drawSpriteCat(ctx, width * 0.23, height * 0.17, 2.55, 'brownTabby', {
        frame,
        knead: true,
        pose: 'stretching',
      });
      if (enabled) raf = requestAnimationFrame(render);
    };

    render(0);
    const handleResize = () => render(0);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  return <canvas ref={canvasRef} className={`kneading-cat-canvas ${className}`} aria-hidden="true" />;
}

export function ChasingCatLoader({ label = 'loading analysis result...' }: { label?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [enabled] = useAnimationPreference();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let raf = 0;
    const render = (now: number) => {
      const fitted = fitCanvas(canvas);
      if (!fitted) return;
      const { ctx, width, height } = fitted;
      const t = enabled ? now / 1000 : 0;
      const frame = now / 16;
      ctx.clearRect(0, 0, width, height);
      rect(ctx, 0, height - 18, width, 6, COLORS.accent);
      const mouseX = enabled ? ((t * 76) % (width + 80)) - 40 : width * 0.58;
      const catX = enabled ? mouseX - 95 + Math.sin(t * 6) * 6 : width * 0.25;
      drawMouse(ctx, mouseX, height - 34);
      drawSpriteCat(ctx, catX, height - 62, 1.85, 'tuxedo', {
        frame,
        pose: 'walking',
      });
      if (enabled) raf = requestAnimationFrame(render);
    };

    render(0);
    const handleResize = () => render(0);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  return (
    <div className="cat-loader">
      <canvas ref={canvasRef} className="chasing-cat-canvas" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

function ScannerCat() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [enabled] = useAnimationPreference();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let raf = 0;
    const render = (now: number) => {
      const fitted = fitCanvas(canvas);
      if (!fitted) return;
      const { ctx, width, height } = fitted;
      const frame = enabled ? now / 16 : 0;
      ctx.clearRect(0, 0, width, height);
      drawSpriteCat(ctx, width * 0.14, height * 0.1, 2.15, 'siamese', {
        frame,
      });
      const cx = width * 0.68;
      const cy = height * 0.52;
      for (let i = 0; i < 4; i += 1) {
        const angle = (now / 280) + i * Math.PI * 0.5;
        const alpha = enabled ? 0.35 + i * 0.16 : 0.7;
        ctx.globalAlpha = alpha;
        rect(ctx, cx + Math.cos(angle) * 20, cy + Math.sin(angle) * 20, 6, 6, COLORS.deep);
        ctx.globalAlpha = 1;
      }
      if (enabled) raf = requestAnimationFrame(render);
    };

    render(0);
    const handleResize = () => render(0);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  return <canvas ref={canvasRef} className="scanner-cat-canvas" aria-hidden="true" />;
}

export function ScanningCatLoader({ compact = false }: { compact?: boolean }) {
  const [enabled] = useAnimationPreference();
  const [index, setIndex] = useState(0);
  const messages = ['scanning for scams...', 'checking whisker clues...', 'sniffing trust signals...'];

  useEffect(() => {
    if (!enabled) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % messages.length);
    }, 1300);
    return () => window.clearInterval(timer);
  }, [enabled, messages.length]);

  return (
    <div className={compact ? 'scan-loader compact' : 'scan-loader'}>
      {compact ? <KneadingCat /> : <ScannerCat />}
      <p>{messages[index]}</p>
    </div>
  );
}

export function RiskCat({ risk }: { risk: RiskLabel }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [enabled] = useAnimationPreference();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let raf = 0;
    const render = (now: number) => {
      const fitted = fitCanvas(canvas);
      if (!fitted) return;
      const { ctx, width, height } = fitted;
      const frame = enabled ? now / 16 : 0;
      const highRisk = risk === 'HIGH' || risk === 'CRITICAL';
      const kind: CatKind = risk === 'LOW' ? 'gingerSpotted' : highRisk ? 'blackCat' : 'calico';
      ctx.clearRect(0, 0, width, height);
      drawSpriteCat(ctx, width * 0.18, height * 0.08, 2.45, kind, {
        frame,
        spooked: highRisk,
      });
      if (risk === 'LOW') {
        rect(ctx, width * 0.66, height * 0.34 + Math.sin(now / 150) * 3, 8, 8, COLORS.deep);
        rect(ctx, width * 0.62, height * 0.38 + Math.sin(now / 150) * 3, 16, 4, COLORS.deep);
      }
      if (highRisk) {
        rect(ctx, width * 0.72, height * 0.2, 5, 24, COLORS.danger);
        rect(ctx, width * 0.72, height * 0.5, 5, 5, COLORS.danger);
      }
      if (enabled) raf = requestAnimationFrame(render);
    };

    render(0);
    const handleResize = () => render(0);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(raf);
    };
  }, [enabled, risk]);

  return <canvas ref={canvasRef} className="risk-cat-canvas" aria-hidden="true" />;
}
