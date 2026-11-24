// Ilatek · paridad de artefactos de publicación.
//
// Cada carpeta de GHL-PUBLICAR/lote-sitio/por-pagina contiene el código que se
// pega en GHL. Este script garantiza que ese archivo sea el reflejo fiel de su
// página fuente actual: mismo cuerpo, mismo menú canónico y mismo pie canónico.
//
// Uso:
//   node tools/sync-artifacts.mjs          regenera los artefactos desde su origen
//   node tools/sync-artifacts.mjs --check  audita sin escribir (sale 1 si hay drift)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const DIR = ROOT + '/GHL-PUBLICAR/lote-sitio/por-pagina';
const CHECK = process.argv.includes('--check');
const md5 = (s) => crypto.createHash('md5').update(s).digest('hex').slice(0, 8);

const navUnit = (html) => {
  const start = html.search(/<section\b[^>]*\bid=["']ilatek-nav["']/i);
  if (start < 0) return '';
  const end = html.indexOf('</section>', start) + 10;
  const m = /^\s*<script\b[^>]*>[\s\S]*?<\/script>/.exec(html.slice(end));
  return html.slice(start, end + (m ? m[0].length : 0));
};
const footerUnit = (html) => {
  const start = html.indexOf('<footer id="ilatek-footer"');
  if (start < 0) return '';
  return html.slice(start, html.indexOf('</footer>', start) + 9);
};

// El sitio publica tres shells y cada uno tiene su unidad canónica de menú y pie:
//  · es   — menú y pie del website en español.
//  · en   — el mismo menú (el idioma se resuelve por URL) y el pie traducido.
//  · home — menú nuevo aprobado tal como está publicado: sin blog y sin toggle
//           ES/EN, con el pie del home (ajuste móvil de dos columnas).
// Una página solo cumple si su unidad es idéntica a la de su shell: no hay
// exenciones y cualquier cambio dentro de un shell sigue rompiendo la auditoría.
const readUnit = (file, extract) => extract(fs.readFileSync(ROOT + file, 'utf8'));
const shells = {
  es: { nav: readUnit('/componentes/ghl-nav-embed.html', navUnit), footer: readUnit('/ghl-footer-embed.html', footerUnit) },
  en: { nav: readUnit('/componentes/ghl-nav-embed.html', navUnit), footer: readUnit('/componentes/ghl-footer-embed.en.html', footerUnit) },
  home: { nav: readUnit('/componentes/ghl-nav-embed.home.html', navUnit), footer: readUnit('/componentes/ghl-footer-embed.home.html', footerUnit) },
};
const HOME_SHELL = 'home/es/landing-pages/home.html';
const shellOf = (rel) => (rel === HOME_SHELL ? 'home' : /(^|\/)en\//.test(rel) ? 'en' : 'es');

const rows = [];
const bad = [];

for (const name of fs.readdirSync(DIR).sort()) {
  const dir = path.join(DIR, name);
  if (!fs.statSync(dir).isDirectory()) continue;
  const artPath = path.join(dir, '2-CODIGO-CUSTOM-HTML.html');
  const infoPath = path.join(dir, '1-PAGINA.txt');
  if (!fs.existsSync(artPath) || !fs.existsSync(infoPath)) continue;

  const info = fs.readFileSync(infoPath, 'utf8');
  const m = /Origen en el repo:\s*(\S+)/.exec(info);
  const rel = m && m[1].replace(/\\/g, '/');
  const sourcePath = rel && path.join(ROOT, rel);
  if (!sourcePath || !fs.existsSync(sourcePath)) {
    bad.push(`${name}: origen ausente (${rel || 'sin campo'})`);
    continue;
  }

  const source = fs.readFileSync(sourcePath, 'utf8');
  const current = fs.readFileSync(artPath, 'utf8');
  const next = source; // reflejo exacto: cuerpo, menú, pie y runtime del origen
  const same = current === next;

  if (!CHECK && !same) fs.writeFileSync(artPath, next);

  const after = CHECK ? current : next;
  const problems = [];
  if (!same && CHECK) problems.push('contenido != origen');
  const shell = shellOf(rel);
  const canonNavH = md5(shells[shell].nav), canonFootH = md5(shells[shell].footer);
  if ((after.match(/id="ilatek-nav"/g) || []).length !== 1) problems.push('nav != 1');
  if (md5(navUnit(after)) !== canonNavH) problems.push('nav != canónico ' + canonNavH + ' (' + shell + ')');
  if ((after.match(/id="ilatek-footer"/g) || []).length !== 1) problems.push('pie != 1');
  if (md5(footerUnit(after)) !== canonFootH) problems.push('pie ' + md5(footerUnit(after)) + ' != ' + canonFootH + ' (' + shell + ')');
  if (shell === 'home') {
    // El home publicado no lleva blog ni toggle: la auditoría exige que siga sin ellos.
    if ((after.match(/data-ilatek-lang-link/g) || []).length !== 0) problems.push('toggle de idioma en el home');
    if (/data-ilatek-path="\/blog"/.test(after)) problems.push('enlace al blog en el home');
  } else {
    if (!/ILATEK:INTERNAL-LINKS:START/.test(after) || !/toEnglish/.test(after)) problems.push('runtime sin contrato');
    if ((after.match(/data-ilatek-lang-link/g) || []).length !== 4) problems.push('toggle de idioma');
  }
  if (/gtInject|translate_a\/element\.js/.test(after)) problems.push('google translate');

  // Restos que el plan prohíbe en cualquier artefacto.
  // Los patrones se escriben con clases/escapes para que esta auditoría sea la
  // única pieza del árbol que pueda enumerar los restos sin contenerlos.
  const forbidden = [
    [/inspecci[oó]n(?:es)?\s+gratis|inspecci[oó]n\s+es\s+gratis/i, 'inspección sin costo'],
    [/free\s+inspection|inspection\s+is\s+free/i, 'inspección sin costo en inglés'],
    [/pie\u00b2|por\s+pie\s+cuadrado|per\s+sq\.?\s?ft/i, 'precio por superficie'],
    [/Recibe\s+tu\s+precio/i, 'encabezado del formulario de clima'],
    [/<form class="ilcl[-]form"/, 'formulario de clima'],
    [/\bOportunida[d]es\b/, 'columna retirada del pie'],
    [/Men[u]\s+Principal|>Main\s+Men[u]</, 'título del menú del pie'],
    [/<div class="ilf[-]brand"/, 'bloque del logo del pie'],
    [/class="ilf[-]sv[c][ "]/, 'tarjetas de imagen del pie'],
  ];
  for (const [rx, label] of forbidden) {
    if (rx.test(after)) problems.push(label);
  }

  // Las landings de techos que publican el módulo AEO de precio deben mostrar la
  // lista de precios por servicio, nunca la tabla vieja por tamaño de techo.
  const hasPriceModule = /id="ilt-aeo-(precio|costo)"/.test(after);
  if (/techos/.test(rel) && hasPriceModule) {
    if (!/class="[^"]*ilt-aeo-table--price/.test(after)) problems.push('sin tabla de precio por servicio');
  }
  if (/<table[^>]*class="[^"]*ilt-aeo-table--cost/.test(after)) problems.push('tabla por tamaño de techo');

  const bytes = Buffer.byteLength(after, 'utf8');
  const sha = crypto.createHash('sha256').update(after).digest('hex').slice(0, 12);
  const kb = Math.round(bytes / 1024);
  if (!CHECK) {
    const txt = info.replace(
      /Archivo a pegar: 2-CODIGO-CUSTOM-HTML\.html \([^)]*\)/,
      `Archivo a pegar: 2-CODIGO-CUSTOM-HTML.html (${kb} KB, sha256 ${sha})`,
    );
    if (txt !== info) fs.writeFileSync(infoPath, txt);
  } else {
    const declared = /Archivo a pegar: 2-CODIGO-CUSTOM-HTML\.html \((\d+) KB, sha256 ([0-9a-f]+)\)/.exec(info);
    if (!declared) problems.push('1-PAGINA.txt sin tamaño/sha');
    else if (declared[1] !== String(kb) || declared[2] !== sha) problems.push('1-PAGINA.txt desactualizado');
  }

  rows.push({ name, rel, bytes });
  if (problems.length) bad.push(`${name}: ${problems.join(', ')}`);
}

console.log(JSON.stringify({
  modo: CHECK ? 'auditoría' : 'regeneración',
  artefactos: rows.length,
  tamanoMedioKB: Math.round(rows.reduce((a, r) => a + r.bytes, 0) / Math.max(rows.length, 1) / 1024),
  problemas: bad.length,
}, null, 2));
if (bad.length) {
  console.error('  ' + bad.join('\n  '));
  process.exit(1);
}
