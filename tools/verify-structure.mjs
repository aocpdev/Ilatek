// Read-only verification; --migration additionally requires unchanged original HTML.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import { ROOT, structure, projectPath } from './site-paths.mjs';
import { PAGES } from '../src/faq/faq-engine.mjs';
const failures = [];
const sha = b=>crypto.createHash('sha256').update(b).digest('hex');
const read = p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const check = (ok,msg)=>{if(!ok) failures.push(msg);};
let assets=0, backups=0, scripts=0, unchanged=0;
const mdFiles=[];
for (const [old,target] of Object.entries(structure.moves)) {
  check(fs.existsSync(projectPath(target)), `Missing destination: ${target}`);
  if (old !== 'README.md') check(!fs.existsSync(path.join(ROOT,old)), `Duplicate old file: ${old}`);
}
for (const p of structure.pages) {
  const html = read(p.file);
  const base = `${p.folder}/es`;
  const intact=sha(html)===p.originalSha256;
  if(intact) unchanged++;
  if(process.argv.includes('--migration')) check(intact,`HTML changed: ${p.file}`);
  for(const rel of ['SEO-GHL.md','seo.json','ASSETS.json','HEAD-TEMPLATE.html']) check(fs.existsSync(projectPath(`${base}/${rel}`)),`Missing pack file: ${base}/${rel}`);
  const seo=JSON.parse(read(`${base}/seo.json`));
  check(!!seo.metaTagTitle && !!seo.metaTagDescription && /^https:\/\//.test(seo.metaTagImage),`Incomplete SEO: ${base}`);
  const head=read(`${base}/HEAD-TEMPLATE.html`);
  check((head.match(/<title>/g)||[]).length===1,`HEAD titles: ${base}`);
  check((head.match(/rel="canonical"/g)||[]).length===1,`HEAD canonical: ${base}`);
  check(head.includes(seo.metaTagImage),`HEAD social mismatch: ${base}`);
  const inventory=JSON.parse(read(`${base}/ASSETS.json`));
  const inventoryUrls = new Set(inventory.assets.map(a=>a.publicUrl));
  const mediaUrls=[...new Set((html+head).match(/https?:\/\/[^\s"'<>`)]+?\.(?:png|jpe?g|webp|gif|svg|mp4)(?:\?[^\s"'<>`)]*)?(?=[\s"'<>`)]|$)/gi)||[])];
  check(mediaUrls.every(u=>inventoryUrls.has(u.replace(/&amp;/g,'&'))),`Media missing from inventory: ${base}`);
  for(const a of inventory.assets) {
    check(!!a.file,`No local backup: ${base} ${a.publicUrl}`);
    if(!a.file) continue;
    const file=projectPath(`${base}/${a.file}`);
    check(fs.existsSync(file),`Missing media: ${file}`);
    if(!fs.existsSync(file)) continue;
    const bytes=fs.readFileSync(file);
    check(bytes.length===a.bytes && sha(bytes)===a.sha256,`Media hash mismatch: ${file}`);
    assets++;
    if(a.status==='local-optimized-backup') backups++;
  }
  for(const s of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if(/\bsrc\s*=/.test(s[1]) || !s[2].trim()) continue;
    try {
      if(/application\/ld\+json/.test(s[1])) JSON.parse(s[2]);
      else if(!/type=["']module/.test(s[1])) new vm.Script(s[2]);
      scripts++;
    } catch(e) { failures.push(`Script syntax: ${p.file}: ${e.message}`); }
  }
  mdFiles.push(`${p.folder}/README.md`, `${p.folder}/en/README.md`,`${base}/SEO-GHL.md`);
}
for(const p of PAGES) check(fs.existsSync(p.file),`FAQ source missing: ${p.file}`);
mdFiles.push('README.md','categorias/README.md','servicios/README.md','documentacion/MAPA-DE-PAGINAS.md','documentacion/ESTRUCTURA.md');
for(const rel of mdFiles) {
  for(const m of read(rel).matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const href=m[1];
    if(/^(?:https?:|#)/.test(href)) continue;
    check(fs.existsSync(path.resolve(ROOT,path.dirname(rel),href.split('#')[0])),`Broken documentation link: ${rel} -> ${href}`);
  }
}
console.log(JSON.stringify({pages:structure.pages.length,unchangedHtml:unchanged,mediaCopies:assets,
  optimizedBackups:backups,scriptBlocksParsed:scripts,faqSources:PAGES.length,failures},null,2));
if(failures.length) process.exitCode=1;
