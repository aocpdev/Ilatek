"""Public HTML verification; no authenticated requests or hidden application state."""
import json,pathlib,subprocess,concurrent.futures,datetime,sys,collections
from html.parser import HTMLParser
BASE=pathlib.Path(__file__).resolve().parents[1]/'documentacion'
OLD=BASE/'publicacion-custom-values-2026-10-28';OUT=BASE/'seo-unificado-2026-10-28'
class Scan(HTMLParser):
 def __init__(self):
  super().__init__();self.skip=0;self.title=False;self.h1=False;self.lang='';self.titles=[];self.h1s=[];self.tags=[];self.canonical=[];self.pending=[];self.schema=False;self.schemas=[]
 def handle_starttag(self,t,attrs):
  a=dict(attrs)
  if t=='html':self.lang=a.get('lang','')
  if t=='title':self.title=True
  if t=='h1':self.h1=True
  if t in ('script','style'):
   self.skip+=1;self.schema=t=='script' and a.get('type')=='application/ld+json';return
  if self.skip:return
  if t=='meta':self.tags.append(a)
  if t=='link' and a.get('rel')=='canonical':self.canonical.append(a.get('href',''))
  for k,v in attrs:
   if v and ('{{custom_values.' in v or 'https://https://' in v):self.pending.append((t,k,v[:150]))
 def handle_endtag(self,t):
  if t=='title':self.title=False
  if t=='h1':self.h1=False
  if t in ('script','style'):self.skip=max(0,self.skip-1);self.schema=False
 def handle_data(self,s):
  if self.title:self.titles.append(s)
  if self.h1:self.h1s.append(s)
  if not self.skip and '{{custom_values.' in s:self.pending.append(('text',s[:150]))
  if self.schema:
   try:self.schemas.append(json.loads(s))
   except:self.schemas.append({'invalid':True})
def fetch(p):
 try:
  r=subprocess.run(['curl','-sS','-L','--max-time','40','-w','\n%{http_code}',p['url']],capture_output=True,text=True,check=True,timeout=45)
  html,status=r.stdout.rsplit('\n',1);s=Scan();s.feed(html)
  old=Scan();old.feed((OLD/p['htmlFile']).read_text())
  (OUT/'verificados').mkdir(parents=True,exist_ok=True);(OUT/'verificados'/(p['id']+'.html')).write_text(html)
  keys=collections.Counter(x.get('name',x.get('property','')) for x in s.tags)
  tracked=['description','og:title','og:description','og:image','twitter:card','twitter:image']
  return {'id':p['id'],'name':p['name'],'url':p['url'],'status':int(status),'lang':s.lang,'titles':s.titles,'canonical':s.canonical,'keyCounts':{k:keys[k] for k in tracked},'pending':s.pending,'h1Unchanged':s.h1s==old.h1s,'schemaUnchanged':s.schemas==old.schemas,'nativeTitlePreserved':s.titles==[old.titles[0]],'metadata':s.tags}
 except Exception as e:return {'id':p['id'],'name':p['name'],'error':str(e)}
all_pages=json.loads((OLD/'verificacion-publica-final.json').read_text())['pages']
scan_all='--all' in sys.argv
pages=all_pages if scan_all else [p for p in all_pages if len(p['titles'])>1]
if len(sys.argv)>1 and not scan_all:pages=[p for p in pages if p['id']==sys.argv[1]]
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:results=list(pool.map(fetch,pages))
OUT.mkdir(exist_ok=True);name='verificacion-60-paginas.json' if scan_all else ('verificacion-final.json' if len(pages)==15 else 'verificacion-piloto.json')
(OUT/name).write_text(json.dumps({'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'pages':results},ensure_ascii=False,indent=2))
print(json.dumps([{k:p.get(k) for k in ('name','status','lang','titles','keyCounts','h1Unchanged','schemaUnchanged','nativeTitlePreserved','error')} for p in results],ensure_ascii=False))
