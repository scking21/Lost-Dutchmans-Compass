import {canStartLive} from '/capacity.mjs';
import {applyDomainScope} from '/domain.mjs';
import {createRefinement} from '/refine.mjs';
const $=id=>document.getElementById(id);
let version=0,controller,refinement=null,lastResponse=null,retained=null,capacity=null,runsRemaining=null,keyConfigured=false,pending=false;
let localCatalogue=null;
const panel=document.querySelector('.result-panel');
function invalidate(clearChoice=true){refinement=null;lastResponse=null;$('workflow').textContent='REFINE BRIEF → SUBMIT AGAIN';version++;controller?.abort();controller=null;pending=false;$('results').replaceChildren();$('payload').textContent='Inputs changed. Submit to retrieve new evidence.';$('status').textContent='Ready for your updated brief.';$('badge').textContent='NO CURRENT RESULTS';$('run').disabled=false;panel.setAttribute('aria-busy','false');if(clearChoice){$('choices').hidden=true;$('seed').replaceChildren();}updateRank();}
for(const id of ['destination','favorite','type','verified','mode'])$(id).addEventListener('input',()=>{invalidate();if(['destination','verified','mode'].includes(id))retained=null;if(id==='destination')localCatalogue=null;updateRank();});
$('heritage').addEventListener('change',()=>{updateOptionSummary();if(refinement&&lastResponse)renderResults();else{retained=null;updateRank();}});
$('seed').addEventListener('change',()=>invalidate(false));
function updateOptionSummary(){
 $('scope-summary').textContent=$('heritage').checked?'Local heritage/outdoor scope is on. Only session-reviewed catalogue matches remain; resolve the local shortlist first. This does not verify access.':'Broad provider results selected. Places may be residential, unrelated to heritage, or unsuitable for visiting. Access remains unknown.';
 $('mode-summary').textContent=$('mode').value==='qloo'?'Qloo taste-led discovery selected.':$('mode').value==='test-failure'?'Controlled failure selected. No provider call or live recommendations.':'Without Qloo selected. Comparison readiness only; no generator or live recommendations.';
}
$('mode').addEventListener('change',updateOptionSummary);
updateOptionSummary();
function node(tag,text){const e=document.createElement(tag);e.textContent=text;return e;}
$('form').addEventListener('submit',async event=>{
 event.preventDefault();const action=event.submitter?.id==='rerank'?'rank':event.submitter?.id==='resolve-local'?'resolve-catalogue':event.submitter?.id==='rank-local'?'catalogue':'discover';if($('mode').value==='qloo'&&!canStartLive({configured:keyConfigured,credits:capacity,runs:runsRemaining},['rank','catalogue'].includes(action)?7:4)){updateRank();return;}pending=true;const retainedForRun=retained;controller?.abort();const mine=++version;controller=new AbortController();const activeController=controller;const signal=activeController.signal;
 refinement=null;lastResponse=null;$('workflow').textContent='RESOLVE → CONFIRM IDENTITY → DISCOVER';$('results').replaceChildren();$('payload').textContent='Awaiting server evidence.';$('status').textContent='Resolving your favorite and discovering places…';$('badge').textContent=$('mode').value==='qloo'?'REQUESTING QLOO · NO RESULTS YET':'NO-QLOO MODE';$('run').disabled=true;panel.setAttribute('aria-busy','true');
 const body={action,destination:$('destination').value.trim(),favorite:$('favorite').value.trim(),type:$('type').value,mode:$('mode').value,verifiedOnly:$('verified').checked};if(!$('choices').hidden&&$('seed').value)body.seedId=$('seed').value;
 if(action==='catalogue'&&localCatalogue)body.catalogueSetId=localCatalogue.catalogueSetId;
 if(action==='rank'&&retainedForRun){const state=retainedForRun.state;body.candidateSetId=retainedForRun.response.candidateSetId;body.candidateIds=state.shortlistedIds.length?state.cards.filter(c=>state.shortlistedIds.includes(c.entityId)).map(c=>c.entityId):state.cards.map(c=>c.entityId);body.excludedIds=state.excludedIds;}
 $('status').textContent=action==='rank'?'Resolving changed taste, then asking Qloo to rank retained places…':'Resolving your favorite and discovering places…';$('rerank').disabled=true;$('resolve-local').disabled=true;$('rank-local').disabled=true;
 const timeout=setTimeout(()=>activeController.abort(),50000);
 try{
  const response=await fetch('/api/recommend',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body),signal});const data=await response.json();if(mine!==version)return;if(data.pilotBudget){capacity=data.pilotBudget.remaining;if(data.pilotBudget.reservedForSubmission>0&&runsRemaining!==null)runsRemaining=Math.max(0,runsRemaining-1);}
  if(data.code==='catalogue_not_ready')localCatalogue=null;
  if(data.candidatePool){$('heritage').checked=true;updateOptionSummary();}
  if(data.catalogueSetId)localCatalogue={catalogueSetId:data.catalogueSetId,count:data.resolvedPlaceCount};
  $('status').textContent=data.message||'Request finished.';$('payload').textContent=JSON.stringify(data,null,2);
  $('badge').textContent=data.code==='catalogue_resolved'?'LOCAL IDENTITIES MATCHED · READY TO RANK':data.mode==='qloo'&&response.ok?'OFFICIAL QLOO HARNESS RESULT · ACCESS UNVERIFIED':'NO LIVE RECOMMENDATIONS';
  if(data.code==='choose_seed'){$('seed').replaceChildren();for(const choice of data.choices){const o=node('option',`${choice.name}${choice.detail?' · '+choice.detail:''}`);o.value=choice.entityId;$('seed').append(o);}$('choices').hidden=false;$('seed').focus();}
  if(data.code!=='choose_seed'&&data.mode!=='qloo')retained=null;lastResponse=data;refinement=createRefinement(data.cards||[]);renderResults();$('workflow').textContent=data.code==='catalogue_resolved'?'LOCAL IDENTITIES MATCHED → RANK WITH YOUR FAVORITE':data.workflowState==='needs_input'?'NEEDS INPUT → CLARIFY / CONFIRM':data.cards?.length?`${(data.workflowState||'ok').toUpperCase()} → SHORTLIST OR EXCLUDE LOCALLY`:data.code==='no_eligible_results'?'EMPTY → REFINE YOUR BRIEF':'ERROR / NOT READY → REVIEW LIMITATION';

 }catch(error){if(mine!==version)return;$('status').textContent=signal.aborted?'The request timed out. No automatic retry was made.':'The server could not be reached. No results were substituted.';$('badge').textContent='NO LIVE RECOMMENDATIONS';$('payload').textContent='No completed response available.';}
 finally{clearTimeout(timeout);if(mine===version){pending=false;updateRank();refreshCapacity();panel.setAttribute('aria-busy','false');}}
});
async function refreshCapacity(){try{const s=await (await fetch('/api/status')).json();keyConfigured=s.configured;capacity=s.dispatchCreditsRemaining;runsRemaining=s.liveRunsRemaining;}catch{capacity=null;}$('readiness').textContent=capacity===null?'Server capacity could not be checked; live actions are paused.':!keyConfigured?'Official harness installed; the server credential is not configured. Live actions are paused.':capacity<4||runsRemaining===0?`Live pilot paused: ${capacity}/12 dispatch credits and ${runsRemaining} submissions remain; discovery needs 4 and rank needs 7. This limited pilot is not judge-ready. Local filters and no-call modes still work.`:`Bounded live pilot: ${capacity}/12 dispatch credits and ${runsRemaining} submissions remain. Discovery reserves 4; rank reserves 7. This is not unrestricted judging capacity.`;updateRank();}
refreshCapacity();
function updateRank(){const changed=retained&&($('favorite').value.trim()!==retained.response.brief.favorite||$('type').value!==retained.response.brief.type);const liveState={configured:keyConfigured,credits:capacity,runs:runsRemaining};$('run').disabled=pending||$('mode').value==='qloo'&&!canStartLive(liveState,4);$('resolve-local').disabled=pending||$('mode').value!=='qloo'||$('destination').value.trim().toLowerCase()!=='mesa'||!canStartLive(liveState,4);$('rank-local').disabled=pending||!localCatalogue||localCatalogue.count<2||$('destination').value.trim().toLowerCase()!=='mesa'||$('mode').value!=='qloo'||!canStartLive(liveState,7);$('rerank').disabled=pending||!changed||!retained.state.cards.length||$('mode').value!=='qloo'||!canStartLive(liveState,7);}

function renderResults(focusId=null,focusAction=null){
 let nextFocus=null;
 if(!refinement||!lastResponse)return;
 const rawState=refinement.snapshot();const domain=applyDomainScope(rawState.cards,lastResponse.reviewedMappings||[]);const state=$('heritage').checked?{...rawState,cards:domain.cards,shortlistedIds:rawState.shortlistedIds.filter(id=>domain.cards.some(c=>c.entityId===id)),excludedIds:[...new Set([...rawState.excludedIds,...domain.excluded.map(c=>c.entityId)])]}:rawState;$('results').replaceChildren();
 if(lastResponse.cards?.length&&lastResponse.mode==='qloo'&&lastResponse.seed?.name){
  const context=node('section','');context.className='discovery-context';context.setAttribute('aria-label','Your discovery signal');
  context.append(node('h3',`${lastResponse.seed.name} · ${lastResponse.brief.destination}`),node('p',`Resolved favorite: ${lastResponse.seed.name} · ${lastResponse.brief.type}. ${lastResponse.candidatePool?'Qloo ranked a reviewed local shortlist; regional scope comes from the catalogue':lastResponse.operation==='rank'?'Qloo reranked retained places; location comes from earlier discovery':'Qloo discovery used a location filter'} around ${lastResponse.brief.destination}.`),node('p','Compass query context, not a causal explanation of your taste. Qloo supplies the returned places, order and affinity; shortlist choices stay local to this page.'));
  const edit=node('a','Edit your brief');edit.href='#favorite';context.append(edit);$('results').append(context);
 }
 if(lastResponse.cards?.length&&!state.cards.length)$('results').append(node('p','No places visible under your current local choices. Review the scope exclusions or restore a hidden place below. No replacement places were invented.'));
 if(lastResponse.cards?.length){$('results').append(node('p',$('heritage').checked?`Local visitor scope: ${domain.eligibleCount}/${domain.inputCount} visible provider places match the catalogue and pass its closure check (${domain.matchedCatalogueCount}/${domain.catalogueSize} catalogue entries represented; ${domain.reviewedMappingCount}/8 mappings reviewed). Provider order and scores unchanged. Access remains unknown.`:'Broad provider results: local visitor scope is off. A returned place may be residential, unrelated to heritage, or unsuitable for visiting.'));if($('heritage').checked)for(const item of domain.excluded){const p=node('p',`Excluded from local visitor scope: ${item.name} · provider position ${item.resultPosition}. ${item.reason}`);if(item.source){const link=node('a',' Official source');link.href=item.source;link.target='_blank';link.rel='noopener noreferrer';p.append(link);}$('results').append(p);}}
 if(lastResponse.cards?.length){$('results').append(node('p',`Your local shortlist: ${state.shortlistedIds.length} · Hidden by you: ${rawState.excludedIds.length}. These choices do not change Qloo scores or provider order and make no API calls.`));}
 const explanation=lastResponse.providerExplanation;if(explanation){const details=node('details','');details.append(node('summary','Qloo query-level explanation'));details.append(node('p',explanation.note));details.append(node('pre',explanation.status==='returned'?JSON.stringify(explanation.value,null,2):'No query-level explanation was returned. Compass will not invent one.'));$('results').append(details);}
 if(lastResponse.candidatePool){$('results').append(node('p',lastResponse.candidatePool.note));if(state.cards.length<2)$('results').append(node('p','Fewer than two reviewed choices are visible. This result does not demonstrate a personalized choice between destinations.'));}
 if(lastResponse.rankComparison){$('results').append(node('p',lastResponse.rankComparison.note));$('results').append(node('p',`Omitted by provider: ${lastResponse.rankComparison.omittedIds.length}. These are unranked, not proven unsuitable or inaccessible.`));}
 for(const card of state.cards){
  const article=node('article','');article.className='card';
  const number=node('span',String(card.resultPosition));number.className='number';number.setAttribute('aria-label',`Provider position ${card.resultPosition}`);
  const content=node('div','');content.className='card-body';
  content.append(node('h3',card.name),node('p',card.address||'Address not supplied by Qloo.'),node('p',card.affinity===null?'Affinity not supplied.':`Qloo affinity: ${card.affinity} · not a probability`));
  const warning=node('p','Access: unknown. Opening hours and permission to visit have not been independently verified.');warning.className='access-warning';content.append(warning);
  if(card.catalogueEvidence){content.append(node('p','Catalogue identity/domain match only; current access remains unknown. '+card.catalogueEvidence.visitWarning));for(const source of card.catalogueEvidence.sources){const link=node('a',source.title);link.href=source.url;link.target='_blank';link.rel='noopener noreferrer';content.append(link);}}
  if(lastResponse.rankComparison){const change=lastResponse.rankComparison.positions.find(p=>p.entityId===card.entityId);if(change)content.append(node('p',`Provider position: ${change.previousPosition} previously → ${change.currentPosition} now. Different queries; no numeric affinity comparison.`));}
  const selected=state.shortlistedIds.includes(card.entityId);
  const next=node('div','');next.className='next-step';next.append(node('h4','Suggested next step'),node('p',selected?'Check the venue’s own current opening hours, visitor permission and access requirements before planning a visit. Shortlisting is not verification.':'Interested? Shortlist this place to compare locally, then check the venue’s own visitor information before planning a visit.'));content.append(next);
  if(card.website){const link=node('a','Visit provider-listed website (opens a new tab)');link.href=card.website;link.target='_blank';link.rel='noopener noreferrer';content.append(link);}
  const actions=node('div','');actions.className='card-actions';
  const shortlist=node('button',selected?'Remove from shortlist':'Shortlist this place');shortlist.type='button';shortlist.setAttribute('aria-pressed',String(selected));shortlist.setAttribute('aria-label',`${shortlist.textContent}: ${card.name}`);
  shortlist.addEventListener('click',()=>{refinement.toggleShortlist(card.entityId);renderResults(card.entityId,'shortlist');});
  const exclude=node('button','Hide locally · no taste signal');exclude.type='button';exclude.setAttribute('aria-label',`Hide locally: ${card.name} · no taste signal`);exclude.addEventListener('click',()=>{refinement.toggleExcluded(card.entityId);renderResults(card.entityId,'restore');});
  if(focusId===card.entityId&&focusAction==='shortlist')nextFocus=shortlist;
  actions.append(shortlist,exclude);content.append(actions);
  const evidence=node('details','');evidence.append(node('summary','Place evidence'),node('p',card.explanation),node('p',`Qloo entity: ${card.entityId}`),node('p',card.mapping),node('p',`Type evidence: ${card.typeEvidence||'not supplied'}`));content.append(evidence);
  article.append(number,content);$('results').append(article);
 }
 for(const card of state.excluded){const row=node('div','');row.className='local-excluded';row.append(node('p',`Hidden locally by you: ${card.name} · original provider position ${card.resultPosition}`));const restore=node('button','Restore locally');restore.type='button';restore.setAttribute('aria-label',`Restore locally: ${card.name}`);restore.addEventListener('click',()=>{refinement.toggleExcluded(card.entityId);renderResults(card.entityId,'shortlist');});if(focusId===card.entityId&&focusAction==='restore')nextFocus=restore;row.append(restore);$('results').append(row);}
 if(focusId){if(!nextFocus)$('discovery-options').open=true;(nextFocus||$('heritage')).focus();}
 if(lastResponse.candidateSetId)retained={response:lastResponse,state};updateRank();
 $('payload').textContent=JSON.stringify({...lastResponse,localDomainScope:{enabled:$('heritage').checked,...domain},localRefinement:{source:state.source,shortlistedIds:state.shortlistedIds,excludedIds:state.excludedIds,providerOrderUnchanged:true,additionalProviderCalls:0}},null,2);
}
