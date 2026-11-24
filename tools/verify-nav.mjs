/**
 * Guardián del menú del website. Falla (exit 1) si una página deja de llevar el
 * menú canónico, si aparece una segunda copia, si vuelve un toggle escrito a
 * mano por página o si reaparece Google Translate.
 *
 * El menú y el pie son únicos: se escriben en componentes/ghl-nav-embed.html y
 * ghl-footer-embed.html, y tools/apply-page-shell.mjs los lleva a todas las
 * páginas que se publican. El ES/EN se calcula en el navegador desde la URL.
 *
 *   node tools/verify-nav.mjs
 */
import fs from 'node:fs';
import crypto from 'node:crypto';
import { ROOT } from './site-paths.mjs';
import { shellFiles } from './page-shell.mjs';

const md5 = s => crypto.createHash('md5').update(s).digest('hex').slice(0, 8);
const navUnit = html => {
  const start = html.search(/<section\b[^>]*\bid=["']ilatek-nav["']/i);
  if (start < 0) return '';
  const end = html.indexOf('</section>', start) + 10;
  const m = /^\s*<script\b[^>]*>[\s\S]*?<\/script>/.exec(html.slice(end));
  return html.slice(start, end + (m ? m[0].length : 0));
};
const footUnit = html => {
  const start = html.indexOf('<footer id="ilatek-footer"');
  if (start < 0) return '';
  return html.slice(start, html.indexOf('</footer>', start) + 9);
};

const navCanon = navUnit(fs.readFileSync(ROOT + '/componentes/ghl-nav-embed.html', 'utf8'));
const footCanon = footUnit(fs.readFileSync(ROOT + '/ghl-footer-embed.html', 'utf8'));
const navH = md5(navCanon), footH = md5(footCanon);

// Tres shells con su unidad canónica propia: ES, EN (pie traducido) y home (menú
// nuevo publicado, sin blog ni toggle). Cada página debe coincidir exactamente con
// la unidad de su shell; dentro de cada shell no puede haber variantes.
const readUnit = (file, extract) => extract(fs.readFileSync(ROOT + file, 'utf8'));
const shells = {
  es: { nav: navCanon, footer: footCanon },
  en: { nav: navCanon, footer: readUnit('/componentes/ghl-footer-embed.en.html', footUnit) },
  home: { nav: readUnit('/componentes/ghl-nav-embed.home.html', navUnit), footer: readUnit('/componentes/ghl-footer-embed.home.html', footUnit) },
};
const HOME_SHELL = 'home/es/landing-pages/home.html';
const shellOf = (rel) => (rel === HOME_SHELL ? 'home' : /(^|\/)en\//.test(rel) ? 'en' : 'es');
const variantes = { es: { nav: new Set(), foot: new Set() }, en: { nav: new Set(), foot: new Set() }, home: { nav: new Set(), foot: new Set() } };

// Rutas que existen: las páginas publicadas (ES + EN) con la convención del sitio.
const rutas = new Set(['/', '/en/home', '/politica', '/en/politica', '/terminos', '/en/terminos',
  '/resenas', '/en/resenas', '/garantia', '/en/garantia', '/comunidades', '/en/communities',
  '/cotizacion', '/cotizacion-techos', '/blog', '/en/blog', '/servicios', '/en/servicios', '/techos', '/en/techos']);

const fallos = [];
const navs = new Map(), foots = new Map();
for (const file of shellFiles) {
  const html = fs.readFileSync(ROOT + '/' + file, 'utf8');
  const nav = navUnit(html), foot = footUnit(html);
  navs.set(md5(nav), (navs.get(md5(nav)) || 0) + 1);
  foots.set(md5(foot), (foots.get(md5(foot)) || 0) + 1);

  if ((html.match(/id="ilatek-nav"/g) || []).length !== 1) fallos.push(`${file}: menú ${(html.match(/id="ilatek-nav"/g) || []).length} (debe ser 1)`);
  if ((html.match(/id="ilatek-footer"/g) || []).length !== 1) fallos.push(`${file}: pie ${(html.match(/id="ilatek-footer"/g) || []).length} (debe ser 1)`);
  const shell = shellOf(file);
  const expectNav = md5(shells[shell].nav), expectFoot = md5(shells[shell].footer);
  variantes[shell].nav.add(md5(nav));
  variantes[shell].foot.add(md5(foot));
  if (md5(nav) !== expectNav) fallos.push(`${file}: menú ${md5(nav)} ≠ canónico ${expectNav} (${shell})`);
  if (md5(foot) !== expectFoot) fallos.push(`${file}: pie ${md5(foot)} ≠ canónico ${expectFoot} (${shell})`);

  if (/id="iln-lang"/.test(html)) fallos.push(`${file}: botón de idioma antiguo`);
  if (/data-ilatek-lang="toggle"/.test(html)) fallos.push(`${file}: toggle escrito por página`);
  if (shell === 'home') {
    // Menú publicado del home: sin toggle ES/EN y sin enlace al blog.
    if ((nav.match(/data-ilatek-lang-link/g) || []).length) fallos.push(`${file}: toggle de idioma en el menú del home`);
    if (/data-ilatek-path="\/blog"/.test(html)) fallos.push(`${file}: enlace al blog en el home`);
    if (/function langPath\(/.test(nav)) fallos.push(`${file}: el menú del home no debe resolver /en`);
  } else {
    // Dos enlaces reales (ES/EN) y su resolución por URL.
    if (!/data-ilatek-lang-link="es"/.test(nav)) fallos.push(`${file}: falta el enlace ES`);
    if (!/data-ilatek-lang-link="en"/.test(nav)) fallos.push(`${file}: falta el enlace EN`);
    if (!/function langPath\(/.test(nav)) fallos.push(`${file}: el menú no calcula /en desde la URL`);
  }

  // Sin Google Translate en ningún sitio.
  if (/gtInject|googleTranslateElementInit|translate_a\/element\.js/.test(html)) fallos.push(`${file}: Google Translate`);
  // Un solo runtime de enlaces y enlaces balanceados.
  const runtimeEsperado = 1;
  if ((html.match(/ILATEK:INTERNAL-LINKS:START/g) || []).length !== runtimeEsperado) fallos.push(`${file}: runtime de URLs ≠ ${runtimeEsperado}`);
  if ((html.match(/<a[\s>]/g) || []).length !== (html.match(/<\/a>/g) || []).length) fallos.push(`${file}: <a> desbalanceados`);

  // Un enlace al blog por cada bloque que lo lleve (menú/pie), ni uno más.
  const blog = (html.match(/data-ilatek-path="\/blog"/g) || []).length;
  const blogEsperado = shell === 'home' ? 0 : (navCanon.match(/data-ilatek-path="\/blog"/g) || []).length +
    (footCanon.match(/data-ilatek-path="\/blog"/g) || []).length;
  if (blog !== blogEsperado) fallos.push(`${file}: enlaces al blog = ${blog} (debe ser ${blogEsperado})`);
}
for (const shell of Object.keys(variantes)) {
  if (variantes[shell].nav.size > 1) fallos.push(`variantes de menú en ${shell}: ${variantes[shell].nav.size} (${[...variantes[shell].nav].join(', ')})`);
  if (variantes[shell].foot.size > 1) fallos.push(`variantes de pie en ${shell}: ${variantes[shell].foot.size} (${[...variantes[shell].foot].join(', ')})`);
}

console.log(`páginas publicadas: ${shellFiles.length}`);
console.log(`menú canónico ${navH} · pie canónico ${footH}`);
console.log(`variantes de menú: ${navs.size} · variantes de pie: ${foots.size}`);
console.log(`fallos: ${fallos.length}`);
if (fallos.length) console.log('  ' + fallos.join('\n  '));
process.exit(fallos.length ? 1 : 0);
