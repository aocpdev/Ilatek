// Offline integration checks: never submit forms or contact calendar/payment services.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { ROOT } from './site-paths.mjs';
import { shellFiles } from './page-shell.mjs';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.ILATEK_PLAYWRIGHT||'playwright');
const browser=await chromium.launch({headless:true,...(process.env.ILATEK_CHROMIUM?{executablePath:process.env.ILATEK_CHROMIUM}:{})});
const samples=[shellFiles[0],shellFiles.find(f=>f.includes('/alfombras/')),shellFiles.find(f=>f.includes('/sellado-de-techos/')),
  'resenas/ghl-resenas-landing.html','politica-de-privacidad/ghl-politica-embed.html','ghl-custom-code-embedded.html'];
const reports=[];
try {
  for(const file of shellFiles) {
    for(const width of samples.includes(file)?[390,1280]:[390]) {
      const page=await browser.newPage({viewport:{width,height:900}});
      const errors=[];page.on('pageerror',e=>errors.push(e.message));
      await page.route('**/*',r=>r.abort());
      const bridge='<p class="dv-ghl-values" hidden>Bayamón|||DV|||test@example.com|||DV|||7875550000|||DV|||example.com|||DV||||||DV|||</p>';
      const source=fs.readFileSync(ROOT+'/'+file,'utf8').replace(/<script\b[^>]*\bsrc=[^>]*>[\s\S]*?<\/script>/gi,'');
      await page.setContent(bridge+source,{waitUntil:'domcontentloaded'});
      await page.waitForFunction(()=>document.querySelector('#ilatek-nav')?.dataset.ilnReady==='true'&&
        Array.from(document.querySelectorAll('a[data-ilatek-path]')).every(a=>a.href.startsWith('https://example.com/')));
      assert.equal(await page.locator('#ilatek-nav').count(),1,file);
      assert.equal(await page.locator('#ilatek-footer').count(),1,file);
      assert.equal(await page.locator('#ilatek-footer').evaluate(e=>!!e.closest('main')),false,file);
      assert.ok(await page.locator('#ilatek-footer').innerText().then(s=>!s.includes('{{')&&s.includes('Bayamón')),file+': footer values');
      await page.waitForFunction(()=>Array.from(document.images).filter(i=>i.hasAttribute('data-ilatek-local-alt')).every(i=>i.alt.includes('Bayamón')));
      async function checkImageLocation(location){
        const bad=await page.evaluate(loc=>Array.from(document.images).filter(im=>{
          const alt=im.getAttribute('alt'),title=im.getAttribute('title');
          const decorative=alt===''||im.closest('[aria-hidden="true"]');
          return (!decorative&&(!alt||!alt.includes(loc)||alt.includes('{{')))||
            (im.hasAttribute('data-ilatek-local-title')&&(!title.includes(loc)||title.includes('{{')));
        }).map(i=>({alt:i.alt,title:i.title,src:i.getAttribute('src')})),location);
        assert.deepEqual(bad,[],file+': image locality');
      }
      await checkImageLocation('Bayamón');
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
      assert.equal(overflow,false,file+': horizontal overflow at '+width);
      if(width===390) {
        const burger=page.locator('#ilatek-nav .iln-burger');
        await burger.click();
        assert.equal(await burger.getAttribute('aria-expanded'),'true',file+': mobile menu');
        await page.keyboard.press('Escape');
        assert.equal(await burger.getAttribute('aria-expanded'),'false',file+': Escape closes menu');
      } else {
        const trigger=page.locator('#ilatek-nav .iln-trigger').first();
        await trigger.click();
        assert.equal(await trigger.getAttribute('aria-expanded'),'true',file+': desktop menu');
        await page.keyboard.press('Escape');
      }
      await page.evaluate(()=>window.__ilatekSetLang('en'));
      assert.ok((await page.locator('#ilatek-footer').innerText()).includes('Main Menu'),file+': EN footer');
      await page.waitForFunction(()=>Array.from(document.images).filter(i=>i.hasAttribute('data-ilatek-local-alt')).every(i=>i.alt.includes('Bayamón')));
      await checkImageLocation('Bayamón');
      await page.evaluate(()=>window.__ilatekSetLang('es'));
      await page.evaluate(()=>document.querySelector('.dv-ghl-values').textContent='Ponce|||DV|||test@example.com|||DV|||7875550000|||DV|||other.example.com|||DV||||||DV|||');
      await page.waitForFunction(()=>document.querySelector('#ilatek-footer').textContent.includes('Ponce')&&
        Array.from(document.querySelectorAll('a[data-ilatek-path]')).every(a=>a.href.startsWith('https://other.example.com/')));
      await page.waitForFunction(()=>Array.from(document.images).filter(i=>i.hasAttribute('data-ilatek-local-alt')).every(i=>i.alt.includes('Ponce')));
      await checkImageLocation('Ponce');
      const badMeta=await page.evaluate(()=>Array.from(document.querySelectorAll('meta[data-ilatek-local-content]')).filter(m=>!m.content.includes('Ponce')).map(m=>m.outerHTML));
      assert.deepEqual(badMeta,[],file+': metadata locality');
      // The native bridge is data: special characters must remain text, never executable markup.
      const hostile='Ponce <img id="ilatek-injected" src=x> & "PR"';
      await page.evaluate(v=>document.querySelector('.dv-ghl-values').textContent=v+'|||DV|||test@example.com|||DV|||7875550000|||DV|||other.example.com|||DV||||||DV|||',hostile);
      await page.waitForFunction(v=>Array.from(document.querySelectorAll('img[data-ilatek-local-alt]')).every(i=>i.alt.includes(v)),hostile);
      await checkImageLocation(hostile);
      assert.equal(await page.locator('#ilatek-injected').count(),0,file+': locality injected markup');
      assert.deepEqual(errors,[],file+': page errors');
      reports.push({file,width,header:1,footer:1,mobileMenu:width===390,language:'passed',lateValues:'passed',localImages:'passed',safeText:'passed',errors:errors.length});
      if(process.env.ILATEK_SCREENSHOTS&&file===shellFiles[0]) {
        await page.screenshot({path:process.env.ILATEK_SCREENSHOTS+'/home-header-'+width+'.png'});
        await page.locator('#ilatek-footer').screenshot({path:process.env.ILATEK_SCREENSHOTS+'/home-footer-'+width+'.png'});
      }
      await page.close();
    }
  }
} finally {await browser.close();}
console.log(JSON.stringify({files:shellFiles.length,cases:reports.length,results:reports},null,2));
