// Ilatek · Techos · servidor estático de QA.
// Sirve esta carpeta con Content-Type explícito en UTF-8. Necesario porque las
// landings son fragmentos sin <meta charset>: con un Content-Type sin charset el
// navegador decodifica como cp1252 y los acentos salen corruptos, lo que falsea
// cualquier aserción sobre el texto renderizado. GHL sirve sus páginas en UTF-8.
// Uso: node Ilatek/techos/serve-techos.mjs [puerto]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { projectPath } from '../tools/site-paths.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.argv[2]) || 4321;
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
};

http
  .createServer((req, res) => {
    let rel = decodeURIComponent(req.url.split('?')[0]);
    if (rel === '/') rel = '/index.html';
    // Preserve legacy QA URLs while the actual HTML lives in category/service packs.
    const legacyLanding = /^\/ghl-[a-z0-9-]+-landing\.html$/.test(rel);
    const file = legacyLanding ? projectPath(`techos${rel}`) : path.resolve(ROOT, '.'+rel);
    if ((!legacyLanding && !file.startsWith(ROOT+path.sep)) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('404');
    }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  })
  .listen(PORT, '127.0.0.1', () => console.log(`Ilatek Techos QA · http://127.0.0.1:${PORT}/ (utf-8)`));
