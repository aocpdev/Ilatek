// Mechanical Custom Value corrections only. Never regenerate page content.
export function applyLiveValueContract(source) {
  let html=source.replaceAll('business__county_name','county_name_and_state');
  const changes=[];
  if(html!==source)changes.push('county_name_and_state');
  for(const [url,key] of [
    ['https://www.facebook.com/ilatek.pr/','facebook_url'],
    ['https://www.instagram.com/ilatek.pr/','instagram_url']
  ]) {
    const pattern=new RegExp('href=(["\'])'+url.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\1','g');
    let count=0;
    html=html.replace(pattern,()=>{count++;return `href="{{custom_values.${key}}}"`;});
    if(count)changes.push(`${key}: ${count} links`);
  }
  return {html,changes};
}
