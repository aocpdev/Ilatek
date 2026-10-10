/* Delta System image/metadata binder. Templates survive existing page resolvers. */
(function(w){
  'use strict';
  if(w.ILATEK_GEO)return;
  var token='{'+'{custom_values.county_name_and_state}'+'}',doc=w.document;
  function clean(v){v=String(v||'').replace(/\u00a0/g,' ').trim();return /\{\{|\}\}/.test(v)?'':v}
  function county(){
    var declared=doc.querySelectorAll('.dv-ghl-values,#dv-ghl-values'),nodes=declared.length?declared:doc.querySelectorAll('p'),values=[];
    for(var i=0;i<nodes.length;i++){
      var parts=nodes[i].textContent.split('|||DV|||');
      if(parts.length!==6)continue;
      nodes[i].style.display='none';nodes[i].setAttribute('aria-hidden','true');
      var value=clean(parts[0]);if(value&&values.indexOf(value)<0)values.push(value);
    }
    if(values.length===1)return values[0];
    // Conflicting bridges are not selected arbitrarily; use the known generic fallback.
    if(values.length>1)return 'Puerto Rico';
    var roots=doc.querySelectorAll('[data-location-label]');
    for(var j=0;j<roots.length;j++){var v=clean(roots[j].getAttribute('data-location-label'));if(v)return v}
    return 'Puerto Rico';
  }
  function enc(s){return encodeURIComponent(s).replace(/'/g,'%27')}
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
  function image(src,alt,title){
    // No resolved locality is interpolated into innerHTML. Resolution uses setAttribute below.
    return '<img src="'+esc(src)+'" alt="'+esc(alt)+'" title="'+esc(title)+'" data-ilatek-local-alt="'+enc(alt)+'" data-ilatek-local-title="'+enc(title)+'" loading="lazy" decoding="async">';
  }
  w.ILATEK_GEO={county:county,image:image};
  var queued=false,titleTemplates=new WeakMap();
  function refresh(){
    queued=false;
    var location=county(),lang=doc.documentElement.lang==='en'?'en':'es';
    var els=doc.querySelectorAll('[data-ilatek-local-alt],[data-ilatek-local-title],[data-ilatek-local-content]');
    for(var i=0;i<els.length;i++){
      var el=els[i];
      ['alt','title','content'].forEach(function(name){
        var encoded=el.getAttribute('data-ilatek-local-'+name+'-'+lang)||el.getAttribute('data-ilatek-local-'+name);
        if(!encoded)return;
        var template;try{template=decodeURIComponent(encoded)}catch(e){return}
        var value=template.split(token).join(location);
        if(el.getAttribute(name)!==value)el.setAttribute(name,value);
      });
    }
    var titles=doc.querySelectorAll('title');
    for(var t=0;t<titles.length;t++){
      var node=titles[t];if(node.closest('svg'))continue;
      if(!titleTemplates.has(node)&&node.textContent.indexOf(token)>=0)titleTemplates.set(node,node.textContent);
      if(titleTemplates.has(node)){var text=titleTemplates.get(node).split(token).join(location);if(node.textContent!==text)node.textContent=text}
    }
  }
  function schedule(){if(!queued){queued=true;w.requestAnimationFrame(refresh)}}
  if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',refresh,{once:true});else schedule();
  w.addEventListener('ilatek:lang',schedule);
  if(w.MutationObserver)new w.MutationObserver(schedule).observe(doc.documentElement,{childList:true,subtree:true,characterData:true,
    attributes:true,attributeFilter:['alt','title','content','lang','data-location-label']});
})(window);
