const fs=require('fs');
const assert=require('node:assert/strict');
const {chromium}=require('/Users/axel/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'/Users/axel/Library/Caches/ms-playwright/chromium-1169/chrome-mac/Chromium.app/Contents/MacOS/Chromium'});
 const page=await browser.newPage();
 await page.route('**/*',r=>r.abort());
 const html=fs.readFileSync('documentacion/publicacion-custom-values-2026-10-28/preparados/home-custom-code.html','utf8');
 const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
 const values=['Caguas, Puerto Rico','test@example.com','+17875550100','https://test.example.com','https://facebook.com/example',''];
 await page.setContent(`<p class="dv-ghl-values">${values.join('|||DV|||')}</p><a id="contact" href="mailto:{{custom_values.business__email}}">{{custom_values.business__phone}}</a><span id="county">{{custom_values.business__county_name}}</span><script>${script}</script>`);
 assert.equal(await page.locator('#county').textContent(),values[0]);
 assert.equal(await page.locator('#contact').getAttribute('href'),'mailto:test@example.com');
 assert.equal(await page.evaluate(()=>window.ILATEK_BRIDGE.attr('https://{{custom_values.website_url}}/test?a=1#x')),'https://test.example.com/test?a=1#x');
 assert.deepEqual(await page.evaluate(()=>window.ILATEK_BRIDGE.values()),values);
 assert.equal(await page.locator('.dv-ghl-values').isVisible(),false);
 assert.equal(await page.evaluate(()=>window.ILATEK_BRIDGE.slot(5)),'');
 // Separate fresh document: reject unresolved native data and invented contacts.
 await page.goto('about:blank');
 await page.setContent(`<p class="dv-ghl-values">{{custom_values.business__county_name}}|||DV||||||DV||||||DV||||||DV||||||DV|||</p><script>${script}</script>`);
 assert.equal(await page.evaluate(()=>window.ILATEK_BRIDGE.slot(1)),'');
 assert.equal(await page.evaluate(()=>window.ILATEK_BRIDGE.slot(2)),'');
 assert.equal(await page.evaluate(()=>window.ILATEK_BRIDGE.state()),'missing');
 // Late native insertion is resolved without replacing empty slots.
 await page.evaluate(v=>{document.querySelector('.dv-ghl-values').textContent=v.join('|||DV|||')},values);
 await page.waitForFunction(()=>window.ILATEK_BRIDGE.state()==='ready');
 assert.deepEqual(await page.evaluate(()=>window.ILATEK_BRIDGE.values()),values);
 await browser.close(); console.log('PASS: six native slots, CRM contact, normalized URL, blank social, hidden carrier, unresolved and late arrival.');
})().catch(e=>{console.error(e);process.exit(1)});
