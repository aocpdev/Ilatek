// Genera el portal de operaciones (ilatekpr.com/admin/) a partir del bloque
// único del formulario. El bloque es la fuente: se edita allí y se vuelve a
// correr este script; la página no se toca a mano.
//
//   node tools/build-new-team-member.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = "documentacion/bloques/alta-usuario-form.html";
const OUT = "admin/index.html";

const bloque = fs.readFileSync(path.join(ROOT, SRC), "utf8").trim();
if (!bloque.includes('id="ilau-alta"')) {
  console.error(`El bloque ${SRC} no contiene la sección #ilau-alta.`);
  process.exit(1);
}

const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow,noarchive">
<meta name="theme-color" content="#213d8e">
<title>Operaciones · Ilatek Property Solution</title>
<style>
  :root{--ink:#11164b;--muted:#5b6380;--line:#dbe2f1;--blue:#213d8e;--soft:#eef3ff}
  *{box-sizing:border-box}
  html,body{margin:0;min-height:100dvh;background:#f5f7fd;color:var(--ink);font-family:Inter,Arial,sans-serif}
  a{color:var(--blue)}

  /* puerta */
  #iatk-gate{min-height:100dvh;display:grid;place-items:center;padding:24px}
  #iatk-gate[hidden]{display:none}
  .iatk-card{width:100%;max-width:380px;background:#fff;border:1px solid var(--line);border-radius:16px;padding:26px;box-shadow:0 10px 30px rgba(17,22,75,.06)}
  .iatk-card h1{margin:0 0 6px;font-size:1.15rem}
  .iatk-card p{margin:0 0 16px;color:var(--muted);font-size:.88rem;line-height:1.5}
  .iatk-card label{display:block;font-size:.8rem;font-weight:700;margin-bottom:6px}
  .iatk-card input{width:100%;min-height:46px;padding:8px 12px;border:1px solid var(--line);border-radius:10px;font-size:.95rem}
  .iatk-card button{width:100%;margin-top:12px;min-height:46px;border:0;border-radius:10px;background:var(--blue);color:#fff;font-weight:700;cursor:pointer}
  #iatk-gate-msg{min-height:18px;margin:10px 0 0;color:#b33b39;font-size:.82rem}

  /* portal */
  #iatk-app[hidden]{display:none}
  .iatk-top{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 22px;background:#fff;border-bottom:1px solid var(--line)}
  .iatk-brand{font-weight:800;letter-spacing:-.01em}
  .iatk-brand small{display:block;font-weight:500;color:var(--muted);font-size:.72rem;letter-spacing:.04em;text-transform:uppercase}
  .iatk-out{border:1px solid var(--line);background:#fff;border-radius:8px;padding:7px 12px;font-size:.8rem;font-weight:700;cursor:pointer;color:var(--muted)}
  .iatk-shell{display:grid;grid-template-columns:224px minmax(0,1fr);gap:0;min-height:calc(100dvh - 61px)}
  .iatk-nav{border-right:1px solid var(--line);background:#fff;padding:16px 12px;display:flex;flex-direction:column;gap:4px}
  .iatk-nav span{font-size:.7rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);padding:10px 10px 6px}
  .iatk-nav a{display:block;padding:10px 12px;border-radius:10px;text-decoration:none;color:var(--ink);font-size:.9rem;font-weight:600}
  .iatk-nav a[aria-current="page"]{background:var(--soft);color:var(--blue)}
  .iatk-nav a[aria-disabled="true"]{color:#9aa2bb;cursor:not-allowed}
  .iatk-nav a[aria-disabled="true"]::after{content:"pronto";float:right;font-size:.62rem;text-transform:uppercase;letter-spacing:.06em;color:#b6bccd}
  .iatk-main{padding:8px 22px 28px;min-width:0;overflow-x:hidden}
  .iatk-main > .iatk-head{max-width:780px;margin:18px auto 0}
  .iatk-head h2{margin:0 0 4px;font-size:1.25rem}
  .iatk-head p{margin:0;color:var(--muted);font-size:.9rem}

  /* el bloque del formulario vive dentro del portal: alto natural, sin 100dvh */
  #ilau-alta{height:auto;max-height:none;overflow:visible;margin:0 auto;padding:12px 0 0;max-width:780px}
  #ilau-alta .ilau-step.is-active{overflow:visible}

  @media (max-width:820px){
    .iatk-shell{grid-template-columns:1fr}
    .iatk-nav{flex-direction:row;overflow-x:auto;border-right:0;border-bottom:1px solid var(--line);padding:10px}
    .iatk-nav span{display:none}
    .iatk-nav a{white-space:nowrap}
    .iatk-main{padding:6px 12px 20px}
  }
</style>
</head>
<body>

<section id="iatk-gate">
  <form class="iatk-card" id="iatk-gate-form" novalidate>
    <h1>Operaciones Ilatek</h1>
    <p>Portal interno. Entra con la clave que entrega la oficina; se guarda solo en esta pestaña.</p>
    <label for="iatk-key">Clave</label>
    <input id="iatk-key" type="password" autocomplete="off" required>
    <button type="submit">Entrar</button>
    <p id="iatk-gate-msg" role="alert"></p>
  </form>
</section>

<div id="iatk-app" hidden>
  <header class="iatk-top">
    <div class="iatk-brand">Operaciones <small>Ilatek Property Solution</small></div>
    <button type="button" class="iatk-out" id="iatk-out">Salir</button>
  </header>
  <div class="iatk-shell">
    <nav class="iatk-nav" aria-label="Módulos">
      <span>Equipo</span>
      <a href="#new-team-member" aria-current="page">New Team Member</a>
      <a href="#" aria-disabled="true" tabindex="-1">Contactos</a>
      <a href="#" aria-disabled="true" tabindex="-1">Tareas</a>
      <a href="#" aria-disabled="true" tabindex="-1">Usuarios</a>
    </nav>
    <main class="iatk-main">
      <div class="iatk-head">
        <h2>New Team Member</h2>
        <p>Crea el usuario, deja el contacto con sus datos y su nota en GHL.</p>
      </div>
      ${bloque}
    </main>
  </div>
</div>

<script>
(function () {
  var CLAVE = 'ilatek-admin-token';
  var puerta = document.getElementById('iatk-gate');
  var app = document.getElementById('iatk-app');
  var form = document.getElementById('iatk-gate-form');
  var input = document.getElementById('iatk-key');
  var msg = document.getElementById('iatk-gate-msg');

  function abrir(clave) {
    window.ILATEK_ADMIN_TOKEN = clave;
    try { sessionStorage.setItem(CLAVE, clave); } catch (e) {}
    puerta.hidden = true;
    app.hidden = false;
  }

  var guardada = '';
  try { guardada = sessionStorage.getItem(CLAVE) || ''; } catch (e) {}
  if (guardada) abrir(guardada);

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = String(input.value || '').trim();
    if (!v) { msg.textContent = 'Escribe la clave.'; return; }
    msg.textContent = '';
    abrir(v);
  });

  document.getElementById('iatk-out').addEventListener('click', function () {
    window.ILATEK_ADMIN_TOKEN = '';
    try { sessionStorage.removeItem(CLAVE); } catch (e) {}
    app.hidden = true;
    puerta.hidden = false;
    input.value = '';
  });
})();
</script>
</body>
</html>
`;

fs.mkdirSync(path.join(ROOT, "admin"), { recursive: true });
fs.writeFileSync(path.join(ROOT, OUT), html);
const viejo = path.join(ROOT, "admin/new-team-member.html");
if (fs.existsSync(viejo)) fs.rmSync(viejo);
console.log(`${OUT} generado (${(html.length / 1024).toFixed(1)} KB) desde ${SRC}`);
