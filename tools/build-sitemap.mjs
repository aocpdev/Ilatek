// Ilatek · sitemap completo desde docs/estructura.json + páginas reales.
// Reglas:
//  - Excluye la URL legacy /techos (canonicaliza a /home).
//  - No incluye slugs con sufijo numérico heredado (/home-118878, etc.).
//  - Deduplica por URL.
//  - El blog solo entra si blog/publicacion.json dice publicado:true y sus
//    rutas existen; hoy el host devuelve 404 y se documenta, no se finge.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, structure } from './site-paths.mjs';

const BASE = 'https://ilatekpr.com';
const TODAY = '2026-11-07';
const OUT = path.join(ROOT, 'sitemap.xml');

const entries = new Map();
const add = (loc, priority = '0.7', changefreq = 'monthly') => {
  if (entries.has(loc)) return;
  entries.set(loc, { loc, priority, changefreq });
};

for (const page of structure.pages) {
  if (page.status === 'legacy-canonical-home' || page.slug === 'techos') continue;
  const loc = page.slug === 'home' ? `${BASE}/` : `${BASE}/${page.slug}`;
  const priority = page.slug === 'home' ? '1.0' : page.slug === 'sellado-de-techos' ? '0.9' : '0.7';
  add(loc, priority);
}

// Páginas reales fuera del manifest de landings.
for (const [slug, file] of [
  ['garantia', 'garantia/ILATEK-Garantias.html'],
  ['resenas', 'resenas/ghl-resenas-landing.html'],
  ['comunidades', 'comunidades/landing-pages/comunidades.html'],
]) {
  if (fs.existsSync(path.join(ROOT, file))) add(`${BASE}/${slug}`, '0.5');
}

// Copias EN: solo las que ya tienen su HTML generado. Una página sin copia
// inglesa no se anuncia, para no dejar URLs muertas en el sitemap.
const EN_EXTRA = {
  servicios: 'categorias/servicios/es/landing-pages/servicios.html',
  'servicios-techos': 'categorias/techos/es/landing-pages/servicios-techos.html',
};
// Las dos categorías viven fuera de structure.pages: su URL ES se anuncia igual
// que la del resto, para que cada par EN tenga su versión española.
for (const [slug, file] of Object.entries(EN_EXTRA)) {
  if (fs.existsSync(path.join(ROOT, file))) add(`${BASE}/${slug}`, '0.9');
}
// Solo las copias EN ya publicadas en GHL entran al sitemap. Una copia generada
// pero sin ruta viva sería una URL muerta, que es justo lo que no se anuncia.
const EN_PUBLICADAS = [
  // Techos: 31 landings de servicio + la categoría de servicios de techos.
  'canaletas-y-bajantes', 'empozamiento-de-techos', 'impermeabilizacion-de-techos',
  'inspeccion-de-techos', 'inspeccion-y-mantenimiento-de-techos',
  'instalacion-y-reemplazo-de-techos', 'lavado-a-presion-techos',
  'limpieza-de-techos-y-canaletas', 'mantenimiento-de-techos', 'membrana-asfaltica',
  'recubrimiento-elastomerico', 'reparacion-de-filtraciones', 'reparacion-de-goteras',
  'reparacion-de-grietas-techos', 'reparacion-de-techos', 'reparacion-post-huracan',
  'sellado-acrilico', 'sellado-de-poliuretano', 'sellado-de-silicona', 'sellado-de-techos',
  'sellado-de-techos-comercial', 'sellado-de-techos-industrial',
  'sellado-de-techos-residencial', 'techos-de-asfalto', 'techos-de-concreto',
  'techos-de-madera', 'techos-de-teja', 'techos-de-zinc', 'techos-planos',
  'techos-por-segmento', 'tragaluces',
  // Categorías de servicios.
  'servicios', 'servicios-techos',
  // Limpieza: las 13 landings de servicio (la categoría /servicios ya va arriba).
  'airbnb-turnover', 'alfombras', 'electrodomesticos', 'lavado-a-presion',
  'limpieza-comercial', 'limpieza-de-mudanza', 'limpieza-estandar',
  'limpieza-industrial', 'limpieza-profunda', 'limpieza-residencial',
  'organizacion', 'post-construccion', 'ventanas',
];
// El home inglés vive en `/en/home`; su par ES es la raíz `/`, que el sitemap ya anuncia.
EN_PUBLICADAS.push('home');
// `/techos` consolida a `/home` y está fuera del sitemap: su copia EN tampoco se
// anuncia, para no publicar una ruta EN cuyo par ES se retiró a propósito.
// Copia inglesa con slug propio (no derivado del español).
if (fs.existsSync(path.join(ROOT, 'comunidades/en/landing-pages/communities.en.html')) &&
    fs.existsSync(path.join(ROOT, 'comunidades/landing-pages/comunidades.html'))) {
  add(`${BASE}/en/communities`, '0.8');
}
let enCount = 0;
const enDir = path.join(ROOT, 'src/en');
if (fs.existsSync(enDir)) {
  for (const f of fs.readdirSync(enDir).filter(n => n.endsWith('.json'))) {
    const slug = f.replace(/\.json$/, '');
    const page = structure.pages.find(p => p.slug === slug);
    const esFile = EN_EXTRA[slug] || (page && page.file);
    if (!esFile) continue;
    const folder = path.dirname(path.dirname(path.dirname(esFile)));
    const enHtml = path.join(ROOT, folder, 'en', 'landing-pages', slug + '.en.html');
    if (fs.existsSync(enHtml) && EN_PUBLICADAS.includes(slug)) { add(`${BASE}/en/${slug}`, '0.8'); enCount++; }
  }
}

// Blog: solo si está publicado de verdad y el XML local existe.
const blogStatePath = path.join(ROOT, 'blog/publicacion.json');
let blogState = { publicado: false };
if (fs.existsSync(blogStatePath)) {
  try { blogState = JSON.parse(fs.readFileSync(blogStatePath, 'utf8')); } catch { /* no publicado */ }
}
let blogCount = 0;
if (blogState.publicado === true) {
  const blogMap = path.join(ROOT, 'blog/sitemap-blog.xml');
  if (fs.existsSync(blogMap)) {
    const xml = fs.readFileSync(blogMap, 'utf8');
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      if (m[1].startsWith(BASE + '/blog')) { add(m[1], '0.6'); blogCount++; }
    }
  }
}

const urls = [...entries.values()].sort((a, b) => {
  if (a.loc === `${BASE}/`) return -1;
  if (b.loc === `${BASE}/`) return 1;
  return a.loc.localeCompare(b.loc);
});

// Guard duro: ningún slug heredado con sufijo numérico ni duplicados.
const seen = new Set();
for (const { loc } of urls) {
  if (seen.has(loc)) throw new Error(`sitemap: URL duplicada ${loc}`);
  seen.add(loc);
  if (/\/home-\d+$/.test(loc) || /\/[a-z0-9-]+-\d{4,}$/.test(loc)) {
    throw new Error(`sitemap: URL heredada con sufijo numérico ${loc}`);
  }
}

// El build de techos necesita sus marcadores para reemplazar solo su bloque.
// Se separan las URLs de techos del resto y se envuelven en TECHOS:START/END.
const techosSlugs = new Set(structure.pages
  .filter((p) => p.group === 'techos' && p.status !== 'legacy-canonical-home')
  .map((p) => p.slug));
const slugOf = (loc) => loc === `${BASE}/` ? 'home' : loc.slice(BASE.length + 1);
const normalUrls = urls.filter((u) => !techosSlugs.has(slugOf(u.loc)));
const techosUrls = urls.filter((u) => techosSlugs.has(slugOf(u.loc)));
// Pares ES↔EN con hreflang recíproco. Solo se emite el bloque cuando los dos
// lados están en el sitemap, para que ningún alternate apunte a una URL muerta.
const EN_A_ES = { communities: 'comunidades' };
const enToEs = new Map();
const esToEn = new Map();
for (const { loc } of urls) {
  const m = loc.match(/^https:\/\/ilatekpr\.com\/en\/(.+)$/);
  if (!m) continue;
  const slug = m[1];
  // Pares cuyo slug inglés no coincide con el español: /comunidades ↔ /en/communities.
  const es = EN_A_ES[slug] ? `${BASE}/${EN_A_ES[slug]}` : slug === 'home' ? `${BASE}/` : `${BASE}/${slug}`;
  if (seen.has(es)) { enToEs.set(loc, es); esToEn.set(es, loc); }
}
const alternates = (loc) => {
  // Si `loc` es una copia EN, su español es enToEs; si es español, es él mismo.
  const es = enToEs.get(loc) || loc;
  const en = esToEn.get(es);
  if (!en) return '';
  return `<xhtml:link rel="alternate" hreflang="es-PR" href="${es}"/>` +
    `<xhtml:link rel="alternate" hreflang="en-US" href="${en}"/>` +
    `<xhtml:link rel="alternate" hreflang="x-default" href="${es}"/>`;
};
const line = (u, permitido = null) => {
  let alt = alternates(u.loc);
  if (alt && permitido) {
    const es = enToEs.get(u.loc) || u.loc;
    const en = esToEn.get(es);
    if (!permitido.has(es) || !permitido.has(en)) alt = '';
  }
  return `  <url><loc>${u.loc}</loc>${alt}<lastmod>${TODAY}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`;
};
const body = [
  ...normalUrls.map((u) => line(u)),
  '  <!-- TECHOS:START -->',
  ...techosUrls.map((u) => line(u)),
  '  <!-- TECHOS:END -->',
].join('\n');

fs.writeFileSync(OUT,
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${body}\n</urlset>\n`,
  'utf8');

const pares = urls.filter((u) => alternates(u.loc)).length;
console.log(`sitemap.xml: ${urls.length} URLs · ${pares} con hreflang (${pares / 2} pares ES/EN) · blog publicado=${blogState.publicado === true} (${blogCount} URLs)`);

// Segundo fichero: solo URLs que hoy devuelven 200, para subir a Search Console
// sin declarar rutas que todavía no existen (las /en/* y /en/home).
const vivo = new Map();
await Promise.all(urls.map(async (u) => {
  try {
    const r = await fetch(u.loc, { method: 'HEAD', redirect: 'follow' });
    vivo.set(u.loc, r.status);
  } catch { vivo.set(u.loc, 0); }
}));
const ok = urls.filter((u) => vivo.get(u.loc) === 200);
const fullBody = (lista) => {
  const techosSet = techosSlugs;
  const n = lista.filter((u) => !techosSet.has(slugOf(u.loc)));
  const t = lista.filter((u) => techosSet.has(slugOf(u.loc)));
  const permitido = new Set(lista.map((u) => u.loc));
  return [...n.map((u) => line(u, permitido)), '  <!-- TECHOS:START -->', ...t.map((u) => line(u, permitido)), '  <!-- TECHOS:END -->'].join('\n');
};
fs.writeFileSync(path.join(ROOT, 'sitemap-actual.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${fullBody(ok)}\n</urlset>\n`,
  'utf8');
const roto = urls.filter((u) => vivo.get(u.loc) !== 200);
console.log(`sitemap-actual.xml: ${ok.length} URLs con 200 · ${roto.length} sin publicar (${roto.slice(0, 3).map((u) => u.loc.replace('https://ilatekpr.com', '') || '/').join(', ')}${roto.length > 3 ? ', …' : ''})`);
