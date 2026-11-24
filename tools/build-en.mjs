#!/usr/bin/env node
/**
 * Genera la copia inglesa de una landing a partir de su mapa de traducción.
 *
 * Fuente: src/en/<slug>.json  (pares "texto ES": "texto EN")
 * Salida: <carpeta>/<slug>/en/landing-pages/<slug>.en.html
 *
 * Reglas:
 * - Solo traduce nodos de texto y atributos visibles (alt, title, aria-label,
 *   placeholder, content). Nunca toca <script>, <style> ni JSON-LD.
 * - Las claves sin traducción se dejan intactas y se cuentan como pendientes.
 * - Los enlaces internos pasan a /en/<slug> y su data-ilatek-path también.
 * - Los Custom Values se conservan byte a byte.
 *
 * Uso: node tools/build-en.mjs <slug> [...] | --all | --check
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { ROOT, structure } from './site-paths.mjs';
import { faqItems } from '../src/faq/faq-core.mjs';

const TOKEN = '{{custom_values.website_url}}';
const PREFIX = 'https://' + TOKEN;
const STATIC_PATHS = ['cotizacion', 'cotizacion-techos', 'resenas', 'reclutamiento-empleo',
  'reclutamiento-empleo-techos', 'politica-de-privacidad', 'terminos-y-condiciones', 'blog',
  'servicios', 'servicios-techos', 'garantia'];
const internalPaths = [...new Set([...structure.pages.map(p => p.slug), ...STATIC_PATHS])];
// Páginas que YA tienen copia inglesa. El menú EN solo reescribe a /en/ estos
// destinos; el resto conserva su URL española para que ningún enlace dé 404.
const EN_STATIC = ['garantia', 'politica-de-privacidad', 'terminos-y-condiciones'];
const EXTRA = {
  // /servicios se publica desde la landing del hub de limpieza; su copia EN
  // vive en categorias/servicios/en para conservar la ruta /en/servicios.
  servicios: {
    file: 'categorias/limpieza/es/landing-pages/ghl-servicios-landing.html',
    out: 'categorias/servicios/en/landing-pages/servicios.en.html',
  },
  'servicios-techos': { file: 'categorias/techos/es/landing-pages/servicios-techos.html', prefix: 'categorias/techos' },
  // Página plana (no vive en <carpeta>/<lang>/landing-pages/): la salida EN se
  // fija a mano para que la gemela quede en /en/resenas, la ruta que el toggle
  // de la página española ya apunta.
  resenas: { file: 'resenas/ghl-resenas-landing.html', out: 'resenas/en/landing-pages/resenas.en.html' },
  // Páginas legales y del hub de comunidades: viven fuera de
  // <carpeta>/<lang>/landing-pages/, así que su EN se fija a mano.
  garantia: { file: 'garantia/ghl-garantia-embed.html', out: 'garantia/en/landing-pages/ghl-garantia-embed.en.html' },
  politica: { file: 'politica-de-privacidad/ghl-politica-embed.html', out: 'politica-de-privacidad/en/landing-pages/ghl-politica-embed.en.html' },
  terminos: { file: 'terminos-y-condiciones/ghl-terminos-embed.html', out: 'terminos-y-condiciones/en/landing-pages/ghl-terminos-embed.en.html' },
  communities: { file: 'Comunidades/landing-pages/comunidades.html', out: 'Comunidades/en/landing-pages/communities.en.html' },
};

const esPage = slug => {
  if (EXTRA[slug]) return EXTRA[slug].file;
  const p = structure.pages.find(x => x.slug === slug);
  if (!p) throw new Error('slug desconocido: ' + slug);
  return p.file;
};
const enFile = slug => {
  if (EXTRA[slug] && EXTRA[slug].out) return EXTRA[slug].out;
  const es = esPage(slug);
  const folder = path.dirname(path.dirname(path.dirname(es))); // <...>/<slug>
  return path.join(folder, 'en', 'landing-pages', slug + '.en.html');
};

// Una copia cuenta como publicable cuando su página EN existe de verdad o se
// está generando en esta corrida: así un mapa a medio traducir nunca mete
// enlaces /en/ sin destino. Un HEAD en la carpeta del hub no lo prueba:
// categorias/techos/en tiene HEAD sin landing y anunciaba /en/servicios-techos
// como si la copia existiera.
const BUILDING = new Set();
const isAvailable = slug => {
  if (EN_STATIC.includes(slug)) return true;
  try {
    // Publicable = página EN construida + HEAD EN propio del slug. Un HTML sin
    // HEAD no está listo para publicar y no debe recibir tráfico del menú.
    const enPath = enFile(slug);
    const headDir = path.dirname(path.dirname(enPath));
    // Las páginas planas (EXTRA con out) no exigen HEAD-TEMPLATE propio.
    if (!(EXTRA[slug] && EXTRA[slug].out) && !fs.existsSync(path.join(ROOT, headDir, 'HEAD-TEMPLATE.html'))) return false;
    return BUILDING.has(slug) || fs.existsSync(path.join(ROOT, enPath));
  } catch { return false; }
};

const SPANISH = /[áéíóúñÁÉÍÓÚÑ¿¡]|\b(?:para|desde|techos|servicio|servicios|los|las|una|del|por|más|todo|todos|garantía|inspección|reparación|sellado|trabajo|precio|casa|edificio|nuestro|tu|con)\b/i;

function isolated(html, fn) {
  const keep = [];
  const masked = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, m => {
    keep.push(m); return '\u0000' + (keep.length - 1) + '\u0000';
  });
  const out = fn(masked);
  return out.replace(/\u0000(\d+)\u0000/g, (_, i) => keep[Number(i)]);
}

export function translatePage(html, map) {
  const pending = new Set();
  const body = isolated(html, src => {
    // 1) atributos visibles
    // (?!...) evita tocar los espejos data-ilatek-local-<attr>="..."
    let out = src.replace(/(?<![\w-])(alt|title|aria-label|placeholder|content)="([^"]*)"/g, (all, attr, value) => {
      const hit = map[value.trim()];
      if (hit === undefined) return all;
      const lead = value.match(/^\s*/)[0], trail = value.match(/\s*$/)[0];
      return `${attr}="${lead}${hit}${trail}"`;
    });
    // 2) nodos de texto
    out = out.replace(/>([^<>]+)</g, (all, text) => {
      const t = text.replace(/\s+/g, ' ').trim();
      if (!t) return all;
      const hit = map[t];
      if (hit === undefined) { if (SPANISH.test(t)) pending.add(t); return all; }
      const lead = text.match(/^\s*/)[0], trail = text.match(/\s*$/)[0];
      return `>${lead}${hit}${trail}<`;
    });
    // 3) el espejo codificado de cada atributo localizado se recalcula con el
    //    valor ya traducido. Si se queda el del español, el aplicador de
    //    enlaces reinyecta texto español y deja de ser idempotente.
    out = out.replace(/<[a-z][^>]*>/gi, tag => {
      if (!/data-ilatek-local-(?:content|alt|title)=/.test(tag)) return tag;
      return tag
        .replace(/(\bdata-ilatek-local-content=")([^"]*)(")/gi, (m, a, _v, b) => {
          const v = /\bcontent="([^"]*)"/i.exec(tag);
          return v ? a + encodeURIComponent(v[1]) + b : m;
        })
        .replace(/(\bdata-ilatek-local-alt=")([^"]*)(")/gi, (m, a, _v, b) => {
          const v = /\balt="([^"]*)"/i.exec(tag);
          return v ? a + encodeURIComponent(v[1]) + b : m;
        })
        .replace(/(\bdata-ilatek-local-title=")([^"]*)(")/gi, (m, a, _v, b) => {
          const v = /\btitle="([^"]*)"/i.exec(tag);
          return v ? a + encodeURIComponent(v[1]) + b : m;
        });
    });
    return out;
  });
  return { html: body, pending: [...pending] };
}

export function englishLinks(html) {
  // El par hreflang es recíproco: las alternates que apuntan a la versión
  // española (es / x-default) NO se reescriben a /en/; solo la inglesa lo hace.
  const keepAlt = [];
  html = html.replace(/<link\b[^>]*\brel="alternate"[^>]*\bhreflang="(?:es|x-default)"[^>]*>/gi, m => {
    keepAlt.push(m); return '\u0001' + (keepAlt.length - 1) + '\u0001';
  });
  let out = html;
  // Home: solo se reescribe cuando existe su copia inglesa.
  if (isAvailable('home')) {
    // El home inglés vive en /en/home (su propia copia con WebPage propio).
    out = out.replace(new RegExp(PREFIX + '/#', 'g'), PREFIX + '/en/home#');
    out = out.replace(new RegExp(PREFIX + '/(?=["\'\\s>])', 'g'), PREFIX + '/en/home');
    out = out.replace(/data-ilatek-path="\/#/g, 'data-ilatek-path="/en/home/#');
    out = out.replace(/data-ilatek-path="\/(?=["])/g, 'data-ilatek-path="/en/home');
  }
  for (const slug of internalPaths.filter(isAvailable)) {
    const esc = slug.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    out = out.replace(new RegExp(PREFIX + '/' + esc + '(?=[#"?\'\\s>])', 'g'), PREFIX + '/en/' + slug);
    out = out.replace(new RegExp('data-ilatek-path="/' + esc + '(?=[#"?])', 'g'), 'data-ilatek-path="/en/' + slug);
  }
  return out.replace(/\u0001(\d+)\u0001/g, (_, i) => keepAlt[Number(i)]);
}

/**
 * El schema de la copia EN describe la página EN: inLanguage en inglés y la
 * identidad (url/@id) de la propia ruta /en/, no la del Home ni la del ES.
 */
export function localizeSchema(html, slug) {
  const own = 'https://ilatekpr.com/en/' + slug;
  const ownToken = PREFIX_PROTECTED + '/en/' + slug;
  const esc = s => s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const rewrite = (text, base) => text
    .replace(new RegExp('https://ilatekpr\\.com/home(?=[#/"])', 'g'), own)
    .replace(new RegExp('https://ilatekpr\\.com/' + esc(slug) + '(?=[#/"])', 'g'), own)
    .replace(new RegExp(PREFIX_PROTECTED + '/home(?=[#/"])', 'g'), ownToken)
    .replace(new RegExp(PREFIX_PROTECTED + '/' + esc(slug) + '(?=[#/"])', 'g'), ownToken);
  return html.replace(/(<script[^>]*application\/ld\+json[^>]*>)([\s\S]*?)(<\/script>)/gi, (all, open, code, close) => {
    const tagged = rewrite(code);
    let data;
    try { data = JSON.parse(tagged); } catch { return all; }
    const walk = v => {
      if (Array.isArray(v)) return v.map(walk);
      if (v && typeof v === 'object') {
        if (Object.prototype.hasOwnProperty.call(v, 'inLanguage')) v.inLanguage = 'en';
        for (const k of Object.keys(v)) v[k] = walk(v[k]);
        return v;
      }
      return v;
    };
    return open + JSON.stringify(walk(data)) + close;
  });
}

/** Traduce los literales del JSON-LD y reconstruye FAQPage desde el FAQ visible. */
function translateJsonLd(html, map) {
  return html.replace(/(<script[^>]*application\/ld\+json[^>]*>)([\s\S]*?)(<\/script>)/gi, (all, open, code, close) => {
    let data;
    try { data = JSON.parse(code); } catch { return all; }
    const walk = v => {
      if (typeof v === 'string') return map[v.trim()] !== undefined ? map[v.trim()] : v;
      if (Array.isArray(v)) return v.map(walk);
      if (v && typeof v === 'object') { for (const k of Object.keys(v)) v[k] = walk(v[k]); return v; }
      return v;
    };
    data = walk(data);
    return open + JSON.stringify(data) + close;
  });
}

/**
 * La página española trae su propio diccionario `window.ILATEK_I18N` con los
 * valores `en` de cada bloque con `data-en-key`. El mapa traduce nodo a nodo y
 * puede dejar concordancias pegadas («IlatekCovers»); el diccionario es la
 * traducción ya publicada del sitio, así que la copia EN lo aplica tal cual.
 */
function applyI18n(html, esHtml) {
  const m = /window\.ILATEK_I18N=(\{[\s\S]*?\});<\/script>/.exec(esHtml);
  if (!m) return html;
  let dict;
  try { dict = vm.runInNewContext('(' + m[1] + ')', {}, { timeout: 1000 }); } catch { return html; }
  return html.replace(/<([a-z][a-z0-9]*)\b([^>]*\bdata-en-key="([^"]+)"[^>]*)>([\s\S]*?)<\/\1>/gi,
    (all, tag, attrs, key) => {
      const en = dict[key] && dict[key].en;
      return typeof en === 'string' && en.trim() ? `<${tag}${attrs}>${en}</${tag}>` : all;
    });
}

/** Reconstruye el FAQPage con las preguntas y respuestas visibles en inglés. */
function rebuildFaq(html) {
  // Mismo modelo que el verificador (src/faq/faq-core.mjs): un acordeón es un
  // item cuando tiene H3 dentro del <details> y un <p> en cualquier nivel. Así
  // los acordeones legales (summary → div.section-body → p) también entran en
  // el FAQPage y el schema no puede divergir del texto visible.
  const items = faqItems(html).filter(x => x.q && x.a);
  if (!items.length) return { html, questions: 0 };
  let done = false;
  html = html.replace(/(<script[^>]*application\/ld\+json[^>]*>)([\s\S]*?)(<\/script>)/gi, (all, open, code, close) => {
    let data;
    try { data = JSON.parse(code); } catch { return all; }
    const list = [].concat(data);
    const faq = list.find(x => x && x['@type'] === 'FAQPage');
    if (!faq) return all;
    faq.mainEntity = items.map(it => ({ '@type': 'Question', name: it.q, acceptedAnswer: { '@type': 'Answer', text: it.a } }));
    done = true;
    return open + JSON.stringify(data) + close;
  });
  return { html, questions: done ? items.length : 0 };
}

const PREFIX_PROTECTED = 'https://' + '{{custom_values.website_url}}';

const BOOT = '<!-- ILATEK:EN-COPY -->\n<script>/* Copia EN: el HTML ya viene traducido; se fija el idioma del documento. */' +
  'document.documentElement.setAttribute("lang","en");' +
  'try{localStorage.setItem("ilatek-lang","en")}catch(e){}' +
  /* El toggle del menú no traduce en sitio: esta copia no tiene texto español,
     así que navega a la página española equivalente. */
  'document.addEventListener("click",function(e){' +
  'var b=e.target.closest&&e.target.closest("#ilatek-nav .iln-lang");if(!b)return;' +
  'var p=location.pathname.replace(/^\\/en(?=\\/|$)/,"")||"/";' +
  'e.preventDefault();e.stopPropagation();location.href=p+location.hash;' +
  '},true);</script>\n';

/**
 * Un Custom Value nunca va pegado a una palabra: GHL sustituye el token por el
 * municipio, así que «in{{custom_values.county_name_and_state}}» se publicaría
 * como «inJuncos». El mapa llega con esos pegotes de la traducción automática y
 * aquí se separan sin cambiar ni una palabra.
 */
function tidyPlaceholders(html) {
  return html
    .replace(/([A-Za-z0-9])[ \t]*(\{\{custom_values\.)/g, '$1 $2')
    .replace(/(\}\})[ \t]*([A-Za-z])/g, '$1 $2');
}

const args = process.argv.slice(2);
const check = args.includes('--check');
const mapSlugs = () => fs.readdirSync(path.join(ROOT, 'src/en'))
  .filter(f => f.endsWith('.json') && !path.basename(f).startsWith('_'))
  .map(f => f.replace(/\.json$/, ''));
const wanted = args.includes('--all') ? mapSlugs() : args.filter(a => !a.startsWith('--'));

if (!wanted.length) { console.error('Indica al menos un slug, o --all.'); process.exit(1); }
wanted.forEach(s => BUILDING.add(s));

let totalPending = 0;
for (const slug of wanted) {
  const mapFile = path.join(ROOT, 'src/en', slug + '.json');
  if (!fs.existsSync(mapFile)) { console.error(`sin mapa: src/en/${slug}.json`); process.exitCode = 1; continue; }
  const map = JSON.parse(fs.readFileSync(mapFile, 'utf8'));
  const es = fs.readFileSync(path.join(ROOT, esPage(slug)), 'utf8');
  const { html, pending } = translatePage(es, map);
  const withSchema = localizeSchema(translateJsonLd(englishLinks(applyI18n(html, es)), map), slug);
  const rebuilt = rebuildFaq(withSchema);
  // El bloque de enlaces internos debe seguir siendo lo primero del archivo
  // (contrato de idempotencia); la marca EN va justo después, no antes.
  const marker = '<!-- ILATEK:INTERNAL-LINKS:END -->';
  const at = rebuilt.html.indexOf(marker);
  const out = at < 0
    ? BOOT + rebuilt.html
    : rebuilt.html.slice(0, at + marker.length) + '\n' + BOOT + rebuilt.html.slice(at + marker.length);
  const tidy = tidyPlaceholders(out);
  const target = enFile(slug);
  if (!check) { fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, tidy, 'utf8'); }
  totalPending += pending.length;
  console.log(`${check ? 'simulado' : 'escrito'} ${slug}: ${pending.length} cadenas sin traducir · FAQPage ${rebuilt.questions} preguntas -> ${path.relative(ROOT, target).replace(/\\/g, '/')}`);
  pending.slice(0, 6).forEach(p => console.log('   · ' + p.slice(0, 100)));
  if (pending.length > 6) console.log(`   · … y ${pending.length - 6} más`);
}
if (totalPending) process.exitCode = 1;
