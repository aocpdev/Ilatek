// Genera las landings de cada comunidad LUXURY verificada en HTML estatico
// para el subdominio propio:
//
//   landings/<municipioSlug>/<comunidad>/index.html             -> pagina de la comunidad
//                                                                   (URL canonica:
//                                                                    comunidades.ilatekpr.com/<municipio>/<comunidad>)
//   landings/<municipioSlug>/<comunidad>/sellado-de-techos.html -> servicio de techos
//   landings/<municipioSlug>/<comunidad>/limpieza.html          -> servicio de limpieza
//
// Las landings viven en un host propio (HTML estatico), asi que:
//   * no llevan tokens {{custom_values.*}} ni data-ilatek-path: la URL es
//     literal y el sitio se publica tal cual;
//   * los enlaces a servicios y formularios usan URL absoluta del dominio
//     principal (ilatekpr.com), que es otro host.
//
// Este archivo solo compone: datos (landings/config.mjs), textos (landings/copy.mjs),
// plantilla (landings/template.mjs) y JSON-LD (landings/schema.mjs).
import fs from 'node:fs';
import path from 'node:path';
import { outRoot, loadLuxuryRecords } from './landings/config.mjs';
import { copyFor, hubCopy } from './landings/copy.mjs';
import { renderPage, renderHub } from './landings/template.mjs';

const PAGES = [
  { kind: 'hub', file: 'index.html', copy: hubCopy, render: renderHub },
  { kind: 'techos', file: 'sellado-de-techos.html', copy: r => copyFor(r, 'techos'), render: renderPage },
  { kind: 'limpieza', file: 'limpieza.html', copy: r => copyFor(r, 'limpieza'), render: renderPage },
];

let count = 0;
const records = loadLuxuryRecords();
for (const r of records) {
  const dir = path.join(outRoot, r.municipalitySlug, r.slug);
  fs.mkdirSync(dir, { recursive: true });
  // Limpia la version anterior de una sola pagina por comunidad.
  fs.rmSync(path.join(outRoot, r.municipalitySlug, `${r.slug}.html`), { force: true });
  for (const page of PAGES) {
    const c = page.copy(r);
    fs.writeFileSync(path.join(dir, page.file), page.render(r, c), 'utf8');
    count++;
  }
}
console.log(`Landings LUXURY generadas: ${count} archivos (${records.length} comunidades x ${PAGES.length}) en ${path.relative(process.cwd(), outRoot)}`);
