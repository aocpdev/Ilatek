// Rutas, URLs públicas y carga de registros para el generador de landings LUXURY.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const comunidades = path.resolve(here, '..', '..');
export const outRoot = path.join(comunidades, 'landings');

// Base pública de las landings de comunidad. Se publican en el subdominio
// propio como HTML estático: ahí no hay GHL que resuelva tokens, así que las
// URL de la página son concretas y nunca llevan {{custom_values.*}}.
export const COMMUNITY_SITE = 'https://comunidades.ilatekpr.com';

// Dominio principal de Ilatek. Los enlaces a servicios y los CTA usan URL
// absoluta porque la landing vive en otro origen y no puede resolver
// {{custom_values.website_url}}.
export const MAIN_SITE = 'https://ilatekpr.com';

// Imagen de portada (hero) de todas las landings de comunidad.
export const HERO_IMAGE = 'https://assets.cdn.filesafe.space/8OxUENFVM60EKzqsTcoD/media/6ab0a4884091fa65e6a1ce3d.jpg';

// Destinos de los CTA según la variante.
export const COTIZACION_TECHOS = 'https://ilatekpr.com/cotizacion-techos';
export const COTIZACION_LIMPIEZA = 'https://ilatekpr.com/cotizacion';

// Solo comunidades LUXURY de master-database.json.
export function loadLuxuryRecords() {
  const db = JSON.parse(fs.readFileSync(path.join(comunidades, 'master-database.json'), 'utf8'));
  return (Array.isArray(db) ? db : db.records).filter(r => r.priority === 'LUXURY');
}
