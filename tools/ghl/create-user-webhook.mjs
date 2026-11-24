#!/usr/bin/env node
/**
 * Ilatek · alta de usuarios de GHL desde un workflow (Form Submitted → Webhook).
 *
 * GHL no tiene acción nativa "Create User": el builder solo trabaja sobre
 * contactos. Este endpoint hace de puente: recibe el POST del action Webhook y
 * llama a `POST /users/` con token de agencia, que es la única vía real para
 * crear un usuario de subcuenta.
 *
 *   Form Submitted ──► Webhook (POST) ──► este endpoint ──► POST /users/
 *
 * Uso:
 *   GHL_PIT=pit-… GHL_COMPANY_ID=… GHL_WEBHOOK_SECRET=… \
 *     node tools/ghl/create-user-webhook.mjs
 *
 * Entorno:
 *   GHL_PIT | ZJ_GHL_PIT   token con scope `users.write` A NIVEL AGENCIA
 *                          (también se lee `tmp-ghl-pit.txt` en la raíz del repo,
 *                          ignorado por git; nunca se imprime ni se escribe)
 *   GHL_COMPANY_ID         id de la agencia; obligatorio en modo real
 *   GHL_WEBHOOK_SECRET     secreto compartido del workflow; obligatorio
 *   GHL_LOCATION_ID        subcuenta destino (def. 8OxUENFVM60EKzqsTcoD = Ilatek - PR)
 *   GHL_DEFAULT_ROLE       `user` | `admin` (def. user)
 *   GHL_DEFAULT_TYPE       `account` | `agency` (def. account)
 *   GHL_DEFAULT_SCOPES     csv; VACÍO = no se manda `scopes` (ver aviso abajo)
 *   GHL_ADMIN_CALENDARS_JSON  sobrescribe el mapa de admins (JSON, ver abajo)
 *   GHL_LINK_CALENDARS=0   no enlaza calendarios (por defecto sí enlaza)
 *   GHL_ALLOW_ROLE_OVERRIDE=1  permite un rol distinto de `user` en el payload
 *   GHL_FIELD_DISPONIBILIDAD / GHL_FIELD_EMERGENCIA / GHL_FIELD_COBERTURA
 *                          fieldKey del contacto donde guardar horarios,
 *                          emergencia y municipios; vacío = no se escribe nada
 *   GHL_MEDIA_VERSION      versión para /medias/upload-file (def. v3)
 *   GHL_REQUIRED_TAG       etiqueta que el contacto debe tener para que se cree
 *                          el usuario (def. `team`; vacío = no se exige)
 *   GHL_ELIGIBILITY_PATH   ruta pública de consulta de elegibilidad
 *                          (def. /ghl/eligibility)
 *   DRY_RUN=1              valida y devuelve el payload sin llamar a GHL
 *   PORT / HOST            def. 8788 / 127.0.0.1
 *   GHL_BASE_URL           def. https://services.leadconnectorhq.com
 *   GHL_API_VERSION        def. 2021-07-28 (v3 para /users/ también responde)
 *   GHL_CREATE_USER_PATH   def. /ghl/create-user
 *
 * ⚠️ `scopes`: la API interpreta `[]` como "todos los permisos apagados", no
 * como "los de por defecto". Si GHL_DEFAULT_SCOPES está vacío el campo se omite
 * y GHL aplica su default; nunca se manda un array vacío.
 *
 * Contrato de `POST /users/` (obligatorios): companyId, email, password, type,
 * role, locationIds. La contraseña es obligatoria y debe cumplir 12+ caracteres,
 * mayúscula, minúscula, número y símbolo: aquí se genera una temporal si el
 * formulario no trae una. NO hay invitación por correo, así que la respuesta
 * incluye `temporaryPassword` para que el workflow la entregue por su canal.
 *
 * Códigos: 201 creado · 200 repetido (dedupe) · 400 payload · 401 secreto ·
 * 405 método · 409 el usuario ya existe en GHL · 413 cuerpo grande ·
 * 422 GHL rechaza los datos · 429 límite de la API · 502 token/scope o error
 * de GHL · 504 GHL no responde · 503 endpoint mal configurado.
 *
 * El endpoint nunca registra la contraseña ni el token; el email se registra
 * enmascarado.
 */
import { createServer } from "node:http";
import { randomInt, timingSafeEqual } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));

// ---------- configuración ----------
const PORT = Number(process.env.PORT || 8788);
const HOST = process.env.HOST || "127.0.0.1";
const BASE = (process.env.GHL_BASE_URL || "https://services.leadconnectorhq.com").replace(/\/+$/, "");
const API_VERSION = process.env.GHL_API_VERSION || "2021-07-28";
// La librería de medios solo responde con Version: v3.
const MEDIA_VERSION = process.env.GHL_MEDIA_VERSION || "v3";
const ROUTE = process.env.GHL_CREATE_USER_PATH || "/ghl/create-user";
const LOCATION_ID = process.env.GHL_LOCATION_ID || "8OxUENFVM60EKzqsTcoD";
const COMPANY_ID = process.env.GHL_COMPANY_ID || "";
const SECRET = process.env.GHL_WEBHOOK_SECRET || "";
const DEFAULT_ROLE = process.env.GHL_DEFAULT_ROLE || "user";
const DEFAULT_TYPE = process.env.GHL_DEFAULT_TYPE || "account";
const DEFAULT_SCOPES = (process.env.GHL_DEFAULT_SCOPES || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
// El formulario siempre crea `user`; solo un override explícito permite `admin`.
const ALLOW_ROLE_OVERRIDE = /^(1|true|si|sí|yes)$/i.test(process.env.GHL_ALLOW_ROLE_OVERRIDE || "");
const LINK_CALENDARS = !/^(0|false|no)$/i.test(process.env.GHL_LINK_CALENDARS || "1");
// Vacío = no se escribe en el contacto (crear custom fields exige aprobación).
const FIELD_DISPONIBILIDAD = process.env.GHL_FIELD_DISPONIBILIDAD || "";
const FIELD_EMERGENCIA = process.env.GHL_FIELD_EMERGENCIA || "";
const FIELD_COBERTURA = process.env.GHL_FIELD_COBERTURA || "";
// Puerta de entrada: el contacto debe existir en la subcuenta y traer esta
// etiqueta. Es la única verificación que no se puede saltar desde el navegador.
const REQUIRED_TAG = (process.env.GHL_REQUIRED_TAG ?? "team").trim().toLowerCase();
const ELIGIBILITY_ROUTE = process.env.GHL_ELIGIBILITY_PATH || "/ghl/eligibility";
// Admins de Ilatek - PR y los calendarios a los que cada uno tiene acceso.
// Ids leídos de GET /users/ y GET /calendars/ de la subcuenta
// 8OxUENFVM60EKzqsTcoD el 2026-11-16: Aida está en los dos de limpieza y Luis
// solo en el de techos. Si mañana cambia el reparto, se corrige aquí o con
// GHL_ADMIN_CALENDARS_JSON sin tocar el formulario.
const ADMINS = {
  luis: { userId: "lrgREN7IQe6y2iRW4Epe", name: "Luis Cardec", calendars: ["wM8KQhsYjEQAo0HbNGIh"] },
  aida: {
    userId: "BXfQdgMBK0OJCXSbWxcj",
    name: "Aida Cintron",
    calendars: ["i5HZobZjuSZcDl43qgOG", "vMU898LXrUCkSROqGuLv"],
  },
};
if (process.env.GHL_ADMIN_CALENDARS_JSON) {
  try {
    const override = JSON.parse(process.env.GHL_ADMIN_CALENDARS_JSON);
    for (const [key, value] of Object.entries(override)) {
      ADMINS[key] = { ...(ADMINS[key] || {}), ...value };
    }
  } catch {
    console.warn("aviso: GHL_ADMIN_CALENDARS_JSON no es JSON válido; se usa el mapa por defecto.");
  }
}
const DRY_RUN = /^(1|true|si|sí|yes)$/i.test(process.env.DRY_RUN || "");
// La foto de perfil viaja en base64 dentro del payload: 4 MB por defecto.
const MAX_BODY = Number(process.env.MAX_BODY_BYTES || 4 * 1024 * 1024);
const TIMEOUT_MS = Number(process.env.GHL_TIMEOUT_MS || 15000);
const DEDUPE_MS = Number(process.env.DEDUPE_MS || 10 * 60 * 1000);
const PASSWORD_LEN = 16;

// Secreto compartido del workflow, nunca en logs.
function readToken() {
  const fromEnv = process.env.GHL_PIT || process.env.ZJ_GHL_PIT;
  if (fromEnv) return fromEnv.trim();
  for (const rel of ["../../../tmp-ghl-pit.txt", "../../tmp-ghl-pit.txt"]) {
    const file = path.resolve(HERE, rel);
    try {
      const line = fs.readFileSync(file, "utf8").match(/^\s*GHL_PIT\s*=\s*(\S+)\s*$/m);
      if (line) return line[1];
    } catch {
      /* no está: se sigue buscando */
    }
  }
  return "";
}
const TOKEN = readToken();

// ---------- contraseña temporal ----------
// Sin caracteres ambiguos (0/O, 1/l/I): la contraseña se lee y se teclea a mano.
const SETS = ["ABCDEFGHJKLMNPQRSTUVWXYZ", "abcdefghijkmnopqrstuvwxyz", "23456789", "!@#$%&*?-"];
function tempPassword(len = PASSWORD_LEN) {
  const all = SETS.join("");
  const chars = SETS.map((set) => set[randomInt(set.length)]);
  while (chars.length < len) chars.push(all[randomInt(all.length)]);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

// Política real de GHL: se valida también la que venga en el formulario.
function passwordProblems(pw) {
  const out = [];
  if (pw.length < 12) out.push("mínimo 12 caracteres");
  if (!/[A-Z]/.test(pw)) out.push("una mayúscula");
  if (!/[a-z]/.test(pw)) out.push("una minúscula");
  if (!/[0-9]/.test(pw)) out.push("un número");
  if (!/[^A-Za-z0-9]/.test(pw)) out.push("un símbolo");
  return out;
}

// ---------- utilidades HTTP ----------
class HttpError extends Error {
  constructor(status, code, message, headers = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.headers = headers;
  }
}

function send(res, status, body, headers = {}) {
  const raw = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(raw),
    "cache-control": "no-store",
    ...headers,
  });
  res.end(raw);
}

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY) throw new HttpError(413, "BODY_TOO_LARGE", `El cuerpo supera ${MAX_BODY} bytes`);
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

function assertAuth(req, url) {
  const header = req.headers["x-ilatek-token"];
  const bearer = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  const given = String(header || bearer || url.searchParams.get("token") || "").trim();
  const a = Buffer.from(given);
  const b = Buffer.from(SECRET);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new HttpError(401, "UNAUTHORIZED", "Falta el token del workflow o no coincide (cabecera x-ilatek-token).");
  }
}

const mask = (email) => {
  const [local, domain] = String(email).split("@");
  if (!domain) return "***";
  return `${local.slice(0, 1)}***@${domain}`;
};

function log(event, data = {}) {
  console.log(JSON.stringify({ t: new Date().toISOString(), event, ...data }));
}

// ---------- normalización del payload del workflow ----------
// El action Webhook manda lo que mapees; según la configuración llega plano,
// dentro de `contact` o dentro de `customData`. Se aceptan las tres formas.
function firstOf(objects, keys) {
  for (const obj of objects) {
    if (!obj || typeof obj !== "object") continue;
    for (const key of keys) {
      const value = obj[key];
      if (value !== undefined && value !== null && String(value).trim() !== "") return value;
    }
  }
  return undefined;
}

function toE164(phone) {
  const digits = String(phone).replace(/[^\d]/g, "");
  if (!digits) return "";
  if (digits.length === 10) return `+1${digits}`; // PR/US sin código de país
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return `+${digits}`;
}

function listOf(value) {
  if (value === undefined || value === null || value === "") return [];
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  return String(value).split(",").map((v) => v.trim()).filter(Boolean);
}

// El admin se resuelve por userId (el más específico), por clave (`luis`) o por
// nombre. Devuelve la entrada con su clave para poder trazarla en el log.
function findAdmin(key, userId) {
  const entries = Object.entries(ADMINS);
  if (userId) {
    const hit = entries.find(([, admin]) => admin.userId === userId);
    if (hit) return { key: hit[0], ...hit[1] };
  }
  if (!key) return null;
  const exact = entries.find(([name]) => name === key);
  if (exact) return { key: exact[0], ...exact[1] };
  const byName = entries.find(([, admin]) => String(admin.name || "").toLowerCase().includes(key));
  return byName ? { key: byName[0], ...byName[1] } : null;
}

// Horarios: acepta el array o el JSON del formulario y descarta filas incompletas.
function parseAvailability(raw) {
  let list = raw;
  if (typeof raw === "string") {
    try {
      list = JSON.parse(raw);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(list)) return [];
  const out = [];
  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const dia = String(item.dia ?? item.day ?? "").trim().toLowerCase();
    const desde = String(item.desde ?? item.start ?? "").trim();
    const hasta = String(item.hasta ?? item.end ?? "").trim();
    if (!dia || !desde || !hasta) continue;
    out.push({ dia, dia_label: String(item.dia_label || dia), desde, hasta });
  }
  return out;
}

function normalize(raw) {
  const contact = raw.contact && typeof raw.contact === "object" ? raw.contact : {};
  const custom = raw.customData && typeof raw.customData === "object" ? raw.customData : {};
  const sources = [raw, custom, contact];

  const email = String(
    firstOf(sources, ["email", "Email", "correo", "contact.email"]) ?? ""
  ).trim().toLowerCase();

  let firstName = String(firstOf(sources, ["firstName", "first_name", "nombre"]) ?? "").trim();
  let lastName = String(firstOf(sources, ["lastName", "last_name", "apellido"]) ?? "").trim();
  const fullName = String(firstOf(sources, ["full_name", "fullName", "name", "fullNameRaw"]) ?? "").trim();
  if (!firstName && fullName) {
    const parts = fullName.split(/\s+/);
    firstName = parts[0] || "";
    lastName = lastName || parts.slice(1).join(" ");
  }

  const role = (ALLOW_ROLE_OVERRIDE ? String(firstOf(sources, ["role", "rol"]) ?? DEFAULT_ROLE) : DEFAULT_ROLE)
    .trim()
    .toLowerCase();
  const type = String(firstOf(sources, ["type", "accountType"]) ?? DEFAULT_TYPE).trim().toLowerCase();
  const password = String(firstOf(sources, ["password", "tempPassword"]) ?? "");
  const phone = toE164(firstOf(sources, ["phone", "telefono", "teléfono"]) ?? "");

  const locationRaw = firstOf(sources, ["locationIds", "locationId"]);
  const locationIds = Array.isArray(locationRaw)
    ? locationRaw.map((v) => String(v).trim()).filter(Boolean)
    : locationRaw
      ? String(locationRaw).split(",").map((v) => v.trim()).filter(Boolean)
      : [LOCATION_ID];

  const scopeRaw = firstOf(sources, ["scopes"]);
  const scopes = Array.isArray(scopeRaw)
    ? scopeRaw.map((v) => String(v).trim()).filter(Boolean)
    : scopeRaw
      ? String(scopeRaw).split(",").map((v) => v.trim()).filter(Boolean)
      : DEFAULT_SCOPES.slice();

  const adminKey = String(firstOf(sources, ["admin", "con_quien", "admin_nombre"]) ?? "").trim().toLowerCase();
  const adminUserId = String(firstOf(sources, ["admin_user_id", "adminUserId"]) ?? "").trim();
  const adminEntry = findAdmin(adminKey, adminUserId);
  const payloadCalendars = listOf(firstOf(sources, ["admin_calendars", "calendar_ids"]));
  const calendars = payloadCalendars.length ? payloadCalendars : adminEntry ? adminEntry.calendars.slice() : [];

  const availability = parseAvailability(firstOf(sources, ["availability_json", "availability", "horarios"]));
  const availabilityText =
    String(firstOf(sources, ["availability_text"]) ?? "").trim() ||
    availability.map((slot) => `${slot.dia_label} ${slot.desde}-${slot.hasta}`).join(" | ");

  const emergencyRaw = firstOf(sources, ["emergency_same_day", "emergencia", "emergency"]);
  const emergencySameDay = /^(1|true|si|sí|yes)$/i.test(String(emergencyRaw ?? "").trim());
  const contactId = String(firstOf(sources, ["contact_id", "contactId"]) ?? "").trim();
  // Notas del submit: se guardan como nota del contacto (nativo, sin custom field).
  const notes = String(firstOf(sources, ["notes", "notas", "comments", "comentarios"]) ?? "").trim();

  const towns = listOf(firstOf(sources, ["towns", "municipios", "cobertura"]));
  const townsText = String(firstOf(sources, ["towns_text"]) ?? "").trim() || towns.join(", ");
  const coverageAllIsland = /^(1|true|si|sí|yes)$/i.test(
    String(firstOf(sources, ["coverage_all_island"]) ?? "").trim()
  );
  // Foto: dataURL del formulario (ya redimensionada en el navegador) o base64 puro.
  const photoRaw = String(firstOf(sources, ["photo_base64", "photo", "profilePhoto"]) ?? "").trim();

  return {
    email,
    firstName,
    lastName,
    phone,
    role,
    type,
    password,
    locationIds,
    scopes,
    admin: adminEntry,
    calendars,
    availability,
    availabilityText,
    emergencySameDay,
    contactId,
    notes,
    towns,
    townsText,
    coverageAllIsland,
    photoRaw,
  };
}

// ---------- llamada a GHL ----------
async function createUser(user) {
  const payload = {
    companyId: COMPANY_ID,
    email: user.email,
    password: user.password,
    type: user.type,
    role: user.role,
    locationIds: user.locationIds,
  };
  if (user.firstName) payload.firstName = user.firstName;
  if (user.lastName) payload.lastName = user.lastName;
  if (user.phone) payload.phone = user.phone;
  // Nunca `scopes: []`: la API lo lee como "todo apagado".
  if (user.scopes.length) payload.scopes = user.scopes;
  // La foto va como URL: se sube antes a la librería de medios de GHL.
  if (user.photoUrl) payload.profilePhoto = user.photoUrl;

  let res;
  try {
    res = await fetch(`${BASE}/users/`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${TOKEN}`,
        version: API_VERSION,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    const timeout = err?.name === "TimeoutError" || err?.name === "AbortError";
    throw new HttpError(
      504,
      timeout ? "GHL_TIMEOUT" : "GHL_UNREACHABLE",
      timeout ? `GHL no respondió en ${TIMEOUT_MS} ms` : `No se pudo conectar con GHL: ${err?.message || err}`
    );
  }

  const text = await res.text();
  let body = {};
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { message: text.slice(0, 300) };
  }

  if (res.ok) {
    const id = body?.user?.id || body?.id || body?.userId || body?.user?._id || "";
    return { id: String(id), status: res.status, payload };
  }

  const message = String(body?.message || body?.msg || body?.error || text.slice(0, 300) || "sin detalle");
  if (/exist|duplicate|already|registrad/i.test(message)) {
    throw new HttpError(409, "USER_EXISTS", `GHL ya tiene un usuario con ${user.email}: ${message}`);
  }
  if (res.status === 400 || res.status === 422) {
    throw new HttpError(422, "GHL_INVALID", `GHL rechazó los datos (${res.status}): ${message}`);
  }
  if (res.status === 401 || res.status === 403) {
    throw new HttpError(
      502,
      "GHL_AUTH",
      `GHL rechazó el token o falta el scope users.write a nivel agencia (${res.status}): ${message}`
    );
  }
  if (res.status === 429) {
    throw new HttpError(429, "GHL_RATE_LIMIT", `Límite de la API de GHL: ${message}`, {
      "retry-after": res.headers.get("retry-after") || "5",
    });
  }
  throw new HttpError(502, "GHL_ERROR", `Error de GHL (${res.status}): ${message}`);
}

// ---------- llamadas auxiliares a GHL ----------
async function ghlJson(pathname, init = {}) {
  const res = await fetch(`${BASE}${pathname}`, {
    ...init,
    headers: {
      authorization: `Bearer ${TOKEN}`,
      version: API_VERSION,
      "content-type": "application/json",
      accept: "application/json",
      ...(init.headers || {}),
    },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const text = await res.text();
  let body = {};
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { message: text.slice(0, 300) };
  }
  return { ok: res.ok, status: res.status, body };
}

// dataURL/base64 → buffer para el multipart de /medias/upload-file.
function decodePhoto(raw) {
  const match = /^data:(image\/(?:png|jpeg|jpg|webp));base64,(.+)$/i.exec(raw);
  const mime = (match ? match[1] : "image/jpeg").toLowerCase();
  const base64 = match ? match[2] : raw;
  let buffer;
  try {
    buffer = Buffer.from(base64, "base64");
  } catch {
    return null;
  }
  if (!buffer || !buffer.length) return null;
  const ext = mime.includes("png") ? "png" : mime.includes("webp") ? "webp" : "jpg";
  return { mime, buffer, filename: `ilatek-user-${Date.now()}.${ext}` };
}

// Sube la foto a la librería de medios y devuelve la URL que pide `profilePhoto`.
async function uploadPhoto(photo) {
  const form = new FormData();
  form.append("file", new Blob([photo.buffer], { type: photo.mime }), photo.filename);
  form.append("name", photo.filename);
  let res;
  try {
    res = await fetch(`${BASE}/medias/upload-file`, {
      method: "POST",
      // Ojo: sin content-type manual, fetch pone el boundary del multipart.
      headers: { authorization: `Bearer ${TOKEN}`, version: MEDIA_VERSION, accept: "application/json" },
      body: form,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    return { ok: false, status: 0, message: err?.message || String(err) };
  }
  const text = await res.text();
  let body = {};
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { message: text.slice(0, 200) };
  }
  if (!res.ok) return { ok: false, status: res.status, message: String(body?.message || "") };
  const url = String(body?.url || body?.fileUrl || body?.file?.url || "");
  return url ? { ok: true, status: res.status, url } : { ok: false, status: res.status, message: "GHL no devolvió la URL del archivo" };
}

// ---------- contacto: buscar, crear y validar la etiqueta ----------
function normalizeContact(raw) {
  if (!raw || !raw.id) return null;
  return {
    id: String(raw.id),
    email: String(raw.email || "").toLowerCase(),
    tags: (Array.isArray(raw.tags) ? raw.tags : []).map((t) => String(t).trim().toLowerCase()),
  };
}

// Solo lectura: el contacto que corresponde a este submit, o null.
async function findContact(user) {
  if (user.contactId) {
    const byId = await ghlJson(`/contacts/${encodeURIComponent(user.contactId)}`);
    return byId.ok ? normalizeContact(byId.body?.contact || byId.body) : null;
  }
  const search = await ghlJson(
    `/contacts/?locationId=${encodeURIComponent(user.locationIds[0])}&query=${encodeURIComponent(user.email)}`
  );
  if (!search.ok) return null;
  const hit = (search.body?.contacts || []).find(
    (c) => String(c?.email || "").toLowerCase() === user.email
  );
  return normalizeContact(hit);
}

async function createContact(user) {
  const created = await ghlJson(`/contacts/`, {
    method: "POST",
    body: JSON.stringify({
      locationId: user.locationIds[0],
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      email: user.email,
      phone: user.phone || undefined,
      source: "Alta de usuario ILATEK",
    }),
  });
  if (!created.ok) {
    return { ok: false, message: String(created.body?.message || `HTTP ${created.status}`) };
  }
  const id = String(created.body?.contact?.id || created.body?.id || "");
  return id ? { ok: true, id } : { ok: false, message: "GHL no devolvió el id del contacto" };
}

// Sin la etiqueta no se crea el usuario. Devuelve null si pasa.
function tagGate(contact) {
  if (!REQUIRED_TAG) return null;
  if (!contact) {
    return {
      code: "NO_TEAM_CONTACT",
      message:
        "Ese correo no está registrado como contacto en la subcuenta. Si recibiste el formulario, avisa a tu líder para que te agregue al equipo.",
    };
  }
  if (!contact.tags.includes(REQUIRED_TAG)) {
    return {
      code: "NO_TEAM_TAG",
      message: `Al contacto le falta la etiqueta "${REQUIRED_TAG}". Solo el equipo entrevistado puede crear su acceso.`,
    };
  }
  return null;
}

// Notas del formulario → nota del contacto. Usa el endpoint nativo de notas,
// así no hace falta ningún campo custom aprobado por el owner.
async function createContactNote(contactId, notes, userId) {
  const body = { body: notes };
  if (userId) body.userId = userId;
  const res = await ghlJson(`/contacts/${contactId}/notes`, { method: "POST", body: JSON.stringify(body) });
  return {
    ok: res.ok,
    status: res.status,
    noteId: res.ok ? String(res.body?.note?.id || res.body?.id || "") || null : null,
    message: res.ok ? null : String(res.body?.message || `HTTP ${res.status}`),
  };
}

// Enlaza el usuario nuevo a los calendarios del admin elegido. Lee el calendario
// y hace merge con sus teamMembers: no reescribe el resto de la configuración y
// no duplica a quien ya estaba. Un fallo aquí NO tumba el alta (el usuario ya
// existe); se devuelve por calendario en `calendarLinks`.
async function linkCalendars(userId, calendarIds) {
  const results = [];
  for (const calendarId of calendarIds) {
    try {
      const current = await ghlJson(`/calendars/${calendarId}`);
      if (!current.ok) {
        results.push({ calendarId, ok: false, code: "CALENDAR_READ", message: String(current.body?.message || current.status) });
        continue;
      }
      const calendar = current.body?.calendar || current.body || {};
      const members = Array.isArray(calendar.teamMembers) ? calendar.teamMembers.slice() : [];
      if (members.some((member) => member && member.userId === userId)) {
        results.push({ calendarId, ok: true, alreadyLinked: true });
        continue;
      }
      members.push({ userId, priority: 0.5, selected: true });
      const updated = await ghlJson(`/calendars/${calendarId}`, {
        method: "PUT",
        body: JSON.stringify({ calendarId, teamMembers: members }),
      });
      results.push(
        updated.ok
          ? { calendarId, ok: true, added: true }
          : { calendarId, ok: false, code: "CALENDAR_UPDATE", message: String(updated.body?.message || updated.status) }
      );
    } catch (err) {
      results.push({ calendarId, ok: false, code: "CALENDAR_ERROR", message: err?.message || String(err) });
    }
  }
  return results;
}

// Horarios y emergencia en el contacto: solo si hay fieldKey configurado y el
// workflow mandó contactId. Sin eso no se toca ningún campo (no se inventan
// custom fields; AGENTS.md exige aprobación para crearlos).
async function writeContactFields(contactId, user) {
  const customFields = [];
  if (FIELD_DISPONIBILIDAD) customFields.push({ id: FIELD_DISPONIBILIDAD, value: user.availabilityText });
  if (FIELD_EMERGENCIA) customFields.push({ id: FIELD_EMERGENCIA, value: user.emergencySameDay ? "Sí" : "No" });
  if (FIELD_COBERTURA) customFields.push({ id: FIELD_COBERTURA, value: user.townsText });
  if (!customFields.length) return null;
  const res = await ghlJson(`/contacts/${contactId}`, { method: "PUT", body: JSON.stringify({ customFields }) });
  return { ok: res.ok, status: res.status, message: res.ok ? null : String(res.body?.message || "") };
}

// Reintento del workflow para el mismo email: no se crea dos veces.
const seen = new Map();
function dedupe(email) {
  const now = Date.now();
  for (const [key, ts] of seen) if (now - ts > DEDUPE_MS) seen.delete(key);
  if (seen.has(email)) return true;
  seen.set(email, now);
  return false;
}

// ---------- elegibilidad (pública: solo un booleano) ----------
// El formulario la usa para bloquear en el paso 1. No devuelve el contacto, ni
// sus etiquetas, ni si el correo existe como cliente: solo si es del equipo.
const hits = new Map();
function withinRate(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < 60000);
  if (list.length >= 20) {
    hits.set(ip, list);
    return false;
  }
  list.push(now);
  hits.set(ip, list);
  return true;
}

// El formulario vive en el dominio de GHL y consulta esta ruta desde el
// navegador: sin CORS el fetch falla aunque el servidor conteste 200, y el
// usuario vería "no apareces en el equipo" siempre. Solo se abre esta ruta;
// /ghl/create-user sigue siendo servidor a servidor.
const CORS = { "access-control-allow-origin": "*", vary: "Origin" };

async function eligibility(req, res, url) {
  if (!REQUIRED_TAG) return send(res, 200, { ok: true, eligible: true, check: "disabled" }, CORS);
  if (!TOKEN) {
    return send(res, 503, { ok: false, code: "NOT_CONFIGURED", message: "Falta el token de GHL." }, CORS);
  }
  if (!withinRate(req.socket.remoteAddress || "?")) {
    return send(res, 429, { ok: false, code: "RATE_LIMIT", message: "Demasiadas consultas." }, { ...CORS, "retry-after": "60" });
  }
  if (process.env.GHL_ELIGIBILITY_LOG === "1") log("eligibility", {});
  const email = String(url.searchParams.get("email") || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return send(res, 400, { ok: false, code: "EMAIL_REQUERIDO", message: "Falta un email válido." }, CORS);
  }
  const contact = await findContact({ contactId: "", email, locationIds: [LOCATION_ID] });
  const gate = tagGate(contact);
  return send(res, 200, { ok: true, eligible: !gate, code: gate ? gate.code : "OK" }, CORS);
}

// ---------- handler ----------
const server = createServer(async (req, res) => {
  const started = Date.now();
  let email = "";
  try {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

    if (url.pathname === "/health" && req.method === "GET") {
      return send(res, 200, {
        ok: true,
        dryRun: DRY_RUN,
        route: ROUTE,
        locationId: LOCATION_ID,
        admins: Object.keys(ADMINS),
        linkCalendars: LINK_CALENDARS,
        requiredTag: REQUIRED_TAG || null,
        eligibilityRoute: REQUIRED_TAG ? ELIGIBILITY_ROUTE : null,
        companyId: COMPANY_ID ? "configurado" : "falta",
        secret: SECRET ? "configurado" : "falta",
        token: TOKEN ? "configurado" : "falta",
      });
    }
    // Consulta pública de elegibilidad: va ANTES del gate de ruta y método
    // porque el navegador la llama con GET y sin token.
    if (url.pathname === ELIGIBILITY_ROUTE && req.method === "OPTIONS") {
      res.writeHead(204, { ...CORS, "access-control-allow-methods": "GET, OPTIONS", "access-control-allow-headers": "accept", "access-control-max-age": "600" });
      return res.end();
    }
    if (url.pathname === ELIGIBILITY_ROUTE && req.method === "GET") {
      return await eligibility(req, res, url);
    }
    if (url.pathname !== ROUTE) throw new HttpError(404, "NOT_FOUND", `Ruta desconocida: ${url.pathname}`);
    if (req.method !== "POST") throw new HttpError(405, "METHOD_NOT_ALLOWED", "Solo se acepta POST.");
    if (!SECRET) {
      throw new HttpError(503, "NOT_CONFIGURED", "Falta GHL_WEBHOOK_SECRET: el endpoint no acepta peticiones sin secreto.");
    }
    assertAuth(req, url);

    if (!/^application\/json/i.test(String(req.headers["content-type"] || ""))) {
      throw new HttpError(415, "UNSUPPORTED_MEDIA_TYPE", "Content-Type debe ser application/json.");
    }

    const raw = await readBody(req);
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new HttpError(400, "BAD_JSON", "El cuerpo no es JSON válido.");
    }
    if (!parsed || typeof parsed !== "object") throw new HttpError(400, "BAD_JSON", "El cuerpo debe ser un objeto JSON.");

    const user = normalize(parsed);
    email = user.email;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(user.email)) {
      throw new HttpError(400, "EMAIL_REQUERIDO", "Falta un email válido (campo email del formulario).");
    }
    if (!["admin", "user"].includes(user.role)) {
      throw new HttpError(400, "ROLE_INVALIDO", `role debe ser "admin" o "user" (llegó "${user.role}").`);
    }
    if (!["account", "agency"].includes(user.type)) {
      throw new HttpError(400, "TYPE_INVALIDO", `type debe ser "account" o "agency" (llegó "${user.type}").`);
    }
    if (!user.locationIds.length) {
      throw new HttpError(400, "LOCATION_REQUERIDA", "Falta locationIds.");
    }

    const generated = !user.password;
    if (generated) user.password = tempPassword();
    const weak = passwordProblems(user.password);
    if (weak.length) {
      throw new HttpError(422, "PASSWORD_DEBIL", `La contraseña no cumple la política de GHL: falta ${weak.join(", ")}.`);
    }

    if (!DRY_RUN) {
      if (!COMPANY_ID) throw new HttpError(503, "NOT_CONFIGURED", "Falta GHL_COMPANY_ID (id de la agencia).");
      if (!TOKEN) throw new HttpError(503, "NOT_CONFIGURED", "Falta el token con users.write (GHL_PIT).");
    }

    if (dedupe(user.email)) {
      log("duplicado", { email: mask(user.email), ms: Date.now() - started });
      return send(res, 200, {
        ok: true,
        deduplicated: true,
        email: user.email,
        message: "Ese email ya se procesó hace poco; la contraseña temporal se emitió en el primer intento.",
      });
    }

    if (DRY_RUN) {
      log("dry-run", { email: mask(user.email), role: user.role, admin: user.admin?.key || null });
      return send(res, 200, {
        ok: true,
        dryRun: true,
        wouldCreate: {
          companyId: COMPANY_ID || "<falta GHL_COMPANY_ID>",
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          type: user.type,
          role: user.role,
          locationIds: user.locationIds,
          scopes: user.scopes,
          password: `${user.password.length} caracteres, generada localmente`,
        },
        admin: user.admin ? { key: user.admin.key, userId: user.admin.userId, name: user.admin.name } : null,
        calendars: user.calendars,
        availability: user.availability,
        emergencySameDay: user.emergencySameDay,
        towns: user.towns,
        photo: user.photoRaw ? `${Math.round(user.photoRaw.length / 1024)} KB, se subiría a /medias/upload-file` : null,
      });
    }

    // Puerta de la etiqueta: se consulta el contacto ANTES de crear nada.
    let gateContact = null;
    if (REQUIRED_TAG) {
      gateContact = await findContact(user);
      const gate = tagGate(gateContact);
      if (gate) {
        log("rechazado", { email: mask(user.email), code: gate.code });
        throw new HttpError(403, gate.code, gate.message);
      }
    }

    const warnings = [];

    // Foto: se sube primero y se manda como profilePhoto al crear. Si falla, el
    // usuario se crea igual y queda el aviso (sin intervención bloqueada).
    let photo = null;
    if (user.photoRaw) {
      const decoded = decodePhoto(user.photoRaw);
      if (!decoded) {
        warnings.push("La foto no se pudo leer: el usuario se creó sin foto.");
      } else {
        photo = await uploadPhoto(decoded);
        if (photo.ok) user.photoUrl = photo.url;
        else warnings.push(`No se pudo subir la foto (${photo.status || "sin estado"}): ${photo.message || "sin detalle"}`);
      }
    }

    const result = await createUser(user);

    let calendarLinks = [];
    if (user.calendars.length && result.id) {
      if (LINK_CALENDARS) {
        calendarLinks = await linkCalendars(result.id, user.calendars);
        for (const link of calendarLinks) {
          if (!link.ok) warnings.push(`No se pudo enlazar el calendario ${link.calendarId}: ${link.message}`);
        }
      } else {
        warnings.push("GHL_LINK_CALENDARS=0: el usuario se creó sin enlazar sus calendarios.");
      }
    } else if (user.calendars.length) {
      warnings.push("GHL no devolvió el id del usuario: no se pudieron enlazar los calendarios.");
    } else {
      warnings.push("Sin admin ni calendarios en el payload: el usuario se creó sin enlaces a calendarios.");
    }

    // Notas y campos de contacto comparten el mismo contacto: se resuelve (o se
    // crea) una sola vez.
    let contactFields = null;
    let notesResult = null;
    // Reutiliza el contacto que ya validó la etiqueta; si no había, se crea.
    let contactId = gateContact?.id || null;
    const wantsContactFields = FIELD_DISPONIBILIDAD || FIELD_EMERGENCIA || FIELD_COBERTURA;
    if (!contactId && (user.notes || wantsContactFields)) {
      const createdContact = await createContact(user);
      if (createdContact.ok) contactId = createdContact.id;
      else warnings.push(`No se pudo crear el contacto: ${createdContact.message}`);
    }

    if (wantsContactFields && contactId) {
      contactFields = await writeContactFields(contactId, user);
      if (contactFields && !contactFields.ok) {
        warnings.push(`No se escribieron horarios/cobertura en el contacto: ${contactFields.message}`);
      }
    }

    // Notas: quedan en el CRM (timeline del contacto), no solo en el payload.
    if (user.notes && contactId) {
      notesResult = await createContactNote(contactId, user.notes, user.admin?.userId);
      if (!notesResult.ok) warnings.push(`No se guardaron las notas en el contacto: ${notesResult.message}`);
    }

    log("creado", {
      email: mask(user.email),
      userId: result.id || null,
      role: user.role,
      admin: user.admin?.key || null,
      calendars: user.calendars.length,
      linked: calendarLinks.filter((link) => link.ok).length,
      generated,
      notes: user.notes ? user.notes.length : 0,
      status: result.status,
      ms: Date.now() - started,
    });
    return send(res, 201, {
      ok: true,
      userId: result.id || null,
      email: user.email,
      type: user.type,
      role: user.role,
      locationIds: user.locationIds,
      admin: user.admin ? { key: user.admin.key, userId: user.admin.userId, name: user.admin.name } : null,
      calendarLinks,
      availability: user.availability,
      availabilityText: user.availabilityText || null,
      emergencySameDay: user.emergencySameDay,
      contactFields,
      photo: photo ? { ok: !!photo.ok, url: photo.url || null, message: photo.message || null } : null,
      contact: contactId ? { id: contactId, created: !gateContact } : null,
      notes: user.notes || null,
      notesResult,
      towns: user.towns,
      townsText: user.townsText || null,
      coverageAllIsland: user.coverageAllIsland,
      warnings,
      temporaryPassword: generated ? user.password : null,
      passwordGenerated: generated,
      note: generated
        ? "Contraseña temporal generada. Entrégala por un canal seguro y pide cambiarla al primer acceso."
        : "Se usó la contraseña enviada por el formulario.",
    });
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500;
    const code = err instanceof HttpError ? err.code : "INTERNAL";
    const message = err instanceof HttpError ? err.message : "Error interno del endpoint.";
    if (!(err instanceof HttpError)) console.error(err);
    log("error", { email: email ? mask(email) : null, code, status, ms: Date.now() - started });
    return send(res, status, { ok: false, code, message, email: email || undefined }, err?.headers || {});
  }
});

// ---------- arranque ----------
if (!SECRET) console.warn("aviso: falta GHL_WEBHOOK_SECRET; el endpoint responderá 503 hasta definirlo.");
if (!DRY_RUN && !COMPANY_ID) console.warn("aviso: falta GHL_COMPANY_ID; no se podrá crear ningún usuario.");
if (!DRY_RUN && !TOKEN) console.warn("aviso: falta el token (GHL_PIT); no se podrá crear ningún usuario.");
if (!DEFAULT_SCOPES.length) {
  console.warn("aviso: GHL_DEFAULT_SCOPES vacío; se omite `scopes` y GHL aplica su default (nunca se manda []).");
}

server.listen(PORT, HOST, () => {
  log("listening", {
    host: HOST,
    port: PORT,
    route: ROUTE,
    dryRun: DRY_RUN,
    locationId: LOCATION_ID,
    api: `${BASE}/users/`,
  });
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    log("stop", { signal });
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 3000).unref();
  });
}
