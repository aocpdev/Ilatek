/* Measure only the fixed bar, not its expanded drawer. No scroll-driven spacing. */
(function(w,d){
  if(w.ILATEK_LAYOUT)return;
  w.ILATEK_LAYOUT=true;
  var bar,frame,observer;
  function measure(){
    frame=0;
    if(!bar||!bar.isConnected)return;
    var bottom=Math.ceil(bar.getBoundingClientRect().bottom);
    if(bottom>0&&bottom<300)d.documentElement.style.setProperty('--ilatek-menu-bottom',bottom+'px');
  }
  function queue(){if(!frame)frame=w.requestAnimationFrame(measure)}
  function start(){
    bar=d.querySelector('#ilatek-nav .iln-shell');
    if(!bar)return;
    if(observer)observer.disconnect();
    measure();
    if(w.ResizeObserver)new ResizeObserver(queue).observe(bar);
    w.addEventListener('resize',queue,{passive:true});
    if(d.fonts&&d.fonts.ready)d.fonts.ready.then(queue);
  }
  function boot(){
    if(d.querySelector('#ilatek-nav .iln-shell'))start();
    else{observer=new MutationObserver(start);observer.observe(d.documentElement,{childList:true,subtree:true})}
  }
  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})(window,document);
