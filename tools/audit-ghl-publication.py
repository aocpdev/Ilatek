"""Read only audit of public URLs explicitly recorded from the GHL editor UI."""
import json, pathlib, subprocess, concurrent.futures, datetime
from html.parser import HTMLParser
ROOT=pathlib.Path(__file__).resolve().parents[1]/'documentacion/publicacion-custom-values-2026-10-28'
class Page(HTMLParser):
    def __init__(self):
        super().__init__();self.bad=[];self.badTexts=[];self.meta=[];self.links=[];self.titles=[];self.head=False;self.title=False;self.skip=0;self.schemas=[];self.schema=False
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=='head':self.head=True
        if tag=='title':self.title=True
        if tag=='script':self.skip+=1;self.schema=a.get('type')=='application/ld+json';return
        if tag=='style':self.skip+=1;return
        if self.skip:return
        if tag in ('meta','link') and self.head:self.meta.append(a)
        if tag=='a':self.links.append(a.get('href',''))
        for key,value in attrs:
            if value and ('{{custom_values.' in value or 'https://https://' in value):self.bad.append({'tag':tag,'attr':key,'value':value[:180]})
    def handle_endtag(self,tag):
        if tag=='head':self.head=False
        if tag=='title':self.title=False
        if tag in ('script','style'):self.skip=max(0,self.skip-1);self.schema=False
    def handle_data(self,text):
        if self.title:self.titles.append(text)
        if not self.skip and '{{custom_values.' in text:self.badTexts.append(text[:180])
        if self.schema:
            try:self.schemas.append(json.loads(text))
            except:self.schemas.append({'invalidJson':True})
def audit(entry):
    result={k:entry[k] for k in ('id','name','url')}
    try:
        r=subprocess.run(['curl','-sS','-L','--max-time','35','-w','\n%{http_code} %{url_effective}',entry['url']],capture_output=True,text=True,check=True,timeout=40)
        html,info=r.stdout.rsplit('\n',1);status,url=info.split(' ',1);result.update(status=int(status),finalUrl=url)
        folder=ROOT/'verificados';folder.mkdir(exist_ok=True)
        (folder/(entry['id']+'.html')).write_text(html)
        p=Page();p.feed(html)
        result.update(titles=p.titles,meta=p.meta,unresolvedAttributes=p.bad,unresolvedTexts=p.badTexts,links=len(p.links),badProtocols=[l for l in p.links if 'https://https://' in l],schemaTokens='{{custom_values.' in json.dumps(p.schemas),schemaCount=len(p.schemas),htmlFile='verificados/'+entry['id']+'.html')
    except Exception as e:result['error']=str(e)
    return result
entries=json.loads((ROOT/'publicacion.json').read_text())
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:results=list(pool.map(audit,entries))
(ROOT/'verificacion-publica-final.json').write_text(json.dumps({'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'pages':results},ensure_ascii=False,indent=2))
print(json.dumps({'pages':len(results),'http200':sum(p.get('status')==200 for p in results),'errors':[p['name'] for p in results if 'error'in p],'unresolved':[(p['name'],len(p.get('unresolvedAttributes',[]))) for p in results if p.get('unresolvedAttributes')],'badProtocols':sum(len(p.get('badProtocols',[])) for p in results)},ensure_ascii=False))
