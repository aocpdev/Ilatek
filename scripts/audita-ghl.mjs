// Auditoría del lote de publicación a GHL: SOLO el website y el blog.
// Las comunidades NO se publican: el mapa /comunidades, /en/communities, las landings y los pueblos
// quedan fuera del alcance (se listan para que la decisión sea explícita).
// FAIL = algo está mal y hay que arreglarlo antes de pegar. AVISO = dato que necesita tu decisión.
// Uso: node scripts/audita-ghl.mjs [--red]   (--red consulta además el estado real en producción)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = path.resolve(import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const GHL = path.join(ROOT, 'GHL-PUBLICAR');
const SITE = 'https://ilatekpr.com';

const leer = (p) => fs.readFileSync(p, 'utf8');
const existe = (p) => fs.existsSync(p);
const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const bytes = (p) => fs.statSync(p).size;
const muestra = (a, n = 4) => (a.length <= n ? a.join('; ') : a.slice(0, n).join('; ') + ` … (+${a.length - n})`);
const locsDe = (txt) => [...txt.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
// Quita comentarios, <script> y <style>: sus cadenas contienen cosas como «<html lang>» o «t<titles»
// que no son etiquetas del documento.
const sinCodigo = (h) => h.replace(/<!--[\s\S]*?-->/g, '').replace(/<script\b[\s\S]*?<\/script>/gi, '').replace(/<style\b[\s\S]*?<\/style>/gi, '');
const xmlOk = (txt) => /^<\?xml[^>]*\?>\s*(<!--[\s\S]*?-->\s*)*<(urlset|sitemapindex)[^>]*>[\s\S]*<\/(urlset|sitemapindex)>\s*$/.test(txt);

let fallos = 0;
let avisos = 0;
const check = (nombre, ok, detalle = '') => {
  if (!ok) fallos++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${nombre}`);
  if (detalle) console.log('      ' + detalle);
};
const aviso = (nombre, detalle) => {
  avisos++;
  console.log('AVISO ' + nombre);
  if (detalle) console.log('      ' + detalle);
};
const info = (texto) => console.log('      ' + texto);

function csv(ruta) {
  if (!existe(ruta)) return [];
  const lineas = leer(ruta).split(/\r?\n/).filter((l) => l.trim());
  const cab = lineas.shift().split(';').map((c) => c.trim());
  return lineas.map((l) => {
    const v = l.split(';');
    const o = {};
    cab.forEach((c, i) => (o[c] = (v[i] || '').trim()));
    return o;
  });
}

/* ============================================================== 1) WEBSITE */
const sitio = csv(path.join(GHL, 'lote-sitio/00-CHECKLIST.csv'));
const sitioDir = path.join(GHL, 'lote-sitio/por-pagina');
const canons = new Map();
{
  const faltan = [];
  const bytesMal = [];
  const hashMal = [];
  const conDocumento = [];
  const sinCanonical = [];
  const alias = [];
  const nuevasSinDesc = [];
  for (const f of sitio) {
    const dir = path.join(sitioDir, f.carpeta);
    const frag = path.join(dir, '2-CODIGO-CUSTOM-HTML.html');
    if (!existe(frag) || !existe(path.join(dir, '1-PAGINA.txt'))) {
      faltan.push(f.carpeta);
      continue;
    }
    if (bytes(frag) !== Number(f.bytes)) bytesMal.push(`${f.carpeta}(${bytes(frag)}≠${f.bytes})`);
    if (sha(frag) !== f.sha256) hashMal.push(f.carpeta);
    const h = leer(frag);
    if (/^\s*(<!DOCTYPE|<html[\s>])/i.test(h) || /<head(?=[\s>])|<body(?=[\s>])/i.test(sinCodigo(h))) conDocumento.push(f.carpeta);
    const c = [...h.matchAll(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/gi)].map((m) => m[1]);
    if (!c.length) sinCanonical.push(f.url);
    else {
      canons.set(f.url, c[0]);
      if (c[0] !== f.url) alias.push(`${f.slug} → ${c[0]}`);
    }
    const sinDesc = !/<meta[^>]*name=["']description["']/i.test(h);
    if (f.accion.startsWith('CREAR') && sinDesc) nuevasSinDesc.push(f.slug);
  }

  check(
    `Website: ${sitio.length} paquetes completos (1-PAGINA + código)`,
    sitio.length > 0 && faltan.length === 0,
    faltan.length ? 'incompletos: ' + muestra(faltan) : `${sitio.length} carpetas en lote-sitio/por-pagina`
  );
  check(
    'Website: copia íntegra (bytes y sha256 del checklist coinciden)',
    bytesMal.length === 0 && hashMal.length === 0,
    `bytes distintos=${bytesMal.length} · sha256 distintos=${hashMal.length}` + (bytesMal.length ? ' (' + muestra(bytesMal) + ')' : '')
  );
  const fueraDeAlcance = new Set(sitio.filter((f) => /^(comunidades|en\/communities)$/.test(f.slug)).map((f) => f.carpeta));
  const documentosEnAlcance = conDocumento.filter((c) => !fueraDeAlcance.has(c));
  check(
    'Website: cada archivo del alcance es un fragmento (sin <!DOCTYPE>/<html>/<head>/<body> propios)',
    documentosEnAlcance.length === 0,
    documentosEnAlcance.length
      ? 'con documento completo: ' + muestra(documentosEnAlcance)
      : `${sitio.length - fueraDeAlcance.size} fragmentos para Custom Code` +
          (conDocumento.length ? ` · fuera de alcance (mapa de comunidades): ${conDocumento.join(', ')}` : '')
  );

  /* enlaces del lote a páginas que no se van a publicar */
  const enlaceCom = [];
  const enlaceComEn = [];
  for (const f of sitio) {
    const frag = path.join(sitioDir, f.carpeta, '2-CODIGO-CUSTOM-HTML.html');
    if (!existe(frag)) continue;
    const h = leer(frag);
    if (/href="[^"]*\/comunidades"/i.test(h)) enlaceCom.push(f.slug);
    if (/href="[^"]*\/en\/communities"/i.test(h)) enlaceComEn.push(f.slug);
  }
  check(
    'Website: ningún enlace del lote apunta a una página que no se publica',
    enlaceCom.length === 0 && enlaceComEn.length === 0,
    `${enlaceCom.length} página(s) enlazan a /comunidades y ${enlaceComEn.length} a /en/communities, que no se publican` +
      (enlaceCom.length ? ' (' + muestra(enlaceCom.map((s) => '/' + s)) + ')' : '')
  );
  aviso(
    'Website: metadatos en el paquete',
    `${sitio.length - sinCanonical.length} con canonical · ${sinCanonical.length} sin canonical (lo pone el panel SEO de GHL) · ` +
      `${alias.length} con canonical distinto de su propia URL`
  );
  if (alias.length) info('canonical ajeno (¿alias deliberado? quedarían sin indexar): ' + muestra(alias));
  if (sinCanonical.length) info('sin canonical en el paquete: ' + muestra(sinCanonical.map((u) => u.replace(SITE, ''))));
  if (nuevasSinDesc.length) {
    aviso(
      `${nuevasSinDesc.length} de las ${sitio.filter((f) => f.accion.startsWith('CREAR')).length} páginas NUEVAS no traen meta description`,
      'hay que escribirla en el panel SEO al crearlas: ' + muestra(nuevasSinDesc)
    );
  }

  /* sitemap del sitio ↔ lote (la lista blanca son páginas vivas que no se republican) */
  const paginas = locsDe(leer(path.join(ROOT, 'sitemap-paginas.xml')));
  const delLote = new Set(sitio.map((f) => f.url.replace(/\/$/, '') || SITE));
  const sinPaquete = paginas.filter((u) => !delLote.has(u.replace(/\/$/, '') || SITE));
  aviso(
    'sitemap-paginas.xml vs lote',
    `${paginas.length} URLs anunciadas · ${sinPaquete.length} no tienen paquete y deben seguir vivas por su cuenta: ` + muestra(sinPaquete)
  );

  const deComunidades = sitio.filter((f) => /^(comunidades|en\/communities)$/.test(f.slug));
  aviso(
    'Páginas de Comunidades dentro del lote',
    `${deComunidades.length} en el lote y FUERA del alcance: ` + muestra(deComunidades.map((f) => f.carpeta + ' → ' + f.url)) +
      ' · si no se publican, cualquier enlace del menú a /comunidades o /en/communities quedará en 404'
  );
}

/* ============================================================== 2) BLOG */
const blog = csv(path.join(GHL, '00-CHECKLIST.csv'));
const blogDir = path.join(GHL, 'por-pagina');
{
  const faltan = [];
  const tituloMal = [];
  const canonMal = [];
  const ogMal = [];
  const seoMal = [];
  const fragSucio = [];
  const jsonMal = [];
  for (const f of blog) {
    const dir = path.join(blogDir, f.carpeta);
    const requeridos = ['1-PAGINA.txt', '2-CODIGO-CUSTOM-HTML.html', '3-HEAD-SEO.html', '4-SEO-CAMPOS.txt'];
    const malos = requeridos.filter((a) => !existe(path.join(dir, a)) || bytes(path.join(dir, a)) === 0);
    if (malos.length) {
      faltan.push(`${f.carpeta}: ${malos.join(', ')}`);
      continue;
    }
    const head = leer(path.join(dir, '3-HEAD-SEO.html'));
    const frag = leer(path.join(dir, '2-CODIGO-CUSTOM-HTML.html'));
    const seo = leer(path.join(dir, '4-SEO-CAMPOS.txt'));

    const titulos = (head.match(/<title[\s>]/gi) || []).length;
    const canon = (head.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i) || [])[1];
    const og = (head.match(/<meta[^>]*property=["']og:url["'][^>]*content=["']([^"']+)["']/i) || [])[1];
    if (titulos !== 1) tituloMal.push(`${f.carpeta}(${titulos})`);
    if (canon !== f.url) canonMal.push(`${f.carpeta}: ${canon || 'sin canonical'}`);
    if (og !== f.url) ogMal.push(`${f.carpeta}: ${og || 'sin og:url'}`);

    const campoT = (seo.match(/^Title:\s*(.+)$/m) || [])[1];
    const campoC = (seo.match(/^Canonical:\s*(.+)$/m) || [])[1];
    const campoI = (seo.match(/^Social image:\s*(.+)$/m) || [])[1];
    const tituloHead = ((head.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '').trim();
    if (campoT !== f.title || campoT !== tituloHead || campoC !== f.url || !/^https:\/\//.test(campoI || '')) seoMal.push(f.carpeta);

    // El fragmento se pega dentro de Custom Code: no puede traer metadatos de documento.
    // (<title id="…"> de una figura SVG es contenido legítimo, no un título de documento.)
    const limpio = sinCodigo(frag);
    const tituloDocumento = /<title(?=[\s>])(?![^>]*\sid=)/i.test(limpio);
    if (tituloDocumento || /<head(?=[\s>])|<html(?=[\s>])|<body(?=[\s>])|rel=["']canonical["']/i.test(limpio)) {
      fragSucio.push(f.carpeta);
    }
    for (const m of head.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
      try {
        JSON.parse(m[1]);
      } catch {
        jsonMal.push(f.carpeta);
      }
    }
  }

  check(
    `Blog: ${blog.length} paquetes con sus 4 archivos`,
    blog.length === 138 && faltan.length === 0,
    faltan.length ? 'incompletos: ' + muestra(faltan) : `${blog.length} carpetas × 4 archivos`
  );
  check(
    'Blog: HEAD con un solo <title>, canonical y og:url iguales a la URL',
    tituloMal.length === 0 && canonMal.length === 0 && ogMal.length === 0,
    `títulos≠1=${tituloMal.length} · canonical distinto=${canonMal.length}${canonMal.length ? ' (' + muestra(canonMal) + ')' : ''} · og:url distinto=${ogMal.length}`
  );
  check(
    'Blog: campos del panel SEO casan con el HEAD y con el checklist',
    seoMal.length === 0,
    seoMal.length ? 'incoherentes: ' + muestra(seoMal) : 'Title, Canonical y Social image coinciden en las 138'
  );
  check(
    'Blog: el fragmento de Custom Code no trae metadatos de documento',
    fragSucio.length === 0,
    fragSucio.length ? 'con metadatos: ' + muestra(fragSucio) : '138 fragmentos limpios'
  );
  check('Blog: JSON-LD válido en el HEAD', jsonMal.length === 0, jsonMal.length ? 'JSON roto: ' + muestra(jsonMal) : 'todos los bloques parsean');
}

/* ============================================================== 3) DOMINIO */
{
  const packBlog = path.join(GHL, 'sitio/sitemap-blog.xml');
  const packLocs = existe(packBlog) ? locsDe(leer(packBlog)) : [];
  const publicables = blog.map((f) => f.url);
  const sobran = packLocs.filter((u) => !publicables.includes(u));
  const faltanAnuncio = publicables.filter((u) => !packLocs.includes(u));
  check(
    'Sitemap que se sube (GHL-PUBLICAR/sitio/sitemap-blog.xml): solo las 138 páginas del lote',
    existe(packBlog) && xmlOk(leer(packBlog)) && new Set(packLocs).size === packLocs.length && sobran.length === 0 && faltanAnuncio.length === 0,
    `${packLocs.length} URLs · duplicadas=${packLocs.length - new Set(packLocs).size} · anunciadas sin página=${sobran.length}` +
      (sobran.length ? ' (' + muestra(sobran) + ')' : '') +
      ` · páginas sin anunciar=${faltanAnuncio.length}` + (faltanAnuncio.length ? ' (' + muestra(faltanAnuncio) + ')' : '')
  );

  const buildBlog = path.join(ROOT, 'blog/sitemap-blog.xml');
  const buildLocs = locsDe(leer(buildBlog));
  const enBuild = buildLocs.filter((u) => /\/blog\/en/.test(u));
  if (buildLocs.length !== packLocs.length) {
    aviso(
      `blog/sitemap-blog.xml (build) anuncia ${buildLocs.length} URLs y el que se sube ${packLocs.length}`,
      `${enBuild.length} son /blog/en/*: existen ${fs.existsSync(path.join(ROOT, 'blog/en')) ? 'como HTML en blog/en' : ''} pero no tienen paquete GHL; ` +
        'o se empaquetan, o se quedan fuera del sitemap que se sube (hoy ya están fuera: se sube el del pack)'
    );
  }

  const robots = leer(path.join(GHL, 'sitio/robots.txt'));
  const declara = [...robots.matchAll(/^\s*Sitemap:\s*(\S+)/gim)].map((m) => m[1]);
  check(
    'robots.txt del pack: permite /blog/ y declara los dos sitemaps',
    /^\s*Allow:\s*\/blog\//im.test(robots) && declara.includes(SITE + '/sitemap.xml') && declara.includes(SITE + '/blog/sitemap-blog.xml'),
    `declarados: [${declara.join(', ')}] · Allow /blog/=${/^\s*Allow:\s*\/blog\//im.test(robots) ? 'sí' : 'NO'}`
  );

  const rootRobots = leer(path.join(ROOT, 'robots.txt'));
  const rootDeclara = [...rootRobots.matchAll(/^\s*Sitemap:\s*(\S+)/gim)].map((m) => m[1]);
  if (!rootDeclara.includes(SITE + '/blog/sitemap-blog.xml')) {
    aviso(
      'El robots.txt de la raíz del repo aún no declara el sitemap del blog',
      'el que se sube es GHL-PUBLICAR/sitio/robots.txt (sí lo declara). Si subes el de la raíz, el blog no se anuncia.'
    );
  }

  const indice = leer(path.join(ROOT, 'sitemap.xml'));
  const hijos = [...indice.matchAll(/<sitemap>[\s\S]*?<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  const permitidos = new Set([SITE + '/sitemap-paginas.xml', SITE + '/blog/sitemap-blog.xml']);
  check(
    'sitemap.xml: índice válido, sin hosts ni hijos ajenos',
    xmlOk(indice) && /<sitemapindex/i.test(indice) && hijos.every((h) => permitidos.has(h)) && hijos.includes(SITE + '/sitemap-paginas.xml'),
    `${hijos.length} hijo(s): ${hijos.join(', ')}`
  );
  if (!hijos.includes(SITE + '/blog/sitemap-blog.xml')) {
    aviso(
      'El índice no lista el sitemap del blog',
      'no bloquea: robots.txt lo declara directamente, que es suficiente para Google y Bing.'
    );
  }

  const packSitio = ['sitio/sitemap.xml', 'sitio/sitemap-paginas.xml'].filter((f) => existe(path.join(GHL, f)));
  if (!packSitio.length) {
    aviso(
      'El pack de dominio no incluye el sitemap del sitio',
      'GHL genera /sitemap.xml por su cuenta (hoy sirve 60 URLs con su propio formato): el índice del repo sirve para\n' +
        '      verificar, no es un archivo que se suba. Si quieres controlar el sitemap del sitio, hay que subir los dos archivos\n' +
        '      y desactivar el automático de GHL.'
    );
  }

  const llms = ['sitio/llms.txt', 'sitio/llms-blog.txt'].filter((f) => !existe(path.join(GHL, f)) || bytes(path.join(GHL, f)) === 0);
  check('Dominio: llms.txt y llms-blog.txt presentes', llms.length === 0, llms.length ? 'faltan: ' + llms.join(', ') : 'ambos con contenido');
}

/* ============================================================== 4) RED (opcional) */
if (process.argv.includes('--red')) {
  const trae = async (u) => {
    try {
      const ctl = new AbortController();
      const t = setTimeout(() => ctl.abort(), 15000);
      const r = await fetch(u, { redirect: 'follow', signal: ctl.signal, headers: { 'user-agent': 'Ilatek-Audit/1.0' } });
      clearTimeout(t);
      await r.text();
      return r.status;
    } catch {
      return 0;
    }
  };
  const estado = async (lista) => {
    const out = new Map();
    let i = 0;
    await Promise.all(
      Array.from({ length: 8 }, async () => {
        while (i < lista.length) {
          const k = i++;
          out.set(lista[k], await trae(lista[k]));
        }
      })
    );
    return out;
  };
  const sitioUrls = sitio.map((f) => f.url);
  const blogUrls = blog.map((f) => f.url);
  const s = await estado(sitioUrls);
  const b = await estado(blogUrls);
  const cuenta = (m) => [...m.values()].reduce((a, c) => ((a[c] = (a[c] || 0) + 1), a), {});
  console.log(`\nProducción · website (${sitioUrls.length}): ${JSON.stringify(cuenta(s))}`);
  console.log(`Producción · blog (${blogUrls.length}): ${JSON.stringify(cuenta(b))}`);
  const aliasVivos = [...canons.entries()].filter(([u, c]) => c !== u);
  if (aliasVivos.length) {
    const destinos = await estado([...new Set(aliasVivos.map(([, c]) => c))]);
    const rotos = aliasVivos.filter(([, c]) => destinos.get(c) !== 200);
    console.log(`Canonical de las ${aliasVivos.length} páginas con canonical ajeno: ${aliasVivos.length - rotos.length} apuntan a una URL viva, ${rotos.length} a una que no responde`);
    if (rotos.length) console.log('  destinos muertos: ' + muestra(rotos.map(([u, c]) => c)));
  }
}

console.log(`\n${fallos === 0 ? 'Sin fallos de integridad.' : fallos + ' fallo(s) de integridad.'} · ${avisos} aviso(s) que requieren tu decisión.`);
process.exit(fallos ? 1 : 0);
