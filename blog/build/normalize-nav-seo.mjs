// Ilatek · Blog · normaliza el menú del blog a UNA sola línea (móvil y escritorio),
// lo contiene dentro de su barra, añade el schema de navegación y refresca fechas.
// Idempotente: marca los cambios con ILATEK:NAV-ONE-LINE / ILATEK:NAV-SCHEMA.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BLOG = path.resolve(HERE, '..');
const ROOT = path.resolve(BLOG, '..');
const FECHA = '2026-11-09';

const RULES = [
  // 1. Barra: una sola línea, sin desbordar el contenedor.
  ['#ilbj .ilbn-in{width:min(100% - 24px,1140px);margin-inline:auto;display:flex;align-items:center;gap:12px;min-height:64px;padding:8px 0}',
   '#ilbj .ilbn-in{width:min(100% - 24px,1140px);margin-inline:auto;display:flex;align-items:center;flex-wrap:nowrap;gap:clamp(6px,1.2vw,12px);min-height:64px;padding:8px 0;min-width:0} /* ILATEK:NAV-ONE-LINE */'],
  // 2. Franja de enlaces: scroll horizontal dentro de la barra, nunca salto de fila.
  ['#ilbj .ilbn-links{display:flex;gap:2px;margin-left:auto;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch}',
   '#ilbj .ilbn-links{display:flex;flex-wrap:nowrap;gap:2px;margin-left:auto;min-width:0;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain}'],
  // 3. Enlaces: tamaño fluido, sin partir texto.
  ['#ilbj .ilbn-links a{flex:none;padding:9px 12px;border-radius:10px;font:700 13.5px/1 Manrope,Arial,sans-serif;color:var(--muted);text-decoration:none;white-space:nowrap}',
   '#ilbj .ilbn-links a{flex:0 0 auto;padding:clamp(6px,1.1vw,9px) clamp(7px,1.4vw,12px);border-radius:10px;font:700 clamp(11.5px,2.9vw,13.5px)/1 Manrope,Arial,sans-serif;color:var(--muted);text-decoration:none;white-space:nowrap}'],
  // 4. CTA y marca: no crecen ni se parten.
  ['#ilbj .ilbn-cta{flex:none;display:inline-flex;align-items:center;min-height:40px;padding:0 15px;',
   '#ilbj .ilbn-cta{flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;white-space:nowrap;min-height:40px;padding:0 clamp(10px,2.4vw,15px);'],
  ['#ilbj .ilbn-brand{display:inline-flex;align-items:center;gap:9px;flex:none;',
   '#ilbj .ilbn-brand{display:inline-flex;align-items:center;gap:9px;flex:0 0 auto;'],
  // 5. El bloque de 700px que rompía la barra en dos filas.
  ['@media (max-width:700px){ #ilbj .ilbn-in{width:min(100% - 32px,1140px);flex-wrap:wrap;gap:8px;padding:8px 0 10px} #ilbj .ilbn-brand span{display:none} #ilbj .ilbn-links{order:3;flex:1 0 100%;width:100%;margin:0;padding-top:8px;border-top:1px solid var(--line);overflow:visible;flex-wrap:wrap;gap:4px} #ilbj .ilbn-links a{flex:0 1 auto;display:inline-flex;align-items:center;min-height:40px;padding:8px 10px;white-space:normal;text-align:center} #ilbj .ilbn-cta{margin-left:auto;padding:0 13px} #ilbj .ilb-article h2,#ilbj .ilb-article h3{scroll-margin-top:180px}',
   '@media (max-width:700px){ #ilbj .ilbn-in{width:min(100% - 20px,1140px);flex-wrap:nowrap;gap:6px;padding:8px 0;min-height:56px} #ilbj .ilbn-brand span{display:none} #ilbj .ilbn-links{order:0;flex:1 1 auto;width:auto;min-width:0;margin:0 0 0 auto;padding-top:0;border-top:0;overflow-x:auto;overflow-y:hidden;flex-wrap:nowrap;gap:2px} #ilbj .ilbn-links a{flex:0 0 auto;display:inline-flex;align-items:center;min-height:36px;padding:7px 8px;white-space:nowrap;text-align:left} #ilbj .ilbn-cta{margin-left:0;padding:0 11px;min-height:36px} #ilbj .ilb-article h2,#ilbj .ilb-article h3{scroll-margin-top:120px}'],
  // 6. Móvil pequeño: todo cabe con tipografía mínima legible.
  ['@media (max-width:420px){ #ilbj .ilbn-links{gap:3px} #ilbj .ilbn-links a{font-size:12.5px;padding:8px 6px}',
   '@media (max-width:420px){ #ilbj .ilbn-links{gap:0} #ilbj .ilbn-links a{font-size:11.5px;padding:7px 5px} #ilbj .ilbn-brand img{width:30px;height:30px} #ilbj .ilbn-cta{padding:0 9px;font-size:11.5px}'],
];

const U = 'https://{{custom_values.website_url}}';
const NAV_SCHEMA = [
  '<!-- ILATEK:NAV-SCHEMA:START -->',
  '<script type="application/ld+json">' + JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': U + '/blog#nav',
    name: 'Menú del blog de Ilatek',
    numberOfItems: 4,
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    itemListElement: [
      ['Blog', '/blog'],
      ['Comparativas', '/blog/comparativas'],
      ['Preguntas frecuentes', '/blog/preguntas-frecuentes'],
      ['Comunidades y servicios', '/blog/comunidades-y-servicios'],
    ].map(([n, p], i) => ({ '@type': 'ListItem', position: i + 1, item: { '@type': 'SiteNavigationElement', name: n, url: U + p } })),
  }) + '</script>',
  '<!-- ILATEK:NAV-SCHEMA:END -->',
].join('\n');

const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) files.push(p);
  }
})(BLOG);
files.push(path.join(HERE, 'render.mjs'));

let withNav = 0, touched = 0, skipped = 0, schemas = 0;
const miss = RULES.map(() => 0);
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  if (!src.includes('#ilbj .ilbn-in{')) continue;
  withNav++;
  if (src.includes('ILATEK:NAV-ONE-LINE')) { skipped++; continue; }
  let s = src;
  RULES.forEach(([from, to], i) => {
    if (s.includes(from)) s = s.split(from).join(to);
    else miss[i]++;
  });
  if (!s.includes('ILATEK:NAV-SCHEMA') && f.endsWith('.html')) {
    const next = s.replace(/<\/div>\s*$/, (m) => '\n' + NAV_SCHEMA + '\n' + m.trim() + '\n');
    if (next !== s) { s = next; schemas++; }
  }
  s = s.split('"dateModified":"2026-11-04"').join('"dateModified":"' + FECHA + '"');
  if (s !== src) { fs.writeFileSync(f, s); touched++; }
}

// Sitemap: misma fecha para las 118 URLs.
const SM = path.join(BLOG, 'sitemap-blog.xml');
let sm = fs.readFileSync(SM, 'utf8');
const smBefore = sm;
sm = sm.replace(/<lastmod>[\d-]+<\/lastmod>/g, '<lastmod>' + FECHA + '</lastmod>');
if (sm !== smBefore) fs.writeFileSync(SM, sm);

console.log('archivos con menú:', withNav);
console.log('normalizados:', touched, '| ya normalizados:', skipped, '| schemas añadidos:', schemas);
RULES.forEach((r, i) => { if (miss[i]) console.log('  aviso: regla ' + (i + 1) + ' sin coincidencia en ' + miss[i] + ' archivos'); });
console.log('sitemap lastmod actualizado:', (sm.match(/<lastmod>2026-11-09<\/lastmod>/g) || []).length, 'de', (sm.match(/<loc>/g) || []).length);
