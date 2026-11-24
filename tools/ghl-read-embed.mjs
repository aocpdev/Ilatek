#!/usr/bin/env node
/**
 * Lee (NO escribe) el Custom HTML/JavaScript de una página del website de GHL
 * usando el Chrome del propietario por CDP, y lo guarda en un archivo.
 * Abre el editor de código, copia el valor por trozos y cierra con Escape.
 * No guarda ni publica nada en GHL.
 *
 * Uso: node tools/ghl-read-embed.mjs --page <pageId> --out <archivo.html>
 */
import fs from 'node:fs';

const args = {};
for (let i = 2; i < process.argv.length; i += 2) {
  const k = process.argv[i].replace(/^--/, '');
  const v = process.argv[i + 1];
  if (v === undefined || v.startsWith('--')) { args[k] = true; i--; } else args[k] = v;
}
const PAGE = args.page;
const OUT = args.out;
const CHUNK = 150000;
if (!PAGE || !OUT) { console.error('Uso: --page <pageId> --out <archivo>'); process.exit(1); }

const BASE = 'http://localhost:9222';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const list = async () => (await (await fetch(BASE + '/json/list')).json());
let target = null;
for (let i = 0; i < 30; i++) {
  const all = await list();
  target = all.find((t) => t.type === 'iframe' && (t.url || '').includes('page-builder.leadconnectorhq.com') && (t.url || '').includes(PAGE))
        || all.find((t) => (t.url || '').includes('page-builder.leadconnectorhq.com') && (t.url || '').includes(PAGE));
  if (target) break;
  await sleep(2000);
}
if (!target) { console.error('No hay builder abierto para ' + PAGE + '. Abre su «Edit» en GHL.'); process.exit(2); }

const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error('ws')); });
let id = 0; const pending = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    const { res, rej } = pending.get(m.id);
    pending.delete(m.id);
    m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result);
  }
};
const send = (method, params = {}) => new Promise((res, rej) => {
  const mid = ++id; pending.set(mid, { res, rej });
  ws.send(JSON.stringify({ id: mid, method, params }));
});
await send('Runtime.enable');
const evaluate = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true, userGesture: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result.value;
};

let codes = [];
for (let i = 0; i < 20; i++) {
  codes = await evaluate(`[...document.querySelectorAll('[id^="custom-code-"]')].map(n => n.id)`);
  if (codes && codes.length) break;
  await sleep(2500);
}
if (!codes || !codes.length) { console.error('Sin elemento Custom Code en esta página'); process.exit(3); }
console.error('custom-code:', JSON.stringify(codes));

const opened = await evaluate(`(async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const el = document.querySelector('[id^="custom-code-"]');
  el.scrollIntoView({ block: 'center' });
  const r = el.getBoundingClientRect();
  for (const type of ['mousedown','mouseup','click']) el.dispatchEvent(new MouseEvent(type, { bubbles: true, clientX: r.x + 20, clientY: r.y + 20 }));
  await sleep(2000);
  const open = [...document.querySelectorAll('button,div[role=button],span,a')]
    .find(n => /^open code editor$/i.test((n.innerText || '').trim()) && n.getBoundingClientRect().width > 0);
  if (open) { open.click(); await sleep(3000); }
  const cm = document.querySelector('.CodeMirror');
  return { editor: !!(cm && cm.CodeMirror), len: cm && cm.CodeMirror ? cm.CodeMirror.getValue().length : 0 };
})()`);
if (!opened.editor) { console.error('El editor no se abrió:', JSON.stringify(opened)); process.exit(4); }
console.error('longitud del código:', opened.len);

let text = '';
for (let a = 0; a < opened.len; a += CHUNK) {
  const part = await evaluate(`document.querySelector('.CodeMirror').CodeMirror.getValue().substring(${a}, ${Math.min(a + CHUNK, opened.len)})`);
  text += part;
  console.error(`  leído ${Math.min(a + CHUNK, opened.len)}/${opened.len}`);
}
fs.writeFileSync(OUT, text, 'utf8');
console.log(JSON.stringify({ page: PAGE, out: OUT, bytes: Buffer.byteLength(text, 'utf8'), len: text.length }, null, 2));

await evaluate(`document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, bubbles: true }))`);
ws.close();
