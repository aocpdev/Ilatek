// Reviews centrado como el home + tokens custom_values en schema — residencial y comercial
import fs from 'fs';

const FILES = [
  'Ilatek/home-page/ghl-limpieza-residencial-landing.html',
  'Ilatek/home-page/ghl-limpieza-comercial-landing.html'
];
const SLUGS = ['limpieza-residencial', 'limpieza-comercial'];

// Utilidades compartidas del home, verbatim de ghl-home-completo.html
const UTILS = `/* Utilidades compartidas del home (shell/eyebrow/display/reveal) */
    .il-shell{width:min(100% - 40px,1210px);margin:auto}.il-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}.il-eyebrow{display:inline-flex;align-items:center;gap:8px;color:var(--blue);font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.il-eyebrow:before{content:'';width:8px;height:8px;border-radius:50%;background:var(--green);box-shadow:0 0 0 5px rgba(0,185,79,.12)}.il-display{font-family:Outfit,Manrope,sans-serif;letter-spacing:-.06em}.il-reveal{transition:opacity .8s cubic-bezier(.22,1,.36,1),transform .8s cubic-bezier(.22,1,.36,1)}.il-reveal{opacity:0;transform:translateY(26px)}.il-reveal.is-visible{opacity:1;transform:none}@media(prefers-reduced-motion:reduce){.il-reveal{transition:none!important;opacity:1;transform:none}}`;

// Observer para .il-reveal (mismo patrón del home), insertado antes del flag final
const REVEAL_OLD = `    window.addEventListener('load',function(){revealEls.forEach(function(el){var r=el.getBoundingClientRect();if(r.top<window.innerHeight)el.classList.add('ilr-visible')})});
    window.__ilrReady=true;`;
const REVEAL_NEW = `    window.addEventListener('load',function(){revealEls.forEach(function(el){var r=el.getBoundingClientRect();if(r.top<window.innerHeight)el.classList.add('ilr-visible')})});
    /* Reveal compartido del home (.il-reveal -> is-visible) */
    var shEls=[].slice.call(root.querySelectorAll('.il-reveal'));
    if('IntersectionObserver' in window){
      var io2=new IntersectionObserver(function(entries){entries.forEach(function(en){if(en.isIntersecting){en.target.classList.add('is-visible');io2.unobserve(en.target)}})},{threshold:.12});
      shEls.forEach(function(el){io2.observe(el)});
    }else{shEls.forEach(function(el){el.classList.add('is-visible')})}
    window.addEventListener('load',function(){shEls.forEach(function(el){var r=el.getBoundingClientRect();if(r.top<window.innerHeight)el.classList.add('is-visible')})});
    window.__ilrReady=true;`;

for (let i = 0; i < FILES.length; i++) {
  const f = FILES[i], slug = SLUGS[i];
  let s = fs.readFileSync(f, 'utf8');
  const name = f.split('/').pop();
  const log = [];

  // 1. Utilidades compartidas (antes del bloque /* Reviews */)
  if (s.includes('.il-eyebrow{')) {
    log.push('utils: ya presente');
  } else {
    const anchor = '<style>\n    /* Reviews */';
    if (!s.includes(anchor)) throw new Error(name + ': ancla style Reviews no encontrado');
    s = s.replace(anchor, '<style>\n    ' + UTILS + '\n    /* Reviews */');
    log.push('utils: inyectadas');
  }

  // 2. Observer .il-reveal
  if (s.includes("shEls")) {
    log.push('reveal: ya presente');
  } else {
    if (!s.includes(REVEAL_OLD)) throw new Error(name + ': ancla reveal no encontrado');
    s = s.replace(REVEAL_OLD, REVEAL_NEW);
    log.push('reveal: observer añadido');
  }

  // 3. Schema: URLs hardcodeadas -> token website_url (igual que el home)
  const reps = [
    ['"@id":"https://ilatekpr.com/' + slug + '/#service"', '"@id":"{{custom_values.website_url}}/' + slug + '/#service"', true],
    ['"url":"https://ilatekpr.com/' + slug + '"', '"url":"{{custom_values.website_url}}/' + slug + '"', false],
    ['"@id":"https://ilatekpr.com/' + slug + '/#faq"', '"@id":"{{custom_values.website_url}}/' + slug + '/#faq"', false],
    ['"@id":"https://ilatekpr.com/#website"', '"@id":"{{custom_values.website_url}}/#website"', false],
    ['"url":"https://ilatekpr.com","name":"Ilatek"', '"url":"{{custom_values.website_url}}","name":"Ilatek"', false]
  ];
  let tok = 0;
  for (const [o, n, multi] of reps) {
    if (!s.includes(o)) { log.push('schema: NO ENCONTRADO -> ' + o.slice(0, 50)); continue; }
    s = s.split(o).join(n); tok++;
  }
  log.push('schema: ' + tok + ' grupos tokenizados');

  fs.writeFileSync(f, s);
  console.log(name, '·', log.join(' · '));
}
console.log('OK');
