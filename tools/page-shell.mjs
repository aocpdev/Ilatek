// Compose existing content with shared navigation/footer; never regenerate page copy.
import fs from 'node:fs';
import { ROOT, structure } from './site-paths.mjs';
import { formatPage, publicPath } from './internal-link-contract.mjs';
import { hasServiceHero } from './responsive-contract.mjs';

// EN pages carry the same menu as ES: the toggle and every link resolve from
// the URL at runtime, so there is nothing per-language to configure.
function enPages() {
  const out = [];
  for (const dir of ['home', 'resenas', 'politica-de-privacidad', 'terminos-y-condiciones', 'categorias', 'servicios']) {
    const base = ROOT + '/' + dir;
    if (!fs.existsSync(base)) continue;
    const walk = d => {
      for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        const p = d + '/' + e.name;
        if (e.isDirectory()) walk(p);
        else if (e.name.endsWith('.html') && /\/en\/landing-pages\//.test(p.split(ROOT + '/').pop())) out.push(p.split(ROOT + '/').pop());
      }
    };
    walk(base);
  }
  return out;
}
// Every file that gets pasted into GHL (1-PAGINA.txt → "Origen en el repo")
// must carry the same shell, even when it is a variant that is not listed in
// docs/estructura.json.
function publishedSources() {
  const dir = ROOT + '/GHL-PUBLICAR/lote-sitio/por-pagina';
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const txt = dir + '/' + e.name + '/1-PAGINA.txt';
    if (!fs.existsSync(txt)) continue;
    const m = /Origen en el repo:\s*(\S+)/.exec(fs.readFileSync(txt, 'utf8'));
    const file = m && m[1].replace(/\\/g, '/');
    if (file && fs.existsSync(ROOT + '/' + file) && !out.includes(file)) out.push(file);
  }
  return out;
}
export const shellFiles = [...new Set([...structure.pages.map(p => p.file),
  'resenas/ghl-resenas-landing.html',
  'politica-de-privacidad/ghl-politica-embed.html',
  'terminos-y-condiciones/ghl-terminos-embed.html',
  'ghl-custom-code-embedded.html', 'ghl-custom-code-paste.html',
  ...enPages(), ...publishedSources()])];

export function shellPath(file) {
  const parts = file.split('/');
  const i = parts.indexOf('en');
  if (i < 1 || parts[i + 1] !== 'landing-pages') return publicPath(file);
  if (parts[0] === 'politica-de-privacidad') return '/en/politica';
  if (parts[0] === 'terminos-y-condiciones') return '/en/terminos';
  return '/en/' + parts[i - 1];
}
const runtimeRE = /<!-- ILATEK:INTERNAL-LINKS:START -->[\s\S]*?<!-- ILATEK:INTERNAL-LINKS:END -->\s*/g;
const shellRE = /<!-- ILATEK:SHELL:(HEADER|FOOTER):START -->[\s\S]*?<!-- ILATEK:SHELL:\1:END -->\s*/g;
const fragment = file => fs.readFileSync(ROOT+'/'+file,'utf8').replace(runtimeRE,'').replace(/<meta\s+charset=[^>]+>\s*/gi,'').trim();
const block = (name, html) => `<!-- ILATEK:SHELL:${name}:START -->\n${html}\n<!-- ILATEK:SHELL:${name}:END -->\n`;
// El componente del menú trae, antes de la sección, el puente de valores de GHL
// (dv-ghl-values). Ese puente y el menú se insertan por separado para que el
// puente no acabe duplicado en páginas que ya lo llevan en su propio código.
const navFragment = fragment('componentes/ghl-nav-embed.html');
const navAt = navFragment.search(/<section\b[^>]*\bid=["']ilatek-nav["']/i);
const navPrelude = navAt > 0 ? navFragment.slice(0, navAt) : '';
const navMarkup = navAt > 0 ? navFragment.slice(navAt) : navFragment;
const footFragment = fragment('ghl-footer-embed.html');
const footAt = footFragment.search(/<footer\b[^>]*\bid=["']ilatek-footer["']/i);
const footMarkup = footAt > 0 ? footFragment.slice(footAt) : footFragment;

// Remove one element by tag+id, depth-aware, so an old copy of the shared
// nav/footer (pages built before the shell had markers) cannot survive.
function stripElement(html, tag, id) {
  const openRE = new RegExp('<' + tag + '\\b[^>]*\\bid=["\']' + id + '["\']', 'i');
  for (let guard = 0; guard < 20; guard++) {
    const m = openRE.exec(html);
    if (!m) return html;
    const start = m.index;
    const tokenRE = new RegExp('<' + tag + '\\b|</' + tag + '\\s*>', 'gi');
    tokenRE.lastIndex = start;
    let depth = 0, end = -1, t;
    while ((t = tokenRE.exec(html))) {
      depth += t[0].charAt(1) === '/' ? -1 : 1;
      if (depth === 0) { end = t.index + t[0].length; break; }
    }
    if (end < 0) return html;
    html = html.slice(0, start) + html.slice(end);
  }
  return html;
}

// The menu is the section plus the script that sits right after </section>;
// old copies (built before the shell had markers) kept the script, so removing
// only the element would leave a second menu script behind.
function stripNav(html) {
  for (let guard = 0; guard < 20; guard++) {
    const start = html.search(/<section\b[^>]*\bid=["']ilatek-nav["']/i);
    if (start < 0) return html;
    const tokenRE = /<section\b|<\/section\s*>/gi;
    tokenRE.lastIndex = start;
    let depth = 0, end = -1, t;
    while ((t = tokenRE.exec(html))) {
      depth += t[0].charAt(1) === '/' ? -1 : 1;
      if (depth === 0) { end = t.index + t[0].length; break; }
    }
    if (end < 0) return html;
    const script = /^\s*<script\b[^>]*>([\s\S]*?)<\/script>/i.exec(html.slice(end));
    if (script && /iln-|ILATEK_LINKS|ilatek-lang/.test(script[1])) end += script[0].length;
    html = html.slice(0, start) + html.slice(end);
  }
  return html;
}

export function composeShell(source, pagePath = '/home') {
  // El bloque de runtime NO se elimina aquí: formatPage ya lo quita y lo
  // reinyecta. Si se quitara antes, un <meta charset> que viva justo detrás del
  // bloque quedaría al principio del documento y formatPage lo movería delante
  // del runtime, rompiendo la idempotencia (y el charset de las landings GHL).
  let html = source.replace(shellRE,'');
  // El menú y el pie son autoritativos: se retira cualquier copia previa (con o
  // sin marcadores) y se reinserta el canónico. Así ninguna página conserva la
  // versión del día en que se construyó.
  html = stripNav(html);
  html = stripElement(html, 'footer', 'ilatek-footer');
  if (navPrelude.trim()) html = html.split(navPrelude).join('');
  if (footMarkup !== footFragment) html = html.split(footFragment.slice(0, footAt)).join('');
  // Service heroes reserve the fixed bar through the shared responsive CSS.
  // Other layouts (legal/reviews/quote) retain their existing flow spacer.
  const header = block('HEADER', navPrelude + navMarkup +
    (hasServiceHero(html)?'':'\n<div data-ilatek-header-space aria-hidden="true" style="height:92px;flex:none"></div>'));
  if (/<body\b[^>]*>/i.test(html)) html=html.replace(/<body\b[^>]*>/i,m=>m+'\n'+header);
  else {
    const start=html.search(/<(?:section|main)\b/i);
    if(start<0) throw new Error('Page has no content root: '+pagePath);
    html=html.slice(0,start)+header+html.slice(start);
  }
  const footer=block('FOOTER',footMarkup);
  html=/<\/body>/i.test(html) ? html.replace(/<\/body>/i,footer+'</body>') : html.trimEnd()+'\n'+footer;
  return formatPage(html,pagePath);
}

export function syncShells() {
  let changed=0;
  for(const file of shellFiles) {
    const before=fs.readFileSync(ROOT+'/'+file,'utf8');
    const after=composeShell(before,shellPath(file));
    if(before!==after){fs.writeFileSync(ROOT+'/'+file,after);changed++;}
  }
  return changed;
}
