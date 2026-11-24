// Genera PUBLICACION-LANDINGS.md: la ficha de publicación de cada landing.
// Uso: node blog/build/make-publication-list.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BLOG = path.resolve(HERE, '..');
const man = JSON.parse(fs.readFileSync(path.join(BLOG, 'embeds/paginas.json'), 'utf8'));
const indice = JSON.parse(fs.readFileSync(path.join(BLOG, 'indice.json'), 'utf8'));

const csv = fs.readFileSync(path.join(BLOG, 'seo/seo-blog.csv'), 'utf8').trim().split('\n').slice(1);
const kw = new Map();
for (const line of csv) {
  const cols = line.match(/"(?:[^"]|"")*"/g) || [];
  if (cols.length !== 6) continue;
  const v = cols.map((x) => x.slice(1, -1).replace(/""/g, '"'));
  kw.set(v[0], v[5]);
}
const grupoDe = new Map(indice.paginas.map((p) => [p.path, p.grupo]));

const GRUPO = {
  indice: 'Índices',
  familia: 'Comparativas · sistema contra sistema',
  marca: 'Comparativas · marca contra marca',
  sustrato: 'Comparativas · por tipo de techo',
  intencion: 'Comparativas · precio, proceso y garantía',
  faq: 'Preguntas frecuentes · clústeres',
  puente: 'Comunidades y servicios · puentes',
  limpieza: 'Comunidades y servicios · limpieza',
  'limpieza-en': 'Comunidades y servicios · limpieza (EN)',
};
const ORDEN = ['indice', 'familia', 'marca', 'sustrato', 'intencion', 'faq', 'puente', 'limpieza', 'limpieza-en'];
const PRIMEROS = ['/blog', '/blog/comparativas', '/blog/preguntas-frecuentes', '/blog/comunidades-y-servicios'];
// Cada copia EN se publica junto a su original: mismo grupo, sección English.
const esDe = (p) => (p === '/blog/en' ? '/blog' : p.startsWith('/blog/en') ? '/blog' + p.slice('/blog/en'.length) : p);
const porGrupo = new Map(ORDEN.map((g) => [g, []]));
const porGrupoEn = new Map(ORDEN.map((g) => [g, []]));
for (const p of man.paginas) {
  const es = esDe(p.path);
  const g = grupoDe.get(es) || 'indice';
  const en = p.path.startsWith('/blog/en');
  const bucket = en ? porGrupoEn : porGrupo;
  if (!bucket.has(g)) bucket.set(g, []);
  bucket.get(g).push(p);
}
for (const lista of [...porGrupo.values(), ...porGrupoEn.values()]) {
  lista.sort((a, b) => {
    const ia = PRIMEROS.indexOf(a.path);
    const ib = PRIMEROS.indexOf(b.path);
    if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    return a.path.localeCompare(b.path);
  });
}

let n = 0;
const partes = [];
for (const [g, lista] of [...ORDEN.map((g) => [g, porGrupo.get(g) || []]), ...ORDEN.map((g) => [g + '_en', porGrupoEn.get(g) || []])]) {
  if (!lista.length) continue;
  const en = g.endsWith('_en');
  const base = en ? g.slice(0, -3) : g;
  partes.push(`## ${GRUPO[base]}${en ? ' · English' : ''}  ·  ${lista.length} páginas\n`);
  for (const p of lista) {
    n++;
    const num = String(n).padStart(3, '0');
    partes.push(`### ${num} · ${p.builder}`);
    partes.push(`- **Slug:** \`${p.path}\``);
    partes.push(`- **Título:** ${p.title}`);
    partes.push(`- **Description:** ${p.description}`);
    partes.push(`- **Keywords:** ${en ? (kw.get(esDe(p.path)) || '(sin palabra clave)') + ' (referencia ES)' : kw.get(p.path) || '(sin palabra clave en el CSV)'}`);
    partes.push(`- **Social image:** ${p.ogImage}`);
    partes.push(`- **Canonical:** ${p.canonical}`);
    partes.push(`- **Embed:** \`${p.embed}\``);
    if (p.path === '/blog') partes.push('- **Nota:** ya existe en GHL como maestro `Blog - Home` y ya está publicado. No lo clones ni lo sobrescribas.');
    partes.push('- [ ] Publicada\n');
  }
}

const cabecera = `# Publicación de las ${man.paginas.length} landings del blog (ES + EN)

Subcuenta **Ilatek - PR** · website **Ilatek** · dominio \`ilatekpr.com\`
Generado desde \`embeds/paginas.json\` + \`seo/seo-blog.csv\`. Los valores ya están verificados:
título ≤ 65 caracteres, description 110–165, canonical = dominio + slug y og:image en \`assets.cdn.filesafe.space\`.

## Flujo por landing

1. Website → Ilatek → **Blog - Home** → ⋮ → **Clone**. Siempre del maestro, nunca de otro clon.
2. ⋮ del clon → **Edit** → pon el **Nombre de página** y el **Slug** de su ficha.
3. Abre el clon → elemento **Custom HTML/JavaScript** → panel **Custom Code** → **Open Code Editor**
   → borra todo → pega el HTML de la ruta **Embed** → **Save**.
4. Preview: un solo H1, un solo nav y un solo footer. Si el tema añade otro encabezado, quítalo.
5. Panel **SEO & AI search optimization**: Title, Description, Keywords, Social image y Canonical de la ficha.
   Borra cualquier \`{{custom_values.county_name_and_state}}\` heredado: si se publica así, se indexan las llaves literales.
6. **Publish** y abre la URL publicada para confirmar que responde 200 con su canonical.

No agregues header ni footer del tema: el embed ya trae \`#ilatek-nav\` y \`#ilatek-footer\`.
El maestro \`Blog - Home\` no se toca nunca.

---
`;
fs.writeFileSync(path.join(BLOG, 'PUBLICACION-LANDINGS.md'), cabecera + '\n' + partes.join('\n'));
console.log(`Publicacion: ${n} fichas escritas.`);

const sinEmbed = man.paginas.filter((p) => !fs.existsSync(path.join(BLOG, '..', p.embed)));
const sinKw = man.paginas.filter((p) => !kw.get(p.path));
const largos = man.paginas.filter((p) => p.title.length > 65 || p.description.length < 110 || p.description.length > 165);
console.log(` embeds inexistentes: ${sinEmbed.length} · sin keyword: ${sinKw.length} · fuera de rango SEO: ${largos.length}`);
