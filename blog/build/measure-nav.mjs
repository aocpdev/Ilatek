// Mide el menú del blog en anchos reales (una línea, contenido, sin desbordar).
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FILE = pathToFileURL(path.resolve(HERE, '../embeds/preguntas-frecuentes.html')).href;

const list = await fetch('http://127.0.0.1:9222/json/list').then((r) => r.json());
const page = list.find((t) => t.type === 'page');
if (!page) throw new Error('sin pestaña de página en 9222');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((res) => ws.addEventListener('open', res));
let seq = 0;
const pending = new Map();
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
});
const send = (method, params = {}) => new Promise((r) => { const id = ++seq; pending.set(id, r); ws.send(JSON.stringify({ id, method, params })); });

await send('Page.enable');
await send('Runtime.enable');
const EXPR = `(() => {
  const bar = document.querySelector('#ilatek-nav .ilbn-in');
  const strip = document.querySelector('#ilatek-nav .ilbn-links');
  const links = [...document.querySelectorAll('#ilatek-nav .ilbn-links a')];
  if (!bar) return 'sin menu';
  const r = bar.getBoundingClientRect();
  const cta = document.querySelector('#ilatek-nav .ilbn-cta').getBoundingClientRect();
  const tops = [...new Set(links.map(a => Math.round(a.getBoundingClientRect().top)))];
  const bottoms = links.map(a => Math.round(a.getBoundingClientRect().bottom));
  return JSON.stringify({
    ancho: innerWidth,
    altoBarra: Math.round(r.height),
    filasDeEnlaces: tops.length,
    enlaces: links.length,
    altoMaxEnlace: Math.max(...bottoms) - Math.min(...tops),
    scrollEnFranja: strip.scrollWidth - strip.clientWidth,
    ctaDentro: Math.round(cta.right) <= Math.round(r.right) + 1,
    barraDesborda: document.documentElement.scrollWidth > innerWidth,
  });
})()`;

for (const w of [320, 360, 414, 768, 1100, 1440]) {
  await send('Emulation.setDeviceMetricsOverride', { width: w, height: 820, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: FILE });
  await new Promise((r) => setTimeout(r, 1100));
  const out = await send('Runtime.evaluate', { expression: EXPR, returnByValue: true });
  console.log(String(w).padStart(5) + ' px  ' + (out.result?.result?.value ?? JSON.stringify(out)));
}
await send('Emulation.clearDeviceMetricsOverride');
ws.close();
