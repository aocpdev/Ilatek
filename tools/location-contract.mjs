// Delta System: localize descriptive metadata, never asset URLs or real country data.
export const COUNTY = '{{custom_values.county_name_and_state}}';
export const encodeTemplate = value => encodeURIComponent(value).replace(/'/g,'%27');
const decodeHtml = s => s.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>');
const escapeHtml = s => s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
export function localizeText(value,{image=false,en=false}={}) {
  let text=String(value||'').trim();
  if(text.includes(COUNTY)) return text.replace(/\s+(?:en|in) Puerto Rico\b/gi,'');
  if(/Puerto Rico/i.test(text)) return text.replace(/Puerto Rico/gi,COUNTY);
  if(image) return text+(en?' — service in ':' — servicio en ')+COUNTY;
  const parts=text.split(' | ');
  parts[0]+=' en '+COUNTY;
  return parts.join(' | ');
}
const attr = (tag,name) => tag.match(new RegExp('\\s'+name+'=(["\'])(.*?)\\1','s'))?.[2];
function setAttr(tag,name,value) {
  const re=new RegExp('(\\s'+name+'=)(["\'])(.*?)\\2','s');
  const encoded=escapeHtml(value);
  return re.test(tag)?tag.replace(re,()=>` ${name}="${encoded}"`):tag.replace(/\s*\/?>(\s*)$/,` ${name}="${encoded}">$1`);
}
function imageTag(tag) {
  if(tag.includes("'+s.img+'"))
    return "'+window.ILATEK_GEO.image(s.img,alt,kk+(isEn?' — Ilatek in ':' — Ilatek en ')+'"+COUNTY+"')+'";
  // Nonliteral templates are verified after their generator produces HTML.
  if(/['"]\s*\+|\$\{/.test(tag)) return tag;
  const oldAlt=attr(tag,'alt'),decorative=oldAlt===''||/\baria-hidden=["']true/.test(tag);
  if(!decorative) {
    const alt=localizeText(decodeHtml(oldAlt||attr(tag,'title')||'Ilatek'),{image:true});
    tag=setAttr(tag,'alt',alt);
    tag=setAttr(tag,'data-ilatek-local-alt',encodeTemplate(alt));
  }
  if(!decorative||attr(tag,'title')) {
    const title=localizeText(decodeHtml(attr(tag,'title')||oldAlt||'Ilatek'),{image:true});
    tag=setAttr(tag,'title',title);
    tag=setAttr(tag,'data-ilatek-local-title',encodeTemplate(title));
  }
  // Preserve authored image translations and prevent the language toggle reverting locality.
  for(const suffix of ['', '2']) {
    const name=attr(tag,'data-attr'+suffix);
    if(!['alt','title'].includes(name))continue;
    for(const lang of ['es','en']) {
      const value=attr(tag,'data-'+lang+suffix);
      if(!value)continue;
      const template=localizeText(decodeHtml(value),{image:true,en:lang==='en'});
      tag=setAttr(tag,'data-'+lang+suffix,template);
      tag=setAttr(tag,'data-ilatek-local-'+name+'-'+lang,encodeTemplate(template));
    }
  }
  return tag;
}
export function localizeHtml(source) {
  let html=source.replace(/<title>([^<]*)<\/title>/gi,(_,t)=>'<title>'+escapeHtml(localizeText(decodeHtml(t)))+'</title>');
  html=html.replace(/<meta\b[^>]*>/gi,tag=>{
    const key=attr(tag,'name')||attr(tag,'property');
    if(!['description','og:title','og:description','twitter:title','twitter:description','geo.placename','og:image:alt','twitter:image:alt'].includes(key))return tag;
    const value=key==='geo.placename'?COUNTY:localizeText(decodeHtml(attr(tag,'content')||''));
    return setAttr(setAttr(tag,'content',value),'data-ilatek-local-content',encodeTemplate(value));
  });
  // Each page's SEO block gets matching social-image descriptions (URLs stay untouched).
  html=html.replace(/(<!-- ▼▼ \/[^\n]+? ▼▼ -->)([\s\S]*?)(<!-- ▲▲ fin \/[^\n]+? ▲▲ -->)/g,(_,start,body,end)=>{
    const title=decodeHtml(body.match(/<title>([^<]*)<\/title>/)?.[1]||'Ilatek en '+COUNTY);
    if(!/property="og:image:alt"/.test(body))body=body.replace(/(<meta property="og:image"[^>]*>)/,`$1\n<meta property="og:image:alt" content="${escapeHtml(title)}" data-ilatek-local-content="${encodeTemplate(title)}">`);
    if(!/name="twitter:image:alt"/.test(body))body=body.replace(/(<meta name="twitter:image"[^>]*>)/,`$1\n<meta name="twitter:image:alt" content="${escapeHtml(title)}" data-ilatek-local-content="${encodeTemplate(title)}">`);
    return start+body+end;
  });
  html=html.replace(/\b(altSeo|altEn):'((?:\\.|[^'\\])*)'/g,(_,key,value)=>key+":'"+localizeText(value,{image:true,en:key==='altEn'})+"'");
  html=html.replace(/var alt=isEn\?\(\(s\.altEn[^\n]+;/g,"var alt=isEn?(s.altEn||'Ilatek — service in "+COUNTY+"'):(s.altSeo||'Ilatek — servicio en "+COUNTY+"');");
  html=html.replace(/<img\b[^>]*>/gi,imageTag);
  html=html.replaceAll("kk+' — Ilatek en "+COUNTY+"')", "kk+(isEn?' — Ilatek in ':' — Ilatek en ')+'"+COUNTY+"')");
  // The older Spanish-only carousel has neither kk nor isEn. Preserve its own
  // service label instead of borrowing locals from the bilingual Home renderer.
  html=html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi,(all,attrs,code)=>{
    if(!code.includes("title=s.kicker+' — Ilatek '+county"))return all;
    return '<script'+attrs+'>'+code.replaceAll(
      "kk+(isEn?' — Ilatek in ':' — Ilatek en ')+'"+COUNTY+"'",
      "s.kicker+' — Ilatek en "+COUNTY+"'")+'</script>';
  });
  html=html.replace(/(<script\b[^>]*type=["']application\/ld\+json["'][^>]*>)([\s\S]*?)(<\/script>)/gi,(all,start,code,end)=>{
    let json;try{json=JSON.parse(code)}catch(e){return all}
    let changed=false;
    function visit(value){
      if(!value||typeof value!=='object')return;
      if(value['@type']==='WebPage')for(const key of ['name','description'])if(typeof value[key]==='string'){
        const next=localizeText(value[key]);if(next!==value[key]){value[key]=next;changed=true}
      }
      Object.values(value).forEach(v=>Array.isArray(v)?v.forEach(visit):visit(v));
    }
    visit(json);
    return changed?start+'\n'+JSON.stringify(json,null,2).replace(/</g,'\\u003c')+'\n'+end:all;
  });
  return html;
}
