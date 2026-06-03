// Génère les icônes PWA en SVG→PNG via canvas natif (node 18+)
// Lance avec : node scripts/generate-icons.mjs

import { createCanvas } from "canvas";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "public", "icons");
mkdirSync(OUT, { recursive: true });

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");
  const r = size / 2;

  // Background circle
  const grad = ctx.createRadialGradient(r, r * 0.8, 0, r, r, r);
  grad.addColorStop(0, "#1E293B");
  grad.addColorStop(1, "#070B14");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.22);
  ctx.fill();

  // Outer ring
  ctx.strokeStyle = "rgba(251,191,36,0.3)";
  ctx.lineWidth = size * 0.02;
  ctx.beginPath();
  ctx.arc(r, r, r * 0.85, 0, Math.PI * 2);
  ctx.stroke();

  // Sword 1 (left diagonal)
  const sw = size * 0.06;
  ctx.save();
  ctx.translate(r, r);
  ctx.rotate(-Math.PI / 4);

  const swordGrad = ctx.createLinearGradient(-size * 0.3, 0, size * 0.3, 0);
  swordGrad.addColorStop(0, "#FBBF24");
  swordGrad.addColorStop(0.5, "#FDE68A");
  swordGrad.addColorStop(1, "#F59E0B");

  ctx.fillStyle = swordGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.28, -sw / 2);
  ctx.lineTo(size * 0.28, -sw * 0.2);
  ctx.lineTo(size * 0.28, sw * 0.2);
  ctx.lineTo(-size * 0.28, sw / 2);
  ctx.closePath();
  ctx.fill();

  // Guard
  ctx.fillStyle = "#FBBF24";
  ctx.fillRect(-sw, -size * 0.08, sw * 2, size * 0.08 * 2);

  ctx.restore();

  // Sword 2 (right diagonal)
  ctx.save();
  ctx.translate(r, r);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = swordGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.28, -sw / 2);
  ctx.lineTo(size * 0.28, -sw * 0.2);
  ctx.lineTo(size * 0.28, sw * 0.2);
  ctx.lineTo(-size * 0.28, sw / 2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#FBBF24";
  ctx.fillRect(-sw, -size * 0.08, sw * 2, size * 0.08 * 2);
  ctx.restore();

  // Center gem
  ctx.fillStyle = "#FBBF24";
  ctx.shadowColor = "#FBBF24";
  ctx.shadowBlur = size * 0.08;
  ctx.beginPath();
  ctx.arc(r, r, size * 0.06, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  return canvas.toBuffer("image/png");
}

for (const size of SIZES) {
  const buf = drawIcon(size);
  const file = join(OUT, `icon-${size}x${size}.png`);
  writeFileSync(file, buf);
  console.log(`✅ ${size}x${size}`);
}

console.log(`\n🎉 Icons generated in public/icons/`);
