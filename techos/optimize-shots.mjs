// Ilatek · Techos · Optimizador de imágenes.
// Las fotos de la librería de GHL (assets.cdn.filesafe.space) se suben a 1376x768
// JPEG de ~1 MB y su CDN no sabe reescalar ni recomprimir: ignorando los query
// params y sin variantes de tamaño. Por eso el hub cargaba ~17 MB de fotos.
//
// Aquí se descargan una vez, se recomprimen a WebP de 1200 px y se dejan en
// assets/optimized/techos/, la misma carpeta que el resto del sitio sirve vía
// jsDelivr (WEBP en kit.mjs). El <img> mantiene la URL JPEG como respaldo en
// onerror, así que si un archivo optimizado todavía no está en `main` la página
// sigue funcionando con la foto original.
import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
import { TECHOS_IMG, CDN } from './lib/kit.mjs';
import { hub } from './lib/data/hub.mjs';

const OUT = new URL('../assets/optimized/techos/', import.meta.url);
const WIDTH = 1200;
const QUALITY = 80;

// Todas las fotos de la librería de techos: las de cada landing (portada +
// incluye) y las de las tarjetas del hub. Se deduplican por URL porque la
// librería reutiliza la misma foto en varias páginas.
const urls = new Set();
for (const t of Object.values(TECHOS_IMG)) {
  if (t.hero) urls.add(t.hero);
  if (t.incl) urls.add(t.incl);
}
for (const c of hub.extra.cards) if (c.img) urls.add(c.img);
if (hub.hero.raw) urls.add(hub.hero.raw);
if (hub.incl.raw) urls.add(hub.incl.raw);

const name = (url) => url.replace(CDN, '').replace(/\.[a-z]+$/i, '') + '.webp';

async function run() {
  await mkdir(OUT, { recursive: true });
  const list = [...urls];
  let before = 0;
  let after = 0;
  const rows = [];
  for (const url of list) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`No se pudo descargar ${url} (HTTP ${res.status})`);
    const jpg = Buffer.from(await res.arrayBuffer());
    const webp = await sharp(jpg)
      .resize({ width: WIDTH, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toBuffer();
    await writeFile(new URL(name(url), OUT), webp);
    before += jpg.length;
    after += webp.length;
    rows.push(`  ${name(url)}  ${(jpg.length / 1024).toFixed(0)} KB -> ${(webp.length / 1024).toFixed(0)} KB`);
  }
  console.log(rows.join('\n'));
  const saved = (1 - after / before) * 100;
  console.log(
    `\n${list.length} fotos · ${(before / 1024 / 1024).toFixed(1)} MB -> ${(after / 1024 / 1024).toFixed(1)} MB (−${saved.toFixed(0)}%)`
  );
}

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
