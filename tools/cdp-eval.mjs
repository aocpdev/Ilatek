#!/usr/bin/env node
/**
 * Evalúa JavaScript en una pestaña del Chrome del propietario (CDP 9222) sin
 * Playwright: solo fetch + WebSocket nativos de Node.
 *
 * Uso:
 *   node tools/cdp-eval.mjs --match page-builder --js "document.title"
 *   node tools/cdp-eval.mjs --match app.gohighlevel --file tmp/expr.js
 *
 * Imprime el resultado como JSON. No navega, no cierra pestañas.
 */
import fs from 'node:fs';

const args = {};
for (let i = 2; i < process.argv.length; i += 2) {
  const k = process.argv[i].replace(/^--/, '');
  const v = process.argv[i + 1];
  if (v === undefined || v.startsWith('--')) { args[k] = true; i--; } else args[k] = v;
}

const BASE = 'http://localhost:9222';
const MATCH = args.match || '';
const expr = args.file ? fs.readFileSync(args.file, 'utf8') : args.js;
if (!expr) { console.error('Falta --js o --file'); process.exit(1); }

const targets = await (await fetch(BASE + '/json/list')).json();
const pages = targets.filter((t) => t.type === 'page' || t.type === 'iframe');
const target = pages.find((t) => (t.url || '').includes(MATCH)) || pages[0];
if (!target) {
  console.error('Sin pestañas disponibles. Abre GHL en el Chrome del puerto 9222.');
  process.exit(2);
}
if (args.verbose) console.error('target:', target.type, target.url);

const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error('CDP connect failed')); });

let id = 0;
const pending = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    const { res, rej } = pending.get(m.id);
    pending.delete(m.id);
    m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result);
  }
};
const send = (method, params = {}) => new Promise((res, rej) => {
  const mid = ++id;
  pending.set(mid, { res, rej });
  ws.send(JSON.stringify({ id: mid, method, params }));
});

await send('Runtime.enable');
const r = await send('Runtime.evaluate', {
  expression: expr,
  awaitPromise: true,
  returnByValue: true,
  userGesture: true,
});

if (r.exceptionDetails) {
  console.error('EXCEPTION:', r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  process.exit(3);
}
console.log(JSON.stringify(r.result.value, null, 2));
ws.close();
