// Genera las dos landings de cada comunidad verificada en HTML estatico,
// con los pueblos colgando directo de comunidades/: 
//
//   comunidades/<municipioSlug>/<comunidad>/sellado-de-techo/index.html
//   comunidades/<municipioSlug>/<comunidad>/limpieza/index.html
//
// Las rutas publicas son limpias (sin .html):
//   comunidades.ilatekpr.com/<municipio>/<comunidad>/sellado-de-techo
//   comunidades.ilatekpr.com/<municipio>/<comunidad>/limpieza
//
// No hay tercera pagina de comunidad. El directorio de la comunidad se borra
// antes de escribir para que no sobreviva ninguna ruta vieja.
//
// Este archivo solo compone: datos (landings/config.mjs), textos (landings/copy.mjs),
// plantilla (landings/template.mjs) y JSON-LD (landings/schema.mjs).
//
// La hoja de estilo se escribe una sola vez en comunidades/styles.css: las 1.112
// paginas la referencian con ruta relativa (../../.. desde
// <municipio>/<comunidad>/<servicio>/) y el navegador la cachea entre paginas.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { outRoot, loadLandingRecords, HEROES_DIR, HERO_DIR, imagenesPorComunidad, heroArchivo, LOGO_SRC, LOGO_FILE, FAVICON_SRC, FAVICON_FILE, TOUCH_ICON_SRC, TOUCH_ICON_FILE } from './landings/config.mjs';
import { copyFor, SLUGS } from './landings/copy.mjs';
import { renderPage } from './landings/template.mjs';
import { STYLES } from './landings/styles.mjs';

const KINDS = ['techos', 'limpieza'];

fs.writeFileSync(path.join(outRoot, 'styles.css'), STYLES, 'utf8');

// Logo circular del pie e iconos del sitio: se copian al asset servido del
// subdominio para que el generador no dependa de ningún CDN externo.
fs.mkdirSync(path.join(outRoot, 'img'), { recursive: true });
for (const [src, file] of [[LOGO_SRC, LOGO_FILE], [FAVICON_SRC, FAVICON_FILE], [TOUCH_ICON_SRC, TOUCH_ICON_FILE]]) {
  if (!fs.existsSync(src)) throw new Error(`Falta el asset ${path.basename(src)} en Ilatek/assets`);
  fs.copyFileSync(src, path.join(outRoot, 'img', file));
}

// Copia los héroes promovidos (Ilatek/Comunidades/<slug>-hero.jpg, con licencia
// verificada) al asset servido del subdominio para que el hero de cada landing
// use la foto de su comunidad; el resto mantiene la foto compartida.
for (const r of loadLandingRecords()) {
  const origen = path.join(HEROES_DIR, `${r.slug}-hero.jpg`);
  if (fs.existsSync(origen)) {
    fs.mkdirSync(path.join(outRoot, HERO_DIR), { recursive: true });
    fs.copyFileSync(origen, path.join(outRoot, HERO_DIR, `${r.slug}-hero.jpg`));
  }
}

// Imágenes nuevas por comunidad y servicio ("Ilatek/comunidades imagenes"): se
// convierten a WebP una sola vez (se saltan si el destino es más nuevo) y se
// sirven desde hero/. El hero de cada landing usa la de su servicio.
const imagenes = imagenesPorComunidad();
let convertidas = 0;
const esperadas = new Set();
for (const { municipalitySlug, slug, ...porTipo } of imagenes.values()) {
  for (const [kind, origen] of Object.entries(porTipo)) {
    const nombre = heroArchivo(municipalitySlug, slug, kind);
    esperadas.add(nombre);
    const destino = path.join(outRoot, HERO_DIR, nombre);
    if (fs.existsSync(destino) && fs.statSync(destino).mtimeMs >= fs.statSync(origen).mtimeMs) continue;
    fs.mkdirSync(path.dirname(destino), { recursive: true });
    await sharp(origen).webp({ quality: 82 }).toFile(destino);
    convertidas++;
  }
}
// Quita WebP que ya no corresponden a ninguna comunidad (renombres o bajas).
const sobrantes = fs.readdirSync(path.join(outRoot, HERO_DIR)).filter(f => f.endsWith('.webp') && !esperadas.has(f));
for (const f of sobrantes) fs.rmSync(path.join(outRoot, HERO_DIR, f), { force: true });
if (sobrantes.length) console.log(`Hero: ${sobrantes.length} WebP obsoletos eliminados`);
console.log(`Hero por comunidad: ${imagenes.size} comunidades con imagen, ${convertidas} WebP generados`);

let count = 0;
const records = loadLandingRecords();
for (const r of records) {
  const base = path.join(outRoot, r.municipalitySlug, r.slug);
  // Borra hub, slugs viejos y cualquier resto de una corrida anterior.
  fs.rmSync(base, { recursive: true, force: true });
  for (const kind of KINDS) {
    const dir = path.join(base, SLUGS[kind]);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), renderPage(r, copyFor(r, kind)), 'utf8');
    count++;
  }
}
console.log(`Landings generadas: ${count} archivos (${records.length} comunidades x ${KINDS.length}) en ${path.relative(process.cwd(), outRoot)}`);
