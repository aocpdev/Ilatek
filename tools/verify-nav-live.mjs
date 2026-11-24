/**
 * Verificación en vivo del menú: mide el sitio SERVIDO, no los archivos.
 *
 *   node tools/verify-nav-live.mjs                     # sitemap.xml contra https://ilatekpr.com
 *   node tools/verify-nav-live.mjs --base http://127.0.0.1:8099
 *   node tools/verify-nav-live.mjs --paths             # rutas desde los archivos del repo
 *   node tools/verify-nav-live.mjs --sitemap otro.xml  # otro listado de rutas
 *   node tools/verify-nav-live.mjs --movil             # añade 390x844 a cada ruta
 *   node tools/verify-nav-live.mjs /ruta /otra.html
 *
 * Fuente de rutas por defecto: las <loc> de `sitemap.xml` (el que genera
 * tools/build-sitemap.mjs). Así el verificador cubre exactamente lo que se
 * anuncia en el sitemap, incluidas las rutas que todavía no están publicadas.
 *
 * Por ruta publicada (1440x900, y 390x844 con --movil):
 *   - #iln-links con scrollWidth === clientWidth (nada recortado)
 *   - .iln-shell sin desbordar
 *   - ningún hijo de #iln-links con borde derecho más allá del de la fila
 *   - todos los ítems con caja propia y visibles (en móvil, dentro del panel
 *     abierto por su trigger real .iln-burger)
 *   - exactamente 1 toggle de idioma, clicable (elementFromPoint) y con el
 *     prefijo correcto (/en/ en ES, sin prefijo en EN)
 *   - exactamente 1 enlace /blog
 *   - el destino del toggle responde (no 404, no 5xx)
 *
 * Clasificación del veredicto:
 *   - FALLOS DE ESTRUCTURA: lo que el repo puede arreglar (recorte, toggle
 *     duplicado o ausente, enlace /blog de más o de menos, overflow…).
 *   - PENDIENTES DE PUBLICAR: rutas (y destinos de toggle) que devuelven 404
 *     de verdad porque aún no existen en GHL. No son fallos de estructura.
 * Sale con 1 si hay cualquiera de los dos; con 0 solo si no hay ninguno.
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { structure } from './site-paths.mjs';

const args = process.argv.slice(2);
let base = 'https://ilatekpr.com';
let archivoSitemap = 'sitemap.xml';
let desdeArchivos = false;
let conMovil = false;
const rutas = [];
let archivoUrls = null;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--base') { base = args[++i].replace(/\/$/, ''); continue; }
  if (args[i] === '--urls') { archivoUrls = args[++i]; continue; }
  if (args[i] === '--sitemap') { archivoSitemap = args[++i]; continue; }
  if (args[i] === '--paths') { desdeArchivos = true; continue; }
  if (args[i] === '--movil') { conMovil = true; continue; }
  rutas.push(args[i]);
}
if (archivoUrls) {
  for (const l of fs.readFileSync(archivoUrls, 'utf8').split('\n')) {
    const t = l.trim();
    if (t && !t.startsWith('#')) rutas.push(t);
  }
}

// Descubrimiento local (solo con --paths): páginas del repo que llevan toggle.
const EXCL = /node_modules|\.git|\.tmp(?:-|\/)|documentacion|tools|^blog$|GHL-PUBLICAR|componentes|home-page|backups-ghl/;
const descubiertas = [];
const walk = (d) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name).split(path.sep).join('/');
    if (e.isDirectory()) { if (EXCL.test(p)) continue; walk(p); continue; }
    if (!e.name.endsWith('.html')) continue;
    if (fs.readFileSync(p, 'utf8').includes('data-ilatek-lang="toggle"')) descubiertas.push(p);
  }
};
if (desdeArchivos) walk('.');

// Rutas del sitemap: son las que el sitio anuncia, publicadas o no.
const delSitemap = () => {
  if (!fs.existsSync(archivoSitemap)) throw new Error(`sin ${archivoSitemap}: corre node tools/build-sitemap.mjs`);
  const xml = fs.readFileSync(archivoSitemap, 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
};

const objetivos = rutas.length ? rutas : desdeArchivos ? descubiertas : delSitemap();
if (!objetivos.length) { console.error('sin rutas que verificar'); process.exit(2); }

const CHROME = [
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  process.env.CHROME_PATH,
].filter(Boolean);
const ejecutable = CHROME.find((p) => fs.existsSync(p));
if (!ejecutable) { console.error('no encuentro Chrome: define CHROME_PATH'); process.exit(2); }

const urlDe = (r) => (r.startsWith('http') ? r : base + (r.startsWith('/') ? r : '/' + r));
const rutaDe = (u) => u.replace(base, '') || '/';
const esIngles = (u) => /\/en(\/|$)/.test(u.replace(base, '')) || /\.en\.html$/.test(u);

const EXTRA_FILES = {
  garantia: 'garantia/ILATEK-Garantias.html',
  resenas: 'resenas/ghl-resenas-landing.html',
  comunidades: 'comunidades/landing-pages/comunidades.html',
  servicios: 'categorias/limpieza/es/landing-pages/ghl-servicios-landing.html',
  'servicios-techos': 'categorias/techos/es/landing-pages/servicios-techos.html',
};
const archivoDeRuta = (ruta) => {
  if (ruta === '/') return 'home/es/landing-pages/home.html';
  const slug = ruta.replace(/^\//, '');
  const p = structure.pages.find((x) => x.slug === slug);
  if (p && p.file) return p.file;
  return EXTRA_FILES[slug] || null;
};
const repoTieneNav = (ruta) => repoYaCumple(ruta, (t) => /id="iln-links"/.test(t));
const repoYaCumple = (ruta, prueba) => {
  const f = archivoDeRuta(ruta);
  if (!f || !fs.existsSync(f)) return false;
  return prueba(fs.readFileSync(f, 'utf8'));
};

const estadoHttp = async (url) => {
  try {
    const r = await fetch(url, { redirect: 'follow', headers: { 'user-agent': 'ilatek-verify-nav/1.0' } });
    return r.status;
  } catch { return 0; }
};

const medirEscritorio = (pg) => pg.evaluate(() => {
  const nav = document.querySelector('#iln-links');
  const shell = document.querySelector('.iln-shell');
  if (!nav) return { existe: false, motivo: 'sin #iln-links' };
  const r = nav.getBoundingClientRect();
  const hijos = [...nav.children].map((e) => {
    const b = e.getBoundingClientRect(); const cs = getComputedStyle(e);
    return {
      t: (e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 14),
      w: Math.round(b.width), h: Math.round(b.height),
      desborda: b.right > r.right + 0.5,
      visible: b.width > 0 && b.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden' && parseFloat(cs.opacity) > 0.05,
    };
  });
  const t = document.querySelector('.iln-shell [data-ilatek-lang="toggle"], .iln-shell a.iln-lang, .iln-shell button.iln-lang, #iln-lang');
  let clicable = null;
  if (t) {
    const b = t.getBoundingClientRect();
    const hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
    clicable = !!hit && (hit === t || t.contains(hit));
  }
  return {
    existe: true,
    navScroll: nav.scrollWidth, navClient: nav.clientWidth,
    shellScroll: shell ? shell.scrollWidth : -1, shellClient: shell ? shell.clientWidth : -1,
    hijos,
    toggles: document.querySelectorAll('[data-ilatek-lang="toggle"], .iln-shell a.iln-lang, .iln-shell button.iln-lang, #iln-lang').length,
    blogs: document.querySelectorAll('[data-ilatek-path="/blog"]').length,
    marcaNueva: !!document.querySelector('[data-ilatek-lang="toggle"]'),
    hijosTotal: nav.children.length,
    clicable,
    destino: t ? (t.getAttribute('data-ilatek-path') || t.getAttribute('href') || '') : '',
    destinoTipo: t ? t.tagName.toLowerCase() : null,
    etiquetaToggle: t ? (t.getAttribute('aria-label') || t.getAttribute('title') || '') : '',
    cambioIdioma: (() => {
      if (!t || t.tagName === 'A') return null;
      const antes = document.documentElement.lang;
      t.click();
      const despues = document.documentElement.lang;
      if (antes !== despues) t.click();
      return antes !== despues;
    })(),
  };
});

const medirMovil = async (pg) => {
  const burger = pg.locator('.iln-burger').first();
  const visible = await burger.isVisible().catch(() => false);
  const caja = visible ? await burger.boundingBox() : null;
  if (!visible || !caja || caja.width < 40 || caja.height < 40) return { existe: false, motivo: 'trigger .iln-burger sin caja visible' };
  await burger.click({ timeout: 15000 });
  await pg.waitForFunction(() => {
    const n = document.querySelector('#ilatek-nav');
    const d = document.querySelector('#iln-drawer');
    return n && /iln-open/.test(n.className) && d && d.getBoundingClientRect().height > 100;
  }, null, { timeout: 15000 }).catch(() => {});
  return pg.evaluate(() => {
    const nav = document.querySelector('#iln-links');
    const shell = document.querySelector('.iln-shell');
    const drawer = document.querySelector('#iln-drawer');
    if (!drawer) return { existe: false, motivo: 'sin #iln-drawer' };
    const norm = (s) => (s || '').replace(/\s+/g, ' ').trim().toLowerCase();
    const enlaces = [...drawer.querySelectorAll('a')].filter((a) => a.getBoundingClientRect().height > 20);
    const hijos = enlaces.map((e) => {
      const b = e.getBoundingClientRect();
      return {
        t: norm(e.textContent).slice(0, 14), w: Math.round(b.width), h: Math.round(b.height),
        desborda: b.right > drawer.getBoundingClientRect().right + 0.5,
        visible: b.width > 0 && b.height > 0 && b.bottom > 0,
      };
    });
    const nombres = nav ? [...nav.children].map((e) => norm(e.textContent)).filter(Boolean) : [];
    const primerNivel = nombres.filter((n) => enlaces.some((a) => norm(a.textContent) === n || norm(a.textContent).startsWith(n))).length;
    const t = document.querySelector('[data-ilatek-lang="toggle"]');
    let clicable = null;
    if (t) {
      const b = t.getBoundingClientRect();
      const hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
      clicable = !!hit && (hit === t || t.contains(hit));
    }
    return {
      existe: true, panelAbierto: /iln-open/.test(document.querySelector('#ilatek-nav').className),
      navScroll: drawer.scrollWidth, navClient: drawer.clientWidth,
      shellScroll: shell ? shell.scrollWidth : -1, shellClient: shell ? shell.clientWidth : -1,
      hijos, primerNivel, primerNivelTotal: nombres.length,
      toggles: document.querySelectorAll('[data-ilatek-lang="toggle"], .iln-shell a.iln-lang, .iln-shell button.iln-lang, #iln-lang').length,
      blogs: document.querySelectorAll('[data-ilatek-path="/blog"]').length,
      marcaNueva: !!document.querySelector('[data-ilatek-lang="toggle"]'),
      clicable, destino: t ? (t.getAttribute('data-ilatek-path') || t.getAttribute('href') || '') : '',
    };
  });
};

const browser = await chromium.launch({ headless: true, executablePath: ejecutable });

const destinos = new Map();
const vistos = new Set();

// Mapa ruta publicada → archivo del repo, con la misma regla que verify-nav
// (ES → /<slug>, EN → /en/<slug>, home → / y /en/home). El inventario de
// site-paths.mjs no incluye las copias inglesas, así que se reconstruye aquí.
const canonicoArchivo = (slug) => {
  let x = slug.replace(/^ghl-/, '').replace(/-(embed|landing)$/, '');
  x = x.replace(/(?:-\d{3,}){1,2}$/, '');
  if (/^home(?:-|$)/.test(x)) x = 'home';
  return x;
};
const rutaDeArchivo = (archivo) => {
  const esIngles = /\/en\//.test(archivo);
  const base = (archivo.split('/').pop() || '').replace(/\.en\.html$/, '').replace(/\.html$/, '');
  const slug = canonicoArchivo(base);
  if (!slug || slug === 'home') return esIngles ? '/en/home' : '/';
  return esIngles ? `/en/${slug}` : `/${slug}`;
};
const mapaRepo = new Map();
let archivosRepo = 0;
const inventario = (d) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name).split(path.sep).join('/');
    if (e.isDirectory()) { if (EXCL.test(p)) continue; inventario(p); continue; }
    if (!e.name.endsWith('.html') || /HEAD-TEMPLATE/.test(e.name)) continue;
    if (!fs.readFileSync(p, 'utf8').includes('ILATEK:SHELL:FOOTER:START')) continue;
    archivosRepo++;
    const ruta = rutaDeArchivo(p);
    if (!mapaRepo.has(ruta)) mapaRepo.set(ruta, p);
  }
};
inventario('.');
const archivoRepo = (ruta) => mapaRepo.get(ruta) || archivoDeRuta(ruta);

// Estado del archivo del repo para la misma ruta: sirve para separar un defecto
// del HTML servido (estructura) de un despliegue viejo (el repo ya cumple).
const repoEstado = (ruta) => {
  const f = archivoRepo(ruta);
  if (!f || !fs.existsSync(f)) return { hay: false, nav: false, blog: -1, toggles: -1, ancla: false };
  const t = fs.readFileSync(f, 'utf8');
  return {
    hay: true,
    nav: /id="iln-links"/.test(t),
    blog: (t.match(/data-ilatek-path="\/blog"/g) || []).length,
    toggles: (t.match(/data-ilatek-lang="toggle"/g) || []).length,
    ancla: /<a class="iln-lang"[^>]*data-ilatek-path=/.test(t),
  };
};

const porRuta = new Map();
const ruta0 = (ruta) => {
  if (!porRuta.has(ruta)) porRuta.set(ruta, { ruta, http: null, medidas: null, defectos: [] });
  return porRuta.get(ruta);
};
const anota = (ruta, clase, texto) => ruta0(ruta).defectos.push({ clase, texto });

// Medición de una ruta en un viewport. Devuelve los defectos en vez de
// empujarlos a una lista global: así cada ruta se clasifica por sí misma.
const revisar = async (ruta, vp) => {
  const url = urlDe(ruta);
  const ing = esIngles(url);
  const clave = rutaDe(url);
  const repo = repoEstado(clave);
  const pg = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });
  let m;
  try {
    const resp = await pg.goto(url, { waitUntil: 'load', timeout: 45000 });
    if (!resp || !resp.ok()) { await pg.close(); return [`HTTP ${resp ? resp.status() : 'sin respuesta'} al cargar`]; }
    await pg.waitForTimeout(800);
    m = vp.n === 'escritorio' ? await medirEscritorio(pg) : await medirMovil(pg);
  } catch (e) {
    await pg.close();
    return [`no cargó (${String(e.message).split('\n')[0].slice(0, 70)})`];
  }
  if (!m.existe) { await pg.close(); return [m.motivo || 'sin medir']; }

  const et = `[${vp.n}]`;
  const r = ruta0(clave);
  r.medidas = r.medidas || {};
  r.medidas[vp.n] = {
    nav: `${m.navScroll}/${m.navClient}`, shell: `${m.shellScroll}/${m.shellClient}`,
    items: m.hijos.filter((h) => h.visible).length, blog: m.blogs, toggles: m.toggles,
  };

  // Layout: siempre defecto del HTML servido.
  if (vp.n === 'móvil' && !m.panelAbierto) anota(clave, 'estructura', `${et} el panel no abrió con .iln-burger`);
  if (m.navScroll !== m.navClient) anota(clave, 'estructura', `${et} #iln-links se recorta (${m.navScroll}/${m.navClient})`);
  if (m.shellScroll > m.shellClient + 1) anota(clave, 'estructura', `${et} .iln-shell se recorta (${m.shellScroll}/${m.shellClient})`);
  if (m.hijos.some((h) => h.desborda)) anota(clave, 'estructura', `${et} un ítem pasa el borde derecho de la fila`);
  const conCaja = m.hijos.filter((h) => h.visible && h.w > 0 && h.h > 0).length;
  const totalHijos = m.hijosTotal || m.hijos.length;
  if (conCaja < totalHijos) anota(clave, 'estructura', `${et} ${totalHijos - conCaja} ítem(s) sin caja visible de ${totalHijos}`);

  // Toggle: ausente, duplicado, no clicable, destino malo o que no responde.
  if (m.toggles !== 1) {
    anota(clave, repo.toggles === 1 || repo.ancla ? 'despliegue' : 'estructura',
      `${et} ${m.toggles} toggle(s) de idioma (debe ser 1)${repo.toggles === 1 ? ' — el repo ya lleva 1' : ''}`);
  } else if (m.clicable !== true) {
    anota(clave, 'estructura', `${et} toggle no clicable (elementFromPoint)`);
  }
  const destino = (m.destino || '').trim();
  if (m.toggles === 1 && !destino) {
    if (m.destinoTipo !== 'a') {
      const esBotonIdioma = m.clicable === true && /idioma|language/i.test(m.etiquetaToggle || '');
      if (esBotonIdioma) {
        anota(clave, repo.ancla ? 'despliegue' : 'estructura',
          `${et} toggle en formato botón JS sin URL${repo.ancla ? ' — el repo ya lleva el enlace con destino' : ''}`);
      } else if (m.cambioIdioma !== true) {
        anota(clave, 'estructura', `${et} el toggle (${m.destinoTipo}) no cambia el idioma al pulsarlo`);
      }
    } else {
      anota(clave, 'estructura', `${et} toggle sin href ni data-ilatek-path`);
    }
  } else if (m.toggles === 1) {
    if (ing && /\/en(\/|$)/.test(destino)) anota(clave, 'estructura', `${et} toggle EN apunta a ${destino}`);
    if (!ing && !/\/en(\/|$)/.test(destino)) anota(clave, 'estructura', `${et} toggle ES apunta a ${destino} (falta /en/)`);
    const absoluto = destino.startsWith('http') ? destino : base + destino;
    if (vp.n === 'escritorio') {
      if (base === 'https://ilatekpr.com') {
        // Contra producción: el destino tiene que responder 200.
        if (!destinos.has(absoluto)) destinos.set(absoluto, await estadoHttp(absoluto));
        const codigo = destinos.get(absoluto);
        if (codigo !== 200) anota(clave, 'estructura', `${et} el destino del toggle ${destino} responde HTTP ${codigo || 'sin respuesta'}`);
      } else {
        // Contra el servidor local: el destino tiene que existir como página del repo.
        const f = archivoRepo(destino);
        if (!f || !fs.existsSync(f)) anota(clave, 'estructura', `${et} el destino del toggle ${destino} no existe en el repo`);
      }
    }
  }

  // /blog: exactamente uno.
  if (m.blogs !== 1) {
    anota(clave, repo.blog === 1 ? 'despliegue' : 'estructura',
      `${et} ${m.blogs} enlace(s) /blog (debe ser 1)${repo.blog === 1 ? ' — el repo ya lleva 1' : ''}`);
  }

  await pg.close();
  return [];
};

const tarea = async (ruta) => {
  const url = urlDe(ruta);
  const clave = rutaDe(url);
  const estado = await estadoHttp(url);
  ruta0(clave).http = estado;
  if (estado === 404) return;
  if (estado !== 200) { anota(clave, 'estructura', `HTTP ${estado || 'sin respuesta'}`); return; }
  if (vistos.has(url)) return;
  vistos.add(url);
  const viewports = conMovil
    ? [{ n: 'escritorio', w: 1440, h: 900 }, { n: 'móvil', w: 390, h: 844 }]
    : [{ n: 'escritorio', w: 1440, h: 900 }];
  for (const vp of viewports) {
    for (const d of await revisar(ruta, vp)) anota(clave, 'estructura', `[${vp.n}] ${d}`);
  }
};

const CONC = 4;
let i = 0;
await Promise.all(Array.from({ length: CONC }, async () => {
  while (i < objetivos.length) { const r = objetivos[i++]; await tarea(r); }
}));
await browser.close();

// Clasificación final: una sola casilla por ruta.
const medidas = [...porRuta.values()];
for (const r of medidas) {
  if (r.http === 404) r.clase = 'no-publicada';
  else if (r.http !== 200) r.clase = 'estructura';
  else if (r.defectos.some((d) => d.clase === 'estructura')) r.clase = 'estructura';
  else if (r.defectos.length) r.clase = 'desactualizada';
  else r.clase = 'ok';
}
const grupos = {
  estructura: medidas.filter((r) => r.clase === 'estructura'),
  noPublicada: medidas.filter((r) => r.clase === 'no-publicada'),
  desactualizada: medidas.filter((r) => r.clase === 'desactualizada'),
  ok: medidas.filter((r) => r.clase === 'ok'),
};

// Tabla por ruta.
const fuente = rutas.length ? 'argumentos' : desdeArchivos ? '--paths' : archivoSitemap;
console.log(`base: ${base} · fuente: ${fuente} · rutas: ${medidas.length}\n`);
console.log('ruta'.padEnd(30) + 'HTTP'.padEnd(6) + 'nav sw/cw'.padEnd(12) + 'shell'.padEnd(12) + 'ítems'.padEnd(7) + 'blog'.padEnd(6) + 'toggle'.padEnd(9) + 'clase');
for (const r of medidas.slice().sort((a, b) => a.ruta.localeCompare(b.ruta))) {
  const vacio = { nav: '—', shell: '—', items: '—', blog: '—', toggles: '—' };
  const vps = r.medidas ? Object.keys(r.medidas) : [];
  if (!vps.length) vps.push('—');
  for (const vp of vps) {
    const m = (r.medidas && r.medidas[vp]) || vacio;
    console.log(`${r.ruta.slice(0, 29).padEnd(29)} ${String(r.http ?? '—').padEnd(5)} ${String(m.nav).padEnd(11)} ${String(m.shell).padEnd(11)} ${String(m.items).padEnd(6)} ${String(m.blog).padEnd(5)} ${String(m.toggles).padEnd(8)} ${r.clase}`);
  }
}

const bloque = (titulo, lista, conDefectos) => {
  console.log(`\n=== ${titulo}: ${lista.length}`);
  for (const r of lista) {
    if (!conDefectos) { console.log('  ' + r.ruta); continue; }
    console.log('  ' + r.ruta);
    for (const d of r.defectos) console.log('      · ' + d.texto);
  }
};
bloque('A · FALLOS DE ESTRUCTURA (HTML servido)', grupos.estructura, true);
bloque('B · RUTAS NO PUBLICADAS (404)', grupos.noPublicada, false);
bloque('C · DESPLIEGUE DESACTUALIZADO (el repo ya cumple)', grupos.desactualizada, true);
bloque('D · RUTAS OK', grupos.ok, false);

// Cuadre y cobertura.
const suma = grupos.estructura.length + grupos.noPublicada.length + grupos.desactualizada.length + grupos.ok.length;
console.log(`\ncuadre: A ${grupos.estructura.length} + B ${grupos.noPublicada.length} + C ${grupos.desactualizada.length} + D ${grupos.ok.length} = ${suma} · rutas medidas: ${medidas.length}`);
if (suma !== medidas.length) { console.error('cuadre roto: la suma de bloques no coincide con las rutas medidas'); process.exit(2); }

const paginasRepo = archivosRepo;
console.log(`cobertura: ${medidas.length} rutas del ${desdeArchivos ? 'árbol del repo' : archivoSitemap} medidas en vivo · ${vistos.size} con HTTP 200 medidas en navegador · ${paginasRepo} páginas con shell en el repo y ${mapaRepo.size} rutas distintas entre ellas (lo que vigila verify-nav)`);
if (!desdeArchivos) {
  const rutasRepo = [...mapaRepo.keys()];
  const medidasSet = new Set(medidas.map((r) => r.ruta));
  const enAmbos = rutasRepo.filter((r) => medidasSet.has(r)).length;
  console.log(`contraste: ${paginasRepo} páginas del repo → ${rutasRepo.length} rutas distintas; ${enAmbos} se midieron en vivo y ${rutasRepo.length - enAmbos} no aparecen en ${archivoSitemap} (el verificador recorre sólo las que el sitemap anuncia)`);
}

const exit = grupos.estructura.length + grupos.noPublicada.length + grupos.desactualizada.length ? 1 : 0;
console.log(`\nveredicto: ${exit === 0 ? 'VERDE — todo lo medido cumple' : 'ROJO — ' + grupos.estructura.length + ' de estructura · ' + grupos.noPublicada.length + ' no publicadas · ' + grupos.desactualizada.length + ' con despliegue desactualizado'}`);
process.exit(exit);
