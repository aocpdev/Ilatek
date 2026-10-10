// Mechanical migration of literal documentation/tool references; never changes landing HTML.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, structure } from './site-paths.mjs';
const targets = [
  'tools/apply-social-og.py','tools/apply-slider-video.py','tools/map-images.py',
  'tools/review-og.py','tools/review-og.html','docs/mapa-paginas-imagenes.md',
  'techos/lib/parts.mjs','src/faq/FAQ.md',
];
for (const rel of targets) {
  const file = path.join(ROOT,rel);
  let text = fs.readFileSync(file,'utf8');
  for (const [old, replacement] of Object.entries(structure.moves)) text = text.split(old).join(replacement);
  fs.writeFileSync(file,text);
}
