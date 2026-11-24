#!/usr/bin/env node
/**
 * Genera el HEAD-TEMPLATE de la copia inglesa de una landing.
 *
 * Fuente: <landing>/es/HEAD-TEMPLATE.html + src/en/<slug>.json
 * Salida: <landing>/en/HEAD-TEMPLATE.html
 *
 * Reglas:
 * - Traduce solo textos visibles del HEAD (title y content="..."), nunca URLs,
 *   Custom Values ni esquemas.
 * - canonical pasa a /en/<slug>; el par hreflang queda recíproco
 *   (en -> /en/<slug>, es y x-default -> /<slug>) y og:locale a inglés.
 * - og:image/twitter:image se quedan con la tarjeta propia de la página.
 *
 * Uso: node tools/build-en-head.mjs <slug> [...]
 */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, structure } from './site-paths.mjs';

const EXTRA = {
  servicios: 'categorias/servicios/es/landing-pages/servicios.html',
  'servicios-techos': 'categorias/techos/es/landing-pages/servicios-techos.html',
};
const esPage = (slug) => EXTRA[slug] || structure.pages.find((p) => p.slug === slug)?.file;
const landing = (slug) => path.dirname(path.dirname(path.dirname(path.resolve(ROOT, esPage(slug)))));
const escAttr = (s) => String(s).replace(/&(?!(?:amp|quot|lt|gt|#\d+);)/g, '&amp;').replace(/"/g, '&quot;');

const slugs = process.argv.slice(2);
if (!slugs.length) { console.error('Uso: node tools/build-en-head.mjs <slug> [...]'); process.exit(1); }

let failures = 0;
for (const slug of slugs) {
  const esFile = path.join(landing(slug), 'es', 'HEAD-TEMPLATE.html');
  const mapFile = path.join(ROOT, 'src/en', slug + '.json');
  if (!fs.existsSync(esFile)) { console.error(`✗ ${slug}: falta ${path.relative(ROOT, esFile)}`); failures++; continue; }
  if (!fs.existsSync(mapFile)) { console.error(`✗ ${slug}: falta src/en/${slug}.json`); failures++; continue; }
  const map = JSON.parse(fs.readFileSync(mapFile, 'utf8'));
  const tr = (s) => map[s.trim()] !== undefined ? map[s.trim()] : s;

  let head = fs.readFileSync(esFile, 'utf8');

  // 1) <title>
  head = head.replace(/(<title[^>]*>)([\s\S]*?)(<\/title>)/gi,
    (m, a, txt, b) => a + escAttr(tr(txt.replace(/\s+/g, ' ').trim())) + b);

  // 2) title/description/og:title/og:description/twitter:title/twitter:description/alt
  head = head.replace(/\b(content)="([^"]*)"/gi, (all, attr, value) => {
    if (/^https?:|^\{\{|^\/|^\d+$|^[a-z]{2}_[A-Z]{2}$|^[a-z_]+\.|^image\//.test(value.trim()) || /^\d+$/.test(value)) return all;
    const hit = map[value.trim()];
    if (hit === undefined) return all;
    // Los espejos locales se recalculan abajo.
    return `${attr}="${escAttr(hit)}"`;
  });

  // 3) espejos data-ilatek-local-* con el valor ya traducido
  head = head.replace(/<[a-z][^>]*>/gi, (tag) => tag
    .replace(/(\bdata-ilatek-local-content=")([^"]*)(")/gi, (m, a, _v, b) => {
      const v = /\bcontent="([^"]*)"/i.exec(tag);
      return v ? a + encodeURIComponent(v[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&')) + b : m;
    }));

  // 4) canonical / hreflang / og:url / og:locale
  head = head.replace(/(<link[^>]*rel="canonical"[^>]*href=")([^"]*)(")/gi,
    (m, a, _v, b) => a + `https://{{custom_values.website_url}}/en/${slug}` + b);
  head = head.replace(/(<meta[^>]*property="og:url"[^>]*content=")([^"]*)(")/gi,
    (m, a, _v, b) => a + `https://{{custom_values.website_url}}/en/${slug}` + b);
  head = head.replace(/(<meta[^>]*property="og:locale"[^>]*content=")([^"]*)(")/gi, (m, a, _v, b) => a + 'en_US' + b);

  const pair = [
    `<link rel="alternate" hreflang="en" href="https://{{custom_values.website_url}}/en/${slug}">`,
    `<link rel="alternate" hreflang="es" href="https://{{custom_values.website_url}}/${slug}">`,
    `<link rel="alternate" hreflang="x-default" href="https://{{custom_values.website_url}}/${slug}">`,
  ].join('\n');
  // Se quitan los alternates previos (de cualquier idioma) y se insertan los tres.
  const hadAlt = /<link[^>]*rel="alternate"[^>]*>/i.test(head);
  head = head.replace(/<link[^>]*rel="alternate"[^>]*>\s*/gi, '');
  if (hadAlt || /<link[^>]*rel="canonical"[^>]*>/i.test(head)) {
    head = head.replace(/(<link[^>]*rel="canonical"[^>]*>\s*)/i, (m) => m + pair + '\n');
  } else {
    head = pair + '\n' + head;
  }

  // Una carpeta `en/` puede alojar más de una copia (techos + servicios-techos).
  // En ese caso cada página lleva su HEAD propio y HEAD-TEMPLATE.html queda para
  // la página que da nombre a la carpeta.
  const outDir = path.join(landing(slug), 'en');
  const siblings = [...structure.pages, ...Object.entries(EXTRA).map(([s, f]) => ({ slug: s, file: f }))]
    .filter((p) => p.slug !== slug && landing(p.slug) === landing(slug))
    .map((p) => p.slug);
  fs.mkdirSync(outDir, { recursive: true });
  const out = path.join(outDir, 'HEAD-TEMPLATE.html');
  const own = path.join(outDir, `HEAD-TEMPLATE-${slug}.html`);
  if (!siblings.length) {
    fs.writeFileSync(out, head, 'utf8');
    console.log(`escrito ${slug} -> ${path.relative(ROOT, out).replace(/\\/g, '/')}`);
  } else {
    fs.writeFileSync(own, head, 'utf8');
    console.log(`escrito ${slug} -> ${path.relative(ROOT, own).replace(/\\/g, '/')} (carpeta compartida: ${siblings.join(', ')})`);
    if (path.basename(landing(slug)) === slug) fs.writeFileSync(out, head, 'utf8');
  }
}
if (failures) process.exit(1);
