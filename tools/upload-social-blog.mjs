// Ilatek · sube las tarjetas sociales del blog a la Media Library de GHL dentro de
// una carpeta propia, y deja el mapa blog/data/ghl-media.json al día.
//
// Uso: node tools/upload-social-blog.mjs [--folder "Blog · Tarjetas sociales · nov 2026"] [--dry]
// Token: ZJ_GHL_PIT en el entorno o en Ilatek/tmp-ghl-pit.txt (fuera de git).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const API = 'https://services.leadconnectorhq.com';
const VERSION = '2021-07-28';
const LOCATION_ID = '8OxUENFVM60EKzqsTcoD';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const PLAN = path.join(ROOT, 'assets/social/plan.json');
const MEDIA_MAP = path.join(ROOT, 'blog/data/ghl-media.json');

const arg = (flag, fallback) => {
  const i = process.argv.indexOf(flag);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
};
const DRY = process.argv.includes('--dry');
const FOLDER = arg('--folder', 'Blog · Tarjetas sociales · nov 2026');

function token() {
  if (process.env.ZJ_GHL_PIT) return process.env.ZJ_GHL_PIT.trim();
  try {
    const txt = fs.readFileSync(path.join(ROOT, 'tmp-ghl-pit.txt'), 'utf8');
    const line = txt.split('\n').find((l) => l.startsWith('ZJ_GHL_PIT='));
    if (line) return line.slice('ZJ_GHL_PIT='.length).trim();
  } catch {}
  return '';
}

const T = token();
if (!T) {
  console.error('Falta el token: define ZJ_GHL_PIT o crea Ilatek/tmp-ghl-pit.txt con ZJ_GHL_PIT=...');
  process.exit(3);
}

const api = async (pathname, init = {}) => {
  const res = await fetch(API + pathname, {
    ...init,
    headers: { Authorization: `Bearer ${T}`, Version: VERSION, Accept: 'application/json', ...(init.headers || {}) },
  });
  const body = await res.text();
  let json;
  try { json = JSON.parse(body); } catch { json = null; }
  return { ok: res.ok, status: res.status, json, body };
};

// 1. Carpeta: se reutiliza si ya existe con ese nombre en la raíz.
async function ensureFolder() {
  const list = await api(`/medias?altId=${LOCATION_ID}&altType=location&fetchAll=true`);
  const items = [];
  const walk = (node) => {
    for (const item of node || []) {
      if (item.type === 'folder' && item.name === FOLDER) items.push(item);
      if (item.children) walk(item.children);
    }
  };
  walk(list.json?.files || list.json?.data || []);
  if (items.length) {
    console.log(`Carpeta existente: ${FOLDER} (${items[0].id || items[0]._id})`);
    return items[0].id || items[0]._id;
  }
  const created = await api('/medias/folder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ altId: LOCATION_ID, altType: 'location', name: FOLDER }),
  });
  const id = created.json?.id || created.json?._id || created.json?.folder?.id;
  if (!created.ok || !id) {
    console.error(`No se pudo crear la carpeta (HTTP ${created.status}): ${created.body.slice(0, 300)}`);
    process.exit(2);
  }
  console.log(`Carpeta creada: ${FOLDER} (${id})`);
  return id;
}

const plan = JSON.parse(fs.readFileSync(PLAN, 'utf8'));
const cards = plan.cards.filter((c) => c.path.startsWith('/blog'));
const map = JSON.parse(fs.readFileSync(MEDIA_MAP, 'utf8'));

if (DRY) {
  console.log(`[dry] ${cards.length} tarjetas irían a la carpeta "${FOLDER}"`);
  process.exit(0);
}

const folderId = await ensureFolder();

let subidas = 0;
let fallos = 0;
for (const card of cards) {
  const file = path.join(ROOT, card.card);
  if (!fs.existsSync(file)) { console.error(`falta ${card.card}`); fallos++; continue; }
  const name = 'ilatek-' + card.name + '.webp';
  const form = new FormData();
  form.append('file', new Blob([fs.readFileSync(file)], { type: 'image/webp' }), name);
  form.append('name', name);
  form.append('parentId', folderId);
  const res = await api('/medias/upload-file', { method: 'POST', body: form });
  const url = res.json?.url;
  const fileId = res.json?.fileId || res.json?.id;
  if (!res.ok || !url) {
    console.error(`✗ ${name}: HTTP ${res.status} ${String(res.body).slice(0, 160)}`);
    fallos++;
    continue;
  }
  map.files[card.card] = { url, fileId, name, folder: FOLDER, subido: new Date().toISOString() };
  subidas++;
  if (subidas % 20 === 0) console.log(`  ${subidas}/${cards.length}`);
}

map.generado = new Date().toISOString();
fs.writeFileSync(MEDIA_MAP, JSON.stringify(map, null, 2) + '\n', 'utf8');
console.log(`Subidas: ${subidas}/${cards.length} · fallos: ${fallos} · carpeta: ${FOLDER}`);
if (fallos) process.exitCode = 1;
