// Ilatek · Blog · tarjeta social por página (1200×630).
// Fuente: el plan de assets/social (fuera de blog/) y las copias ya subidas a la
// Media Library de GHL. El blog no genera tarjetas: solo resuelve cuál le toca a
// cada ruta para el og:image y el ImageObject del schema.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BLOG = path.resolve(HERE, '..');
const PLAN = path.resolve(BLOG, '..', 'assets/social/plan.json');

const fallbackUrl = (rel) => 'https://cdn.jsdelivr.net/gh/aocpdev/Ilatek@main/' + String(rel).replace(/^\/+/, '');

const { cards, media } = (() => {
  let cards = [];
  let media = {};
  try { cards = JSON.parse(fs.readFileSync(PLAN, 'utf8')).cards || []; } catch { cards = []; }
  try { media = JSON.parse(fs.readFileSync(path.join(BLOG, 'data/ghl-media.json'), 'utf8')).files || {}; } catch { media = {}; }
  return { cards, media };
})();

const BY_PATH = new Map(cards.map((c) => [c.path, c]));

/** Tarjeta social de una ruta del blog, o null si el plan no la tiene. */
export function cardFor(pathname) {
  const c = BY_PATH.get(pathname);
  if (!c) return null;
  const rel = String(c.card).replace(/^\/+/, '');
  const url = media[rel]?.url || fallbackUrl(rel);
  return { url, alt: c.alt, width: 1200, height: 630 };
}

/** Igual que cardFor, pero lanza si falta: para el build, donde no se admite silencio. */
export function requireCard(pathname) {
  const c = cardFor(pathname);
  if (!c) throw new Error('falta tarjeta social para ' + pathname);
  return c;
}
