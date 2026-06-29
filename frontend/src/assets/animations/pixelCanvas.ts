export const PIXEL_COLORS = {
  surface: '#f9d0e0',
  light: '#ffd6e8',
  accent: '#f4a0c0',
  deep: '#d4537e',
  ink: '#7e2f51',
  white: '#fff9fc',
  danger: '#c93f69',
  outline: '#1a1714',
};

export function fitCanvas(canvas: HTMLCanvasElement, width?: number, height?: number) {
  const bounds = canvas.getBoundingClientRect();
  const cssWidth = (width ?? bounds.width) || 300;
  const cssHeight = (height ?? bounds.height) || 180;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const pixelWidth = Math.max(1, Math.floor(cssWidth * dpr));
  const pixelHeight = Math.max(1, Math.floor(cssHeight * dpr));

  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = false;
  return { ctx, width: cssWidth, height: cssHeight };
}

export function rect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

export function drawPixelText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color = PIXEL_COLORS.ink,
) {
  ctx.fillStyle = color;
  ctx.font = '10px "Press Start 2P", monospace';
  ctx.textBaseline = 'top';
  ctx.fillText(text, Math.round(x), Math.round(y));
}
