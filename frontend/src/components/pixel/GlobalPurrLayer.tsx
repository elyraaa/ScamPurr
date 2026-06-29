import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { Pause, Play } from 'lucide-react';
import { PIXEL_COLORS as COLORS, fitCanvas, rect } from '../../assets/animations/pixelCanvas';
import {
  CAT_KINDS,
  SPRITES,
  drawSparkle,
  drawSpeechBubble,
  drawSpriteCat,
  isCatKind,
  type CatKind,
  type Sparkle,
} from '../../assets/animations/pixelCatSprites';
import { generateToyCursors } from '../../assets/cursors/toyCursors';
import { useAnimationPreference } from './useAnimationPreference';

interface CompanionState {
  companionCat: CatKind;
  footerCats: CatKind[];
}

interface CatHitbox {
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

const COMPANION_STORAGE_KEY = 'scampurr-cat-companion-state';
const DEFAULT_COMPANION_STATE: CompanionState = {
  companionCat: 'pinkMascot',
  footerCats: ['whiteCat', 'calico', 'gingerSpotted', 'blackCat'],
};

function normalizeCompanionState(value: unknown): CompanionState {
  if (!value || typeof value !== 'object') return DEFAULT_COMPANION_STATE;

  const maybeState = value as Partial<CompanionState>;
  const companionCat = isCatKind(maybeState.companionCat)
    ? maybeState.companionCat
    : DEFAULT_COMPANION_STATE.companionCat;
  const footerCats = Array.isArray(maybeState.footerCats)
    ? maybeState.footerCats.filter(isCatKind).filter((cat) => cat !== companionCat)
    : [];
  const normalizedFooter = [...new Set(footerCats)];

  for (const cat of DEFAULT_COMPANION_STATE.footerCats) {
    if (normalizedFooter.length >= 4) break;
    if (cat !== companionCat && !normalizedFooter.includes(cat)) normalizedFooter.push(cat);
  }

  for (const cat of CAT_KINDS) {
    if (normalizedFooter.length >= 4) break;
    if (cat !== companionCat && !normalizedFooter.includes(cat)) normalizedFooter.push(cat);
  }

  return {
    companionCat,
    footerCats: normalizedFooter.slice(0, 4),
  };
}

function readCompanionState(): CompanionState {
  if (typeof window === 'undefined') return DEFAULT_COMPANION_STATE;
  try {
    const stored = window.localStorage.getItem(COMPANION_STORAGE_KEY);
    if (!stored) return DEFAULT_COMPANION_STATE;
    return normalizeCompanionState(JSON.parse(stored));
  } catch {
    return DEFAULT_COMPANION_STATE;
  }
}

function persistCompanionState(state: CompanionState) {
  window.localStorage.setItem(COMPANION_STORAGE_KEY, JSON.stringify(state));
}

function useFinePointer() {
  const [finePointer, setFinePointer] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia?.('(pointer: fine)').matches ?? true;
  });

  useEffect(() => {
    const query = window.matchMedia?.('(pointer: fine)');
    if (!query) return;

    const handleChange = () => setFinePointer(query.matches);
    handleChange();
    query.addEventListener('change', handleChange);
    return () => query.removeEventListener('change', handleChange);
  }, []);

  return finePointer;
}

function PixelCursorOverlay({ enabled, companionCat }: { enabled: boolean; companionCat: CatKind }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointer = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const cat = useRef({ x: window.innerWidth / 2 - 70, y: window.innerHeight / 2 - 50, flip: false });
  const lastMove = useRef(0);
  const sparkles = useRef<Sparkle[]>([]);

  useEffect(() => {
    if (!enabled) return;
    lastMove.current = performance.now();

    const handleMove = (event: MouseEvent) => {
      pointer.current = { x: event.clientX, y: event.clientY };
      lastMove.current = performance.now();
    };

    const handleClick = (event: MouseEvent) => {
      for (let i = 0; i < 7; i += 1) {
        sparkles.current.push({
          x: event.clientX,
          y: event.clientY,
          born: performance.now() - i * 35,
          drift: (i - 3) * 7,
        });
      }
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('click', handleClick);

    let raf = 0;
    const render = (now: number) => {
      const canvas = canvasRef.current;
      const fitted = canvas ? fitCanvas(canvas, window.innerWidth, window.innerHeight) : null;
      if (!canvas || !fitted) {
        raf = requestAnimationFrame(render);
        return;
      }

      const { ctx, width, height } = fitted;
      ctx.clearRect(0, 0, width, height);

      const target = pointer.current;
      const current = cat.current;
      const dx = target.x - current.x - 44;
      const dy = target.y - current.y - 38;
      const distance = Math.hypot(dx, dy);
      current.x += dx * 0.055;
      current.y += dy * 0.055;
      current.x = Math.max(4, Math.min(width - 100, current.x));
      current.y = Math.max(52, Math.min(height - 110, current.y));
      if (Math.abs(dx) > 1) current.flip = dx < 0;

      const idle = now - lastMove.current > 10000;
      const frame = now / 16;
      const bounce = idle ? 0 : Math.sin(now / 120) * 2;
      drawSpriteCat(ctx, current.x, current.y + bounce, 3, companionCat, {
        flip: current.flip,
        frame,
        pose: idle ? SPRITES[companionCat].pose : 'walking',
      });

      if (idle) drawSpeechBubble(ctx, 'purr...', current.x - 10, current.y - 34);
      else if (distance > 170) drawSpeechBubble(ctx, 'come back!', current.x - 16, current.y - 36);
      else if (distance < 26) drawSpeechBubble(ctx, 'got it!', current.x - 12, current.y - 36);

      sparkles.current = sparkles.current.filter((sparkle) => now - sparkle.born < 700);
      sparkles.current.forEach((sparkle) => drawSparkle(ctx, sparkle, now));

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(raf);
    };
  }, [enabled, companionCat]);

  if (!enabled) return null;

  return <canvas ref={canvasRef} className="pixel-cursor-canvas" aria-hidden="true" />;
}

function FooterParade({
  enabled,
  footerCats,
  onSwap,
}: {
  enabled: boolean;
  footerCats: CatKind[];
  onSwap: (footerIndex: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hitboxes = useRef<CatHitbox[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let raf = 0;

    const render = (now: number) => {
      const fitted = fitCanvas(canvas, window.innerWidth, 44);
      if (!fitted) return;
      const { ctx, width, height } = fitted;
      const frame = now / 16;
      ctx.clearRect(0, 0, width, height);
      rect(ctx, 0, height - 5, width, 5, COLORS.accent);
      const nextHitboxes: CatHitbox[] = [];

      footerCats.forEach((kind, index) => {
        const speed = enabled ? 10 + index * 2 : 0;
        const spacing = width / footerCats.length;
        const x = enabled
          ? width - ((now / 1000 * speed + index * spacing) % (width + 76)) + 14
          : width - (index + 1) * Math.min(86, width / footerCats.length);
        const y = height - 41 + (index % 2) * 2;
        nextHitboxes.push({ index, x, y, width: 40, height: 40 });
        drawSpriteCat(ctx, x, y, 1.25, kind, {
          frame: frame + index * 16,
          pose: 'walking',
        });
      });
      hitboxes.current = nextHitboxes;

      if (enabled) raf = requestAnimationFrame(render);
    };

    render(0);
    const handleResize = () => render(0);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(raf);
    };
  }, [enabled, footerCats]);

  const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rectBounds = canvas.getBoundingClientRect();
    const x = event.clientX - rectBounds.left;
    const y = event.clientY - rectBounds.top;
    const target = hitboxes.current.find((box) => (
      x >= box.x && x <= box.x + box.width && y >= box.y && y <= box.y + box.height
    ));
    if (target) onSwap(target.index);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLCanvasElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSwap(0);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className="footer-parade-canvas"
      role="button"
      tabIndex={0}
      aria-label="Cat parade. Click a cat to make it your cursor companion."
      title="Click a cat to swap cursor companion"
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
    />
  );
}

export function AnimationToggle() {
  const [enabled, setEnabled] = useAnimationPreference();

  return (
    <button
      type="button"
      className="animation-toggle"
      aria-pressed={enabled}
      title={enabled ? 'Disable animations' : 'Enable animations'}
      onClick={() => setEnabled(!enabled)}
    >
      {enabled ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
      <span className="sr-only">{enabled ? 'Disable animations' : 'Enable animations'}</span>
    </button>
  );
}

function ToyCursorLayer({ enabled }: { enabled: boolean }) {
  const finePointer = useFinePointer();

  useEffect(() => {
    const root = document.documentElement;

    if (!finePointer) {
      root.style.removeProperty('--cursor-feather');
      root.style.removeProperty('--cursor-mouse');
      root.style.removeProperty('--cursor-laser');
      return;
    }

    let frame = 0;
    const applyCursors = () => {
      const cursors = generateToyCursors(frame);
      if (!cursors) return;
      root.style.setProperty('--cursor-feather', cursors.feather);
      root.style.setProperty('--cursor-mouse', cursors.mouse);
      root.style.setProperty('--cursor-laser', cursors.laser);
      frame += 1;
    };

    applyCursors();
    if (!enabled) return;

    const timer = window.setInterval(applyCursors, 180);
    return () => window.clearInterval(timer);
  }, [enabled, finePointer]);

  return null;
}

export function GlobalPurrLayer() {
  const [enabled] = useAnimationPreference();
  const finePointer = useFinePointer();
  const [companionState, setCompanionState] = useState(readCompanionState);

  useEffect(() => {
    persistCompanionState(companionState);
  }, [companionState]);

  const handleSwap = (footerIndex: number) => {
    setCompanionState((current) => {
      const normalized = normalizeCompanionState(current);
      const selectedFooterCat = normalized.footerCats[footerIndex];
      if (!selectedFooterCat) return normalized;

      const nextFooterCats = [...normalized.footerCats];
      nextFooterCats[footerIndex] = normalized.companionCat;
      return {
        companionCat: selectedFooterCat,
        footerCats: nextFooterCats,
      };
    });
  };

  return (
    <>
      <ToyCursorLayer enabled={enabled} />
      {finePointer && (
        <PixelCursorOverlay enabled={enabled} companionCat={companionState.companionCat} />
      )}
      <FooterParade enabled={enabled} footerCats={companionState.footerCats} onSwap={handleSwap} />
      <AnimationToggle />
    </>
  );
}
