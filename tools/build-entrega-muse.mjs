/**
 * Genera una página local por embed con un botón «Copiar» para que Muse pegue el
 * código completo en GHL sin pasar 467 KB por el chat.
 *
 *   node tools/build-entrega-muse.mjs
 *
 * Cada página lleva su HTML en base64 (evita cualquier choque con </textarea> o
 * </script>), lo decodifica a un <textarea> y lo copia al portapapeles.
 */
import fs from 'node:fs';
import path from 'node:path';

const OUT = 'documentacion/entrega-muse';
const piezas = [
  ['home', 'Home', 'JoweAhkuoTlcBowZbBen', 'home/es/landing-pages/ghl-home-multiservicios.html'],
  ['garantia', 'Garantia', 'BXtziNWh8Zrm3jxBLB7Z', 'garantia/ghl-garantia-embed.html'],
  ['politica', 'Política de Privacidad', 'wUiXO7WAwiLCvRpDsT5x', 'politica-de-privacidad/ghl-politica-embed.html'],
  ['terminos', 'Terminos y Condiciones', '5YcjXSxjngQjavMxkv1m', 'terminos-y-condiciones/ghl-terminos-embed.html'],
];

fs.mkdirSync(OUT, { recursive: true });

for (const [slug, nombre, pageId, archivo] of piezas) {
  const html = fs.readFileSync(archivo, 'utf8');
  const b64 = Buffer.from(html, 'utf8').toString('base64');
  const pagina = `<!doctype html>
<html lang="es"><meta charset="utf-8">
<title>Copiar embed · ${nombre}</title>
<style>
  body{font:16px/1.5 system-ui,sans-serif;margin:0;padding:32px;background:#0f1533;color:#eef1ff}
  h1{font-size:22px;margin:0 0 6px}
  p{margin:6px 0;color:#b9c2ee}
  button{margin:18px 0;padding:14px 22px;font:700 16px system-ui;border:0;border-radius:10px;background:#009640;color:#fff;cursor:pointer}
  button:hover{background:#00b34c}
  textarea{width:100%;height:220px;margin-top:10px;padding:12px;border-radius:10px;border:1px solid #2b3566;background:#151c40;color:#cfd6ff;font:12px/1.4 ui-monospace,Consolas,monospace}
  code{background:#1b2350;padding:2px 6px;border-radius:6px}
</style>
<h1>Embed para GHL · ${nombre}</h1>
<p>Page ID <code>${pageId}</code> · ${html.length.toLocaleString('es-ES')} caracteres</p>
<p>Pulsa el botón, luego en GHL abre <b>Open Code Editor</b>, borra todo y pega con Ctrl+V.</p>
<button id="copiar">Copiar el embed completo</button>
<p id="estado"></p>
<textarea id="vista" spellcheck="false" readonly></textarea>
<script>
  const b64 = "${b64}";
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const texto = new TextDecoder('utf-8').decode(bytes);
  const vista = document.getElementById('vista');
  const estado = document.getElementById('estado');
  vista.value = texto;
  document.getElementById('copiar').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(texto);
    } catch (e) {
      vista.focus(); vista.select(); document.execCommand('copy');
    }
    estado.textContent = 'Copiado: ' + texto.length.toLocaleString('es-ES') + ' caracteres. Ya puedes pegarlo en GHL.';
  });
</script>
</html>`;
  const destino = path.join(OUT, `${slug}-copiar.html`);
  fs.writeFileSync(destino, pagina);
  console.log(`${nombre}: ${html.length.toLocaleString('es-ES')} car. → ${destino}`);
}
console.log('\nAbre la página del embed, pulsa «Copiar el embed completo» y pega en GHL.');
