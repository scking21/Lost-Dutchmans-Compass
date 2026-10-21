import {catalogue} from './catalogue.mjs';
export function mountCurated({document,fetch,setTimeout,clearTimeout,AbortController,now=Date.now}){
 const $=id=>document.getElementById(id),form=$('curated-form');if(!form)return;
 const places=[],tastes=[];let choice=null,pending=false,enabled=false,expiryTimer=null;
 const expired=item=>!Number.isFinite(item.expiresAt)||item.expiresAt<=now();
 const selectedTastes=()=>tastes.filter(t=>t.selected);
 const rankExpired=()=>[...places,...selectedTastes()].some(expired);
 const el=(tag,text)=>{const n=document.createElement(tag);n.textContent=text;return n;};
 const eligible=catalogue.filter(c=>!c.blocked&&c.address);
 for(const c of eligible){const o=el('option',`${c.name} · ${c.address} · ${c.visitWarning}`);o.value=c.id;$('curated-place').append(o);}
 function render(){
  clearTimeout(expiryTimer);const future=[...places,...tastes].map(i=>i.expiresAt).filter(t=>Number.isFinite(t)&&t>now());
  if(future.length){expiryTimer=setTimeout(render,Math.min(...future)-now()+1);expiryTimer?.unref?.();}
  const stale=[...places,...tastes].filter(expired);$('curated-expiry').textContent=stale.length?'Expired confirmation: remove each expired item, then explicitly resolve and confirm it again. Each refresh can use up to 3 calls. Other selections stay in place; nothing refreshes automatically.':'';
  for(const id of ['curated-place','curated-type','curated-favorite'])$(id).disabled=pending;
  $('curated-confirm').disabled=pending||!enabled||!choice||$('curated-choice').value==='';
  $('curated-add-place').disabled=pending||!enabled||places.length>=4;
  $('curated-add-taste').disabled=pending||!enabled||tastes.length>=2;
  $('curated-rank').disabled=pending||!enabled||places.length<2||!selectedTastes().length||rankExpired();
  $('curated-rank').textContent=places.length>=2&&selectedTastes().length?`Rank confirmed choices · up to ${places.length+selectedTastes().length+1} calls`:'Rank confirmed choices · choose at least 2 places and 1 favorite';
  $('curated-none').disabled=pending;$('curated-clear').disabled=pending;
  for(const [list,id,label]of [[places,'curated-places','place'],[tastes,'curated-tastes','favorite']]){
   $(id).replaceChildren();for(const item of list){const row=el('li',(expired(item)?'Expired confirmation · ':'')+item.identity.name+(item.identity.address?' · '+item.identity.address:' · '+item.identity.type)+(item.identity.visitWarning?' · Catalogue warning: '+item.identity.visitWarning:''));if(label==='favorite'){const toggle=el('input','');toggle.type='checkbox';toggle.checked=item.selected;toggle.disabled=pending;toggle.setAttribute('aria-label','Use confirmed favorite: '+item.identity.name);toggle.addEventListener('change',()=>{item.selected=toggle.checked;$('curated-results').replaceChildren();render();});row.append(toggle);}
   const remove=el('button',`Remove ${label}: ${item.identity.name}`);remove.type='button';remove.disabled=pending;remove.addEventListener('click',()=>{list.splice(list.indexOf(item),1);$('curated-results').replaceChildren();render();});row.append(remove);$(id).append(row);}
  }
 }
 function clearChoice(){choice=null;$('curated-choice-box').hidden=true;$('curated-choice').replaceChildren();render();}
 async function readiness(){try{const s=await (await fetch('/api/status')).json();enabled=s.configured&&s.liveExecutionAllowed;$('curated-readiness').textContent=enabled?'Live judging available. One request at a time; no automatic retry.':'Live requests unavailable or paused. No provider request was sent.';}catch{enabled=false;$('curated-readiness').textContent='Could not check readiness. Reload before a live action.';}render();}
 function showResults(data){
  $('curated-results').replaceChildren();
  if(data.code==='curated_unresolved'&&data.unverifiedPlaceCandidate){const c=data.unverifiedPlaceCandidate;$('curated-results').append(el('h3','Unverified returned place'),el('p','This returned place did not pass the catalogue identity checks. It has not been selected, confirmed or added to your choices. Check the venue’s official information; this preview cannot be accepted as an alias.'),el('p','Returned name: '+c.name),el('p','Returned public address: '+c.address));return;}
  if(data.code!=='curated_results')return;
  $('curated-results').append(el('h3','Qloo ranking · Mesa-area corridor'),el('p',`Confirmed signals: ${data.confirmedTastes.map(t=>t.name+' ('+t.type+')').join(' + ')}. Qloo combines these as unweighted inputs; this app supplies no weighting.`),el('p',`${data.cards.length}/${data.candidateCount} selected places returned. Omitted options remain unranked. ${data.explanationNote}`));
  for(const c of data.cards){const card=el('article','');card.className='card';card.append(el('h4',`${c.resultPosition}. ${c.name}`),el('p',c.address),el('p',`Qloo affinity: ${c.affinity??'not supplied'} · not a probability`),el('p',`Catalogue warning: ${c.visitWarning||'Current visitor information unverified'}`),el('p','Visitor access, hours, permission and safety remain unknown. This corridor includes Mesa, Apache Junction and Superior; it is not a strict city boundary or route.'));
   const entry=catalogue.find(e=>e.id===c.catalogueId);for(const source of entry?.sources||[]){const link=el('a',source.title);link.href=source.url;link.target='_blank';link.rel='noopener noreferrer';card.append(link);}
   const details=el('details','');details.append(el('summary','Actual returned Qloo detail'),el('pre',c.providerExplanation===null?'No per-result explanation returned. None has been invented.':JSON.stringify(c.providerExplanation,null,2)));card.append(details);
   const pick=el('button','Shortlist locally');pick.type='button';let selected=false;pick.addEventListener('click',()=>{selected=!selected;pick.textContent=selected?'Remove local shortlist':'Shortlist locally';pick.setAttribute('aria-pressed',String(selected));});pick.setAttribute('aria-pressed','false');card.append(pick);$('curated-results').append(card);
  }
 }
 async function request(action,extra={}){
  if(pending||!enabled)return;pending=true;render();$('curated-results').replaceChildren();$('curated-status').textContent='Waiting for the bounded official Qloo operation…';
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),90000);
  const body={destination:'Mesa',favorite:action==='curated-signal'?$('curated-favorite').value.trim():'Confirmed identities',type:$('curated-type').value,verifiedOnly:false,mode:'qloo',action,...extra};
  try{const response=await fetch('/api/recommend',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:controller.signal});const data=await response.json();$('curated-status').textContent=data.message||data.code;$('curated-audit').textContent=JSON.stringify(data,null,2);
   if(data.code==='curated_choice'){choice={token:data.choiceToken,action};$('curated-choice').replaceChildren();const blank=el('option','Choose the intended identity explicitly');blank.value='';blank.disabled=true;blank.selected=true;$('curated-choice').append(blank);data.choices.forEach((c,i)=>{const o=el('option',`${c.name} · ${c.type}${c.address?' · '+c.address:''}${c.detail?' · '+c.detail:''}${c.visitWarning?' · Catalogue warning: '+c.visitWarning:''}`);o.value=String(i);$('curated-choice').append(o);});$('curated-choice').value='';$('curated-choice-box').hidden=false;$('curated-choice').focus();}
   else if(data.code==='curated_confirmed'){const list=data.identity.type==='place'?places:tastes;if(!list.some(x=>data.identity.catalogueId?x.identity.catalogueId===data.identity.catalogueId:x.identity.name===data.identity.name&&x.identity.type===data.identity.type))list.push({token:data.identityToken,identity:data.identity,selected:true,expiresAt:Date.parse(data.identityExpiresAt)});clearChoice();}
   else if(!['busy','budget'].includes(data.code)&&action==='curated-confirm')clearChoice();
   showResults(data);
  }catch{ $('curated-status').textContent='The response could not be confirmed. No automatic retry was made. Check readiness before another explicit action.';}
  finally{clearTimeout(timer);pending=false;await readiness();render();}
 }
 form.addEventListener('submit',event=>{event.preventDefault();if(!pending)$('curated-status').textContent='Use an explicitly labeled resolve, confirm or rank button. Enter alone sends no request.';});
 $('curated-add-place').addEventListener('click',()=>{if(places.length>=4)return;clearChoice();request('curated-place',{catalogueId:$('curated-place').value});});
 $('curated-add-taste').addEventListener('click',()=>{if(tastes.length>=2)return;if($('curated-favorite').value.trim().length<2){$('curated-status').textContent='Enter a public cultural favorite first.';return;}clearChoice();request('curated-signal');});
 $('curated-choice').addEventListener('change',render);
 $('curated-confirm').addEventListener('click',()=>{if(!choice||$('curated-choice').value==='')return;request('curated-confirm',{choiceToken:choice.token,choiceIndex:Number($('curated-choice').value)});});
 $('curated-none').addEventListener('click',()=>{const source=choice?.action;clearChoice();$('curated-status').textContent='No identity was selected and no request was sent. Edit the favorite or choose another catalogue place.';$(source==='curated-place'?'curated-place':'curated-favorite').focus();});
 for(const id of ['curated-favorite','curated-type','curated-place'])$(id).addEventListener('input',()=>{if(!pending)clearChoice();});
 $('curated-rank').addEventListener('click',()=>{if(pending||places.length<2||!selectedTastes().length)return;if(rankExpired()){render();$('curated-status').textContent='Ranking was not sent. Remove expired items, then explicitly resolve and confirm them again.';return;}request('curated-rank',{placeTokens:places.map(p=>p.token),tasteTokens:tastes.filter(t=>t.selected).map(t=>t.token)});});
 $('curated-clear').addEventListener('click',()=>{if(pending)return;places.length=0;tastes.length=0;clearChoice();$('curated-results').replaceChildren();$('curated-status').textContent='Local selections cleared. No provider request was sent.';});
 readiness();return {request,places,tastes};
}
if(typeof document!=='undefined')mountCurated({document,fetch,setTimeout,clearTimeout,AbortController});
