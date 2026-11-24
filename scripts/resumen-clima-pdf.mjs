/**
 * Genera el PDF «Resumen de tu cita + clima» con branding Ilatek.
 *
 * Uso:
 *   node scripts/resumen-clima-pdf.mjs --county "Dorado, Puerto Rico" \
 *     --service "Limpieza Profunda" --name "Mar Soler" --date "2026-11-20" --time "9:00 a.m." \
 *     --phone "{{custom_values.business__phone}}"
 *
 * --phone recibe el custom value ya resuelto (business__phone). Si llega vacío o
 * sin resolver ({{...}}), se usa DEFAULT_PHONE, que replica ese mismo valor.
 *
 * Salida:
 *   pdf/resumen-clima-cita.pdf   (destino del enlace del correo)
 *   pdf/build/resumen-clima-cita.html (fuente de impresión)
 */
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a.startsWith('--')) args[a.slice(2)] = process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[++i] : true;
}
const COUNTY = args.county || 'Dorado, Puerto Rico';
const SERVICE = args.service || 'Limpieza Profunda';
const NAME = args.name || 'Mar Soler';
const DATE = args.date || new Date(Date.now() + 5 * 864e5).toISOString().slice(0, 10);
const TIME = args.time || '9:00 a.m.';
const DEFAULT_PHONE = '787-561-7333';
const PHONE = (() => {
  const p = String(args.phone || '').trim();
  return !p || /\{\{|\}\}/.test(p) ? DEFAULT_PHONE : p;
})();
const PHONE_TEL = PHONE.replace(/[^\d+]/g, '');

const OUT_DIR = path.join(process.cwd(), 'pdf');
const BUILD_DIR = path.join(OUT_DIR, 'build');
fs.mkdirSync(BUILD_DIR, { recursive: true });

/* ---------- municipio: misma limpieza y fallback en cascada del bloque ---------- */
function cleanCounty(raw) {
  let v = String(raw || '').trim();
  if (!v || /\{\{|\}\}/.test(v)) return '';
  v = v.replace(/,\s*puerto\s*rico\.?$/i, '').trim();
  if (/^puerto\s*rico$/i.test(v)) return '';
  return v;
}
const SAN_JUAN = { latitude: 18.4655, longitude: -66.1057, name: 'Puerto Rico' };

async function geocode(name) {
  const url = 'https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(name) +
    '&countryCode=PR&language=es&count=1';
  const r = await fetch(url);
  if (!r.ok) return null;
  const j = await r.json();
  const hit = (j.results || [])[0];
  return hit ? { latitude: hit.latitude, longitude: hit.longitude, name: hit.name } : null;
}

async function locate(raw) {
  const base = cleanCounty(raw);
  if (base) {
    const full = await geocode(base);
    if (full) return { ...full, requested: base };
  }
  const head = base.split(',')[0].split(' ').slice(0, 3).join(' ').trim();
  if (head && head !== base) {
    const short = await geocode(head);
    if (short) return { ...short, requested: head };
  }
  return { ...SAN_JUAN, requested: 'Puerto Rico' };
}

/* ---------- pronóstico ---------- */
const DAYS_ES = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

async function forecast(lat, lon) {
  const url = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon +
    '&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m,is_day' +
    '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,wind_speed_10m_max' +
    '&timezone=America%2FPuerto_Rico&temperature_unit=fahrenheit&wind_speed_unit=mph&forecast_days=6';
  const r = await fetch(url);
  if (!r.ok) throw new Error('Open-Meteo respondió ' + r.status);
  return r.json();
}

/* ---------- códigos WMO → texto + icono ---------- */
function condition(code, isDay = 1) {
  if (code === 0) return { t: isDay ? 'Despejado' : 'Cielo claro', i: isDay ? 'sun' : 'moon' };
  if (code <= 2) return { t: 'Parcialmente nublado', i: 'partly' };
  if (code === 3) return { t: 'Nublado', i: 'cloud' };
  if (code <= 48) return { t: 'Niebla', i: 'fog' };
  if (code <= 57) return { t: 'Llovizna', i: 'rain' };
  if (code <= 67) return { t: 'Lluvia', i: 'rain' };
  if (code <= 77) return { t: 'Nieve', i: 'snow' };
  if (code <= 82) return { t: 'Chubascos', i: 'rain' };
  if (code <= 86) return { t: 'Chubascos de nieve', i: 'snow' };
  return { t: 'Tormenta', i: 'storm' };
}

const ICONS = {
  sun: '<circle cx="12" cy="12" r="4.6" fill="#FDB515"/><g stroke="#FDB515" stroke-width="1.7" stroke-linecap="round"><path d="M12 2.6v2.4M12 19v2.4M2.6 12h2.4M19 12h2.4M5.4 5.4l1.7 1.7M16.9 16.9l1.7 1.7M18.6 5.4l-1.7 1.7M7.1 16.9l-1.7 1.7"/></g>',
  moon: '<path d="M15.6 3.4a8.8 8.8 0 1 0 5 14.2A7.2 7.2 0 0 1 15.6 3.4Z" fill="#8FA8D8"/>',
  partly: '<circle cx="9" cy="9" r="3.6" fill="#FDB515"/><path d="M13 18.4h5.1a2.9 2.9 0 0 0 .2-5.8 4.1 4.1 0 0 0-7.8-.6 3.2 3.2 0 0 0 2.5 6.4Z" fill="#DCE6F2" stroke="#B9C8DA" stroke-width=".7"/>',
  cloud: '<path d="M7.4 18.2h9.2a3.4 3.4 0 0 0 .3-6.8 4.8 4.8 0 0 0-9.1-.7 3.7 3.7 0 0 0-.4 7.5Z" fill="#DCE6F2" stroke="#B9C8DA" stroke-width=".8"/>',
  fog: '<path d="M4 9.5h16M4 13h16M6 16.5h12" stroke="#B9C8DA" stroke-width="1.8" stroke-linecap="round"/>',
  rain: '<path d="M7.4 14.2h9.2a3.4 3.4 0 0 0 .3-6.8 4.8 4.8 0 0 0-9.1-.7 3.7 3.7 0 0 0-.4 7.5Z" fill="#DCE6F2" stroke="#B9C8DA" stroke-width=".8"/><g stroke="#4A9ADE" stroke-width="1.8" stroke-linecap="round"><path d="M9 17v2.6M12.4 17v3.4M15.8 17v2.4"/></g>',
  snow: '<g fill="#B9C8DA"><circle cx="8" cy="17" r="1.2"/><circle cx="12" cy="19" r="1.2"/><circle cx="16" cy="17" r="1.2"/></g><path d="M7.4 13.6h9.2a3.4 3.4 0 0 0 .3-6.8 4.8 4.8 0 0 0-9.1-.7 3.7 3.7 0 0 0-.4 7.5Z" fill="#DCE6F2" stroke="#B9C8DA" stroke-width=".8"/>',
  storm: '<path d="M7.4 13.4h9.2a3.4 3.4 0 0 0 .3-6.8 4.8 4.8 0 0 0-9.1-.7 3.7 3.7 0 0 0-.4 7.5Z" fill="#C9D5E2" stroke="#A9BACB" stroke-width=".8"/><path d="M12.6 14.2l-2.4 4h2.3l-1 3.6 4-4.9h-2.5l1-2.7Z" fill="#FDB515"/>'
};
const icon = (k, size = 34) => '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[k] || ICONS.cloud) + '</svg>';

/* ---------- recomendación (misma lógica que el bloque) ---------- */
function recommend(prob, uv, isTechos) {
  if (isTechos) {
    if (prob >= 50) return 'Hoy no es día para sellar: el techo tiene que estar seco. Aprovecha la agenda con $50 descontables del total y reprogramamos el sellado en la ventana más seca de la semana.';
    if (uv >= 8) return 'Ventana buena para inspección y sellado, con UV alto: conviene hidratación y trabajo temprano.';
    return 'Ventana buena para inspección y sellado: sin lluvia relevante en el pronóstico inmediato.';
  }
  if (prob >= 60) return 'Con esta probabilidad de lluvia, mejor el trabajo interior hoy; el exterior lo movemos a la ventana más seca de la semana.';
  if (prob >= 35) return 'Hay riesgo de chubascos: adelantamos lo de adentro y dejamos el exterior para después del mediodía.';
  return 'Buen día para el servicio completo, interior y exterior, sin lluvia relevante a la vista.';
}

const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const prettyDate = iso => {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('es-PR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

/* ---------- HTML de impresión ---------- */
function html(loc, fc) {
  const cur = fc.current;
  const d = fc.daily;
  const cond = condition(cur.weather_code, cur.is_day);
  const isTechos = /techo|sellado|impermeab|gotera|filtrac/i.test(SERVICE);
  const probToday = d.precipitation_probability_max[0] ?? 0;
  const uvToday = d.uv_index_max[0] ?? 0;
  const rec = recommend(probToday, uvToday, isTechos);
  const windDir = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'][Math.round(((cur.wind_direction_10m || 0) % 360) / 45) % 8];

  const days = d.time.slice(0, 5).map((iso, i) => {
    const c = condition(d.weather_code[i], 1);
    const wd = new Date(iso + 'T12:00:00').getDay();
    return '<td class="day">' +
      '<div class="day-n">' + (i === 0 ? 'Hoy' : DAYS_ES[wd]) + '</div>' +
      icon(c.i, 30) +
      '<div class="day-t">' + Math.round(d.temperature_2m_max[i]) + '°<span>/' + Math.round(d.temperature_2m_min[i]) + '°</span></div>' +
      '<div class="day-r">' + (d.precipitation_probability_max[i] ?? 0) + '% lluvia</div>' +
      '</td>';
  }).join('');

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>Resumen de tu cita — Ilatek</title>
<style>
  @page { size: A4; margin: 12mm; }
  * { box-sizing: border-box; }
  body { margin:0; font-family:"Helvetica Neue",Helvetica,Arial,sans-serif; color:#1d1d1f; background:#fff; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  .sheet { width:186mm; }
  .brand { background:#213d8e; color:#fff; border-radius:6mm; padding:7mm 8mm 6mm; }
  .brand-row { display:flex; align-items:center; gap:5mm; }
  .brand img { width:16mm; height:16mm; background:#fff; border-radius:3.5mm; padding:1.6mm; }
  .brand .co { font-size:8.4pt; line-height:1.35; color:#c9d5f3; }
  .brand .co b { display:block; color:#fff; font-size:10pt; letter-spacing:.2pt; }
  h1 { font-size:20pt; margin:6mm 0 1.5mm; letter-spacing:-.3pt; }
  .sub { margin:0; font-size:9.6pt; color:#cdd7f3; }
  .grid { display:flex; gap:4mm; margin-top:5mm; }
  .card { border:0.4mm solid #e5e5ea; border-radius:5mm; padding:4.5mm 5mm; }
  .card h2 { font-size:7.6pt; letter-spacing:.7pt; text-transform:uppercase; color:#6e6e73; margin:0 0 2.5mm; font-weight:700; }
  .cita { width:100%; border-collapse:collapse; font-size:9.2pt; }
  .cita td { padding:1.1mm 0; vertical-align:top; }
  .cita td.k { color:#6e6e73; width:42%; }
  .cita td.v { font-weight:700; }
  .hero { background:linear-gradient(180deg,#4a9ade 0%,#2a72c4 55%,#1c5aa6 100%); color:#fff; border-radius:5mm; padding:5mm 6mm; margin-top:4mm; }
  .hero-row { display:flex; align-items:center; gap:5mm; }
  .temp { font-size:34pt; font-weight:700; letter-spacing:-1pt; line-height:1; }
  .cond { font-size:10pt; color:#e8f2ff; }
  .place { font-size:8.4pt; letter-spacing:.5pt; text-transform:uppercase; color:#d6e6f7; margin-bottom:1mm; }
  .metrics { display:flex; gap:3mm; margin-top:4mm; }
  .metric { flex:1; background:rgba(255,255,255,.16); border-radius:3mm; padding:2.6mm 3mm; }
  .metric span { display:block; font-size:6.8pt; letter-spacing:.5pt; text-transform:uppercase; color:#d9e8f8; }
  .metric b { font-size:11pt; }
  .days { width:100%; border-collapse:separate; border-spacing:2.6mm 0; margin-top:3mm; }
  .day { width:20%; text-align:center; border:0.4mm solid #e5e5ea; border-radius:3.5mm; padding:3mm 1mm 2.6mm; }
  .day-n { font-size:7.4pt; text-transform:uppercase; letter-spacing:.5pt; color:#6e6e73; font-weight:700; }
  .day-t { font-size:11pt; font-weight:700; margin-top:1mm; }
  .day-t span { font-weight:400; color:#6e6e73; }
  .day-r { font-size:7.6pt; color:#0a84ff; margin-top:.6mm; }
  .rec { margin-top:4mm; background:#f2f2f7; border-radius:4mm; padding:4mm 5mm; }
  .rec .k { font-size:7.4pt; letter-spacing:.7pt; text-transform:uppercase; color:#6e6e73; font-weight:700; }
  .rec p { margin:1.5mm 0 0; font-size:9.6pt; line-height:1.5; }
  .check { margin-top:4mm; font-size:9.2pt; line-height:1.65; }
  .check div { padding-left:5mm; position:relative; }
  .check div:before { content:"•"; position:absolute; left:0; color:#00b94f; font-weight:700; font-size:12pt; line-height:1; top:.4mm; }
  .foot { margin-top:5mm; border-top:0.4mm solid #e5e5ea; padding-top:3mm; font-size:7.8pt; color:#8e8e93; display:flex; justify-content:space-between; }
  .foot b { color:#213d8e; }
</style></head>
<body><div class="sheet">

  <div class="brand">
    <div class="brand-row">
      <img src="https://cdn.jsdelivr.net/gh/aocpdev/Ilatek@main/assets/optimized/ilatek-logo-256.webp" alt="Ilatek">
      <div class="co"><b>Ilatek</b>${esc(SERVICE)}<br>Puerto Rico</div>
    </div>
    <h1>Resumen de tu cita</h1>
    <p class="sub">Preparado para ${esc(NAME)} · ${esc(prettyDate(DATE))}</p>
  </div>

  <div class="card" style="margin-top:4mm">
    <h2>Tu cita</h2>
    <table class="cita">
      <tr><td class="k">Servicio</td><td class="v">${esc(SERVICE)}</td></tr>
      <tr><td class="k">Municipio</td><td class="v">${esc(loc.name)}</td></tr>
      <tr><td class="k">Fecha y hora</td><td class="v">${esc(prettyDate(DATE))} · ${esc(TIME)}</td></tr>
      <tr><td class="k">Depósito</td><td class="v">$50 (se descuenta del total)</td></tr>
    </table>
  </div>

  <div class="hero">
    <div class="place">${esc(loc.name)}, Puerto Rico · hoy</div>
    <div class="hero-row">
      ${icon(cond.i, 52)}
      <div>
        <div class="temp">${Math.round(cur.temperature_2m)}°<span style="font-size:16pt;font-weight:400">F</span></div>
        <div class="cond">${esc(cond.t)} · sensación ${Math.round(cur.apparent_temperature)}°F</div>
      </div>
    </div>
    <div class="metrics">
      <div class="metric"><span>Prob. de lluvia</span><b>${probToday}%</b></div>
      <div class="metric"><span>Viento</span><b>${Math.round(cur.wind_speed_10m)} mph ${windDir}</b></div>
      <div class="metric"><span>Índice UV</span><b>${Math.round(uvToday)}</b></div>
      <div class="metric"><span>Humedad</span><b>${Math.round(cur.relative_humidity_2m)}%</b></div>
    </div>
  </div>

  <table class="days"><tr>${days}</tr></table>

  <div class="rec">
    <div class="k">Recomendación del día</div>
    <p>${esc(rec)}</p>
  </div>

  <div class="check">
    <div>Acceso al área de trabajo y estacionamiento libre el día de la visita.</div>
    <div>Agua y electricidad disponibles si el servicio lo requiere.</div>
    <div>Retira objetos frágiles de las superficies a tratar.</div>
    <div>Si necesitas mover la cita, avísanos con 24 horas de anticipación.</div>
  </div>

  <div class="foot">
    <div><b>ilatekpr.com</b> · <a href="tel:${esc(PHONE_TEL)}" style="color:#8e8e93;text-decoration:none">${esc(PHONE)}</a> · lunes a sábado, 8:00 a.m. – 6:00 p.m.</div>
    <div>Datos: Open-Meteo · ${new Date().toLocaleDateString('es-PR')}</div>
  </div>

</div></body></html>`;
}

/* ---------- ejecución ---------- */
const loc = await locate(COUNTY);
const fc = await forecast(loc.latitude, loc.longitude);
const outHtml = path.join(BUILD_DIR, 'resumen-clima-cita.html');
fs.writeFileSync(outHtml, html(loc, fc), 'utf8');

const pdf = path.join(OUT_DIR, 'resumen-clima-cita.pdf');
const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
execFileSync(edge, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  '--virtual-time-budget=6000',
  '--print-to-pdf=' + pdf,
  '--no-pdf-header-footer',
  'file:///' + outHtml.replace(/\\/g, '/')
], { stdio: 'ignore', timeout: 90000 });

const size = fs.existsSync(pdf) ? fs.statSync(pdf).size : 0;
console.log(JSON.stringify({
  county_requested: COUNTY,
  geocoded: loc.name,
  coords: [loc.latitude, loc.longitude],
  temp_f: Math.round(fc.current.temperature_2m),
  feels_f: Math.round(fc.current.apparent_temperature),
  rain_pct: fc.daily.precipitation_probability_max[0],
  uv: fc.daily.uv_index_max[0],
  wind_mph: Math.round(fc.current.wind_speed_10m),
  phone: PHONE,
  days: fc.daily.time.slice(0, 5),
  pdf,
  bytes: size
}, null, 2));
