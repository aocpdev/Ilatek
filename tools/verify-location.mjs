import fs from 'node:fs';
import assert from 'node:assert/strict';
import { ROOT, structure } from './site-paths.mjs';
import { deliveryFiles } from './internal-link-contract.mjs';
import { COUNTY, localizeText, localizeHtml } from './location-contract.mjs';
import { buildPage } from '../techos/lib/page.mjs';
import { buildTree } from '../techos/lib/model.mjs';
const read=f=>fs.readFileSync(ROOT+'/'+f,'utf8');
let images=0,decorative=0;
const attr=(tag,name)=>tag.match(new RegExp('\\s'+name+'=(["\'])(.*?)\\1','s'))?.[2];
function audit(html,label){
  html=html.replace(/<!-- ILATEK:INTERNAL-LINKS:START -->[\s\S]*?<!-- ILATEK:INTERNAL-LINKS:END -->/g,'');
  for(const tag of html.match(/<img\b[^>]*>/gi)||[]){
    assert.ok(!/['"]\s*\+|\$\{/.test(tag),label+': unmanaged dynamic image');
    images++;
    const alt=attr(tag,'alt'),title=attr(tag,'title');
    const deco=alt===''||/\baria-hidden=["']true/.test(tag);
    if(deco)decorative++;
    else assert.ok(alt?.includes(COUNTY),label+': missing local alt: '+alt);
    if(!deco||title)assert.ok(title?.includes(COUNTY),label+': missing local title: '+title);
    for(const name of ['alt','title']){
      const text=attr(tag,name);if(!text)continue;
      if(!deco||name==='title')assert.ok(attr(tag,'data-ilatek-local-'+name),label+': missing persistent template');
    }
  }
}
for(const file of deliveryFiles())audit(read(file),file);
for(const p of buildTree())audit(buildPage(p),'generated/'+p.slug);
for(const p of structure.pages){
  const base=p.folder+'/es/',seo=JSON.parse(read(base+'seo.json')),doc=read(base+'SEO-GHL.md'),head=read(base+'HEAD-TEMPLATE.html');
  for(const key of ['metaTagTitle','metaTagDescription','metaTagImageAlt']){
    assert.ok(seo[key].includes(COUNTY),base+': '+key);
    assert.ok(doc.includes(seo[key]),base+': Markdown mismatch '+key);
    assert.ok(head.includes(seo[key].replace(/&/g,'&amp;')),base+': HEAD mismatch '+key);
  }
  assert.ok(!seo.metaTagImage.includes('{{'),base+': modified media URL');
  assert.ok(head.includes('property="og:image:alt"')&&head.includes('name="twitter:image:alt"'),base+': social alt');
}
assert.equal(localizeText('Techos | Ilatek'),'Techos en '+COUNTY+' | Ilatek');
assert.equal(localizeText('Techos en '+COUNTY),'Techos en '+COUNTY);
assert.equal(localizeText('Foto en Puerto Rico',{image:true}),'Foto en '+COUNTY);
const fixture='<img src="https://example.com/a.jpg" alt="Técnico" title="Equipo"><img alt="" aria-hidden="true" src="x.jpg">';
assert.equal(localizeHtml(localizeHtml(fixture)),localizeHtml(fixture));
console.log(JSON.stringify({seoDocuments:structure.pages.length,imagesAndGeneratedImages:images,decorative,localAltAndTitle:'passed',headAndMarkdown:'passed'},null,2));
