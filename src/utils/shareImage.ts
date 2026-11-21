import {
resolveSpriteData,
resolveSpriteImage,
} from '../extensible/sprites/spriteRegistry';

export interface ProgressShareImageParams {
floor: number;
realmName: string;
weaponName: string;
/** Equipped cosmetic title, e.g.. Drawn prominently
* above the progress line when present. */
activeTitle?: string;
spriteId: string;
paletteId?: string;
}

const W = 1200;
const H = 630;

function loadImage(src: string): Promise<HTMLImageElement> {
return new Promise((resolve, reject) => {
const img = new Image();
img.onload = () => resolve(img);
img.onerror = () => reject(new Error('sprite image failed to load'));
img.src = src;
});
}

async function drawSprite(
ctx: CanvasRenderingContext2D,
spriteId: string,
paletteId: string | undefined,
x: number,
y: number,
size: number,
): Promise<void> {
ctx.imageSmoothingEnabled = false;
const imageSrc = resolveSpriteImage(spriteId);
if (imageSrc) {
const img = await loadImage(imageSrc);
ctx.drawImage(img, x, y, size, size);
return;
}
const { grid, palette} = resolveSpriteData(spriteId, paletteId);
const rows = grid.length;
const cols = grid[0]?.length?? 32;
const cell = size / Math.max(rows, cols);
const ox = x + (size - cols * cell) / 2;
const oy = y + (size - rows * cell) / 2;
for (let r = 0; r < rows; r++) {
for (let c = 0; c < cols; c++) {
const colorIdx = grid[r][c];
if (colorIdx === 0) continue;
ctx.fillStyle = palette.colors[colorIdx]?? '#ffffff';
ctx.fillRect(ox + c * cell, oy + r * cell, cell, cell);
}
}
}

/**
* Renders the progress share card (1200x630 PNG): the player's current
* skin on the left; brand, equipped title, floor progress and weapon on
* the right over a night-sky tower backdrop.
*/
export async function generateProgressShareImage(
params: ProgressShareImageParams,
): Promise<Blob> {
const canvas = document.createElement('canvas');
canvas.width = W;
canvas.height = H;
const ctx = canvas.getContext('2d');
if (!ctx) throw new Error('canvas 2d context unavailable');

// Backdrop: night-sky gradient, stars, tower silhouette.
const grad = ctx.createLinearGradient(0, 0, 0, H);
grad.addColorStop(0, '#020617');
grad.addColorStop(0.55, '#1e1b4b');
grad.addColorStop(1, '#020617');
ctx.fillStyle = grad;
ctx.fillRect(0, 0, W, H);
ctx.fillStyle = 'rgba(226, 232, 240, 0.7)';
const starSeed = [37, 101, 149, 197, 251, 307, 359, 419, 479, 541, 599, 661];
for (let i = 0; i < starSeed.length; i++) {
const sx = (starSeed[i] * 37 + i * 61) % W;
const sy = (starSeed[i] * 53 + i * 29) % (H - 120);
ctx.fillRect(sx, sy, 3, 3);
}
ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
// Tower silhouette behind the player sprite (left zone), like the
// title screen, so it never sits under the text block.
ctx.fillRect(260 - 46, 150, 92, H - 150);
ctx.fillRect(260 - 72, 260, 144, H - 260);
ctx.fillRect(260 - 104, 390, 208, H - 390);

// Player sprite.
await drawSprite(ctx, params.spriteId, params.paletteId, 110, (H - 300) / 2, 300);

// Text block.
const tx = 480;
ctx.textBaseline = 'alphabetic';
ctx.fillStyle = '#f59e0b';
ctx.font = '900 44px sans-serif';
ctx.fillText('DAILY TOWER', tx, 168);

let cursorY = 168;
if (params.activeTitle) {
cursorY += 92;
ctx.fillStyle = '#fbbf24';
ctx.font = '900 62px sans-serif';
ctx.fillText(params.activeTitle, tx, cursorY);
}
cursorY += 84;
ctx.fillStyle = '#f8fafc';
ctx.font = '800 50px sans-serif';
ctx.fillText(`第${params.floor}層「${params.realmName}」に挑戦中！`, tx, cursorY);
cursorY += 62;
ctx.fillStyle = '#cbd5e1';
ctx.font = '700 36px sans-serif';
ctx.fillText(`装備：${params.weaponName}`, tx, cursorY);

ctx.fillStyle = '#94a3b8';
ctx.font = '700 30px sans-serif';
ctx.fillText('#DailyTower', tx, H - 48);

return new Promise((resolve, reject) => {
canvas.toBlob(
(blob) =>
blob? resolve(blob): reject(new Error('share image encoding failed')),
'image/png',
);
});
}
