import {createRefinement} from '/refine.mjs';
const $=id=>document.getElementById(id);
let version=0,controller,refinement=null,lastResponse=null;
const panel=document.querySelector('.result-panel');
function invalidate(clearChoice=true){refinement=null;lastResponse=null;$('workflow').textContent='REFINE BRIEF → SUBMIT AGAIN';version++;controller?.abort();controller=null;$('results').replaceChildren();$('payload').textContent='Inputs changed. Submit to retrieve new evidence.';$('status').textContent='Ready for your updated brief.';$('badge').textContent='NO CURRENT RESULTS';$('run').disabled=false;panel.setAttribute('aria-busy','false');if(clearChoice){$('choices').hidden=true;$('seed').replaceChildren();}}
for(const id of ['destination','favorite','type','verified','mode'])$(id).addEventListener('input',()=>invalidate());
$('seed').addEventListener('change',()=>invalidate(false));
function node(tag,text){const e=document.createElement(tag);e.textContent=text;return e;}
$('form').addEventListener('submit',async event=>{
 event.preventDefault();controller?.abort();const mine=++version;controller=new AbortController();const activeController=controller;const signal=activeController.signal;
 refinement=null;lastResponse=null;$('workflow').textContent='RESOLVE → CONFIRM IDENTITY → DISCOVER';$('results').replaceChildren();$('payload').textContent='Awaiting server evidence.';$('status').textContent='Resolving your favorite and discovering places…';$('badge').textContent=$('mode').value==='qloo'?'REQUESTING QLOO · NO RESULTS YET':'NO-QLOO MODE';$('run').disabled=true;panel.setAttribute('aria-busy','true');
 const body={destination:$('destination').value.trim(),favorite:$('favorite').value.trim(),type:$('type').value,mode:$('mode').value,verifiedOnly:$('verified').checked};if(!$('choices').hidden&&$('seed').value)body.seedId=$('seed').value;
 const timeout=setTimeout(()=>activeController.abort(),50000);
 try{
  const response=await fetch('/api/recommend',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body),signal});const data=await response.json();if(mine!==version)return;
  $('status').textContent=data.message||'Request finished.';$('payload').textContent=JSON.stringify(data,null,2);
  $('badge').textContent=data.mode==='qloo'&&response.ok?'OFFICIAL QLOO HARNESS RESULT · ACCESS UNVERIFIED':'NO LIVE RECOMMENDATIONS';
  if(data.code==='choose_seed'){$('seed').replaceChildren();for(const choice of data.choices){const o=node('option',`${choice.name}${choice.detail?' · '+choice.detail:''}`);o.value=choice.entityId;$('seed').append(o);}$('choices').hidden=false;$('seed').focus();}
  lastResponse=data;refinement=createRefinement(data.cards||[]);renderResults();$('workflow').textContent=data.workflowState==='needs_input'?'NEEDS INPUT → CLARIFY / CONFIRM':data.cards?.length?`${(data.workflowState||'ok').toUpperCase()} → SHORTLIST OR EXCLUDE LOCALLY`:data.code==='no_eligible_results'?'EMPTY → REFINE YOUR BRIEF':'ERROR / NOT READY → REVIEW LIMITATION';

 }catch(error){if(mine!==version)return;$('status').textContent=signal.aborted?'The request timed out. No automatic retry was made.':'The server could not be reached. No results were substituted.';$('badge').textContent='NO LIVE RECOMMENDATIONS';$('payload').textContent='No completed response available.';}
 finally{clearTimeout(timeout);if(mine===version){$('run').disabled=false;panel.setAttribute('aria-busy','false');}}
});
fetch('/api/status').then(r=>r.json()).then(s=>{$('readiness').textContent=s.configured?'Official harness 0.1.26 is installed; Qloo key is configured on the server. Live retrieval is tested only when you submit.':'Official harness 0.1.26 is installed. Live recommendations are blocked until the owner configures the server credential.';}).catch(()=>{$('readiness').textContent='Server readiness could not be checked.';});

function renderResults(){
 if(!refinement||!lastResponse)return;
 const state=refinement.snapshot();$('results').replaceChildren();
 if(lastResponse.cards?.length){$('results').append(node('p',`Your local shortlist: ${state.shortlistedIds.length} · Excluded: ${state.excludedIds.length}. These choices do not change Qloo scores or provider order and make no API calls.`));}
 for(const card of state.cards){const article=node('article','');article.className='card';const number=node('span',String(card.resultPosition));number.className='number';const content=node('div','');content.className='card-body';content.append(node('h3',card.name),node('p',card.address||'Address not supplied by Qloo.'),node('p',card.explanation),node('p',card.affinity===null?'Affinity not supplied.':`Qloo affinity: ${card.affinity} · not a probability`),node('p','Access: unknown. Opening hours and permission to visit have not been independently verified.'),node('p',`Qloo entity: ${card.entityId}`),node('p',card.mapping));if(card.website){const link=node('a','Visit provider-listed website ↗');link.href=card.website;link.target='_blank';link.rel='noopener noreferrer';content.append(link);}const actions=node('div','');actions.className='card-actions';const shortlist=node('button',state.shortlistedIds.includes(card.entityId)?'Remove from shortlist':'Shortlist this place');shortlist.type='button';shortlist.setAttribute('aria-pressed',String(state.shortlistedIds.includes(card.entityId)));shortlist.addEventListener('click',()=>{refinement.toggleShortlist(card.entityId);renderResults();});const exclude=node('button','Exclude locally');exclude.type='button';exclude.addEventListener('click',()=>{refinement.toggleExcluded(card.entityId);renderResults();});actions.append(shortlist,exclude);content.append(actions);article.append(number,content);$('results').append(article);}
 for(const card of state.excluded){const row=node('div','');row.className='local-excluded';row.append(node('p',`Excluded by you: ${card.name} · original provider position ${card.resultPosition}`));const restore=node('button','Restore locally');restore.type='button';restore.addEventListener('click',()=>{refinement.toggleExcluded(card.entityId);renderResults();});row.append(restore);$('results').append(row);}
 $('payload').textContent=JSON.stringify({...lastResponse,localRefinement:{source:state.source,shortlistedIds:state.shortlistedIds,excludedIds:state.excludedIds,providerOrderUnchanged:true,additionalProviderCalls:0}},null,2);
}
