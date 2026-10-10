import fs from 'node:fs';
import path from 'node:path';
import { ROOT, structure } from './site-paths.mjs';
export const TOKEN = '{{custom_values.website_url}}';
export const PREFIX = 'https://' + TOKEN;
const runtime = fs.readFileSync(path.join(ROOT,'src/compartido/internal-links.js'),'utf8');
const block = '<!-- ILATEK:INTERNAL-LINKS:START -->\n<script>\n'+runtime+'\n</script>\n<!-- ILATEK:INTERNAL-LINKS:END -->\n';
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
  let text=normalizeTemplates(source.replace(blockRE,''));
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
  if(headOnly || (!/data-ilatek-path=/.test(text) && !text.includes('window.ILATEK_LINKS'))) return text;
  // Full legal documents keep their DOCTYPE first; fragments get an inline, self-contained helper.
  return /<head\b[^>]*>/i.test(text) ? text.replace(/<head\b[^>]*>/i,m=>m+'\n'+block) : block+text;
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
