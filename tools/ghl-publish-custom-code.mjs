#!/usr/bin/env node
/**
 * Publica un bloque de código en el Custom Code de una página de GHL usando el
 * Chrome del propietario (CDP en el puerto 9222). GHL no tiene API pública para
 * editar contenido de páginas, así que este script hace lo mismo que una persona
 * en el builder: abre el editor de código del elemento, anexa el bloque, guarda y
 * publica la página.
 *
 * Uso:
 *   node tools/ghl-publish-custom-code.mjs \
 *     --page GV7PWESENVKtDXU8kN6w \
 *     --code mpH_lwWunP \
 *     --file documentacion/bloques/cotizador-webhook-calendario.html \
 *     --url https://ilatekpr.com/cotizacion \
 *     --marker ilag-agendar
 *
 * Requisitos: Chrome abierto con --remote-debugging-port=9222 y sesión iniciada
 * en la subcuenta. El script no cierra pestañas ni toca otros elementos de la página.
 */
import fs from 'node:fs';
import path from 'node:path';

const args = {};
for (let i = 2; i < process.argv.length; i += 2) {
  const k = process.argv[i].replace(/^--/, '');
  args[k] = process.argv[i + 1];
}
const LOCATION = args.location || '8OxUENFVM60EKzqsTcoD';
const PAGE = args.page;
const CODE = args.code;
const FILE = args.file;
const LIVE = args.url;
const MARKER = args.marker || 'ilag-agendar';
if (!PAGE || !FILE) {
  console.error('Faltan --page y --file. Ver el comentario de cabecera.');
  process.exit(1);
}
const block = fs.readFileSync(path.resolve(FILE), 'utf8');
const b64 = Buffer.from(block, 'utf8').toString('base64');
const BASE = 'http://localhost:9222';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function targets() {
  const r = await fetch(BASE + '/json/list');
  return r.json();
}

async function openBuilder() {
  const url = `https://app.gohighlevel.com/location/${LOCATION}/page-builder/${PAGE}`;
  await fetch(BASE + '/json/new?' + encodeURIComponent(url), { method: 'PUT' });
  for (let i = 0; i < 20; i++) {
    await sleep(2000);
    const t = (await targets()).find((x) => x.type === 'iframe' && (x.url || '').includes(`page-builder.leadconnectorhq.com/location/${LOCATION}/page-builder/${PAGE}`));
    if (t) return t;
  }
  throw new Error('El iframe del builder no cargó');
}

async function attach(t) {
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
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
  const send = (method, params = {}) => new Promise((res, rej) => { const mid = ++id; pending.set(mid, { res, rej }); ws.send(JSON.stringify({ id: mid, method, params })); });
  await send('Runtime.enable');
  return {
    send,
    async eval(expression) {
      const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true, userGesture: true });
      if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
      return r.result.value;
    },
    close() { try { ws.close(); } catch {} }
  };
}

const target = await openBuilder();
const page = await attach(target);

// 1) Abrir el editor del Custom Code indicado
await page.eval(`(async () => {
  const el = document.getElementById('custom-code-${CODE}');
  if (!el) throw new Error('No se encontró el custom code ${CODE}');
  el.scrollIntoView({ block: 'center' });
  const r = el.getBoundingClientRect();
  for (const type of ['mousedown', 'mouseup', 'click']) el.dispatchEvent(new MouseEvent(type, { bubbles: true, clientX: r.x + 20, clientY: r.y + 20 }));
  await new Promise(res => setTimeout(res, 2500));
  const open = [...document.querySelectorAll('button,div[role=button],span,a')].find(n => /^open code editor$/i.test((n.innerText || '').trim()) && n.getBoundingClientRect().width > 0);
  if (open) open.click();
  await new Promise(res => setTimeout(res, 2000));
})()`);

// 2) Anexar el bloque (idempotente por marcador) sin tocar el código existente
const applied = await page.eval(`(() => {
  const cmEl = document.querySelector('.CodeMirror');
  if (!cmEl || !cmEl.CodeMirror) throw new Error('El editor de código no está abierto');
  const cm = cmEl.CodeMirror, old = cm.getValue();
  if (old.includes('${MARKER}')) return { skip: true, len: old.length };
  const bin = atob(${JSON.stringify(b64)});
  const text = new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0)));
  cm.setValue(old.replace(/\\s+$/, '') + String.fromCharCode(10, 10) + text);
  return { len: cm.getValue().length };
})()`);
console.log('Anexar:', JSON.stringify(applied));

// 3) Guardar y publicar
const saved = await page.eval(`(async () => {
  const modal = document.querySelector('.n-modal-container');
  if (!modal) return { error: 'sin modal' };
  const btns = [...modal.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0);
  const target = btns.find(b => /^(save|save & close|apply|update)$/i.test((b.innerText || '').trim())) || btns[btns.length - 1];
  target.click();
  await new Promise(r => setTimeout(r, 3000));
  return { clicked: (target.innerText || '').trim() };
})()`);
console.log('Guardar:', JSON.stringify(saved));
await sleep(2500);

const pub = await page.eval(`(async () => {
  const btn = [...document.querySelectorAll('button')].find(b => /^publish$/i.test((b.innerText || '').trim()) && b.getBoundingClientRect().width > 0);
  if (!btn) return { error: 'sin botón Publish' };
  btn.click();
  await new Promise(r => setTimeout(r, 4000));
  for (const m of document.querySelectorAll('.n-modal-container,[role=dialog]')) {
    const ok = [...m.querySelectorAll('button')].find(b => /^(publish|publish now|confirm)$/i.test((b.innerText || '').trim()));
    if (ok) { ok.click(); break; }
  }
  await new Promise(r => setTimeout(r, 8000));
  return { ok: true };
})()`);
console.log('Publicar:', JSON.stringify(pub));
page.close();

// 4) Verificar la página publicada
if (LIVE) {
  for (let i = 0; i < 4; i++) {
    const res = await fetch(LIVE + '?cb=' + Date.now(), { headers: { 'cache-control': 'no-cache' } });
    const html = await res.text();
    const ok = html.includes(MARKER);
    console.log(`Live ${LIVE}: HTTP ${res.status} · ${html.length} bytes · marcador ${MARKER}: ${ok ? 'presente' : 'ausente'}`);
    if (ok) break;
    await sleep(8000);
  }
}
