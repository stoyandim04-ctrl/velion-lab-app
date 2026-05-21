import sharp from 'sharp';
import { statSync } from 'fs';

const SRC = 'public/logo/logo.png';

const before = statSync(SRC).size;
console.log(`Source: ${(before / 1024 / 1024).toFixed(2)} MB`);

// Full logo for splash/paywall footer (480px wide is enough at 2x density)
await sharp(SRC)
  .resize({ width: 480, withoutEnlargement: true })
  .webp({ quality: 88, effort: 6 })
  .toFile('public/logo/logo.webp');

// Header icon — small, just the shield area. Use square center crop.
const meta = await sharp(SRC).metadata();
const side = Math.min(meta.width, meta.height);
const cropLeft = Math.floor((meta.width - side) / 2);
const cropTop = Math.floor((meta.height - side) / 2);

await sharp(SRC)
  .extract({ left: cropLeft, top: cropTop, width: side, height: side })
  .resize({ width: 96 })
  .webp({ quality: 90, effort: 6 })
  .toFile('public/logo/logo-icon.webp');

// Also keep PNG fallback at smaller size
await sharp(SRC)
  .resize({ width: 480, withoutEnlargement: true })
  .png({ compressionLevel: 9, quality: 90 })
  .toFile('public/logo/logo-small.png');

const a = statSync('public/logo/logo.webp').size;
const b = statSync('public/logo/logo-icon.webp').size;
const c = statSync('public/logo/logo-small.png').size;
console.log(`logo.webp:      ${(a / 1024).toFixed(0)} KB`);
console.log(`logo-icon.webp: ${(b / 1024).toFixed(0)} KB`);
console.log(`logo-small.png: ${(c / 1024).toFixed(0)} KB`);
