import ffmpegPath from 'ffmpeg-static';
import { spawnSync } from 'child_process';
import { statSync, renameSync, existsSync } from 'fs';

const SRC = 'public/logo/cinematic intro.mp4';
const OUT_MP4 = 'public/intro.mp4';
const OUT_WEBM = 'public/intro.webm';
const POSTER = 'public/intro-poster.jpg';

if (!existsSync(SRC)) {
  console.error('Source not found:', SRC);
  process.exit(1);
}

const before = statSync(SRC).size;
console.log(`Source: ${(before / 1024 / 1024).toFixed(2)} MB`);

// H.264 MP4 — universal compatibility, 720p portrait-friendly
console.log('Encoding H.264 MP4...');
const mp4 = spawnSync(ffmpegPath, [
  '-y', '-i', SRC,
  '-vf', 'scale=720:-2',
  '-c:v', 'libx264',
  '-preset', 'medium',
  '-crf', '26',
  '-profile:v', 'main',
  '-pix_fmt', 'yuv420p',
  '-movflags', '+faststart',
  '-c:a', 'aac',
  '-b:a', '96k',
  OUT_MP4,
], { stdio: 'inherit' });
if (mp4.status !== 0) process.exit(mp4.status || 1);

// WebM VP9 — smaller for modern browsers
console.log('Encoding WebM VP9...');
const webm = spawnSync(ffmpegPath, [
  '-y', '-i', SRC,
  '-vf', 'scale=720:-2',
  '-c:v', 'libvpx-vp9',
  '-b:v', '0',
  '-crf', '34',
  '-deadline', 'good',
  '-cpu-used', '2',
  '-row-mt', '1',
  '-c:a', 'libopus',
  '-b:a', '80k',
  OUT_WEBM,
], { stdio: 'inherit' });
if (webm.status !== 0) console.warn('WebM failed (non-fatal)');

// Poster frame (first frame, for instant-paint)
console.log('Extracting poster...');
spawnSync(ffmpegPath, [
  '-y', '-i', SRC,
  '-ss', '00:00:00',
  '-frames:v', '1',
  '-vf', 'scale=720:-2',
  '-q:v', '4',
  POSTER,
], { stdio: 'inherit' });

const afterMp4 = statSync(OUT_MP4).size;
console.log(`\nMP4: ${(before / 1024 / 1024).toFixed(2)}MB -> ${(afterMp4 / 1024 / 1024).toFixed(2)}MB`);
if (existsSync(OUT_WEBM)) {
  const afterWebm = statSync(OUT_WEBM).size;
  console.log(`WebM: ${(afterWebm / 1024 / 1024).toFixed(2)}MB`);
}
if (existsSync(POSTER)) {
  console.log(`Poster: ${(statSync(POSTER).size / 1024).toFixed(0)}KB`);
}
