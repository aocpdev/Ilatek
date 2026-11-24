// Repara los bloques @media del menú del blog por llaves balanceadas (tolera variantes de espaciado).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BLOG = path.resolve(HERE, '..');

const BODY_700 = ' #ilbj .ilbn-in{width:min(100% - 20px,1140px);flex-wrap:nowrap;gap:6px;padding:8px 0;min-height:56px} #ilbj .ilbn-brand span{display:none} #ilbj .ilbn-links{order:0;flex:1 1 auto;width:auto;min-width:0;margin:0 0 0 auto;padding-top:0;border-top:0;overflow-x:auto;overflow-y:hidden;flex-wrap:nowrap;gap:2px} #ilbj .ilbn-links a{flex:0 0 auto;display:inline-flex;align-items:center;min-height:36px;padding:7px 8px;white-space:nowrap;text-align:left} #ilbj .ilbn-cta{margin-left:0;padding:0 11px;min-height:36px} #ilbj .ilb-article h2,#ilbj .ilb-article h3{scroll-margin-top:120px}';
const BODY_420 = ' #ilbj .ilbn-links{gap:0} #ilbj .ilbn-links a{font-size:11.5px;padding:7px 5px} #ilbj .ilbn-brand img{width:30px;height:30px} #ilbj .ilbn-cta{padding:0 9px;font-size:11.5px}';

function replaceNavBlock(s, header, body) {
  let i = s.indexOf(header);
  while (i !== -1) {
    const open = s.indexOf('{', i);
    if (open === -1) return s;
    let depth = 0, end = -1;
    for (let k = open; k < s.length; k++) {
      if (s[k] === '{') depth++;
      else if (s[k] === '}') { depth--; if (depth === 0) { end = k + 1; break; } }
    }
    if (end === -1) return s;
    const block = s.slice(i, end);
    if (block.includes('.ilbn')) return s.slice(0, i) + header + '{' + body + '}' + s.slice(end);
    i = s.indexOf(header, i + header.length);
  }
  return s;
}

const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) files.push(p);
  }
})(BLOG);
files.push(path.join(HERE, 'render.mjs'));

let touched = 0, fixed700 = 0, fixed420 = 0;
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  if (!src.includes('#ilbj .ilbn-in{')) continue;
  let s = replaceNavBlock(src, '@media (max-width:700px)', BODY_700);
  if (s !== src) fixed700++;
  const mid = s;
  s = replaceNavBlock(s, '@media (max-width:420px)', BODY_420);
  if (s !== mid) fixed420++;
  if (s !== src) { fs.writeFileSync(f, s); touched++; }
}
console.log('archivos normalizados:', touched, '| bloques 700px:', fixed700, '| bloques 420px:', fixed420);
