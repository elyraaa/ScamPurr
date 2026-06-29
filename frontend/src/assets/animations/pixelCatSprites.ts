import { PIXEL_COLORS as COLORS, drawPixelText, rect } from './pixelCanvas';

export type CatKind =
  | 'orangeTabby'
  | 'blackCat'
  | 'whiteCat'
  | 'grayTabby'
  | 'calico'
  | 'siamese'
  | 'pinkMascot'
  | 'brownTabby'
  | 'tuxedo'
  | 'gingerSpotted';

export type SpritePose = 'sitting' | 'sideways' | 'tailup' | 'curled' | 'waving' | 'stretching' | 'walking' | 'fluffy';
type EyeShape = 'round' | 'sly' | 'almond';
type Expression = 'none' | 'grin' | 'smirk';
type Pattern = 'none' | 'stripes' | 'calico' | 'siamese' | 'tuxedo' | 'spots' | 'patch';

interface Palette {
  body: string;
  dark: string;
  dark2: string;
  light: string;
  inner: string;
  nose: string;
  eyeColor: string;
  spot1?: string;
}

interface SpriteConfig {
  pose: SpritePose;
  eyeShape: EyeShape;
  expression: Expression;
  pattern: Pattern;
  palette: Palette;
}

interface DrawSpriteOptions {
  flip?: boolean;
  frame?: number;
  knead?: boolean;
  pose?: SpritePose;
  spooked?: boolean;
}

export interface Sparkle {
  x: number;
  y: number;
  born: number;
  drift: number;
}

export const CAT_KINDS = Object.keys({
  orangeTabby: true,
  blackCat: true,
  whiteCat: true,
  grayTabby: true,
  calico: true,
  siamese: true,
  pinkMascot: true,
  brownTabby: true,
  tuxedo: true,
  gingerSpotted: true,
}) as CatKind[];

export const SPRITES: Record<CatKind, SpriteConfig> = {
  orangeTabby: {
    pose: 'sitting',
    eyeShape: 'round',
    expression: 'grin',
    pattern: 'stripes',
    palette: {
      body: '#e0832f',
      dark: '#a85f1c',
      dark2: '#c47024',
      light: '#f0a050',
      inner: '#ffd6e0',
      nose: '#ff8fa3',
      eyeColor: '#3c8f3c',
    },
  },
  blackCat: {
    pose: 'sideways',
    eyeShape: 'sly',
    expression: 'smirk',
    pattern: 'none',
    palette: {
      body: '#2c2c2a',
      dark: '#000000',
      dark2: '#1a1a1a',
      light: '#4a4a48',
      inner: '#5a4438',
      nose: '#ff8fa3',
      eyeColor: '#f0c419',
    },
  },
  whiteCat: {
    pose: 'tailup',
    eyeShape: 'almond',
    expression: 'smirk',
    pattern: 'none',
    palette: {
      body: '#f8f6f0',
      dark: '#c4c2ba',
      dark2: '#dedcd4',
      light: '#fffefa',
      inner: '#ffd6e0',
      nose: '#ff8fa3',
      eyeColor: '#378ade',
    },
  },
  grayTabby: {
    pose: 'curled',
    eyeShape: 'round',
    expression: 'none',
    pattern: 'stripes',
    palette: {
      body: '#8c8c8c',
      dark: '#5a5a5a',
      dark2: '#6e6e6e',
      light: '#a8a8a8',
      inner: '#d8d8d8',
      nose: '#ff8fa3',
      eyeColor: '#7fc47f',
    },
  },
  calico: {
    pose: 'sideways',
    eyeShape: 'round',
    expression: 'none',
    pattern: 'calico',
    palette: {
      body: '#f8f6f0',
      dark: '#2c2c2a',
      dark2: '#dedcd4',
      light: '#fffefa',
      spot1: '#e0832f',
      inner: '#ffd6e0',
      nose: '#ff8fa3',
      eyeColor: '#3c8f3c',
    },
  },
  siamese: {
    pose: 'sitting',
    eyeShape: 'almond',
    expression: 'none',
    pattern: 'siamese',
    palette: {
      body: '#e8dcc4',
      dark: '#5a4636',
      dark2: '#cdbf9e',
      light: '#f5ecd8',
      inner: '#fff0e0',
      nose: '#8c6450',
      eyeColor: '#378ade',
    },
  },
  pinkMascot: {
    pose: 'waving',
    eyeShape: 'round',
    expression: 'grin',
    pattern: 'patch',
    palette: {
      body: '#e87aa0',
      dark: '#993556',
      dark2: '#d4537e',
      light: '#f4a8c4',
      inner: '#ffd6e8',
      nose: '#ff6699',
      eyeColor: '#3c3489',
    },
  },
  brownTabby: {
    pose: 'stretching',
    eyeShape: 'round',
    expression: 'none',
    pattern: 'stripes',
    palette: {
      body: '#a06840',
      dark: '#5e3a20',
      dark2: '#7a4e2c',
      light: '#c08858',
      inner: '#e8c8a8',
      nose: '#ff8fa3',
      eyeColor: '#f0c419',
    },
  },
  tuxedo: {
    pose: 'walking',
    eyeShape: 'round',
    expression: 'none',
    pattern: 'tuxedo',
    palette: {
      body: '#f8f6f0',
      dark: '#1a1a1a',
      dark2: '#dedcd4',
      light: '#fffefa',
      inner: '#ffd6e0',
      nose: '#ff8fa3',
      eyeColor: '#3c8f3c',
    },
  },
  gingerSpotted: {
    pose: 'fluffy',
    eyeShape: 'round',
    expression: 'grin',
    pattern: 'spots',
    palette: {
      body: '#e8a040',
      dark: '#a05818',
      dark2: '#c8862c',
      light: '#f4bc70',
      inner: '#ffe0b0',
      nose: '#ff8fa3',
      eyeColor: '#3c8f3c',
    },
  },
};

export function isCatKind(value: unknown): value is CatKind {
  return typeof value === 'string' && CAT_KINDS.includes(value as CatKind);
}

export function drawSpeechBubble(ctx: CanvasRenderingContext2D, text: string, x: number, y: number) {
  ctx.font = '10px "Press Start 2P", monospace';
  const textWidth = ctx.measureText(text).width;
  const bubbleWidth = textWidth + 18;
  const bubbleHeight = 24;
  const bx = Math.max(8, Math.min(x, window.innerWidth - bubbleWidth - 8));
  const by = Math.max(8, y);

  rect(ctx, bx + 3, by + 3, bubbleWidth, bubbleHeight, 'rgba(126, 47, 81, 0.16)');
  rect(ctx, bx, by, bubbleWidth, bubbleHeight, COLORS.white);
  rect(ctx, bx, by, bubbleWidth, 3, COLORS.ink);
  rect(ctx, bx, by + bubbleHeight - 3, bubbleWidth, 3, COLORS.ink);
  rect(ctx, bx, by, 3, bubbleHeight, COLORS.ink);
  rect(ctx, bx + bubbleWidth - 3, by, 3, bubbleHeight, COLORS.ink);
  rect(ctx, bx + 14, by + bubbleHeight, 8, 5, COLORS.ink);
  rect(ctx, bx + 17, by + bubbleHeight + 5, 5, 5, COLORS.ink);
  rect(ctx, bx + 15, by + bubbleHeight, 5, 5, COLORS.white);
  drawPixelText(ctx, text, bx + 9, by + 7);
}

export function drawSpriteCat(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  unit: number,
  kind: CatKind,
  options: DrawSpriteOptions = {},
) {
  const cfg = SPRITES[kind];
  const pose = options.pose ?? cfg.pose;
  const P = cfg.palette;
  const frame = options.frame ?? 0;
  const blink = Math.floor(frame / 40) % 10 === 0;
  const tailWag = Math.sin(frame * 0.08) * 2;
  const earTwitch = Math.floor(frame / 55) % 8 === 0 ? 1 : 0;
  const bounce = pose === 'walking' ? Math.round(Math.sin(frame * 0.15)) : 0;

  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  if (options.flip) {
    ctx.translate(32 * unit, 0);
    ctx.scale(-1, 1);
  }

  const cell = (gx: number, gy: number, w: number, h: number, color?: string, withBounce = true) => {
    if (!color) return;
    rect(ctx, gx * unit, (gy + (withBounce ? bounce : 0)) * unit, w * unit, h * unit, color);
  };

  if (pose === 'tailup') {
    cell(24, 8, 2, 2, P.dark);
    cell(25, 6, 2, 2, P.body);
    cell(26, 4, 2, 2, P.body);
    cell(26, 2, 2, 2, P.light);
    cell(25, 6, 2, 2, P.dark);
  } else if (pose === 'curled') {
    cell(20, 20, 4, 2, P.body);
    cell(22, 18, 3, 2, P.dark);
  } else if (pose === 'fluffy') {
    const wagShift = Math.round(tailWag);
    cell(24 + wagShift, 16, 3, 3, P.light);
    cell(25 + wagShift, 14, 3, 3, P.body);
    cell(26 + wagShift, 12, 2, 3, P.dark);
  } else {
    const wagShift = Math.round(tailWag);
    cell(23 + wagShift, 14, 2, 2, P.dark);
    cell(24 + wagShift, 12, 2, 2, P.body);
    cell(25 + wagShift, 10, 2, 2, P.body);
  }

  ctx.fillStyle = COLORS.outline;
  ctx.fillRect(7 * unit, (2 + bounce) * unit, 16 * unit, unit);
  ctx.fillRect(6 * unit, (3 + bounce) * unit, 18 * unit, unit);
  ctx.fillRect(5 * unit, (4 + bounce) * unit, 20 * unit, 8 * unit);
  ctx.fillRect(6 * unit, (12 + bounce) * unit, 18 * unit, unit);
  ctx.fillRect(7 * unit, (13 + bounce) * unit, 16 * unit, 9 * unit);
  ctx.fillRect(8 * unit, (22 + bounce) * unit, 14 * unit, unit);
  ctx.fillRect(6 * unit, (0 + bounce) * unit, 5 * unit, 3 * unit);
  ctx.fillRect(19 * unit, (0 + bounce) * unit, 5 * unit, 3 * unit);

  cell(7, 3, 16, 1, P.light);
  cell(6, 4, 18, 1, P.body);
  cell(6, 5, 18, 2, P.body);
  cell(6, 7, 18, 2, P.body);
  cell(6, 9, 18, 2, P.dark2);
  cell(7, 11, 16, 1, P.dark2);

  const earY = earTwitch ? -1 : 0;
  cell(7, 1 + earY, 3, 2, P.body);
  cell(8, 0 + earY, 2, 1, P.body);
  cell(8, 1 + earY, 1, 1, P.inner);
  cell(20, 1 + earY, 3, 2, P.body);
  cell(21, 0 + earY, 2, 1, P.body);
  cell(22, 1 + earY, 1, 1, P.inner);
  cell(7, 2 + earY, 1, 1, P.dark);
  cell(22, 2 + earY, 1, 1, P.dark);

  cell(7, 5, 2, 2, P.dark2);
  cell(21, 5, 2, 2, P.dark2);
  cell(13, 3, 6, 1, P.light);

  if (cfg.pattern === 'stripes') {
    cell(10, 4, 1, 4, P.dark);
    cell(13, 4, 1, 3, P.dark);
    cell(17, 4, 1, 3, P.dark);
    cell(20, 4, 1, 4, P.dark);
    cell(9, 14, 1, 5, P.dark);
    cell(20, 14, 1, 5, P.dark);
    cell(11, 13, 2, 1, P.dark);
    cell(17, 13, 2, 1, P.dark);
  }
  if (cfg.pattern === 'calico') {
    cell(7, 5, 4, 3, P.spot1);
    cell(19, 5, 4, 2, P.dark);
    cell(9, 17, 3, 4, P.dark);
    cell(18, 18, 4, 3, P.spot1);
  }
  if (cfg.pattern === 'siamese') {
    cell(6, 4, 3, 3, P.dark);
    cell(21, 4, 3, 3, P.dark);
    cell(12, 1, 6, 2, P.dark);
  }
  if (cfg.pattern === 'tuxedo') {
    cell(6, 4, 18, 2, P.dark);
    cell(11, 8, 10, 9, P.body);
    cell(5, 11, 4, 6, P.dark);
    cell(23, 11, 4, 6, P.dark);
  }
  if (cfg.pattern === 'spots') {
    cell(8, 5, 2, 2, P.dark);
    cell(20, 6, 2, 2, P.dark);
    cell(9, 16, 2, 2, P.dark);
    cell(19, 17, 2, 2, P.dark);
    cell(14, 18, 2, 2, P.dark);
  }
  if (cfg.pattern === 'patch') {
    cell(8, 4, 4, 3, P.dark);
    cell(18, 15, 4, 3, P.dark);
  }

  const eye = (gx: number, gy: number, shape: EyeShape) => {
    if (blink) {
      cell(gx, gy + 1, 2, 1, P.dark2);
      return;
    }
    if (shape === 'sly') {
      cell(gx, gy, 3, 1, COLORS.white);
      cell(gx, gy + 1, 2, 1, P.eyeColor);
      cell(gx, gy + 1, 1, 1, '#000000');
    } else if (shape === 'round') {
      cell(gx, gy, 2, 2, COLORS.white);
      cell(gx, gy, 1, 2, P.eyeColor);
      cell(gx, gy, 1, 1, '#000000');
      cell(gx, gy, 1, 1, COLORS.white);
    } else {
      cell(gx, gy, 2, 2, COLORS.white);
      cell(gx, gy + 1, 2, 1, P.eyeColor);
      cell(gx, gy + 1, 1, 1, '#000000');
    }
  };

  eye(9, 7, cfg.eyeShape);
  eye(pose === 'sideways' ? 19 : 20, 7, cfg.eyeShape);

  cell(14, 9, 2, 1, P.nose);
  cell(12, 10, 1, 1, P.dark2);
  cell(16, 10, 1, 1, P.dark2);
  cell(13, 10, 1, 1, P.dark2);
  cell(15, 10, 1, 1, P.dark2);

  if (cfg.expression === 'grin') {
    cell(11, 11, 2, 1, P.dark2);
    cell(18, 11, 2, 1, P.dark2);
    cell(13, 12, 5, 1, P.dark2);
  } else if (cfg.expression === 'smirk') {
    cell(16, 11, 3, 1, P.dark2);
  } else {
    cell(12, 11, 2, 1, P.dark2);
    cell(17, 11, 2, 1, P.dark2);
  }

  cell(4, 8, 3, 1, COLORS.white);
  cell(4, 9, 3, 1, COLORS.white);
  cell(22, 8, 3, 1, COLORS.white);
  cell(22, 9, 3, 1, COLORS.white);

  cell(8, 13, 15, 1, P.light);
  cell(7, 14, 17, 2, P.body);
  cell(7, 16, 17, 2, P.body);
  cell(8, 18, 15, 2, P.dark2);
  cell(9, 20, 13, 2, P.dark2);
  cell(8, 21, 14, 1, P.dark);

  if (pose === 'waving') {
    const waveY = Math.round(Math.sin(frame * 0.15) * 2);
    cell(9, 22, 2, 2, P.body);
    cell(19, 17 + waveY, 2, 3, P.body);
    cell(20, 15 + waveY, 2, 2, P.light);
  } else if (pose === 'stretching') {
    cell(6, 22, 4, 2, P.body);
    cell(20, 22, 6, 2, P.body);
    cell(9, 22, 2, 2, P.body);
    cell(18, 22, 2, 2, P.body);
  } else {
    cell(9, 22, 2, 2, P.body);
    cell(19, 22, 2, 2, P.body);
    cell(13, 22, 2, 1, P.body);
    cell(16, 22, 2, 1, P.body);
  }

  if (options.knead) {
    const leftPress = Math.max(0, Math.sin(frame * 0.18));
    const rightPress = Math.max(0, Math.sin(frame * 0.18 + Math.PI));
    cell(7, 23 + leftPress, 5, 2, COLORS.outline, false);
    cell(8, 23 + leftPress, 3, 2, P.body, false);
    cell(18, 23 + rightPress, 5, 2, COLORS.outline, false);
    cell(19, 23 + rightPress, 3, 2, P.body, false);
  }

  if (options.spooked) {
    cell(24, 1, 1, 5, COLORS.danger, false);
    cell(24, 8, 1, 1, COLORS.danger, false);
  }

  ctx.restore();
}

export function drawMouse(ctx: CanvasRenderingContext2D, x: number, y: number) {
  rect(ctx, x, y, 12, 7, COLORS.ink);
  rect(ctx, x + 9, y - 3, 4, 3, COLORS.ink);
  rect(ctx, x - 9, y + 3, 9, 2, COLORS.ink);
  rect(ctx, x + 11, y + 1, 2, 2, COLORS.light);
}

export function drawSparkle(ctx: CanvasRenderingContext2D, sparkle: Sparkle, now: number) {
  const life = Math.min(1, (now - sparkle.born) / 700);
  const size = Math.max(2, 7 - life * 4);
  const x = sparkle.x + sparkle.drift * life;
  const y = sparkle.y - life * 32;
  const alpha = 1 - life;
  const color = life > 0.45 ? COLORS.deep : COLORS.accent;

  ctx.globalAlpha = alpha;
  rect(ctx, x - size, y, size * 2, 2, color);
  rect(ctx, x, y - size, 2, size * 2, color);
  rect(ctx, x - size * 0.7, y - size * 0.7, 2, 2, COLORS.light);
  rect(ctx, x + size * 0.7, y + size * 0.7, 2, 2, COLORS.light);
  ctx.globalAlpha = 1;
}
