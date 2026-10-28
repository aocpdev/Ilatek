import { spawn, spawnSync } from 'node:child_process';
import { createReadStream, mkdirSync, writeFileSync } from 'node:fs';
import http from 'node:http';
import path from 'node:path';

import { REPO, getChromium } from './repo_root.mjs';

// 1) Build harness copies (TMP= printed on first line).
const build = spawnSync(process.platform === 'win32' ? 'python' : 'python3', [path.join(import.meta.dirname, 'build_runtime_harness.py')], { cwd: import.meta.dirname, encoding: 'utf8' });
if (build.status !== 0) {
  console.error(build.stderr || 'harness build failed');
  process.exit(1);
}
const tmp = (build.stdout.split('\n').find((l) => l.startsWith('TMP=')) || '').slice(4).trim();
if (!tmp) { console.error('no TMP from harness'); process.exit(1); }
console.log('serving', tmp);

// 2) Static server on 127.0.0.1:8932.
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/+/, '') || 'index.html';
  const file = path.join(tmp, rel);
  createReadStream(file).on('error', () => { res.statusCode = 404; res.end('nf'); }).pipe(res);
});
await new Promise((ok) => server.listen(8932, '127.0.0.1', ok));

// 3) Chromium + runtime_qa.
const chromium = await getChromium();
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const out = await (await import('./runtime_qa.mjs')).default(page, console);
mkdirSync(path.join(REPO, 'shots'), { recursive: true });
writeFileSync(path.join(REPO, "shots", "qa-result4.json"), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
await browser.close();
server.close();
process.exit(0);
