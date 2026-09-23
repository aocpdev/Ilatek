// Crea los campos custom del cotizador en GHL con claves exactas al payload del webhook
// Uso: GHL_PIT=pit-xxx node tools/ghl-create-cotizador-fields.mjs
const TOKEN = process.env.GHL_PIT;
const LOC = '8OxUENFVM60EKzqsTcoD';
const BASE = 'https://services.leadconnectorhq.com';
const H = {
  Authorization: 'Bearer ' + TOKEN,
  Version: '2021-07-28',
  'Content-Type': 'application/json',
  Accept: 'application/json'
};

// [nombre, dataType] — el slug del nombre genera la fieldKey que el cotizador envía
const FIELDS = [
  ['Valor Oportunidad', 'NUMERICAL'],
  ['Deposito Requerido', 'NUMERICAL'],
  ['Pies Cuadrados', 'NUMERICAL'],
  ['Tipo De Servicio', 'TEXT'],
  ['Duracion Estimada', 'TEXT'],
  ['Ventanas Interiores', 'NUMERICAL'],
  ['Ventanas Exteriores', 'NUMERICAL'],
  ['Refrigerador', 'TEXT'],
  ['Horno', 'TEXT'],
  ['Lavaplatos', 'TEXT'],
  ['Lavadora Secadora', 'NUMERICAL'],
  ['Muebles Limpieza Regular', 'NUMERICAL'],
  ['Muebles Lavado Profundo', 'NUMERICAL'],
  ['Alfombras Pies2', 'NUMERICAL'],
  ['Lechada Losas Pies2', 'NUMERICAL'],
  ['Despensas', 'NUMERICAL'],
  ['Closets', 'NUMERICAL'],
  ['Garaje Pies2', 'NUMERICAL']
];

const slug = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

const res = await fetch(`${BASE}/locations/${LOC}/customFields?model=contact`, { headers: H });
const existing = new Set(((await res.json()).customFields ?? []).map(f => f.fieldKey));

for (const [name, dataType] of FIELDS) {
  const key = 'contact.' + slug(name);
  if (existing.has(key)) { console.log('SKIP  (ya existe)', key); continue; }
  const r = await fetch(`${BASE}/locations/${LOC}/customFields`, {
    method: 'POST', headers: H,
    body: JSON.stringify({ name, dataType, model: 'contact' })
  });
  const j = await r.json().catch(() => ({}));
  console.log(r.ok ? 'CREADO' : 'ERROR', key, r.ok ? (j.customField?.id ?? '') : JSON.stringify(j).slice(0, 160));
}
console.log('--- fin ---');
