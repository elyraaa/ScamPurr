import { PIXEL_COLORS as COLORS, rect } from '../animations/pixelCanvas';

export interface ToyCursorSet {
  feather: string;
  mouse: string;
  laser: string;
}

export function drawFeatherWand(ctx: CanvasRenderingContext2D, frame: number) {
  ctx.clearRect(0, 0, 200, 200);
  const s = 8;
  const sway = Math.sin(frame * 0.06) * 1.2;

  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(9 * s, 16 * s, 2 * s, 6 * s);
  rect(ctx, 9 * s + 2, 16 * s + 2, 2 * s - 4, 6 * s - 4, '#b8854c');
  rect(ctx, 9 * s + 2, 17 * s, 2 * s - 4, 2, '#8c6234');
  rect(ctx, 9 * s + 2, 19 * s, 2 * s - 4, 2, '#8c6234');
  rect(ctx, 9 * s + 2, 21 * s, 2 * s - 4, 2, '#8c6234');
  rect(ctx, 9 * s + 3, 16 * s + 2, 2, 2 * s - 4, '#d4a06c');

  ctx.strokeStyle = '#7a7a7a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(10 * s, 16 * s);
  ctx.quadraticCurveTo(10 * s + sway * 3, 13 * s, 10 * s + sway * 5, 9.5 * s);
  ctx.stroke();

  const fx = 10 + sway * 0.5;
  const fyTop = 0.5;
  const fyBottom = 9.5;

  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect((fx - 0.4) * s, fyTop * s, 0.8 * s, (fyBottom - fyTop) * s);
  rect(ctx, (fx - 0.3) * s, fyTop * s + 2, 0.6 * s, (fyBottom - fyTop) * s - 4, '#f5e6c8');

  for (let i = 0; i < 7; i += 1) {
    const t = i / 6;
    const by = fyTop + 0.6 + t * (fyBottom - fyTop - 1.2);
    const blen = 1 + t * 2.2;
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect((fx - 0.4 - blen) * s, by * s, blen * s + 2, 0.9 * s);
    rect(ctx, (fx - 0.4 - blen) * s + 2, by * s + 2, blen * s - 2, 0.9 * s - 4, i % 2 === 0 ? COLORS.accent : COLORS.light);
  }

  for (let i = 0; i < 7; i += 1) {
    const t = i / 6;
    const by = fyTop + 0.6 + t * (fyBottom - fyTop - 1.2);
    const blen = 1 + t * 2.2;
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect((fx + 0.4) * s, by * s, blen * s + 2, 0.9 * s);
    rect(ctx, (fx + 0.4) * s + 2, by * s + 2, blen * s - 2, 0.9 * s - 4, i % 2 === 0 ? COLORS.accent : COLORS.light);
  }

  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect((fx - 0.6) * s, fyTop * s - 2, 1.2 * s, 1 * s);
  rect(ctx, (fx - 0.5) * s, fyTop * s - 1, 1 * s, 0.8 * s, '#ffffff');
  rect(ctx, (fx - 0.15) * s, (fyTop + 1) * s, 2, 4 * s, '#ffffff');
}

export function drawPlushMouse(ctx: CanvasRenderingContext2D, frame: number) {
  ctx.clearRect(0, 0, 160, 160);
  const s = 8;
  const tailWag = Math.round(Math.sin(frame * 0.1) * 2);

  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(5 * s, 3 * s, 3 * s, 3 * s);
  ctx.fillRect(11 * s, 3 * s, 3 * s, 3 * s);
  rect(ctx, 5 * s + 2, 3 * s + 2, 3 * s - 4, 3 * s - 4, '#d8d0c8');
  rect(ctx, 11 * s + 2, 3 * s + 2, 3 * s - 4, 3 * s - 4, '#d8d0c8');
  rect(ctx, 5 * s + 5, 3 * s + 5, 3 * s - 10, 3 * s - 10, '#ffb3cc');
  rect(ctx, 11 * s + 5, 3 * s + 5, 3 * s - 10, 3 * s - 10, '#ffb3cc');

  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(4 * s, 6 * s, 12 * s, 1 * s);
  ctx.fillRect(3 * s, 7 * s, 14 * s, 7 * s);
  ctx.fillRect(4 * s, 14 * s, 12 * s, 1 * s);
  rect(ctx, 4 * s, 6 * s, 12 * s, 1 * s, '#e8e0d8');
  rect(ctx, 3 * s, 7 * s, 14 * s, 7 * s, '#e8e0d8');
  rect(ctx, 4 * s, 14 * s, 12 * s, 1 * s, '#d8d0c8');
  rect(ctx, 6 * s, 11 * s, 8 * s, 3 * s, '#f0ece4');

  rect(ctx, 6 * s, 9 * s, 1 * s, 1 * s, '#0a0a0a');
  rect(ctx, 12 * s, 9 * s, 1 * s, 1 * s, '#0a0a0a');
  rect(ctx, 9 * s, 10 * s, 1 * s, 1 * s, '#ff6699');

  ctx.strokeStyle = '#b0a89c';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(6 * s, 11 * s);
  ctx.lineTo(2 * s, 10 * s);
  ctx.moveTo(6 * s, 11.5 * s);
  ctx.lineTo(2 * s, 12 * s);
  ctx.moveTo(13 * s, 11 * s);
  ctx.lineTo(17 * s, 10 * s);
  ctx.moveTo(13 * s, 11.5 * s);
  ctx.lineTo(17 * s, 12 * s);
  ctx.stroke();

  ctx.strokeStyle = '#0a0a0a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(16 * s, 12 * s);
  ctx.quadraticCurveTo(18 * s + tailWag, 13 * s, 19 * s + tailWag, 16 * s);
  ctx.stroke();
  ctx.strokeStyle = '#c8bcae';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(16 * s, 12 * s);
  ctx.quadraticCurveTo(18 * s + tailWag, 13 * s, 19 * s + tailWag, 16 * s);
  ctx.stroke();
}

export function drawLaserPointer(ctx: CanvasRenderingContext2D, frame: number) {
  ctx.clearRect(0, 0, 160, 160);
  const s = 8;
  const pulse = (Math.sin(frame * 0.15) + 1) / 2;
  const cx = 10 * s;
  const cy = 10 * s;

  ctx.fillStyle = `rgba(255, 40, 40, ${0.12 + pulse * 0.18})`;
  ctx.beginPath();
  ctx.arc(cx, cy, (5 + pulse * 2) * s * 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(255, 90, 90, ${0.18 + pulse * 0.2})`;
  ctx.beginPath();
  ctx.arc(cx, cy, (3.5 + pulse) * s * 0.5, 0, Math.PI * 2);
  ctx.fill();

  rect(ctx, cx - 1.5 * s, cy - 2.5 * s, 3 * s, 1 * s, '#0a0a0a');
  rect(ctx, cx - 1.5 * s, cy + 1.5 * s, 3 * s, 1 * s, '#0a0a0a');
  rect(ctx, cx - 2.5 * s, cy - 1.5 * s, 1 * s, 3 * s, '#0a0a0a');
  rect(ctx, cx + 1.5 * s, cy - 1.5 * s, 1 * s, 3 * s, '#0a0a0a');
  rect(ctx, cx - 1.5 * s, cy - 1.5 * s, 3 * s, 3 * s, '#0a0a0a');
  rect(ctx, cx - 1.5 * s + 2, cy - 1.5 * s + 2, 3 * s - 4, 3 * s - 4, '#ff2424');
  rect(ctx, cx - 0.8 * s, cy - 0.8 * s, 1 * s, 1 * s, '#ff9090');
  rect(ctx, cx - 0.4 * s, cy - 0.4 * s, 4, 4, '#ffffff');
}

function canvasToCursorCSS(source: HTMLCanvasElement, hotspotX: number, hotspotY: number) {
  const small = document.createElement('canvas');
  small.width = 32;
  small.height = 32;
  const sctx = small.getContext('2d');
  if (!sctx) return 'auto';
  sctx.imageSmoothingEnabled = false;
  sctx.drawImage(source, 0, 0, 32, 32);
  return `url("${small.toDataURL('image/png')}") ${hotspotX} ${hotspotY}, auto`;
}

export function generateToyCursors(frame: number): ToyCursorSet | null {
  const feather = document.createElement('canvas');
  feather.width = 200;
  feather.height = 200;
  const featherCtx = feather.getContext('2d');
  const mouse = document.createElement('canvas');
  mouse.width = 160;
  mouse.height = 160;
  const mouseCtx = mouse.getContext('2d');
  const laser = document.createElement('canvas');
  laser.width = 160;
  laser.height = 160;
  const laserCtx = laser.getContext('2d');

  if (!featherCtx || !mouseCtx || !laserCtx) return null;
  featherCtx.imageSmoothingEnabled = false;
  mouseCtx.imageSmoothingEnabled = false;
  laserCtx.imageSmoothingEnabled = false;
  drawFeatherWand(featherCtx, frame);
  drawPlushMouse(mouseCtx, frame);
  drawLaserPointer(laserCtx, frame);

  return {
    feather: canvasToCursorCSS(feather, 16, 2),
    mouse: canvasToCursorCSS(mouse, 16, 16),
    laser: canvasToCursorCSS(laser, 16, 16),
  };
}
