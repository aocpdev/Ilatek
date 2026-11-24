// Ilatek · Blog · caja fija en 360 px; el loop recorre TODA la altura real del widget,
// así alcanza las reseñas nuevas. Solo escribe style (nunca el atributo: evita bucles).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BLOG = path.resolve(HERE, '..');

const NEW = `<script>
/* ILATEK:REVIEWS-ADAPTIVE — caja fija; el loop recorre toda la altura real del widget. */
(function(){
  [].slice.call(document.querySelectorAll('.ilb-reviews')).forEach(function(box){
    var ifr = box.querySelector('iframe');
    if (!ifr) return;
    var dir = 1, paused = false, last = 0, resume = null, pos = box.scrollTop, hActual = 0;
    function max(){ return box.scrollHeight - box.clientHeight; }
    function speed(m){ return Math.min(0.15, Math.max(0.03, m / 60000)); }
    function setH(h){
      h = Math.round(parseFloat(h));
      if (!(h > 0) || h === hActual) return;
      hActual = h;
      ifr.style.setProperty('height', h + 'px', 'important');
      var tries = 0;
      (function check(){
        if (tries++ > 4) return;
        if (Math.abs(ifr.getBoundingClientRect().height - h) > 2) {
          ifr.style.setProperty('height', h + 'px', 'important');
          setTimeout(check, 150);
        }
      })();
      var m = max();
      if (pos > m) { pos = m; box.scrollTop = m; }
    }
    window.addEventListener('message', function(e){
      var d = e.data;
      var name = Array.isArray(d) ? d[0] : (d && (d.event || d.type));
      var pay = Array.isArray(d) ? d[1] : d;
      if (name === 'lc.setHeight' && pay && pay.id === 'lc_reviews_widget') setH(pay.height);
    });
    var cs = window.getComputedStyle ? parseFloat(window.getComputedStyle(ifr).height) : 0;
    setH(cs || ifr.getBoundingClientRect().height || 2180);
    if (window.MutationObserver) {
      new MutationObserver(function(){ var h = parseFloat(ifr.getAttribute('height')); if (h > 0) setH(h); })
        .observe(ifr, { attributes: true, attributeFilter: ['height'] });
    }
    box.addEventListener('pointerenter', function(){ paused = true; });
    box.addEventListener('pointerleave', function(){ paused = false; pos = box.scrollTop; });
    box.addEventListener('touchstart', function(){ paused = true; clearTimeout(resume); resume = setTimeout(function(){ paused = false; pos = box.scrollTop; }, 2200); }, { passive: true });
    function tick(now){
      if (!paused && !document.hidden) {
        var m = max();
        if (m > 4) {
          if (!last) last = now;
          var dt = Math.min(64, now - last);
          pos += dir * dt * speed(m);
          if (pos >= m - 0.5) { pos = m; dir = -1; } else if (pos <= 0.5) { pos = 0; dir = 1; }
          box.scrollTop = pos;
        }
      }
      last = now; requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
})();
</script>`;

const RE_OLD = /<script>\s*\(function\(\)\{\s*\[\]\.slice\.call\(document\.querySelectorAll\('\.ilb-reviews'\)\)[\s\S]*?\}\)\(\);\s*<\/script>/;
const RE_NEW = /<script>\s*\/\* ILATEK:REVIEWS-ADAPTIVE[\s\S]*?<\/script>/;

const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) files.push(p);
  }
})(BLOG);
files.push(path.join(HERE, 'render.mjs'));

let replaced = 0, skipped = 0;
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  if (!src.includes('.ilb-reviews')) continue;
  let out = src;
  if (RE_NEW.test(out)) out = out.replace(RE_NEW, NEW);
  else if (RE_OLD.test(out)) out = out.replace(RE_OLD, NEW);
  if (out === src) { skipped++; continue; }
  fs.writeFileSync(f, out);
  replaced++;
}
console.log('actualizados:', replaced, '| sin cambios:', skipped);
