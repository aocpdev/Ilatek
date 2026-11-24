#!/usr/bin/env node
/**
 * Anexa el guard anti-spam (#ilatek-clima / cotizador) al head tracking de cada funnel.
 *
 * El head es por funnel (`tracking_code_head`), así que "global" = el mismo bloque en todos.
 * Nunca reescribe lo existente: concatena el bloque al final y guarda un respaldo completo
 * de los ajustes de cada funnel antes de tocar nada.
 *
 * El API público no expone escritura de funnels, así que usa el API interno de la app
 * (POST /funnels/funnel/update-settings) con el `token-id` de la sesión de GHL abierta en
 * el Chrome de depuración (perfil C:\ghl-profile, puerto 9222 — ver start-chrome-debug.bat).
 *
 * Uso:
 *   node tools/ghl-antispam-head.mjs                     # dry-run: cobertura y qué cambiaría
 *   node tools/ghl-antispam-head.mjs --inspect --only <id>   # ajustes del funnel
 *   node tools/ghl-antispam-head.mjs --url --only <id>       # URL pública del funnel
 *   node tools/ghl-antispam-head.mjs --apply --only <id>     # canario
 *   node tools/ghl-antispam-head.mjs --apply --all           # lote (200)
 *   node tools/ghl-antispam-head.mjs --verify
 *   node tools/ghl-antispam-head.mjs --restore documentacion/activacion-municipios/backups/heads-antes-*.json
 *
 * Requisitos: Chrome con CDP en 9222 y sesión iniciada en la subcuenta.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { chromium } from 'playwright-core';

const ROOT = path.resolve(import.meta.dirname, '..');
const GUARD = path.join(ROOT, 'documentacion/activacion-municipios/antispam-head.html');
const BACKUP_DIR = path.join(ROOT, 'documentacion/activacion-municipios/backups');
const MARK = 'ILATEK:ANTISPAM:START';
const INTERNAL = 'https://backend.leadconnectorhq.com';
const PUBLIC = 'https://services.leadconnectorhq.com';
let LOCATION = process.env.GHL_LOCATION || '8OxUENFVM60EKzqsTcoD';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/158.0.0.0 Safari/537.36';

const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (!a.startsWith('--')) continue;
  const k = a.slice(2);
  const v = process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[++i] : true;
  args[k] = v;
}

const guard = fs.readFileSync(GUARD, 'utf8').replace(/\s+$/, '');
const sha = (s) => crypto.createHash('sha256').update(s || '').digest('hex');
const short = (s) => sha(s).slice(0, 12);
const bytes = (s) => Buffer.byteLength(s || '');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function appToken() {
  if (process.env.GHL_TOKEN_ID) return process.env.GHL_TOKEN_ID;
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = browser.contexts()[0] || (await browser.newContext());
  const page = await ctx.newPage();
  await page.goto('https://app.gohighlevel.com/location/' + LOCATION + '/dashboard', { waitUntil: 'domcontentloaded', timeout: 40000 }).catch(() => {});
  await page.waitForTimeout(2500);
  const t = await page.evaluate(async () => {
    const rows = await new Promise((res) => {
      const r = indexedDB.open('firebaseLocalStorageDb');
      r.onsuccess = () => {
        try {
          const all = r.result.transaction('firebaseLocalStorage', 'readonly').objectStore('firebaseLocalStorage').getAll();
          all.onsuccess = () => res(all.result || []);
          all.onerror = () => res([]);
        } catch { res([]); }
      };
      r.onerror = () => res([]);
    });
    const row = rows.find((x) => x?.value?.stsTokenManager?.accessToken);
    return row ? row.value.stsTokenManager.accessToken : '';
  });
  await page.close();
  await browser.close();
  if (!t) throw new Error('Sin token: la sesión de GHL en el Chrome de depuración no está disponible (9222).');
  return t;
}

let TOKEN = '';
const H = () => ({
  'token-id': TOKEN, channel: 'APP', source: 'WEB_USER', version: '2021-07-28',
  origin: 'https://app.gohighlevel.com', accept: 'application/json', 'user-agent': UA
});

async function call(method, base, url, body) {
  const r = await fetch(base + url, { method, headers: { ...H(), ...(body ? { 'content-type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const text = await r.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* noop */ }
  return { ok: r.ok, status: r.status, json, text };
}

async function listFunnels() {
  const seen = new Map();
  let offset = 0;
  for (;;) {
    const res = await call('GET', INTERNAL, `/funnels/funnel/list?locationId=${LOCATION}&limit=200&offset=${offset}`);
    if (!res.ok) throw new Error(`list ${res.status}: ${res.text.slice(0, 200)}`);
    const page = res.json?.funnels || [];
    const before = seen.size;
    for (const f of page) if (!seen.has(f._id)) seen.set(f._id, f);
    if (seen.size >= (res.json?.total || 0) || seen.size === before || offset > 5000) break;
    offset += page.length || 200;
  }
  return [...seen.values()];
}

async function getFunnel(id) {
  const res = await call('GET', INTERNAL, `/funnels/funnel/${id}?locationId=${LOCATION}`);
  if (!res.ok) throw new Error(`get ${id} ${res.status}: ${res.text.slice(0, 200)}`);
  const j = res.json || {};
  const d = j._data || j;
  if (!d._id) d._id = j._id || j.id;
  return d;
}

/** Anexa el guard, o reemplaza solo su bloque si ya existe (idempotente). */
function withGuard(head) {
  const h = head || '';
  if (!h.includes(MARK)) return (h ? h + '\n\n' : '') + guard + '\n';
  const re = /<!--\s*ILATEK:ANTISPAM:START[\s\S]*?ILATEK:ANTISPAM:END\s*-->/;
  return re.test(h) ? h.replace(re, guard) : h;
}

function settingsFrom(d) {
  return {
    locationId: LOCATION,
    funnelId: d._id || d.id,
    funnelPath: d.url || '',
    funnelName: d.name || '',
    domainId: d.domain_id || '',
    faviconUrl: d.favicon_url || '',
    headTrackingCode: d.tracking_code_head || '',
    bodyTrackingCode: d.tracking_code_body || '',
    allowPaymentModeOption: true,
    paymentMode: true,
    imageOptimization: d.image_optimization !== false,
    isGdprCompliant: d.is_gdpr_compliant === true,
    isOptimisePageLoad: d.is_optimise_page_load !== false,
    stopAllSplitTestsAndReset: null,
    requireCreditCard: d.require_credit_card !== false,
    storeCurrencyFormatting: false,
    autoGenerateSchema: d.auto_generate_schema !== false
  };
}

const WATCH = (d) => JSON.stringify({
  name: d.name, url: d.url, domain_id: d.domain_id, favicon_url: d.favicon_url,
  chat_widget_id: d.chat_widget_id, tracking_code_body: d.tracking_code_body,
  is_gdpr_compliant: d.is_gdpr_compliant, is_optimise_page_load: d.is_optimise_page_load,
  require_credit_card: d.require_credit_card, image_optimization: d.image_optimization,
  auto_generate_schema: d.auto_generate_schema,
  /* is_chat_widget_live se omite a propósito: el chat público lo sirve GTM
     (gtm-chat-widget-tag.html), no el ajuste nativo del funnel, y guardar los
     settings lo deja en false sin afectar a la página. */
  is_live_payment_mode: d.is_live_payment_mode, order_form_version: d.order_form_version,
  steps: (d.steps || []).map((s) => s.id)
});

function backupFile() {
  const d = new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 13);
  return path.join(BACKUP_DIR, `heads-antes-${d}.json`);
}

function saveBackup(rows) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const f = backupFile();
  if (fs.existsSync(f)) return f;
  fs.writeFileSync(f, JSON.stringify({
    savedAt: new Date().toISOString(), locationId: LOCATION,
    note: 'ajustes completos (_data) de cada funnel antes de anexar el guard ILATEK:ANTISPAM',
    funnels: rows.map((d) => ({ id: d._id || d.id, data: d }))
  }, null, 2));
  return f;
}

async function applyOne(d) {
  const next = settingsFrom(d);
  next.headTrackingCode = withGuard(next.headTrackingCode);
  const res = await call('POST', INTERNAL, '/funnels/funnel/update-settings', next);
  if (!res.ok) return { ok: false, status: res.status, err: res.text.slice(0, 240) };
  await sleep(900);
  const after = await getFunnel(next.funnelId);
  const same = WATCH(after) === WATCH(d);
  const applied = (after.tracking_code_head || '').includes(MARK);
  return { ok: applied && same, applied, same, head: bytes(after.tracking_code_head), sha: short(after.tracking_code_head) };
}

async function mainFor() {
  TOKEN = await appToken();
  const funnels = await listFunnels();
  const pending = funnels.filter((f) => (f.trackingCodeHead || '') !== withGuard(f.trackingCodeHead));
  console.log(`funnels: ${funnels.length} · con guard al día: ${funnels.length - pending.length} · por actualizar: ${pending.length}`);
  console.log(`guard: ${bytes(guard)} B · sha256 ${short(guard)}`);

  if (!args.apply && !args.restore && !args.inspect && !args.url && !args.verify) {
    const sample = withGuard(funnels[0]?.trackingCodeHead || '');
    console.log(`head tras anexar: ${bytes(sample)} B · sha256 ${short(sample)}`);
    console.log('dry-run: no se escribió nada.');
    return;
  }
  if (args.verify) {
    for (const f of funnels.slice(0, 5)) {
      const h = f.trackingCodeHead || '';
      console.log(`  ${f.name.slice(0, 44).padEnd(44)} ${String(bytes(h)).padStart(6)} B · guard=${h.includes(MARK)} · gtm=${/GTM-PQMR2TDB/.test(h)} · ga4=${/G-BTVFHT1X8G/.test(h)} · pixel=${/2092249571384387/.test(h)}`);
    }
    console.log(`cobertura: ${funnels.length - pending.length}/${funnels.length}`);
    return;
  }

  if (args.url) {
    const id = String(args.only || '');
    const d = await getFunnel(id);
    const dom = await call('GET', INTERNAL, `/funnels/domain?locationId=${LOCATION}`);
    const match = (dom.json?.domains || dom.json || []).find?.((x) => x._id === d.domain_id || x.id === d.domain_id);
    const host = match ? (match.url || match.domain || '').replace(/^https?:\/\//, '').replace(/\/$/, '') : '';
    console.log(`${d.name} → https://${host || 'ilatekpr.com'}${d.url}`);
    return;
  }

  if (args.inspect) {
    const d = await getFunnel(String(args.only || ''));
    const s = settingsFrom(d);
    for (const [k, v] of Object.entries(s)) {
      if (/TrackingCode/.test(k)) console.log(`  ${k} = <${bytes(v)} B>`);
      else console.log(`  ${k} = ${JSON.stringify(v)}`);
    }
    console.log(`  head con guard = ${s.headTrackingCode.includes(MARK)}`);
    return;
  }

  if (args.restore) {
    const data = JSON.parse(fs.readFileSync(path.resolve(ROOT, String(args.restore)), 'utf8'));
    let ok = 0;
    for (const row of data.funnels) {
      const res = await call('POST', INTERNAL, '/funnels/funnel/update-settings', settingsFrom(row.data));
      if (!res.ok) { console.error(`  RESTORE FAIL ${row.id} ${res.status}`); continue; }
      ok++;
      await sleep(150);
    }
    console.log(`restaurados: ${ok}/${data.funnels.length}`);
    return;
  }

  // --apply
  const target = (args.all ? funnels : funnels.filter((f) => f._id === args.only || f.name === args.only))
    .filter((f) => args.force || (f.trackingCodeHead || '') !== withGuard(f.trackingCodeHead));
  if (!target.length) { console.error('No hay funnel que coincida con --only/--all.'); process.exit(1); }

  const rows = [];
  for (const f of target) rows.push(await getFunnel(f._id));
  const file = saveBackup(rows);
  console.log(`respaldo: ${path.relative(ROOT, file)}`);

  let ok = 0;
  const failed = [];
  for (const [i, d] of rows.entries()) {
    const r = await applyOne(d);
    if (r.ok) {
      ok++;
      process.stdout.write(`\r  aplicados ${ok}/${rows.length} (${String(d.name).slice(0, 38).padEnd(38)}) head ${r.head} B`);
    } else {
      failed.push({ id: d._id, name: d.name, ...r });
      console.error(`\n  FAIL ${d.name} status=${r.status || '-'} applied=${r.applied} intacto=${r.same} ${r.err || ''}`);
      if (rows.length === 1) process.exit(1);
    }
    await sleep(120);
    if (i === rows.length - 1) process.stdout.write('\n');
  }
  console.log(`aplicados: ${ok}/${rows.length} · fallidos: ${failed.length}`);
  if (failed.length) {
    fs.writeFileSync(path.join(BACKUP_DIR, `antispam-fallidos-${Date.now()}.json`), JSON.stringify(failed, null, 2));
  }
}

async function main() {
  if (!args['all-locations']) return mainFor();
  const locs = String(process.env.GHL_AGENCY_LOCATIONS || '')
    .split(',').map((s) => s.trim()).filter(Boolean);
  if (!locs.length) {
    console.error('--all-locations requiere la lista de subcuentas en GHL_AGENCY_LOCATIONS (separadas por comas)')
    console.error('y un token con alcance de agencia (GHL_TOKEN_ID o una sesión de agencia en el Chrome CDP).');
    console.error('El PIT del proyecto solo ve Ilatek - PR. Alternativa: pegar el mismo bloque de');
    console.error('documentacion/activacion-municipios/antispam-head.html en el head tracking de cada subcuenta.');
    process.exit(1);
  }
  for (const loc of locs) {
    LOCATION = loc;
    console.log(`\n== ${loc}`);
    await mainFor();
  }
}

main().catch((e) => { console.error(e.message); process.exit(1); });
