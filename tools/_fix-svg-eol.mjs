#!/usr/bin/env node
// Convierte a LF los SVGs de media cuyo sha256 registrado en ASSETS.json
// coincide con la versión LF: core.autocrlf=true los dejó con CRLF en disco.
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
const pages = JSON.parse(fs.readFileSync('docs/estructura.json', 'utf8')).pages;
let fixed = 0, checked = 0, noMatch = 0;
for (const p of pages) {
  const dir = p.folder;
  const invPath = path.join(dir, 'es', 'ASSETS.json');
  if (!fs.existsSync(invPath)) continue;
  const inv = JSON.parse(fs.readFileSync(invPath, 'utf8'));
  for (const a of inv.assets) {
    if (!a.file || !/\.svg$/.test(a.file)) continue;
    const file = path.join(dir, 'es', a.file);
    checked++;
    let b;
    try { b = fs.readFileSync(file); } catch { continue; }
    const txt = b.toString('utf8').replace(/\r\n/g, '\n');
    const shaLF = crypto.createHash('sha256').update(txt, 'utf8').digest('hex');
    const shaDisk = crypto.createHash('sha256').update(b).digest('hex');
    if (shaDisk === a.sha256) continue; // ya coincide
    if (shaLF === a.sha256) {
      fs.writeFileSync(file, txt, 'utf8');
      fixed++;
    } else {
      noMatch++;
      console.log('SIN MATCH (ni disco ni LF):', file);
    }
  }
}
console.log(`checked=${checked} fixed=${fixed} noMatch=${noMatch}`);
