// Ilatek · Blog · genera los fragmentos listos para pegar en GHL y su HEAD SEO.
// Cada página del blog ya es un fragmento (#ilbj) sin <html>/<head>: aquí se
// separa el cuerpo (Custom HTML/JS) del bloque de metadatos (Settings → SEO +
// Tracking Code HEADER) y se produce el manifiesto con el nombre que debe llevar
// la página dentro del builder: "Blog - <landing>".
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { formatPage } from '../../tools/internal-link-contract.mjs'; const HERE = path.dirname(fileURLToPath(import.meta.url));
const BLOG = path.resolve(HERE, '..');
const SITE = 'https://ilatekpr.com';
const OUT = path.join(BLOG, 'embeds'); // Imagen social: copia subida a la Media Library de GHL. Las URLs de jsDelivr
// para assets/social devuelven 404 en este repo, así que el HEAD SEO usa el CDN
// de GHL; el póster de marca queda como respaldo si faltara el mapa.
const MEDIA = (() => { try { return JSON.parse(fs.readFileSync(path.join(BLOG, 'data/ghl-media.json'), 'utf8')).files || {}; } catch { return {}; }
})();
const mediaUrl = (rel) => MEDIA[String(rel).replace(/^\/+/, '')]?.url || 'https://cdn.jsdelivr.net/gh/aocpdev/Ilatek@main/' + String(rel).replace(/^\/+/, '');
const OG_IMAGE = mediaUrl('assets/optimized/hero-poster-1280.webp');
const OG_IMAGE_ALT = 'Sellado de techos en Puerto Rico — Ilatek Techos';
const OG_W = 1280;
const OG_H = 720;
// Tarjeta social propia por página (1200×630, centrada). El resto de las
// páginas usa el póster de marca hasta que se generen sus tarjetas.
// El plan vive en assets/social del sitio, no dentro de blog/: leerlo relativo a
// blog/ abortaba el build entero.
const socialPlan = JSON.parse(fs.readFileSync(path.join(BLOG, '..', 'assets/social/plan.json'), 'utf8'));
const OG_CARDS = new Map(socialPlan.cards.map((c) => [c.path, { url: mediaUrl(c.card), w: 1200, h: 630, alt: c.alt,
}]));
const ogOf = (p) => OG_CARDS.get(p.path) || { url: OG_IMAGE, w: OG_W, h: OG_H, alt: OG_IMAGE_ALT }; const indice = JSON.parse(fs.readFileSync(path.join(BLOG, 'indice.json'), 'utf8'));
const SITE_TITLE_SUFFIX = ' | Ilatek';
const esc = (s = '') => String(s) .replace(/&(?!(?:amp|quot|lt|gt|#\d+);)/g, '&amp;') .replace(/</g, '&lt;') .replace(/>/g, '&gt;') .replace(/"/g, '&quot;'); // Nombre de la página dentro del builder de GHL. El propietario lo quiere así:
// "Blog - Nombre del landing de Blog".
const HUBS = { '/blog': 'Home', '/blog/comparativas': 'Comparativas', '/blog/preguntas-frecuentes': 'Preguntas frecuentes', '/blog/comunidades-y-servicios': 'Comunidades y servicios',
};
function builderName(p) { if (HUBS[p.path]) return 'Blog - ' + HUBS[p.path]; if (p.path.startsWith('/blog/preguntas-frecuentes-')) { const tail = p.path.replace('/blog/preguntas-frecuentes-', '').replace(/-/g, ' '); return 'Blog - ' + tail.charAt(0).toUpperCase() + tail.slice(1); } if (p.path === '/blog') return 'Blog - Home'; return 'Blog - ' + String(p.title).replace(/\s*\|\s*Ilatek\s*$/i, '').slice(0, 70);
} function slugOf(p) { const s = p.path.replace(/^\/blog\/?/, ''); return s ? s.replace(/\//g, '-') : 'home';
} function canonicalOf(p) { return SITE + p.path;
} function seoTitle(p) {
  let t = String(p.title).trim();
  if (!/\|\s*Ilatek\s*$/i.test(t)) t += SITE_TITLE_SUFFIX;
  if (t.length > 65) {
    const base = String(p.title).replace(/\s*\|\s*Ilatek\s*$/i, '');
    const cut = base.slice(0, 65 - SITE_TITLE_SUFFIX.length).replace(/\s+\S*$/, '');
    t = cut + SITE_TITLE_SUFFIX;
  }
  return t;
}
function headBlock(p, title, canonical) { const desc = String(p.description || '').replace(/\s+/g, ' ').trim(); const og = ogOf(p); const url = canonical; return `<!-- ▼▼ ${p.path} · ${p.builder || builderName(p)} ▼▼ -->
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
<meta property="og:type" content="${HUBS[p.path] ? 'website' : 'article'}">
<meta property="og:locale" content="es_PR">
<meta property="og:site_name" content="Ilatek">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${og.url}">
<meta property="og:image:width" content="${og.w}">
<meta property="og:image:height" content="${og.h}">
<meta property="og:image:alt" content="${esc(og.alt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${og.url}">
<meta name="twitter:image:alt" content="${esc(og.alt)}">
<meta name="theme-color" content="#11164b">
<!-- ▲▲ fin ${p.path} ▲▲ -->`;
} fs.mkdirSync(OUT, { recursive: true });
const rows = [];
const heads = [];
let failures = 0;
for (const p of indice.paginas) {
  const src = path.join(BLOG, p.file);
  if (!fs.existsSync(src)) {
    console.error('falta el archivo', p.file);
    failures++;
    continue;
  }
  const html = formatPage(fs.readFileSync(src, 'utf8').trim(), p.path);
  if (/<html\b|<head\b|<body\b/i.test(html)) {
    console.error(p.path, 'no es un fragmento (html/head/body)');
    failures++;
    continue;
  }
  if (/<title\b/i.test(html.replace(/<svg[\s\S]*?<\/svg>/gi, ''))) {
    console.error(p.path, 'lleva <title> de documento');
    failures++;
    continue;
  }
  const slug = slugOf(p);
  const title = seoTitle(p);
  const canonical = canonicalOf(p);
  const embedFile = path.join(OUT, slug + '.html');
  fs.writeFileSync(embedFile, html + '\n', 'utf8');
  heads.push(headBlock(p, title, canonical));
  rows.push({
    builder: builderName(p),
    path: p.path,
    url: canonical,
    canonical,
    title,
    description: String(p.description || '').replace(/\s+/g, ' ').trim(),
    ogImage: ogOf(p).url,
    embed: path.relative(path.join(BLOG, '..'), embedFile).replace(/\\/g, '/'),
    head: 'blog/embeds/head-seo.html',
    bytes: Buffer.byteLength(html),
  });
}
// ── capa EN: fragmento y HEAD de cada copia inglesa ────────────────────────
// Los textos EN vienen del schema traducido; aquí se ajustan al rango SEO
// (título ≤ 65, description 110–165) sin cortar palabras a la mitad.
const fitDesc = (text) => {
  let d = String(text || '').replace(/\s+/g, ' ').trim();
  if (d.length > 165) {
    d = d.slice(0, 165);
    const cut = Math.max(d.lastIndexOf('. '), d.lastIndexOf('; '), d.lastIndexOf(', '));
    d = (cut > 90 ? d.slice(0, cut) : d.slice(0, d.lastIndexOf(' '))).replace(/[\s,;:.-]+$/, '') + '.';
  }
  if (d.length < 110) d = (d.replace(/[.\s]+$/, '') + '. Verified price, warranty and coverage in Puerto Rico.').trim();
  return d.replace(/\s+/g, ' ');
};
const TITLE_EN = { '/blog/en': 'Ilatek Blog: Roof Sealing in Puerto Rico' };
const DESC_EN = {
  '/blog/en': 'Comparisons of roof sealing systems and brands, frequently asked questions and service guides for Puerto Rico, with published price and warranty.',
};
const enPathOf = (p) => (p === '/blog' ? '/blog/en' : p.startsWith('/blog/en') ? p : '/blog/en' + p.slice('/blog'.length));
for (const p of indice.paginas.filter((q) => !q.path.startsWith('/blog/en'))) {
  const src = path.join(BLOG, 'en', p.file);
  if (!fs.existsSync(src)) { console.error('falta la copia EN', p.path); failures++; continue; }
  const enPath = enPathOf(p.path);
  let html = formatPage(fs.readFileSync(src, 'utf8').trim(), enPath);
  const schema = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)]
    .map((m) => { try { return JSON.parse(m[1]); } catch { return null; } })
    .find((d) => d && (d['@type'] === 'BlogPosting' || d['@type'] === 'Blog'));
  const headline = String(schema?.headline || schema?.name || p.title).trim();
  const title = seoTitle({ title: TITLE_EN[enPath] || headline });
  const rawDesc = String(DESC_EN[enPath] || schema?.description || p.description || '').replace(/\s+/g, ' ').trim();
  const desc = fitDesc(rawDesc);
  if (desc !== rawDesc) html = html.split(JSON.stringify(rawDesc)).join(JSON.stringify(desc));
  const canonical = SITE + enPath;
  const slug = 'en-' + enPath.replace(/^\/blog\/?/, '').replace(/\//g, '-');
  const embedFile = path.join(OUT, slug + '.html');
  fs.writeFileSync(embedFile, html + '\n', 'utf8');
  const builder = 'Blog - ' + headline;
  heads.push(headBlock({ path: enPath, description: desc, builder }, title, canonical).replace('content="es_PR"', 'content="en_US"'));
  rows.push({
    builder,
    lang: 'en',
    path: enPath,
    url: canonical,
    canonical,
    title,
    description: desc,
    ogImage: ogOf({ path: enPath }).url,
    embed: path.relative(path.join(BLOG, '..'), embedFile).replace(/\\/g, '/'),
    head: 'blog/embeds/head-seo.html',
    bytes: Buffer.byteLength(html),
  });
}

fs.writeFileSync(path.join(OUT, 'head-seo.html'), `<!-- ILATEK · Blog · HEAD SEO por página.\n DÓNDE PEGAR: GHL → página → Settings → SEO (title/description/canonical) y\n Settings → Tracking Code → HEADER (robots, Open Graph, Twitter).\n Pega SOLO el bloque del slug de ESA página: cada bloque trae un canonical. -->\n\n${heads.join('\n\n')}\n`, 'utf8'); fs.writeFileSync(path.join(OUT, 'paginas.json'), JSON.stringify({ generado: new Date().toISOString(), total: rows.length, site: SITE, ogImage: OG_IMAGE, paginas: rows,
}, null, 2) + '\n', 'utf8'); console.log(`Embeds: ${rows.length} fragmentos + head-seo.html + paginas.json en blog/embeds/`);
console.log(`Primera: ${rows[0].builder} → ${rows[0].embed} (${rows[0].bytes} B)`);
if (failures) process.exitCode = 1;
