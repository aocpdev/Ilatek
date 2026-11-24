#!/usr/bin/env node
/**
 * Embed de agenda para /cotizacion-techos: solo el menú global y el calendario.
 *
 * El menú se copia tal cual desde componentes/ghl-nav-embed.html, que es la
 * misma fuente que usa el shell de las landings. Así el embed nunca se queda con
 * un menú viejo: se regenera con `npm run build:agenda`.
 *
 * Sin hero de marketing, sin secciones, sin footer: la página es para agendar.
 * Los enlaces internos usan el token de Custom Values y data-ilatek-path, igual
 * que el resto del sitio.
 */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './site-paths.mjs';

const NAV = 'componentes/ghl-nav-embed.html';
const OUT = 'cotizacion-techos/ghl-cotizacion-techos-embed.html';
const CALENDARIO = 'wM8KQhsYjEQAo0HbNGIh'; // calendario de Techos en GHL
const TOKEN = '{{custom_values.website_url}}';

const nav = fs.readFileSync(path.join(ROOT, NAV), 'utf8').trim();

const html = `<!-- ILATEK · /cotizacion-techos — embed de agenda.
     Solo menú global + calendario de Techos: nada más, para agendar sin distracciones.
     El menú va copiado de ${NAV}; se regenera con \`npm run build:agenda\`. -->
<link rel="canonical" href="https://${TOKEN}/cotizacion-techos">

${nav}

<div data-ilatek-header-space aria-hidden="true" style="height:92px;flex:none"></div>

<section id="ilatek-agenda-techos" aria-labelledby="ilatek-agenda-techos-title">
<style>
#ilatek-agenda-techos{--navy:#11164b;--blue:#213d8e;--muted:#5b6478;--line:#e3e8f2;--paper:#fff;
  background:linear-gradient(180deg,#f5f8ff 0%,#ffffff 42%);
  padding:clamp(28px,5vw,56px) 20px clamp(40px,6vw,72px);
  font-family:Outfit,Manrope,'Segoe UI',system-ui,sans-serif;color:var(--navy)}
#ilatek-agenda-techos *{box-sizing:border-box}
#ilatek-agenda-techos .ila-shell{width:min(100%,940px);margin:0 auto}
#ilatek-agenda-techos header{max-width:640px;margin:0 auto clamp(20px,3vw,30px);text-align:center}
#ilatek-agenda-techos .ila-eyebrow{display:inline-flex;align-items:center;gap:8px;color:var(--blue);
  font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}
#ilatek-agenda-techos .ila-eyebrow:before{content:'';width:8px;height:8px;border-radius:50%;background:#00b94f;box-shadow:0 0 0 5px rgba(0,185,79,.12)}
#ilatek-agenda-techos h1{margin:14px 0 0;font-size:clamp(28px,4vw,44px);line-height:1.08;letter-spacing:-.03em}
#ilatek-agenda-techos header p{margin:14px auto 0;max-width:560px;color:var(--muted);font-size:16px;line-height:1.6}
#ilatek-agenda-techos .ila-box{background:var(--paper);border:1px solid var(--line);border-radius:22px;
  padding:clamp(10px,2vw,18px);box-shadow:0 18px 44px rgba(17,22,75,.08)}
#ilatek-agenda-techos .ila-embed{width:100%;min-height:720px;border-radius:14px;overflow:hidden;background:#fff}
#ilatek-agenda-techos iframe{display:block;width:100%;height:720px;border:0}
#ilatek-agenda-techos .ila-fallback{margin:16px 2px 0;font-size:13px;color:var(--muted);text-align:center}
#ilatek-agenda-techos .ila-fallback a{color:var(--blue);font-weight:700}
@media(max-width:640px){
  #ilatek-agenda-techos{padding-top:20px}
  #ilatek-agenda-techos .ila-embed{min-height:640px}
  #ilatek-agenda-techos iframe{height:640px}
}
</style>
<div class="ila-shell">
  <header>
    <span class="ila-eyebrow">Agenda tu inspección</span>
    <h1 id="ilatek-agenda-techos-title">Agenda tu inspección de techos</h1>
    <p>Elige el día y la hora que te convengan. Atendemos {{custom_values.business__county_name}} y los 78 municipios de Puerto Rico.</p>
  </header>
  <div class="ila-box">
    <div class="ila-embed">
      <iframe src="https://link.msgsndr.com/widget/booking/${CALENDARIO}" allow="payment" scrolling="no"
        title="Agenda tu inspección de techos — Ilatek Techos" id="${CALENDARIO}_ilatek_agenda" loading="eager"></iframe>
    </div>
    <p class="ila-fallback">¿No carga el calendario? <a href="https://${TOKEN}/cotizacion" data-ilatek-path="/cotizacion">Solicita tu cotización aquí</a>.</p>
  </div>
</div>
<script src="https://link.msgsndr.com/js/form_embed.js" type="text/javascript"></script>
<script>
/* El widget avisa su alto real; lo aplicamos para evitar scroll interno en móvil. */
(function(){
  var box=document.getElementById('ilatek-agenda-techos');
  if(!box)return;
  var frame=box.querySelector('iframe');
  window.addEventListener('message',function(e){
    if(!frame||e.source!==frame.contentWindow)return;
    var data=e.data; if(typeof data==='string'){try{data=JSON.parse(data)}catch(_){return}}
    if(!data||typeof data!=='object'||data.height==null)return;
    var h=parseInt(data.height,10); if(!h||h<240)return;
    frame.style.height=h+'px';
    var embed=frame.parentElement; if(embed)embed.style.minHeight=h+'px';
  },false);
})();
</script>
</section>
`;

const out = path.join(ROOT, OUT);
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);
console.log(`${OUT}: ${html.length} bytes · menú ${nav.length} bytes · calendario ${CALENDARIO}`);
