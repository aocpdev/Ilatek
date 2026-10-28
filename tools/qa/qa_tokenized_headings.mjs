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
import { createRequire } from 'node:module';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import http from 'node:http';

const ROOT = path.resolve(import.meta.dirname, '../../..');
const LP = (...p) => path.join(ROOT, 'Ilatek', ...p);
const DETAILED = [
  { label: 'sellado-de-techos', file: LP('categorias', 'sellado-de-techos', 'es', 'landing-pages', 'ghl-sellado-de-techos-landing.html'), variants: ['ok', 'no', 'bad'] },
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

// Same playwright resolution as tools/qa/run_runtime_qa.mjs.
const { chromium } = await (async () => {
  try { return await import('playwright'); }
  catch {
    const envRequire = createRequire(path.join(ROOT, 'scripts', '.qaenv', 'node_modules', 'playwright', 'package.json'));
    return { chromium: envRequire('playwright').chromium };
  }
})();

const OK_BRIDGE = [
  'TestCounty',
  'qa@example.com',
  '(787) 000-0000',
  'https://qa.example.com',
  'https://facebook.com/qa',
  'https://instagram.com/qa',
].join('|||DV|||');
const BAD_BRIDGE = 'OtroCondado|||qa@example.com|||(787) 000-0000'; // solo 3 slots

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

function serve(frag) {
  return new Promise((ok) => {
    const srv = http.createServer((_req, res) => {
      res.setHeader('content-type', 'text/html; charset=utf-8');
      res.end(`<!doctype html><html><head><meta charset="utf-8"></head><body>${frag}</body></html>`);
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

async function load(raw, bridge, settleMs) {
  const frag = (bridge === null ? '' : `<p class="dv-ghl-values" style="display:none">${bridge}</p>`) + raw;
  const server = await serve(frag);
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
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
      bridge: !!document.querySelector('.dv-ghl-values'),
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
    const bridge = variant === 'ok' ? OK_BRIDGE : variant === 'bad' ? BAD_BRIDGE : null;
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
      report(`[${label}] no pageErrors`, pageErrors.length === 0, pageErrors.join(' | ').slice(0, 200));
    } else {
      report(`[${label}] [${variant}] h1 falls back to real literal (Puerto Rico)`, /Puerto Rico/.test(r.h1), r.h1.slice(0, 120));
      report(`[${label}] [${variant}] no TestCounty leak into headings`,
        !r.h1.includes('TestCounty') && !r.h2.includes('TestCounty') && !r.h3.some((t) => t.includes('TestCounty')),
        `${r.h1.slice(0, 80)} § ${r.h2.slice(0, 80)}`);
      report(`[${label}] [${variant}] zero '{{custom_values' in visible h1/h2/h3`, r.rawHeadings.length === 0, JSON.stringify(r.rawHeadings).slice(0, 200));
      report(`[${label}] [${variant}] no pageErrors`, pageErrors.length === 0, pageErrors.join(' | ').slice(0, 200));
      report(`[${label}] [${variant}] no other-town leakage (OtroCondado absent)`, variant !== 'bad' || !r.h1.includes('OtroCondado'), r.h1.slice(0, 120));
    }
  }
}

// ---------- Barrido: todos los canónicos publicables en ok-bridge ----------
console.log('\n== sweep: 47 canónicos (ok-bridge)');
let swept = 0;
for (const { label, file } of canonicos()) {
  const raw = readFileSync(file, 'utf8');
  const has = rawTokens(raw);
  const { r, pageErrors } = await load(raw, OK_BRIDGE, 1200);
  const h1Ok = !has.h1 || r.h1.includes('TestCounty');
  const h2Ok = !has.h2 || (r.h2Present && r.h2.includes('TestCounty'));
  const h3Ok = r.h3County.length >= has.h3Count;
  const rawOk = r.rawHeadings.length === 0;
  const errOk = pageErrors.length === 0;
  const ok = h1Ok && h2Ok && h3Ok && rawOk && errOk;
  const detail = [
    has.h1 ? `h1 ${h1Ok ? 'ok' : 'NO (' + r.h1.slice(0, 60) + ')'}` : 'h1 n/a',
    has.h2 ? `h2 ${h2Ok ? 'ok' : 'NO'}` : 'h2 n/a',
    has.h3Count ? `h3 ${r.h3County.length}/${has.h3Count}` : 'h3 n/a',
    `raw ${r.rawHeadings.length}`,
    `err ${pageErrors.length}`,
  ].join(' · ');
  report(`[sweep] ${label}`, ok, detail);
  if (ok) console.log(`        ${detail}`);
  swept += 1;
}

await browser.close();
console.log(`\nsweep: ${swept} canónicos`);
console.log(anyFail ? '\nRESULTADO: FAIL' : '\nRESULTADO: ALL GREEN');
process.exit(anyFail ? 1 : 0);
