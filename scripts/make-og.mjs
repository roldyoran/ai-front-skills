// Rasterize scripts/og-default.svg -> public/og-default.png (1200x630)
// Run with: node scripts/make-og.mjs
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'public', 'og-default.png');

await sharp(path.join(root, 'scripts', 'og-default.svg'))
  .png({ compressionLevel: 9 })
  .toFile(out);

console.log(`written: ${out}`);
