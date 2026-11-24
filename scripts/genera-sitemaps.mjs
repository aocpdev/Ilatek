// Genera los sitemaps de cada host:
//   ilatekpr.com/sitemap.xml ........ índice → sitemap-paginas.xml (+ blog/sitemap-blog.xml si el blog está vivo)
//   ilatekpr.com/sitemap-paginas.xml  todas las URLs del sitio con 200 real y página en el repo,
//                                    con alternates hreflang es/en/x-default cuando la página tiene gemela
//   <pueblo>.ilatekpr.com/sitemap.xml las landings del municipio (las escribe scripts/genera-pueblos.mjs)
// El host comunidades.ilatekpr.com ya no publica sitemap: sus URLs canonicalizan a la copia del pueblo.
// Uso: node scripts/genera-sitemaps.mjs [--sin-red]
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const SITE = 'https://ilatekpr.com';
const SUB = 'https://comunidades.ilatekpr.com';
const sinRed = process.argv.includes('--sin-red');
// --pendientes: incluye las URLs del lote de publicación aunque aún den 404 (se van a publicar).
const incluyePendientes = process.argv.includes('--pendientes');

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
async function pide(url, intentos = 2) {
  for (let i = 1; i <= intentos; i++) {
    try {
      const ctl = new AbortController();
      const t = setTimeout(() => ctl.abort(), 15000);
      const r = await fetch(url, { redirect: 'follow', signal: ctl.signal, headers: { 'user-agent': 'Ilatek-SitemapBot/1.0' } });
      clearTimeout(t);
      const txt = await r.text();
      return { status: r.status, txt };
    } catch {
      if (i === intentos) return { status: 0, txt: '' };
      await dormir(400 * i);
    }
  }
}
async function enParalelo(items, limite, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(limite, items.length) }, async () => {
      while (i < items.length) {
        const k = i++;
        out[k] = await fn(items[k], k);
      }
    })
  );
  return out;
}

// Páginas nativas de GHL sin código en el repo, verificadas 200 y con canonical propio.
const NATIVAS_GHL = ['https://ilatekpr.com/contactanos', 'https://ilatekpr.com/reclutamiento-empleo-techos'];
// Alias que no son URL canónica: /home sirve la portada pero canonicaliza a "/" (verificado en vivo).
const ALIAS = new Set([SITE + '/home']);

/* ---------- índice canonical → archivo (solo páginas con código en el repo) ---------- */
const indice = new Set();
const textoCanonico = new Map(); // URL normalizada → forma exacta publicada (la portada lleva «/»)
const pares = new Map(); // URL normalizada → { es, en } declarado por <link rel="alternate" hreflang>
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (/(node_modules|\.git|documentacion|archivo|\.tmp|\.backups)/.test(p.replace(/\\/g, '/'))) continue;
    if (e.isDirectory()) walk(p);
    else if (/\.html$/i.test(e.name)) {
      const h = fs.readFileSync(p, 'utf8');
      for (const m of h.matchAll(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/gi)) {
        const c = m[1].trim();
        const k = c.replace(/\/$/, '') || SITE;
        indice.add(k);
        if (!textoCanonico.has(k)) textoCanonico.set(k, c);
      }
      const alt = [...h.matchAll(/<link[^>]*rel="alternate"[^>]*hreflang="(es|en)(?:-[A-Za-z]{2})?"[^>]*href="([^"]+)"/gi)];
      if (alt.length >= 2) {
        const u = {};
        for (const a of alt) u[a[1].toLowerCase()] = a[2].trim();
        if (u.es && u.en) {
          // /home es alias de la portada: para hreflang cuenta como "/"
          const kEs0 = u.es.replace(/\/$/, '') || SITE;
          const kEs = kEs0 === SITE + '/home' ? SITE : kEs0;
          const kEn = u.en.replace(/\/$/, '') || SITE;
          const par = { es: kEs === SITE ? SITE + '/' : kEs, en: kEn };
          pares.set(kEs, par);
          pares.set(kEn, par);
        }
      }
    }
  }
})(ROOT);

/* ---------- candidatas: lo que sirve producción + el blog + nativas ---------- */
const candidatas = new Set(NATIVAS_GHL);
/* ---------- lote de publicación: URLs que se van a publicar (pueden dar 404 hoy) ---------- */
const pendientes = new Set();
const rutaLote = path.join(ROOT, 'GHL-PUBLICAR/lote-sitio/00-CHECKLIST.csv');
if (fs.existsSync(rutaLote)) {
  for (const fila of fs.readFileSync(rutaLote, 'utf8').trim().split(/\r?\n/).slice(1)) {
    const slug = (fila.split(';')[2] || '').trim();
    if (!slug) continue;
    const u = slug === '(raíz)' ? SITE + '/' : SITE + '/' + slug;
    pendientes.add(u.replace(/\/$/, '') || SITE);
    candidatas.add(u);
  }
}
// si una página del lote no declara hreflang, se empareja por su ruta /en/ del lote
for (const u of [...pendientes]) {
  const k = u.replace(/\/$/, '') || SITE;
  if (pares.has(k)) continue;
  const ruta = k === SITE ? '/' : k.slice(SITE.length); // «/politica»
  const es = ruta.startsWith('/en/') ? SITE + ruta.replace(/^\/en/, '') : SITE + ruta;
  const en = ruta === '/en/home' ? SITE + '/en/home' : SITE + '/en' + ruta.replace(/^\/en/, '');
  const kEs = es.replace(/\/$/, '') || SITE;
  const kEn = en.replace(/\/$/, '') || SITE;
  if (kEs !== kEn && (kEs === SITE || pendientes.has(kEs)) && pendientes.has(kEn)) {
    const par = { es: kEs === SITE ? SITE + '/' : kEs, en: kEn };
    pares.set(kEs, par);
    pares.set(kEn, par);
  }
}
// las gemelas declaradas por hreflang también entran como candidatas
for (const [k, par] of pares) { candidatas.add(k === SITE ? SITE + '/' : k); candidatas.add(par.en); }
// Todas las páginas del host principal con código en el repo (el blog va en su propio sitemap).
for (const u of indice) {
  if (!u.startsWith(SITE)) continue;
  const p = new URL(u).pathname;
  if (/^\/blog(\/|$)/.test(p)) continue;
  candidatas.add(u === SITE ? SITE + '/' : u);
}
if (!sinRed) {
  const vivo = await pide(SITE + '/sitemap.xml');
  const esIndice = /<sitemapindex/i.test(vivo.txt);
  if (esIndice) {
    for (const m of vivo.txt.matchAll(/<sitemap>[\s\S]*?<loc>([^<]+)<\/loc>/g)) {
      const hijo = await pide(m[1].trim());
      for (const l of hijo.txt.matchAll(/<loc>([^<]+)<\/loc>/g)) candidatas.add(l[1].trim());
    }
  } else {
    for (const m of vivo.txt.matchAll(/<loc>([^<]+)<\/loc>/g)) candidatas.add(m[1].trim());
  }
  if (candidatas.size < 10) {
    console.error('ABORTO: el sitemap vivo devolvió muy pocas URLs (' + candidatas.size + '); no sobrescribo nada.');
    process.exit(1);
  }
}

const rutaBlog = path.join(ROOT, 'blog/sitemap-blog.xml');
const blogUrls = fs.existsSync(rutaBlog)
  ? [...fs.readFileSync(rutaBlog, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim())
  : [];

/* ---------- comprobación 200 + página existente ---------- */
const lista = [...candidatas].sort();
const estados = sinRed ? lista.map(() => 200) : await enParalelo(lista, 8, async (u) => (await pide(u)).status);
const normaliza = (u) => u.replace(/\/$/, '') || SITE;
const conPagina = (u) => indice.has(normaliza(u)) || NATIVAS_GHL.includes(normaliza(u));

const enLote = (u) => incluyePendientes && pendientes.has(normaliza(u));
const vivas = lista.filter((u, i) => (estados[i] === 200 || enLote(u)) && (conPagina(u) || enLote(u)) && !ALIAS.has(normaliza(u)));
const caidas = lista.filter((u, i) => estados[i] !== 200);
const sinArchivo = lista.filter((u, i) => estados[i] === 200 && !conPagina(u));

/* ---------- orden jerárquico + sin duplicados ---------- */
const clave = (u) => {
  const s = new URL(u).pathname.split('/').filter(Boolean);
  return { nivel: s.length, ruta: s.join('/') };
};
const ordenadas = vivas.slice().sort((a, b) => {
  const ka = clave(a);
  const kb = clave(b);
  return ka.nivel - kb.nivel || ka.ruta.localeCompare(kb.ruta, 'es');
});
const vistos = new Set();
const unicas = ordenadas.filter((u) => {
  const k = normaliza(u);
  if (vistos.has(k)) return false;
  vistos.add(k);
  return true;
});

/* ---------- alternates es/en/x-default (solo si las dos URLs están en el sitemap) ---------- */
const enSitemap = new Set(unicas.map((u) => normaliza(u)));
const urlLimpia = (u) => (u === SITE ? SITE + '/' : u);
function entradaSitemap(u) {
  const k = normaliza(u);
  const filas = ['  <url>', `    <loc>${textoCanonico.get(k) || u}</loc>`];
  const par = pares.get(k);
  if (par && enSitemap.has(normaliza(par.es)) && enSitemap.has(normaliza(par.en))) {
    filas.push(`    <xhtml:link rel="alternate" hreflang="es" href="${urlLimpia(par.es)}"/>`);
    filas.push(`    <xhtml:link rel="alternate" hreflang="en" href="${urlLimpia(par.en)}"/>`);
    filas.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${urlLimpia(par.es)}"/>`);
  }
  filas.push('  </url>');
  return filas.join('\n');
}

const xmlPaginas =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<!-- ilatekpr.com — páginas del sitio, solo URLs con 200 verificado y código en el repo\n' +
  '     (más las del lote de publicación pendiente), con alternates hreflang es/en/x-default.\n' +
  '     Generado por scripts/genera-sitemaps.mjs; orden portada → sección → detalle. -->\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
  unicas.map(entradaSitemap).join('\n') +
  '\n</urlset>\n';
fs.writeFileSync(path.join(ROOT, 'sitemap-paginas.xml'), xmlPaginas);

/* ---------- índice del host principal ---------- */
// ILATEK_BLOG_PROBE permite probar el camino "blog publicado" sin tocar código.
const blogVivo = sinRed ? false : (await pide(process.env.ILATEK_BLOG_PROBE || SITE + '/blog')).status === 200;
const hijos = [`${SITE}/sitemap-paginas.xml`];
if (blogVivo && blogUrls.length) hijos.push(`${SITE}/blog/sitemap-blog.xml`);
const indiceXml =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<!-- ilatekpr.com — índice de sitemaps del sitio. Incluye el blog automáticamente en cuanto /blog responde 200. -->\n' +
  '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  hijos.map((u) => `  <sitemap><loc>${u}</loc></sitemap>`).join('\n') +
  '\n</sitemapindex>\n';
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), indiceXml);

/* ---------- blog: se anuncia solo cuando está vivo ---------- */
const rutaRobots = path.join(ROOT, 'robots.txt');
let robots = fs.readFileSync(rutaRobots, 'utf8')
  .split('\n')
  .filter((l) => !/blog\/sitemap-blog\.xml|Sitemap del blog/i.test(l))
  .join('\n')
  .replace(/\n{3,}/g, '\n\n')
  .trimEnd();
robots +=
  '\n\n' +
  (blogVivo
    ? 'Sitemap: ' + SITE + '/blog/sitemap-blog.xml\n'
    : '# El sitemap del blog se anuncia solo cuando /blog responda 200 (hoy /blog y /blog/sitemap-blog.xml dan 404).\n');
fs.writeFileSync(rutaRobots, robots);

/* ---------- el host de comunidades ya no publica sitemap ---------- */
const rutaLandings = path.join(ROOT, 'Comunidades/landings');
if (fs.existsSync(path.join(rutaLandings, 'sitemap.xml'))) fs.unlinkSync(path.join(rutaLandings, 'sitemap.xml'));
fs.writeFileSync(
  path.join(rutaLandings, 'robots.txt'),
  'User-agent: *\nAllow: /\n\n# Este host no publica sitemap: cada landing canonicaliza a su copia en\n' +
    '# https://<municipio>.ilatekpr.com/<comunidad>/<servicio>, que es la que se anuncia\n' +
    '# en el sitemap de cada municipio.\n'
);

/* ---------- informe ---------- */
console.log('· sitemap-paginas.xml: ' + unicas.length + ' URLs vivas con página en el repo (de ' + lista.length + ' candidatas)');
console.log('   · con alternates hreflang: ' + unicas.filter((u) => pares.has(normaliza(u))).length + ' URLs (' + unicas.filter((u) => /\/en\//.test(new URL(u).pathname)).length + ' en inglés)');
console.log('   · del lote incluidas por --pendientes: ' + (incluyePendientes ? unicas.filter(enLote).length : 0));
console.log('   · 404 en producción: ' + caidas.length + (caidas.length ? ' (' + caidas.slice(0, 3).join(', ') + '…)' : ''));
console.log('   · 200 sin página en el repo (fuera): ' + sinArchivo.length);
sinArchivo.forEach((u) => console.log('     – ' + u));
console.log('· sitemap.xml: índice con ' + hijos.length + ' sitemap(s) → ' + hijos.join(', '));
console.log('· blog: ' + blogUrls.length + ' URLs en blog/sitemap-blog.xml, ' + (blogVivo ? 'INCLUIDO en el índice' : 'excluido ( /blog no responde 200 )'));
console.log('· Comunidades/landings: sitemap retirado y robots sin Sitemap (las URLs canónicas viven en los hosts de pueblo)');
