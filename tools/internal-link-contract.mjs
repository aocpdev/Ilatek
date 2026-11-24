import fs from 'node:fs';
import path from 'node:path';
import { ROOT, structure } from './site-paths.mjs';
import { localizeHtml } from './location-contract.mjs';
import { responsiveHtml } from './responsive-contract.mjs';
export const TOKEN = '{{custom_values.website_url}}';
export const PREFIX = 'https://' + TOKEN;
const runtime = ['internal-links.js','location-values.js','responsive-layout.js'].map(file=>fs.readFileSync(path.join(ROOT,'src/compartido',file),'utf8')).join('\n');
// Shared CSS in cascade order: layout/navigation fixes, then the fluid headline scale.
const css=['responsive-layout.css','fluid-type.css','hero-layout.css'].map(f=>fs.readFileSync(path.join(ROOT,'src/compartido',f),'utf8')).join('\n');
const block = '<!-- ILATEK:INTERNAL-LINKS:START -->\n<style>\n'+css+'\n</style>\n<script>\n'+runtime+'\n</script>\n<!-- ILATEK:INTERNAL-LINKS:END -->\n';
const blockRE = /<!-- ILATEK:INTERNAL-LINKS:START -->[\s\S]*?<!-- ILATEK:INTERNAL-LINKS:END -->\s*/g;
export function publicPath(file) {
  const p = structure.pages.find(p=>p.file===file);
  if(p) return '/'+p.slug;
  if(file.includes('politica-de-privacidad')) return '/politica-de-privacidad';
  if(file.includes('terminos-y-condiciones')) return '/terminos-y-condiciones';
  if(file.startsWith('resenas/')) return '/resenas';
  if(file.startsWith('archivo/')) return '/limpieza';
  if(/ghl-custom-code(?:-embedded|-paste)?\.html$/.test(file)) return '/cotizacion';
  return '/home';
}
export function normalizeTemplates(text) {
  // A token followed by a path is a URL, not a resolver key or data source.
  return text.replace(/(?<!https:\/\/|http:\/\/)\{\{custom_values\.website_url\}\}(?=\/)/g, PREFIX);
}
function anchor(tag, pagePath) {
  // This deliberately excludes SVG <use>, external links, mailto and tel.
  if (/\bdata-ilatek-path=/.test(tag)) return tag;
  return tag.replace(/\bhref\s*=\s*(["'])(.*?)\1/s, (all,q,value)=>{
    let suffix, section = '';
    if(value.startsWith(PREFIX)) suffix=value.slice(PREFIX.length)||'/';
    else if(value.startsWith(TOKEN)) suffix=value.slice(TOKEN.length)||'/';
    else if(/^https?:\/\/(?:www\.)?ilatekpr\.com(?:[/?#]|$)/i.test(value)) suffix=value.replace(/^https?:\/\/(?:www\.)?ilatekpr\.com/i,'')||'/';
    else if(value.startsWith('/')&&!value.startsWith('//')) suffix=value;
    else if(value.startsWith('#')&&value.length>1){suffix=pagePath+value;section=value.slice(1);}
    else return all;
    if(!suffix.startsWith('/')) suffix='/'+suffix;
    const esc=s=>s.replace(/&(?!(?:amp|quot|#\d+);)/g,'&amp;').replace(/"/g,'&quot;');
    return `href=${q}${PREFIX}${suffix}${q} data-ilatek-path="${esc(suffix)}"${section ? ` data-ilatek-anchor="${esc(section)}"` : ''}`;
  });
}
function scriptFix(code) {
  let out=code;
  // Existing binders keep ownership of copy; only the website replacement is normalized.
  for(const expr of ['n.nodeValue','v','text']) out=out.split(`${expr}.split(k).join(values[k])`).join(`window.ILATEK_LINKS.replace(${expr},k,values[k])`);
  out=out.replace(/(String\(text\|\|''\)\.split\(token\('county_name_and_state'\)\)\.join\(county\))\.split\(token\('website_url'\)\)\.join\(website\)/g,"window.ILATEK_LINKS.replace($1,token('website_url'),website)");
  out=out.replace(/out\.split\(token\('website_url'\)\)\.join\(website\)/g,"window.ILATEK_LINKS.replace(out,token('website_url'),website)");
  out=out.replace(/(n\.nodeValue|a\.value)\.split\(token\)\.join\(website\)/g,'window.ILATEK_LINKS.replace($1,token,website)');
  out=out.replaceAll("var url=website.replace(/\\/+$/,'')+'/'+s.slug;", "var url=window.ILATEK_LINKS.join(website,'/'+s.slug);");
  out=out.replaceAll('class="ils-card" href="\'+url+\'" aria-label=', 'class="ils-card" href="\'+url+\'" data-ilatek-path="/\'+s.slug+\'" aria-label=');
  out=out.replace("hub.href=site+'/servicios-techos';", "hub.href=window.ILATEK_LINKS.join(site,'/servicios-techos');hub.setAttribute('data-ilatek-path','/servicios-techos');");
  // Schema resolver used by the three historical cleaning variants.
  out=out.replace("schema.textContent.replace(/{{custom_values\\.county_name_and_state}}/g,location).replace(/\\{\\{custom_values\\.website_url\\}\\}/g,website)","window.ILATEK_LINKS.replace(schema.textContent.replace(/{{custom_values\\.county_name_and_state}}/g,location),'{'+ '{custom_values.website_url}' +'}',website)");
  return out;
}
export function formatPage(source, pagePath='/home', {headOnly=false}={}) {
  const raw=String(source).replace(/\r\n?/g,'\n');
  const leadingCharset=raw.match(/^<meta\s+charset=[^>]*>\s*/i);
  source=leadingCharset ? raw.slice(leadingCharset[0].length) : raw;
  // El blog no se localiza por municipio: sus páginas no llevan el token del
  // condado en alt ni en metadatos (verify-blog lo prohíbe y no habría landing
  // por pueblo a la que apuntar).
  const base=normalizeTemplates(source.replace(blockRE,''));
  let text=responsiveHtml(pagePath.startsWith('/blog')?base:localizeHtml(base)).replace(/\/limpieza\/#ilatek-conocenos/g,'/#ilatek-conocenos');
  text=text.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi,(all,attrs,code)=>{
    if(/application\/ld\+json/.test(attrs)) {
      code=code.replace(/"\{\{custom_values\.website_url\}\}"/g,JSON.stringify(PREFIX+'/'));
      code=code.replace(/"https:\/\/\{\{custom_values\.website_url\}\}"/g,JSON.stringify(PREFIX+'/'));
      return '<script'+attrs+'>'+code+'</script>';
    }
    return '<script'+attrs+'>'+scriptFix(code)+'</script>';
  });
  // Only literal HTML attributes. Hardcoded fallback constants and external media stay intact.
  text=text.replace(/<a\b[^>]*>/gi,tag=>anchor(tag,pagePath));
  text=text.replace(/<(?:link|meta)\b[^>]*>/gi,tag=>tag.replace(/((?:href|content)=["'])https?:\/\/(?:www\.)?ilatekpr\.com(?=[/"'])/gi,'$1'+PREFIX));
  if(headOnly || (!/data-ilatek-path=|data-ilatek-local-/.test(text) && !text.includes('window.ILATEK_LINKS'))) return (leadingCharset?leadingCharset[0]:'')+text;
  // Full legal documents keep their DOCTYPE first; fragments get an inline, self-contained helper.
  // The test must look at the document head, not at a "<head>" mentioned inside the
  // shared scripts: inserting the block there would split the script and leak its code.
  const headAt=text.search(/<head\b[^>]*>/i), scriptAt=text.search(/<script\b/i);
  const isDocument=headAt>=0 && (scriptAt<0 || headAt<scriptAt);
  if (isDocument) return text.replace(/<head\b[^>]*>\s*/i,m=>m.trimEnd()+'\n'+block);
  // A fragment may declare its own encoding. Keep that declaration before the
  // generated internal-link block so applying the contract stays idempotent.
  const charset = leadingCharset ? leadingCharset[0] : '';
  return charset+block+text;
}
export function deliveryFiles() {
  const dirs=['home','categorias','servicios','componentes','archivo','resenas','politica-de-privacidad','terminos-y-condiciones','techos'];
  const files=[];
  function walk(dir){for(const e of fs.readdirSync(path.join(ROOT,dir),{withFileTypes:true})){
    if(e.name==='assets')continue;const p=dir+'/'+e.name;
    if(e.isDirectory())walk(p);else if(e.name.endsWith('.html'))files.push(p);
  }}
  dirs.forEach(walk);
  files.push(...fs.readdirSync(ROOT).filter(n=>n.endsWith('.html')));
  files.push('documentacion/seo/limpieza-head-original.html');
  return files;
}
