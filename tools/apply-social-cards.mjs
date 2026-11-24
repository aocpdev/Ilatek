// Ilatek · aplica la tarjeta social de cada landing a:
//   1. el HEAD del archivo de la landing,
//   2. el bloque ▼▼ /slug ▼▼ del HEAD SEO compartido,
//   3. el pack de la página (seo.json, HEAD-TEMPLATE.html y ASSETS.json con
//      copia local + hash, para que verify-structure siga en verde).
// El blog lo hace blog/build/build-embeds.mjs al generar su head-seo.html.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { structure } from './site-paths.mjs';
import { formatPage, publicPath } from './internal-link-contract.mjs';
import { composeShell } from './page-shell.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const plan = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/social/plan.json'), 'utf8'));
const CDN = 'https://cdn.jsdelivr.net/gh/aocpdev/Ilatek@main/';
const folders = new Map(structure.pages.map((p) => [p.slug, p.folder]));

const SOCIAL_META = /<meta\s+(?:property|name)=["'](?:og:image(?::(?:width|height|alt|type))?|twitter:image(?::alt)?|twitter:card)["'][^>]*>\s*/gi;

function normalize(text, url, alt, indent = '') {
  const out = text.replace(SOCIAL_META, '');
  const block = [
    `<meta property="og:image" content="${url}">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta property="og:image:alt" content="${alt}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:image" content="${url}">`,
    `<meta name="twitter:image:alt" content="${alt}">`,
  ].map((l) => indent + l).join('\n');
  const anchor = /<meta\s+property=["']og:url["'][^>]*>/i.exec(out)
    || /<meta\s+name=["']description["'][^>]*>/i.exec(out);
  if (anchor) {
    const i = anchor.index + anchor[0].length;
    return out.slice(0, i) + '\n' + block + out.slice(i);
  }
  return block + '\n' + out;
}

function blockRange(text, slug) {
  const esc = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = new RegExp(`<!-- ▼▼ ${esc}(?: ·[^\\n]*)? ▼▼ -->`).exec(text);
  if (!m) return null;
  const endMark = `<!-- ▲▲ fin ${slug} ▲▲ -->`;
  const end = text.indexOf(endMark, m.index);
  return end < 0 ? null : { start: m.index, end: end + endMark.length };
}

const escAttr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
let touched = 0;
let packs = 0;
const missing = [];

for (const card of plan.cards) {
  if (card.name.startsWith('blog-')) continue;
  const url = CDN + card.card;
  const alt = escAttr(card.alt);
  const cardFile = path.join(ROOT, card.card);
  if (!fs.existsSync(cardFile)) { missing.push(`tarjeta ${card.card}`); continue; }

  // 1. Metas dentro del archivo de la landing.
  const source = path.join(ROOT, card.source);
  const isHeadFile = path.resolve(source) === path.resolve(path.join(ROOT, card.head));
  if (fs.existsSync(source)) {
    const text = fs.readFileSync(source, 'utf8');
    if (isHeadFile || /og:image/i.test(text)) {
      const next = normalize(text, url, alt);
      // Se guarda ya pasado por composeShell: la verificación de shell vuelve a
      // componer el documento y debe obtener exactamente lo mismo (incluido el
      // bloque de runtime, que formatPage reinyecta al haber data-ilatek-path).
      const stable = composeShell(next, publicPath(card.source));
      if (stable !== text) { fs.writeFileSync(source, stable, 'utf8'); touched++; }
    }
  }

  // 2. Bloque del HEAD SEO compartido.
  const headFile = path.join(ROOT, card.head);
  if (fs.existsSync(headFile) && path.resolve(headFile) !== path.resolve(source)) {
    const text = fs.readFileSync(headFile, 'utf8');
    const r = blockRange(text, card.headBlock);
    if (r) {
      const block = text.slice(r.start, r.end);
      // El bloque se guarda ya pasado por el contrato: verify-internal-links
      // vuelve a aplicar formatPage(headOnly) y debe obtener lo mismo.
      const next = formatPage(normalize(block, url, alt, '  '), card.headBlock, { headOnly: true });
      if (next !== block) {
        fs.writeFileSync(headFile, text.slice(0, r.start) + next + text.slice(r.end), 'utf8');
        touched++;
      }
    } else missing.push(`${card.name} → ${card.head}`);
  }

  // 3. Pack de la landing: seo.json, HEAD-TEMPLATE.html y ASSETS.json.
  const folder = folders.get(card.name);
  if (!folder) continue;
  const base = path.join(ROOT, folder, 'es');
  if (!fs.existsSync(base)) continue;

  const seoPath = path.join(base, 'seo.json');
  if (fs.existsSync(seoPath)) {
    const seo = JSON.parse(fs.readFileSync(seoPath, 'utf8'));
    if (seo.metaTagImage !== url) {
      seo.metaTagImage = url;
      if ('socialImageFile' in seo) seo.socialImageFile = card.card;
      fs.writeFileSync(seoPath, JSON.stringify(seo, null, 2) + '\n', 'utf8');
      packs++;
    }
  }

  const headTpl = path.join(base, 'HEAD-TEMPLATE.html');
  if (fs.existsSync(headTpl)) {
    const text = fs.readFileSync(headTpl, 'utf8');
    const next = normalize(text, url, alt);
    // El HEAD-TEMPLATE se guarda ya pasado por el contrato del proyecto: así
    // composeShell() lo deja igual en la segunda pasada (verificación idempotente).
    const localized = formatPage(next, '/' + card.name, { headOnly: true });
    if (localized !== text) { fs.writeFileSync(headTpl, localized, 'utf8'); packs++; }
  }

  const assetsPath = path.join(base, 'ASSETS.json');
  if (fs.existsSync(assetsPath)) {
    const inv = JSON.parse(fs.readFileSync(assetsPath, 'utf8'));
    const relFile = `assets/social/${card.name}-1200.webp`;
    const dest = path.join(base, relFile);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const bytes = fs.readFileSync(cardFile);
    fs.writeFileSync(dest, bytes);
    const entry = {
      role: 'social-image',
      publicUrl: url,
      file: relFile,
      status: 'local-copy',
      bytes: bytes.length,
      sha256: sha(bytes),
    };
    inv.assets = (inv.assets || []).filter((a) => a.publicUrl !== url);
    inv.assets.unshift(entry);
    if (inv.socialImage && typeof inv.socialImage === 'object') inv.socialImage = { ...entry };
    fs.writeFileSync(assetsPath, JSON.stringify(inv, null, 2) + '\n', 'utf8');
    packs++;
  }
}

console.log(`Tarjetas aplicadas: ${touched} metadatos · ${packs} archivos de pack`);
if (missing.length) {
  console.error('✗ Sin bloque/tarjeta:', missing.slice(0, 8).join(' | '));
  process.exitCode = 1;
}
