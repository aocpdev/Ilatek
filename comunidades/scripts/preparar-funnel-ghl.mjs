// Prepara las landings de comunidad para publicarlas como páginas de un funnel
// de GHL en comunidades.ilatekpr.com.
//
// Estructura (una por comunidad, dos páginas hermanas, cada una un servicio):
//
//   funnel  /<municipio>/<comunidad>
//     page  /<municipio>/<comunidad>/sellado-de-techo
//     page  /<municipio>/<comunidad>/limpieza
//
// El HTML de cada landing es estático y autónomo: se inyecta en un bloque de
// código de GHL. Por eso este script:
//   * saca <main>, el footer y el script de revelado del HTML generado;
//   * incrusta styles.css (no se sirve desde el subdominio: GHL no lo hospeda);
//   * reescribe ../../../img y ../../../hero a URLs de la Media Library;
//   * deja fuera los <link rel="icon"> (el favicon se configura en GHL).
//
// No modifica las landings fuente. Salida en data/ghl/.
//
// Uso:
//   node scripts/preparar-funnel-ghl.mjs --only carolina/isla-verde
//   node scripts/preparar-funnel-ghl.mjs --only carolina/isla-verde --upload
//   node scripts/preparar-funnel-ghl.mjs --all
//
// --upload es la única operación que escribe en GHL (Media Library). Sin él,
// exige que data/ghl/assets.json ya tenga la URL de cada asset.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { loadLandingRecords } from './landings/config.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const comunidades = path.resolve(here, '..');
const landings = path.join(comunidades, 'landings');
const outRoot = path.join(comunidades, 'data', 'ghl');
const assetsFile = path.join(outRoot, 'assets.json');

const SITE = 'https://comunidades.ilatekpr.com';
const DOMAIN = 'comunidades.ilatekpr.com';
const LOCATION = '8OxUENFVM60EKzqsTcoD';
const MEDIA_ENDPOINT = 'https://services.leadconnectorhq.com/medias/upload-file';

// Las dos páginas hermanas. El orden es el del funnel: techos es la entrada
// por defecto; limpieza es una entrada directa independiente.
const KINDS = ['techos', 'limpieza'];
const SLUGS = { techos: 'sellado-de-techo', limpieza: 'limpieza' };
const PAGE_NAME = { techos: 'Sellado de techo', limpieza: 'Limpieza' };

const args = process.argv.slice(2);
const onlyArg = valueOf('--only');
const outArg = valueOf('--out');
const upload = args.includes('--upload');
const all = args.includes('--all');
const help = args.includes('--help') || args.includes('-h');
const outDir = outArg ? path.resolve(process.cwd(), outArg) : outRoot;

function valueOf(flag) {
  const i = args.indexOf(flag);
  return i === -1 ? null : args[i + 1];
}

if (help || (!onlyArg && !all)) {
  console.log(`Prepara landings de comunidad como páginas GHL.

  --only <municipio>/<comunidad>   una o varias, separadas por coma
  --all                            todas las comunidades con landing
  --upload                         sube los assets a la Media Library de GHL
  --out <dir>                      cambia el destino (defecto data/ghl)

Ejemplo:
  node scripts/preparar-funnel-ghl.mjs --only carolina/isla-verde --upload`);
  process.exit(help ? 0 : 1);
}

// --- utilidades -----------------------------------------------------------

const esc = s => String(s ?? '');
const sha256 = buf => crypto.createHash('sha256').update(buf).digest('hex');

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n', 'utf8');
}

function mimeFor(file) {
  const ext = path.extname(file).toLowerCase();
  if (ext === '.webp') return 'image/webp';
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.svg') return 'image/svg+xml';
  return 'application/octet-stream';
}

function token() {
  if (process.env.GHL_PIT) return process.env.GHL_PIT;
  const mcp = readJson(path.resolve(comunidades, '..', '.mcp.json'), null);
  return mcp?.mcpServers?.ghl?.env?.ZJ_GHL_PIT || '';
}

function communityKey(r) {
  return `${r.municipalitySlug}/${r.slug}`;
}

function selectRecords() {
  const records = loadLandingRecords();
  if (all) return records;
  const wanted = new Set(String(onlyArg).split(',').map(s => s.trim()).filter(Boolean));
  const selected = records.filter(r => wanted.has(communityKey(r)));
  const missing = [...wanted].filter(k => !selected.some(r => communityKey(r) === k));
  if (missing.length) {
    console.error(`No hay landing para: ${missing.join(', ')}`);
    process.exit(2);
  }
  return selected;
}

// --- HTML ----------------------------------------------------------------

const CSS = fs.readFileSync(path.join(landings, 'styles.css'), 'utf8');

// Toma el <main>, el footer del sitio y los scripts del body. El JSON-LD vive
// en el head: se devuelve aparte para el payload de SEO.
function splitLanding(html) {
  const main = html.match(/<main>[\s\S]*?<\/main>/);
  const footer = html.match(/<footer class="site-footer">[\s\S]*?<\/footer>/);
  if (!main) throw new Error('La landing no tiene <main>');
  if (!footer) throw new Error('La landing no tiene <footer class="site-footer">');
  const bodyStart = html.indexOf('<body>');
  const body = bodyStart === -1 ? '' : html.slice(bodyStart);
  const scripts = [...body.matchAll(/<script>[\s\S]*?<\/script>/g)].map(m => m[0]).join('\n');
  return { main: main[0], footer: footer[0], scripts };
}

// Assets relativos al documento de la landing (../../../img/x, ../../../hero/y).
// Se devuelven como claves relativas a landings/ (img/x, hero/y).
function assetKeys(fragment) {
  const keys = new Set();
  for (const m of fragment.matchAll(/\.\.\/\.\.\/\.\.\/((?:img|hero)\/[^"'\s)]+)/g)) keys.add(m[1]);
  return [...keys].sort();
}

function rewriteAssets(fragment, urls) {
  return fragment.replace(/\.\.\/\.\.\/\.\.\/((?:img|hero)\/[^"'\s)]+)/g, (_, key) => {
    if (!urls[key]) throw new Error(`Falta la URL del asset ${key}: vuelve a correr con --upload`);
    return urls[key];
  });
}

// URL pública de la imagen social: si es una ruta del subdominio, se sustituye
// por la copia de la Media Library para que GHL la pueda usar como og:image.
function seoImage(ogImage, urls) {
  if (!ogImage) return '';
  const prefix = `${SITE}/`;
  if (ogImage.startsWith(prefix)) {
    const key = ogImage.slice(prefix.length);
    if (/^(?:img|hero)\//.test(key) && urls[key]) return urls[key];
  }
  return ogImage;
}

function buildPage(record, kind, urls) {
  const file = path.join(landings, record.municipalitySlug, record.slug, SLUGS[kind], 'index.html');
  if (!fs.existsSync(file)) throw new Error(`Falta la landing ${file}`);
  const raw = fs.readFileSync(file, 'utf8');
  const { main, footer, scripts } = splitLanding(raw);
  const body = `${main}\n${footer}\n${scripts}`;
  const title = (raw.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '';
  const description = (raw.match(/<meta name="description" content="([\s\S]*?)">/) || [])[1] || '';
  const canonical = (raw.match(/<link rel="canonical" href="([\s\S]*?)">/) || [])[1] || '';
  const ogImage = (raw.match(/<meta property="og:image" content="([\s\S]*?)">/) || [])[1] || '';
  const jsonLd = (raw.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/) || [])[1] || '';
  const url = `${SITE}/${record.municipalitySlug}/${record.slug}/${SLUGS[kind]}`;

  return {
    kind,
    name: PAGE_NAME[kind],
    path: SLUGS[kind],
    url,
    canonical: canonical || url,
    seo: {
      title,
      description,
      image: seoImage(ogImage, urls),
    },
    jsonLd,
    // Fragmento listo para el bloque de código de GHL: CSS + main + footer +
    // script de revelado. El CSS va primero para que el HTML quede después.
    html: `<style>\n${CSS}\n</style>\n${rewriteAssets(body, urls)}`,
  };
}

// --- Media Library -------------------------------------------------------

async function uploadAsset(key, manifest, pit) {
  const file = path.join(landings, key);
  if (!fs.existsSync(file)) throw new Error(`Falta el asset ${file}`);
  const buf = fs.readFileSync(file);
  const hash = sha256(buf);
  const prev = manifest[key];
  if (prev?.sha256 === hash && prev?.url) return prev;

  const form = new FormData();
  form.append('file', new Blob([new Uint8Array(buf)], { type: mimeFor(file) }), path.basename(file));
  form.append('locationId', LOCATION);

  const res = await fetch(MEDIA_ENDPOINT, {
    method: 'POST',
    headers: { Authorization: `Bearer ${pit}`, Version: '2021-07-28' },
    body: form,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.url) {
    throw new Error(`No se pudo subir ${key} (${res.status}): ${JSON.stringify(json).slice(0, 300)}`);
  }
  manifest[key] = {
    url: json.url,
    fileId: json.fileId || '',
    sha256: hash,
    uploadedAt: new Date().toISOString(),
  };
  // Se guarda tras cada subida: si el lote se corta, no se repiten archivos.
  writeJson(assetsFile, manifest);
  return manifest[key];
}

// --- principal -----------------------------------------------------------

const records = selectRecords();
const manifest = readJson(assetsFile, {});
const pit = upload ? token() : '';
if (upload && !pit) {
  console.error('Falta GHL_PIT (variable de entorno) o ZJ_GHL_PIT en .mcp.json');
  process.exit(3);
}

const index = readJson(path.join(outDir, 'index.json'), { domain: DOMAIN, funnels: [] });
const byKey = new Map(index.funnels.map(f => [`${f.municipalitySlug}/${f.slug}`, f]));

let pagesTotal = 0;
let assetsTotal = 0;

for (const record of records) {
  const key = communityKey(record);
  // Junta los assets de las dos páginas antes de subirlos.
  const fragments = [];
  for (const kind of KINDS) {
    const file = path.join(landings, record.municipalitySlug, record.slug, SLUGS[kind], 'index.html');
    if (!fs.existsSync(file)) throw new Error(`Falta la landing ${file}`);
    const raw = fs.readFileSync(file, 'utf8');
    const { main, footer, scripts } = splitLanding(raw);
    fragments.push(`${main}\n${footer}\n${scripts}`);
  }
  const keys = [...new Set(fragments.flatMap(assetKeys))].sort();

  if (upload) {
    for (const asset of keys) {
      const before = manifest[asset]?.url;
      await uploadAsset(asset, manifest, pit);
      if (!before) assetsTotal++;
    }
  }

  const urls = Object.fromEntries(keys.map(k => [k, manifest[k]?.url || '']));
  const pages = KINDS.map(kind => buildPage(record, kind, urls));
  pagesTotal += pages.length;

  const payload = {
    municipality: record.municipality,
    community: record.name,
    municipalitySlug: record.municipalitySlug,
    slug: record.slug,
    domain: DOMAIN,
    funnelName: `Comunidad · ${record.name} (${record.municipality})`,
    funnelPath: key,
    // La raíz no es un hub (no hay página con los dos servicios). Se redirige
    // a la landing de techos por si algún enlace viejo llega sin path.
    rootRedirect: `/${key}/${SLUGS.techos}`,
    priority: record.priority || '',
    status: 'pendiente',
    generatedAt: new Date().toISOString(),
    pages,
  };

  writeJson(path.join(outDir, 'funnels', record.municipalitySlug, `${record.slug}.json`), payload);

  // Vista previa autónoma: mismo fragmento que se pega en GHL, con un head
  // mínimo. Sirve para revisar el render sin tocar la cuenta.
  for (const page of pages) {
    const doc = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${page.seo.title}</title>
<meta name="description" content="${page.seo.description}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Outfit:wght@600;800&display=swap" rel="stylesheet">
${page.jsonLd ? `<script type="application/ld+json">${page.jsonLd}</script>` : ''}
</head>
<body>
${page.html}
</body>
</html>
`;
    const preview = path.join(outDir, 'preview', record.municipalitySlug, record.slug, `${page.kind}.html`);
    fs.mkdirSync(path.dirname(preview), { recursive: true });
    fs.writeFileSync(preview, doc, 'utf8');
  }

  byKey.set(key, {
    municipality: record.municipality,
    community: record.name,
    municipalitySlug: record.municipalitySlug,
    slug: record.slug,
    priority: record.priority || '',
    funnelName: payload.funnelName,
    funnelPath: key,
    rootRedirect: payload.rootRedirect,
    pages: pages.map(p => ({ kind: p.kind, name: p.name, path: p.path, url: p.url })),
    status: payload.status,
    generatedAt: payload.generatedAt,
  });
  console.log(`ok ${key} · ${pages.length} páginas${keys.length ? ` · ${keys.length} assets` : ''}`);
}

index.domain = DOMAIN;
index.generatedAt = new Date().toISOString();
index.funnels = [...byKey.values()].sort((a, b) => a.funnelPath.localeCompare(b.funnelPath));
writeJson(path.join(outDir, 'index.json'), index);

console.log(`\n${records.length} comunidad(es) · ${pagesTotal} páginas · ${assetsTotal} assets nuevos`);
console.log(`Salida: ${path.relative(process.cwd(), outDir)}`);
