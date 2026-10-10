// Isolated, offline browser checks. Never opens the user's browser or submits forms.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {ROOT,structure} from './site-paths.mjs';
import {shellFiles} from './page-shell.mjs';
const {chromium}=createRequire(import.meta.url)(process.env.ILATEK_PLAYWRIGHT||'playwright');
const browser=await chromium.launch({headless:true,...(process.env.ILATEK_CHROMIUM?{executablePath:process.env.ILATEK_CHROMIUM}:{})});
const media=new Map();
for(const p of structure.pages){
 const manifest=path.resolve(ROOT,p.file,'../../ASSETS.json');
 for(const a of JSON.parse(fs.readFileSync(manifest)).assets||[]){
  if(a.file&&fs.existsSync(path.resolve(path.dirname(manifest),a.file)))media.set(a.publicUrl,path.resolve(path.dirname(manifest),a.file));
 }
}
const archived=['ghl-home-completo.html','ghl-home-completo-optimizado.html','ghl-custom-code.html'].map(f=>'archivo/home-limpieza/'+f);
const samples=[structure.pages[0].file,structure.pages.find(p=>p.slug==='limpieza-residencial').file,
 structure.pages.find(p=>p.slug==='alfombras').file,structure.pages.find(p=>p.slug==='sellado-de-techos').file,archived[1]];
const heroSelector='.il-hero-grid,.ilr-hero-grid,.ilc2-hero-grid,.ilsx-hero-grid,.ilt-hero-grid,.mshero-inner';
const results=[];
try{for(const file of [...shellFiles,...archived].filter(f=>!process.env.ILATEK_TEST_FILTER||f.includes(process.env.ILATEK_TEST_FILTER))){
 for(const width of [390,768,1440,...(samples.includes(file)?[360,1024,1101,1250]:[])].filter(w=>!process.env.ILATEK_TEST_WIDTH||w===Number(process.env.ILATEK_TEST_WIDTH))){
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',async r=>{
   const url=r.request().url();let local=media.get(url);
   if(!local&&url.startsWith('https://cdn.jsdelivr.net/gh/aocpdev/Ilatek@main/assets/')){
    const candidate=path.join(ROOT,'assets',url.split('/assets/')[1]);if(fs.existsSync(candidate))local=candidate;
   }
   // Videos, remote fonts, analytics, translation and booking widgets remain offline.
   if(local&&/\.(png|jpe?g|webp|svg)$/i.test(local))await r.fulfill({path:local});else await r.abort();
  });
  let html=fs.readFileSync(ROOT+'/'+file,'utf8');
  if(archived.includes(file))html=fs.readFileSync(ROOT+'/componentes/ghl-nav-embed.html','utf8')+html;
  const bridge='<p class="dv-ghl-values" hidden>Bayamón|||DV|||test@example.com|||DV|||7875550000|||DV|||example.com|||DV||||||DV|||</p>';
  await page.setContent(bridge+html.replace(/<script\b[^>]*\bsrc=[^>]*>[\s\S]*?<\/script>/gi,''),{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#ilatek-nav')?.dataset.ilnReady==='true');
  await page.waitForTimeout(150);
  async function metrics(){return page.evaluate(sel=>{
   const hero=document.querySelector(sel),nav=document.querySelector('.iln-shell');
   const rect=hero?.getBoundingClientRect(),bar=nav.getBoundingClientRect();
   const content=hero?.classList.contains('mshero-inner')?hero.firstElementChild.getBoundingClientRect():rect;
   return {gap:content?content.top-bar.bottom:null,navBottom:bar.bottom,overflow:document.documentElement.scrollWidth>innerWidth+1};
  },heroSelector)}
  const initial=await metrics();
  const brand=await page.locator('#ilatek-nav .iln-brand').evaluate(a=>{
   const img=a.querySelector('img'),s=getComputedStyle(img);
   return {text:a.textContent.trim(),label:a.getAttribute('aria-label'),height:a.getBoundingClientRect().height,
    logoHeight:img.getBoundingClientRect().height,padding:s.padding,border:s.borderWidth,background:s.backgroundImage,
    radius:s.borderRadius,blend:s.mixBlendMode,barHeight:a.closest('.iln-shell').getBoundingClientRect().height};
  });
  assert.equal(brand.text,'',file+': extra logo text');assert.ok(brand.label,file+': home-link label');
  assert.equal(brand.height,52);assert.equal(brand.logoHeight,52);assert.equal(brand.barHeight,64,file+': menu height changed');
  assert.equal(brand.padding,'0px');assert.equal(brand.border,'0px');assert.equal(brand.radius,'0px');
  assert.equal(brand.background,'none');
  assert.equal(initial.overflow,false,file+': overflow '+width);
  if(initial.gap!==null)assert.ok(initial.gap>=(width<=560?32:width<=1100?48:64)-1,file+': hero clearance '+width+' '+initial.gap);
  const menu=page.locator(width<=1100?'#ilatek-nav .iln-burger':'#ilatek-nav .iln-trigger').first();
  if(width>1100){
   const layout=await page.locator('#ilatek-nav').evaluate(root=>{
    const box=s=>{const r=root.querySelector(s).getBoundingClientRect();return {left:r.left,right:r.right,cy:r.top+r.height/2}};
    const selectors=['.iln-links','.iln-langwrap','.iln-login','.iln-ctawrap'];
    const boxes=selectors.map(box);
    const items=[...root.querySelector('.iln-links').children].map(el=>el.getBoundingClientRect());
    return {boxes,gaps:boxes.slice(1).map((b,i)=>b.left-boxes[i].right),
     menuGap:items[1].left-items[0].right,brand:box('.iln-brand'),shell:box('.iln-shell')};
   });
   for(const gap of layout.gaps)assert.ok(Math.abs(gap-layout.menuGap)<1,file+': unequal menu spacing '+JSON.stringify(layout));
   assert.ok(layout.boxes[0].left>=layout.brand.right+15,file+': brand/nav overlap');
   assert.ok(layout.boxes[3].right<=layout.shell.right-9,file+': CTA outside menu');
   for(const b of layout.boxes)assert.ok(Math.abs(b.cy-layout.shell.cy)<1,file+': vertical menu alignment');
   await page.locator('#iln-lang').focus();await page.keyboard.press('Tab');
   assert.ok(await page.locator('.iln-login').evaluate(el=>el===document.activeElement),file+': language → Login tab order');
   await page.keyboard.press('Tab');
   assert.ok(await page.locator('#iln-agenda-trig').evaluate(el=>el===document.activeElement),file+': Login → agenda tab order');
   await page.evaluate(()=>document.activeElement.blur());
   if(process.env.ILATEK_SCREENSHOTS&&samples.includes(file)){
    fs.mkdirSync(process.env.ILATEK_SCREENSHOTS,{recursive:true});
    await page.locator('#ilatek-nav .iln-shell').screenshot({path:path.join(process.env.ILATEK_SCREENSHOTS,`menu-desktop-${width}.png`)});
   }
  }
  async function checkMobileControls(open){
   if(width>1100)return;
   const boxes=await page.evaluate(open=>{
    const root=document.querySelector('#ilatek-nav'),button=root.querySelector('.iln-burger');
    const rect=el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,cx:r.x+r.width/2,cy:r.y+r.height/2}};
    return {button:rect(button),icon:rect(button.querySelector(open?'.iln-ic-x svg':'.iln-ic-burger')),
     lang:rect(root.querySelector('.iln-lang')),shell:rect(root.querySelector('.iln-shell'))};
   },open);
   assert.ok(Math.abs(boxes.button.cx-boxes.icon.cx)<.5,file+': icon horizontally off center');
   assert.ok(Math.abs(boxes.button.cy-boxes.icon.cy)<.5,file+': icon vertically off center');
   assert.ok(Math.abs(boxes.button.cy-boxes.lang.cy)<.5,file+': language vertical alignment');
   assert.ok(Math.abs(boxes.button.x-boxes.lang.right-8)<.5,file+': language not adjacent to menu');
   assert.ok(Math.abs(boxes.shell.right-boxes.button.right-10)<.5,file+': menu not right aligned');
   assert.ok(boxes.button.height>=44&&boxes.lang.height>=44,file+': touch targets');
  }
  await checkMobileControls(false);
  await menu.click();assert.equal(await menu.getAttribute('aria-expanded'),'true',file+': menu');
  await checkMobileControls(true);
  if(width<=1100){
   for(const lang of ['en','es']){
    await page.locator('#iln-lang').click();
    assert.equal(await page.evaluate(()=>document.documentElement.lang),lang,file+': language button');
    await checkMobileControls((await menu.getAttribute('aria-expanded'))==='true');
   }
   // Existing behavior closes the drawer when the language control is clicked.
   if((await menu.getAttribute('aria-expanded'))!=='true')await menu.click();
   await menu.click();assert.equal(await menu.getAttribute('aria-expanded'),'false',file+': close button');
   await menu.click();assert.equal(await menu.getAttribute('aria-expanded'),'true',file+': reopen');
  }
  if(width<=1100&&process.env.ILATEK_SCREENSHOTS&&samples.includes(file)){
   fs.mkdirSync(process.env.ILATEK_SCREENSHOTS,{recursive:true});
   await page.locator('#ilatek-nav .iln-shell').screenshot({path:path.join(process.env.ILATEK_SCREENSHOTS,`menu-open-${width}.png`)});
  }
  await page.keyboard.press('Escape');assert.equal(await menu.getAttribute('aria-expanded'),'false',file+': Escape');
  if(samples.includes(file)){
   for(const activation of ['click','Enter','Space']){
    await page.evaluate(()=>{document.activeElement.blur();scrollTo({top:0,behavior:'instant'})});
    await page.waitForFunction(()=>!document.querySelector('#ilatek-nav').classList.contains('iln-compact'));
    await page.mouse.move(0,0);
    await page.evaluate(()=>scrollTo({top:800,behavior:'instant'}));
    await page.waitForFunction(()=>document.querySelector('#ilatek-nav').classList.contains('iln-compact'));
    const logo=page.locator('#ilatek-nav .iln-brand');
    assert.equal(await logo.getAttribute('role'),'button');
    const glass=await page.locator('.iln-shell').evaluate(e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return {w:r.width,h:r.height,border:s.borderTopWidth,color:s.borderTopColor,radius:s.borderRadius,blur:s.backdropFilter}});
    assert.equal(glass.w,64);assert.equal(glass.h,64);assert.equal(glass.border,'1px');assert.equal(glass.radius,'20px');assert.ok(glass.blur.includes('blur'));
    if(activation==='click'&&process.env.ILATEK_SCREENSHOTS){
     const clip=await page.locator('.iln-shell').boundingBox();
     const screenshot=state=>page.screenshot({path:path.join(process.env.ILATEK_SCREENSHOTS,`compact-${state}-${width}.png`),clip:{x:clip.x-18,y:0,width:100,height:108}});
     await screenshot('rest');await logo.hover();await screenshot('hover');
     assert.notEqual(await page.locator('.iln-shell').evaluate(e=>getComputedStyle(e).borderTopColor),glass.color,file+': hover border');
    }
    const url=page.url();
    if(activation==='click')await logo.click();else{await logo.focus();await page.keyboard.press(activation)}
    await page.waitForFunction(()=>!document.querySelector('#ilatek-nav').classList.contains('iln-compact'));
    assert.equal(page.url(),url,file+': compact logo navigated away');
    assert.equal(await menu.getAttribute('aria-expanded'),'true',file+': compact control did not open menu');
    assert.equal(await logo.getAttribute('role'),null,file+': expanded logo must remain a home link');
    await page.keyboard.press('Escape');
   }
   await page.evaluate(()=>{document.activeElement.blur();scrollTo({top:0,behavior:'instant'})});
  }
  if(samples.includes(file)){
   for(const lang of ['en','es']){
    await page.evaluate(lang=>window.__ilatekSetLang(lang),lang);
    const dir=page.locator('#ilatek-cobertura-dir');
    if(await dir.count()){
     const prev=dir.locator('.icd-nav--prev'),next=dir.locator('.icd-nav--next');
     // The optimized legacy landing uses content-visibility:auto offscreen.
     await next.scrollIntoViewIfNeeded();
     for(const button of [prev,next]){
      assert.equal((await button.textContent()).trim(),'');
      assert.equal(await button.locator('svg').count(),1);
      assert.ok((await button.boundingBox()).width>=44);
      assert.ok((await button.locator('svg').boundingBox()).width>=22);
     }
     assert.equal(await next.getAttribute('aria-label'),lang==='en'?'Next page':'Página siguiente');
     const first=()=>dir.locator('#icd-town-results a:visible').first().textContent().then(s=>s.trim());
     const starting=await first();assert.ok(await prev.isDisabled());
     // Programmatic focus/keyboard activation checks visible SVGs and keyboard semantics.
     await next.focus();await page.keyboard.press('Enter');assert.notEqual(await first(),starting);
     await prev.focus();await page.keyboard.press('Enter');assert.equal(await first(),starting);
     while(await next.isEnabled())await next.evaluate(b=>b.click());
     assert.ok(await next.isDisabled());assert.ok(await prev.isEnabled());
     const search=dir.locator('#icd-town-search');
     await search.fill('bayamon');assert.equal(await dir.locator('#icd-town-results a:visible').count(),1);
     await search.fill('zzzz-no-town');assert.ok(await dir.locator('.icd-empty').isVisible());
     assert.ok(await next.isDisabled());assert.ok(await prev.isDisabled());
     await dir.locator('.icd-search-clear').click();assert.equal(await first(),starting);
     assert.equal(await dir.locator('#icd-town-results a:visible').count(),width<=560?6:width<=900?8:12);
    }
   }
   await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(100);
   if(process.env.ILATEK_SCREENSHOTS){
    fs.mkdirSync(process.env.ILATEK_SCREENSHOTS,{recursive:true});
    const name=file===structure.pages[0].file?'home':archived.includes(file)?'limpieza-original':file.split('/')[1];
    await page.screenshot({path:path.join(process.env.ILATEK_SCREENSHOTS,`${name}-${width}.png`)});
    if(file===structure.pages[0].file)await page.locator('#ilatek-cobertura-dir').screenshot({path:path.join(process.env.ILATEK_SCREENSHOTS,`pueblos-${width}.png`)});
   }
   // Rotation and shorter viewports: navigation changes breakpoint without losing clearance.
   await page.setViewportSize({width:844,height:390});await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(200);
   const rotated=await metrics();assert.equal(rotated.overflow,false,file+': landscape overflow');
   if(rotated.gap!==null)assert.ok(rotated.gap>=47,file+': landscape clearance '+JSON.stringify(rotated));
  }
  assert.deepEqual(errors,[],file+': JavaScript errors');
  results.push({file,width,...initial});
  await page.close();
 }
 console.log('PASS '+file);
}}finally{await browser.close();}
console.log(JSON.stringify({files:new Set(results.map(r=>r.file)).size,cases:results.length,minHeroGap:Math.min(...results.filter(r=>r.gap!==null).map(r=>r.gap)),overflow:0,errors:0}));
