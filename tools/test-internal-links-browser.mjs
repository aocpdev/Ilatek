// No server or external requests: exercise real inline page scripts in an isolated browser.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { ROOT } from './site-paths.mjs';
const require=createRequire(import.meta.url);
const { chromium }=require(process.env.ILATEK_PLAYWRIGHT || 'playwright');
const browser=await chromium.launch({headless:true,...(process.env.ILATEK_CHROMIUM ? {executablePath:process.env.ILATEK_CHROMIUM} : {})});
const reports=[];
const cases=[
  ['home/es/landing-pages/ghl-home-multiservicios.html','example.com',1280],
  ['home/es/landing-pages/ghl-home-multiservicios.html','https://example.com/',390],
  ['servicios/alfombras/es/landing-pages/ghl-alfombras-landing.html','example.com',1280],
  ['categorias/sellado-de-techos/es/landing-pages/ghl-sellado-de-techos-landing.html','https://example.com/',390],
  ['ghl-footer-embed.html','example.com',1280],
];
try {
  for(const [file,value,width] of cases) {
    const page=await browser.newPage({viewport:{width,height:900}});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.route('**/*',route=>route.abort());
    let html=fs.readFileSync(ROOT+'/'+file,'utf8')
      .replace(/<script\b[^>]*\bsrc=[^>]*>[\s\S]*?<\/script>/gi,'')
      .replaceAll('data-website-url="{{custom_values.website_url}}"',`data-website-url="${value}"`);
    // The footer can be embedded without a surrounding root; supply the same native GHL bridge.
    if(file==='ghl-footer-embed.html') html='<p class="dv-ghl-values" hidden>Puerto Rico|||DV|||test@example.com|||DV|||7875550000|||DV|||'+value+'|||DV||||||DV|||</p>'+html;
    await page.setContent(html,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>Array.from(document.querySelectorAll('a[data-ilatek-path]')).every(a=>a.getAttribute('href').startsWith('https://example.com/')));
    const inspect=()=>page.evaluate(()=>{
      const links=Array.from(document.querySelectorAll('a[data-ilatek-path]'));
      return {links:links.length,bad:links.filter(a=>!a.href.startsWith('https://example.com/')||a.href.includes('https://https://')).map(a=>a.outerHTML),
        cards:Array.from(document.querySelectorAll('a.ils-card')).map(a=>a.getAttribute('href'))};
    });
    let state=await inspect();assert.ok(state.links>0);assert.deepEqual(state.bad,[]);
    assert.ok(state.cards.every(url=>url.startsWith('https://example.com/')));
    if(file.startsWith('home/')) {
      assert.ok(state.cards.length>=10);
      await page.evaluate(()=>window.__ilatekSetLang('en'));
      state=await inspect();assert.deepEqual(state.bad,[]);assert.ok(state.cards.every(url=>url.startsWith('https://example.com/')));
      await page.evaluate(()=>window.__ilatekSetLang('es'));
    }
    // Data arrives later: all managed anchors, including cloned carousel cards, must follow it.
    await page.evaluate(()=>{
      let p=document.querySelector('.dv-ghl-values');
      if(!p){p=document.createElement('p');p.className='dv-ghl-values';p.hidden=true;document.body.appendChild(p);}
      p.textContent='Puerto Rico|||DV|||test@example.com|||DV|||7875550000|||DV|||other.example.com|||DV||||||DV|||';
    });
    await page.waitForFunction(()=>Array.from(document.querySelectorAll('a[data-ilatek-path]')).every(a=>a.href.startsWith('https://other.example.com/')));
    const stale=await page.evaluate(()=>Array.from(document.querySelectorAll('a[href]')).map(a=>a.getAttribute('href')).filter(h=>h.includes('{{custom_values.website_url}}')||/^https?:\/\/(?:example\.com|ilatekpr\.com)(?:\/|$)/.test(h)));
    assert.deepEqual(stale,[],`${file}: stale unmarked internal link after late GHL values`);
    const localAnchor=page.locator('a[data-ilatek-anchor]').first();
    if(await localAnchor.count()) {
      await page.evaluate(()=>{window.__scrollCalled=false;Element.prototype.scrollIntoView=function(){window.__scrollCalled=true;};});
      await localAnchor.evaluate(a=>a.click());
      assert.equal(await page.evaluate(()=>window.__scrollCalled),true);
    }
    assert.deepEqual(errors,[],`${file}: browser script errors`);
    reports.push({file,width,links:state.links,carouselCards:state.cards.length,languageToggle:file.startsWith('home/'),lateValues:'passed',consoleErrors:errors.length});
    await page.close();
  }
} finally { await browser.close(); }
console.log(JSON.stringify(reports,null,2));
