import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { ROOT, structure } from './site-paths.mjs';
import { deliveryFiles, PREFIX, TOKEN, formatPage, publicPath } from './internal-link-contract.mjs';
import { buildPage } from '../techos/lib/page.mjs';
import { buildTree } from '../techos/lib/model.mjs';
const runtime=fs.readFileSync(ROOT+'/src/compartido/internal-links.js','utf8');
const context={window:{}, URL};
vm.runInNewContext(runtime,context);
const api=context.window.ILATEK_LINKS;
for(const base of ['example.com','https://example.com','https://example.com/','http://example.com///']) {
  assert.equal(api.normalize(base),'https://example.com');
  assert.equal(api.join(base,'/cotizacion'),'https://example.com/cotizacion');
  assert.equal(api.replace(PREFIX+'/servicios?x=1#detalle',TOKEN,base),'https://example.com/servicios?x=1#detalle');
}
for(const invalid of ['javascript:alert(1)','data:text/html,test','https://user:pass@example.com','https://example.com?query=1','{{custom_values.website_url}}','https://https://example.com','//evil.com',''])
  assert.equal(api.normalize(invalid),'',`Invalid base accepted: ${invalid}`);
assert.equal(api.join('https://example.com/base/','/base/servicios'),'https://example.com/base/servicios');
assert.equal(api.replace('tel:123','{{custom_values.business__phone}}','456'),'tel:123');
let anchorCount=0,blocks=0;
const files=deliveryFiles();
function audit(html,label) {
  for(const m of html.matchAll(/<a\b[^>]*?\bhref=(["'])(.*?)\1/gi)) {
    anchorCount++;
    assert.ok(!/^(?:\{\{custom_values\.website_url\}\}|https?:\/\/(?:www\.)?ilatekpr\.com(?:\/|$)|\/(?!\/)|#[^#])/.test(m[2]),`${label}: nonstandard href ${m[2]}`);
    if(m[2].includes(TOKEN)) assert.ok(m[2].startsWith(PREFIX+'/'),`${label}: missing HTTPS/path ${m[2]}`);
  }
  assert.ok(!html.includes('https://https://'),`${label}: duplicate protocol`);
  assert.ok(!html.includes("var url=website.replace"),`${label}: old dynamic carousel URL`);
  for(const s of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if(!s[2].trim() || /\bsrc=/.test(s[1])) continue;
    /application\/ld\+json/.test(s[1])?JSON.parse(s[2]):new vm.Script(s[2],{filename:label});blocks++;
  }
}
for(const file of files){
  const html=fs.readFileSync(ROOT+'/'+file,'utf8'); audit(html,file);
  assert.equal(formatPage(html,publicPath(file),{headOnly:/HEAD-TEMPLATE|head-seo|head-original|performance-head/.test(file)}),html,`Not idempotent: ${file}`);
}
for(const page of buildTree()) audit(buildPage(page),'generated/'+page.slug);
console.log(JSON.stringify({files:files.length,pages:structure.pages.length,anchorsAndGeneratedAnchors:anchorCount,
  parsedScriptBlocks:blocks,generatedRoofPages:buildTree().length,urlNormalization:'passed',idempotence:'passed'},null,2));
