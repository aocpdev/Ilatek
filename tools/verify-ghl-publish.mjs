/**
 * Revisa una URL publicada del sitio tras pegarla en GHL.
 *
 *   node tools/verify-ghl-publish.mjs https://ilatekpr.com/
 *   node tools/verify-ghl-publish.mjs https://ilatekpr.com/garantia --expect=legal
 *
 * Comprueba lo que el embed debe dejar en el HTML servido: respuesta 200,
 * hreflang recíproco, un solo menú y un solo pie, tokens de GHL resueltos y,
 * en el home, el nodo WebPage propio.
 */
const url = process.argv[2];
if (!url) {
  console.error('uso: node tools/verify-ghl-publish.mjs <url> [--expect=home|legal|landing]');
  process.exit(2);
}
const expect = (process.argv.find((a) => a.startsWith('--expect=')) || '').split('=')[1] || 'landing';

const res = await fetch(url, { redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0' } });
const html = await res.text();
const count = (re) => (html.match(re) || []).length;

const checks = [];
const ok = (nombre, valor, esperado) => checks.push({ nombre, valor, esperado, pasa: valor === esperado });

ok('HTTP', res.status, 200);
ok('hreflang es', count(/rel="alternate"[^>]*hreflang="es"/gi) >= 1, true);
ok('hreflang en', count(/rel="alternate"[^>]*hreflang="en"/gi) >= 1, true);
ok('hreflang x-default', count(/rel="alternate"[^>]*hreflang="x-default"/gi) >= 1, true);
ok('un solo #ilatek-nav', count(/id="ilatek-nav"/gi), 1);
ok('un solo #ilatek-footer', count(/id="ilatek-footer"/gi), 1);
// El sitio resuelve los custom values en el cliente con el módulo ILATEK:GHL-VALUES:
// el HTML servido los trae literales a propósito. Lo que debe existir es el puente.
const tokens = count(/\{\{custom_values\.[a-z_]+\}\}/gi);
const puente = html.includes('ILATEK:GHL-VALUES') || html.includes('ILATEK_BRIDGE');
checks.push({ nombre: 'tokens + puente', valor: `${tokens} tokens · puente ${puente ? 'sí' : 'NO'}`, esperado: 'puente sí', pasa: tokens === 0 || puente });

if (expect === 'home') {
  ok('WebPage propio', /data-ilatek="webpage-home"/.test(html), true);
  ok('FAQPage', /"@type":"FAQPage"/.test(html.replace(/\s+/g, '')), true);
}
if (expect === 'legal') {
  ok('bloque GHL-VALUES', html.includes('ILATEK:GHL-VALUES'), true);
}

const fallos = checks.filter((c) => !c.pasa);
for (const c of checks) {
  console.log(`${c.pasa ? '✓' : '✗'} ${c.nombre}: ${c.valor}${c.pasa ? '' : ` (esperado ${c.esperado})`}`);
}
console.log(`\n${url} · ${(html.length / 1024).toFixed(0)} KB · ${fallos.length ? `${fallos.length} FALLOS` : 'todo en orden'}`);
process.exit(fallos.length ? 1 : 0);
