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

// photos: native aspect ratio (pages crop with object-fit), never upscaled.
// Warm or sunset photos get a navy monochrome grade so every photo sits in the palette.
const GRADE = new Set(['transmission-towers', 'offshore-platform']);
{
  const src = 'source/photos';
  const out = 'public/images/photos';
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });
  for (const f of fs.readdirSync(src).filter((x) => /\.(png|jpe?g|webp)$/.test(x)).sort()) {
    const name = f.replace(/\.\w+$/, '');
    const file = path.join(src, f);
    const { width, height } = await sharp(file).metadata();
    const widths = [480, 960, 1600, 2200].filter((w) => w <= width);
    if (width > widths.at(-1)) widths.push(width); // native size for full-width bands
    for (const w of widths) {
      const h = Math.round((w * height) / width);
      let base = sharp(file).resize(w, h);
      // two passes: sharp applies greyscale after tint within one pipeline
      if (GRADE.has(name)) base = sharp(await base.grayscale().toBuffer()).tint({ r: 46, g: 64, b: 94 }).modulate({ brightness: 0.88, saturation: 0.7 });
      // large files are for wide or high-density screens, where the photo sits under a gradient
      const big = w >= 1400;
      await base.clone().avif({ quality: big ? 42 : 48 }).toFile(path.join(out, `${name}-${w}.avif`));
      await base.clone().webp({ quality: big ? 64 : 70 }).toFile(path.join(out, `${name}-${w}.webp`));
      await base.clone().jpeg({ quality: big ? 70 : 76, mozjpeg: true }).toFile(path.join(out, `${name}-${w}.jpg`));
    }
    manifest.photos[name] = { widths, width, height };
  }
}

// client logos: greyscale is applied in CSS (colour on hover), so keep the originals
{
  const src = 'source/logos';
  const out = 'public/images/logos';
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });
  manifest.logos = {};
  for (const f of fs.readdirSync(src).filter((x) => /\.(png|svg)$/.test(x)).sort()) {
    const name = f.replace(/\.\w+$/, '');
    const { width, height } = await sharp(path.join(src, f)).metadata();
    const h = Math.min(height, 128);
    const w = Math.round((width * h) / height);
    await sharp(path.join(src, f)).resize(w, h).webp({ quality: 90 }).toFile(path.join(out, `${name}.webp`));
    await sharp(path.join(src, f)).resize(w, h).png().toFile(path.join(out, `${name}.png`));
    manifest.logos[name] = { width: w, height: h };
  }
}

fs.writeFileSync('src/data/images.json', JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify(manifest));
