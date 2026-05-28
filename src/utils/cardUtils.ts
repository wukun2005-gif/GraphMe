import type { RawMemory } from '../types';
import { EMOTION_COLORS } from '../types';

export async function renderMemoryCard(memory: RawMemory): Promise<Blob> {
  const W = 600;
  const H = 400;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  const emotionColor = EMOTION_COLORS[memory.dimensions.emotional.primary] || '#888';
  const isDark = true;

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, isDark ? '#0a101f' : '#f5f6f8');
  grad.addColorStop(1, isDark ? '#0d1525' : '#e8eaed');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Accent strip
  ctx.fillStyle = emotionColor;
  ctx.fillRect(0, 0, W, 4);

  // Photo or emoji placeholder
  const photoX = 30;
  const photoY = 40;
  const photoW = 120;
  const photoH = 120;

  if (memory.dimensions.sensory.images.length > 0) {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = memory.dimensions.sensory.images[0];
      });
      ctx.save();
      roundedRect(ctx, photoX, photoY, photoW, photoH, 12);
      ctx.clip();
      ctx.drawImage(img, photoX, photoY, photoW, photoH);
      ctx.restore();
    } catch {
      drawEmojiPlaceholder(ctx, photoX, photoY, photoW, photoH, emotionColor);
    }
  } else {
    drawEmojiPlaceholder(ctx, photoX, photoY, photoW, photoH, emotionColor);
  }

  // Label
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText(memory.label, 170, 70, W - 200);

  // Summary
  ctx.fillStyle = '#aaaacc';
  ctx.font = '14px sans-serif';
  wrapText(ctx, memory.summary, 170, 100, W - 210, 20);

  // Date
  const date = new Date(memory.dimensions.temporal.timestamp);
  ctx.fillStyle = '#666688';
  ctx.font = '12px sans-serif';
  ctx.fillText(`${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}`, 170, 155);

  // Emotion badge
  ctx.fillStyle = `${emotionColor}30`;
  roundedRect(ctx, 170, 165, 80, 24, 12);
  ctx.fill();
  ctx.fillStyle = emotionColor;
  ctx.font = '12px sans-serif';
  ctx.fillText(memory.dimensions.emotional.primary, 185, 182);

  // Persons
  if (memory.dimensions.social.persons.length > 0) {
    ctx.fillStyle = '#888899';
    ctx.font = '11px sans-serif';
    ctx.fillText(`👥 ${memory.dimensions.social.persons.join('、')}`, 265, 182);
  }

  // Bottom bar
  ctx.fillStyle = '#ffffff08';
  ctx.fillRect(0, H - 60, W, 60);

  // GraphMe branding
  ctx.fillStyle = '#00f2ff';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('Graph', 30, H - 30);
  ctx.fillStyle = '#aaaacc';
  ctx.font = '14px sans-serif';
  ctx.fillText('Me', 85, H - 30);

  ctx.fillStyle = '#444466';
  ctx.font = '11px sans-serif';
  ctx.fillText('记忆不是孤岛，而是星座', 30, H - 12);

  return new Promise(resolve => {
    canvas.toBlob(blob => resolve(blob!), 'image/png');
  });
}

function drawEmojiPlaceholder(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = `${color}15`;
  roundedRect(ctx, x, y, w, h, 12);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.font = '40px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('💭', x + w / 2, y + h / 2 + 12);
  ctx.textAlign = 'start';
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lineH: number) {
  const lines = text.split('\n');
  let lineY = y;
  for (const line of lines) {
    const words = line.split('');
    let currentLine = '';
    for (const char of words) {
      const testLine = currentLine + char;
      if (ctx.measureText(testLine).width > maxW) {
        ctx.fillText(currentLine, x, lineY);
        currentLine = char;
        lineY += lineH;
      } else {
        currentLine = testLine;
      }
    }
    ctx.fillText(currentLine, x, lineY);
    lineY += lineH;
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
