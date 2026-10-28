// Raíz del repositorio y Playwright: la única implementación para los .mjs.
// El marcador es el directorio `.git`: se sube desde este archivo hasta el
// primer padre que lo contenga (sin profundidad fija ni nombre de carpeta).
import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import path from 'node:path';

export const REPO = (() => {
  for (let d = import.meta.dirname; ; d = path.dirname(d)) {
    if (existsSync(path.join(d, '.git'))) return d;
    if (path.dirname(d) === d) throw new Error('no encuentro la raíz del repo (.git) por encima de ' + import.meta.dirname);
  }
})();

// Playwright, en orden: dependencia local, $PLAYWRIGHT_MODULES, node_modules del
// repo, o el .qaenv histórico junto al repo.
export async function getChromium() {
  try { return (await import('playwright')).chromium; } catch { /* sigue con candidatos */ }
  const cands = [
    process.env.PLAYWRIGHT_MODULES && path.join(process.env.PLAYWRIGHT_MODULES, 'playwright', 'package.json'),
    path.join(REPO, 'node_modules', 'playwright', 'package.json'),
    path.join(REPO, '..', 'scripts', '.qaenv', 'node_modules', 'playwright', 'package.json'),
  ].filter((c) => c && existsSync(c));
  for (const c of cands) {
    try { return createRequire(c)('playwright').chromium; } catch { /* siguiente candidato */ }
  }
  throw new Error('playwright no resoluble: instalalo, exportá PLAYWRIGHT_MODULES (dir node_modules) o dejá scripts/.qaenv junto al repo');
}
