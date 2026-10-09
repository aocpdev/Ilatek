// Ilatek · Techos · CSS del sistema de diseño (mismo lenguaje visual del home).
// Todas las reglas van scopeadas bajo el root de la página (__ROOT__) y usan
// prefijo `ilt-` para no colisionar con Ilatek ni con componentes de GHL.
export function pageCss(rootId) {
  const R = '#' + rootId;
  const css = [
    baseCss(),
    heroCss(),
    benefitsCss(),
    incluyeCss(),
    extraCss(),
    processCss(),
    faqCss(),
    ctaCss(),
    calendarCss(),
    responsiveCss(),
  ].join('\n');
  return css.split('__ROOT__').join(R);
}

function baseCss() {
  return `
__ROOT__{--ink:#11164b;--ink-deep:#0b103d;--blue:#213d8e;--blue-soft:#eef3ff;--green:#00b94f;--green-dark:#009640;--paper:#fff;--mist:#f4f7fc;--line:#dbe2f1;--muted:#5b6380;width:100vw;max-width:none;margin-inline:calc(50% - 50vw);overflow:hidden;background:var(--paper);color:var(--ink);font-family:Manrope,Arial,sans-serif;isolation:isolate}
__ROOT__ *{box-sizing:border-box}
__ROOT__ a{color:inherit;text-decoration:none}
__ROOT__ [hidden]{display:none!important}
__ROOT__ .ilt-shell{width:min(100% - 40px,1210px);margin:auto}
__ROOT__ .ilt-display{font-family:Outfit,Manrope,sans-serif;font-weight:800;letter-spacing:-.06em}
__ROOT__ .ilt-eyebrow{display:inline-flex;align-items:center;gap:8px;color:var(--blue);font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}
__ROOT__ .ilt-eyebrow:before{content:'';width:8px;height:8px;border-radius:50%;background:var(--green);box-shadow:0 0 0 5px rgba(0,185,79,.12)}
__ROOT__ .ilt-button{display:inline-flex;align-items:center;gap:10px;padding:15px 26px;border-radius:10px;background:var(--green);color:#fff!important;font:800 14.5px/1 Manrope,Arial,sans-serif;letter-spacing:.02em;box-shadow:0 14px 30px rgba(0,185,79,.24);transition:transform .22s ease,background .22s ease,box-shadow .22s ease}
__ROOT__ .ilt-button span:last-child{display:grid;place-items:center;width:24px;height:24px;border-radius:7px;background:rgba(255,255,255,.2);font-size:13px;transition:transform .25s ease}
__ROOT__ .ilt-button:hover,__ROOT__ .ilt-button:focus-visible{background:var(--green-dark);transform:translateY(-2px);box-shadow:0 18px 36px rgba(0,185,79,.32)}
__ROOT__ .ilt-button:hover span:last-child{transform:translateX(3px)}
__ROOT__ .ilt-text-link{font-weight:800;color:var(--blue);border-bottom:2px solid var(--green)}
__ROOT__ .ilt-reveal{transition:opacity .8s cubic-bezier(.22,1,.36,1),transform .8s cubic-bezier(.22,1,.36,1)}
html.ilt-anim __ROOT__ .ilt-reveal{opacity:0;transform:translateY(26px)}
html.ilt-anim __ROOT__ .ilt-reveal.is-visible{opacity:1;transform:none}
html.ilt-anim __ROOT__ .ilt-ben-grid>article:nth-child(2),html.ilt-anim __ROOT__ .ilt-xgrid>article:nth-child(2),html.ilt-anim __ROOT__ .ilt-proc-grid>article:nth-child(2){transition-delay:.1s}
html.ilt-anim __ROOT__ .ilt-ben-grid>article:nth-child(3),html.ilt-anim __ROOT__ .ilt-xgrid>article:nth-child(3),html.ilt-anim __ROOT__ .ilt-proc-grid>article:nth-child(3){transition-delay:.2s}
html{scroll-behavior:smooth}`;
}

function heroCss() {
  return `
__ROOT__ .ilt-hero{padding:100px 0 88px;background:linear-gradient(180deg,var(--mist),var(--paper) 82%)}
__ROOT__ .ilt-hero-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:64px;align-items:center}
__ROOT__ .ilt-hero h1{margin:18px 0 0;font-size:clamp(42px,5vw,70px);line-height:1.02}
__ROOT__ .ilt-hero h1 em{font-style:normal;color:var(--green-dark)}
__ROOT__ .ilt-hero-sub{margin:22px 0 0;max-width:570px;color:var(--muted);font-size:17.5px;line-height:1.7}
__ROOT__ .ilt-hero-sub b{color:var(--ink)}
__ROOT__ .ilt-hero-actions{display:flex;align-items:center;gap:26px;margin-top:34px;flex-wrap:wrap}
__ROOT__ .ilt-hero-facts{display:flex;gap:26px;margin-top:38px;padding-top:26px;border-top:1px solid var(--line);flex-wrap:wrap}
__ROOT__ .ilt-hero-facts b{display:block;font-family:Outfit,Manrope,sans-serif;font-size:26px;font-weight:800;letter-spacing:-.03em}
__ROOT__ .ilt-hero-facts b i{color:var(--green);font-style:normal}
__ROOT__ .ilt-hero-facts span{display:block;margin-top:4px;color:var(--muted);font-size:12.5px;font-weight:700;letter-spacing:.04em;text-transform:uppercase}
__ROOT__ .ilt-hero-card{position:relative;border-radius:24px;overflow:hidden;box-shadow:0 30px 70px rgba(17,22,75,.18);margin:0}
__ROOT__ .ilt-hero-card img{display:block;width:100%;height:100%;object-fit:cover;aspect-ratio:4/4.4;border-radius:24px;backface-visibility:hidden}
__ROOT__ .ilt-hero-card:after{content:'';position:absolute;inset:0;background:linear-gradient(200deg,rgba(17,22,75,0) 55%,rgba(17,22,75,.35));pointer-events:none}
__ROOT__ .ilt-hero-badge{position:absolute;left:18px;bottom:18px;z-index:1;display:inline-flex;align-items:center;gap:8px;padding:9px 15px;border-radius:14px;background:rgba(13,18,70,.62);border:1px solid rgba(255,255,255,.28);color:#fff;font:800 12.5px/1 Manrope,Arial,sans-serif;letter-spacing:.04em;-webkit-backdrop-filter:blur(22px) saturate(150%);backdrop-filter:blur(22px) saturate(150%)}
__ROOT__ .ilt-hero-badge i{width:8px;height:8px;border-radius:50%;background:var(--green);font-style:normal}`;
}

function benefitsCss() {
  return `
__ROOT__ .ilt-benefits{padding:112px 0;background:var(--mist)}
__ROOT__ .ilt-ben-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;margin-top:52px}
__ROOT__ .ilt-ben{padding:34px 30px;border:1px solid var(--line);border-radius:20px;background:#fff;transition:transform .45s cubic-bezier(.4,0,.2,1),box-shadow .45s cubic-bezier(.4,0,.2,1)}
__ROOT__ .ilt-ben:hover{transform:translateY(-6px);box-shadow:0 24px 48px rgba(17,22,75,.12)}
__ROOT__ .ilt-ben-ico{display:grid;place-items:center;width:56px;height:56px;margin-bottom:20px;border-radius:16px;border:1px solid rgba(255,255,255,.6);background:linear-gradient(150deg,rgba(238,243,255,.9),rgba(238,243,255,.5));-webkit-backdrop-filter:blur(14px) saturate(160%);backdrop-filter:blur(14px) saturate(160%);box-shadow:0 8px 20px rgba(17,22,75,.12),inset 0 1px 0 rgba(255,255,255,.65);color:var(--blue);transition:background .45s cubic-bezier(.4,0,.2,1),color .45s cubic-bezier(.4,0,.2,1)}
__ROOT__ .ilt-ben:hover .ilt-ben-ico{background:linear-gradient(150deg,rgba(0,185,79,.88),rgba(0,150,64,.66));color:#fff}
__ROOT__ .ilt-ben-ico svg{width:27px;height:27px}
__ROOT__ .ilt-ben h3{margin:0;font-family:Outfit,Manrope,sans-serif;font-size:21px;font-weight:800;letter-spacing:-.03em}
__ROOT__ .ilt-ben p{margin:10px 0 0;color:var(--muted);font-size:14px;line-height:1.65}`;
}

function incluyeCss() {
  return `
__ROOT__ .ilt-incluye{padding:118px 0}
__ROOT__ .ilt-incl-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:70px;align-items:center}
__ROOT__ .ilt-incl h2{margin:16px 0 0;font-size:clamp(38px,4.2vw,58px);line-height:1.05}
__ROOT__ .ilt-incl-answer{margin:20px 0 0;color:var(--muted);font-size:16.5px;line-height:1.7}
__ROOT__ .ilt-incl-answer b{color:var(--ink)}
__ROOT__ .ilt-checks{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:30px 0 0;padding:0;list-style:none}
__ROOT__ .ilt-checks li{display:flex;align-items:flex-start;gap:10px;padding:13px 16px;border:1px solid var(--line);border-radius:12px;background:#fff;font-size:13.5px;font-weight:600;line-height:1.4}
__ROOT__ .ilt-checks i{flex:0 0 20px;display:grid;place-items:center;width:20px;height:20px;border-radius:50%;background:rgba(0,185,79,.13);color:var(--green-dark);font-size:11px;font-style:normal;font-weight:800}
__ROOT__ .ilt-media{position:relative;border-radius:24px;overflow:hidden;box-shadow:0 30px 70px rgba(17,22,75,.16);margin:0}
__ROOT__ .ilt-media img{display:block;width:100%;height:100%;object-fit:cover;aspect-ratio:4/3;border-radius:24px;backface-visibility:hidden;transition:transform .6s cubic-bezier(.22,1,.36,1),filter .6s cubic-bezier(.22,1,.36,1)}
__ROOT__ .ilt-media:hover img{transform:scale(1.06);filter:brightness(1.04) saturate(1.08)}
__ROOT__ .ilt-media figcaption{position:absolute;left:18px;bottom:18px;z-index:1;padding:10px 16px;border-radius:12px;background:rgba(13,18,70,.78);color:#fff;font:800 12px/1.4 Manrope,Arial,sans-serif;letter-spacing:.05em;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}`;
}

function extraCss() {
  return `
__ROOT__ .ilt-extra{padding:112px 0;background:var(--mist)}
__ROOT__ .ilt-xgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;margin-top:52px}
__ROOT__ .ilt-xcard{padding:32px 28px;border:1px solid var(--line);border-radius:20px;background:#fff;transition:transform .45s cubic-bezier(.4,0,.2,1),box-shadow .45s cubic-bezier(.4,0,.2,1)}
__ROOT__ .ilt-xcard:hover{transform:translateY(-6px);box-shadow:0 24px 48px rgba(17,22,75,.12)}
__ROOT__ .ilt-xcard h3{margin:0;font-family:Outfit,Manrope,sans-serif;font-size:20px;font-weight:800;letter-spacing:-.03em}
__ROOT__ .ilt-xcard p{margin:10px 0 0;color:var(--muted);font-size:13.5px;line-height:1.6}
__ROOT__ .ilt-xcard .ilt-tag{display:inline-block;margin-bottom:14px;padding:6px 12px;border-radius:999px;background:var(--blue-soft);color:var(--blue);font:800 11px/1 Manrope,Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase}
/* Servicios hijos (madres / hub) */
__ROOT__ .ilt-kids{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:52px}
__ROOT__ .ilt-kid{display:flex;flex-direction:column;gap:12px;padding:28px 26px;border:1px solid var(--line);border-radius:20px;background:#fff;transition:transform .22s ease,box-shadow .22s ease,border-color .22s ease}
__ROOT__ .ilt-kid:hover,__ROOT__ .ilt-kid:focus-visible{transform:translateY(-6px);box-shadow:0 24px 48px rgba(17,22,75,.12);border-color:rgba(0,185,79,.4)}
__ROOT__ .ilt-kid h3{margin:0;font-family:Outfit,Manrope,sans-serif;font-size:19px;font-weight:800;letter-spacing:-.03em}
__ROOT__ .ilt-kid p{margin:0;color:var(--muted);font-size:13.5px;line-height:1.6}
__ROOT__ .ilt-kid span:last-child{margin-top:auto;color:var(--green-dark);font-weight:800;font-size:13px}
__ROOT__ .ilt-kid span:last-child:after{content:' ↗'}
__ROOT__ .ilt-xcta{display:flex;justify-content:center;margin-top:46px}
/* ── Hub: carrusel 3D de categorías en caja de vidrio esmerilado (frosted glass) ── */
__ROOT__ .ilt3-sec .ilt3-box{position:relative;margin-top:52px;padding:30px 30px 36px;border-radius:30px;border:1px solid rgba(255,255,255,.65);background:linear-gradient(150deg,rgba(255,255,255,.74),rgba(238,243,255,.52));-webkit-backdrop-filter:blur(24px) saturate(165%);backdrop-filter:blur(24px) saturate(165%);box-shadow:0 34px 80px rgba(17,22,75,.16),inset 0 1px 0 rgba(255,255,255,.75);overflow:hidden}
__ROOT__ .ilt3-sec .ilt3-box:before{content:'';position:absolute;inset:0;background:radial-gradient(120% 80% at 12% 0%,rgba(0,185,79,.12),transparent 55%),radial-gradient(100% 70% at 100% 100%,rgba(33,61,142,.12),transparent 60%);pointer-events:none}
__ROOT__ .ilt3-stage{--side:min(17vw,220px);--side-z:-240px;position:relative;perspective:1500px;overflow:hidden;min-height:420px;transition:height .5s ease;touch-action:pan-y}
__ROOT__ .ilt3-card{position:absolute;top:0;left:50%;width:min(44vw,580px);display:flex;flex-direction:column;border:1px solid var(--line);border-radius:26px;background:var(--paper);box-shadow:0 16px 40px rgba(17,22,75,.12);overflow:hidden;margin:0;will-change:transform,opacity;transform:translateX(-50%) translateZ(0) scale(1);transition:transform .85s cubic-bezier(.34,1.3,.4,1),opacity .5s ease,filter .85s cubic-bezier(.34,1.3,.4,1),box-shadow .85s cubic-bezier(.34,1.3,.4,1)}
__ROOT__ .ilt3-card:not(.is-front){cursor:pointer}
__ROOT__ .ilt3-card.is-front{z-index:5;opacity:1;transform:translateX(-50%);box-shadow:0 30px 64px rgba(17,22,75,.22)}
__ROOT__ .ilt3-card.is-left{top:0;z-index:2;opacity:1;transform:translateX(calc(-50% - var(--side))) rotateY(30deg) translateZ(var(--side-z)) scale(.82)}
__ROOT__ .ilt3-card.is-right{top:0;z-index:2;opacity:1;transform:translateX(calc(-50% + var(--side))) rotateY(-30deg) translateZ(var(--side-z)) scale(.82)}
/* El hundimiento de las laterales se pinta con una capa encima, NO con filter: el
   filter vuelve la tarjeta capa compuesta y ahi el clip redondeado se pierde, que es
   por lo que las esquinas dejaban de verse redondas. La capa hereda el radio. */
__ROOT__ .ilt3-card:after{content:'';position:absolute;inset:0;z-index:4;border-radius:inherit;background:linear-gradient(180deg,rgba(11,16,61,.26),rgba(11,16,61,.14));opacity:0;transition:opacity .6s ease;pointer-events:none}
__ROOT__ .ilt3-card.is-left:after,__ROOT__ .ilt3-card.is-right:after{opacity:1}
__ROOT__ .ilt3-card.is-left:hover:after,__ROOT__ .ilt3-card.is-right:hover:after,__ROOT__ .ilt3-card.is-left:focus-visible:after,__ROOT__ .ilt3-card.is-right:focus-visible:after{opacity:0}
__ROOT__ .ilt3-card.is-hidden{z-index:1;opacity:0;visibility:hidden;pointer-events:none;transform:translateX(-50%) translateZ(-620px) scale(.62)}
__ROOT__ .ilt3-card:focus-visible{outline:3px solid var(--blue);outline-offset:4px}
__ROOT__ .ilt3-media{position:relative;width:100%;aspect-ratio:2.2/1;overflow:hidden;border-radius:28px 28px 0 0;background:var(--blue-soft);flex:0 0 auto}
/* Las fotos de la tarjeta se apilan y se relevan con un fundido cada 5s: una sola
   capa visible a la vez, y la que entra sube de z para que el cruce no trasluzca. */
__ROOT__ .ilt3-shot{position:absolute;inset:0;display:block;width:100%;height:100%;object-fit:cover;object-position:center;border-radius:inherit;backface-visibility:hidden;opacity:0;transition:opacity .9s ease,transform .8s cubic-bezier(.34,1.3,.4,1)}
__ROOT__ .ilt3-shot.is-on{opacity:1}
__ROOT__ .ilt3-card.is-front:hover .ilt3-shot.is-on,__ROOT__ .ilt3-card.is-front:focus-within .ilt3-shot.is-on{transform:scale(1.05)}
__ROOT__ .ilt3-badge{position:absolute;left:22px;bottom:18px;z-index:3;display:grid;place-items:center;width:60px;height:60px;border-radius:18px;border:1px solid rgba(255,255,255,.6);background:linear-gradient(150deg,rgba(255,255,255,.85),rgba(238,243,255,.55));-webkit-backdrop-filter:blur(16px) saturate(165%);backdrop-filter:blur(16px) saturate(165%);box-shadow:0 10px 24px rgba(17,22,75,.18),inset 0 1px 0 rgba(255,255,255,.75);color:var(--blue);transition:background .4s ease,color .4s ease}
__ROOT__ .ilt3-badge svg{display:block;width:28px;height:28px}
__ROOT__ .ilt3-card.is-front:hover .ilt3-badge,__ROOT__ .ilt3-card.is-front:focus-within .ilt3-badge{background:linear-gradient(150deg,rgba(0,185,79,.9),rgba(0,150,64,.7));color:#fff}
__ROOT__ .ilt3-body{position:relative;z-index:2;display:flex;flex-direction:column;gap:16px;flex:1;padding:24px;text-align:left}
__ROOT__ .ilt3-head{display:flex;flex-direction:column;gap:8px;min-width:0}
__ROOT__ .ilt3-cols{display:grid;grid-template-columns:1.08fr 1fr;gap:16px 24px;align-items:start;flex:1}
__ROOT__ .ilt3-side{display:flex;flex-direction:column;gap:10px;min-width:0;align-self:stretch}
__ROOT__ .ilt3-kicker{color:var(--green-dark);font-size:11.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase}
__ROOT__ .ilt3-title{margin:0;font-family:Outfit,Manrope,sans-serif;font-size:clamp(21px,2vw,26px);font-weight:800;line-height:1.12;letter-spacing:-.035em}
__ROOT__ .ilt3-title a:hover{color:var(--green-dark)}
__ROOT__ .ilt3-desc{margin:0;color:var(--muted);font-size:13.5px;line-height:1.6}
__ROOT__ .ilt3-feat{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin:0;padding:0;list-style:none}
__ROOT__ .ilt3-feat li{display:flex;flex-direction:row;align-items:center;gap:8px;padding:8px 10px;border:1px solid var(--line);border-radius:12px;background:rgba(244,247,252,.7);font-size:11px;font-weight:700;line-height:1.2;color:var(--ink)}
__ROOT__ .ilt3-feat li i{flex:0 0 18px;display:grid;place-items:center;width:18px;height:18px;border-radius:50%;background:rgba(0,185,79,.14);color:var(--green-dark);font-size:11px;font-style:normal;font-weight:800}
__ROOT__ .ilt3-sub{margin:0;padding:0;list-style:none;display:flex;flex-wrap:wrap;gap:6px 12px;justify-content:flex-start}
__ROOT__ .ilt3-sub a{display:inline-flex;align-items:center;gap:6px;color:var(--blue);font-size:12.5px;font-weight:700}
__ROOT__ .ilt3-sub a:before{content:'›';color:var(--green-dark);font-weight:800}
__ROOT__ .ilt3-sub a:hover{color:var(--green-dark)}
__ROOT__ .ilt3-btn{display:inline-flex;align-items:center;justify-content:center;gap:9px;margin:0;align-self:center;min-height:46px;padding:11px 24px;border-radius:12px;background:var(--green);color:#fff!important;font:800 13.5px/1 Manrope,Arial,sans-serif;letter-spacing:.02em;box-shadow:0 14px 28px rgba(0,185,79,.24);transition:transform .22s ease,background .22s ease}
__ROOT__ .ilt3-btn:hover,__ROOT__ .ilt3-btn:focus-visible{background:var(--green-dark);transform:translateY(-2px)}
__ROOT__ .ilt3-btn span:last-child{transition:transform .25s ease}
__ROOT__ .ilt3-btn:hover span:last-child{transform:translateX(3px)}
__ROOT__ .ilt3-dots{display:flex;justify-content:center;gap:9px;margin-top:26px}
__ROOT__ .ilt3-dot{width:9px;height:9px;padding:0;border:0;border-radius:50%;background:rgba(33,61,142,.22);cursor:pointer;transition:background .3s ease,transform .3s ease}
__ROOT__ .ilt3-dot.is-active{background:var(--green);transform:scale(1.25)}
__ROOT__ .ilt3-dot:focus-visible{outline:2px solid var(--blue);outline-offset:3px}
__ROOT__ .ilt3-hint{margin:16px 0 0;text-align:center;color:var(--muted);font-size:12.5px;font-weight:600}
/* Punto mas grande de toque que su dibujo, sin alterar el layout (a11y en tactil). */
__ROOT__ .ilt3-dot{position:relative}
__ROOT__ .ilt3-dot:after{content:'';position:absolute;inset:-9px;border-radius:50%}
/* Tarjetas laterales: conservan la MISMA forma horizontal (imagen 2:1 arriba + cuerpo), solo giradas y hundidas */
/* Cada foto lleva su radio (y el de la tarjeta) para que la esquina se vea redonda
   aunque el filtro o la composicion la saquen del clip del contenedor. */
__ROOT__ .ilt3-card.is-left .ilt3-shot,__ROOT__ .ilt3-card.is-right .ilt3-shot{border-radius:inherit}`;
}

function processCss() {
  return `
__ROOT__ .ilt-process{padding:118px 0}
__ROOT__ .ilt-proc-head{max-width:690px;margin:auto;text-align:center}
__ROOT__ .ilt-proc-head h2{margin:16px 0 0;font-size:clamp(38px,4.2vw,58px);line-height:1.05}
__ROOT__ .ilt-proc-head p{margin:18px 0 0;color:var(--muted);font-size:16px;line-height:1.65}
__ROOT__ .ilt-proc-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:56px}
__ROOT__ .ilt-proc-grid article{padding:30px;border:1px solid var(--line);border-radius:16px;background:#fff;transition:transform .22s ease,box-shadow .22s ease}
__ROOT__ .ilt-proc-grid article:hover{transform:translateY(-4px);box-shadow:0 16px 34px rgba(17,22,75,.12)}
__ROOT__ .ilt-proc-grid span{display:block;color:var(--green-dark);font-size:13px;font-weight:800;letter-spacing:.12em}
__ROOT__ .ilt-proc-grid h3{margin:30px 0 11px;font-family:Outfit,Manrope,sans-serif;font-size:22px;font-weight:800;letter-spacing:-.04em}
__ROOT__ .ilt-proc-grid p{margin:0;color:var(--muted);font-size:14px;line-height:1.65}`;
}

function faqCss() {
  return `
__ROOT__ .ilt-faq{padding:112px 0;background:var(--mist)}
__ROOT__ .ilt-faq-head{max-width:690px;margin:0 auto 48px;text-align:center}
__ROOT__ .ilt-faq-head h2{margin:16px 0 0;font-size:clamp(36px,4vw,54px);line-height:1.05}
__ROOT__ .ilt-faq-list{max-width:880px;margin:0 auto;display:grid;gap:12px}
__ROOT__ details.ilt-faq-item{border:1px solid var(--line);border-radius:14px;background:#fff;overflow:hidden}
__ROOT__ details.ilt-faq-item summary{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:20px 22px;cursor:pointer;list-style:none;font-family:Outfit,Manrope,sans-serif;font-weight:700}
__ROOT__ details.ilt-faq-item summary::-webkit-details-marker{display:none}
__ROOT__ details.ilt-faq-item summary h3{margin:0;font-size:17px;font-weight:700;letter-spacing:-.01em}
__ROOT__ details.ilt-faq-item summary .ilt-chevron{flex:0 0 28px;display:grid;place-items:center;width:28px;height:28px;border-radius:50%;background:var(--blue-soft);color:var(--blue);font-size:12px;transition:transform .35s cubic-bezier(.4,0,.2,1)}
__ROOT__ details.ilt-faq-item[open] summary .ilt-chevron{transform:rotate(180deg)}
__ROOT__ details.ilt-faq-item>p{margin:0;padding:2px 22px 20px;color:var(--muted);font-size:14.5px;line-height:1.7}
__ROOT__ details.ilt-faq-item>p b{color:var(--ink)}`;
}

function ctaCss() {
  return `
__ROOT__ .ilt-cta{padding:0 0 112px}
__ROOT__ .ilt-cta-box{position:relative;display:grid;grid-template-columns:1.05fr .95fr;gap:40px 56px;align-items:center;padding:66px 56px;border-radius:24px;background:var(--green);color:#fff;overflow:hidden}
__ROOT__ .ilt-cta-box:before,__ROOT__ .ilt-cta-box:after{content:'';position:absolute;border:1px solid rgba(255,255,255,.28);border-radius:50%;pointer-events:none}
__ROOT__ .ilt-cta-box:before{top:-190px;left:-90px;width:380px;height:380px}
__ROOT__ .ilt-cta-box:after{right:-170px;bottom:-210px;width:460px;height:460px}
__ROOT__ .ilt-cta-copy{position:relative;z-index:1}
__ROOT__ .ilt-cta-eyebrow{display:inline-block;margin-bottom:18px;padding:8px 15px;border-radius:999px;background:rgba(255,255,255,.16);color:#fff;font:800 11.5px/1 Manrope,Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase}
__ROOT__ .ilt-cta h2{max-width:560px;margin:0;font-size:clamp(34px,3.8vw,52px);line-height:1.05}
__ROOT__ .ilt-cta-copy p{max-width:520px;margin:19px 0 30px;color:rgba(255,255,255,.92);font-size:16.5px;line-height:1.62}
__ROOT__ .ilt-cta-actions{display:flex;flex-wrap:wrap;align-items:center;gap:14px 18px}
__ROOT__ .ilt-cta-actions small{color:rgba(255,255,255,.88);font-size:13px;font-weight:700}
__ROOT__ .ilt-cta .ilt-button{background:#fff;color:var(--ink)!important;box-shadow:none}
__ROOT__ .ilt-cta .ilt-button span:last-child{background:var(--ink);color:#fff}
__ROOT__ .ilt-cta .ilt-button:hover,__ROOT__ .ilt-cta .ilt-button:focus-visible{background:var(--ink);color:#fff!important}
__ROOT__ .ilt-cta .ilt-button:hover span:last-child,__ROOT__ .ilt-cta .ilt-button:focus-visible span:last-child{background:#fff;color:var(--ink)}
__ROOT__ .ilt-cta-facts{position:relative;z-index:1;display:grid;gap:14px;margin:0;padding:0;list-style:none}
__ROOT__ .ilt-cta-facts li{display:flex;gap:14px;align-items:flex-start;padding:18px 20px;border-radius:16px;background:rgba(255,255,255,.13);border:1px solid rgba(255,255,255,.24)}
__ROOT__ .ilt-cta-facts i{flex:0 0 38px;display:grid;place-items:center;width:38px;height:38px;border-radius:12px;background:#fff;color:var(--green-dark)}
__ROOT__ .ilt-cta-facts i svg{width:20px;height:20px}
__ROOT__ .ilt-cta-facts b{display:block;font-family:Outfit,Manrope,sans-serif;font-size:15.5px;font-weight:800;letter-spacing:-.02em}
__ROOT__ .ilt-cta-facts span{display:block;margin-top:3px;color:rgba(255,255,255,.86);font-size:13.5px;line-height:1.5}`;
}

function calendarCss() {
  return `
__ROOT__ .ilt-cal{padding:0 0 112px;scroll-margin-top:96px}
__ROOT__ .ilt-cal-head{max-width:690px;margin:0 auto 40px;text-align:center}
__ROOT__ .ilt-cal-head h2{margin:16px 0 0;font-size:clamp(32px,3.6vw,48px);line-height:1.06}
__ROOT__ .ilt-cal-head p{margin:16px 0 0;color:var(--muted);font-size:16px;line-height:1.65}
__ROOT__ .ilt-cal-box{padding:22px;border:1px solid var(--line);border-radius:24px;background:#fff;box-shadow:0 24px 60px rgba(17,22,75,.07)}
__ROOT__ .ilt-cal-embed{position:relative;min-height:760px;border-radius:16px;overflow:hidden}
__ROOT__ .ilt-cal-embed iframe{display:block;width:100%;border:0;overflow:hidden}
__ROOT__ .ilt-cal-fallback{margin:16px 0 0;text-align:center;color:var(--muted);font-size:13.5px}
__ROOT__ .ilt-cal-fallback a{color:var(--blue);font-weight:700;text-decoration:underline}`;
}

function responsiveCss() {
  return `
@media(max-width:900px){
__ROOT__ .ilt-hero{padding:74px 0 62px}
__ROOT__ .ilt-hero-grid{grid-template-columns:1fr;gap:40px}
__ROOT__ .ilt-incl-grid{grid-template-columns:1fr;gap:44px}
__ROOT__ .ilt-ben-grid,__ROOT__ .ilt-xgrid,__ROOT__ .ilt-proc-grid,__ROOT__ .ilt-kids{grid-template-columns:1fr 1fr}
__ROOT__ .ilt-checks{grid-template-columns:1fr}
__ROOT__ .ilt-cta-box{grid-template-columns:1fr;gap:34px;padding:56px 44px}
__ROOT__ .ilt-cal-embed{min-height:800px}
}
/* ── MOBILE / TABLET ANGOSTA (<=820px): el carrusel se vuelve una LISTA VERTICAL ──
   Un carrusel esconde servicios detras de un gesto, y en telefono eso cuesta
   conversiones: aqui las 6 tarjetas se apilan a ancho completo, una tras otra, con el
   CTA siempre visible y al alcance del pulgar. Sin rotacion, sin autoplay, sin gesto
   que secuestrar y sin trabajo por frame: solo el scroll de la pagina. El panel pasa de
   vidrio esmerilado (blur caro) a plano claro y el espaciado va en pasos de 8px. */
@media(max-width:820px){
__ROOT__ .ilt3-sec .ilt3-box{padding:16px;border-radius:24px;margin-top:34px;border:1px solid var(--line);background:var(--mist);-webkit-backdrop-filter:none;backdrop-filter:none;box-shadow:none}
__ROOT__ .ilt3-sec .ilt3-box:before{display:none}
__ROOT__ .ilt3-stage{--side:0;--side-z:0;perspective:none;display:grid;grid-template-columns:1fr;gap:16px;height:auto;min-height:0;max-width:560px;margin-inline:auto;padding:0;-webkit-mask-image:none;mask-image:none;transition:none}
__ROOT__ .ilt3-card{position:static;width:auto;margin:0;border-radius:20px;box-shadow:0 8px 22px rgba(17,22,75,.08);transform:none!important;filter:none!important;opacity:1!important;visibility:visible!important;will-change:auto;transition:box-shadow .3s ease}
__ROOT__ .ilt3-card:after{display:none}
__ROOT__ .ilt3-media{aspect-ratio:16/9;border-radius:20px 20px 0 0}
__ROOT__ .ilt3-shot{transform:none!important}
__ROOT__ .ilt3-badge{width:52px;height:52px;left:16px;bottom:16px;border-radius:16px}
__ROOT__ .ilt3-badge svg{width:26px;height:26px}
__ROOT__ .ilt3-body{gap:16px;padding:20px}
__ROOT__ .ilt3-cols{grid-template-columns:1fr;gap:16px}
__ROOT__ .ilt3-head{gap:8px}
__ROOT__ .ilt3-title{font-size:21px;line-height:1.15}
__ROOT__ .ilt3-desc{font-size:14px;line-height:1.55}
__ROOT__ .ilt3-side{gap:16px}
__ROOT__ .ilt3-sub{flex-direction:column;align-items:center;gap:8px}
__ROOT__ .ilt3-sub a{font-size:13px}
__ROOT__ .ilt3-btn{min-height:50px;padding:12px 20px;font-size:14.5px;border-radius:14px;align-self:stretch}
__ROOT__ .ilt3-dots{display:none}
__ROOT__ .ilt3-hint{display:none}
}
@media(max-width:600px){
__ROOT__ .ilt-shell{width:min(100% - 30px,1210px)}
__ROOT__ .ilt-hero h1{font-size:clamp(40px,11.5vw,54px)}
__ROOT__ .ilt-hero-actions{align-items:flex-start;flex-direction:column;gap:16px}
__ROOT__ .ilt-hero-facts{gap:20px}
__ROOT__ .ilt-benefits,__ROOT__ .ilt-incluye,__ROOT__ .ilt-extra,__ROOT__ .ilt-process,__ROOT__ .ilt-faq{padding:78px 0}
__ROOT__ .ilt-ben-grid,__ROOT__ .ilt-xgrid,__ROOT__ .ilt-proc-grid,__ROOT__ .ilt-kids{grid-template-columns:1fr}
__ROOT__ .ilt-cta-box{padding:46px 22px;border-radius:17px;gap:28px}
__ROOT__ .ilt-cta-actions{gap:12px 14px}
__ROOT__ .ilt-cta-actions .ilt-button{width:100%;justify-content:center}
__ROOT__ .ilt-cta-facts li{padding:15px 16px;border-radius:14px}
__ROOT__ .ilt-cal{padding:0 0 78px}
__ROOT__ .ilt-cal-box{padding:16px 12px;border-radius:18px}
__ROOT__ .ilt-cal-embed{min-height:780px;border-radius:12px}
__ROOT__ .ilt-hero-card img{aspect-ratio:4/3}
}
@media(prefers-reduced-motion:reduce){
__ROOT__ .ilt-reveal{transition:none!important}
html.ilt-anim __ROOT__ .ilt-reveal{opacity:1;transform:none}
__ROOT__ .ilt-ben,__ROOT__ .ilt-xcard,__ROOT__ .ilt-kid,__ROOT__ .ilt-proc-grid article{transition:none!important}
__ROOT__ .ilt-media:hover img{transform:none}
__ROOT__ .ilt3-card{transition:none!important}
}
html,body{overflow-x:clip}`;
}
