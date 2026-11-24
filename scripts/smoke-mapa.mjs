// Smoke test de render de las páginas del mapa (ES y EN) en Chromium headless.
// Uso: node scripts/smoke-mapa.mjs            (sirve el repo en 127.0.0.1 y lo apaga al terminar)
// Requiere playwright-core instalado y un Chromium de ms-playwright, Chrome o Edge.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';

const ROOT = path.resolve(import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const PAGINAS = [
  { nombre: 'ES', ruta: '/Comunidades/landing-pages/comunidades.html' },
  { nombre: 'EN', ruta: '/Comunidades/en/landing-pages/communities.en.html' }
];

/* ---------- navegador disponible ---------- */
function resolverChromium() {
  const cands = [];
  if (process.env.CHROME_PATH) cands.push(process.env.CHROME_PATH);
  const base = path.join(process.env.LOCALAPPDATA || '', 'ms-playwright');
  if (fs.existsSync(base)) {
    for (const d of fs.readdirSync(base).filter((x) => x.startsWith('chromium-')).sort().reverse()) {
      cands.push(path.join(base, d, 'chrome-win64', 'chrome.exe'));
      cands.push(path.join(base, d, 'chrome-win', 'chrome.exe'));
    }
  }
  cands.push('C:/Program Files/Google/Chrome/Application/chrome.exe');
  cands.push('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe');
  for (const c of cands) if (c && fs.existsSync(c)) return c;
  return null;
}

let chromium;
try {
  ({ chromium } = await import('playwright-core'));
} catch (e) {
  console.log('BLOQUEO: no se puede importar playwright-core (' + e.message + ')');
  process.exit(2);
}
const ejecutable = resolverChromium();
if (!ejecutable) {
  console.log('BLOQUEO: no hay Chromium/Chrome/Edge instalado para playwright-core.');
  console.log('  Rutas probadas: %LOCALAPPDATA%/ms-playwright/chromium-*/chrome-win64/chrome.exe, Chrome, Edge.');
  process.exit(2);
}

/* ---------- servidor estático en localhost ---------- */
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};
const servidor = http.createServer((req, res) => {
  try {
    const ruta = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let f = path.join(ROOT, ruta);
    if (!f.startsWith(ROOT)) {
      res.writeHead(403).end('forbidden');
      return;
    }
    if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
    if (!fs.existsSync(f)) {
      res.writeHead(404).end('no encontrado');
      return;
    }
    res.writeHead(200, { 'content-type': MIME[path.extname(f).toLowerCase()] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(res);
  } catch {
    res.writeHead(500).end('error');
  }
});
await new Promise((r) => servidor.listen(0, '127.0.0.1', r));
const origen = 'http://127.0.0.1:' + servidor.address().port;

/* ---------- instrumentación de MapLibre ---------- */
const initScript = () => {
  window.__ilk = { metodos: [], terrain: [], proyeccion: [], pitch: [], mapas: 0, listo: false };
  const parchea = () => {
    const M = window.maplibregl && window.maplibregl.Map;
    if (!M || M.__ilkParcheado) return !!M;
    M.__ilkParcheado = true;
    window.__ilk.version = (window.maplibregl.getVersion && window.maplibregl.getVersion()) || null;
    ['on', 'addSource', 'addLayer', 'setTerrain', 'setProjection', 'setPitch', 'flyTo', 'jumpTo', 'easeTo', 'setStyle', 'addControl'].forEach((n) => {
      const orig = M.prototype[n];
      if (typeof orig !== 'function') return;
      M.prototype[n] = function (...a) {
        try {
          if (!window.__ilkMap) window.__ilkMap = this;
          window.__ilk.metodos.push(n);
          if (n === 'setTerrain') window.__ilk.terrain.push(a[0]);
          if (n === 'setProjection') window.__ilk.proyeccion.push(a[0]);
          if (n === 'setPitch') window.__ilk.pitch.push(a[0]);
        } catch (e) {}
        return orig.apply(this, a);
      };
    });
    return true;
  };
  const t = setInterval(() => {
    if (parchea()) clearInterval(t);
  }, 5);
  parchea();
};

const resultados = [];

// Los 1.112 enlaces salen del array COM que alimenta los pines (556 comunidades × 2 servicios).
function enlacesDeLaPagina(ruta) {
  const h = fs.readFileSync(path.join(ROOT, ruta), 'utf8');
  const m = h.match(/COM\s*=\s*(\[[\s\S]*?\]);/);
  if (!m) return { comunidades: 0, urls: 0 };
  const arr = JSON.parse(m[1].replace(/,\s*\]/, ']'));
  const urls = new Set();
  for (const c of arr) {
    if (c.u) urls.add(c.u);
    if (c.v) urls.add(c.v);
  }
  return { comunidades: arr.length, urls: urls.size };
}

const navegador = await chromium.launch({
  executablePath: ejecutable,
  headless: true,
  args: ['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox']
});
console.log('Chromium:', ejecutable);
console.log('Servidor local:', origen);

try {
  for (const p of PAGINAS) {
    const ctx = await navegador.newContext({ viewport: { width: 1440, height: 1000 }, locale: p.nombre === 'ES' ? 'es-PR' : 'en-US' });
    const page = await ctx.newPage();
    const consola = [];
    const jserrores = [];
    const redFallida = [];
    page.on('console', (m) => {
      if (m.type() === 'error') consola.push(m.text());
    });
    page.on('requestfailed', (r) => redFallida.push(r.url().slice(0, 140) + ' :: ' + ((r.failure() && r.failure().errorText) || '?')));
    page.on('response', (r) => {
      if (r.status() >= 400) redFallida.push(r.status() + ' ' + r.url().slice(0, 140));
    });
    page.on('pageerror', (e) => jserrores.push(String(e && e.message ? e.message : e)));
    await page.addInitScript(initScript);

    const url = origen + p.ruta;
    await page.goto(url, { waitUntil: 'load', timeout: 90000 });
    await page.bringToFront();

    const webgl2 = await page.evaluate(() => {
      try {
        return !!document.createElement('canvas').getContext('webgl2');
      } catch (e) {
        return false;
      }
    });

    // cerrar tutorial si aparece y llevar el mapa a la vista (carga diferida)
    await page.evaluate(() => {
      const s = document.querySelector('.ilk-com__tuto-saltar');
      if (s) s.click();
      const m = document.getElementById('ilk-com-mapa');
      if (m) m.scrollIntoView({ block: 'center' });
    });

    // esperar a que el mapa exista (o al fallback DOM)
    let mapaListo = false;
    try {
      await page.waitForFunction(() => !!(window.__ilkMap || (window.__ilk && window.__ilk.metodos.length)), null, { timeout: 45000 });
      mapaListo = true;
    } catch {}
    await page.waitForTimeout(2500);

    const estado = await page.evaluate(() => {
      const m = window.__ilkMap;
      // Los pines viven en dos fuentes GeoJSON con clustering (resi/apto).
      const features = [];
      const clusters = [];
      for (const id of ['com-pines-resi', 'com-pines-apto']) {
        try {
          const s = m.getSource(id);
          const d = s && s._data;
          const geo = d && (d.geojson || d);
          if (geo && Array.isArray(geo.features)) features.push(...geo.features);
          clusters.push({ id, cluster: s && s._options ? s._options.cluster : null, radio: s && s._options ? s._options.clusterRadius : null, features: geo && geo.features ? geo.features.length : null });
        } catch (e) {
          clusters.push({ id, error: e.message });
        }
      }
      const urls = new Set();
      for (const f of features) {
        const p = f.properties || {};
        if (p.u) urls.add(p.u);
        if (p.v) urls.add(p.v);
      }
      const g = (f) => {
        try {
          return f();
        } catch (e) {
          return null;
        }
      };
      const estilo = g(() => m.getStyle());
      const capas = estilo && estilo.layers ? estilo.layers.map((l) => l.id + ':' + l.type) : [];
      const contador = document.getElementById('ilk-com-contador');
      const nodosContador = document.querySelectorAll('.ilk-com__contador, #ilk-com-contador').length;
      // ¿queda hueco o algo flotando justo debajo del control de zoom?
      const debajoZoom = (() => {
        const z = document.querySelector('#ilk-com-mapa .maplibregl-ctrl-zoom-out') || document.querySelector('#ilk-com-mapa .maplibregl-ctrl-zoom-in');
        if (!z) return { error: 'sin control de zoom' };
        const r = z.getBoundingClientRect();
        const el = document.elementFromPoint(Math.round(r.x + r.width / 2), Math.round(r.bottom + 26));
        if (!el) return { error: 'nada en ese punto' };
        return { tag: el.tagName.toLowerCase(), clase: String(el.className || '').slice(0, 80), esMapa: !!(el.closest && el.closest('#ilk-com-mapa')) };
      })();
      const capasBar = document.getElementById('ilk-com-capas');
      const btn3d = document.getElementById('ilk-com-btn3d');
      return {
        contador: contador ? contador.textContent.trim() : null,
        nodosContador,
        debajoZoom,
        com: features.length,
        urls: urls.size,
        clusters,
        anclas: document.querySelectorAll('#ilatek-mapa-comunidades a[href*="comunidades.ilatekpr.com"]').length,
        marcadores: document.querySelectorAll('#ilk-com-mapa .maplibregl-marker, #ilk-com-mapa .ilk-com__pin').length,
        maplibre: (window.maplibregl && window.maplibregl.getVersion && window.maplibregl.getVersion()) || null,
        terrain: g(() => m.getTerrain && m.getTerrain()),
        proyeccion: g(() => (m.getProjection ? m.getProjection() : null)),
        pitch: g(() => m.getPitch()),
        zoom: g(() => m.getZoom()),
        capas,
        capasBar: capasBar
          ? [...capasBar.querySelectorAll('button[data-capa]')].map((b) => ({
              capa: b.dataset.capa,
              activa: b.classList.contains('is-active'),
              pressed: b.getAttribute('aria-pressed')
            }))
          : null,
        btn3d: btn3d ? { pressed: btn3d.getAttribute('aria-pressed'), texto: btn3d.textContent.trim() } : null,
        fallback: (() => {
          const e = document.getElementById('ilk-com-mapa-estado');
          return e ? { texto: e.textContent.trim().slice(0, 160), visible: !!e.offsetParent } : null;
        })(),
        instrumentado: window.__ilk
      };
    });

    /* --- clic en la fila de capas --- */
    const capasClic = [];
    const nombres = ['comunidades', 'zonas', 'clima'];
    for (const capa of nombres) {
      const sel = `#ilk-com-capas button[data-capa="${capa}"]`;
      if (!(await page.locator(sel).count())) {
        capasClic.push({ capa, error: 'botón no encontrado' });
        continue;
      }
      await page.locator(sel).click({ timeout: 8000 }).catch((e) => capasClic.push({ capa, error: 'click: ' + e.message.slice(0, 80) }));
      await page.waitForTimeout(900);
      capasClic.push(
        await page.evaluate((c) => {
          const b = document.querySelector(`#ilk-com-capas button[data-capa="${c}"]`);
          const m = window.__ilkMap;
          return {
            capa: c,
            activa: b.classList.contains('is-active'),
            pressed: b.getAttribute('aria-pressed'),
            estilo: m && m.getStyle ? m.getStyle().layers.length : null
          };
        }, capa)
      );
    }

    /* --- toggle 2D / 3D: el mapa puede arrancar ya en 3D, así que se comprueba el cambio --- */
    const leerPitch = () =>
      page.evaluate(() => {
        const b = document.getElementById('ilk-com-btn3d');
        return {
          pitch: window.__ilkMap ? window.__ilkMap.getPitch() : null,
          pressed: b ? b.getAttribute('aria-pressed') : null
        };
      });
    const pInicial = await leerPitch();
    await page.locator('#ilk-com-btn3d').click({ timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(2200);
    const p1 = await leerPitch();
    await page.locator('#ilk-com-btn3d').click({ timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(2200);
    const p2 = await leerPitch();

    /* --- layout: tabs a la derecha del buscador en escritorio, fila completa en móvil --- */
    const medirLayout = () =>
      page.evaluate(() => {
        const rect = (sel) => {
          const e = document.querySelector(sel);
          if (!e) return null;
          const b = e.getBoundingClientRect();
          return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height), right: Math.round(b.right), bottom: Math.round(b.bottom), cy: Math.round(b.y + b.height / 2) };
        };
        return {
          filtros: rect('.ilk-com__filtros'),
          buscar: rect('.ilk-com__buscar'),
          chips: rect('#ilk-com-chips'),
          capas: rect('#ilk-com-capas'),
          vw: window.innerWidth,
          desborde: document.documentElement.scrollWidth - window.innerWidth
        };
      });
    const layoutEscritorio = await medirLayout();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(500);
    const layoutMovil = await medirLayout();

    const r = {
      pagina: p.nombre,
      url: p.ruta,
      enlaces: enlacesDeLaPagina(p.ruta),
      layout: { escritorio: layoutEscritorio, movil: layoutMovil },
      webgl2,
      mapaListo,
      maplibre: estado.maplibre,
      com: estado.com,
      urls: estado.urls,
      anclas: estado.anclas,
      marcadores: estado.marcadores,
      contador: estado.contador,
      nodosContador: estado.nodosContador,
      debajoZoom: estado.debajoZoom,
      terrain: estado.terrain,
      proyeccion: estado.proyeccion,
      pitchInicial: estado.pitch,
      capasExtrusion: estado.capas ? estado.capas.filter((c) => /extrusion|region|zona/i.test(c)) : [],
      capasTotal: estado.capas ? estado.capas.length : null,
      capasBar: estado.capasBar,
      capasClic,
      btn3d: estado.btn3d,
      pitch: { inicial: pInicial, clic1: p1, clic2: p2 },
      clusters: estado.clusters,
      fallback: estado.fallback,
      erroresJS: jserrores,
      erroresConsola: consola.filter((t) => !/^Failed to load resource/i.test(t)).slice(0, 8),
      recursosFallidos: consola.filter((t) => /^Failed to load resource/i.test(t)).length,
      redFallida: [...new Set(redFallida)].slice(0, 6)
    };
    resultados.push(r);
    await ctx.close();
  }
} finally {
  await navegador.close().catch(() => {});
  await new Promise((r) => servidor.close(r));
}

/* ---------- veredicto ---------- */
let fallos = 0;
const di = (nombre, ok, detalle) => {
  if (!ok) fallos++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${nombre}\n      ${detalle}`);
};
console.log('\nSmoke test de render · páginas del mapa\n');
for (const r of resultados) {
  const tabsOk =
    Array.isArray(r.capasBar) &&
    r.capasBar.length === 3 &&
    r.capasBar.map((c) => c.capa).sort().join(',') === 'clima,comunidades,zonas' &&
    r.capasClic.every((c) => !c.error && c.activa && c.pressed === 'true');
  const vals = [r.pitch.clic1.pitch, r.pitch.clic2.pitch];
  const pitchOk =
    vals.every((v) => typeof v === 'number') &&
    Math.abs(vals[0] - vals[1]) > 20 &&
    Math.min(...vals) < 10 &&
    Math.max(...vals) > 40 &&
    r.pitch.clic1.pressed !== r.pitch.inicial.pressed &&
    r.pitch.clic2.pressed === r.pitch.inicial.pressed;
  di(
    `${r.pagina} · MapLibre 5 inicializa con mapa, terreno y proyección`,
    !!r.maplibre && /^5\./.test(r.maplibre) && r.mapaListo && !!r.terrain && /dem/.test(String(r.terrain.source)) && r.capasTotal > 5,
    `maplibre=${r.maplibre} · mapa=${r.mapaListo} · terrain=${JSON.stringify(r.terrain)} · proyección=${JSON.stringify(r.proyeccion)} · capas=${r.capasTotal}`
  );
  di(
    `${r.pagina} · fila Comunidades · Zonas · Clima responde al clic`,
    tabsOk,
    `tabs=${JSON.stringify(r.capasBar)} · clics=${JSON.stringify(r.capasClic)}`
  );
  di(
    `${r.pagina} · toggle 2D/3D cambia el pitch`,
    pitchOk,
    `inicial pitch=${r.pitch.inicial.pitch} pressed=${r.pitch.inicial.pressed} · clic1 pitch=${r.pitch.clic1.pitch} pressed=${r.pitch.clic1.pressed} · clic2 pitch=${r.pitch.clic2.pitch} pressed=${r.pitch.clic2.pressed}`
  );
  di(
    `${r.pagina} · 556 comunidades / 1.112 URLs y sin nodo ni hueco de contador`,
    r.com === 556 &&
      r.enlaces.comunidades === 556 &&
      r.enlaces.urls === 1112 &&
      r.contador === null &&
      r.nodosContador === 0 &&
      r.debajoZoom &&
      r.debajoZoom.esMapa &&
      !/contador/i.test(String(r.debajoZoom.clase || '')),
    `features=${r.com} · COM=${r.enlaces.comunidades} · URLs=${r.enlaces.urls} · nodos .ilk-com__contador=${r.nodosContador} · id presente=${r.contador === null ? 'no' : 'sí'} · bajo el zoom=${JSON.stringify(r.debajoZoom)} · fuentes=${JSON.stringify(r.clusters)}`
  );
  di(
    `${r.pagina} · sin errores de JS ni de consola`,
    r.erroresJS.length === 0 && r.erroresConsola.length === 0,
    `pageerror=${r.erroresJS.length} ${r.erroresJS.slice(0, 3).join(' | ')} · console.error=${r.erroresConsola.length} ${r.erroresConsola.slice(0, 3).join(' | ')} · recursos fallidos (red/terceros)=${r.recursosFallidos}`
  );
  const le = r.layout.escritorio;
  const lm = r.layout.movil;
  const escritorioOk =
    le.buscar && le.capas && le.filtros && le.chips &&
    Math.abs(le.capas.cy - le.buscar.cy) <= 24 &&
    le.capas.x >= le.buscar.right - 2 &&
    Math.abs((Math.min(le.buscar.x, le.capas.x) + Math.max(le.buscar.right, le.capas.right)) / 2 - (le.filtros.x + le.filtros.w / 2)) <= 40 &&
    le.chips.y >= le.buscar.bottom - 6;
  const movilOk = lm.capas && lm.filtros && lm.capas.w >= lm.filtros.w * 0.85 && lm.desborde <= 1;
  di(
    `${r.pagina} · tabs a la derecha del buscador (escritorio) y fila completa (móvil)`,
    escritorioOk && movilOk,
    `escritorio: buscador x=${le.buscar && le.buscar.x}..${le.buscar && le.buscar.right} cy=${le.buscar && le.buscar.cy} · tabs x=${le.capas && le.capas.x}..${le.capas && le.capas.right} cy=${le.capas && le.capas.cy} · chips y=${le.chips && le.chips.y} (buscador bottom=${le.buscar && le.buscar.bottom})` +
      ` | móvil: tabs w=${lm.capas && lm.capas.w} de filtros ${lm.filtros && lm.filtros.w} · desborde=${lm.desborde}px`
  );
  if (r.fallback && r.fallback.visible) console.log(`      fallback DOM visible: ${r.fallback.texto}`);
  if (r.redFallida.length) console.log(`      peticiones de red fallidas (terceros/plantilla): ${r.redFallida.join(' | ')}`);
}
console.log(`\n${resultados.length ? (fallos ? `${fallos} comprobaciones en rojo` : 'smoke test en verde') : 'sin resultados'}`);
process.exit(fallos || resultados.length === 0 ? 1 : 0);
