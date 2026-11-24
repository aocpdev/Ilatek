// Genera la malla de landings por pueblo:
//   Comunidades/pueblos/<municipio>/<comunidad>/<servicio>/index.html
//     · canonical, hreflang y og:url literales a sí misma
//     · assets resueltos contra comunidades.ilatekpr.com (el HTML vive 3 niveles arriba)
//   y deja la copia de comunidades.ilatekpr.com canonicalizando a la del pueblo,
//   para que no haya dos copias compitiendo.
// Además escribe un sitemap.xml y un robots.txt por host de pueblo.
// Uso: node scripts/genera-pueblos.mjs [--limpiar]
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const LANDINGS = path.join(ROOT, 'Comunidades/landings');
const PUEBLOS = path.join(ROOT, 'Comunidades/pueblos');
const SUB = 'https://comunidades.ilatekpr.com';
const NO_MUNICIPIOS = new Set(['hero', 'img', 'css', 'js', 'data', 'scripts']);

const soloDirs = (p) => fs.readdirSync(p, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name);

const munios = soloDirs(LANDINGS).filter((m) => !NO_MUNICIPIOS.has(m) && fs.existsSync(path.join(LANDINGS, m)));
const stats = { pueblos: 0, copias: 0, fuentesReanudadas: 0, sitemaps: 0, robots: 0, sinCambios: 0 };

for (const muni of munios.sort()) {
  const host = 'https://' + muni + '.ilatekpr.com';
  const dirMuni = path.join(LANDINGS, muni);
  const coms = soloDirs(dirMuni).sort();
  const urls = [];
  let conContenido = false;

  for (const com of coms) {
    const dirCom = path.join(dirMuni, com);
    const svcs = soloDirs(dirCom).sort();
    for (const svc of svcs) {
      const origen = path.join(dirCom, svc, 'index.html');
      if (!fs.existsSync(origen)) continue;
      conContenido = true;
      const comUrl = `${SUB}/${muni}/${com}/${svc}`;
      const townUrl = `${host}/${com}/${svc}`;
      const base = fs.readFileSync(origen, 'utf8');

      /* ---------- 1) copia del pueblo ---------- */
      let town = base
        .replace(/(href|src)="(?:\.\.\/)+/g, '$1="' + SUB + '/')
        .split(comUrl)
        .join(townUrl)
        .replace(/<link[^>]*rel="canonical"[^>]*>/i, `<link rel="canonical" href="${townUrl}">`)
        .replace(/<meta[^>]*property="og:url"[^>]*>/i, `<meta property="og:url" content="${townUrl}">`);

      // hreflang autorreferente (es-PR + x-default), una sola vez
      if (!/rel="alternate"[^>]*hreflang="es-PR"/i.test(town)) {
        const can = `<link rel="canonical" href="${townUrl}">`;
        town = town.replace(
          can,
          can +
            `\n<link rel="alternate" hreflang="es-PR" href="${townUrl}">` +
            `\n<link rel="alternate" hreflang="x-default" href="${townUrl}">`
        );
      }

      const destino = path.join(PUEBLOS, muni, com, svc, 'index.html');
      const previo = fs.existsSync(destino) ? fs.readFileSync(destino, 'utf8') : null;
      if (previo !== town) {
        fs.mkdirSync(path.dirname(destino), { recursive: true });
        fs.writeFileSync(destino, town);
        stats.copias++;
      } else stats.sinCambios++;
      urls.push(townUrl);

      /* ---------- 2) la copia de comunidades canonicaliza al pueblo ---------- */
      const fuente = base
        .replace(/<link[^>]*rel="canonical"[^>]*>/i, `<link rel="canonical" href="${townUrl}">`)
        .replace(/<meta[^>]*property="og:url"[^>]*>/i, `<meta property="og:url" content="${townUrl}">`);
      if (fuente !== base) {
        fs.writeFileSync(origen, fuente);
        stats.fuentesReanudadas++;
      }
    }
  }

  if (!conContenido) continue;
  stats.pueblos++;

  /* ---------- 3) sitemap y robots del host ---------- */
  const orden = urls.slice().sort((a, b) => {
    const sa = new URL(a).pathname.split('/').filter(Boolean);
    const sb = new URL(b).pathname.split('/').filter(Boolean);
    return sa[0].localeCompare(sb[0], 'es') || (sa[1] || '').localeCompare(sb[1] || '', 'es');
  });
  const sitemap =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    `<!-- ${muni}.ilatekpr.com — landings de las comunidades de este municipio.\n` +
    '     Generado por scripts/genera-pueblos.mjs; una URL por comunidad y servicio. -->\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    orden.map((u) => `  <url><loc>${u}</loc></url>`).join('\n') +
    '\n</urlset>\n';
  fs.mkdirSync(path.join(PUEBLOS, muni), { recursive: true });
  fs.writeFileSync(path.join(PUEBLOS, muni, 'sitemap.xml'), sitemap);
  fs.writeFileSync(
    path.join(PUEBLOS, muni, 'robots.txt'),
    `User-agent: *\nAllow: /\n\nSitemap: ${host}/sitemap.xml\n`
  );
  stats.sitemaps++;
  stats.robots++;
}

console.log(JSON.stringify(stats, null, 1));
