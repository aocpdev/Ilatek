// Verificación local del estado "listo para publicar" del repo Ilatek.
// Uso: node scripts/verifica-publicacion.mjs
// No toca archivos: solo lee disco. Salida: PASS/FAIL por comprobación y exit code 1 si algo falla.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const SITE = 'https://ilatekpr.com';
const SUB = 'https://comunidades.ilatekpr.com';
const EXCL = /(^|\/)(node_modules|\.git|documentacion|archivo|__pycache__|\.backups-uiux|\.tmp)/i;

const rel = (p) => path.relative(ROOT, p).replace(/\\/g, '/');
function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (EXCL.test(rel(p))) continue;
    if (e.isDirectory()) walk(p, acc);
    else if (/\.html$/i.test(e.name)) acc.push(p);
  }
  return acc;
}
const html = walk(ROOT);
const leer = (p) => fs.readFileSync(p, 'utf8');

const resultados = [];
const check = (nombre, cond, detalle) => resultados.push({ nombre, ok: !!cond, detalle });
const muestra = (arr, n = 6) => arr.slice(0, n).join(', ') + (arr.length > n ? ` … (+${arr.length - n})` : '');

/* ---------------------------------------------------------------- 1) MENÚ GLOBAL (censo completo) */
// Qué NO es publicable, con el motivo. Todo lo que no caiga aquí se considera publicable
// y está obligado a llevar la entrada Comunidades bilingüe.
const CENSO_EXCLUSIONES = [
  { re: /^documentacion\//i, motivo: 'documentación y respaldos verificados (no se publica)' },
  { re: /^home-page\/\.backups-uiux\//i, motivo: 'copia de la UI anterior' },
  { re: /^archivo\//i, motivo: 'archivo histórico de versiones' },
  { re: /(^|\/)\.tmp/i, motivo: 'temporales y volcados .tmp*' },
  { re: /(^|\/)(node_modules|\.git|__pycache__)\//i, motivo: 'dependencias y metadatos' }
];
{
  const todos = [];
  (function walkTodo(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (/(^|\/)(node_modules|\.git|__pycache__)(\/|$)/i.test(rel(p))) continue;
      if (e.isDirectory()) walkTodo(p);
      else if (/\.html$/i.test(e.name)) todos.push(p);
    }
  })(ROOT);

  const censo = new Map();
  const sinEntradaPublicable = [];
  const sinEntradaBackup = [];
  let publicables = 0;
  let backups = 0;
  let es = 0;
  let en = 0;

  for (const p of todos) {
    const h = leer(p);
    const i = h.indexOf('<nav class="iln-links"');
    if (i < 0) continue;
    const r = rel(p);
    const j = h.indexOf('</nav>', i);
    const nav = h.slice(i, j > 0 ? j : i + 8000);
    const esNav = !/aria-label="Main navigation"/.test(nav.slice(0, 240));
    const ruta = esNav ? '/comunidades' : '/en/communities';
    const anclas = [...nav.matchAll(/<a\b[^>]*data-ilatek-path="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].filter(
      (m) => m[1] === '/comunidades' || m[1] === '/en/communities'
    );
    const bilingues = anclas.filter(
      (m) => /data-es="Comunidades"/.test(m[0]) && /data-en="Communities"/.test(m[0])
    );
    const correcta = bilingues.length === 1 && anclas.every((m) => m[1] === ruta);

    const excl = CENSO_EXCLUSIONES.find((x) => x.re.test(r));
    const clase = excl ? excl.motivo : 'publicable';
    const dir = r.includes('/') ? r.split('/')[0] + '/' : '(raíz)';
    const k = `${dir} · ${clase}`;
    const fila = censo.get(k) || { archivos: 0, es: 0, en: 0, sinEntrada: 0 };
    fila.archivos++;
    if (esNav) { fila.es++; es++; } else { fila.en++; en++; }
    if (!correcta) fila.sinEntrada++;
    censo.set(k, fila);

    if (excl) {
      backups++;
      if (!correcta) sinEntradaBackup.push(r);
    } else {
      publicables++;
      if (!correcta) sinEntradaPublicable.push(`${r} (${anclas.length} anclas, ${bilingues.length} bilingües)`);
    }
  }

  const lineas = [...censo.entries()]
    .sort((a, b) => b[1].archivos - a[1].archivos)
    .map(([k, v]) => `        ${String(v.archivos).padStart(4)}  ${k}  (${v.es} ES, ${v.en} EN, sin entrada: ${v.sinEntrada})`);
  const detalle =
    `\n        CENSO por directorio y clasificación (${todos.length} .html recorridos):\n` +
    lineas.join('\n') +
    `\n        TOTAL ${publicables + backups} archivos con el bloque: ${publicables} publicables + ${backups} backups/copias` +
    `\n        exclusiones codificadas: ${CENSO_EXCLUSIONES.map((x) => x.re.source + ' → ' + x.motivo).join(' | ')}` +
    `\n        publicables sin la entrada bilingüe: ${sinEntradaPublicable.length}` +
    (sinEntradaPublicable.length ? ' → ' + muestra(sinEntradaPublicable, 10) : '') +
    `\n        backups sin la entrada (no bloquean): ${sinEntradaBackup.length}`;

  check(
    'Censo del menú global: 0 archivos publicables sin entrada Comunidades bilingüe',
    publicables > 0 && sinEntradaPublicable.length === 0 && es + en === publicables + backups,
    detalle
  );
}

/* ---------------------------------------------------------------- 2) PÁGINA DEL MAPA */
{
  const paginas = [
    ['Comunidades/landing-pages/comunidades.html', 'es'],
    ['Comunidades/en/landing-pages/communities.en.html', 'en']
  ];
  const piezas = [
    [/maplibre-gl@5\.24\.0/i, 'MapLibre 5.24.0'],
    [/integrity\s*[:=]\s*['"]sha(384|512)-/i, 'SRI del script de MapLibre'],
    [/mapterhorn/i, 'terreno Mapterhorn'],
    [/setTerrain\s*\(/i, 'setTerrain()'],
    [/setProjection\(\s*\{\s*type\s*:\s*['"]globe['"]/i, 'proyección globe'],
    [/\bsky\b/i, 'sky'],
    [/maxPitch\s*:\s*85/i, 'maxPitch 85'],
    [/fill-extrusion/i, 'extrusión 3D'],
    [/World_Imagery|arcgisonline/i, 'satélite ESRI World Imagery'],
    [/cluster\s*:\s*true/i, 'clustering'],
    [/clusterRadius/i, 'clusterRadius'],
    [/ilk-com-capas/i, 'fila de capas'],
    [/>Zonas<|data-es="Zonas"/i, 'tab Zonas'],
    [/>Clima<|data-es="Clima"/i, 'tab Clima'],
    [/ilk-com-3dbar/i, 'barra 2D · 3D'],
    [/reduced-motion/i, 'prefers-reduced-motion'],
    [/application\/ld\+json/i, 'JSON-LD']
  ];
  for (const [f, idioma] of paginas) {
    const h = leer(path.join(ROOT, f));
    const faltan = piezas.filter(([re]) => !re.test(h)).map(([, n]) => n);
    const com = (h.match(/\{"n":"/g) || []).length;
    const enlaces = (h.match(/sellado-de-techo/g) || []).length + (h.match(/\/limpieza/g) || []).length;
    const imgs = [...h.matchAll(/<img\b[^>]*>/gi)];
    const sinAlt = imgs.filter((m) => !/\balt\s*=\s*"/i.test(m[0]));
    const ld = h.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    let tipos = [];
    try {
      tipos = JSON.parse(ld[1])['@graph'].map((x) => x['@type']);
    } catch {}
    const tresLd = ['WebPage', 'BreadcrumbList', 'ItemList'].every((t) => tipos.includes(t));
    const sinContador = !/ilk-com__contador|ilk-com-contador/i.test(h);
    check(
      `Mapa ${idioma === 'es' ? 'ES' : 'EN'} conforme al plan`,
      faltan.length === 0 && com === 556 && tresLd && sinAlt.length === 0 && sinContador,
      `piezas ${piezas.length - faltan.length}/${piezas.length}` +
        (faltan.length ? ' · faltan: ' + faltan.join(', ') : '') +
        ` · comunidades=${com} · menciones de servicio=${enlaces} · imgs sin alt=${sinAlt.length}` +
        ` · JSON-LD=${tipos.join('+') || 'no'} · burbuja de contador=${sinContador ? 'eliminada' : 'PRESENTE'}`
    );
  }
}

/* ---------------------------------------------------------------- XML */
function validaXml(txt, etiqueta) {
  const errores = [];
  if (!/^<\?xml\s+version="1\.0"/.test(txt)) errores.push('sin declaración XML');
  const sinComentarios = txt.replace(/<!--[\s\S]*?-->/g, '').replace(/<\?[\s\S]*?\?>/g, '');
  const amp = sinComentarios.match(/&(?!(amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g);
  if (amp) errores.push(`${amp.length} «&» sin escapar`);
  const pila = [];
  let raices = 0;
  for (const m of sinComentarios.matchAll(/<(\/?)([A-Za-z_][\w:.-]*)((?:\s+[\w:.-]+\s*=\s*"[^"]*")*)\s*(\/?)>/g)) {
    const [, cierre, nombre, attrs, auto] = m;
    if (attrs.replace(/\s+[\w:.-]+\s*=\s*"[^"]*"/g, '').trim() !== '') errores.push(`atributos mal formados en <${nombre}>`);
    if (cierre) {
      const ult = pila.pop();
      if (ult !== nombre) errores.push(`cierre </${nombre}> no casa con <${ult ?? 'nada'}>`);
    } else if (!auto) {
      pila.push(nombre);
    }
    if (pila.length === 1 && !cierre) raices++;
  }
  if (pila.length) errores.push(`etiquetas sin cerrar: ${pila.join(', ')}`);
  if (raices !== 1) errores.push(`${raices} elementos raíz`);
  const abiertos = (sinComentarios.match(/</g) || []).length;
  const cerrados = (sinComentarios.match(/>/g) || []).length;
  if (abiertos !== cerrados) errores.push('«<» y «>» descompensados');
  check(`XML válido · ${etiqueta}`, errores.length === 0, errores.length ? errores.slice(0, 5).join(' | ') : 'bien formado (declaración, raíz única, balance y entidades)');
  return sinComentarios;
}

/* ---------------------------------------------------------------- 3) SITEMAPS */
{
  /* 3a. principal: solo URLs vivas y con página en el repo */
  const xml = leer(path.join(ROOT, 'sitemap-paginas.xml'));
  const limpio = validaXml(xml, 'sitemap-paginas.xml del sitio');
  const locs = [...limpio.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  const normaliza = (u) => u.replace(/\/$/, '');
  const dups = locs.filter((u, i) => locs.findIndex((v) => normaliza(v) === normaliza(u)) !== i);
  const profundidades = locs.map((u) => new URL(u).pathname.split('/').filter(Boolean).length);
  const desordenado = profundidades.filter((d, i) => i > 0 && d < profundidades[i - 1]).length;

  const indice = new Map();
  for (const p of html) {
    const h = leer(p);
    for (const m of h.matchAll(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/gi)) {
      const u = m[1].trim().replace(/\/$/, '') || SITE;
      if (!indice.has(u)) indice.set(u, rel(p));
    }
  }
  // Páginas nativas de GHL sin código en el repo (200 y canonical propio verificado en producción).
  const NATIVAS_GHL = new Set(['https://ilatekpr.com/contactanos', 'https://ilatekpr.com/reclutamiento-empleo-techos']);
  const sinArchivo = locs.filter((u) => {
    const limpia = u.replace(/\/$/, '') || SITE;
    return !indice.has(limpia) && !NATIVAS_GHL.has(limpia);
  });
  check(
    'Sitemap del sitio: jerárquico, sin duplicados y con página en disco',
    locs.length > 0 && dups.length === 0 && desordenado === 0 && sinArchivo.length === 0,
    `${locs.length} URLs · duplicados=${dups.length} · fuera de orden=${desordenado}` +
      (sinArchivo.length ? ' · sin archivo: ' + muestra(sinArchivo) : ' · todas con página en el repo')
  );

  /* 3a2. el índice del host principal */
  const xmlIndice = leer(path.join(ROOT, 'sitemap.xml'));
  const limpioIndice = validaXml(xmlIndice, 'sitemap.xml (índice)');
  const esIndice = /<sitemapindex/i.test(limpioIndice);
  const hijos = [...limpioIndice.matchAll(/<sitemap>[\s\S]*?<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  const conocidos = new Set([SITE + '/sitemap-paginas.xml', SITE + '/blog/sitemap-blog.xml']);
  const raros = hijos.filter((h) => !conocidos.has(h));
  const anunciadoBlog = hijos.includes(SITE + '/blog/sitemap-blog.xml');
  const locales = [...html].length;
  check(
    'sitemap.xml es un índice con hijos conocidos y sin hosts ajenos',
    esIndice && hijos.length > 0 && raros.length === 0 && hijos.includes(SITE + '/sitemap-paginas.xml'),
    `${hijos.length} hijo(s): ${hijos.join(', ')}${raros.length ? ' · desconocidos: ' + muestra(raros) : ''} · blog anunciado=${anunciadoBlog ? 'sí' : 'no ( /blog sigue en 404 )'} · páginas del repo=${locales}`
  );

  /* 3b. sitemaps de pueblo: un host por municipio, 1.112 landings en total */
  const pueblosDir = path.join(ROOT, 'Comunidades/pueblos');
  const munis = fs
    .readdirSync(pueblosDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
  const fallosP = [];
  const vistas = new Map();
  let totalP = 0;
  let sinArchivoP = 0;
  let canonMal = 0;
  let desordenP = 0;
  let robotsMal = 0;
  for (const m of munis) {
    const rutaS = path.join(pueblosDir, m, 'sitemap.xml');
    if (!fs.existsSync(rutaS)) {
      fallosP.push(`${m}: sin sitemap.xml`);
      continue;
    }
    const xmlP = leer(rutaS);
    if (!/^<\?xml[^>]*\?>\s*(<!--[\s\S]*?-->\s*)*<urlset[^>]*>[\s\S]*<\/urlset>\s*$/.test(xmlP)) fallosP.push(`${m}: XML mal formado`);
    const urls = [...xmlP.matchAll(/<loc>([^<]+)<\/loc>/g)].map((x) => x[1].trim());
    if (!urls.length) fallosP.push(`${m}: sitemap vacío`);
    totalP += urls.length;
    let previaCom = '';
    let previaSvc = '';
    for (const u of urls) {
      const { hostname, pathname } = new URL(u);
      if (hostname !== `${m}.ilatekpr.com`) fallosP.push(`${m}: URL de otro host ${u}`);
      const trozos = pathname.split('/').filter(Boolean);
      if (trozos.length !== 2) fallosP.push(`${m}: profundidad ${trozos.length} en ${u}`);
      const f = path.join(pueblosDir, m, ...trozos, 'index.html');
      if (!fs.existsSync(f)) sinArchivoP++;
      else {
        const canon = (leer(f).match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/i) || [])[1];
        if (canon !== u) canonMal++;
      }
      const [comActual, svcActual = ''] = trozos;
      if (previaCom && (comActual.localeCompare(previaCom, 'es') < 0 || (comActual === previaCom && svcActual.localeCompare(previaSvc, 'es') < 0))) desordenP++;
      previaCom = comActual;
      previaSvc = svcActual;
      const k = u.replace(/\/$/, '');
      vistas.set(k, (vistas.get(k) || 0) + 1);
    }
    const rb = fs.existsSync(path.join(pueblosDir, m, 'robots.txt')) ? leer(path.join(pueblosDir, m, 'robots.txt')) : '';
    if (!rb.includes(`Sitemap: https://${m}.ilatekpr.com/sitemap.xml`)) robotsMal++;
  }
  const repetidas = [...vistas.values()].filter((n) => n > 1).length;
  check(
    'Sitemaps de pueblo: 78 hosts, 1.112 URLs jerárquicas, autocanónicas y sin duplicados',
    munis.length === 78 && totalP === 1112 && fallosP.length === 0 && sinArchivoP === 0 && canonMal === 0 && desordenP === 0 && robotsMal === 0 && repetidas === 0,
    `${munis.length} hosts · ${totalP} URLs · sin archivo=${sinArchivoP} · canonical distinto=${canonMal} · desorden=${desordenP} · robots sin Sitemap=${robotsMal} · repetidas=${repetidas}` +
      (fallosP.length ? ' · ' + muestra(fallosP) : '')
  );

  /* 3b2. las 1.112 del host de comunidades canonicalizan a su copia del pueblo */
  let fuentesMal = 0;
  let fuentes = 0;
  (function walkF(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walkF(p);
      else if (e.name === 'index.html') {
        fuentes++;
        const trozos = path.relative(path.join(ROOT, 'Comunidades/landings'), p).replace(/\\/g, '/').split('/');
        const esperado = `https://${trozos[0]}.ilatekpr.com/${trozos[1]}/${trozos[2]}`;
        const canon = (leer(p).match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/i) || [])[1];
        if (canon !== esperado) fuentesMal++;
      }
    }
  })(path.join(ROOT, 'Comunidades/landings'));
  check(
    'Comunidades sin sitemap propio y canonicalizando al pueblo',
    !fs.existsSync(path.join(ROOT, 'Comunidades/landings/sitemap.xml')) && fuentes === 1112 && fuentesMal === 0,
    `sitemap retirado · ${fuentes} landings · canonical al pueblo=${fuentes - fuentesMal}/${fuentes}`
  );
}

/* ---------------------------------------------------------------- 3c) SITEMAP DEL BLOG */
{
  const ruta = path.join(ROOT, 'blog/sitemap-blog.xml');
  if (!fs.existsSync(ruta)) {
    check('Sitemap del blog listo pero no anunciado', false, 'no existe blog/sitemap-blog.xml');
  } else {
    const limpio = validaXml(leer(ruta), 'blog/sitemap-blog.xml');
    const locs = [...limpio.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
    const dups = locs.filter((u, i) => locs.indexOf(u) !== i);
    check(
      'Sitemap del blog válido, sin duplicados y no anunciado',
      locs.length > 0 && dups.length === 0,
      `${locs.length} URLs · duplicados=${dups.length} · robots.txt lo anuncia solo cuando /blog esté publicado`
    );
  }
}

/* ---------------------------------------------------------------- 4) ROBOTS */
{
  const r = leer(path.join(ROOT, 'robots.txt'));
  const activas = r
    .split('\n')
    .filter((l) => /^\s*Sitemap:/i.test(l))
    .map((l) => l.replace(/^\s*Sitemap:\s*/i, '').trim());
  const sub = leer(path.join(ROOT, 'Comunidades/landings/robots.txt'));
  const subActivas = sub
    .split('\n')
    .filter((l) => /^\s*Sitemap:/i.test(l))
    .map((l) => l.replace(/^\s*Sitemap:\s*/i, '').trim());
  check(
    'robots.txt declaran sitemaps vivos',
    activas.length === 1 && activas[0] === SITE + '/sitemap.xml' && subActivas.length === 0,
    `sitio: [${activas.join(', ') || '—'}] · comunidades: [${subActivas.join(', ') || 'sin sitemap (correcto: sus URLs apuntan al pueblo)'}]`
  );
}

/* ---------------------------------------------------------------- 5) LANDINGS SIN NOINDEX */
{
  const landings = [];
  (function walkL(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walkL(p);
      else if (e.name === 'index.html') landings.push(p);
    }
  })(path.join(ROOT, 'Comunidades/landings'));
  const conNoindex = landings.filter((p) => /<meta[^>]*name="robots"[^>]*content="[^"]*noindex/i.test(leer(p)));
  const sinAlt = landings.filter((p) => [...leer(p).matchAll(/<img\b[^>]*>/gi)].some((m) => !/\balt\s*=\s*"/i.test(m[0])));
  check('Landings indexables y con alt', conNoindex.length === 0 && sinAlt.length === 0, `${landings.length} landings · con noindex=${conNoindex.length} · con imgs sin alt=${sinAlt.length}`);
}

/* ---------------------------------------------------------------- 6) CANONICAL / HREFLANG */
{
  const conPlantilla = [];
  const multi = [];
  const paginas = [];
  for (const p of html) {
    const h = leer(p);
    const links = [...h.matchAll(/<link[^>]*rel="(canonical|alternate)"[^>]*>/gi)].map((m) => m[0]);
    if (links.some((t) => /\{\{/.test(t))) conPlantilla.push(rel(p));
    const canon = h.match(/<link[^>]*rel="canonical"[^>]*>/i);
    if (canon) {
      const n = (h.match(/<link[^>]*rel="canonical"/gi) || []).length;
      const esPagina = /<!doctype html/i.test(h) || /<html[\s>]/i.test(h);
      if (esPagina) {
        paginas.push(rel(p));
        if (n > 1) multi.push(`${rel(p)} (${n})`);
      }
    }
  }
  const cot = leer(path.join(ROOT, 'cotizacion-techos/ghl-cotizacion-techos-embed.html'));
  const canonCot = (cot.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/i) || [])[1];
  check(
    'Canonical propio, único y sin plantilla',
    conPlantilla.length === 0 && multi.length === 0 && canonCot === SITE + '/cotizacion',
    `con {{custom_values}} en canonical/hreflang=${conPlantilla.length}` +
      (conPlantilla.length ? ' (' + muestra(conPlantilla) + ')' : '') +
      ` · páginas con >1 canonical=${multi.length}` + (multi.length ? ' (' + muestra(multi) + ')' : '') +
      ` · /cotizacion → ${canonCot || '—'}`
  );
}

/* ---------------------------------------------------------------- 7) PÁGINA EN SIN ESPAÑOL */
{
  const h = leer(path.join(ROOT, 'Comunidades/en/landing-pages/communities.en.html'));
  const es = /\b(el|la|los|las|del|nuestros|nuestras|comunidad|comunidades|tiempo|experiencia|servicios|productos|oportunidades|próximas|recibe|precio|mapa|encuentra|reseñas|clientes)\b/i;
  const textos = [];
  const title = (h.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '';
  const desc = (h.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
  textos.push(['title', title], ['description', desc]);
  for (const m of h.matchAll(/<(h[1-3])[^>]*>([\s\S]{0,300}?)<\/\1>/gi)) {
    textos.push([m[1].toUpperCase(), m[2].replace(/<[^>]+>/g, ' ')]);
  }
  const sospechosos = textos
    .map(([k, t]) => [k, t.replace(/\s+/g, ' ').trim()])
    .filter(([, t]) => t && !/\{\{/.test(t) && !/'\s*\+/.test(t) && es.test(t));
  check('Página EN sin textos en español', sospechosos.length === 0, `${textos.length} textos revisados · en español=${sospechosos.length}` + (sospechosos.length ? ' · ' + muestra(sospechosos.map(([k, t]) => `${k}: ${t.slice(0, 60)}`)) : ''));
}

/* ---------------------------------------------------------------- 8) IMÁGENES CON ALT (todo el sitio) */
{
  const sinAlt = [];
  for (const p of html) {
    const imgs = [...leer(p).matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
    const malas = imgs.filter((t) => !/\balt\s*=\s*"/i.test(t));
    if (malas.length) sinAlt.push(`${rel(p)} (${malas.length})`);
  }
  check('Imágenes con alt en el repo', sinAlt.length === 0, sinAlt.length ? 'archivos con imgs sin alt: ' + muestra(sinAlt) : `${html.length} archivos revisados, 0 imgs sin alt`);
}

/* ---------------------------------------------------------------- INFORME */
let fallos = 0;
console.log('\nIlatek · verificación de publicación (' + new Date().toISOString().slice(0, 10) + ')\n');
for (const r of resultados) {
  if (!r.ok) fallos++;
  console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.nombre}\n      ${r.detalle}`);
}
console.log(`\n${resultados.length - fallos}/${resultados.length} comprobaciones en verde` + (fallos ? ` · ${fallos} en rojo` : ''));
process.exit(fallos ? 1 : 0);
