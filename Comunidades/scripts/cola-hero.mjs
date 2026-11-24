// Genera la cola del lote: solo comunidades con sus DOS heroes ya generados.
//
// Una comunidad entra en la cola cuando están sus dos imágenes (techos y
// limpieza) en landings/hero/. Con una sola, una de sus dos páginas seguiría
// saliendo con la foto compartida y el hero no sería el de esa comunidad, que
// es justo lo que la regla quiere evitar. El lote de imágenes cierra primero
// los pares a medias, así que esperar al par no retrasa la publicación.
//
// Uso:
//   node scripts/cola-hero.mjs            # escribe data/ghl/cola-hero.txt
//   node scripts/cola-hero.mjs --print     # solo imprime el resumen

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadLandingRecords, heroArchivo } from './landings/config.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const comunidades = path.resolve(here, '..');
const heroDir = path.join(comunidades, 'landings', 'hero');
const outFile = path.join(comunidades, 'data', 'ghl', 'cola-hero.txt');
const ORDEN = { LUXURY: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

const tiene = (muni, slug, kind) => {
  const archivo = heroArchivo(muni, slug, kind);
  return !!archivo && fs.existsSync(path.join(heroDir, archivo));
};

const filas = [];
for (const r of loadLandingRecords()) {
  const kinds = ['techos', 'limpieza'].filter(k => tiene(r.municipalitySlug, r.slug, k));
  if (kinds.length < 2) continue;
  filas.push({ key: `${r.municipalitySlug}/${r.slug}`, priority: r.priority || 'MEDIUM', kinds });
}

filas.sort((a, b) => (ORDEN[a.priority] ?? 9) - (ORDEN[b.priority] ?? 9) || a.key.localeCompare(b.key));

const porPrioridad = filas.reduce((acc, f) => {
  acc[f.priority] = (acc[f.priority] || 0) + 1;
  return acc;
}, {});

console.log(`Comunidades con hero propio: ${filas.length} · páginas: ${filas.length * 2}`);
console.log('Por prioridad:', porPrioridad);

if (!process.argv.includes('--print')) {
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, filas.map(f => f.key).join('\n') + '\n', 'utf8');
  console.log('Cola escrita en', path.relative(comunidades, outFile));
}
