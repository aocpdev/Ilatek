// Ilatek · alta de subcuentas (locations) en GHL, un municipio por location.
//
//   node tools/ghl/crear-subcuentas.mjs [opciones]
//
// Modo por defecto: DRY-RUN. No escribe nada; imprime el payload de cada
// municipio para revisarlo. Para crear de verdad hace falta --crear, y en ese
// modo el límite por defecto es 1 (piloto) hasta que pases --limit.
//
//   node tools/ghl/crear-subcuentas.mjs                          # 78 payloads, sin escribir
//   GHL_COMPANY_ID=xxx node tools/ghl/crear-subcuentas.mjs --crear
//        -> crea SOLO el primero (Adjuntas) y le pone sus custom values
//   GHL_COMPANY_ID=xxx node tools/ghl/crear-subcuentas.mjs --crear --limit 5
//   GHL_COMPANY_ID=xxx node tools/ghl/crear-subcuentas.mjs --crear --from Cabo --to Dorado
//   GHL_COMPANY_ID=xxx node tools/ghl/crear-subcuentas.mjs --valores --only juncos
//        -> no crea nada: solo (re)escribe los custom values de una location existente
//
// Molde: el del alta manual del owner (Devaks), campo por campo —
//   First Name "Luis y Aida" · Last Name "Ilatek" · Email ilatek.pr@gmail.com
//   Business Name "Ilatek - <Municipio>" · Phone +19393577351
//   Street Address / City = municipio · Country / State = Puerto Rico
//   Zip = ZIP principal del municipio (municipios.json)
//   Website <slug>.ilatekpr.com · Time Zone GMT-04:00 America/Santo_Domingo
// Ese email es el de la CUENTA (contacto/propietario, GHL lo verifica); el que
// publica el sitio es business__email del contrato de custom values.
//
// Snapshot: el alta manual cargó el snapshot "Ilatek" (pestaña My Snapshots,
// tipo `own`) antes de escoger la dirección en el mapa. La API solo acepta el
// id, así que --snapshot-name lo resuelve con GET /snapshots/ (scope
// snapshots.readonly); --snapshot toma el id directo.
//
// Tipo de cuenta: el alta manual quedó como cliente/SaaS (`l_type=saas` en su
// URL). La API no lo hace al crear: es una llamada aparte,
// POST /saas/enable-saas/{id} con companyId + isSaaSV2, y en V2 exige
// `contactId` (la subcuenta de pagos de la agencia). Por eso NO es automático:
// sin --saas (y su --contact-id) las locations quedan como subcuentas normales
// de agencia, con snapshot pero sin rebilling.
//
// Token: GHL_PIT o ZJ_GHL_PIT en el entorno, o tmp-ghl-pit.txt en la raíz del
// repo (`GHL_PIT=pit-...`, ignorado por git). Nunca se imprime ni se escribe en
// el reporte.
//
// Requisitos que no se pueden saltar: plan Agency Pro y PIT con locations.write.
// Las locations se crean en contexto de agencia; un token de location no sirve.
// Contrato de la API: POST /locations/ con `Version: v3` (name + companyId son
// lo único obligatorio); custom values por location en
// POST /locations/{id}/customValues con {name, value}.
//
// Los nombres viven en tools/ghl/municipios.json y los valores de marca en
// tools/qa/custom-values.json: este script no los retipea.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "../..");
const BASE = "https://services.leadconnectorhq.com";
// v3 es lo que pide la página de create-location; 2021-07-28 sigue aceptándose y
// es la que usa la propia app web. GHL_API_VERSION lo sobreescribe.
const API_VERSION = process.env.GHL_API_VERSION || "v3";
// La app web llama a la API con su token de sesión y estas dos cabeceras; sin
// ellas la API responde 401 "Token source/channel mismatch". Con un PIT de
// agencia no hacen falta: se activan solo si defines GHL_SOURCE/GHL_CHANNEL.
const SOURCE = process.env.GHL_SOURCE || "";
const CHANNEL = process.env.GHL_CHANNEL || "";
// GMT-04:00 America/Santo_Domingo es lo que quedó seleccionado en el alta manual
// (mismo offset AST que Puerto Rico; el desplegable de GHL no ofrece PR).
const TIMEZONE = "America/Santo_Domingo";
const COUNTRY = "PR";
const STATE = "PR";
// Website - State / Website - Region son la ubicación del sitio, no la del
// pueblo: PR para todo el archivo, y Puerto Rico como región (lo que muestra el
// desplegable de GHL para PR).
const REGION = "Puerto Rico";
const BRAND_WEBSITE = "ilatekpr.com"; // sin protocolo: lo exige el contrato de enlaces
// Datos fijos del molde: no cambian por municipio.
const CUENTA_FIRST_NAME = "Luis y Aida";
const CUENTA_LAST_NAME = "Ilatek";

// ---------- argumentos ----------
const argv = process.argv.slice(2);
const flag = (name) => argv.includes(name);
const opt = (name, fallback = null) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : fallback;
};

const crear = flag("--crear");
const soloValores = flag("--valores");
// Inventario de solo lectura: qué municipios ya tienen subcuenta y cuáles faltan.
const soloEstado = flag("--estado");
const syncValores = flag("--sync-values") || soloValores;
const limitArg = opt("--limit", null);
// Piloto por defecto: crear sin decir cuántas es una sola.
const limit = limitArg ? parseInt(limitArg, 10) : crear ? 1 : Infinity;
const only = (opt("--only", "") || "").split(",").map((s) => s.trim()).filter(Boolean);
const from = opt("--from", null);
const to = opt("--to", null);
const companyId = opt("--company", process.env.GHL_COMPANY_ID || "");
const email = opt("--email", "ilatek.pr@gmail.com");
const phone = opt("--phone", "+19393577351");
let snapshotId = opt("--snapshot", process.env.GHL_SNAPSHOT_ID || "");
const snapshotName = opt("--snapshot-name", process.env.GHL_SNAPSHOT_NAME || "Ilatek");
const saas = flag("--saas");
const contactId = opt("--contact-id", process.env.GHL_SAAS_CONTACT_ID || "");
const providerLocationId = opt("--provider-location", process.env.GHL_SAAS_PROVIDER_LOCATION || "");
const saasPlanId = opt("--saas-plan", process.env.GHL_SAAS_PLAN_ID || "");
const priceId = opt("--price", process.env.GHL_SAAS_PRICE_ID || "");

// ---------- token ----------
function loadToken() {
  for (const key of ["GHL_PIT", "ZJ_GHL_PIT"]) {
    if (process.env[key]) return process.env[key].trim();
  }
  for (const file of ["tmp-ghl-pit.txt", ".ghl-pit"]) {
    try {
      const txt = fs.readFileSync(path.join(REPO, file), "utf8");
      const m = txt.match(/^\s*(?:ZJ_)?GHL_PIT\s*=\s*(\S+)\s*$/m);
      if (m) return m[1];
    } catch {
      /* el archivo es opcional */
    }
  }
  return null;
}

// ---------- datos ----------
const slugify = (s) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

function loadJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(REPO, rel), "utf8"));
}

const { municipios } = loadJson("tools/ghl/municipios.json");
const contract = loadJson("tools/qa/custom-values.json");
const brand = contract.brand;
const townAccents = Object.fromEntries(
  Object.entries(contract.town_accents || {}).filter(([k]) => !k.startsWith("_")),
);

// El nombre con acentos lo publica custom-values.json (town_accents) para los
// slugs que el title-case rompería: si municipios.json se desvía, es una errata
// y el alta saldría con el pueblo mal escrito en 78 titles.
const nombres = municipios.map((m) => m.municipio);
for (const [slug, nombre] of Object.entries(townAccents)) {
  if (!nombres.includes(nombre)) {
    console.error(
      `municipios.json no contiene "${nombre}" (town_accents["${slug}"]); corrige la lista antes de crear nada.`,
    );
    process.exit(2);
  }
}

const entries = municipios.map(({ municipio, zip }) => {
  const slug = slugify(municipio);
  return {
    municipio,
    zip,
    slug,
    subdominio: `${slug}.ilatekpr.com`,
    countyValue: `${municipio}, Puerto Rico`,
  };
});

// ---------- api ----------
async function api(pathname, { method = "GET", body, token, retries = 3 } = {}) {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(`${BASE}${pathname}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Version: API_VERSION,
        Accept: "application/json",
        ...(SOURCE ? { source: SOURCE } : {}),
        ...(CHANNEL ? { channel: CHANNEL } : {}),
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (res.status === 429 && attempt < retries) {
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      continue;
    }
    const text = await res.text();
    let json = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      /* respuesta no JSON */
    }
    return { ok: res.ok, status: res.status, json, text };
  }
}

// La agencia tiene 20.9k subcuentas: paginar para buscar una es inviable, así
// que se pregunta por el nombre exacto y se compara el resultado.
async function buscarLocation(nombre, token) {
  const r = await api(
    `/locations/search?companyId=${encodeURIComponent(companyId)}&query=${encodeURIComponent(nombre)}&limit=20`,
    { token },
  );
  if (!r.ok) throw new Error(`GET /locations/search ${r.status}: ${r.text.slice(0, 160)}`);
  const lista = r.json?.locations ?? [];
  if (process.env.GHL_DEBUG) {
    console.log(`      debug search "${nombre}": ${lista.length} resultados · ${lista.map((l) => JSON.stringify(l.name)).join(", ")}`);
  }
  const iguales = lista.filter(
    (l) => l.name?.trim().toLowerCase() === nombre.trim().toLowerCase(),
  );
  // El search devuelve `_id` (no `id`): leer el campo equivocado hacía que el
  // script creyera que no existía ninguna y duplicara la subcuenta.
  const hit = iguales[0];
  return { id: hit?._id ?? hit?.id ?? null, duplicados: iguales.length };
}

// GET /snapshots/ devuelve [{id,name,type}] de los snapshots propios e
// importados de la agencia. La API de creación solo acepta el id, así que el
// nombre del modal ("Ilatek") se resuelve aquí, una vez, antes de crear nada.
// Devuelve false en vez de process.exit(): salir con un exit() mientras hay un
// fetch pendiente aborta el proceso con aserción de libuv (exit 127) en vez de
// con el código real, y el llamador necesita distinguir "falló" de "listo".
async function resolverSnapshot(token) {
  if (snapshotId || !snapshotName) return true;
  const r = await api(`/snapshots/?companyId=${encodeURIComponent(companyId)}`, { token });
  if (!r.ok) {
    console.error(
      `No pude listar snapshots (HTTP ${r.status}: ${r.text.slice(0, 160)}).\n` +
        "Hace falta el scope snapshots.readonly; como alternativa pasa el id con --snapshot.",
    );
    return false;
  }
  const lista = r.json?.snapshots ?? [];
  const hit = lista.find(
    (s) => s.name?.trim().toLowerCase() === snapshotName.trim().toLowerCase(),
  );
  if (!hit) {
    console.error(
      `No hay snapshot llamado "${snapshotName}". Disponibles: ${lista
        .map((s) => `${s.name} (${s.type})`)
        .join(" · ") || "(ninguno)"}`,
    );
    return false;
  }
  snapshotId = hit.id;
  console.log(`snapshot: ${hit.name} · ${hit.type} · ${hit.id}`);
  return true;
}

// SaaS/cliente: el alta manual quedó con l_type=saas. La API lo separa del alta,
// y V2 necesita el contactId de la subcuenta de pagos de la agencia.
async function habilitarSaas(locationId, token) {
  const body = {
    companyId,
    isSaaSV2: true,
    ...(contactId ? { contactId } : {}),
    ...(providerLocationId ? { providerLocationId } : {}),
    ...(saasPlanId ? { saasPlanId } : {}),
    ...(priceId ? { priceId } : {}),
  };
  const r = await api(`/saas/enable-saas/${locationId}`, { method: "POST", body, token });
  return { ok: r.ok, status: r.status, detalle: r.ok ? null : r.text.slice(0, 200) };
}

// El nombre visible de la location es el del alta manual: "Ilatek - <Municipio>".
// Se usa tal cual para reconocer las que ya existen y no duplicarlas.
const nombreLocation = (municipio) => `Ilatek - ${municipio}`;

function payloadFor(e) {
  return {
    name: nombreLocation(e.municipio),
    companyId,
    phone,
    address: e.municipio,
    city: e.municipio,
    state: STATE,
    country: COUNTRY,
    postalCode: e.zip,
    website: `https://${e.subdominio}`,
    timezone: TIMEZONE,
    ...(snapshotId ? { snapshotId } : {}),
    prospectInfo: {
      firstName: CUENTA_FIRST_NAME,
      lastName: CUENTA_LAST_NAME,
      email,
    },
  };
}

// Los custom values que se escriben: los 7 slots del puente + el dominio del
// pueblo + los cuatro del snapshot que sí tienen valor conocido (Website -
// State, Website - Region, favicon y Precio Total). Los otros dos del snapshot
// (Business ID y Access Token) se quedan vacíos: no hay fuente legítima, ver
// valoresFor().
const FAVICON =
  "https://assets.cdn.filesafe.space/8OxUENFVM60EKzqsTcoD/media/6aa1c05dd953a0128b5348c2.jpg";

// Snippet tal cual lo tiene la subcuenta de referencia, con el píxel de marca del
// contrato (custom-values.json → brand.pixel_id).
const pixelSnippet = (id) =>
  `<!-- Meta Pixel Code --> <script> !function(f,b,e,v,n,t,s) {if(f.fbq)return;n=f.fbq=function(){n.callMethod? n.callMethod.apply(n,arguments):n.queue.push(arguments)}; if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0'; n.queue=[];t=b.createElement(e);t.async=!0; t.src=v;s=b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t,s)}(window, document,'script', 'https://connect.facebook.net/en_US/fbevents.js'); fbq('init', '${id}'); fbq('track', 'PageView'); </script> <noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1" /></noscript> <!-- End Meta Pixel Code -->`;

// La API identifica cada custom value por su NOMBRE VISIBLE ("Business - County
// Name"); la clave `business__county_name` la deriva GHL del nombre. Mandar la
// clave como nombre crea un valor nuevo y deja el del snapshot vacío.
function valoresFor(e) {
  return [
    { name: "Business - County Name", key: "business__county_name", value: e.countyValue },
    { name: "Business - County Domain", key: "business__county_domain", value: e.subdominio },
    { name: "Business - Email", key: "business__email", value: brand.business__email },
    {
      name: "Business - Phone",
      key: "business__phone",
      value: phone.replace(/^\+1/, "").replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3"),
    },
    { name: "Website Url", key: "website_url", value: BRAND_WEBSITE },
    { name: "Facebook Url", key: "facebook_url", value: brand.facebook_url },
    { name: "Instagram Url", key: "instagram_url", value: brand.instagram_url },
    // Los cuatro que el snapshot también deja vacíos pero con valor conocido.
    { name: "County Name And State", key: "county_name_and_state", value: e.countyValue },
    { name: "Website Favicon", key: "website_favicon", value: FAVICON },
    { name: "Pixel ID", key: "pixel_id", value: pixelSnippet(brand.pixel_id) },
    { name: "Precio Total", key: "precio_total", value: "{{opportunity.valor_oportunidad}}" },
    { name: "Website - Region", key: "website__region", value: REGION },
    { name: "Website - State", key: "website__state", value: STATE },
    // Business ID y Access Token NO se escriben: el primero no existe en la
    // agencia (`GET /businesses/?locationId=` devuelve lista vacía, así que
    // cualquier id sería inventado) y el segundo es una credencial OAuth de
    // Facebook que no se puede fabricar. Vacíos es el estado correcto, igual
    // que en la subcuenta de referencia del owner.
  ];
}

// El snapshot trae los 15 NOMBRES de custom values pero con el valor vacío. Si
// se hace POST a secas se duplican, así que primero se leen los existentes y se
// actualiza por id (PUT); solo se crea el que falte.
async function leerValores(locationId, token) {
  const r = await api(`/locations/${locationId}/customValues`, { token });
  if (!r.ok) throw new Error(`GET customValues ${r.status}: ${r.text.slice(0, 160)}`);
  return r.json?.customValues ?? [];
}

// Recién creada la location, el snapshot sigue importando: los 15 custom values
// aparecen vacíos unos segundos después. Escribir antes crea duplicados, así que
// se espera a que estén todos los que vamos a rellenar.
async function esperarValores(locationId, esperados, token) {
  const nombres = new Set(esperados.map((v) => v.name.toLowerCase()));
  let lista = [];
  for (let intento = 0; intento < 30; intento++) {
    lista = await leerValores(locationId, token);
    const tiene = new Set(lista.map((c) => (c.name ?? "").trim().toLowerCase()));
    if ([...nombres].every((n) => tiene.has(n))) return lista;
    if (intento === 0) console.log("      esperando a que el snapshot cree los custom values…");
    await new Promise((r) => setTimeout(r, 10000));
  }
  return lista;
}

async function escribirValores(locationId, e, token) {
  const esperados = valoresFor(e);
  const lista = await esperarValores(locationId, esperados, token);
  const porNombre = new Map(
    lista.map((c) => [(c.name ?? "").trim().toLowerCase(), c]),
  );

  const out = [];
  for (const cv of esperados) {
    const hit = porNombre.get(cv.name.toLowerCase());
    const r = hit
      ? await api(`/locations/${locationId}/customValues/${hit.id}`, {
          method: "PUT",
          body: { name: cv.name, value: cv.value, ...(hit.parentId ? { parentId: hit.parentId } : {}) },
          token,
        })
      : await api(`/locations/${locationId}/customValues`, { method: "POST", body: cv, token });
    out.push({ ...cv, accion: hit ? "actualizado" : "creado", ok: r.ok, status: r.status });
  }
  return out;
}

// ---------- selección ----------
function seleccion() {
  let list = entries;
  if (only.length) list = list.filter((e) => only.includes(e.slug));
  if (from) {
    const i = list.findIndex((e) => e.municipio.localeCompare(from, "es", { sensitivity: "base" }) >= 0);
    if (i >= 0) list = list.slice(i);
  }
  if (to) {
    const i = list.findIndex((e) => e.municipio.localeCompare(to, "es", { sensitivity: "base" }) > 0);
    if (i >= 0) list = list.slice(0, i);
  }
  return list.slice(0, Number.isFinite(limit) ? limit : list.length);
}

// ---------- main ----------
const token = loadToken();
const chosen = seleccion();

console.log(
  `municipios en la lista: ${entries.length} · seleccionados: ${chosen.length} · modo: ${
    crear ? "CREAR" : soloValores ? "VALORES" : soloEstado ? "ESTADO" : "dry-run"
  }`,
);
if (crear && !companyId) {
  console.error("Falta GHL_COMPANY_ID (o --company). Sin companyId la API no crea locations.");
  process.exit(2);
}
if ((crear || soloValores || soloEstado) && !token) {
  console.error(
    "Falta el token: exporta GHL_PIT=... o crea tmp-ghl-pit.txt con `GHL_PIT=pit-...` (está en .gitignore).",
  );
  process.exit(3);
}
// isSaaSV2 exige contactId: sin él la habilitación fallaría location por
// location, así que mejor abortar antes de crear la primera.
if (crear && saas && !contactId) {
  console.error(
    "--saas usa SaaS V2 y la API exige --contact-id (la subcuenta de pagos de la agencia).\n" +
      "Cópialo de la URL de esa subcuenta en GHL, o corre sin --saas para crearlas como\n" +
      "subcuentas de agencia (con snapshot, sin rebilling) y habilita SaaS después.",
  );
  process.exit(6);
}

for (const e of chosen) {
  console.log(
    `${e.municipio.padEnd(16)} ${e.slug.padEnd(16)} ${e.zip}  ${e.subdominio}`,
  );
}
if (!crear && !soloValores && !soloEstado) {
  console.log(
    `\nsnapshot: ${snapshotId ? `<id ${snapshotId}>` : `"${snapshotName}" (se resuelve a su id al crear)`}` +
      ` · tipo de cuenta: ${saas ? "SaaS/cliente" : "subcuenta de agencia (sin --saas)"}`,
  );
  console.log("\npayload del primero (los demás solo cambian municipio/slug/zip):");
  console.log(JSON.stringify(payloadFor(chosen[0]), null, 2));
  console.log("\ncustom values que se escribirían:");
  for (const cv of valoresFor(chosen[0])) console.log(`  ${cv.name} = ${cv.value}`);
  console.log("\nNada escrito. Para el piloto: --crear (una sola location por defecto).");
  process.exit(0);
}

// Todo el trabajo real vive en una función para poder devolver un código de
// salida y dejar que Node cierre los sockets de undici por su cuenta.
async function ejecutar() {
  // El snapshot solo hace falta al crear; en --valores/--estado ni se consulta.
  if (crear && !(await resolverSnapshot(token))) return 4;

  if (soloEstado) {
    const filas = [];
    for (const e of chosen) {
      const b = await buscarLocation(nombreLocation(e.municipio), token);
      filas.push({ ...e, locationId: b.id, duplicados: b.duplicados });
      console.log(
        `${b.id ? "EXISTE" : "FALTA "} ${e.municipio.padEnd(16)} ${b.duplicados > 1 ? b.duplicados + " copias" : ""}`,
      );
    }
    const faltan = filas.filter((f) => !f.locationId).length;
    console.log(`\nexisten ${filas.length - faltan} · faltan ${faltan} · de ${filas.length}`);
    fs.mkdirSync(path.join(REPO, "shots"), { recursive: true });
    fs.writeFileSync(
      path.join(REPO, "shots", "ghl-estado.json"),
      JSON.stringify(filas, null, 1),
    );
    return 0;
  }

  const report = [];

  for (const e of chosen) {
    const nombre = nombreLocation(e.municipio);
    const busq = await buscarLocation(nombre, token);
    let locationId = busq.id;
    let estado = locationId ? "ya existía" : "sin crear";
    if (busq.duplicados > 1) {
      estado += ` (${busq.duplicados} con ese nombre)`;
      console.log(`AVISO ${nombre} · hay ${busq.duplicados} subcuentas con ese nombre`);
    }

    if (!locationId && !soloValores) {
      const r = await api("/locations/", { method: "POST", body: payloadFor(e), token });
      if (!r.ok) {
        console.log(`ERROR ${nombre} · HTTP ${r.status} · ${r.text.slice(0, 200)}`);
        report.push({ ...e, estado: `error ${r.status}`, detalle: r.text.slice(0, 200) });
        continue;
      }
      locationId = r.json?.location?.id ?? r.json?.id ?? null;
      estado = "creada";
      console.log(`OK    ${nombre} · location ${locationId}`);

      if (saas) {
        const s = await habilitarSaas(locationId, token);
        console.log(
          `      saas: ${s.ok ? "habilitado" : `FALLÓ HTTP ${s.status} · ${s.detalle}`}`,
        );
        if (!s.ok) estado = `creada · saas error ${s.status}`;
      } else {
        console.log("      saas: omitido (sin --saas: queda como subcuenta de agencia)");
      }
    } else {
      console.log(`SKIP  ${nombre} · ${estado}${locationId ? ` (${locationId})` : ""}`);
    }

    let valores = [];
    if (locationId && syncValores) {
      valores = await escribirValores(locationId, e, token);
      const fallidos = valores.filter((v) => !v.ok);
      console.log(
        `      valores: ${valores.length - fallidos.length}/${valores.length}` +
          (fallidos.length ? ` · fallan: ${fallidos.map((f) => f.name).join(", ")}` : ""),
      );
    }
    report.push({ ...e, locationId, estado, valores });
  }

  fs.mkdirSync(path.join(REPO, "shots"), { recursive: true });
  const out = path.join(REPO, "shots", `ghl-subcuentas-${crear ? "creadas" : "valores"}.json`);
  fs.writeFileSync(out, JSON.stringify(report, null, 1));
  console.log(`\nreporte: ${path.relative(REPO, out)}`);
  return 0;
}

try {
  process.exitCode = await ejecutar();
} catch (err) {
  console.error(`ERROR: ${err.message}`);
  process.exitCode = 5;
}
