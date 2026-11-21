import { useEffect, useRef } from 'react';
import { resolveSpriteData, resolveSpriteImage } from '../extensible/sprites/spriteRegistry';

interface PixelSpriteCanvasProps {
  spriteId: string;
  paletteId?: string;
  scale?: number;
  flipHorizontal?: boolean;
  className?: string;
}

const imageCache = new Map<string, HTMLImageElement>();

function getCachedImage(src: string): HTMLImageElement {
  let img = imageCache.get(src);
  if (!img) {
    img = new Image();
    img.src = src;
    imageCache.set(src, img);
  }
  return img;
}

export function PixelSpriteCanvas({
  spriteId,
  paletteId,
  scale = 10,
  flipHorizontal = false,
  className = '',
}: PixelSpriteCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageSrc = resolveSpriteImage(spriteId);
  const { grid, palette } = resolveSpriteData(spriteId, paletteId);
  const rows = imageSrc ? 32 : grid.length;
  const cols = imageSrc ? 32 : grid[0]?.length ?? 8;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = cols * scale;
    const height = rows * scale;
    ctx.clearRect(0, 0, width, height);

    if (imageSrc) {
      const img = getCachedImage(imageSrc);
      const draw = () => {
        ctx.clearRect(0, 0, width, height);
        ctx.imageSmoothingEnabled = false;
        if (flipHorizontal) {
          ctx.save();
          ctx.translate(width, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(img, 0, 0, width, height);
          ctx.restore();
        } else {
          ctx.drawImage(img, 0, 0, width, height);
        }
      };
      if (img.complete && img.naturalWidth > 0) {
        draw();
        return;
      }
      img.addEventListener('load', draw);
      return () => img.removeEventListener('load', draw);
    }

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const srcCol = flipHorizontal ? cols - 1 - c : c;
        const colorIdx = grid[r][srcCol];
        if (colorIdx === 0) continue;
        const fill = palette.colors[colorIdx] ?? '#ffffff';
        ctx.fillStyle = fill;
        ctx.fillRect(c * scale, r * scale, scale, scale);
      }
    }
  }, [imageSrc, grid, palette, rows, cols, scale, flipHorizontal]);

  return (
    <canvas
      ref={canvasRef}
      width={cols * scale}
      height={rows * scale}
      aria-hidden="true"
      className={`block [image-rendering:pixelated] ${className}`}
    />
  );
}
