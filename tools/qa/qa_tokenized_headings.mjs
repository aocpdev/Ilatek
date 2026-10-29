// QA probe: contrato bridge-only (producción) de titulares tokenizados.
// Los canónicos son fragmentos de Custom Code (sin <body>): el párrafo puente
// (cuando existe) se antepone al fragmento; el helper ILATEK_BRIDGE ya viene
// embebido en el propio canónico (tools/qa/fix_resolver_bridge.py).
//
// Casos detallados (variantes de puente):
//   sellado-de-techos : h1+h3 tokenizados; h2 estático -> SKIP honesto del h2.
//   techos-de-zinc    : h1 (<em>)+h2 (ilt-extra-title)+h3 tokenizados.
//   techos            : h1 (<em>)+h2 (ilt-extra-title)+h3 tokenizados (3.er caso).
//
// Barrido (sweep): los 47 canónicos publicables en ok-bridge; por landing exige
// que CADA titular tokenizado resuelva TestCounty y que no quede ningún token
// crudo visible (cubre los 39 h1 tokenizados por tools/qa/populate_headings.py).
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import http from 'node:http';

import { REPO, getChromium } from './repo_root.mjs';

const LP = (...p) => path.join(REPO, ...p);
const DETAILED = [
  { label: 'sellado-de-techos', file: LP('categorias', 'sellado-de-techos', 'es', 'landing-pages', 'ghl-sellado-de-techos-landing.html'), variants: ['ok', 'old', 'no', 'bad'] },
  { label: 'techos-de-zinc', file: LP('servicios', 'techos-de-zinc', 'es', 'landing-pages', 'ghl-techos-de-zinc-landing.html'), variants: ['ok', 'no'] },
  { label: 'techos', file: LP('categorias', 'techos', 'es', 'landing-pages', 'ghl-techos-landing.html'), variants: ['ok', 'no'] },
];

// Todos los canónicos publicables (mismo alcance que populate_headings.py).
function canonicos() {
  const out = [];
  for (const tier of ['categorias', 'servicios']) {
    const base = LP(tier);
    for (const slug of readdirSync(base)) {
      const dir = path.join(base, slug, 'es', 'landing-pages');
      let names;
      try { names = readdirSync(dir).filter((n) => /^ghl-.*-landing\.html$/.test(n)); }
      catch { continue; }
      for (const n of names) out.push({ label: `${tier}/${slug}`, file: path.join(dir, n) });
    }
  }
  return out.sort((a, b) => a.file.localeCompare(b.file));
}

const chromium = await getChromium();

// Contrato único del puente (custom-values.json): slots y separador no se retypean.
const CONTRACT = JSON.parse(readFileSync(path.join(import.meta.dirname, 'custom-values.json'), 'utf8'));
const { separator: BRIDGE_SEP, slots: BRIDGE_SLOTS } = CONTRACT.bridge;
for (const name of BRIDGE_SLOTS) {
  if (!CONTRACT.custom_values.includes(name)) throw new Error(`slot del puente fuera del contrato: ${name}`);
}
if (!BRIDGE_SLOTS.includes('pixel_id')) throw new Error('custom-values.json: pixel_id no está en bridge.slots');
// Valor de prueba por slot; el ORDEN lo manda el contrato, no esta lista.
const SLOT_VALUES = {
  business__county_name: 'TestCounty',
  business__email: 'qa@example.com',
  business__phone: '(787) 000-0000',
  website_url: 'https://qa.example.com',
  facebook_url: 'https://facebook.com/qa',
  instagram_url: 'https://instagram.com/qa',
  pixel_id: '123456789012345',
};
const PIXEL_ID = SLOT_VALUES.pixel_id;
// Pixel que el embed usa cuando el párrafo no trae el suyo (contrato → brand).
const BRAND_PIXEL = CONTRACT.brand.pixel_id;
const bridgeOf = (names, override = {}) => names
  .map((n) => override[n] ?? SLOT_VALUES[n] ?? `qa-${n}`)
  .join(BRIDGE_SEP);

const OK_BRIDGE = bridgeOf(BRIDGE_SLOTS);
// Párrafo viejo de min_slots (sin pixel): el resto debe seguir resolviendo.
const OLD_BRIDGE = bridgeOf(BRIDGE_SLOTS.slice(0, CONTRACT.bridge.min_slots));
const BAD_BRIDGE = bridgeOf(BRIDGE_SLOTS.slice(0, 3), { business__county_name: 'OtroCondado' }); // solo 3 slots

// Qué lleva token el canónico crudo: sin esto el check del titular no tiene
// sentido y se reporta SKIP (nunca un PASS regalado).
function rawTokens(raw) {
  const h1 = /<h1\b[^>]*>([\s\S]*?)<\/h1>/i.exec(raw);
  const h2 = /<h2[^>]*(?:id="ilt-extra-title"|class="[^"]*ilt-extra-title[^"]*")[^>]*>([\s\S]*?)<\/h2>/i.exec(raw);
  const h3s = [...raw.matchAll(/<h3\b[^>]*>([\s\S]*?)<\/h3>/gi)].map((m) => m[1]);
  // Solo texto renderizado: un href tokenizado ({{custom_values.website_url}}) no
  // es un titular con token y no debe contarse como "debe resolver el pueblo".
  const shown = (inner) => inner.replace(/<[^>]*>/g, '');
  return {
    h1: !!(h1 && shown(h1[1]).includes('{{custom_values')),
    h2: !!(h2 && shown(h2[1]).includes('{{custom_values')),
    h3Count: h3s.filter((t) => shown(t).includes('{{custom_values')).length,
  };
}

// Consumidores del puente: archivos publicables que LEEN el párrafo
// (mismo alcance que tools/qa/fix_resolver_bridge.py: ahí el pixel es obligatorio).
const SKIP_DIRS = new Set(['archivo', '.backups-uiux', 'docs', 'documentacion', 'tools', 'node_modules', '.git', 'src', 'Comunidades']);
function walkHtml(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) walkHtml(p, out); }
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}
function bridgeConsumers() {
  return walkHtml(REPO).filter((f) => {
    const rel = path.relative(REPO, f).split(path.sep).join('/');
    if (/\.tmp|tmp-|_preview|\.pre-|\bpre-|\.log$/.test('/' + rel)) return false;
    return readFileSync(f, 'utf8').includes('dv-ghl-values');
  }).sort();
}

const HELPER_HEAD = '<!-- ILATEK · resolver global del puente';
function helperBlock(raw) {
  const i = raw.indexOf(HELPER_HEAD);
  if (i < 0) return '';
  const j = raw.indexOf('</script>', i);
  return raw.slice(i, j + '</script>'.length);
}

function withBridge(raw, bridge, where = 'before') {
  const paragraphs = (Array.isArray(bridge) ? bridge : bridge === null ? [] : [bridge])
    .map((v) => `<p class="dv-ghl-values" style="display:none">${v}</p>`).join('');
  if (!paragraphs) return raw;
  const m = /<body\b[^>]*>/i.exec(raw);
  if (m) return raw.slice(0, m.index + m[0].length) + paragraphs + raw.slice(m.index + m[0].length);
  return where === 'after' ? raw + paragraphs : paragraphs + raw;
}

function serve(frag, title = '') {
  return new Promise((ok) => {
    const srv = http.createServer((_req, res) => {
      res.setHeader('content-type', 'text/html; charset=utf-8');
      // title: el canal que GHL sí expande server-side (custom value del pueblo).
      res.end(`<!doctype html><html><head><meta charset="utf-8">${title ? `<title>${title}</title><meta property="og:title" content="${title}">` : ''}</head><body>${frag}</body></html>`);
    });
    srv.listen(0, '127.0.0.1', () => ok(srv));
  });
}

const browser = await chromium.launch();
let anyFail = false;

function report(label, ok, detail) {
  console.log(`${ok ? 'PASS' : 'FAIL'} — ${label}${ok ? '' : ' :: ' + detail}`);
  if (!ok) anyFail = true;
}

async function load(raw, bridge, settleMs, opts = {}) {
  // opts.where: 'before' (runbook GHL) | 'after' (Custom Code antes del párrafo)
  // opts.dupe: copia extra del helper en la misma página (landing + embed)
  const frag = withBridge(opts.dupe ? raw + opts.dupe : raw, bridge, opts.where || 'before');
  const server = await serve(frag, opts.title || '');
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  // Meta Pixel: en QA la request no sale a la red (fbevents.js se responde vacío).
  await page.route('**/connect.facebook.net/**', (route) => route.fulfill({ status: 200, contentType: 'application/javascript', body: '' }));
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(String(e && e.message ? e.message : e)));
  await page.goto(`http://127.0.0.1:${server.address().port}/`, { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(settleMs);
  const r = await page.evaluate(() => {
    const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();
    const pick = (sel) => Array.from(document.querySelectorAll(sel))
      .filter((el) => (el.offsetWidth || el.offsetHeight) > 0)
      .map((el) => norm(el.innerText || ''));
    const h1 = pick('h1');
    const h2 = pick('h2#ilt-extra-title, h2.ilt-extra-title');
    const h3 = pick('h3');
    return {
      h1: h1.join(' | '),
      h2: h2.join(' § '),
      h2Present: h2.length > 0,
      h3,
      h3County: h3.filter((t) => t.includes('TestCounty')),
      rawHeadings: pick('h1, h2, h3').filter((t) => t.includes('{{custom_values')),
      rawVisible: (document.body.innerText.match(/\{\{custom_values[^}]*\}\}/g) || []),
      bridge: !!document.querySelector('.dv-ghl-values'),
      state: window.ILATEK_BRIDGE ? window.ILATEK_BRIDGE.state() : '',
      source: window.ILATEK_BRIDGE ? window.ILATEK_BRIDGE.source() : '',
      county: window.ILATEK_BRIDGE ? window.ILATEK_BRIDGE.county() : '',
      linksBase: window.ILATEK_LINKS ? window.ILATEK_LINKS.base('') : '',
      pixel: {
        id: window.__ilatekPixel || '',
        fbq: typeof window.fbq === 'function',
        init: (window.fbq && window.fbq.queue ? window.fbq.queue : []).filter((a) => a[0] === 'init').map((a) => a[1]),
        pageView: (window.fbq && window.fbq.queue ? window.fbq.queue : []).some((a) => a[0] === 'track' && a[1] === 'PageView'),
        pageViews: (window.fbq && window.fbq.queue ? window.fbq.queue : []).filter((a) => a[0] === 'track' && a[1] === 'PageView').length,
        scriptCount: document.querySelectorAll('script[src*="fbevents.js"]').length,
        script: !!document.querySelector('script[src*="fbevents.js"]'),
        api: !!(window.ILATEK_BRIDGE && typeof window.ILATEK_BRIDGE.pixel === 'function'),
      },
    };
  });
  await page.close();
  await new Promise((ok) => server.close(ok));
  return { r, pageErrors };
}

// ---------- Casos detallados con variantes de puente ----------
for (const { label, file, variants } of DETAILED) {
  const raw = readFileSync(file, 'utf8');
  const has = rawTokens(raw);
  for (const variant of variants) {
    const bridge = variant === 'ok' ? OK_BRIDGE
      : variant === 'old' ? OLD_BRIDGE
        : variant === 'bad' ? BAD_BRIDGE
          : null;
    const { r, pageErrors } = await load(raw, bridge, 1800);
    console.log(`\n== ${label} / ${variant}-bridge (bridge=${r.bridge ? 'present' : 'absent'})`);

    if (variant === 'ok') {
      const checks = [
        ['h1', 'h1 visible text contains TestCounty', has.h1, r.h1.includes('TestCounty'), r.h1.slice(0, 120)],
        ['h2', 'h2.ilt-extra-title visible text contains TestCounty', has.h2, r.h2Present && r.h2.includes('TestCounty'), r.h2.slice(0, 120)],
        ['h3', `all ${has.h3Count} tokenized FAQ h3 resolve TestCounty`, has.h3Count > 0, r.h3County.length >= has.h3Count, `county h3 (${r.h3County.length}/${has.h3Count}): ${JSON.stringify(r.h3County).slice(0, 180)}`],
      ];
      const skipWhy = { h1: 'no token in h1', h2: 'no token in that title', h3: 'no tokenized h3 in this canónico' };
      for (const [key, check, wanted, ok, detail] of checks) {
        if (!wanted) console.log(`SKIP — [${label}] ${check.replace(' contains TestCounty', '').replace(' resolve TestCounty', '')} (${skipWhy[key]}; static copy)`);
        else report(`[${label}] ${check}`, ok, detail);
      }
      report(`[${label}] zero '{{custom_values' in visible h1/h2/h3`, r.rawHeadings.length === 0, JSON.stringify(r.rawHeadings).slice(0, 160));
      report(`[${label}] pixel_id del puente inicia el Meta Pixel`, r.pixel.id === PIXEL_ID, `id=${r.pixel.id}`);
      report(`[${label}] fbq('init') con el id resuelto`, r.pixel.init.includes(PIXEL_ID), JSON.stringify(r.pixel.init).slice(0, 160));
      report(`[${label}] fbq('track','PageView') enviado`, r.pixel.pageView, 'sin PageView en la cola');
      report(`[${label}] fbevents.js inyectado por el helper`, r.pixel.script && r.pixel.api, `script=${r.pixel.script} api=${r.pixel.api}`);
      report(`[${label}] exactamente un init y un PageView por carga`, r.pixel.init.length === 1 && r.pixel.pageViews === 1, `init=${JSON.stringify(r.pixel.init)} pageView=${r.pixel.pageViews}`);
      report(`[${label}] el pixel no desplaza a los resolvers (enlaces al subdominio)`, r.linksBase === 'https://qa.example.com', `base=${r.linksBase}`);
      report(`[${label}] cero token crudo visible en el body`, r.rawVisible.length === 0, JSON.stringify(r.rawVisible).slice(0, 160));
      report(`[${label}] no pageErrors`, pageErrors.length === 0, pageErrors.join(' | ').slice(0, 200));
    } else if (variant === 'old') {
      report(`[${label}] [old] párrafo de ${CONTRACT.bridge.min_slots} slots sigue resolviendo el pueblo`, r.h1.includes('TestCounty'), r.h1.slice(0, 120));
      report(`[${label}] [old] sin slot de pixel usa el pixel de marca (uno solo)`, r.pixel.id === BRAND_PIXEL && r.pixel.init.length === 1 && r.pixel.pageViews === 1, `id=${r.pixel.id} init=${JSON.stringify(r.pixel.init)} pv=${r.pixel.pageViews}`);
      report(`[${label}] [old] cero token crudo visible`, r.rawHeadings.length === 0 && r.rawVisible.length === 0, JSON.stringify([...r.rawHeadings, ...r.rawVisible]).slice(0, 160));
      report(`[${label}] [old] no pageErrors`, pageErrors.length === 0, pageErrors.join(' | ').slice(0, 200));
    } else {
      report(`[${label}] [${variant}] h1 falls back to real literal (Puerto Rico)`, /Puerto Rico/.test(r.h1), r.h1.slice(0, 120));
      report(`[${label}] [${variant}] no TestCounty leak into headings`,
        !r.h1.includes('TestCounty') && !r.h2.includes('TestCounty') && !r.h3.some((t) => t.includes('TestCounty')),
        `${r.h1.slice(0, 80)} § ${r.h2.slice(0, 80)}`);
      report(`[${label}] [${variant}] zero '{{custom_values' in visible h1/h2/h3`, r.rawHeadings.length === 0, JSON.stringify(r.rawHeadings).slice(0, 200));
      report(`[${label}] [${variant}] no pageErrors`, pageErrors.length === 0, pageErrors.join(' | ').slice(0, 200));
      report(`[${label}] [${variant}] no other-town leakage (OtroCondado absent)`, variant !== 'bad' || !r.h1.includes('OtroCondado'), r.h1.slice(0, 120));
      report(`[${label}] [${variant}] sin párrafo: pixel de marca una sola vez`, r.pixel.id === BRAND_PIXEL && r.pixel.init.length === 1 && r.pixel.pageViews === 1, `id=${r.pixel.id} init=${JSON.stringify(r.pixel.init)} pv=${r.pixel.pageViews}`);
    }
  }
}

// ---------- Bordes del pixel: configuraciones hostiles ----------
console.log('\n== bordes del pixel (mismo canónico, puente hostil)');
const edgeFile = DETAILED[0].file;
const edgeRaw = readFileSync(edgeFile, 'utf8');
const edgeHelper = helperBlock(edgeRaw);
report('[borde] helper embebido localizable en el canónico', !!edgeHelper, 'sin bloque ILATEK');

// 1. Párrafo DESPUÉS del fragmento (Custom Code antes del Paragraph nativo):
//    el pixel debe encenderse al quedar el DOM listo, no al parsear el script.
{
  const { r, pageErrors } = await load(edgeRaw, OK_BRIDGE, 1500, { where: 'after' });
  // Los resolvers de titular corren al parsear (comportamiento previo): con el
  // párrafo después caen al literal seguro. El pixel ya no depende de ese orden.
  report('[borde] párrafo después del Custom Code: titular al literal, no token crudo', /Puerto Rico/.test(r.h1) && !r.h1.includes('{{'), r.h1.slice(0, 80));
  report('[borde] párrafo después del Custom Code enciende el pixel', r.pixel.id === PIXEL_ID && r.pixel.pageViews === 1, `id=${r.pixel.id} pageView=${r.pixel.pageViews}`);
  report('[borde] párrafo después del Custom Code no deja tokens crudos', r.rawVisible.length === 0, JSON.stringify(r.rawVisible).slice(0, 120));
  report('[borde] párrafo después del Custom Code sin pageErrors', pageErrors.length === 0, pageErrors.join(' | ').slice(0, 160));
}

// 2. Dos párrafos: uno viejo de min_slots primero y el completo después. Debe
//    preferir el completo (pixel + enlaces), no el primero que aparezca.
{
  const { r, pageErrors } = await load(edgeRaw, [OLD_BRIDGE, OK_BRIDGE], 1500);
  report('[borde] párrafo viejo + completo: prefiere el completo para el pixel', r.pixel.id === PIXEL_ID, `id=${r.pixel.id}`);
  report('[borde] párrafo viejo + completo: enlaces al subdominio del completo', r.linksBase === 'https://qa.example.com', `base=${r.linksBase}`);
  report('[borde] párrafo viejo + completo sin pageErrors', pageErrors.length === 0, pageErrors.join(' | ').slice(0, 160));
}

// 3. Helper duplicado en la misma página (landing + embed): un init, un PageView.
{
  const { r, pageErrors } = await load(edgeRaw, OK_BRIDGE, 1500, { dupe: edgeHelper });
  report('[borde] helper duplicado: un solo init', r.pixel.init.length === 1 && r.pixel.init.includes(PIXEL_ID), JSON.stringify(r.pixel.init));
  report('[borde] helper duplicado: un solo PageView', r.pixel.pageViews === 1, `pageViews=${r.pixel.pageViews}`);
  report('[borde] helper duplicado: un solo fbevents.js', r.pixel.scriptCount === 1, `scripts=${r.pixel.scriptCount}`);
  report('[borde] helper duplicado sin pageErrors', pageErrors.length === 0, pageErrors.join(' | ').slice(0, 160));
}

// 4. Ids inválidos (vacío / no numérico / corto): no carga terceros ni truena,
//    y el resto del puente sigue resolviendo.
for (const [label, id] of [['vacío', ''], ['no-numérico', 'QA-PIXEL'], ['corto', '12345']]) {
  const { r, pageErrors } = await load(edgeRaw, bridgeOf(BRIDGE_SLOTS, { pixel_id: id }), 1200);
  // Slot vacío = sin valor -> pixel de marca; id explícitamente inválido -> nada.
  const expected = id ? '' : BRAND_PIXEL;
  report(`[borde] id ${label}: ${expected ? 'pixel de marca' : 'no carga Meta Pixel'}`, r.pixel.id === expected, `id=${r.pixel.id} esperado=${expected || 'ninguno'}`);
  report(`[borde] id ${label}: el resto del puente resuelve igual`, r.h1.includes('TestCounty') && r.linksBase === 'https://qa.example.com', `${r.h1.slice(0, 50)} base=${r.linksBase}`);
  report(`[borde] id ${label}: sin pageErrors`, pageErrors.length === 0, pageErrors.join(' | ').slice(0, 160));
}

// ---------- Canal del <title>: el pueblo que GHL sí expande sin párrafo ----------
// El Custom Code no se expande, pero el <title>/og:title sale del mismo
// custom values.business__county_name y sí llega expandido al navegador.
console.log('\n== canal del <title> (sin párrafo nativo, como la página publicada)');
{
  const title = 'Compañía Multiservicios en TestCounty, Puerto Rico | Ilatek Property Solution';
  const { r, pageErrors } = await load(edgeRaw, null, 1200, { title });
  report('[title] sin párrafo, el pueblo del <title> resuelve el h1', r.h1.includes('TestCounty'), `${r.h1.slice(0, 90)} state=${r.state} source=${r.source}`);
  report('[title] sin párrafo: el puente queda ready por el título', r.state === 'ready' && r.source === 'meta', `state=${r.state} source=${r.source}`);
  report('[title] sin párrafo: cero tokens crudos visibles', r.rawVisible.length === 0, JSON.stringify(r.rawVisible).slice(0, 160));
  report('[title] sin párrafo: pixel de marca una sola vez', r.pixel.id === BRAND_PIXEL && r.pixel.init.length === 1 && r.pixel.pageViews === 1, `id=${r.pixel.id} init=${JSON.stringify(r.pixel.init)} pv=${r.pixel.pageViews}`);
  report('[title] sin pageErrors', pageErrors.length === 0, pageErrors.join(' | ').slice(0, 160));
}
// Subdominio del pueblo (sin título con "en X, Puerto Rico" y sin data-*):
// el único canal posible es el host, así que prueba el canal y no el canónico.
{
  const args = ['--host-resolver-rules=MAP juncos.ilatekpr.test 127.0.0.1,MAP juana-diaz.ilatekpr.test 127.0.0.1'];
  const hostBrowser = await chromium.launch({ args });
  const hostFixture = `${edgeHelper}\n<h1>Servicios en {{custom_values.business__county_name}}, Puerto Rico</h1>\n<p>{{custom_values.business__email}}</p>`;
  for (const [host, county] of [['juncos.ilatekpr.test', 'Juncos'], ['juana-diaz.ilatekpr.test', 'Juana Díaz']]) {
    const server = await serve(hostFixture, '');
    const port = server.address().port;
    const page = await hostBrowser.newPage();
    await page.route('**/connect.facebook.net/**', (route) => route.fulfill({ status: 200, contentType: 'application/javascript', body: '' }));
    await page.goto(`http://${host}:${port}/`, { waitUntil: 'load', timeout: 45000 });
    await page.waitForTimeout(1200);
    const r = await page.evaluate(() => ({
      h1: (document.querySelector('h1') || {}).innerText || '',
      raw: (document.body.innerText.match(/\{\{custom_values[^}]*\}\}/g) || []),
      state: window.ILATEK_BRIDGE ? window.ILATEK_BRIDGE.state() : '',
      source: window.ILATEK_BRIDGE ? window.ILATEK_BRIDGE.source() : '',
    }));
    report(`[host] ${host}: pueblo del subdominio (${county})`, r.h1.includes(county) && r.source === 'host', `${r.h1.slice(0, 80)} state=${r.state} source=${r.source}`);
    report(`[host] ${host}: cero tokens crudos`, r.raw.length === 0, JSON.stringify(r.raw).slice(0, 120));
    await page.close();
    await new Promise((ok) => server.close(ok));
  }
  await hostBrowser.close();
}
{
  // Sin pueblo en el título y en un host sin subdominio (127.0.0.1): fallback de marca.
  const { r, pageErrors } = await load(edgeRaw, null, 1200, {});
  report('[title] sin pueblo en título ni subdominio: literal de marca', /Puerto Rico/.test(r.h1), `${r.h1.slice(0, 90)} state=${r.state}`);
  report('[title] sin pueblo: cero tokens crudos visibles', r.rawVisible.length === 0, JSON.stringify(r.rawVisible).slice(0, 160));
  report('[title] sin pueblo: sin pageErrors', pageErrors.length === 0, pageErrors.join(' | ').slice(0, 160));
}

// ---------- Barrido: todo consumidor del puente en ok-bridge ----------
const canonicosSet = new Set(canonicos().map((c) => c.file));
const consumers = bridgeConsumers();
console.log(`\n== sweep: ${consumers.length} consumidores del puente (ok-bridge)`);
let swept = 0;
for (const file of consumers) {
  const label = path.relative(REPO, file).split(path.sep).join('/');
  const raw = readFileSync(file, 'utf8');
  const isCanon = canonicosSet.has(file);
  const has = isCanon ? rawTokens(raw) : { h1: false, h2: false, h3Count: 0 };
  const { r, pageErrors } = await load(raw, OK_BRIDGE, 1100);
  const h1Ok = !has.h1 || r.h1.includes('TestCounty');
  const h2Ok = !has.h2 || (r.h2Present && r.h2.includes('TestCounty'));
  const h3Ok = r.h3County.length >= has.h3Count;
  const rawOk = (isCanon ? r.rawHeadings.length === 0 : true) && r.rawVisible.length === 0;
  const countyOk = r.county === 'TestCounty';
  const errOk = pageErrors.length === 0;
  const pixelOk = r.pixel.id === PIXEL_ID && r.pixel.init.includes(PIXEL_ID) && r.pixel.pageView && r.pixel.script
    && r.pixel.init.length === 1 && r.pixel.pageViews === 1;
  const ok = h1Ok && h2Ok && h3Ok && rawOk && errOk && pixelOk && countyOk;
  const detail = [
    has.h1 ? `h1 ${h1Ok ? 'ok' : 'NO (' + r.h1.slice(0, 60) + ')'}` : 'h1 n/a',
    has.h2 ? `h2 ${h2Ok ? 'ok' : 'NO'}` : 'h2 n/a',
    has.h3Count ? `h3 ${r.h3County.length}/${has.h3Count}` : 'h3 n/a',
    `county ${r.county || '-'}`,
    `raw ${r.rawHeadings.length + r.rawVisible.length}`,
    `pixel ${pixelOk ? 'ok' : 'NO id=' + r.pixel.id}`,
    `err ${pageErrors.length}`,
  ].join(' · ');
  report(`[sweep] ${label}`, ok, detail);
  if (ok) console.log(`        ${detail}`);
  swept += 1;
}

await browser.close();
console.log(`\nsweep: ${swept} consumidores del puente`);
console.log(anyFail ? '\nRESULTADO: FAIL' : '\nRESULTADO: ALL GREEN');
process.exit(anyFail ? 1 : 0);
