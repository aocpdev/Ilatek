// Shared presentation fixes; preserve each page's content, links and section layout.
export const heroSelector='.il-hero,.ilr-hero,.ilc2-hero,.ilsx-hero,.ilt-hero';
export const hasServiceHero=html=>/class=["'][^"']*\b(?:il|ilr|ilc2|ilsx|ilt)-hero\b/.test(html);
function compactNavigation(code){
  if(!code.includes('var compact=false,acc=0,lastY=0,ticking=false;')||code.includes('function syncCompactBrand()'))return code;
  code=code.replace('var compact=false,acc=0,lastY=0,ticking=false;',`var compact=false,acc=0,lastY=0,ticking=false;
  var compactBrand=root.querySelector('.iln-brand');
  var brandHomeLabel=compactBrand&&compactBrand.getAttribute('aria-label');
  function syncCompactBrand(){
    if(!compactBrand)return;
    if(compact){
      compactBrand.setAttribute('role','button');
      compactBrand.setAttribute('aria-label',window.__ilatekLang==='en'?'Open navigation menu':'Abrir menú de navegación');
      compactBrand.setAttribute('aria-expanded','false');
      compactBrand.setAttribute('aria-controls',window.matchMedia('(max-width:1100px)').matches?'iln-drawer':'iln-links');
    }else{
      compactBrand.removeAttribute('role');compactBrand.removeAttribute('aria-expanded');compactBrand.removeAttribute('aria-controls');
      if(brandHomeLabel)compactBrand.setAttribute('aria-label',brandHomeLabel);
    }
  }`);
  code=code.replace("root.classList.toggle('iln-compact',on);","root.classList.toggle('iln-compact',on);syncCompactBrand();");
  return code.replace("root.addEventListener('focusin',function(){if(compact)setCompact(false)});",`root.addEventListener('focusin',function(e){if(compact&&!(compactBrand&&compactBrand.contains(e.target)))setCompact(false)});
  function activateCompactBrand(e){
    if(!compact)return;
    e.preventDefault();e.stopPropagation();setCompact(false);
    if(window.matchMedia('(max-width:1100px)').matches){openDrawer();if(burger)burger.focus({preventScroll:true})}
    else openMega(trig);
  }
  if(compactBrand){
    compactBrand.addEventListener('click',activateCompactBrand);
    compactBrand.addEventListener('keydown',function(e){if(compact&&(e.key===' '||e.key==='Enter'))activateCompactBrand(e)});
  }
  window.addEventListener('ilatek:lang',syncCompactBrand);
  window.addEventListener('resize',syncCompactBrand,{passive:true});`);
}
export function responsiveHtml(html) {
  html=html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi,(_,attrs,code)=>'<script'+attrs+'>'+compactNavigation(code)+'</script>');
  // Keep visual and keyboard order identical: navigation, language, Login, agenda.
  // Login remains a separate mobile-drawer link; this moves only the desktop link.
  html=html.replace(/(<nav\b[^>]*class="iln-links"[^>]*>)([\s\S]*?)(<\/nav>)([\s\S]*?)(<div class="iln-langwrap">[\s\S]*?<\/div>)/g,
    (all,open,links,close,agenda,language)=>{
      const login=links.match(/<a\b[^>]*href="https:\/\/portal\.ilatekpr\.com"[^>]*>Login<\/a>/);
      if(!login)return all;
      return open+links.replace(login[0],'')+close+'\n    '+language+'\n    '+login[0].replace('<a ','<a class="iln-login" ')+agenda;
    });
  html=html.replace(/<section\b[^>]*id="ilatek-nav"[^>]*>[\s\S]*?<\/section>/g,
    section=>section.replace(/[\t ]+$/gm,''));
  // Keep the accessible home-link label and the logo; remove the duplicate wordmark.
  html=html.replace(/(<a\b[^>]*\bclass=["'][^"']*\biln-brand\b[^"']*["'][^>]*>)([\s\S]*?)(<\/a>)/g,
    (_,open,content,close)=>open+content.replace(/\s*<b>Ilatek<\/b>/gi,'')+close);
  // Attribute translations must never replace an icon or other visible content.
  html=html.replaceAll("if(el.children.length===0&&el.tagName!=='INPUT'){el.textContent=av}",'');
  return html.replace(/<button\b([^>]*\bclass=["'][^"']*\bicd-nav\b[^"']*["'][^>]*)>[\s\S]*?<\/button>/g,(all,attrs)=>{
    const prev=/icd-nav--prev\b/.test(attrs);
    if(!/data-attr=/.test(attrs))attrs+=` data-attr="aria-label" data-es="Página ${prev?'anterior':'siguiente'}" data-en="${prev?'Previous':'Next'} page"`;
    const path=prev?'M19 12H5m7-7-7 7 7 7':'M5 12h14m-7-7 7 7-7 7';
    return `<button${attrs}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="${path}"></path></svg></button>`;
  });
}
