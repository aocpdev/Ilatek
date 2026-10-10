import fs from 'node:fs';
import assert from 'node:assert/strict';
import {ROOT} from './site-paths.mjs';
import {deliveryFiles} from './internal-link-contract.mjs';
import {shellFiles} from './page-shell.mjs';
import {responsiveHtml,hasServiceHero} from './responsive-contract.mjs';
let controls=0,heroes=0;
for(const file of deliveryFiles()){
 const html=fs.readFileSync(ROOT+'/'+file,'utf8');
 assert.equal(responsiveHtml(html),html,file+': responsive formatting not idempotent');
 if(html.includes('class="iln-links"')){
  assert.ok(html.includes('function syncCompactBrand()')&&html.includes('function activateCompactBrand(e)'),file+': compact logo must open navigation');
  assert.equal((html.match(/class="iln-login"/g)||[]).length,1,file+': desktop Login count');
  assert.ok(html.indexOf('id="iln-lang"')<html.indexOf('class="iln-login"'),file+': language before Login');
  const cta=html.includes('class="iln-ctawrap"')?'class="iln-ctawrap"':'class="iln-cta"';
  assert.ok(html.indexOf('class="iln-login"')<html.indexOf(cta),file+': Login before agenda');
 }
 assert.ok(!html.includes("if(el.children.length===0&&el.tagName!=='INPUT'){el.textContent=av}"),file+': attribute translation overwrites content');
 for(const brand of html.match(/<a\b[^>]*class="iln-brand"[^>]*>[\s\S]*?<\/a>/g)||[]){
  assert.ok(!brand.includes('<b>Ilatek</b>'),file+': duplicate wordmark');
  assert.ok(brand.includes('aria-label=')&&brand.includes('<img '),file+': accessible logo link');
 }
 for(const button of html.match(/<button\b[^>]*\bclass=["'][^"']*\bicd-nav\b[^"']*["'][^>]*>[\s\S]*?<\/button>/g)||[]){
  assert.ok(button.includes('aria-label=')&&button.includes('data-attr="aria-label"'),file+': accessible label');
  assert.ok(button.includes('<svg width="22" height="22"')&&button.includes('aria-hidden="true"'),file+': inline arrow');
  controls++;
 }
 if(shellFiles.includes(file)&&hasServiceHero(html)){
  assert.ok(!html.includes('data-ilatek-header-space'),file+': duplicate header reservation');
  assert.ok(html.includes('var(--ilatek-menu-bottom,78px)'),file+': responsive clearance absent');heroes++;
 }
}
assert.equal(responsiveHtml('<button class="icd-nav icd-nav--next" aria-label="Página siguiente">→</button>').includes('data-en="Next page"'),true);
console.log(JSON.stringify({responsiveHeroPages:heroes,arrowControls:controls,attributeTranslations:'safe',idempotence:'passed'}));
