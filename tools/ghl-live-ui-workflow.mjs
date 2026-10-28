// Invoked only from cua_repl with its documented UI handles. No network API,
// authentication data, hidden application state or browser execution shortcuts.
import fs from 'node:fs/promises';
import {applyLiveValueContract} from './live-value-contract.mjs';
export const auditDir='/Users/axel/Documents/ChatGPT/Ilatek/documentacion/publicacion-custom-values-2026-10-28';
export async function patchCurrent(tab,entry){
 const editorState=await tab.getAXState({emit:false,disableDiffing:true});
 if(!editorState.split('\n')[0].includes('/page-builder/'+entry.id))throw Error('Wrong editor for '+entry.name);
 // GHL navigates the iframe internally without rewriting its original src.
 // Check the current iframe document URL exposed by accessibility as well.
 const innerDocument=editorState.split('\n').find(line=>line.includes('AXWebArea Page Builder, URL:'));
 if(!innerDocument?.includes('/page-builder/'+entry.id))throw Error('Wrong loaded iframe document for '+entry.name);
 const frame=tab.playwright.frameLocator('iframe[name="funnel-builder"]');
 await frame.locator('#builder-workspace .c-custom-code').first().waitFor({state:'visible',timeoutMs:15000});
 if(await frame.locator('#ai-copilot-close').isVisible())await frame.locator('#ai-copilot-close').click();
 const ids=await frame.locator('#builder-workspace .c-custom-code').evaluateAll(es=>es.map(e=>e.id));
 if(!ids.length)throw Error('No code loaded for '+entry.name);
 const result={...entry,url:await frame.locator('#hl-builder-page-link-bar a').getAttribute('href'),codes:[],status:'inspected'};
 for(const id of ids){
  await frame.locator('#'+id).click();
  await frame.getByText('General',{exact:true}).click();
  await frame.getByRole('button',{name:'Open Code Editor',exact:true}).click();
  const area=frame.locator('#hl-builder-custom-code-modal textarea');
  await area.press('ControlOrMeta+A');await area.press('ControlOrMeta+C');
  const source=await tab.clipboard.readText();
  const backup='respaldos/'+entry.id+'-'+id+'.html';
  try{await fs.writeFile(auditDir+'/'+backup,source,{flag:'wx'})}catch(e){if(e.code!=='EEXIST')throw e}
  const changed=applyLiveValueContract(source);
  result.codes.push({id,backup,length:source.length,changes:changed.changes});
  if(changed.changes.length){
   await fs.writeFile(auditDir+'/preparados/'+entry.id+'-'+id+'.html',changed.html);
   await tab.clipboard.writeText(changed.html);
   await area.press('ControlOrMeta+A');await area.press('ControlOrMeta+V');
   await area.press('ControlOrMeta+A');await area.press('ControlOrMeta+C');
   if(await tab.clipboard.readText()!==changed.html)throw Error('Readback mismatch '+entry.name);
   await frame.locator('#hl-builder-custom-code-modal').getByRole('button',{name:'Save',exact:true}).click();
  }else await frame.locator('#hl-builder-custom-code-modal').getByRole('button',{name:'Cancel',exact:true}).click();
 }
 if(result.codes.some(c=>c.changes.length))result.status='code-updated-pending-save';
 // The caller saves and publishes through separate, confirmed UI observations.
 await record(result);return result;
}
export async function record(result){
 let entries=[];try{entries=JSON.parse(await fs.readFile(auditDir+'/publicacion.json','utf8'))}catch{}
 entries=entries.filter(e=>e.id!==result.id);entries.push(result);
 await fs.writeFile(auditDir+'/publicacion.json',JSON.stringify(entries,null,2));
}
