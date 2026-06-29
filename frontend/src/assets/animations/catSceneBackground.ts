import { PIXEL_COLORS as COLORS, rect } from './pixelCanvas';

const SCENE_CLOUDS = [
  { x: 0.1, y: 0.18, scale: 1, speed: 8 },
  { x: 0.36, y: 0.32, scale: 0.7, speed: 5 },
  { x: 0.78, y: 0.15, scale: 1.2, speed: 10 },
  { x: 0.58, y: 0.25, scale: 0.85, speed: 6 },
];

const SCENE_PAW_PRINTS = [
  { x: 0.1, y: 0.82, flip: false, alpha: 0.18 },
  { x: 0.16, y: 0.79, flip: true, alpha: 0.22 },
  { x: 0.78, y: 0.86, flip: false, alpha: 0.18 },
  { x: 0.84, y: 0.83, flip: true, alpha: 0.2 },
  { x: 0.91, y: 0.87, flip: false, alpha: 0.16 },
];

const SCENE_FIREFLIES = [
  { x: 0.08, y: 0.67, phase: 0.3 },
  { x: 0.21, y: 0.74, phase: 2.1 },
  { x: 0.39, y: 0.65, phase: 4.3 },
  { x: 0.58, y: 0.72, phase: 1.4 },
  { x: 0.72, y: 0.63, phase: 5.2 },
  { x: 0.88, y: 0.76, phase: 2.9 },
];

function drawSceneCloud(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  rect(ctx, x, y, 24 * scale, 8 * scale, '#fff5e8');
  rect(ctx, x + 6 * scale, y - 6 * scale, 16 * scale, 8 * scale, '#fff5e8');
  rect(ctx, x - 8 * scale, y + 2 * scale, 12 * scale, 6 * scale, '#fff5e8');
  rect(ctx, x + 20 * scale, y + 2 * scale, 12 * scale, 6 * scale, '#fff5e8');
  rect(ctx, x, y + 6 * scale, 24 * scale, 2 * scale, '#ffd9c0');
}

function drawScenePawPrint(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  flip: boolean,
  alpha: number,
) {
  const dir = flip ? -1 : 1;
  ctx.globalAlpha = alpha;
  rect(ctx, x - 4, y - 2, 6, 6, COLORS.deep);
  rect(ctx, x - 9 * dir, y - 6, 4, 4, COLORS.deep);
  rect(ctx, x - 1 * dir, y - 8, 4, 4, COLORS.deep);
  rect(ctx, x + 5 * dir, y - 6, 4, 4, COLORS.deep);
  ctx.globalAlpha = 1;
}

export function drawSunsetBackground(ctx: CanvasRenderingContext2D, width: number, height: number, t: number) {
  const horizonY = Math.round(height * 0.58);
  const sky = ctx.createLinearGradient(0, 0, 0, horizonY);
  sky.addColorStop(0, '#ffd9a0');
  sky.addColorStop(0.52, '#ffb3c6');
  sky.addColorStop(1, '#ff99bb');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, horizonY);

  const sunX = width * 0.87;
  const sunY = horizonY * 0.24;
  ctx.globalAlpha = 0.28;
  rect(ctx, sunX - 24, sunY - 24, 48, 48, '#fff0c0');
  ctx.globalAlpha = 0.62;
  rect(ctx, sunX - 16, sunY - 16, 32, 32, '#ffe0a0');
  ctx.globalAlpha = 1;

  for (const cloud of SCENE_CLOUDS) {
    const cloudWidth = 42 * cloud.scale;
    const travelWidth = width + cloudWidth * 2;
    const rawX = cloud.x * width + t * cloud.speed;
    const x = ((rawX + cloudWidth) % travelWidth) - cloudWidth;
    drawSceneCloud(ctx, x, horizonY * cloud.y, cloud.scale);
  }

  const ground = ctx.createLinearGradient(0, horizonY, 0, height);
  ground.addColorStop(0, '#f8b8cc');
  ground.addColorStop(1, '#f29cb8');
  ctx.fillStyle = ground;
  ctx.fillRect(0, horizonY, width, height - horizonY);
  rect(ctx, 0, horizonY, width, 3, '#e87a9e');

  for (const paw of SCENE_PAW_PRINTS) {
    drawScenePawPrint(ctx, width * paw.x, height * paw.y, paw.flip, paw.alpha);
  }

  for (const firefly of SCENE_FIREFLIES) {
    const pulse = (Math.sin(t * 2 + firefly.phase) + 1) / 2;
    const x = width * firefly.x + Math.sin(t * 0.7 + firefly.phase) * 3;
    const y = height * firefly.y + Math.cos(t * 0.5 + firefly.phase) * 2;
    ctx.globalAlpha = 0.18 + pulse * 0.34;
    rect(ctx, x - 3, y - 3, 8, 8, '#fff0a0');
    ctx.globalAlpha = 0.6 + pulse * 0.3;
    rect(ctx, x, y, 2, 2, '#fff8c8');
    ctx.globalAlpha = 1;
  }
}
