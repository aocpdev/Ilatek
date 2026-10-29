// Read-only public-site audit. No authenticated endpoints, saves, or publishing.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { ROOT, structure } from './site-paths.mjs';

const out = path.join(ROOT, 'documentacion/publicacion-custom-values-2026-10-28');
fs.mkdirSync(path.join(out, 'respaldos'), {recursive:true});
const pages = structure.pages.map(p => ({slug:p.slug, file:p.file, url:'https://ilatekpr.com/'+(p.slug==='home'?'':p.slug)}));
const results=[];
function attrs(tag){
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map(m=>[m[1],m[2]??m[3]]));
}
async function inspect(p){
  try {
    const response=await fetch(p.url,{signal:AbortSignal.timeout(45000)});
    const html=await response.text();
    const name=p.slug+'-publicado-antes.html';
    const backup=path.join(out,'respaldos',name);
    if(!fs.existsSync(backup))fs.writeFileSync(backup,html);
    // Ignore JavaScript strings and hydration JSON: they are not DOM metadata.
    const markup=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'');
    const head=markup.split(/<\/head>/i)[0];
    const values=[...markup.matchAll(/data-(?:business-email|business-phone|location-label|website-url|facebook-url|instagram-url)\s*=\s*"[^"]*"/g)].map(m=>m[0]);
    const bridges=[...markup.matchAll(/<p\b[^>]*(?:dv-ghl-values)[^>]*>([\s\S]*?)<\/p>/g)].map(m=>m[1].replace(/<[^>]*>/g,''));
    const meta=[...head.matchAll(/<(?:meta|link)\b[^>]*>/gi)].map(m=>attrs(m[0])).filter(a=>['description','robots'].includes(a.name)||a.property?.startsWith('og:')||a.name?.startsWith('twitter:')||a.rel==='canonical');
    const titles=[...head.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)].map(m=>m[1]);
    results.push({...p,status:response.status,finalUrl:response.url,sha256:crypto.createHash('sha256').update(html).digest('hex'),backup:'respaldos/'+name,titles,meta,values,bridges,unresolvedAttributes:values.filter(s=>s.includes('{{')).length,hasCustomBridge:html.includes('window.ILATEK_BRIDGE'),publication:'not-modified'});
    console.log(p.slug,response.status,values.filter(s=>s.includes('{{')).length+' unresolved attributes');
  }catch(e){results.push({...p,error:e.message,publication:'not-modified'});console.log(p.slug,e.message)}
}
let cursor=0;
await Promise.all(Array.from({length:4},async()=>{while(cursor<pages.length)await inspect(pages[cursor++])}));
results.sort((a,b)=>a.slug.localeCompare(b.slug));
fs.writeFileSync(path.join(out,'auditoria-publica.json'),JSON.stringify({checkedAt:new Date().toISOString(),locationId:'8OxUENFVM60EKzqsTcoD',websiteId:'XG0ggFh3pBPpA5s0Pe37',scope:'47 catalog pages; not the full 60-page GHL inventory',results},null,2)+'\n');
console.log(JSON.stringify({pages:results.length,ok:results.filter(r=>r.status===200).length,unresolved:results.filter(r=>r.unresolvedAttributes>0).length,errors:results.filter(r=>r.error).length}));
