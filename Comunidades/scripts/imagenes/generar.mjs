// Genera la imagen de cada comunidad con la API de WaveSpeedAI y la guarda en
// "comunidades imagenes" con el nombre de la comunidad como título.
//
//   export WAVESPEED_API_KEY=...            (o en Ilatek/.env)
//   node scripts/imagenes/generar.mjs --limite 5 --confirmar
//   node scripts/imagenes/generar.mjs --tier LUXURY --confirmar
//   node scripts/imagenes/generar.mjs --confirmar          # todas las que falten
//
// Modelo por defecto: google/nano-banana-pro/text-to-image, que es el que
// documenta salida 4K real (3840x2160 en 16:9) a $0.24 la imagen. Se puede
// cambiar con --modelo.
//
// Reglas que no se negocian aquí:
// - El POST de envío NO se reintenta. Si la conexión se cae después de que el
//   servidor aceptó la tarea, reintentar crea y cobra una segunda predicción.
//   Solo se reintenta la consulta del resultado (GET), que es segura.
// - Se salta lo que ya está en disco, así que se puede cortar y reanudar.
// - Antes de gastar, imprime el costo estimado y exige --confirmar si el lote
//   pasa de 20 imágenes.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const comunidades = path.resolve(here, '..', '..');

// Clave desde el entorno o desde Ilatek/.env, sin imprimirla nunca.
function clave() {
  if (process.env.WAVESPEED_API_KEY) return process.env.WAVESPEED_API_KEY;
  const env = path.resolve(comunidades, '..', '.env');
  if (fs.existsSync(env)) {
    for (const linea of fs.readFileSync(env, 'utf8').split(/\r?\n/)) {
      const m = linea.match(/^\s*WAVESPEED_API_KEY\s*=\s*(.+?)\s*$/);
      if (m) return m[1].replace(/^["']|["']$/g, '');
    }
  }
  return null;
}

const args = process.argv.slice(2);
const arg = (nombre, def) => (args.includes(nombre) ? args[args.indexOf(nombre) + 1] : def);
const limite = Number(arg('--limite', Infinity));
const tier = arg('--tier', null);
const modelo = arg('--modelo', 'google/nano-banana-pro/text-to-image');
const resolucion = arg('--resolucion', '4k');
const salida = path.resolve(comunidades, '..', 'comunidades imagenes');
const confirmar = args.includes('--confirmar');

const COSTO = { '1k': 0.14, '2k': 0.14, '4k': 0.24 };
const costoPorImagen = COSTO[resolucion];
if (!costoPorImagen) {
  console.error(`Resolución no válida: ${resolucion}. Usa 1k, 2k o 4k.`);
  process.exit(1);
}

const apiKey = clave();
if (!apiKey) {
  console.error('Falta WAVESPEED_API_KEY. Sin clave no se puede generar nada.');
  process.exit(1);
}

const prompts = JSON.parse(fs.readFileSync(path.join(here, 'prompts.json'), 'utf8'));
const manifiesto = path.join(here, 'imagenes.json');
const previo = fs.existsSync(manifiesto) ? JSON.parse(fs.readFileSync(manifiesto, 'utf8')) : {};
const registro = { ...previo };

fs.mkdirSync(salida, { recursive: true });

const pendientes = prompts
  .filter(p => !tier || p.priority === tier)
  .filter(p => !fs.existsSync(path.join(salida, p.archivo)))
  .slice(0, limite);

if (!pendientes.length) {
  console.log('No hay nada pendiente: todas las imágenes de ese filtro ya están en disco.');
  process.exit(0);
}

const estimado = (pendientes.length * costoPorImagen).toFixed(2);
console.log(`${pendientes.length} imágenes pendientes · ${resolucion} · ${modelo}`);
console.log(`Costo estimado: $${estimado} (${costoPorImagen} por imagen)`);
if (pendientes.length > 20 && !confirmar) {
  console.error('Lote grande: vuelve a ejecutar con --confirmar para gastar ese monto.');
  process.exit(1);
}

const dormir = ms => new Promise(r => setTimeout(r, ms));

// El POST se envía una sola vez. Si falla, se marca y se sigue: nunca se
// reintenta, porque el servidor pudo haber creado la tarea de todos modos.
async function enviar(prompt) {
  const res = await fetch(`https://api.wavespeed.ai/api/v3/${modelo}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, aspect_ratio: '16:9', resolution: resolucion, output_format: 'png' }),
    signal: AbortSignal.timeout(90_000),
  });
  const texto = await res.text();
  let cuerpo;
  try { cuerpo = JSON.parse(texto); } catch { cuerpo = { message: texto }; }
  if (!res.ok || cuerpo.code !== 200) throw new Error(cuerpo.message || `HTTP ${res.status}`);
  return cuerpo.data;
}

async function esperar(id) {
  let espera = 2_000;
  let fallos = 0;
  for (;;) {
    let res;
    try {
      res = await fetch(`https://api.wavespeed.ai/api/v3/predictions/${id}/result`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(30_000),
      });
    } catch (e) {
      if (++fallos > 6) throw e;
      await dormir(Math.min(10_000, 500 * 2 ** (fallos - 1)) + Math.random() * 250);
      continue;
    }
    const texto = await res.text();
    let cuerpo;
    try { cuerpo = JSON.parse(texto); } catch { cuerpo = { message: texto }; }
    if (!res.ok) {
      const transitorio = res.status === 429 || res.status >= 500;
      if (!transitorio || ++fallos > 6) throw new Error(cuerpo.message || `HTTP ${res.status}`);
      await dormir(2_000 + Math.random() * 500);
      continue;
    }
    if (cuerpo.code !== 200) throw new Error(cuerpo.message || 'Consulta de resultado fallida');
    fallos = 0;
    const datos = cuerpo.data;
    if (datos.status === 'completed') return datos.outputs?.[0];
    if (['failed', 'cancelled', 'timeout', 'deleted'].includes(datos.status)) {
      throw new Error(`Tarea ${datos.status}${datos.error ? `: ${datos.error}` : ''}`);
    }
    await dormir(espera);
    espera = Math.min(10_000, espera + 1_000);
  }
}

let listas = 0;
let errores = 0;
for (const [i, p] of pendientes.entries()) {
  const destino = path.join(salida, p.archivo);
  const etiqueta = `${i + 1}/${pendientes.length} ${p.name} (${p.municipality})`;
  try {
    const tarea = await enviar(p.prompt);
    registro[p.slug] = { ...registro[p.slug], name: p.name, archivo: p.archivo, modelo, resolucion, id: tarea.id, creado: new Date().toISOString() };
    fs.writeFileSync(manifiesto, JSON.stringify(registro, null, 1), 'utf8');

    const url = await esperar(tarea.id);
    if (!url) throw new Error('La tarea terminó sin URL de salida');
    const img = await fetch(url, { signal: AbortSignal.timeout(120_000) });
    if (!img.ok) throw new Error(`Descarga falló: HTTP ${img.status}`);
    fs.writeFileSync(destino, Buffer.from(await img.arrayBuffer()));

    registro[p.slug] = { ...registro[p.slug], url, estado: 'ok' };
    listas++;
    console.log(`${etiqueta} → ${p.archivo}`);
  } catch (e) {
    // Si quedó un id, la tarea pudo cobrarse aunque falle: se anota para poder
    // revisarla en el panel antes de volver a lanzarla.
    errores++;
    registro[p.slug] = { ...registro[p.slug], estado: 'error', error: e.message };
    console.error(`${etiqueta} → ERROR: ${e.message}`);
  } finally {
    fs.writeFileSync(manifiesto, JSON.stringify(registro, null, 1), 'utf8');
  }
}

console.log(`\nListas: ${listas} · con error: ${errores}`);
console.log('Carpeta:', salida);
console.log('Manifiesto:', path.relative(process.cwd(), manifiesto));
