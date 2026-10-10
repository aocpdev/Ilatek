import fs from 'node:fs';
import assert from 'node:assert/strict';
import { ROOT } from './site-paths.mjs';
import { shellFiles, composeShell } from './page-shell.mjs';
import { publicPath } from './internal-link-contract.mjs';
import { buildPage } from '../techos/lib/page.mjs';
import { buildTree } from '../techos/lib/model.mjs';
function check(html,label) {
  const markup=html.replace(/<!--[\s\S]*?-->/g,'');
  for(const id of ['ilatek-nav','ilatek-footer'])
    assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1,`${label}: exactly one ${id}`);
  if (/<h1\b/.test(markup)) assert.ok(markup.indexOf('id="ilatek-nav"')<markup.search(/<h1\b/),`${label}: header before heading`);
  assert.ok(html.indexOf('id="ilatek-footer"')>html.lastIndexOf('</main>'),`${label}: footer outside main`);
  assert.equal((html.match(/ILATEK:INTERNAL-LINKS:START/g)||[]).length,1,`${label}: one URL runtime`);
  assert.equal(composeShell(html,publicPath(label)),html,`${label}: components out of sync or non-idempotent`);
}
for(const file of shellFiles) check(fs.readFileSync(ROOT+'/'+file,'utf8'),file);
for(const p of buildTree()) check(buildPage(p),'generated/'+p.slug);
console.log(`Header/footer verified: ${shellFiles.length} delivery files + ${buildTree().length} generated roof pages; no duplicate components.`);
