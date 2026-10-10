// Compose existing content with shared navigation/footer; never regenerate page copy.
import fs from 'node:fs';
import { ROOT, structure } from './site-paths.mjs';
import { formatPage, publicPath } from './internal-link-contract.mjs';
import { hasServiceHero } from './responsive-contract.mjs';

export const shellFiles = [...structure.pages.map(p => p.file),
  'resenas/ghl-resenas-landing.html',
  'politica-de-privacidad/ghl-politica-embed.html',
  'terminos-y-condiciones/ghl-terminos-embed.html',
  'ghl-custom-code-embedded.html', 'ghl-custom-code-paste.html'];
const runtimeRE = /<!-- ILATEK:INTERNAL-LINKS:START -->[\s\S]*?<!-- ILATEK:INTERNAL-LINKS:END -->\s*/g;
const shellRE = /<!-- ILATEK:SHELL:(HEADER|FOOTER):START -->[\s\S]*?<!-- ILATEK:SHELL:\1:END -->\s*/g;
const fragment = file => fs.readFileSync(ROOT+'/'+file,'utf8').replace(runtimeRE,'').replace(/<meta\s+charset=[^>]+>\s*/gi,'').trim();
const block = (name, html) => `<!-- ILATEK:SHELL:${name}:START -->\n${html}\n<!-- ILATEK:SHELL:${name}:END -->\n`;

export function composeShell(source, pagePath = '/home') {
  let html = source.replace(shellRE,'').replace(runtimeRE,'');
  if (!/\bid=["']ilatek-nav["']/.test(html)) {
    // Service heroes reserve the fixed bar through the shared responsive CSS.
    // Other layouts (legal/reviews/quote) retain their existing flow spacer.
    const header = block('HEADER', fragment('componentes/ghl-nav-embed.html')+
      (hasServiceHero(html)?'':'\n<div data-ilatek-header-space aria-hidden="true" style="height:92px;flex:none"></div>'));
    if (/<body\b[^>]*>/i.test(html)) html=html.replace(/<body\b[^>]*>/i,m=>m+'\n'+header);
    else {
      const start=html.search(/<(?:section|main)\b/i);
      if(start<0) throw new Error('Page has no content root: '+pagePath);
      html=html.slice(0,start)+header+html.slice(start);
    }
  }
  if (!/\bid=["']ilatek-footer["']/.test(html)) {
    const footer=block('FOOTER',fragment('ghl-footer-embed.html'));
    html=/<\/body>/i.test(html) ? html.replace(/<\/body>/i,footer+'</body>') : html.trimEnd()+'\n'+footer;
  }
  return formatPage(html,pagePath);
}

export function syncShells() {
  let changed=0;
  for(const file of shellFiles) {
    const before=fs.readFileSync(ROOT+'/'+file,'utf8');
    const after=composeShell(before,publicPath(file));
    if(before!==after){fs.writeFileSync(ROOT+'/'+file,after);changed++;}
  }
  return changed;
}
