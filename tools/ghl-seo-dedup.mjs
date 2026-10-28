import fs from 'node:fs/promises';
import crypto from 'node:crypto';
export const auditDir='/Users/axel/Documents/ChatGPT/Ilatek/documentacion/seo-unificado-2026-10-28';
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
export function deduplicateSeo(source){
 const pattern=/<!-- ═══ HEAD SEO[^]*?<!-- ▲▲[^]*?-->/g;
 const blocks=[...source.matchAll(pattern)];
 if(blocks.length!==1)throw Error('Expected one embedded HEAD SEO block');
 const block=blocks[0][0];
 if((block.match(/<title\b/g)||[]).length!==1||/<script\b|<style\b|<(?:h[1-6]|section|div|img|a)\b/i.test(block))throw Error('Unexpected non-metadata content in SEO block');
 const remainder=block.replace(/<!--[^]*?-->/g,'').replace(/<title\b[^]*?<\/title>/gi,'').replace(/<(?:meta|link)\b[^>]*>/gi,'').trim();
 if(remainder)throw Error('Unrecognized content in SEO block');
 const replacement='<!-- ILATEK: SEO title, description, social metadata and canonical are managed in the native GHL SEO panel. -->';
 const html=source.slice(0,blocks[0].index)+replacement+source.slice(blocks[0].index+block.length);
 return {html,removed:block,removedBytes:Buffer.byteLength(block),beforeHash:hash(source),afterHash:hash(html),contentHash:hash(source.replace(block,''))};
}
export async function record(entry){
 await fs.mkdir(auditDir,{recursive:true});let all=[];try{all=JSON.parse(await fs.readFile(auditDir+'/publicacion.json','utf8'))}catch{}
 all=all.filter(x=>x.id!==entry.id);all.push(entry);await fs.writeFile(auditDir+'/publicacion.json',JSON.stringify(all,null,2));
}
export async function patchCode(tab,entry){
 const state=await tab.getAXState({emit:false,disableDiffing:true});
 if(!state.split('\n')[0].includes(entry.id)||!state.split('\n').some(l=>l.includes('AXWebArea Page Builder, URL:')&&l.includes(entry.id)))throw Error('Editor identity mismatch');
 const f=tab.playwright.frameLocator('iframe[name="funnel-builder"]');
 await f.locator('#builder-workspace .c-custom-code').first().waitFor({state:'visible',timeoutMs:15000});
 if(await f.locator('#ai-copilot-close').isVisible())await f.locator('#ai-copilot-close').click();
 const seoClose=f.locator('#hl-builder-seo-meta-drawer #hl-builder-creator-header-close');
 if(await seoClose.isVisible())await seoClose.click();
 await fs.mkdir(auditDir+'/respaldos',{recursive:true});await fs.mkdir(auditDir+'/preparados',{recursive:true});
 const ids=await f.locator('#builder-workspace .c-custom-code').evaluateAll(es=>es.map(e=>e.id));
 const result={...entry,url:await f.locator('#hl-builder-page-link-bar a').getAttribute('href'),codes:[],status:'prepared'};
 for(const id of ids){
  await f.locator('#'+id).click();await f.getByText('General',{exact:true}).click();await f.getByRole('button',{name:'Open Code Editor',exact:true}).click();
  const area=f.locator('#hl-builder-custom-code-modal textarea');await area.press('ControlOrMeta+A');await area.press('ControlOrMeta+C');const source=await tab.clipboard.readText();
  if(!source.includes('<!-- ═══ HEAD SEO')){await f.locator('#hl-builder-custom-code-modal').getByRole('button',{name:'Cancel',exact:true}).click();continue}
  const change=deduplicateSeo(source);const name=entry.id+'-'+id+'.html';
  await fs.writeFile(auditDir+'/respaldos/'+name,source,{flag:'wx'});
  await fs.writeFile(auditDir+'/preparados/'+name,change.html);
  await fs.writeFile(auditDir+'/respaldos/'+entry.id+'-removed-head.html',change.removed);
  await tab.clipboard.writeText(change.html);await area.press('ControlOrMeta+A');await area.press('ControlOrMeta+V');await area.press('ControlOrMeta+A');await area.press('ControlOrMeta+C');
  if(await tab.clipboard.readText()!==change.html)throw Error('Editor readback mismatch');
  await f.locator('#hl-builder-custom-code-modal').getByRole('button',{name:'Save',exact:true}).click();
  result.codes.push({id,backup:'respaldos/'+name,prepared:'preparados/'+name,removedBytes:change.removedBytes,beforeHash:change.beforeHash,afterHash:change.afterHash,unchangedContentHash:change.contentHash});
 }
 if(result.codes.length!==1)throw Error('Expected one corrected code block');
 await record(result);return result;
}
