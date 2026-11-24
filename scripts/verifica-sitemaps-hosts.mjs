// Verificación de los sitemaps por host contra un servidor local que emula el dominio de cada
// municipio (Host header). Recorre el 100% de las URLs de todos los sitemaps y comprueba:
//   200 · canonical idéntico a la URL · sin noindex · sin {{ en el HTML servido · sin duplicados
//    entre sitemaps · jerarquía y orden · robots.txt de cada host anunciando su sitemap.
// Uso: node scripts/verifica-sitemaps-hosts.mjs
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';

const ROOT = path.resolve(import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const SITE = 'https://ilatekpr.com';
const SUB = 'https://comunidades.ilatekpr.com';
const LANDINGS = path.join(ROOT, 'Comunidades/landings');
const PUEBLOS = path.join(ROOT, 'Comunidades/pueblos');

const municipios = fs
  .readdirSync(PUEBLOS, { withFileTypes: true })
  .filter((e) => e.isDirectory() && fs.existsSync(path.join(PUEBLOS, e.name, 'sitemap.xml')))
  .map((e) => e.name)
  .sort();

/* ---------------- servidor multi-host ---------------- */
const MIME = { '.html': 'text/html; charset=utf-8', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.json': 'application/json' };
function raizDe(host) {
  const h = String(host || '').split(':')[0].toLowerCase().replace(/^www\./, '');
  if (h === 'ilatekpr.com') return ROOT;
  if (h === 'comunidades.ilatekpr.com') return LANDINGS;
  const m = h.match(/^([a-z0-9-]+)\.ilatekpr\.com$/);
  if (m && municipios.includes(m[1])) return path.join(PUEBLOS, m[1]);
  if (m) return path.join(PUEBLOS, m[1]); // host de pueblo sin sitemap: 404 controlado
  return null;
}
// Las páginas del sitio viven en rutas de repo (categorias/<slug>/es/*.html) y GHL las sirve
// en URLs limpias: el mapa canonical → archivo las resuelve igual que producción.
const mapaArchivos = new Map();
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    const rel = p.replace(/\\/g, '/');
    if (/(\/documentacion\/|\/archivo\/|\/documentos\/|\/\.git\/|node_modules|\/\.tmp|backups|GHL-PUBLICAR|\/docs\/)/.test(rel)) continue;
    if (e.isDirectory()) walk(p);
    else if (/\.html$/i.test(e.name)) {
      const m = fs.readFileSync(p, 'utf8').match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
      if (m && !mapaArchivos.has(m[1].trim().replace(/\/$/, ''))) mapaArchivos.set(m[1].trim().replace(/\/$/, ''), p);
    }
  }
})(ROOT);

const servidor = http.createServer((req, res) => {
  const raiz = raizDe(req.headers.host);
  if (!raiz) return res.writeHead(404).end('host desconocido');
  const host = String(req.headers.host).split(':')[0].toLowerCase().replace(/^www\./, '');
  const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let f = path.join(raiz, url === '/' ? 'index.html' : url);
  if (!f.startsWith(raiz)) return res.writeHead(403).end('fuera de raíz');
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if (!fs.existsSync(f)) f = mapaArchivos.get('https://' + host + url.replace(/\/$/, '')) || f;
  if (!fs.existsSync(f)) return res.writeHead(404).end('no encontrado');
  res.writeHead(200, { 'content-type': MIME[path.extname(f).toLowerCase()] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => servidor.listen(0, '127.0.0.1', r));
const puerto = servidor.address().port;

function trae(host, ruta, intentos = 2) {
  return new Promise((resolve) => {
    const pide = (n) => {
      const req = http.request({ host: '127.0.0.1', port: puerto, path: ruta, method: 'GET', headers: { Host: host, 'user-agent': 'Ilatek-Check/1.0' } }, (res) => {
        let txt = '';
        res.setEncoding('utf8');
        res.on('data', (c) => (txt += c));
        res.on('end', () => resolve({ status: res.statusCode, txt }));
      });
      req.on('error', () => (n > 1 ? setTimeout(() => pide(n - 1), 120) : resolve({ status: 0, txt: '' })));
      req.end();
    };
    pide(intentos);
  });
}
async function enParalelo(items, limite, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(limite, items.length) }, async () => {
    while (i < items.length) {
      const k = i++;
      out[k] = await fn(items[k], k);
    }
  }));
  return out;
}

const locsDe = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
const hijosDe = (xml) => [...xml.matchAll(/<sitemap>[\s\S]*?<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());

/* ---------------- descubrir todos los sitemaps ---------------- */
const sitemaps = []; // { url, host, ruta, urls[] }
const principal = await trae('ilatekpr.com', '/sitemap.xml');
const hijos = /<sitemapindex/i.test(principal.txt) ? hijosDe(principal.txt) : [SITE + '/sitemap.xml'];
for (const u of hijos) {
  const { hostname, pathname } = new URL(u);
  const r = await trae(hostname, pathname);
  sitemaps.push({ url: u, host: hostname, ruta: pathname, status: r.status, urls: locsDe(r.txt), esIndice: /<sitemapindex/i.test(r.txt) });
}
for (const m of municipios) {
  const host = m + '.ilatekpr.com';
  const r = await trae(host, '/sitemap.xml');
  sitemaps.push({ url: `https://${host}/sitemap.xml`, host, ruta: '/sitemap.xml', status: r.status, urls: locsDe(r.txt), esIndice: false });
}

/* ---------------- comprobaciones de estructura ---------------- */
const problemas = [];
const agregadas = new Map(); // url normalizada → sitemaps
const textoPorClave = new Map(); // url normalizada → forma exacta listada
for (const s of sitemaps) {
  if (s.status !== 200) problemas.push(`sitemap ${s.url} → HTTP ${s.status}`);
  if (s.esIndice) problemas.push(`sitemap ${s.url} es un índice inesperado (los hijos deben ser urlset)`);
  if (!s.urls.length) problemas.push(`sitemap ${s.url} sin <loc>`);
  const norm = s.urls.map((u) => u.replace(/\/$/, ''));
  if (new Set(norm).size !== norm.length) problemas.push(`sitemap ${s.url} con URLs duplicadas dentro de sí mismo`);
  const profundidades = s.urls.map((u) => new URL(u).pathname.split('/').filter(Boolean).length);
  if (!profundidades.every((d, i) => i === 0 || d >= profundidades[i - 1])) problemas.push(`sitemap ${s.url} sin orden jerárquico`);
  for (const u of s.urls) {
    const k = u.replace(/\/$/, '');
    if (!agregadas.has(k)) agregadas.set(k, []);
    agregadas.get(k).push(s.url);
    if (!textoPorClave.has(k)) textoPorClave.set(k, u);
  }
}
for (const [u, en] of agregadas) if (en.length > 1) problemas.push(`URL en dos sitemaps: ${u} → ${en.join(' + ')}`);

/* ---------------- robots de cada host ---------------- */
const hosts = ['ilatekpr.com', ...municipios.map((m) => m + '.ilatekpr.com'), 'comunidades.ilatekpr.com'];
for (const h of hosts) {
  const r = await trae(h, '/robots.txt');
  if (r.status !== 200) {
    problemas.push(`robots.txt de ${h} → HTTP ${r.status}`);
    continue;
  }
  const declarados = [...r.txt.matchAll(/^\s*Sitemap:\s*(\S+)/gim)].map((m) => m[1]);
  if (h === 'comunidades.ilatekpr.com') {
    if (declarados.length) problemas.push(`comunidades.ilatekpr.com anuncia sitemap (${declarados.join(', ')}) y no debe: sus URLs canonicalizan al pueblo`);
  } else {
    const esperado = `https://${h}/sitemap.xml`;
    if (!declarados.includes(esperado)) problemas.push(`robots.txt de ${h} no anuncia ${esperado} (anuncia: ${declarados.join(', ') || 'nada'})`);
  }
}
if (fs.existsSync(path.join(LANDINGS, 'sitemap.xml'))) problemas.push('Comunidades/landings/sitemap.xml sigue existiendo y no debería');

/* ---------------- comprobación del 100% de las URLs ---------------- */
// Páginas nativas de GHL (sin HTML en el repo): su 200 solo existe en producción.
const NATIVAS_GHL = new Set(['https://ilatekpr.com/contactanos', 'https://ilatekpr.com/reclutamiento-empleo-techos']);
const todas = [...agregadas.keys()].sort().map((k) => textoPorClave.get(k));
const locales = todas.filter((u) => !NATIVAS_GHL.has(u));
console.log(`Nativas de GHL (verificadas en producción, no en local): ${todas.length - locales.length}`);
  console.log(`Sitemaps: ${sitemaps.length} · URLs únicas: ${todas.length} · comprobando todas…`);
const t0 = Date.now();
const res = await enParalelo(locales, 12, async (u) => {
  const { hostname, pathname } = new URL(u);
  const r = await trae(hostname, pathname);
  const canon = (r.txt.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i) || [])[1] || null;
  const ogUrl = (r.txt.match(/<meta[^>]*property=["']og:url["'][^>]*content=["']([^"']+)["']/i) || [])[1] || null;
  const hreflang = [...r.txt.matchAll(/<link[^>]*rel=["']alternate["'][^>]*hreflang=["']([^"']+)["'][^>]*href=["']([^"']+)["']/gi)].map((m) => m[2]);
  const robots = (r.txt.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']+)["']/i) || [])[1] || null;
  // En las landings (host de pueblo y comunidades) el HTML es estático: no puede quedar plantilla.
  // Las páginas del sitio son plantillas de GHL y sus {{custom_values}} los sustituye GHL al publicar.
  const llaves = hostname === 'ilatekpr.com' ? 0 : (r.txt.match(/\{\{/g) || []).length;
  const problemasUrl = [];
  if (r.status !== 200) problemasUrl.push('HTTP ' + r.status);
  if (canon !== u) problemasUrl.push('canonical=' + (canon || 'ninguno'));
  if (hostname !== 'ilatekpr.com') {
    if (ogUrl !== u) problemasUrl.push('og:url=' + (ogUrl || 'ninguno'));
    if (!hreflang.includes(u)) problemasUrl.push('sin hreflang autorreferente');
  }
  if (robots && /noindex/i.test(robots)) problemasUrl.push('noindex');
  if (llaves) problemasUrl.push(llaves + ' «{{» sin sustituir');
  return { url: u, problemas: problemasUrl };
});
const malas = res.filter((r) => r.problemas.length);
for (const m of malas) problemas.push(`${m.url} → ${m.problemas.join(', ')}`);

await new Promise((r) => servidor.close(r));

/* ---------------- informe ---------------- */
console.log('\nSitemaps por host');
for (const s of sitemaps.sort((a, b) => b.urls.length - a.urls.length)) {
  console.log(`  ${String(s.urls.length).padStart(4)} URLs  ${s.url}`);
}
console.log(`\nURLs comprobadas: ${todas.length} · con problemas: ${malas.length} · duplicados entre sitemaps: ${[...agregadas.values()].filter((v) => v.length > 1).length} · ${Math.round((Date.now() - t0) / 1000)}s`);
if (problemas.length) {
  console.log(`\n${problemas.length} problema(s):`);
  problemas.slice(0, 40).forEach((p) => console.log('  ✗ ' + p));
  if (problemas.length > 40) console.log(`  … (+${problemas.length - 40})`);
  process.exit(1);
}
console.log('\nTodo en verde: 0 problemas, 0 duplicados, 0 URLs muertas.');

/* ---------------- --red: estado real de cada host en producción ---------------- */
if (process.argv.includes('--red')) {
  const probar = async (url) => {
    try {
      const ctl = new AbortController();
      const t = setTimeout(() => ctl.abort(), 12000);
      const r = await fetch(url, { redirect: 'follow', signal: ctl.signal, headers: { 'user-agent': 'Ilatek-Check/1.0' } });
      clearTimeout(t);
      return { status: r.status, txt: await r.text() };
    } catch {
      return { status: 0, txt: '' };
    }
  };
  const filas = await enParalelo(municipios, 8, async (m) => {
    const host = m + '.ilatekpr.com';
    const raiz = await probar('https://' + host + '/');
    const sm = await probar('https://' + host + '/sitemap.xml');
    const locs = locsDe(sm.txt);
    const propios = locs.filter((u) => new URL(u).hostname === host).length;
    const landings = locs.filter((u) => new URL(u).pathname.split('/').filter(Boolean).length === 2).length;
    const tipo = sm.status !== 200 ? 'sin sitemap (HTTP ' + sm.status + ')' : propios === locs.length && propios > 0 ? `sitemap del dominio (${locs.length} locs, landings=${landings})` : 'hereda el del sitio (' + locs.length + ' locs, ' + propios + ' de este host)';
    return { host, raiz: raiz.status, tipo, landings };
  });
  const vivos = filas.filter((f) => f.raiz === 200).length;
  const propios = filas.filter((f) => f.tipo.startsWith('sitemap del dominio')).length;
  const conLandings = filas.filter((f) => f.landings > 0).length;
  const heredan = filas.filter((f) => f.tipo.startsWith('hereda')).length;
  const sin = filas.filter((f) => f.raiz !== 200);
  console.log(`\nProducción: ${vivos}/${filas.length} hosts de pueblo responden 200 en «/» · ${propios} con sitemap de dominio · ${heredan} heredan el del sitio · ${conLandings} anuncian ya landings propias`);
  const ejemplo = filas.find((f) => f.tipo.startsWith('hereda')) || filas[0];
  console.log(`  ejemplo ${ejemplo.host}: ${ejemplo.tipo}`);
  if (sin.length) console.log('  sin respuesta: ' + sin.map((f) => `${f.host}(${f.raiz || 'sin DNS/TLS'})`).join(', '));
}
