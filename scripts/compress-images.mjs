import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';

const ASSETS_DIR = 'src/assets';

const files = await readdir(ASSETS_DIR);
const pngs = files.filter(f => f.endsWith('.png'));

for (const file of pngs) {
  const input = join(ASSETS_DIR, file);
  const output = join(ASSETS_DIR, file.replace(/\.png$/, '.webp'));
  const { size: before } = await stat(input);

  await sharp(input)
    .resize({ width: 1080, withoutEnlargement: true })
    .webp({ quality: 82, effort: 6 })
    .toFile(output);

  const { size: after } = await stat(output);
  const savedMB = ((before - after) / 1024 / 1024).toFixed(2);
  const beforeMB = (before / 1024 / 1024).toFixed(2);
  const afterKB = (after / 1024).toFixed(0);
  console.log(`${file}: ${beforeMB}MB -> ${afterKB}KB (saved ${savedMB}MB)`);
}
