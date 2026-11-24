// Ilatek · Blog · foto de servicio para las tarjetas de posts.
// Cada tarjeta muestra una foto real de un servicio de techos, en su propio
// bloque (sin texto encima).
//
// Origen de la imagen: el CDN de GHL devuelve 404 en el transform para los
// archivos viejos (6ac046f*), así que se usa la copia WebP optimizada del repo
// y, si esa copia no existe, el transform de GHL con respaldo a la foto genérica
// de sellado. Nunca se publica una tarjeta con imagen rota.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cardFor } from './social-cards.mjs';
// Alt de la tarjeta: el de la tarjeta social de esa misma página (describe la
// imagen), y solo si falta se cae a la etiqueta del servicio.
const cardAlt = (seed, label) =>
  (seed && typeof seed === 'object' && seed.slug ? cardFor('/blog/' + seed.slug)?.alt : null) || 'Ilatek · ' + label; const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const WEBP_DIR = path.join(ROOT, 'assets/optimized/techos');
// jsDelivr rechaza el paquete del repo por tamaño (403), así que la copia
// optimizada se sirve desde raw.githubusercontent (misma rama main).
const WEBP = 'https://raw.githubusercontent.com/aocpdev/Ilatek/main/assets/optimized/techos/';
const WEBP_BLOG = 'https://raw.githubusercontent.com/aocpdev/Ilatek/main/';
const RAW = 'https://assets.cdn.filesafe.space/8OxUENFVM60EKzqsTcoD/media/';
const LCTR = 'https://images.leadconnectorhq.com/image/f_webp/q_80/r_1200/u_';
// Foto de sellado de techos: la única del lote nuevo verificada en producción
// (responde 200 en el transform de GHL, que es el respaldo final).
const GENERIC = '6ac8583f195f9172ed03ad7b'; const SERVICES = [ { key: 'silicona', label: 'Sellado con silicona 100%', match: /silicona/i, files: ['6ac046f585f560d1666999aa.jpg'] }, { key: 'membrana', label: 'Membrana asfáltica', match: /membrana/i, files: ['6ac046f82c503e697d5ff24e.jpg'] }, { key: 'elastomerico', label: 'Recubrimiento elastomérico', match: /elast[oó]mer/i, fotoSlug: 'acrilico-elastomerico-vs-membrana-liquida', files: ['6ac046f302569bee7ccbcbf4.jpg', '6ac046f32c503e697d5ff1fa.jpg'] }, { key: 'poliuretano', label: 'Sellado de poliuretano', match: /poliuretano/i, files: ['6ac046f28493229874263903.jpg'] }, { key: 'acrilico', label: 'Sellado acrílico', match: /acr[ií]lic/i, files: ['6ac8583c195f9172ed03acbf.jpg'] }, { key: 'zinc', label: 'Techos de zinc', match: /\bzinc\b/i, files: ['6acbf29abbad531ac8950f9b.png'] }, { key: 'teja', label: 'Techos de teja', match: /\bteja/i, fotoSlug: 'sellado-de-techo-de-teja', files: ['6acbee8cc478ac5535ac053c.png'] }, { key: 'madera', label: 'Techos de madera', match: /madera/i, fotoSlug: 'sellado-de-techo-de-madera', files: ['6acbe8c9bd6bb710ca4fc13e.png'] }, { key: 'asfalto', label: 'Techos de asfalto', match: /asfalto/i, fotoSlug: 'sellado-de-techo-de-asfalto', files: ['6ac046f82c503e697d5ff24e.jpg'] }, { key: 'concreto', label: 'Techos de concreto', match: /concreto|losa/i, files: ['6ac85834cc7a5a2b73475e12.jpg'] }, { key: 'planos', label: 'Techos planos', match: /plano|empozamiento/i, files: ['6ac85834bbad531ac8449522.jpg'] }, { key: 'goteras', label: 'Reparación de goteras', match: /gotera|filtraci[oó]n|grieta/i, files: ['6ac8583bbbad531ac844963f.jpg'] }, { key: 'canaletas', label: 'Canaletas y bajantes', match: /canaleta|bajante/i, files: ['6ac8583a195f9172ed03ac5f.jpg'] }, { key: 'mantenimiento', label: 'Inspección y mantenimiento', match: /mantenimiento|inspecci[oó]n|limpieza/i, files: ['6ac046f98493229874263987.jpg'] }, { key: 'impermeabilizacion', label: 'Impermeabilización de techos', match: /impermeabiliz/i, files: ['6ac046f5849322987426393b.jpg'] }, { key: 'sellado', label: 'Sellado de techos', match: /sellado|precio|cu[aá]nto cuesta|garant[ií]a|licencia|permiso|clima|hurac[aá]n/i, files: [GENERIC + '.jpg'], },
];
const sellado = SERVICES.find((s) => s.key === 'sellado');
const FALLBACK_SRC = LCTR + encodeURIComponent(RAW + sellado.files[0]); // Primera copia que exista en el repo; si ninguna, transform de GHL.
function pickSource(files) { for (const file of files) { const base = file.replace(/\.[a-z]+$/i, ''); if (fs.existsSync(path.join(WEBP_DIR, base + '.webp'))) { return WEBP + base + '.webp'; } } return LCTR + encodeURIComponent(RAW + files[0]);
} // Fotos conectadas por el TÍTULO de la imagen del servicio (tools/map-blog-photos.py).
const FOTOS = (() => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'blog/data/fotos-tarjetas.json'), 'utf8')).fotos; } catch { return {}; }
})(); // Copias subidas a la Media Library de GHL: el cuerpo del post vive en GHL, así
// que la ruta local /assets/.. no existe allí y el onerror debe caer en el CDN
// de GHL, no en raw.githubusercontent (que también da 404 para este lote).
const GHL_MEDIA = (() => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'blog/data/ghl-media.json'), 'utf8')).files || {}; } catch { return {}; }
})(); // Limpieza: la foto tiene que ser la del SERVICIO que dice el título (casas,
// profunda, estándar, mudanza, comercial, industrial, techos y canaletas, lavado
// a presión), no una foto de sellado de techos. Las imágenes viven en
// assets/optimized/social/<servicio>.jpg, ya recortadas a 1200×630.
const LIMPIEZA = [
  { match: /profunda|\bdeep\b/i, label: 'Limpieza profunda', archivo: 'assets/optimized/social/limpieza-profunda.jpg' },
  { match: /est[aá]ndar|\bstandard\b/i, label: 'Limpieza estándar', archivo: 'assets/optimized/social/limpieza-estandar.jpg' },
  { match: /mudanza|move-?in|move-?out/i, label: 'Limpieza de mudanza', archivo: 'assets/optimized/social/limpieza-de-mudanza.jpg' },
  { match: /comercial|oficina|commercial|office/i, label: 'Limpieza comercial', archivo: 'assets/optimized/social/limpieza-comercial.jpg' },
  { match: /industrial|almac[eé]n|warehouse|planta/i, label: 'Limpieza industrial', archivo: 'assets/optimized/social/limpieza-industrial.jpg' },
  { match: /techos?\s*(?:y|and|&)\s*canaleta|roof\s*(?:and|&)\s*gutter/i, label: 'Limpieza de techos y canaletas', archivo: 'assets/optimized/social/limpieza-de-techos-y-canaletas.jpg' },
  { match: /lavado[^.]*techos?|pressure[^.]*roof|roof[^.]*pressure/i, label: 'Lavado a presión de techos', archivo: 'assets/optimized/social/lavado-a-presion-techos.jpg' },
  { match: /lavado|pressure\s*wash/i, label: 'Lavado a presión', archivo: 'assets/optimized/social/lavado-a-presion.jpg' },
  { match: /limpieza|cleaning/i, label: 'Limpieza de casas', archivo: 'assets/optimized/social/limpieza-residencial.jpg' },
];
const esPaginaDeLimpieza = (seed) => !!seed && typeof seed === 'object'
  && (/^limpieza/i.test(String(seed.grupo || ''))
    || /(?:^|\/)(?:limpieza|lavado|cleaning|pressure-washing|house-cleaning|deep-cleaning|standard-house|move-in|commercial-office|industrial-cleaning|roof-and-gutter|cleaning-faq)/i.test(String(seed.slug || '')));
function limpiezaPhoto(seed) {
  if (!esPaginaDeLimpieza(seed)) return null;
  const texto = [seed.slug, seed.h1, seed.meta].filter(Boolean).join(' ');
  const hit = LIMPIEZA.find((s) => s.match.test(texto));
  if (!hit) return null;
  return {
    src: '/' + hit.archivo,
    fallback: GHL_MEDIA[hit.archivo]?.url || WEBP_BLOG + hit.archivo,
    alt: cardAlt(seed, hit.label),
    key: 'foto-limpieza',
  };
} // Acepta un post (slug/h1/grupo/familia/meta) o una clave de servicio.
// Las tarjetas usan SIEMPRE el mismo criterio que las de /blog/comparativas:
// foto propia del post (assets/optimized/blog/<slug>.webp) y, si no hay, la
// foto de una entrada real que corresponda al servicio. Nunca una ruta suelta
// de otro lote, para que todas las tarjetas del blog se vean igual.
function fotoDeServicio(service) { if (service.fotoSlug && FOTOS[service.fotoSlug]) return FOTOS[service.fotoSlug]; const hit = Object.entries(FOTOS).find(([, f]) => service.match.test(f.titulo || '')); return hit ? hit[1] : null;
} export function cardImage(seed) {
  const limpieza = limpiezaPhoto(seed);
  if (limpieza) return limpieza;
  const foto = seed && typeof seed === 'object' && seed.slug ? FOTOS[seed.slug] : null;
  if (foto) {
    return {
      src: '/' + foto.archivo.replace(/^\/+/, ''),
      fallback: GHL_MEDIA[foto.archivo]?.url || WEBP_BLOG + foto.archivo,
      fallback2: FALLBACK_SRC,
      alt: cardFor(seed.slug ? '/blog/' + seed.slug : '')?.alt || 'Ilatek · ' + (seed.h1 || foto.titulo),
      key: 'foto-titulo',
    };
  }
  const service = typeof seed === 'string'
    ? SERVICES.find((s) => s.key === seed) || sellado
    : SERVICES.find((s) => s.match.test(pickText(seed))) || sellado;
  const fotoServicio = fotoDeServicio(service);
  if (fotoServicio) {
    return {
      src: '/' + fotoServicio.archivo.replace(/^\/+/, ''),
      fallback: GHL_MEDIA[fotoServicio.archivo]?.url || WEBP_BLOG + fotoServicio.archivo,
      fallback2: FALLBACK_SRC,
      alt: cardAlt(seed, service.label),
      key: 'foto-titulo',
    };
  }
  return { src: pickSource(service.files), fallback: FALLBACK_SRC, alt: cardAlt(seed, service.label), key: service.key };
}
function pickText(post = {}) { const familia = post.familia && typeof post.familia === 'object' ? post.familia.nombre : post.familia; return [post.slug, post.h1, post.grupo, familia, post.meta].filter(Boolean).join(' ');
}
