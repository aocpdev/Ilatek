export default async function run(page, ui) {
  const out = { pages: {} };
  const pageErrors = {};
  let currentSeg = 'sentinel';
  page.on('pageerror', (err) => {
    (pageErrors[currentSeg] = pageErrors[currentSeg] || []).push(String(err && err.message ? err.message : err).slice(0, 200));
  });

  const SECTIONS = {
    marquee: '#ilatek-servicios-slider',
    cobertura: '#ilatek-cobertura-dir',
    faq: '#ilatek-faq',
    reviews: '#ilatek-reviews',
    fundadores: '#ilatek-conocenos',
    cta_final: '#ilatek-ms-final',
    footer: '#ilatek-footer',
  };

  async function settle(ms = 1400) { await page.waitForTimeout(ms); }

  function bodyScan() {
    return page.evaluate(() => {
      const raw = document.body.innerText;
      const rawTokens = (raw.match(/\{\{custom_values[^}]*\}\}/g) || []);
      return {
        innerTextHasRaw: rawTokens,
        hasRawAnywhere: /(\{\{custom_values|\{\{custom_values\.business__phone)/.test(document.documentElement.outerHTML) ? 'yes' : 'no',
        phoneVisible: /\+1?[\s(]?939\)?[\s-]?335[-\s]?7351/.test(raw) || /\+1?[\s(]?939/.test(raw),
      };
    });
  }

  async function shotSection(name, sel) {
    try {
      const el = page.locator(sel).first();
      await el.waitFor({ state: 'attached', timeout: 5000 });
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(260);
      await el.screenshot({ path: `./shots/${name}.png` });
      return 'ok';
    } catch (e) { return 'shot-fail:' + String(e && e.message ? e.message : e).slice(0, 80); }
  }

  // ---------- Variant A: sentinel.html ----------
  await page.goto('http://127.0.0.1:8932/sentinel.html', { waitUntil: 'load', timeout: 45000 });
  await settle(1600);

  const a = {};
  a.sentinelCounts = {};
  const checks = [
    ['marquee', '#ilatek-servicios-slider .ils-card'],
    ['categorias', '#ilatek-categorias-mini'],
    ['cobertura', '#ilatek-cobertura-dir'],
    ['faq', '#ilatek-faq'],
    ['reviews', '#ilatek-reviews'],
    ['fundadores', '#ilatek-conocenos'],
    ['footer', '#ilatek-footer'],
    ['cta_final', '#ilatek-ms-final'],
  ];
  for (const [name, sel] of checks) {
    a.sentinelCounts[name] = await page.evaluate(({sel}) => {
      const root = document.querySelector(sel);
      if (!root) return 'SECTION MISSING';
      const text = (root.innerText || '') + ' ' + Array.from(root.querySelectorAll('img')).map(img => (img.alt || '') + ' ' + (img.title || '')).join(' ');
      const c = (text.match(/TestCounty/g) || []).length;
      return c;
    }, {sel});
  }
  a.scan = await bodyScan();
  a.consoleLater = null;
  // screenshots
  const shots = {};
  for (const [name, sel] of [['marquee', '#ilatek-servicios-slider'], ['cobertura', '#ilatek-cobertura-dir'], ['faq', '#ilatek-faq'], ['fundadores', '#ilatek-conocenos'], ['footer', '#ilatek-footer']]) {
    shots[name] = await shotSection(name, sel);
  }
  await page.screenshot({ path: './shots/full-sentinel.png', fullPage: true }).catch(() => {});
  a.shots = shots;
  out.pages.sentinel = a;

  // ---------- Variant B: resolver.html (resolvers must rewrite raw -> sentinel) ----------
  currentSeg = 'resolver';
  await page.goto('http://127.0.0.1:8932/resolver.html', { waitUntil: 'load', timeout: 45000 });
  await settle(2500);
  const b = {};
  b.scan = await bodyScan();
  b.resolverOutcomes = await page.evaluate((SECTIONS) => {
    const res = {};
    const probes = {
      categorias: '#ilatek-categorias-mini',
      cobertura: '#ilatek-cobertura-dir',
      airbnb: '#ilatek-ms-airbnb',
      fundadores: '#ilatek-conocenos',
      cta_final: '#ilatek-ms-final',
    };
    for (const [k, sel] of Object.entries(probes)) {
      const root = document.querySelector(sel);
      res[k] = root ? root.innerText.includes('TestCounty') : 'SECTION MISSING';
    }
    // La seccion airbnb no lleva county en su texto (diseno): su criterio es href resuelto y limpio.
    {
      const a = document.querySelector('#ilatek-ms-airbnb a.ms-cta[href]');
      res.airbnbHref = a ? a.getAttribute('href') : 'CTA MISSING';
      res.airbnbHrefOk = !!a && a.classList.contains('ms-green') && /ilatekpr\.com\/airbnb-turnover/.test(a.href) && !a.href.includes('{{');
    }
    const marquee = document.querySelector('#ilatek-servicios-slider');
    res.marqueeAlt = Array.from(document.querySelectorAll('.ils-card img')).slice(0, 3).map(img => (img.title || img.alt || '').slice(0, 80));
    res.fundadoresTitle = Array.from(document.querySelectorAll('#ilatek-conocenos img')).slice(0, 2).map(img => (img.title || img.alt || '').slice(0, 90));
    return res;
  }, SECTIONS);
  out.pages.resolver = b;

  // ---------- Variant C: original.html (clean()-discard fallback) ----------
  currentSeg = 'original';
  await page.goto('http://127.0.0.1:8932/original.html', { waitUntil: 'load', timeout: 45000 });
  await settle(2500);
  const c = {};
  c.scanBody = await page.evaluate(() => {
    const raw = document.body.innerText;
    return {
      rawTokensInBody: (raw.match(/\{\{custom_values[^}]*\}\}/g) || []).slice(0, 6),
      rawTokenCount: (raw.match(/\{\{custom_values/g) || []).length,
      phoneVisible: /939[\s-]?335|939-335|\+1939/.test(raw),
      emailVisible: /ilatek\.pr@gmail\.com/.test(raw),
    };
  });
  c.scanAttr = await page.evaluate(() => {
    const html = document.documentElement.outerHTML;
    return {
      rawTokensInDocument: (html.match(/\{\{custom_values/g) || []).length,
      // marquee is the runtime-swept zone: alt/title must be clean
      marqueeAlts: Array.from(document.querySelectorAll('.ils-card img')).slice(0, 3).map(img => (img.alt || '').slice(0, 90)),
    };
  });
  await page.screenshot({ path: './shots/full-original.png', fullPage: false }).catch(() => {});
  out.pages.original = c;

  out.done = true;
  out.pageErrors = pageErrors;
  return out;
}
