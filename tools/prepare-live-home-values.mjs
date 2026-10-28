import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = 'documentacion/publicacion-custom-values-2026-10-28';
let html = fs.readFileSync(`${root}/respaldos/home-editor-antes.html`, 'utf8');
const original = html;
function replaceOnce(before, after) {
  if (!html.includes(before)) throw new Error(`Missing patch anchor: ${before.slice(0,80)}`);
  html = html.replace(before, after);
}
html = html.replaceAll('business__county_name', 'county_name_and_state');
html = html.replace(/<!-- ILATEK · resolver global[\s\S]*?-->\s*/, '<!-- ILATEK: six native GHL values; preserve current page content. -->\n');
html = html.replace(/  var BRAND=.*?;\n/, '  var BRAND={pixel_id:"2092249571384387"};\n');
replaceOnce("MIN=6,FULL=7,PIXEL=6", "MIN=6,FULL=6,PIXEL=6");
const start = html.indexOf('  function fromParagraph(){');
const end = html.indexOf('\n  // Atributos', start);
html = html.slice(0,start) + `  function valid(value,index){
    var v=clean(value);
    if(/[<>\\x00-\\x1f]/.test(v))return '';
    if(index===1&&v&&!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(v))return '';
    if(index===2&&v&&!/^\\+?[\\d ()-]{7,25}$/.test(v))return '';
    if(index>=3&&v){
      try{var u=new URL(/^https?:\\/\\//i.test(v)?v:'https://'+v);
        if(!/^https?:$/.test(u.protocol)||u.username||u.password||!u.hostname.includes('.'))return '';
        if(index===3)return u.origin;
        return u.href;
      }catch(e){return ''}
    }
    return v;
  }
  function fromParagraph(){
    var ps=list('.dv-ghl-values,#dv-ghl-values'),found=null;
    for(var i=0;i<ps.length;i++){
      var raw=String(ps[i].textContent||'');
      if(raw.indexOf('{{')>=0)continue;
      var parts=raw.split(SEP);
      if(parts.length!==6)continue;
      parts=parts.map(function(v,i){return valid(v,i)});
      if(!parts[0]||!parts[3])continue;
      if(found&&JSON.stringify(found)!==JSON.stringify(parts))return null;
      found=parts;
    }
    return found?{values:found,nodes:ps,source:'parrafo'}:null;
  }
` + html.slice(end);
const rstart = html.indexOf('  // El pueblo que GHL expande');
const rend = html.indexOf('  // El párrafo manda:', rstart);
html = html.slice(0,rstart) + `  function read(){return fromParagraph()||fromData()}

` + html.slice(rend);
replaceOnce("    if(values&&source==='parrafo')return values;\n", '');
replaceOnce('vals[i]=clean(got.values[i]);','vals[i]=valid(got.values[i],i);');
replaceOnce("return x||DEF[i]||m;", "return x||DEF[i]||'';");
replaceOnce("return i<0?'':(clean(v[i])||DEF[i]||'');", "return i<0?m:(clean(v[i])||DEF[i]||'');");
replaceOnce('if(carriers.indexOf(t.parentNode)>=0)continue;', "if(t.parentElement&&t.parentElement.closest('.dv-ghl-values,#dv-ghl-values'))continue;");
replaceOnce('if(carriers.indexOf(els[i])>=0)continue;', "if(els[i].closest('.dv-ghl-values,#dv-ghl-values'))continue;");
replaceOnce("for(var i=0;i<q.length;i++){", "for(var i=0;q&&i<q.length;i++){");
replaceOnce("    sweep();\n    landed();", "    sweep();\n    landed();");
html = html.replace(/<!-- ILATEK · párrafo portador[\s\S]*?<\/p>/, '<!-- Native GHL Paragraph .dv-ghl-values is placed before this Custom Code; exactly six slots. -->');
// GHL's SEO panel is the authoritative server-rendered HEAD. This old embedded
// block duplicated it with a different title, description, canonical and image.
html = html.replace(/<!-- ═══ HEAD SEO \/home[\s\S]*?<!-- ▲▲ fin \/home ▲▲ -->/, '<!-- SEO metadata is managed in the native GHL SEO panel. -->');
html = html.replaceAll('href="https://www.facebook.com/ilatek.pr/"','href="{{custom_values.facebook_url}}"')
  .replaceAll('href="https://www.instagram.com/ilatek.pr/"','href="{{custom_values.instagram_url}}"');
// Literal opening braces in JavaScript/comments are not merge fields. Keep
// them out of GHL's template parser; only real Custom Values retain {{...}}.
html=html.replaceAll("indexOf('{{')", "indexOf('{'+'{')")
  .replaceAll('{{county}}','[county]').replaceAll('{{website_url}}','[website_url]');
replaceOnce("    if(state==='ready'&&source==='parrafo')return true;\n    if(!ensure())return false;", "    if(!ensure())return false;\n    var signature=JSON.stringify(values);\n    if(state==='ready'&&signature===lastSignature)return true;\n    lastSignature=signature;");
replaceOnce("var journal=[];", "var journal=[],lastSignature='';");
replaceOnce('    sweep();\n    landed();', '    sweep(true);\n    landed();');
replaceOnce('    if(!fired){', '    {');
const bootStart=html.indexOf('  function boot(){');
const bootEnd=html.indexOf('  // El portador nunca',bootStart);
html=html.slice(0,bootStart)+`  function boot(){
    if(!settle()){
      state='missing';root.setAttribute('data-ilatek-values','missing');sweep(true);
    }
    if(window.MutationObserver){
      var pending=false;
      new MutationObserver(function(changes){
        if(pending)return;
        var relevant=changes.some(function(change){
          var target=change.target.nodeType===1?change.target:change.target.parentElement;
          return (target&&target.closest('.dv-ghl-values,#dv-ghl-values'))||
            Array.prototype.some.call(change.addedNodes||[],function(n){return n.nodeType===1&&(n.matches('.dv-ghl-values,#dv-ghl-values')||n.querySelector('.dv-ghl-values,#dv-ghl-values'))});
        });
        if(!relevant)return;
        pending=true;setTimeout(function(){pending=false;settle()},0);
      }).observe(root,{childList:true,subtree:true,characterData:true});
    }
  }

`+html.slice(bootEnd);
// A website value can contain its own protocol. The link contract runtime
// retains paths and normalizes these after native substitution.
replaceOnce("return String(v==null?'':v).replace(TOKEN,function(m,n){", "return String(v==null?'':v).replace(TOKEN,function(m,n){");
html = html.replace('return x||DEF[i]||\'\';\n    });', "return x||DEF[i]||'';\n    }).replace(/https?:\\/\\/(https?:\\/\\/)/gi,'$1');");
// Keep the existing tracking implementation separate from the six-slot carrier.
if (html.includes('info@ilatekpr.com') || html.includes('787-561-7333')) throw new Error('Stale contact remains');
// Only markup and structured data need server merge processing. JavaScript
// dictionaries retain equivalent escaped token strings for the runtime bridge.
// This also removes the non-field wildcard example from a comment.
html=html.replaceAll('{{custom_values.*}}','GHL Custom Values');
html=html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi,(whole,attrs,body)=>{
  if(/type=["']application\/ld\+json/i.test(attrs))return whole;
  return '<script'+attrs+'>'+body.replace(/\{\{custom_values\.([\w]+)\}\}/g,(_,key)=>'\\u007b\\u007bcustom_values.'+key+'\\u007d\\u007d')+'</script>';
});
let scripts=0;
for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
  if(/type=["']application\/ld\+json/i.test(m[1])||!m[2].trim()) continue;
  new vm.Script(m[2]); scripts++;
}
const out = `${root}/preparados/home-custom-code.html`;
fs.mkdirSync(path.dirname(out),{recursive:true});
fs.writeFileSync(out,html);
console.log(JSON.stringify({out,original:original.length,prepared:html.length,scripts}));
