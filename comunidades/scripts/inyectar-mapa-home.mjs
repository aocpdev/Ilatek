// Renderiza la seccion "Mapa de comunidades" del Home y la inyecta en
// home/es/landing-pages/ghl-home-multiservicios.html, entre el directorio de
// cobertura (seccion 7) y las resenas (seccion 8).
//
// El bloque va delimitado por marcadores, asi que volver a ejecutarlo
// reemplaza la seccion en vez de duplicarla.
//
//   node scripts/inyectar-mapa-home.mjs
//
// Fuente de datos: data/mapa-comunidades.json (generado por
// scripts/generar-mapa-comunidades.mjs).
//
// Renderizado: MapLibre GL (sin token) sobre los mosaicos de OpenFreeMap.
// El token publico de Mapbox que se uso antes esta revocado (401), asi que
// el mapa no puede depender de credenciales: el sitio tiene que funcionar
// sin ningun secreto en el cliente.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const HOME = path.join(root, 'home', 'es', 'landing-pages', 'ghl-home-multiservicios.html');
const START = '<!-- ILATEK:MAPA-COMUNIDADES:START -->';
const END = '<!-- ILATEK:MAPA-COMUNIDADES:END -->';

const data = JSON.parse(fs.readFileSync(path.join(root, 'comunidades', 'data', 'mapa-comunidades.json'), 'utf8'));

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const norm = s => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
// JSON incrustado en un <script>: '<' no puede aparecer sin escapar.
const jsonSafe = value => JSON.stringify(value).replace(/</g, '\\u003c');

const municipalities = [];
const communities = [];
for (const region of data.regions) {
  for (const muni of region.municipalities) {
    municipalities.push({
      n: muni.name, s: muni.slug, r: region.slug,
      l: muni.lat, g: muni.lon,
      k: muni.communitiesKnown, p: muni.communitiesPublished,
    });
    for (const com of muni.communities) {
      if (!com.published) continue;
      communities.push({
        n: com.name, m: muni.name, ms: muni.slug, u: com.url,
        r: region.slug, l: com.lat, g: com.lon, a: com.accuracy,
      });
    }
  }
}

// Lista estatica: es la via accesible y la que ven los rastreadores.
const groups = data.regions.map(region => {
  const items = region.municipalities
    .map(muni => {
      const links = muni.communities.filter(c => c.published)
        .map(c => `<li class="ilk-com__item" data-region="${esc(region.slug)}" data-muni="${esc(muni.slug)}" data-name="${esc(norm(`${c.name} ${muni.name}`))}"><a class="ilk-com__link" href="${esc(c.url)}">${esc(c.name)}</a><span class="ilk-com__muni">${esc(muni.name)}</span></li>`)
        .join('');
      if (!links) return '';
      return `<li class="ilk-com__muni" data-region="${esc(region.slug)}"><span class="ilk-com__muni-tit">${esc(muni.name)}</span><ul class="ilk-com__ul">${links}</ul></li>`;
    })
    .join('');
  if (!items) return '';
  return `<article class="ilk-com__grupo" data-region="${esc(region.slug)}"><h3 class="ilk-com__region" data-es="${esc(region.label)}" data-en="${esc(region.labelEn || region.label)}">${esc(region.label)}</h3><ul class="ilk-com__ul-muni">${items}</ul></article>`;
}).join('');

const chips = [{ slug: 'todas', label: 'Todas', labelEn: 'All' }].concat(
  data.regions.map(r => ({ slug: r.slug, label: r.label, labelEn: r.labelEn || r.label })),
).map((r, i) => `<button class="ilk-com__chip${i === 0 ? ' is-active' : ''}" type="button" data-region="${esc(r.slug)}" aria-pressed="${i === 0 ? 'true' : 'false'}" data-es="${esc(r.label)}" data-en="${esc(r.labelEn)}">${esc(r.label)}</button>`).join('');

const published = communities.length;
const exact = communities.filter(c => c.a === 'exacta').length;

const section = `${START}
  <!-- ═══ 7b. MAPA DE COMUNIDADES · landings por comunidad (comunidades.ilatekpr.com) ═══
    Sección generada por comunidades/scripts/inyectar-mapa-home.mjs a partir de
    comunidades/data/mapa-comunidades.json. MapLibre GL se carga bajo demanda
    sobre los mosaicos de OpenFreeMap (sin token ni credenciales); la lista de
    comunidades es siempre visible (rastreadores y sin JS). -->
  <section id="ilatek-mapa-comunidades" class="ilk-com" aria-labelledby="ilk-com-titulo">
    <style>
      #ilatek-mapa-comunidades{--ink:#11164b;--ink-deep:#0b103d;--blue:#213d8e;--green:#00b94f;--line:#dbe2f1;--mist:#f4f7fc;--muted:#5b6380;width:100vw;max-width:none;margin-inline:calc(50% - 50vw);overflow:hidden;background:linear-gradient(180deg,var(--mist) 0%,#fff 78%);color:var(--ink);font-family:Manrope,Arial,sans-serif;isolation:isolate;padding:var(--ms-pad) 0;padding-inline:calc((100vw - 100%) / 2)}
      #ilatek-mapa-comunidades *{box-sizing:border-box}
      #ilatek-mapa-comunidades a{color:inherit;text-decoration:none}
      #ilatek-mapa-comunidades ul{list-style:none;margin:0;padding:0}
      #ilatek-mapa-comunidades [hidden]{display:none!important}
      .ilk-com__shell{width:min(100% - 40px,1400px);margin:auto}
      .ilk-com__head{display:grid;grid-template-columns:.95fr 1.05fr;gap:60px;align-items:end;margin-bottom:34px}
      .ilk-com__eyebrow{display:inline-flex;align-items:center;gap:8px;color:var(--blue);font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase}
      .ilk-com__eyebrow:before{content:'';width:8px;height:8px;border-radius:50%;background:var(--green);box-shadow:0 0 0 5px rgba(0,185,79,.14)}
      .ilk-com__head h2{margin:14px 0 0;font-family:Outfit,Manrope,sans-serif;font-size:clamp(38px,4.4vw,62px);font-weight:800;line-height:1.03;letter-spacing:-.055em;text-wrap:balance}
      .ilk-com__head h2 em{color:var(--green);font-style:normal}
      .ilk-com__head p{max-width:560px;margin:0;color:var(--muted);font-size:17px;line-height:1.68}
      .ilk-com__head p strong{color:var(--ink);font-weight:700}
      .ilk-com__cuenta{margin-top:14px !important;display:inline-flex;align-items:baseline;gap:8px;padding:8px 16px;border:1px solid var(--line);border-radius:999px;background:#fff;font-size:14px !important}
      .ilk-com__cuenta b{font-family:Outfit,Manrope,sans-serif;font-size:20px;color:var(--green)}
      .ilk-com__filtros{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:20px}
      .ilk-com__chip{padding:9px 16px;border:1px solid var(--line);border-radius:999px;background:#fff;color:var(--ink);font:700 13px/1.2 Manrope,Arial,sans-serif;cursor:pointer;transition:background .2s,border-color .2s,color .2s}
      .ilk-com__chip:hover,.ilk-com__chip:focus-visible{border-color:var(--green)}
      .ilk-com__chip.is-active{background:var(--ink);border-color:var(--ink);color:#fff}
      .ilk-com__buscar{position:relative;margin-left:auto;min-width:min(100%,320px)}
      .ilk-com__buscar input{width:100%;height:44px;padding:0 16px 0 42px;border:1px solid var(--line);border-radius:999px;background:#fff;color:var(--ink);font:600 15px/1 Manrope,Arial,sans-serif;outline:0;transition:border-color .2s,box-shadow .2s}
      .ilk-com__buscar input:focus{border-color:var(--green);box-shadow:0 0 0 4px rgba(0,185,79,.12)}
      .ilk-com__buscar svg{position:absolute;left:15px;top:50%;transform:translateY(-50%);width:18px;height:18px;color:var(--muted);pointer-events:none}
      .ilk-com__mapa{position:relative;height:clamp(360px,52vh,560px);border:1px solid var(--line);border-radius:22px;overflow:hidden;background:var(--mist);box-shadow:0 24px 60px rgba(16,25,75,.1)}
      .ilk-com__lienzo{position:absolute;inset:0}
      .ilk-com__mapa-estado{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;margin:0;padding:20px;color:var(--muted);font-size:.95rem;text-align:center;background:var(--mist)}
      .ilk-com__mapa.ilk-ok .ilk-com__mapa-estado{display:none}
      .ilk-com__punto{width:12px;height:12px;border-radius:50%;background:var(--blue);border:2px solid #fff;box-shadow:0 0 0 4px rgba(33,61,142,.18);cursor:pointer;padding:0}
      .ilk-com__pin{width:22px;height:22px;display:grid;place-items:center;color:var(--green);cursor:pointer;padding:0;background:none;border:0}
      .ilk-com__pin svg{width:22px;height:22px;filter:drop-shadow(0 2px 3px rgba(0,0,0,.3))}
      .ilk-com__mapa .maplibregl-ctrl-group{border-radius:12px;overflow:hidden;box-shadow:0 6px 18px rgba(16,25,75,.18)}
      .ilk-com__mapa .maplibregl-ctrl-attrib{font-size:11px}
      .ilk-com__popup .maplibregl-popup-content{border-radius:14px;padding:14px 16px;font:500 14px/1.5 Manrope,Arial,sans-serif;color:var(--ink);box-shadow:0 18px 40px rgba(16,25,75,.22)}
      .ilk-com__popup .maplibregl-popup-content strong{display:block;margin-bottom:6px;font-family:Outfit,Manrope,sans-serif;font-size:16px}
      .ilk-com__popup .maplibregl-popup-content a{color:var(--blue);font-weight:700}
      .ilk-com__popup .maplibregl-popup-content a:hover,.ilk-com__popup .maplibregl-popup-content a:focus-visible{text-decoration:underline}
      .ilk-com__popup ul{list-style:none;margin:8px 0 0;padding:0;display:grid;gap:4px}
      .ilk-com__popup .ilk-com__nota{color:var(--muted);font-size:12px}
      .ilk-com__lista{margin-top:34px;display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px}
      .ilk-com__grupo{background:#fff;border:1px solid var(--line);border-radius:20px;padding:22px 24px;box-shadow:0 10px 26px rgba(16,25,75,.06)}
      .ilk-com__region{margin:0 0 14px;font-family:Outfit,Manrope,sans-serif;font-size:19px;font-weight:800;letter-spacing:-.02em}
      .ilk-com__ul-muni{display:grid;gap:12px}
      .ilk-com__muni-tit{display:block;font-size:12px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
      .ilk-com__ul{margin-top:6px;display:grid;gap:4px}
      .ilk-com__item{display:flex;align-items:baseline;justify-content:space-between;gap:10px;padding:7px 10px;border-radius:10px}
      .ilk-com__item:hover{background:var(--mist)}
      .ilk-com__link{color:var(--blue);font-weight:700;font-size:15px}
      .ilk-com__link:hover,.ilk-com__link:focus-visible{text-decoration:underline}
      .ilk-com__muni{color:var(--muted);font-size:13px;white-space:nowrap}
      .ilk-com__vacio{grid-column:1/-1;margin:0;color:var(--muted);text-align:center;padding:20px 0}
      @media(max-width:980px){.ilk-com__head{grid-template-columns:1fr;gap:20px}.ilk-com__buscar{margin-left:0;width:100%}}
      @media(max-width:560px){.ilk-com__head h2{font-size:clamp(32px,9vw,44px)}.ilk-com__head p{font-size:15px}.ilk-com__mapa{height:340px;border-radius:16px}.ilk-com__lista{grid-template-columns:1fr}}
    </style>

    <div class="ilk-com__shell">
      <header class="ilk-com__head il-reveal">
        <div>
          <span class="ilk-com__eyebrow" data-es="Comunidades atendidas" data-en="Communities we serve">Comunidades atendidas</span>
          <h2 id="ilk-com-titulo" data-en-key="comTitle">Encuentra tu <em>comunidad</em> en el mapa.</h2>
        </div>
        <p data-en-key="comP">Explora las <strong>comunidades de Puerto Rico</strong> que ya tienen página de Ilatek para <strong>techos y limpieza</strong>. Elige tu comunidad y cotiza sin llamadas.</p>
        <p class="ilk-com__cuenta"><b>${published}</b> <span data-es="comunidades con página publicada" data-en="communities with a published page">comunidades con página publicada</span></p>
      </header>

      <div class="ilk-com__filtros">
        <div role="group" aria-label="Filtrar comunidades por región" data-attr="aria-label" data-es="Filtrar comunidades por región" data-en="Filter communities by region" id="ilk-com-chips">${chips}</div>
        <div class="ilk-com__buscar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="7"></circle><path d="m16.2 16.2 4 4" stroke-linecap="round"></path></svg>
          <input id="ilk-com-buscar" type="search" inputmode="search" autocomplete="off" placeholder="Busca tu comunidad" aria-label="Buscar una comunidad de Puerto Rico" data-attr="placeholder" data-attr2="aria-label" data-es="Busca tu comunidad" data-en="Search your community" data-es2="Buscar una comunidad de Puerto Rico" data-en2="Search a Puerto Rico community">
        </div>
      </div>

      <div class="ilk-com__mapa" id="ilk-com-mapa" role="group" aria-label="Mapa de comunidades de Puerto Rico" data-attr="aria-label" data-es="Mapa de comunidades de Puerto Rico" data-en="Map of Puerto Rico communities">
        <div class="ilk-com__lienzo" id="ilk-com-lienzo"></div>
        <p class="ilk-com__mapa-estado" id="ilk-com-mapa-estado">Cargando mapa…</p>
      </div>

      <div class="ilk-com__lista" id="ilk-com-lista">
        ${groups}
        <p class="ilk-com__vacio" id="ilk-com-vacio" hidden data-es="No encontramos esa comunidad. Prueba con el nombre del municipio." data-en="We couldn’t find that community. Try the municipality name.">No encontramos esa comunidad. Prueba con el nombre del municipio.</p>
      </div>
    </div>

    <script>
    (function(){
      var root=document.getElementById('ilatek-mapa-comunidades'); if(!root)return;
      var MAPLIBRE_JS='https://cdn.jsdelivr.net/npm/maplibre-gl@4.7.1/dist/maplibre-gl.js';
      var MAPLIBRE_CSS='https://cdn.jsdelivr.net/npm/maplibre-gl@4.7.1/dist/maplibre-gl.css';
      var ESTILO='https://tiles.openfreemap.org/styles/positron';
      var MUNI=${jsonSafe(municipalities)};
      var COM=${jsonSafe(communities)};
      var vacio=root.querySelector('#ilk-com-vacio');
      var input=root.querySelector('#ilk-com-buscar');
      var chips=root.querySelector('#ilk-com-chips');
      var contenedor=root.querySelector('#ilk-com-mapa');
      var lienzo=root.querySelector('#ilk-com-lienzo');
      var estado=root.querySelector('#ilk-com-mapa-estado');
      var region='todas', mapa=null, cargada=false, marcadores={};
      var estadoMapa='cargando';

      function norm(v){return String(v||'').normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toLowerCase().trim()}
      function esEn(){return window.__ilatekLang==='en'}
      function t(es,en){return esEn()?en:es}
      function visible(com){
        if(region!=='todas'&&com.r!==region)return false;
        var q=norm(input&&input.value);
        if(!q)return true;
        return norm(com.n+' '+com.m).indexOf(q)>-1;
      }
      /* El punto del municipio sigue visible si el texto calza con el municipio
         o con alguna de sus comunidades: buscar "punta del mar" no debe
         apagar el punto de Rincón. */
      function visibleMuni(m){
        if(region!=='todas'&&m.r!==region)return false;
        var q=norm(input&&input.value);
        if(!q)return true;
        if(norm(m.n).indexOf(q)>-1)return true;
        return COM.some(function(c){return c.ms===m.s&&norm(c.n+' '+c.m).indexOf(q)>-1});
      }
      function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}

      /* ---- Contenido de los popups, en el idioma activo ----
         Se construye con nodos del DOM: ningun texto entra como HTML. */
      function enlace(texto,url){
        var a=document.createElement('a');
        a.href=url;a.textContent=texto;
        return a;
      }
      function listaNodos(items){
        var ul=document.createElement('ul');
        items.forEach(function(par){
          var li=document.createElement('li');
          li.appendChild(par);
          ul.appendChild(li);
        });
        return ul;
      }
      function domMuni(m){
        var frag=document.createDocumentFragment();
        var h=document.createElement('strong');
        h.textContent=m.n;
        frag.appendChild(h);
        var propias=COM.filter(function(c){return c.ms===m.s});
        if(propias.length){
          frag.appendChild(listaNodos(propias.map(function(c){return enlace(c.n,c.u)})));
        }else{
          var nota=document.createElement('span');
          nota.className='ilk-com__nota';
          nota.textContent=m.k+' '+t('comunidades identificadas','communities identified');
          frag.appendChild(nota);
        }
        return frag;
      }
      function domCom(c){
        var frag=document.createDocumentFragment();
        var h=document.createElement('strong');
        h.textContent=c.n;
        frag.appendChild(h);
        var nota=document.createElement('span');
        nota.className='ilk-com__nota';
        nota.textContent=c.m;
        frag.appendChild(nota);
        /* Solo los dos servicios: el enlace directo a la pagina de la comunidad
           queda en la lista HTML de la seccion, que siempre esta visible. */
        frag.appendChild(listaNodos([
          enlace(t('Sellado de techos','Roof sealing'),c.u+'/sellado-de-techos'),
          enlace(t('Limpieza','Cleaning'),c.u+'/limpieza')
        ]));
        return frag;
      }
      function etiquetaMuni(m){return t('Ver comunidades de ','View communities in ')+m.n}
      function etiquetaCom(c){return t('Ver ','View ')+c.n+', '+c.m}

      /* ---- Lista: filtrado por region y busqueda (siempre visible, sin depender del mapa). ---- */
      function pintarLista(){
        var items=root.querySelectorAll('.ilk-com__item');
        var total=0;
        items.forEach(function(el){
          var ok=(region==='todas'||el.getAttribute('data-region')===region)&&(!norm(input.value)||el.getAttribute('data-name').indexOf(norm(input.value))>-1);
          el.hidden=!ok; if(ok)total++;
        });
        root.querySelectorAll('.ilk-com__grupo').forEach(function(g){
          var visibles=g.querySelectorAll('.ilk-com__item:not([hidden])').length;
          var vacioGrupo=g.querySelectorAll('.ilk-com__muni').length;
          g.hidden=visibles===0&&vacioGrupo>0;
        });
        vacio.hidden=total>0;
      }

      function aplicar(){
        pintarLista();
        if(!mapa)return;
        /* Los marcadores se quedan en el mapa y se ocultan con display:none:
           quitarlos y volverlos a poner los reinicia y cerraba el popup. */
        MUNI.forEach(function(m){
          var mk=marcadores[m.s]; if(!mk)return;
          mk.el.style.display=visibleMuni(m)?'':'none';
        });
        COM.forEach(function(c){
          var mk=marcadores['c:'+c.u]; if(!mk)return;
          mk.el.style.display=visible(c)?'':'none';
        });
      }

      chips.addEventListener('click',function(e){
        var btn=e.target.closest('.ilk-com__chip'); if(!btn)return;
        region=btn.getAttribute('data-region');
        chips.querySelectorAll('.ilk-com__chip').forEach(function(c){
          var on=c===btn;
          c.classList.toggle('is-active',on);
          c.setAttribute('aria-pressed',on?'true':'false');
        });
        aplicar();
      });
      if(input)input.addEventListener('input',aplicar);
      pintarLista();

      function mensajeMapa(){
        if(estadoMapa==='listo')return '';
        if(estadoMapa==='error')return t('Mapa no disponible. Usa la lista de comunidades.','Map unavailable. Use the communities list.');
        return t('Cargando mapa…','Loading map…');
      }
      function pintarEstado(){
        estado.textContent=mensajeMapa();
      }
      function fallback(motivo){
        contenedor.classList.remove('ilk-ok');
        mapa=null;cargada=false;estadoMapa='error';
        pintarEstado();
        if(motivo)console.warn('[ilatek-mapa-comunidades]',motivo);
      }
      function cargarScript(src,onload,onerror){
        var s=document.createElement('script');
        s.src=src;s.async=true;s.crossOrigin='anonymous';
        s.integrity='sha384-SYKAG6cglRMN0RVvhNeBY0r3FYKNOJtznwA0v7B5Vp9tr31xAHsZC0DqkQ/pZDmj';
        s.onload=onload;s.onerror=onerror;document.head.appendChild(s);
      }
      function cargarCss(href){
        var l=document.createElement('link');
        l.rel='stylesheet';l.href=href;l.crossOrigin='anonymous';
        l.integrity='sha384-MinO0mNliZ3vwppuPOUnGa+iq619pfMhLVUXfC4LHwSCvF9H+6P/KO4Q7qBOYV5V';
        document.head.appendChild(l);
      }
      function popup(contenido){
        return new maplibregl.Popup({offset:16,closeButton:true,maxWidth:'280px',className:'ilk-com__popup'}).setDOMContent(contenido);
      }
      function puntoMuni(m){
        var el=document.createElement('button');
        el.type='button';el.className='ilk-com__punto';
        el.setAttribute('aria-label',etiquetaMuni(m));
        return el;
      }
      function puntoCom(c){
        var el=document.createElement('button');
        el.type='button';el.className='ilk-com__pin';
        el.setAttribute('aria-label',etiquetaCom(c));
        el.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" fill="currentColor" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>';
        return el;
      }

      function iniciar(){
        if(!window.maplibregl){return fallback('maplibregl no cargo')}
        try{
          mapa=new maplibregl.Map({
            container:lienzo,
            style:ESTILO,
            center:[-66.45,18.15],zoom:7.1,
            attributionControl:{compact:true}
          });
          mapa.addControl(new maplibregl.NavigationControl({showCompass:false}),'top-right');
          mapa.scrollZoom.disable();
          mapa.on('load',function(){
            cargada=true;estadoMapa='listo';
            contenedor.classList.add('ilk-ok');
            pintarEstado();
            MUNI.forEach(function(m){
              try{
                if(m.l==null||m.g==null)return;
                var el=puntoMuni(m);
                var pop=popup(domMuni(m));
                var marker=new maplibregl.Marker({element:el}).setLngLat([m.g,m.l]).setPopup(pop).addTo(mapa);
                /* MapLibre pisa el aria-label al hacer addTo(): se fija despues. */
                el.setAttribute('aria-label',etiquetaMuni(m));
                el.title=etiquetaMuni(m);
                marcadores[m.s]={marker:marker,el:el,pop:pop,build:function(){return domMuni(m)},tipo:'muni',dato:m};
              }catch(err){console.error('[ilatek-mapa-comunidades] municipio',m&&m.n,err&&err.message)}
            });
            COM.forEach(function(c){
              try{
                if(c.a!=='exacta'||c.l==null||c.g==null)return;
                var el=puntoCom(c);
                var pop=popup(domCom(c));
                var marker=new maplibregl.Marker({element:el,anchor:'bottom'}).setLngLat([c.g,c.l]).setPopup(pop).addTo(mapa);
                el.setAttribute('aria-label',etiquetaCom(c));
                el.title=etiquetaCom(c);
                marcadores['c:'+c.u]={marker:marker,el:el,pop:pop,build:function(){return domCom(c)},tipo:'com',dato:c};
              }catch(err){console.error('[ilatek-mapa-comunidades] comunidad',c&&c.n,err&&err.message)}
            });
            aplicar();
          });
          mapa.on('error',function(e){
            if(!cargada)fallback(e&&e.error?e.error.message:'error de mapa');
          });
        }catch(err){fallback(err&&err.message)}
      }

      function cargar(){
        if(cargada&&mapa)return;
        cargarCss(MAPLIBRE_CSS);
        cargarScript(MAPLIBRE_JS,iniciar,function(){fallback('no se pudo cargar maplibre-gl.js')});
      }

      /* El idioma del sitio puede cambiar en caliente: los popups y las
         etiquetas de los marcadores se reconstruyen con el texto activo. */
      window.addEventListener('ilatek:lang',function(){
        Object.keys(marcadores).forEach(function(key){
          var mk=marcadores[key];
          mk.pop.setDOMContent(mk.build());
          if(mk.tipo==='muni'){mk.el.setAttribute('aria-label',etiquetaMuni(mk.dato));mk.el.title=etiquetaMuni(mk.dato);}
          else {mk.el.setAttribute('aria-label',etiquetaCom(mk.dato));mk.el.title=etiquetaCom(mk.dato);}
        });
        pintarEstado();
      });

      if('IntersectionObserver' in window){
        var obs=new IntersectionObserver(function(entries){
          if(entries.some(function(e){return e.isIntersecting})){obs.disconnect();cargar()}
        },{rootMargin:'250px'});
        obs.observe(contenedor);
      }else{cargar()}
    })();
    </script>
  </section>
${END}`;

const html = fs.readFileSync(HOME, 'utf8');
if (html.includes(START) && html.includes(END)) {
  const next = html.replace(new RegExp(`${START}[\\s\\S]*?${END}`), section);
  fs.writeFileSync(HOME, next, 'utf8');
  console.log('Seccion del mapa reemplazada en el Home.');
} else {
  const anchor = '  <!-- ═══ 8. RESEÑAS';
  const at = html.indexOf(anchor);
  if (at < 0) throw new Error('No se encontró el ancla de la sección 8 (reseñas) en el Home.');
  fs.writeFileSync(HOME, html.slice(0, at) + section + '\n\n' + html.slice(at), 'utf8');
  console.log('Seccion del mapa insertada en el Home antes de las reseñas.');
}
console.log(`Comunidades en el mapa: ${published} · con punto exacto: ${exact} · municipios: ${municipalities.length}`);
