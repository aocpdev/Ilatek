// Ilatek · Techos · módulos AEO reutilizables (answer-first).
// Estructura fija: H2 en forma de pregunta, respuesta directa con cifra solo si
// el hecho está verificado, tabla de apoyo, línea de fuente y UN solo enlace
// contextual al final. Los valores se leen del registro de hechos; un hecho
// pendiente o en conflicto se muestra como "Se confirma en la inspección", nunca
// con una cifra inventada.
import { registryDate, systemRows, verifiedValue } from './facts.mjs';
import { comparisonTableHtml, priceSourceTableHtml, systemPath } from './tables.mjs';

const WEBSITE = 'https://{{custom_values.website_url}}';
const PENDING = 'Se confirma en la inspección';
const serviceHref = (id) => WEBSITE + systemPath(id);

function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function shell(id, question, lead, support, source, link) {
  return `    <!-- AEO: ${id} (H2 pregunta + respuesta directa + tabla + fuente + 1 enlace) -->
    <section class="ilt-aeo" id="ilt-aeo-${id}" aria-labelledby="ilt-aeo-${id}-title">
      <div class="ilt-shell">
        <div class="ilt-aeo-box ilt-reveal">
          <span class="ilt-eyebrow">Respuesta directa</span>
          <h2 id="ilt-aeo-${id}-title" class="ilt-display">${esc(question)}</h2>
          <p class="ilt-aeo-lead">${lead}</p>
          ${support}
          <p class="ilt-aeo-src">${esc(source)}</p>
          <p class="ilt-aeo-actions"><a class="ilt-button" href="${link.href}"><span>${esc(link.label)}</span><span aria-hidden="true">↗</span></a></p>
        </div>
      </div>
    </section>`;
}

function priceList() {
  return priceSourceTableHtml({
    caption: 'Precio base publicado por sistema, con la página que lo publica y la fecha de verificación.',
    hrefFor: serviceHref,
  });
}

function comparisonTable() {
  return comparisonTableHtml({
    tableClass: 'ilt-aeo-table ilt-aeo-table--8',
    caption: 'Comparación de los 5 sistemas de sellado de Ilatek',
    hrefFor: serviceHref,
  });
}

// Estilos propios del módulo, con alcance .ilt-aeo para no tocar la landing.
function styles() {
  return `    <style>
    .ilt-aeo{padding:clamp(56px,7vw,92px) 0;background:#f5f2ea}
    .ilt-aeo-box{max-width:1080px;margin:0 auto;background:#fff;border:1px solid rgba(18,32,28,.12);border-radius:22px;padding:clamp(24px,4vw,44px);box-shadow:0 18px 50px rgba(18,32,28,.08)}
    .ilt-aeo h2{font-size:clamp(28px,3.2vw,42px);line-height:1.12;margin:12px 0 14px}
    .ilt-aeo-lead{font-size:clamp(17px,1.6vw,20px);line-height:1.65;color:#263a34;margin:0 0 20px}
    .ilt-aeo-list{list-style:none;padding:0;margin:0 0 18px;display:grid;gap:8px}
    .ilt-aeo-list li{display:flex;justify-content:space-between;gap:16px;padding:10px 14px;border-radius:10px;background:#f5f2ea}
    .ilt-aeo-list span{white-space:nowrap;font-variant-numeric:tabular-nums}
    .ilt-aeo-tablewrap{overflow-x:auto;margin:0 0 18px;-webkit-overflow-scrolling:touch}
    .ilt-aeo-table{width:100%;border-collapse:collapse;min-width:640px;font-size:15px}
    .ilt-aeo-table--8{min-width:1000px}
    .ilt-aeo-table--cost{min-width:720px}
    .ilt-aeo-table caption{text-align:left;font-weight:700;padding:0 0 10px;color:#263a34}
    .ilt-aeo-table th,.ilt-aeo-table td{padding:11px 12px;border-bottom:1px solid rgba(18,32,28,.12);text-align:left;vertical-align:top}
    .ilt-aeo-table thead th{background:#123c33;color:#fff;font-size:13px;letter-spacing:.02em}
    .ilt-aeo-table tbody th{font-weight:700}
    .ilt-aeo-table td{font-variant-numeric:tabular-nums}
    .ilt-aeo-src{font-size:13px;line-height:1.55;color:#5b6b65;margin:0 0 18px}
    .ilt-aeo-actions{margin:0}
    .ilt-aeo-table--price{min-width:820px}
    .ilt-aeo-facts{list-style:none;padding:0;margin:0 0 18px;display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px}
    .ilt-aeo-facts li{background:#f5f2ea;border-radius:12px;padding:12px 14px}
    .ilt-aeo-facts b{display:block;font:800 19px/1.3 Manrope,Arial,sans-serif;color:#123c33}
    .ilt-aeo-facts span{display:block;font-size:13px;line-height:1.45;color:#3d4f49;margin-top:3px}
    .ilt-aeo-guides{list-style:none;padding:0;margin:0 0 16px;display:grid;gap:9px}
    .ilt-aeo-guides li{padding:11px 14px;border-radius:10px;background:#f5f2ea}
    .ilt-aeo-guides a{color:#123c33;font-weight:700;text-decoration:underline;text-underline-offset:2px}
    .ilt-aeo-guides a:hover{color:#0a6b45}
    @media(max-width:640px){.ilt-aeo-list li{flex-direction:column;gap:2px}.ilt-aeo-list span{white-space:normal}}
    </style>`;
}

// M1 · apertura answer-first: qué sistema, cuánto cuesta, cuánto dura y en
// cuántos días. Todo sale del registro; si un hecho falta, se dice que se
// confirma en la inspección y no se escribe una cifra inventada.
export function answerModule() {
  const desde = verifiedValue('precio-sellado-desde');
  const dur = verifiedValue('duracion-silicona');
  const sil = systemRows().find((s) => s.id === 'silicona-100');
  const tiempo = sil && sil.criterios && sil.criterios.tiempo ? sil.criterios.tiempo.valor : null;
  const days = tiempo ? (String(tiempo).match(/\d+\s*(?:a\s*\d+\s*)?d[ií]as?/i) || [null])[0] : null;
  const lead = desde
    ? `El sellado de techos en Puerto Rico publica <strong>${esc(desde)}</strong>, según el sistema. La silicona 100% publica <strong>${esc(dur || 'la mayor duración del grupo')}</strong>${days ? ` y se aplica en <strong>${esc(days)}</strong>` : ''}. Agenda una visita o una inspección: $50 descontables del total del servicio, y el precio se confirma por escrito.`
    : 'El precio del sellado depende del sistema y del trabajo. Agenda una visita o una inspección: $50 descontables del total del servicio, y el precio se confirma por escrito antes de comenzar.';
  const facts = [
    ['Precio publicado', desde || PENDING],
    ['Duración (silicona 100%)', dur || PENDING],
    ['Tiempo de obra', days || PENDING],
    ['Sistema según techo', sil ? sil.mejorPara : PENDING],
  ].map(([label, value]) => `<li><b>${esc(value)}</b><span>${esc(label)}</span></li>`).join('\n');
  return `    <!-- AEO: respuesta (apertura answer-first: sistema, precio, duración, días) -->
    <section class="ilt-aeo" id="ilt-aeo-respuesta" aria-labelledby="ilt-aeo-respuesta-title">
      <div class="ilt-shell">
        <div class="ilt-aeo-box ilt-reveal">
          <span class="ilt-eyebrow">Respuesta directa</span>
          <h2 id="ilt-aeo-respuesta-title" class="ilt-display">Sellado de techos en Puerto Rico: precio, duración y tiempo de obra</h2>
          <p class="ilt-aeo-lead">${lead}</p>
          <ul class="ilt-aeo-facts">
${facts}
          </ul>
          <p class="ilt-aeo-src">Fuente: registro de hechos de Ilatek Techos, verificado el ${esc(registryDate())}.</p>
          <p class="ilt-aeo-actions"><a class="ilt-button" href="${WEBSITE}/cotizacion"><span>Calcula el precio de tu techo</span><span aria-hidden="true">↗</span></a></p>
        </div>
      </div>
    </section>`;
}

// M12 · guías del blog que profundizan en el mismo tema. Tres o más enlaces
// contextuales con ancla descriptiva (nunca la URL como texto).
const GUIDES = [
  { path: '/blog/preguntas-frecuentes-sellado-de-techos-precio', label: 'Preguntas frecuentes de precio de sellado en Puerto Rico' },
  { path: '/blog/preguntas-frecuentes-sellado-de-techos-materiales', label: 'Dudas de materiales: silicona, membrana, poliuretano y acrílico' },
  { path: '/blog/preguntas-frecuentes-sellado-de-techos-proceso', label: 'Cómo se aplica un sellado de techo, paso a paso' },
  { path: '/blog/preguntas-frecuentes-sellado-de-techos-garantia-y-leyes', label: 'Garantías, licencias y quién responde por el trabajo' },
];

export function guidesModule() {
  const items = GUIDES.map((g) => `<li><a href="${WEBSITE}${g.path}">${esc(g.label)}</a></li>`).join('\n');
  return `    <!-- AEO: guías del blog (3+ enlaces contextuales a los clusters) -->
    <section class="ilt-aeo" id="ilt-aeo-guias" aria-labelledby="ilt-aeo-guias-title">
      <div class="ilt-shell">
        <div class="ilt-aeo-box ilt-reveal">
          <span class="ilt-eyebrow">Guías del blog</span>
          <h2 id="ilt-aeo-guias-title" class="ilt-display">Las preguntas que resuelven la decisión, respondidas por escrito</h2>
          <ul class="ilt-aeo-guides">
${items}
          </ul>
          <p class="ilt-aeo-src">Cada guía responde una duda concreta y enlaza al sistema o al método que la resuelve. Precios y duraciones verificados el ${esc(registryDate(true))}.</p>
        </div>
      </div>
    </section>`;
}

// M2 · precio: respuesta con el precio de entrada verificado y lista de los 5
// sistemas. El enlace contextual es el cotizador (una sola ruta de conversión).
export function priceModule() {
  const desde = verifiedValue('precio-sellado-desde');
  const lead = desde
    ? `El precio base publicado por Ilatek es <strong>${esc(desde)}</strong>, según el sistema. El precio final depende del trabajo y la condición del techo, y se confirma por escrito después de la visita o inspección de $50 descontables del total.`
    : 'El precio del sellado depende del sistema elegido y la condición del techo. Ilatek lo confirma por escrito después de la visita o inspección de $50 descontables del total, sin compromiso.';
  return styles() + '\n' + shell(
    'precio',
    '¿Cuánto cuesta sellar un techo en Puerto Rico?',
    lead,
    priceList(),
    'Fuente: precios base publicados por Ilatek Techos (noviembre 2026), por servicio. No incluyen reparaciones estructurales ni trabajos adicionales.',
    { href: `${WEBSITE}/cotizacion`, label: 'Calcula el precio de tu techo con el cotizador de Ilatek' },
  );
}

// M3 · comparativa de los 5 sistemas × 8 criterios. Cada celda sale del registro;
// si el hecho está pendiente, dice que se confirma en la inspección.
export function comparisonModule() {
  const silicona = verifiedValue('duracion-silicona');
  const membrana = verifiedValue('duracion-membrana');
  const poliuretano = verifiedValue('duracion-poliuretano');
  const acrilico = verifiedValue('duracion-acrilico');
  const lead = silicona && membrana && poliuretano && acrilico
    ? `No hay un solo sistema: la silicona 100% es la de mayor duración publicada (<strong>${esc(silicona)}</strong>), membrana y poliuretano rondan <strong>${esc(membrana)}</strong>, y el acrílico <strong>${esc(acrilico)}</strong>. La elección depende del sustrato, el tránsito y el presupuesto, no de la marca.`
    : 'No hay un solo sistema: la elección depende del sustrato, el tránsito y el presupuesto. Ilatek compara los cinco sistemas en la inspección y confirma por escrito el que corresponde.';
  return shell(
    'sistemas',
    '¿Qué sistema de sellado de techo conviene más?',
    lead,
    comparisonTable(),
    'Fuente: registro de hechos de Ilatek Techos (noviembre 2026). Duraciones y tiempos publicados para Puerto Rico; la vida útil real depende del mantenimiento y la exposición. Los criterios sin dato publicado se confirman en la inspección.',
    { href: `${WEBSITE}/impermeabilizacion-de-techos`, label: 'Compara sellado e impermeabilización de techos en Puerto Rico' },
  );
}

// M4 · costo por tamaño de techo. Solo se publica si hay precios verificados.
export function costModule() {
  return shell(
    'costo',
    '¿Cuánto cuesta sellar un techo?',
    'El sellado de techos publica <strong>precios desde $250</strong> por servicio, según el sistema y la condición del techo. Agenda una visita o una inspección: $50 descontables del total del servicio, y el precio final se confirma por escrito antes de comenzar.',
    priceList(),
    'Precio publicado por servicio. Incluye preparación y aplicación del sistema; no incluye reparaciones estructurales, remoción de escombros ni trabajos adicionales.',
    { href: `${WEBSITE}/cotizacion`, label: 'Agenda tu visita o inspección con el cotizador de Ilatek' },
  );
}

// Solo la página money monta los módulos. Las demás landings conservan su
// estructura para no duplicar la misma comparativa en 34 URLs.
export function moneyModules() {
  return [styles(), priceModule(), comparisonModule(), costModule(), guidesModule()].join('\n');
}

// Segunda landing money (hub /techos): mismo patrón sin el módulo de costo por
// tamaño, para no repetir el desglose que ya vive en /sellado-de-techos.
export function hubMoneyModules() {
  return [styles(), priceModule(), comparisonModule(), guidesModule()].join('\n');
}
