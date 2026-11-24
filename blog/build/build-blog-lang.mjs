/**
 * Añade a las páginas del blog el toggle ES/EN del menú y el trío hreflang.
 * Es idempotente y aditivo: no toca nada más de la página.
 *
 *   node build/build-blog-lang.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SITE = 'https://{{custom_values.website_url}}';
const indice = JSON.parse(fs.readFileSync(path.join(ROOT, 'indice.json'), 'utf8')).paginas;

const enPath = (p) => (p === '/blog' ? '/blog/en' : p.startsWith('/blog/en') ? p : '/blog/en' + p.slice('/blog'.length));
const esPath = (p) => (p.startsWith('/blog/en') ? '/blog' : p);

const CSS = `<style id="ilbn-lang-css">#ilbn-lang{display:inline-flex;align-items:center;gap:2px;margin:0 8px 0 0;padding:2px;border:1px solid rgba(17,22,75,.14);border-radius:999px;background:#fff}
#ilbn-lang a{display:inline-flex;align-items:center;justify-content:center;min-width:38px;min-height:30px;padding:0 8px;border-radius:999px;font:700 12px/1 system-ui,sans-serif;letter-spacing:.04em;text-decoration:none;color:#11164b;opacity:.7}
#ilbn-lang a[aria-current="true"]{background:#11164b;color:#fff;opacity:1}
#ilbn-lang a:focus-visible{outline:2px solid #009640;outline-offset:2px}</style>`;

function toggle(es, active) {
  const en = enPath(es);
  return `${CSS}<div id="ilbn-lang" role="group" aria-label="Idioma / Language"><a href="${SITE}${es}" data-ilatek-path="${es}" hreflang="es" lang="es"${active === 'es' ? ' aria-current="true"' : ''}>ES</a><a href="${SITE}${en}" data-ilatek-path="${en}" hreflang="en" lang="en"${active === 'en' ? ' aria-current="true"' : ''}>EN</a></div>`;
}

let tocados = 0;
for (const page of indice) {
  const file = path.join(ROOT, page.file);
  if (!fs.existsSync(file)) continue;
  const isEn = page.path.startsWith('/blog/en');
  const alt = path.join(ROOT, 'en', page.file);
  const target = isEn && fs.existsSync(alt) ? alt : file;
  const raw = fs.readFileSync(target, 'utf8');
  const crlf = raw.includes('\r\n');
  let html = raw.replace(/\r\n/g, '\n');
  const es = esPath(page.path);
  let changed = false;

  if (isEn) {
    // Artículos que solo existen en inglés: no declaran par ES (sería un 404)
    // y llevan la marca de copia inglesa.
    if (/<link\b[^>]*rel="alternate"[^>]*>/.test(html)) {
      html = html.replace(/<link\b[^>]*rel="alternate"[^>]*>\s*/gi, '');
      changed = true;
    }
    if (!html.includes('ILATEK:EN-COPY')) {
      html = html.replace(/<meta charset="utf-8">/i,
        (m) => `${m}\n<!-- ILATEK:EN-COPY -->\n<script>/* Copia EN: el HTML ya viene traducido; se fija el idioma del documento. */document.documentElement.setAttribute("lang","en")</script>`);
      changed = true;
    }
  } else if (!html.includes('hreflang="x-default"')) {
    const trio = `<link rel="alternate" hreflang="es" href="${SITE}${es}">\n<link rel="alternate" hreflang="en" href="${SITE}${enPath(es)}">\n<link rel="alternate" hreflang="x-default" href="${SITE}${es}">`;
    html = html.replace(/<meta charset="utf-8">/i, (m) => m + '\n' + trio);
    changed = true;
  }
  if (!html.includes('id="ilbn-lang"')) {
    const block = toggle(es, isEn ? 'en' : 'es');
    if (/<a class="ilbn-login"[^>]*>[\s\S]*?<\/a>/.test(html)) {
      html = html.replace(/(<a class="ilbn-login"[^>]*>[\s\S]*?<\/a>)/, (m) => m + '\n    ' + block);
    } else if (/<section id="ilatek-nav"[^>]*>/.test(html)) {
      html = html.replace(/(<section id="ilatek-nav"[^>]*>)/, (m) => m + '\n' + block);
    } else {
      console.log('· sin menú del blog:', page.path);
      continue;
    }
    changed = true;
  }
  if (!changed) continue;
  fs.writeFileSync(target, crlf ? html.replace(/\n/g, '\r\n') : html);
  tocados++;
}
console.log('páginas con toggle y hreflang actualizados:', tocados);

// ── sitemap: páginas ES + copias EN con alternates recíprocos ───────────────
const SM = path.join(ROOT, 'sitemap-blog.xml');
const prev = fs.existsSync(SM) ? fs.readFileSync(SM, 'utf8') : '';
const lastmod = new Map();
for (const m of prev.matchAll(/<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)) lastmod.set(m[1], m[2]);
const hoy = new Date().toISOString().slice(0, 10);
const pares = new Map();
for (const p of indice) if (!p.path.startsWith('/blog/en')) pares.set(enPath(p.path), p.path);

const urls = [];
for (const p of indice) urls.push({ loc: 'https://ilatekpr.com' + p.path, path: p.path });
for (const [en, es] of pares) urls.push({ loc: 'https://ilatekpr.com' + en, path: en });

const seen = new Set();
const body = urls
  .filter((u) => (seen.has(u.loc) ? false : seen.add(u.loc)))
  .map((u) => {
    const es = u.path.startsWith('/blog/en') ? pares.get(u.path) : u.path;
    const en = u.path.startsWith('/blog/en') ? u.path : enPath(u.path);
    const prio = u.path === '/blog' ? '0.9' : u.path === '/blog/en' ? '0.9' : '0.7';
    const alt = es
      ? `<xhtml:link rel="alternate" hreflang="es" href="https://ilatekpr.com${es}"/><xhtml:link rel="alternate" hreflang="en" href="https://ilatekpr.com${en}"/><xhtml:link rel="alternate" hreflang="x-default" href="https://ilatekpr.com${es}"/>`
      : '';
    return `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${lastmod.get(u.loc) || hoy}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>${prio}</priority>${alt ? '\n    ' + alt : ''}\n  </url>`;
  })
  .join('\n');

fs.writeFileSync(SM, `<?xml version="1.0" encoding="UTF-8"?>
<!-- ilatekpr.com — blog (ES + EN). Generado por blog/build/build-blog.mjs y build-blog-lang.mjs; no editar a mano. Publica estas URLs solo cuando cada página exista en GHL. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${body}
</urlset>
`);
console.log('sitemap-blog.xml:', urls.length, 'URLs (ES + EN)');
