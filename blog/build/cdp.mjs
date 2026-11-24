// Controlador de la ventana externa de Chrome (puerto 9222).
// Uso: node blog/build/cdp.mjs eval "<expresion JS>"
//      node blog/build/cdp.mjs nav <url>
//      node blog/build/cdp.mjs shot <archivo.png>
//      node blog/build/cdp.mjs targets
import fs from 'node:fs';
const base = 'http://127.0.0.1:9222';
const cmd = process.argv[2] || 'eval';
const arg = process.argv[3] || '';
const list = await (await fetch(base + '/json/list')).json();
if (cmd === 'targets') {
  for (const t of list) console.log('[' + t.type + '] ' + t.title + ' :: ' + t.url);
  process.exit(0);
}
const pages = list.filter((t) => t.type === 'page' && !/^devtools:/.test(t.url));
const t = pages.find((p) => /gohighlevel|ilatekpr|highlevel/.test(p.url)) || pages[0];
if (!t) { console.error('sin pestanas'); process.exit(2); }
const ws = new WebSocket(t.webSocketDebuggerUrl);
await new Promise((r, j) => { ws.addEventListener('open', r, { once: true }); ws.addEventListener('error', j, { once: true }); });
let id = 0; const pend = new Map();
ws.addEventListener('message', (e) => { const d = JSON.parse(e.data); if (pend.has(d.id)) { pend.get(d.id)(d); pend.delete(d.id); } });
const call = (m, p = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
const cap = (p, ms) => Promise.race([p, new Promise((r) => setTimeout(() => r({ timeout: true }), ms))]);
if (cmd === 'nav') {
  const r = await cap(call('Page.navigate', { url: arg }), 20000);
  console.log('nav:', r.timeout ? 'TIMEOUT' : 'ok');
} else if (cmd === 'shot') {
  const r = await cap(call('Page.captureScreenshot', { format: 'png' }), 20000);
  if (r?.result?.data) { fs.writeFileSync(arg, Buffer.from(r.result.data, 'base64')); console.log('shot:', arg, fs.statSync(arg).size, 'bytes'); }
  else console.log('shot: FALLO', JSON.stringify(r).slice(0, 200));
} else {
  const r = await cap(call('Runtime.evaluate', { expression: arg, returnByValue: true, awaitPromise: true }), 15000);
  if (r?.timeout) console.log('TIMEOUT');
  else if (r?.result?.exceptionDetails) console.log('ERROR:', r.result.exceptionDetails.text, r.result.exceptionDetails.exception?.description?.slice(0, 300));
  else console.log(typeof r?.result?.result?.value === 'string' ? r.result.result.value : JSON.stringify(r?.result?.result?.value));
}
try { ws.close(); } catch {}
process.exit(0);
