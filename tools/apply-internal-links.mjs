import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './site-paths.mjs';
import { deliveryFiles, publicPath, formatPage, normalizeTemplates } from './internal-link-contract.mjs';
let changed=0;
for(const file of deliveryFiles()) {
  const full=path.join(ROOT,file), old=fs.readFileSync(full,'utf8');
  const headOnly=/HEAD-TEMPLATE|head-seo|head-original|performance-head/.test(file);
  const next=formatPage(old,publicPath(file),{headOnly});
  if(next!==old){fs.writeFileSync(full,next);changed++;}
}
// These generator sources contain URL templates but no public deployment metadata.
for(const file of ['techos/lib/page.mjs','src/faq/faq-source.mjs']) {
  const full=path.join(ROOT,file), old=fs.readFileSync(full,'utf8'), next=normalizeTemplates(old);
  if(next!==old){fs.writeFileSync(full,next);changed++;}
}
console.log(`Internal link contract applied to ${changed} files.`);
