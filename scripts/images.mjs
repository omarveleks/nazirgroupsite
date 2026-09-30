// Optimises the site's raster images. Run after changing source images:
//   node scripts/images.mjs
// - source/portraits/*.png -> public/images/people/{name}-{240,480}.{avif,webp,jpg} (4:5 crop)
// - source/photos/*        -> public/images/photos/{name}-{w}.{avif,webp,jpg} (16:9 crop,
//   widths 480/960/1600, never upscaled)
// Writes src/data/images.json with the generated widths and heights.
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const manifest = { people: {}, photos: {} };

async function emit(file, crop, w, h, out, name) {
  const base = sharp(file).extract(crop).resize(w, h);
  await base.clone().avif({ quality: 50 }).toFile(path.join(out, `${name}-${w}.avif`));
  await base.clone().webp({ quality: 72 }).toFile(path.join(out, `${name}-${w}.webp`));
  await base.clone().jpeg({ quality: 78, mozjpeg: true }).toFile(path.join(out, `${name}-${w}.jpg`));
}

function cropTo(width, height, rw, rh, topBias = 0.5) {
  let w = width, h = Math.round((width * rh) / rw);
  if (h > height) { h = height; w = Math.round((height * rw) / rh); }
  return { left: Math.round((width - w) / 2), top: Math.round((height - h) * topBias), width: w, height: h };
}

// people
{
  const src = 'source/portraits';
  const out = 'public/images/people';
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });
  for (const f of fs.readdirSync(src).filter((x) => /\.(png|jpe?g|webp)$/.test(x)).sort()) {
    const name = f.replace(/\.\w+$/, '');
    const { width, height } = await sharp(path.join(src, f)).metadata();
    const crop = cropTo(width, height, 4, 5, 0.15);
    const widths = [240, 480];
    for (const w of widths) await emit(path.join(src, f), crop, w, Math.round((w * 5) / 4), out, name);
    manifest.people[name] = { widths, ratio: [4, 5] };
  }
}

// photos
{
  const src = 'source/photos';
  const out = 'public/images/photos';
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });
  for (const f of fs.readdirSync(src).filter((x) => /\.(png|jpe?g|webp)$/.test(x)).sort()) {
    const name = f.replace(/\.\w+$/, '');
    const { width, height } = await sharp(path.join(src, f)).metadata();
    const crop = cropTo(width, height, 16, 9, 0.5);
    const widths = [480, 960, 1600].filter((w) => w <= crop.width);
    if (widths.at(-1) < 960 && crop.width > widths.at(-1)) widths.push(crop.width);
    for (const w of widths) await emit(path.join(src, f), crop, w, Math.round((w * 9) / 16), out, name);
    manifest.photos[name] = { widths, ratio: [16, 9] };
  }
}

fs.writeFileSync('src/data/images.json', JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify(manifest));
