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
  // Sin párrafo el gate vence a los 2500 ms: se espera el reveal, no antes.
  await settle(3500);
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

  // ---------- Variant D: late.html (GHL puebla el párrafo después) ----------
  currentSeg = 'late';
  await page.goto('http://127.0.0.1:8932/late.html', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(250);
  const d = {};
  d.beforeArrival = await page.evaluate(() => ({
    state: document.documentElement.getAttribute('data-ilatek-values'),
    visibility: document.body ? getComputedStyle(document.body).visibility : 'no-body',
  }));
  // El value llega tarde: se inyecta el párrafo nativo y el gate debe resolver.
  const lateValues = await page.evaluate(() => {
    const m = document.querySelector('meta[name="ilatek-qa-bridge"]');
    return m ? m.getAttribute('content') : '';
  });
  await page.evaluate((txt) => {
    const p = document.createElement('p');
    p.className = 'dv-ghl-values';
    p.id = 'dv-ghl-values';
    p.textContent = txt;
    document.body.appendChild(p);
  }, lateValues);
  try {
    await page.waitForFunction(() => document.documentElement.getAttribute('data-ilatek-values') === 'ready', { timeout: 8000 });
    d.ready = true;
  } catch (e) { d.ready = false; }
  await page.waitForTimeout(500);
  d.after = await page.evaluate(() => {
    const txt = document.body.innerText;
    const q = (window.fbq && window.fbq.queue) || [];
    return {
      state: document.documentElement.getAttribute('data-ilatek-values'),
      source: window.ILATEK_BRIDGE ? window.ILATEK_BRIDGE.source() : '',
      countyVisible: txt.includes('TestCounty'),
      rawVisible: (txt.match(/\{\{custom_values/g) || []).length,
      inits: q.filter((a) => a[0] === 'init').map((a) => a[1]),
      pageViews: q.filter((a) => a[0] === 'track' && a[1] === 'PageView').length,
      scripts: document.querySelectorAll('script[src*="fbevents.js"]').length,
      visibility: document.body ? getComputedStyle(document.body).visibility : 'no-body',
    };
  });
  out.pages.late = d;

  // ---------- Variant E: missing.html (sin párrafo: 'missing' + fallback) ----------
  currentSeg = 'missing';
  await page.goto('http://127.0.0.1:8932/missing.html', { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(1200);
  out.pages.missing = await page.evaluate(() => {
    const txt = document.body.innerText;
    const q = (window.fbq && window.fbq.queue) || [];
    return {
      state: document.documentElement.getAttribute('data-ilatek-values'),
      reason: window.ILATEK_BRIDGE ? window.ILATEK_BRIDGE.reason() : '',
      visibility: document.body ? getComputedStyle(document.body).visibility : 'no-body',
      fallbackVisible: txt.includes('Puerto Rico'),
      rawVisible: (txt.match(/\{\{custom_values/g) || []).length,
      inits: q.filter((a) => a[0] === 'init').length,
      pageViews: q.filter((a) => a[0] === 'track' && a[1] === 'PageView').length,
      scripts: document.querySelectorAll('script[src*="fbevents.js"]').length,
    };
  });

  // ---------- Variant F: double.html (6 slots + 7 slots: gana el de 7) ----------
  currentSeg = 'double';
  await page.goto('http://127.0.0.1:8932/double.html', { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(1400);
  out.pages.double = await page.evaluate(() => {
    const txt = document.body.innerText;
    const q = (window.fbq && window.fbq.queue) || [];
    const hrefs = Array.from(document.querySelectorAll('a[href]')).map((a) => a.getAttribute('href') || '');
    return {
      state: document.documentElement.getAttribute('data-ilatek-values'),
      county: txt.includes('TestCounty'),
      viejoVisible: txt.includes('PuebloViejo'),
      sieteHref: hrefs.some((h) => h.includes('https://ilatekpr.com')),
      viejoHref: hrefs.some((h) => h.includes('viejo.example')),
      inits: q.filter((a) => a[0] === 'init').map((a) => a[1]),
      pageViews: q.filter((a) => a[0] === 'track' && a[1] === 'PageView').length,
      scripts: document.querySelectorAll('script[src*="fbevents.js"]').length,
    };
  });

  // ---------- Variant G: badpixel.html (pixel_id no numérico) ----------
  currentSeg = 'badpixel';
  await page.goto('http://127.0.0.1:8932/badpixel.html', { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(1400);
  out.pages.badpixel = await page.evaluate(() => {
    const txt = document.body.innerText;
    const q = (window.fbq && window.fbq.queue) || [];
    return {
      state: document.documentElement.getAttribute('data-ilatek-values'),
      county: txt.includes('TestCounty'),
      pixelId: window.__ilatekPixel || '',
      inits: q.filter((a) => a[0] === 'init').length,
      pageViews: q.filter((a) => a[0] === 'track' && a[1] === 'PageView').length,
      scripts: document.querySelectorAll('script[src*="fbevents.js"]').length,
    };
  });

  const pass = {
    late: d.beforeArrival.state === 'missing'
      && d.beforeArrival.visibility === 'visible'
      && d.ready === true
      && d.after.state === 'ready'
      && d.after.countyVisible === true
      && d.after.rawVisible === 0
      && d.after.inits.length === 1
      && d.after.pageViews === 1
      && d.after.scripts === 1,
    missing: out.pages.missing.state === 'missing'
      && out.pages.missing.visibility === 'visible'
      && out.pages.missing.rawVisible === 0
      && out.pages.missing.inits === 0
      && out.pages.missing.scripts === 0,
    double: out.pages.double.state === 'ready'
      && out.pages.double.county === true
      && out.pages.double.viejoHref === false
      && out.pages.double.inits.length === 1
      && out.pages.double.pageViews === 1
      && out.pages.double.scripts === 1,
    badpixel: out.pages.badpixel.state === 'ready'
      && out.pages.badpixel.county === true
      && out.pages.badpixel.inits === 0
      && out.pages.badpixel.pageViews === 0
      && out.pages.badpixel.scripts === 0,
  };
  out.checks = { ok: Object.values(pass).every(Boolean), pass };

  out.done = true;
  out.pageErrors = pageErrors;
  return out;
}
