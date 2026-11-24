// Ilatek · alta de usuarios de GHL — versión Cloudflare Workers.
//
// Es el mismo contrato que ../../create-user-webhook.mjs (que sigue siendo la
// versión Node para pruebas locales), pero sin `node:http`/`fs`:
//
//   POST /ghl/create-user      crea el usuario, sube la foto, enlaza calendarios
//                              y guarda las notas del submit.
//   GET  /ghl/eligibility      { eligible: boolean } — público, con CORS.
//   GET  /health               diagnóstico sin secretos.
//
// Variables (Sites → Secrets; nunca en el repo):
//   GHL_PIT              token de agencia con `users.write`      [secreto]
//   GHL_WEBHOOK_SECRET   secreto compartido con el workflow      [secreto]
//   GHL_COMPANY_ID       id de la agencia (no es secreto)
//   GHL_LOCATION_ID      subcuenta destino (def. 8OxUENFVM60EKzqsTcoD)
//   GHL_REQUIRED_TAG     etiqueta obligatoria (def. `team`; vacío = no exige)
//   GHL_LINK_CALENDARS=0 no enlaza calendarios
//   DRY_RUN=1            valida y responde sin llamar a GHL
//
// Sin GHL_WEBHOOK_SECRET el endpoint responde 503: no se abre nunca sin auth.

const BASE = "https://services.leadconnectorhq.com";
const API_VERSION = "2021-07-28";
const MEDIA_VERSION = "v3";
const ROUTE = "/ghl/create-user";
const ALTA_ROUTE = "/ghl/alta";
const ELIGIBILITY_ROUTE = "/ghl/eligibility";
const MAX_BODY = 4 * 1024 * 1024;
const DEDUPE_MS = 10 * 60 * 1000;
const TIMEOUT_MS = 15000;
const PASSWORD_LEN = 16;

// Admins de Ilatek - PR y sus calendarios (ids leídos el 2026-11-16).
const ADMINS = {
  luis: { userId: "lrgREN7IQe6y2iRW4Epe", name: "Luis Cardec", calendars: ["wM8KQhsYjEQAo0HbNGIh"] },
  aida: {
    userId: "BXfQdgMBK0OJCXSbWxcj",
    name: "Aida Cintron",
    calendars: ["i5HZobZjuSZcDl43qgOG", "vMU898LXrUCkSROqGuLv"],
  },
};

const DEDUPE = new Map();
const HITS = new Map();

class HttpError extends Error {
  constructor(status, code, message, headers = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.headers = headers;
  }
}

const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...headers,
    },
  });

const CORS = { "access-control-allow-origin": "*", vary: "Origin" };

const mask = (email) => {
  const [local, domain] = String(email || "").split("@");
  if (!domain) return "***";
  return `${local.slice(0, 1)}***@${domain}`;
};

const log = (event, data = {}) => console.log(JSON.stringify({ t: new Date().toISOString(), event, ...data }));

// Comparación en tiempo constante (equivalente a timingSafeEqual).
function sameSecret(a, b) {
  const x = new TextEncoder().encode(String(a));
  const y = new TextEncoder().encode(String(b));
  if (x.length !== y.length) return false;
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

function config(env) {
  const scopes = String(env.GHL_DEFAULT_SCOPES || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return {
    token: String(env.GHL_PIT || "").trim(),
    secret: String(env.GHL_WEBHOOK_SECRET || "").trim(),
    companyId: String(env.GHL_COMPANY_ID || "").trim(),
    locationId: String(env.GHL_LOCATION_ID || "8OxUENFVM60EKzqsTcoD").trim(),
    scopes,
    requiredTag: String(env.GHL_REQUIRED_TAG ?? "team").trim().toLowerCase(),
    linkCalendars: !/^(0|false|no)$/i.test(String(env.GHL_LINK_CALENDARS || "1")),
    dryRun: /^(1|true|si|sí|yes)$/i.test(String(env.DRY_RUN || "")),
    allowRoleOverride: /^(1|true|si|sí|yes)$/i.test(String(env.GHL_ALLOW_ROLE_OVERRIDE || "")),
    welcome: /^(1|true|si|sí|yes)$/i.test(String(env.WELCOME_EMAIL || "")),
    welcomeSubject: String(env.WELCOME_SUBJECT || "Bienvenido a Ilatek Property Solution").trim(),
    altaTag: String(env.GHL_ALTA_TAG ?? "team").trim().toLowerCase(),
  };
}

// ---------- contraseña temporal ----------
const SETS = ["ABCDEFGHJKLMNPQRSTUVWXYZ", "abcdefghijkmnopqrstuvwxyz", "23456789", "!@#$%&*?-"];
function pick(set) {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return set[buf[0] % set.length];
}
function tempPassword(len = PASSWORD_LEN) {
  const all = SETS.join("");
  const chars = SETS.map((set) => pick(set));
  while (chars.length < len) chars.push(pick(all));
  for (let i = chars.length - 1; i > 0; i--) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    const j = buf[0] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}
function passwordProblems(pw) {
  const out = [];
  if (pw.length < 12) out.push("mínimo 12 caracteres");
  if (!/[A-Z]/.test(pw)) out.push("una mayúscula");
  if (!/[a-z]/.test(pw)) out.push("una minúscula");
  if (!/[0-9]/.test(pw)) out.push("un número");
  if (!/[^A-Za-z0-9]/.test(pw)) out.push("un símbolo");
  return out;
}

// ---------- normalización ----------
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
const toE164 = (phone) => {
  const digits = String(phone || "").replace(/[^\d]/g, "");
  if (!digits) return "";
  if (digits.length === 10) return `+1${digits}`;
  return `+${digits}`;
};
const listOf = (value) => {
  if (value === undefined || value === null || value === "") return [];
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  return String(value).split(",").map((v) => String(v).trim()).filter(Boolean);
};
function findAdmin(key, userId) {
  const entries = Object.entries(ADMINS);
  if (userId) {
    const hit = entries.find(([, a]) => a.userId === userId);
    if (hit) return { key: hit[0], ...hit[1] };
  }
  if (!key) return null;
  const exact = entries.find(([name]) => name === key);
  if (exact) return { key: exact[0], ...exact[1] };
  const byName = entries.find(([, a]) => String(a.name || "").toLowerCase().includes(key));
  return byName ? { key: byName[0], ...byName[1] } : null;
}
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

function normalize(raw, C) {
  const contact = raw.contact && typeof raw.contact === "object" ? raw.contact : {};
  const custom = raw.customData && typeof raw.customData === "object" ? raw.customData : {};
  const sources = [raw, custom, contact];

  const email = String(firstOf(sources, ["email", "Email", "correo"]) ?? "").trim().toLowerCase();
  let firstName = String(firstOf(sources, ["firstName", "first_name", "nombre"]) ?? "").trim();
  let lastName = String(firstOf(sources, ["lastName", "last_name", "apellido"]) ?? "").trim();
  const fullName = String(firstOf(sources, ["full_name", "fullName", "name"]) ?? "").trim();
  if (!firstName && fullName) {
    const parts = fullName.split(/\s+/);
    firstName = parts[0] || "";
    lastName = lastName || parts.slice(1).join(" ");
  }

  const role = (C.allowRoleOverride ? String(firstOf(sources, ["role", "rol"]) ?? "user") : "user").trim().toLowerCase();
  const type = String(firstOf(sources, ["type", "accountType"]) ?? "account").trim().toLowerCase();
  const password = String(firstOf(sources, ["password", "tempPassword"]) ?? "");
  const phone = toE164(firstOf(sources, ["phone", "telefono", "teléfono"]));

  const adminKey = String(firstOf(sources, ["admin", "con_quien", "admin_nombre"]) ?? "").trim().toLowerCase();
  const adminUserId = String(firstOf(sources, ["admin_user_id", "adminUserId"]) ?? "").trim();
  const adminEntry = findAdmin(adminKey, adminUserId);
  const payloadCalendars = listOf(firstOf(sources, ["admin_calendars", "calendar_ids"]));
  const calendars = payloadCalendars.length ? payloadCalendars : adminEntry ? adminEntry.calendars.slice() : [];

  const availability = parseAvailability(firstOf(sources, ["availability_json", "availability", "horarios"]));
  const availabilityText =
    String(firstOf(sources, ["availability_text"]) ?? "").trim() ||
    availability.map((s) => `${s.dia_label} ${s.desde}-${s.hasta}`).join(" | ");

  const emergencyRaw = firstOf(sources, ["emergency_same_day", "emergencia", "emergency"]);
  const emergencySameDay = /^(1|true|si|sí|yes)$/i.test(String(emergencyRaw ?? "").trim());

  const towns = listOf(firstOf(sources, ["towns", "municipios", "cobertura"]));
  const townsText = String(firstOf(sources, ["towns_text"]) ?? "").trim() || towns.join(", ");
  const coverageAllIsland = /^(1|true|si|sí|yes)$/i.test(String(firstOf(sources, ["coverage_all_island"]) ?? "").trim());

  return {
    email,
    firstName,
    lastName,
    phone,
    role,
    type,
    password,
    locationIds: [String(firstOf(sources, ["locationId"]) ?? C.locationId)],
    scopes: C.scopes.slice(),
    admin: adminEntry,
    calendars,
    availability,
    availabilityText,
    emergencySameDay,
    contactId: String(firstOf(sources, ["contact_id", "contactId"]) ?? "").trim(),
    notes: String(firstOf(sources, ["notes", "notas", "comments", "comentarios"]) ?? "").trim(),
    towns,
    townsText,
    coverageAllIsland,
    photoRaw: String(firstOf(sources, ["photo_base64", "photo", "profilePhoto"]) ?? "").trim(),
  };
}

// ---------- GHL ----------
async function ghl(C, pathname, init = {}) {
  const res = await fetch(`${BASE}${pathname}`, {
    ...init,
    headers: {
      authorization: `Bearer ${C.token}`,
      version: API_VERSION,
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
  return { ok: res.ok, status: res.status, body, text };
}

function base64ToBytes(raw) {
  const m = String(raw).match(/^data:([^;]+);base64,(.*)$/i);
  const mime = m ? m[1] : "image/jpeg";
  const b64 = (m ? m[2] : String(raw)).replace(/\s/g, "");
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return { mime, bytes };
}

async function uploadPhoto(C, raw) {
  if (!raw) return null;
  let file;
  try {
    file = base64ToBytes(raw);
  } catch {
    return { ok: false, status: 0, message: "base64 inválido" };
  }
  const ext = file.mime.includes("png") ? "png" : file.mime.includes("webp") ? "webp" : "jpg";
  const form = new FormData();
  form.append("file", new Blob([file.bytes], { type: file.mime }), `perfil.${ext}`);
  form.append("name", `perfil-${Date.now()}.${ext}`);
  let res;
  try {
    // Sin content-type manual: fetch pone el boundary del multipart.
    res = await fetch(`${BASE}/medias/upload-file`, {
      method: "POST",
      headers: { authorization: `Bearer ${C.token}`, version: MEDIA_VERSION, accept: "application/json" },
      body: form,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    return { ok: false, status: 0, message: err?.message || String(err) };
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, status: res.status, message: String(body?.message || "upload falló") };
  return { ok: true, url: body.url || body.fileUrl || body?.data?.url || "" };
}

async function createUser(C, user) {
  const payload = {
    companyId: C.companyId,
    email: user.email,
    password: user.password,
    type: user.type,
    role: user.role,
    locationIds: user.locationIds,
  };
  if (user.firstName) payload.firstName = user.firstName;
  if (user.lastName) payload.lastName = user.lastName;
  if (user.phone) payload.phone = user.phone;
  if (user.scopes.length) payload.scopes = user.scopes;
  if (user.photoUrl) payload.profilePhoto = user.photoUrl;

  let res;
  try {
    res = await ghl(C, "/users/", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    const timeout = err?.name === "TimeoutError" || err?.name === "AbortError";
    throw new HttpError(504, timeout ? "GHL_TIMEOUT" : "GHL_UNREACHABLE", String(err?.message || err));
  }
  if (res.ok) {
    const id = res.body?.user?.id || res.body?.id || res.body?.userId || "";
    return { id: String(id), status: res.status };
  }
  const message = String(res.body?.message || res.body?.msg || res.body?.error || "sin detalle");
  const status = res.status === 401 || res.status === 403 ? 502 : res.status === 429 ? 429 : 422;
  const code = res.status === 401 || res.status === 403 ? "GHL_TOKEN" : res.status === 429 ? "GHL_RATE_LIMIT" : "GHL_RECHAZO";
  throw new HttpError(status, code, message);
}

async function findContact(C, email) {
  const res = await ghl(C, `/contacts/?locationId=${encodeURIComponent(C.locationId)}&query=${encodeURIComponent(email)}`);
  if (!res.ok) return null;
  const list = Array.isArray(res.body?.contacts) ? res.body.contacts : [];
  const hit = list.find((c) => String(c.email || "").toLowerCase() === email.toLowerCase());
  return hit || null;
}

async function getContact(C, id) {
  const res = await ghl(C, `/contacts/${id}`);
  return res.ok ? res.body?.contact || null : null;
}

function tagGate(contact, C) {
  if (!C.requiredTag) return null;
  if (!contact) return { code: "NO_TEAM_CONTACT", message: "Ese correo no es un contacto de la subcuenta." };
  const tags = (Array.isArray(contact.tags) ? contact.tags : []).map((t) => String(t).toLowerCase());
  if (!tags.includes(C.requiredTag)) {
    return { code: "NO_TEAM_TAG", message: `Al contacto le falta la etiqueta ${C.requiredTag}.` };
  }
  return null;
}

async function createContact(C, user) {
  const body = { locationId: C.locationId, email: user.email };
  if (user.firstName) body.firstName = user.firstName;
  if (user.lastName) body.lastName = user.lastName;
  if (user.phone) body.phone = user.phone;
  const res = await ghl(C, "/contacts/", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  return res.ok ? String(res.body?.contact?.id || "") : "";
}

async function addNote(C, contactId, notes, userId) {
  const body = { body: notes };
  if (userId) body.userId = userId;
  const res = await ghl(C, `/contacts/${contactId}/notes`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return { ok: res.ok, status: res.status, message: res.ok ? null : String(res.body?.message || "") };
}

async function linkCalendar(C, calendarId, userId) {
  const current = await ghl(C, `/calendars/${calendarId}`);
  if (!current.ok) return { id: calendarId, ok: false, status: current.status, message: String(current.body?.message || "") };
  const members = Array.isArray(current.body?.calendar?.teamMembers) ? current.body.calendar.teamMembers.slice() : [];
  if (members.some((m) => m?.userId === userId)) return { id: calendarId, ok: true, already: true };
  members.push({ userId, priority: members.length === 0 ? "primary" : "secondary" });
  const res = await ghl(C, `/calendars/${calendarId}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ teamMembers: members }),
  });
  return { id: calendarId, ok: res.ok, status: res.status, message: res.ok ? null : String(res.body?.message || "") };
}

// ---------- alta del operador: contacto, etiquetas, nota y bienvenida ----------
const ALTA_SOURCE = "Alta de usuario ILATEK";

async function updateContact(C, contactId, patch) {
  const res = await ghl(C, `/contacts/${contactId}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(patch),
  });
  return { ok: res.ok, status: res.status, message: res.ok ? null : String(res.body?.message || "") };
}

async function addTags(C, contactId, tags) {
  const list = [...new Set((tags || []).map((t) => String(t).trim()).filter(Boolean))];
  if (!list.length) return { ok: true, skipped: true };
  const res = await ghl(C, `/contacts/${contactId}/tags`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ tags: list }),
  });
  return { ok: res.ok, status: res.status, message: res.ok ? null : String(res.body?.message || ""), tags: list };
}

// Todo lo que marcó el operador en una sola nota legible: es el registro
// completo del alta sin crear custom fields nuevos.
function altaNote(user, raw) {
  const who = String(raw.operator_name || raw.operator || "").trim();
  return [
    "ALTA DE USUARIO — ILATEK PROPERTY SOLUTION",
    `Registrado por: ${who || "—"}`,
    `Fecha: ${new Date().toISOString()}`,
    `Nombre: ${[user.firstName, user.lastName].filter(Boolean).join(" ") || "—"}`,
    `Correo: ${user.email}`,
    `Teléfono: ${user.phone || "—"}`,
    `Equipo: ${user.admin ? `Equipo de ${user.admin.name}` : "—"}`,
    `Cobertura: ${user.coverageAllIsland ? "Toda la isla (78 municipios)" : user.townsText || "—"}`,
    `Horario: ${user.availabilityText || "—"}`,
    `Emergencias mismo día: ${user.emergencySameDay ? "Sí" : "No"}`,
    `Notas del operador: ${user.notes || "—"}`,
    `Foto de perfil: ${user.photoUrl ? "cargada" : "sin foto"}`,
    `Usuario de GHL: ${user.userId || "pendiente"}`,
  ].join("\n");
}

function welcomeHtml(user, password) {
  const nombre = user.firstName || "compañero";
  const equipo = user.admin ? `Equipo de ${user.admin.name}` : "equipo Ilatek";
  const horario = user.availabilityText || "el que acordaste con tu líder";
  const cobertura = user.coverageAllIsland ? "Toda la isla" : user.townsText || "la que acordaste";
  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Bienvenido a Ilatek</title></head>
<body style="margin:0;padding:0;background:#eef3ff;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef3ff;padding:24px 12px;"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;color:#11164b;">
<tr><td style="padding:28px 28px 8px;"><p style="margin:0 0 6px;color:#213d8e;font-size:13px;letter-spacing:.08em;text-transform:uppercase;font-weight:700;">Ilatek Property Solution</p>
<h1 style="margin:0 0 10px;font-size:24px;line-height:1.25;">Bienvenido al equipo, ${nombre}</h1>
<p style="margin:0;color:#5b6380;font-size:15px;line-height:1.6;">Tu cuenta ya está creada. Entras al equipo de <b>${equipo}</b>.</p></td></tr>
<tr><td style="padding:18px 28px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f8ff;border:1px solid #dbe2f1;border-radius:12px;"><tr><td style="padding:16px 18px;font-size:14px;line-height:1.7;">
<p style="margin:0 0 6px;"><b>Tu acceso</b></p>
<p style="margin:0 0 4px;">Correo: ${user.email}</p>
<p style="margin:0 0 4px;">Contraseña temporal: <b>${password}</b></p>
<p style="margin:0;color:#5b6380;">Cámbiala al entrar por primera vez.</p></td></tr></table></td></tr>
<tr><td style="padding:0 28px 22px;font-size:14px;line-height:1.7;color:#11164b;">
<p style="margin:0 0 8px;"><b>Cobertura:</b> ${cobertura}</p>
<p style="margin:0 0 16px;"><b>Horario registrado:</b> ${horario}</p>
<p style="margin:0 0 16px;color:#5b6380;">Tu agenda ya está enlazada a los calendarios de tu equipo. Cualquier duda con horarios, rutas o servicios, escríbele a tu líder.</p>
<p style="margin:0;color:#5b6380;font-size:13px;">Ilatek Property Solution · Puerto Rico</p></td></tr>
</table></td></tr></table></body></html>`;
}

async function sendWelcome(C, user, password) {
  if (!C.welcome) return { ok: true, skipped: true, motivo: "WELCOME_EMAIL desactivado" };
  if (!user.contactId) return { ok: false, skipped: true, motivo: "sin contacto" };
  const res = await ghl(C, "/conversations/messages", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      type: "Email",
      contactId: user.contactId,
      subject: C.welcomeSubject,
      html: welcomeHtml(user, password),
    }),
  });
  return { ok: res.ok, status: res.status, message: res.ok ? null : String(res.body?.message || "") };
}

// ---------- elegibilidad pública ----------
function withinRate(ip) {
  const now = Date.now();
  const list = (HITS.get(ip) || []).filter((t) => now - t < 60000);
  if (list.length >= 20) {
    HITS.set(ip, list);
    return false;
  }
  list.push(now);
  HITS.set(ip, list);
  return true;
}

async function eligibility(request, url, C) {
  if (!C.requiredTag) return json({ ok: true, eligible: true, check: "disabled" }, 200, CORS);
  if (!C.token) return json({ ok: false, code: "NOT_CONFIGURED", message: "Falta el token de GHL." }, 503, CORS);
  const ip = request.headers.get("cf-connecting-ip") || "?";
  if (!withinRate(ip)) {
    return json({ ok: false, code: "RATE_LIMIT", message: "Demasiadas consultas." }, 429, { ...CORS, "retry-after": "60" });
  }
  const email = String(url.searchParams.get("email") || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return json({ ok: false, code: "EMAIL_REQUERIDO", message: "Falta un email válido." }, 400, CORS);
  }
  const contact = await findContact(C, email);
  const gate = tagGate(contact, C);
  return json({ ok: true, eligible: !gate, code: gate ? gate.code : "OK" }, 200, CORS);
}

function purgeDedupe() {
  const now = Date.now();
  for (const [key, ts] of DEDUPE) if (now - ts > DEDUPE_MS) DEDUPE.delete(key);
}

// Solo comprueba: no marca nada. Marcar antes de crear el usuario hacía que un
// alta fallida bloqueara el reintento del operador durante 10 minutos.
function isDuplicate(email) {
  purgeDedupe();
  return DEDUPE.has(email);
}

// Marca el email como procesado. Se llama únicamente cuando el usuario ya
// existe de verdad en GHL.
function markProcessed(email) {
  purgeDedupe();
  DEDUPE.set(email, Date.now());
}

// Compatibilidad con la ruta antigua /ghl/create-user.
function dedupe(email) {
  if (isDuplicate(email)) return true;
  markProcessed(email);
  return false;
}

// ---------- POST /ghl/create-user ----------
async function createUserHandler(request, C) {
  const started = Date.now();
  let email = "";
  try {
    if (!C.secret) throw new HttpError(503, "NOT_CONFIGURED", "Falta GHL_WEBHOOK_SECRET.");
    const url = new URL(request.url);
    const given = String(
      request.headers.get("x-ilatek-token") ||
        (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "") ||
        url.searchParams.get("token") ||
        ""
    ).trim();
    if (!sameSecret(given, C.secret)) {
      throw new HttpError(401, "UNAUTHORIZED", "Falta el token del workflow o no coincide (cabecera x-ilatek-token).");
    }
    if (!C.token) throw new HttpError(503, "NOT_CONFIGURED", "Falta el token con users.write (GHL_PIT).");

    const raw = await request.text();
    if (raw.length > MAX_BODY) throw new HttpError(413, "BODY_TOO_LARGE", `El cuerpo supera ${MAX_BODY} bytes`);
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new HttpError(400, "BAD_JSON", "El cuerpo no es JSON válido.");
    }
    if (!parsed || typeof parsed !== "object") throw new HttpError(400, "BAD_JSON", "El cuerpo debe ser un objeto JSON.");

    const user = normalize(parsed, C);
    email = user.email;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(user.email)) {
      throw new HttpError(400, "EMAIL_REQUERIDO", "Falta un email válido.");
    }
    if (!["admin", "user"].includes(user.role)) throw new HttpError(400, "ROLE_INVALIDO", `role inválido: ${user.role}`);
    if (!["account", "agency"].includes(user.type)) throw new HttpError(400, "TYPE_INVALIDO", `type inválido: ${user.type}`);
    if (!user.locationIds.length) throw new HttpError(400, "LOCATION_REQUERIDA", "Falta locationIds.");

    // Puerta de entrada: contacto existente con la etiqueta requerida.
    let contact = user.contactId ? await getContact(C, user.contactId) : await findContact(C, user.email);
    const gate = tagGate(contact, C);
    if (gate) {
      log("rechazado", { email: mask(email), code: gate.code });
      throw new HttpError(403, gate.code, gate.message);
    }

    if (dedupe(user.email)) {
      return json({
        ok: true,
        deduplicated: true,
        email: user.email,
        message: "Ese email ya se procesó hace poco.",
      });
    }

    const generated = !user.password;
    if (generated) user.password = tempPassword();
    const weak = passwordProblems(user.password);
    if (weak.length) throw new HttpError(422, "PASSWORD_DEBIL", `La contraseña no cumple la política: falta ${weak.join(", ")}.`);

    const warnings = [];
    const photo = user.photoRaw ? await uploadPhoto(C, user.photoRaw) : null;
    if (photo?.ok && photo.url) user.photoUrl = photo.url;
    else if (user.photoRaw) warnings.push(`No se pudo subir la foto: ${photo?.message || "sin URL"}`);

    if (C.dryRun) {
      return json({ ok: true, dryRun: true, email: user.email, role: user.role, admin: user.admin?.key || null });
    }

    const created = await createUser(C, user);

    const calendarLinks = [];
    if (C.linkCalendars && user.admin?.userId) {
      for (const id of user.calendars) calendarLinks.push(await linkCalendar(C, id, user.admin.userId));
    }

    if (!contact) {
      const newId = await createContact(C, user);
      if (newId) contact = { id: newId };
      else warnings.push("No se pudo crear el contacto en la subcuenta.");
    }

    let notesResult = null;
    if (user.notes && contact?.id) {
      notesResult = await addNote(C, contact.id, user.notes, user.admin?.userId);
      if (!notesResult.ok) warnings.push(`No se guardaron las notas: ${notesResult.message}`);
    }

    log("creado", {
      email: mask(email),
      userId: created.id,
      role: user.role,
      admin: user.admin?.key || null,
      linked: calendarLinks.filter((c) => c.ok).length,
      notes: user.notes.length,
      status: 201,
      ms: Date.now() - started,
    });

    return json(
      {
        ok: true,
        userId: created.id,
        email: user.email,
        role: user.role,
        admin: user.admin?.key || null,
        calendarLinks,
        notes: user.notes || null,
        notesResult,
        contactId: contact?.id || null,
        temporaryPassword: generated ? user.password : undefined,
        passwordGenerated: generated,
        warnings,
      },
      201
    );
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500;
    const code = err instanceof HttpError ? err.code : "ERROR_INTERNO";
    log("error", { email: email ? mask(email) : null, code, status });
    return json({ ok: false, code, message: err?.message || String(err) }, status, err?.headers || {});
  }
}

// ---------- POST /ghl/alta · consola del operador ----------
async function altaHandler(request, C) {
  const started = Date.now();
  let email = "";
  try {
    if (!C.secret) throw new HttpError(503, "NOT_CONFIGURED", "Falta GHL_WEBHOOK_SECRET.");
    const given = String(
      request.headers.get("x-ilatek-token") ||
        (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "")
    ).trim();
    if (!sameSecret(given, C.secret)) throw new HttpError(401, "UNAUTHORIZED", "El código interno no coincide.");
    if (!C.token) throw new HttpError(503, "NOT_CONFIGURED", "Falta el token con users.write (GHL_PIT).");
    if (!C.companyId) throw new HttpError(503, "NOT_CONFIGURED", "Falta GHL_COMPANY_ID.");

    const raw = await request.text();
    if (raw.length > MAX_BODY) throw new HttpError(413, "BODY_TOO_LARGE", `El cuerpo supera ${MAX_BODY} bytes`);
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new HttpError(400, "BAD_JSON", "El cuerpo no es JSON válido.");
    }
    if (!parsed || typeof parsed !== "object") throw new HttpError(400, "BAD_JSON", "El cuerpo debe ser un objeto JSON.");

    const user = normalize(parsed, C);
    email = user.email;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(user.email)) {
      throw new HttpError(400, "EMAIL_REQUERIDO", "Falta un email válido.");
    }
    if (!user.admin) throw new HttpError(400, "ADMIN_REQUERIDO", "Falta el equipo al que entra (admin).");

    if (isDuplicate(user.email)) {
      return json(
        {
          ok: true,
          deduplicated: true,
          email: user.email,
          message: "Ese email ya se dio de alta hace unos minutos. Revisa el contacto antes de repetirlo.",
        },
        200,
        CORS
      );
    }

    if (!user.password) user.password = tempPassword();
    const weak = passwordProblems(user.password);
    if (weak.length) throw new HttpError(422, "PASSWORD_DEBIL", `La contraseña no cumple la política: falta ${weak.join(", ")}.`);

    const warnings = [];

    // 1 · contacto con los datos nativos
    let contact = user.contactId ? await getContact(C, user.contactId) : await findContact(C, user.email);
    if (!contact) {
      const newId = await createContact(C, user);
      if (newId) contact = { id: newId };
      else warnings.push("No se pudo crear el contacto.");
    }
    user.contactId = contact?.id || "";

    if (user.contactId) {
      const patch = {};
      if (user.firstName) patch.firstName = user.firstName;
      if (user.lastName) patch.lastName = user.lastName;
      if (user.phone) patch.phone = user.phone;
      if (user.towns[0]) patch.city = user.towns[0];
      patch.source = ALTA_SOURCE;
      const upd = await updateContact(C, user.contactId, patch);
      if (!upd.ok) warnings.push(`No se actualizaron los datos del contacto: ${upd.message}`);
      const tagRes = await addTags(C, user.contactId, [C.altaTag, user.admin ? `equipo-${user.admin.key}` : ""]);
      if (!tagRes.ok) warnings.push(`No se pusieron las etiquetas: ${tagRes.message}`);
    }

    // 2 · foto y usuario
    const photo = user.photoRaw ? await uploadPhoto(C, user.photoRaw) : null;
    if (photo?.ok && photo.url) user.photoUrl = photo.url;
    else if (user.photoRaw) warnings.push(`No se pudo subir la foto: ${photo?.message || "sin URL"}`);

    if (C.dryRun) {
      return json({ ok: true, dryRun: true, email: user.email, contactId: user.contactId, admin: user.admin.key }, 200, CORS);
    }

    const created = await createUser(C, user);
    user.userId = created.id;
    // El usuario ya existe: desde aquí sí se bloquean los reintentos.
    markProcessed(user.email);

    const calendarLinks = [];
    if (C.linkCalendars && user.admin?.userId) {
      for (const id of user.calendars) calendarLinks.push(await linkCalendar(C, id, user.admin.userId));
    }

    // 3 · nota con TODO lo que marcó el operador
    let noteResult = null;
    if (user.contactId) {
      noteResult = await addNote(C, user.contactId, altaNote(user, parsed), user.admin?.userId);
      if (!noteResult.ok) warnings.push(`No se guardó la nota: ${noteResult.message}`);
    }

    // 4 · correo de bienvenida (solo con WELCOME_EMAIL=1)
    const welcome = await sendWelcome(C, user, user.password);
    if (!welcome.ok) warnings.push(`No se envió la bienvenida: ${welcome.message}`);

    log("alta-operador", {
      email: mask(email),
      userId: created.id,
      admin: user.admin.key,
      linked: calendarLinks.filter((c) => c.ok).length,
      welcome: welcome.ok && !welcome.skipped,
      status: 201,
      ms: Date.now() - started,
    });

    return json(
      {
        ok: true,
        userId: created.id,
        email: user.email,
        contactId: user.contactId,
        admin: user.admin.key,
        calendarLinks,
        welcome,
        noteResult,
        temporaryPassword: user.password,
        warnings,
      },
      201,
      CORS
    );
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500;
    const code = err instanceof HttpError ? err.code : "ERROR_INTERNO";
    log("alta-error", { email: email ? mask(email) : null, code, status });
    return json({ ok: false, code, message: err?.message || String(err) }, status, { ...CORS, ...(err?.headers || {}) });
  }
}

export default {
  async fetch(request, env) {
    const C = config(env || {});
    const url = new URL(request.url);

    if (url.pathname === "/health" && request.method === "GET") {
      return json({
        ok: true,
        route: ROUTE,
        locationId: C.locationId,
        admins: Object.keys(ADMINS),
        linkCalendars: C.linkCalendars,
        requiredTag: C.requiredTag || null,
        altaRoute: ALTA_ROUTE,
        altaTag: C.altaTag || null,
        welcome: C.welcome,
        companyId: C.companyId ? "configurado" : "falta",
        secret: C.secret ? "configurado" : "falta",
        token: C.token ? "configurado" : "falta",
      });
    }
    if (url.pathname === ELIGIBILITY_ROUTE && request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: { ...CORS, "access-control-allow-methods": "GET, OPTIONS", "access-control-allow-headers": "accept", "access-control-max-age": "600" },
      });
    }
    if (url.pathname === ELIGIBILITY_ROUTE && request.method === "GET") {
      return eligibility(request, url, C);
    }
    if (url.pathname === ALTA_ROUTE && request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          ...CORS,
          "access-control-allow-methods": "POST, OPTIONS",
          "access-control-allow-headers": "content-type, x-ilatek-token",
          "access-control-max-age": "600",
        },
      });
    }
    if (url.pathname === ALTA_ROUTE && request.method === "POST") return altaHandler(request, C);
    if (url.pathname !== ROUTE) return json({ ok: false, code: "NOT_FOUND", message: `Ruta desconocida: ${url.pathname}` }, 404);
    if (request.method !== "POST") return json({ ok: false, code: "METHOD_NOT_ALLOWED", message: "Solo POST." }, 405);
    return createUserHandler(request, C);
  },
};
