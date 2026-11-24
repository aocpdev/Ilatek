// Construye el prompt de imagen de cada comunidad a partir de datos reales:
// el tipo de vivienda que dice la investigación y la región de la isla. No
// inventa un nombre propio dentro del prompt —meter "La Granja" haría que el
// modelo escribiera texto en la foto—, pero sí fija la tipología, el clima y la
// vegetación de la zona para que la imagen sea representativa y no un suburbio
// genérico de California.
//
//   node scripts/imagenes/prompts.mjs
//
// Salida: scripts/imagenes/prompts.json (una entrada por comunidad) y
// scripts/imagenes/prompts.txt (el mismo listado en texto, para pegarlo a mano
// en otra herramienta si se quiere).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const comunidades = path.resolve(here, '..', '..');

const db = JSON.parse(fs.readFileSync(path.join(comunidades, 'master-database.json'), 'utf8'));
const registros = (Array.isArray(db) ? db : db.records).filter(r => r.priority !== 'UNVERIFIED');
const regiones = JSON.parse(fs.readFileSync(path.join(comunidades, 'regiones.json'), 'utf8'));

const regionDe = new Map();
for (const reg of regiones.regions) for (const m of reg.municipios) regionDe.set(m, reg.slug);

// --- Tipología de vivienda, deducida del campo type -------------------------
const TIPOS = [
  [/publico|multifamiliar/i, 'publico'],
  [/torre/i, 'torre'],
  [/condominio|apartamento/i, 'condominio'],
  [/townhouse/i, 'townhouse'],
  [/golf|marina|resort|playa|oceano|océano|costera|frente al mar|enclave/i, 'resort'],
  [/cerrad|acceso controlado|privada/i, 'cerrada'],
  [/urbanizaci/i, 'urbanizacion'],
];

const ARQUETIPO = {
  publico: 'recently renovated public housing project of low-rise reinforced-concrete walk-up buildings, three to four stories, fresh white and pale grey facades, modern balcony railings, tidy landscaped courtyards',
  torre: 'modern mid-rise residential towers of twelve to eighteen stories, glass balconies, crisp white concrete, landscaped entrance plaza with young palms',
  condominio: 'modern low-rise condominium complex of three or four story apartment blocks, clean contemporary facades, shaded carports, clipped hedges and palms',
  townhouse: 'contemporary rows of two-story townhouses with clean stucco facades, modern window frames, small front patios and individual carports',
  resort: 'upscale Caribbean resort residential enclave, contemporary villas and low condominium buildings with clean stucco and stone accents, manicured lawns, palm-lined driveways, golf green and turquoise sea in the distance',
  cerrada: 'gated single-family community behind a low perimeter wall, uniform modern one and two-story houses with paved driveways, trimmed lawns, contemporary entrance gate',
  urbanizacion: 'suburban urbanization of single-family houses, one and two stories, crisp white elastomeric-coated flat roofs, modern aluminium windows, carports, tidy tropical front gardens',
  barrio: 'established neighborhood of modernized one and two-story concrete homes, freshly painted facades, new white roof coating, tidy rebar fences, quiet narrow street',
};

// --- Clima, luz y vegetación según la región --------------------------------
const REGION = {
  metro: 'the dense metropolitan San Juan area, with mid-rise buildings, tropical street trees and Caribbean urban texture',
  norte: 'the northern Atlantic coastal plain, with steady sea breeze, open sky, tall coconut palms and flamboyán trees in bloom',
  este: 'the eastern coastal plain near the rainforest foothills, with deep green vegetation, sea grape and bamboo',
  sur: 'the dry southern Caribbean coast, with harder sunlight, sparse acacia vegetation and a calm sea nearby',
  oeste: 'the western coast, with golden low sun, dramatic Caribbean sky and palms bent by the trade wind',
  central: 'the central mountainous interior of the Cordillera, with houses on terraced hillsides and mist over the green ridges',
};

// --- Nivel económico: decide cómo se amuebla el interior de limpieza --------
// Se deriva del tipo de vivienda y de la prioridad investigada, no del azar: un
// residencial público de la AVP no se representa con cocina de isla ni mármol.
// Piezas del interior por nivel económico: piso, muebles, ventanas, techo y
// equipamiento. Se combinan con el cuarto que toque para que 1.112 comunidades
// no compartan la misma sala, sin perder el nivel real de cada una.
const PIEZAS = {
  modesto: {
    piso: 'plain square white ceramic floor tiles',
    muebles: 'clean, well-kept second-hand furniture with simple covers',
    ventanas: 'a window with metal security bars and plain cotton curtains',
    techo: 'one slow ceiling fan',
    extras: 'a small older television on a basic wooden stand, two plastic chairs and one small family photo on a bare painted wall',
    cocina: 'a compact kitchen with simple laminate cabinets, an older white electric stove and a basic refrigerator, a dish rack with neatly stacked plates, a small window over the sink',
    comedor: 'a small dining area with a laminate table, four simple chairs and a clean tablecloth',
    habitacion: 'a small bedroom with a neatly made double bed, plain sheets and a folded blanket, a simple dresser with a small lamp',
    bano: 'a small bathroom with white ceramic wall tiles, a simple shower curtain, spotless grout, a clean sink and mirror, fresh towels folded on a rack',
    lavanderia: 'a utility corner with a washing machine, folded laundry, a bucket and a mop neatly stored against the wall',
  },
  medio: {
    piso: 'warm ceramic tile floor',
    muebles: 'an upholstered sofa with cushions and a wooden coffee table',
    ventanas: 'sheer curtains on aluminium louvre windows',
    techo: 'a ceiling fan and a split air conditioner',
    extras: 'a flat-screen TV on a low console and family photos on the wall',
    cocina: 'a tidy kitchen with wood-tone cabinets, a white stove and refrigerator, a small tiled backsplash and clean counters',
    comedor: 'a wooden dining table with upholstered chairs and a simple centrepiece',
    habitacion: 'a bedroom with a neatly made bed, coordinated bedding, a wooden dresser and a nightstand with a lamp',
    bano: 'a bathroom with glazed ceramic tiles, a glass shower screen, a clean vanity and fresh towels',
    lavanderia: 'a laundry corner with a washer and dryer, folded laundry and tidy shelves',
  },
  alto: {
    piso: 'large light porcelain tiles',
    muebles: 'a contemporary grey sectional sofa and a glass and wood coffee table',
    ventanas: 'large sliding windows with a tropical view',
    techo: 'recessed lighting and a ductless split unit',
    extras: 'minimal wall art and a low media console',
    cocina: 'a modern kitchen with sleek flat-panel cabinets, quartz countertops and stainless steel appliances',
    comedor: 'a modern dining table with designer chairs under pendant lighting',
    habitacion: 'a bedroom with a neatly made bed in crisp linens, a modern dresser and a soft rug',
    bano: 'a bathroom in large-format porcelain tiles with a glass shower, a floating vanity and folded towels',
    lavanderia: 'a compact laundry room with stacked appliances and built-in storage',
  },
  lujo: {
    piso: 'polished marble floors',
    muebles: 'designer furniture in neutral tones and a sculptural coffee table',
    ventanas: 'floor-to-ceiling windows with ocean or golf course views',
    techo: 'integrated recessed lighting',
    extras: 'contemporary art and high-end finishes',
    cocina: 'a high-end kitchen with integrated cabinetry, a stone island and professional stainless appliances',
    comedor: 'an elegant dining table with designer chairs and a sculptural pendant',
    habitacion: 'a bedroom with a large made bed in luxury linens, designer nightstands and a soft area rug',
    bano: 'a spa-like bathroom in marble-look porcelain with a walk-in glass shower, a stone vanity and rolled towels',
    lavanderia: 'a dedicated laundry room with concealed appliances and built-in cabinetry',
  },
};

// Cuartos que rotan de comunidad en comunidad: mismo nivel, distinta estancia.
const ESCENAS = [
  ['living room', p => `${p.muebles}, ${p.extras}`],
  ['kitchen', p => p.cocina],
  ['dining area', p => p.comedor],
  ['bedroom', p => p.habitacion],
  ['bathroom', p => p.bano],
  ['laundry area', p => p.lavanderia],
];

const CAMARA_INTERIOR = [
  'eye-level wide interior shot, 24mm lens, straight verticals',
  'three-quarter interior view from the doorway, 28mm lens, level horizon',
  'eye-level interior shot from a corner, 24mm lens, straight verticals',
];

function interiorDe(nivel, h) {
  const piezas = PIEZAS[nivel] || PIEZAS.medio;
  const [escena, cuerpo] = ESCENAS[(h >> 12) % ESCENAS.length];
  const tamano = nivel === 'modesto' ? 'small ' : nivel === 'lujo' ? 'spacious ' : '';
  return {
    escena,
    descripcion: `a ${tamano}${escena}: ${cuerpo(piezas)}; ${piezas.piso}, ${piezas.ventanas}, ${piezas.techo}`,
    camara: CAMARA_INTERIOR[(h >> 16) % CAMARA_INTERIOR.length],
  };
}

// Lo que NO puede aparecer según el nivel: el modelo tiende a subir de gama
// cualquier interior si no se le prohíbe expresamente.
const PROHIBIDO = {
  modesto: 'Do not include marble, granite, designer furniture, open-plan kitchen islands, floor-to-ceiling windows, chandeliers, recessed lighting, large rooms or luxury decor. The space must read small, humble and built on a tight budget.',
  medio: 'Do not include marble, luxury decor, chandeliers or oversized rooms.',
  alto: '',
  lujo: '',
};

const ACABADO_INTERIOR = {
  modesto: 'Simple and humble but spotless: floors and rugs freshly cleaned, fresh paint, clean curtains, no stains, no dust, no clutter, everything carefully kept.',
  medio: 'Well kept and tidy: clean floors, tidy furnishings, no stains, no clutter, everything in its place.',
  alto: 'Modern, immaculate and uncluttered, with quality finishes in good condition.',
  lujo: 'Immaculate, professionally styled and in perfect condition, with high-end finishes.',
};

// El argumento de venta es el DESPUÉS: sin prohibir la suciedad el modelo
// inventa manchas, polvo y alfombras gastadas —justo lo contrario del servicio.
const RESULTADO_LIMPIEZA = 'The result must look flawlessly and professionally cleaned: every floor and rug freshly deep-cleaned and completely free of dirt, dust, grime, stains, footprints, pet marks and discoloration; carpets evenly coloured and freshly shampooed, grout bright white, tiles and counters gleaming, glass and mirrors streak-free, no cobwebs and no mildew anywhere.';

const RESULTADO_TECHO = 'The freshly sealed roof must read as brand new work: a uniform, bright white elastomeric coating with crisp clean edges, no streaks, no dirt, no stains, no patches, no rust marks, no peeling and no water damage anywhere.';

const PALETA_INTERIOR = [
  'warm off-white and sand tones',
  'soft white with pastel accents',
  'light grey with natural wood',
  'cream walls with terracotta accents',
];

function nivelEconomico(r, arquetipo) {
  if (arquetipo === 'publico') return 'modesto';
  // Proyectos de vivienda para personas mayores: aunque la base los catalogue
  // como sector genérico, son vivienda pública subvencionada, no clase media.
  if (/elderly|envejecient|vejez|ancianos|senior housing|housing/i.test(r.name)) return 'modesto';
  if (arquetipo === 'resort' || r.priority === 'LUXURY') return 'lujo';
  if (arquetipo === 'torre' || arquetipo === 'condominio' || r.priority === 'HIGH') return 'alto';
  return 'medio';
}

// Variaciones deterministas: cada comunidad recibe una combinación distinta
// para que 556 imágenes no parezcan la misma foto con distinto pueblo.
const hash = s => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return Math.abs(h); };

const LUZ = [
  'soft early morning light, long shadows, dew on the surfaces',
  'clear late-afternoon light, warm highlights, crisp shadows',
  'overcast Caribbean sky right after rain, even light, wet reflective surfaces',
  'bright midday sun, vivid saturation, sharp contrast',
];

const CAMARA = [
  'low aerial three-quarter view from about thirty meters, roofs clearly visible',
  'elevated drone view from about forty-five meters, looking across the rooftops toward the horizon',
  'slightly oblique street-level-to-aerial view, foreground houses in detail, neighborhood receding behind',
];

const PALETA = [
  'palette of white, sand and pale green facades with grey concrete',
  'palette of pastel yellow, aqua and coral facades, common in Puerto Rico',
  'palette of muted earth tones, beige stucco and dark grey roofs',
];

// Sin acentos: "Residencial público" tiene que casar con /publico/.
const sinAcentos = s => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');

function arquetipoDe(tipo) {
  const t = sinAcentos(tipo);
  for (const [re, clave] of TIPOS) if (re.test(t)) return clave;
  return 'barrio';
}

// "A urbanización" / "An established...": el artículo se elige por sonido inicial.
const articulo = texto => (/^[aeiou]/i.test(sinAcentos(texto)) ? 'An' : 'A');

// Nombres repetidos entre municipios: el archivo lleva el municipio para no
// pisarse (Vista Verde existe en más de un pueblo).
const repetidos = new Set();
{
  const cuenta = {};
  for (const r of registros) cuenta[r.name] = (cuenta[r.name] || 0) + 1;
  for (const [n, v] of Object.entries(cuenta)) if (v > 1) repetidos.add(n);
}

const limpiarNombreArchivo = s => s
  .replace(/[<>:"/\\|?*\u0000-\u001f]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const prompts = registros.flatMap(r => {
  const arquetipo = arquetipoDe(r.type);
  const region = regionDe.get(r.municipalitySlug);
  const h = hash(r.slug);
  const luz = LUZ[h % LUZ.length];
  const camara = CAMARA[(h >> 3) % CAMARA.length];
  const paleta = PALETA[(h >> 6) % PALETA.length];
  const paisaje = REGION[region] || 'Puerto Rico, tropical Caribbean setting';

  // Dos imágenes por comunidad: una para sellado de techos y una para limpieza.
  // El nombre de la comunidad se usa como contexto de la generación, y el
  // sufijo del archivo distingue el servicio.
  const base = repetidos.has(r.name)
    ? `${limpiarNombreArchivo(r.name)} (${limpiarNombreArchivo(r.municipality)})`
    : limpiarNombreArchivo(r.name);

  const vivienda = ARQUETIPO[arquetipo];

  // El nombre va como contexto para que la generación se base en esa comunidad,
  // con la orden explícita de no escribirlo dentro de la foto.
  const contexto = `The residential community is ${r.name}, in ${r.municipality}, Puerto Rico.`;

  // La limpieza se muestra por dentro: una casa limpia y ordenada, amueblada
  // según el nivel económico real de la comunidad. Un residencial público no
  // puede aparecer con cocina de isla y mármol.
  const nivel = nivelEconomico(r, arquetipo);
  const dentro = interiorDe(nivel, h);

  const servicios = [
    {
      clave: 'techos',
      sufijo: 'sellado de techos',
      interior: false,
      enfasis: `The photograph is about roof sealing: the flat concrete roofs are the main subject, coated in bright white elastomeric waterproofing, some freshly sealed with a satin sheen, seams, parapets and water tanks clearly visible. ${RESULTADO_TECHO}`,
    },
    {
      clave: 'limpieza',
      sufijo: 'limpieza',
      interior: true,
      nivel,
      enfasis: `The photograph is about house cleaning: a spotless, tidy and freshly cleaned interior, ${dentro.descripcion}. Everything is in its place, floors freshly mopped, surfaces wiped and polished, no clutter, no dishes in the sink, no stains on the upholstery, no dust, curtains open letting in daylight. ${RESULTADO_LIMPIEZA}`,
    },
  ];

  return servicios.map(({ clave, sufijo, enfasis, interior, nivel: nivelServicio }) => {
    const toma = interior
      ? `Camera: ${dentro.camara}; light: natural daylight from windows and open doors, warm interior whites; interior painted in ${PALETA_INTERIOR[(hash(r.slug) >> 9) % PALETA_INTERIOR.length]}.`
      : `Camera: ${camara}; light: ${luz}; ${paleta}.`;
    const lugar = interior
      ? `${contexto} The scene is inside a home in that community, consistent with its ${nivelServicio === 'modesto' ? 'modest, working-class' : nivelServicio === 'lujo' ? 'high-end' : nivelServicio === 'alto' ? 'upper-middle-class' : 'middle-class'} standard of living.`
      : `${contexto} ${articulo(vivienda)} ${vivienda} there.`;

    const prompt = [
      `Hyperrealistic 4K photograph, landscape 16:9, 3840x2160.`,
      lugar,
      interior ? `Setting: the ${dentro.escena} of a Puerto Rican home.` : `Setting: ${paisaje}.`,
      enfasis,
      toma,
      interior
        ? ACABADO_INTERIOR[nivelServicio]
        : 'Modern, well-maintained and recently upgraded appearance: clean facades, freshly coated white roofs, contemporary window frames, tidy landscaping, good condition throughout.',
      ...(interior && PROHIBIDO[nivelServicio] ? [PROHIBIDO[nivelServicio]] : []),
      interior
        ? 'Realistic Puerto Rican home materials: ceramic or porcelain tile floors, painted concrete walls, aluminium windows with louvres, ceiling fan, simple curtains, tropical daylight, believable everyday furniture for that standard of living.'
        : 'Realistic Puerto Rican building materials: reinforced concrete, painted stucco, aluminium windows, flat concrete roofs with visible elastomeric waterproof coating, water tanks, tropical vegetation, clean asphalt.',
      'Photorealistic documentary photography, full-frame camera, 35mm lens, natural color grading, ultra-detailed textures, no visible camera distortion.',
      'The community name is context only: do not write it, and show absolutely no text, no letters, no numbers, no signage, no logos, no watermarks, no brand marks, no license plates, no people.',
    ].join(' ');

    return {
      slug: `${r.slug}-${clave}`,
      comunidadSlug: r.slug,
      servicio: clave,
      name: r.name,
      municipality: r.municipality,
      priority: r.priority,
      tipo: r.type,
      arquetipo,
      region,
      archivo: `${base} - ${sufijo}.png`,
      prompt,
    };
  });
});

fs.writeFileSync(path.join(here, 'prompts.json'), JSON.stringify(prompts, null, 1), 'utf8');

const txt = prompts.map(p => [
  `${p.name} — ${p.municipality} (${p.priority})`,
  `archivo: ${p.archivo}`,
  p.prompt,
  '',
].join('\n')).join('\n');
fs.writeFileSync(path.join(here, 'prompts.txt'), txt, 'utf8');

const porArquetipo = {};
for (const p of prompts) porArquetipo[p.arquetipo] = (porArquetipo[p.arquetipo] || 0) + 1;
console.log(`Prompts generados: ${prompts.length}`);
console.log('Arquetipos:', JSON.stringify(porArquetipo));
console.log('Archivos:', path.relative(process.cwd(), path.join(here, 'prompts.json')), 'y prompts.txt');
