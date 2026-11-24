// Ilatek · diversifica los anchors exactos hacia /sellado-de-techos.
// Regla: un solo enlace contextual por bloque (<p>/<li>); los siguientes se
// desenvuelven y conservan su texto. Nav, header, footer, scripts y estilos no
// se tocan. Es idempotente: si ya no quedan anchors exactos, no cambia nada.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, structure } from './site-paths.mjs';

const EXACT = /^sellado de techos? en puerto rico$/i;
const MONEY_HREF = /href="[^"]*\/sellado-de-techos(?=["#?])[^"]*"/i;
const VARIANTS = [
  'Cómo sellar un techo en Puerto Rico',
  'Guía de sellado de techos en Puerto Rico',
  'Sellado e impermeabilización de techos',
  'Precios y sistemas para sellar un techo',
  'Servicio de sellado de techos de Ilatek',
  'Cómo proteger tu techo de las filtraciones',
];

const stripTags = (s) => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
function pick(file, seed) {
  let h = 2166136261;
  const input = file + '|' + seed;
  for (let i = 0; i < input.length; i++) { h ^= input.charCodeAt(i); h = Math.imul(h, 16777619); }
  return VARIANTS[Math.abs(h) % VARIANTS.length];
}

function processHtml(html, file) {
  const stash = [];
  const protect = (re) => {
    html = html.replace(re, (m) => `\u0000${stash.push(m) - 1}\u0000`);
  };
  protect(/<!-- ILATEK:SHELL:(HEADER|FOOTER):START -->[\s\S]*?<!-- ILATEK:SHELL:\1:END -->/g);
  protect(/<nav\b[\s\S]*?<\/nav>/gi);
  protect(/<header\b[\s\S]*?<\/header>/gi);
  protect(/<footer\b[\s\S]*?<\/footer>/gi);
  protect(/<script\b[\s\S]*?<\/script>/gi);
  protect(/<style\b[\s\S]*?<\/style>/gi);

  let n = 0;
  // 1) Bloques p/li: el primer enlace exacto se diversifica; los demás se
  //    desenvuelven para dejar un solo enlace contextual por bloque.
  html = html.replace(/<(p|li)\b[^>]*>[\s\S]*?<\/\1>/gi, (block) => {
    let seen = 0;
    return block.replace(/<a\b[^>]*href="[^"]*\/sellado-de-techos(?=["#?])[^"]*"[^>]*>([\s\S]*?)<\/a>/gi, (m, inner) => {
      const text = stripTags(inner);
      if (!EXACT.test(text)) return m;
      seen++;
      n++;
      if (seen > 1) return inner;
      return m.replace(inner, pick(file, text + n));
    });
  });

  // 2) Anchors exactos restantes fuera de p/li (CTA en div, etc.).
  html = html.replace(/<a\b[^>]*href="[^"]*\/sellado-de-techos(?=["#?])[^"]*"[^>]*>([\s\S]*?)<\/a>/gi, (m, inner) => {
    const text = stripTags(inner);
    if (!EXACT.test(text)) return m;
    n++;
    return m.replace(inner, pick(file, text + n));
  });

  html = html.replace(/\u0000(\d+)\u0000/g, (_, i) => stash[Number(i)]);
  return { html, n };
}

const files = [...new Set([
  ...structure.pages.map((p) => p.file),
  'resenas/ghl-resenas-landing.html',
  'garantia/ILATEK-Garantias.html',
  'ghl-footer-embed.html',
  'componentes/ghl-nav-embed.html',
])];

let changed = 0, total = 0;
for (const rel of files) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) continue;
  const before = fs.readFileSync(full, 'utf8');
  const { html, n } = processHtml(before, rel);
  if (n > 0) {
    total += n;
    if (html !== before) { fs.writeFileSync(full, html, 'utf8'); changed++; }
    console.log(`${rel}: ${n} anchors exactos diversificados`);
  }
}
console.log(`Anchors: ${total} diversificados en ${changed} archivos.`);
