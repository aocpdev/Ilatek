import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const structure = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/estructura.json'), 'utf8'));
export const legacyPath = rel => structure.moves[rel] || rel;
export const projectPath = rel => path.resolve(ROOT, legacyPath(rel));
export const pageFile = slug => {
  const page = structure.pages.find(p => p.slug === slug);
  if (!page) throw new Error(`Unknown page: ${slug}`);
  return page.file;
};
