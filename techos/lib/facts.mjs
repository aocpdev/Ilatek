// Ilatek · Techos · lector único del registro de hechos verificables.
// Ningún módulo, schema o generador debe hardcodear precios, duraciones,
// licencias, ratings ni años: todo se lee de
// documentacion/seo/hechos-sellado-2026-11-07.json y solo se publica cuando
// estado === "verificado" y hay un valor real.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const REGISTRY_PATH = path.join(ROOT, 'documentacion/seo/hechos-sellado-2026-11-07.json');

export const REGISTRY = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));

const FACTS = new Map(REGISTRY.hechos.map((f) => [f.id, f]));

// Slugs de techos que tienen un precio base publicado y un hecho equivalente
// en el registro. Si un slug no está aquí, su schema no publica precio.
const SLUG_TO_SYSTEM = {
  'sellado-de-silicona': 'silicona-100',
  'membrana-asfaltica': 'membrana-asfaltica',
  'recubrimiento-elastomerico': 'elastomerico',
  'sellado-de-poliuretano': 'poliuretano',
  'sellado-acrilico': 'acrilico',
};

export function getFact(id) {
  return FACTS.get(id) || null;
}

// Hecho publicable: verificado y con valor. Un pendiente/conflicto devuelve null
// y el llamador debe renderizar la versión sin cifra.
export function verifiedFact(id) {
  const f = getFact(id);
  if (!f || f.estado !== 'verificado' || f.valor === null || f.valor === '') return null;
  return f;
}

export function verifiedValue(id) {
  const f = verifiedFact(id);
  return f ? f.valor : null;
}

// Precio numérico para JSON-LD. Solo sale del valor verificado del sistema;
// nunca de page.price, que puede describir otra unidad (p. ej. labor desde $250).
export function schemaPriceFor(slug) {
  const systemId = SLUG_TO_SYSTEM[slug];
  if (!systemId) return null;
  const system = REGISTRY.sistemas.find((s) => s.id === systemId);
  const fact = system ? verifiedFact(system.precioFact) : null;
  if (!fact) return null;
  const match = String(fact.valor).match(/\$\s*([\d]+(?:\.\d{1,2})?)/);
  if (!match) return null;
  const amount = Number(match[1]);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

// AggregateRating solo si hay un hecho de reseñas verificado con rating y
// conteo reales. Hoy el registro lo mantiene pendiente: nunca se publica.
export function ratingVerified() {
  const f = getFact('resenas');
  return !!(f && f.estado === 'verificado' && f.ratingValue && f.reviewCount);
}

export function systemRows() {
  return REGISTRY.sistemas.map((system) => {
    const price = verifiedFact(system.precioFact);
    const duration = verifiedFact(system.duracionFact);
    return {
      ...system,
      price: price ? price.valor : null,
      duration: duration ? duration.valor : null,
    };
  });
}

// Criterios de la comparativa M3, en orden de lectura. Cada uno se resuelve
// contra el registro: precio y duración son hechos globales del sistema;
// uv/tiempo/mantenimiento/cuando/limitacion viven en systems[].criterios y solo
// se publican con estado "verificado" y fuente.
export const CRITERIA = [
  { key: 'precio', label: 'Precio desde' },
  { key: 'duracion', label: 'Duración publicada' },
  { key: 'sustrato', label: 'Sustrato recomendado' },
  { key: 'uv', label: 'UV y lluvia' },
  { key: 'tiempo', label: 'Tiempo de obra' },
  { key: 'mantenimiento', label: 'Mantenimiento' },
  { key: 'cuando', label: 'Cuándo elegirlo' },
  { key: 'limitacion', label: 'Limitación declarada' },
];

function criterionValue(system, key) {
  if (key === 'precio') return system.price || null;
  if (key === 'duracion') return system.duration || null;
  if (key === 'sustrato') return system.mejorPara || null;
  const c = system.criterios && system.criterios[key];
  if (!c || c.estado !== 'verificado' || !c.valor || !c.fuente) return null;
  return c.valor;
}

// Matriz para la tabla 5×8. La primera celda de cada fila es el nombre del
// sistema; las demás son valor verificado o null (se renderiza como pendiente).
export function comparisonRows() {
  return {
    labels: ['Sistema', ...CRITERIA.map((c) => c.label)],
    rows: systemRows().map((system) => ({
      id: system.id,
      system: system.nombre,
      cells: [system.nombre, ...CRITERIA.map((c) => criterionValue(system, c.key))],
    })),
  };
}

// Importes para la tabla de costo por tamaño. Se leen del precio verificado del
// sistema ($X por servicio) y nunca de page.price (que describe otra unidad).
export const money = {
  format(amount) {
    return '$' + Number(amount).toLocaleString('en-US', { maximumFractionDigits: 0 });
  },
  amount(systemId) {
    const system = REGISTRY.sistemas.find((s) => s.id === systemId);
    if (!system) return null;
    const fact = verifiedFact(system.precioFact);
    if (!fact) return null;
    const match = String(fact.valor).match(/\$\s*([\d]+(?:\.\d{1,2})?)/);
    if (!match) return null;
    const amount = Number(match[1]);
    return Number.isFinite(amount) && amount > 0 ? amount : null;
  },
};

// Rango publicado por servicio (se conserva para consumidores externos).
export function publishedRange() {
  const fact = verifiedFact('rango-publicado');
  if (!fact || !fact.valor) return null;
  const nums = String(fact.valor).match(/[\d]+(?:\.\d{1,2})?/g);
  if (!nums || nums.length < 2) return null;
  const min = Number(nums[0]);
  const max = Number(nums[1]);
  return Number.isFinite(min) && Number.isFinite(max) && min > 0 && max >= min ? { min, max } : null;
}

export function isVerified(id) {
  return !!verifiedFact(id);
}

// Fecha de la ficha de hechos: única fuente para "verificado el …" en tablas y
// módulos. `short` devuelve "7 nov 2026"; sin él, "7 de noviembre de 2026".
export function registryDate(short = false) {
  const d = new Date(REGISTRY.generatedAt + 'T00:00:00');
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  return short
    ? `${d.getDate()} ${meses[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`
    : `${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
}
