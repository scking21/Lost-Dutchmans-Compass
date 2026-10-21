import {randomUUID} from 'node:crypto';
import {catalogue} from '../public/catalogue.mjs';
import {normalizeIdentity} from '../public/domain.mjs';
import {runHarness,HARNESS_VERSION} from './harness.mjs';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const pilotCatalogueIds=Object.freeze(['real-06','real-07']);
export function validateCataloguePlace(row,interpretation,entry){
 if(!row||typeof row.entity_id!=='string'||!uuid.test(row.entity_id)||entry.blocked||!entry.address)return null;
 const scalars=[row.type,row.subtype].filter(v=>v!==undefined);
 if(scalars.some(v=>typeof v!=='string'||!['place','urn:entity:place','urn:entity'].includes(v)))return null;
 const explicit=scalars.some(v=>['place','urn:entity:place'].includes(v));
 const resolved=interpretation?.entity;
 if(resolved&&([resolved.type,resolved.subtype].filter(v=>v!==undefined).some(v=>typeof v!=='string'||!['place','urn:entity:place','urn:entity'].includes(v))||typeof resolved.entityId==='string'&&resolved.entityId.toLowerCase()!==row.entity_id.toLowerCase()))return null;
 const bound=resolved&&typeof resolved.entityId==='string'&&resolved.entityId.toLowerCase()===row.entity_id.toLowerCase()&&['place','urn:entity:place'].includes(resolved.type);
 if(!explicit&&!bound)return null;
 if(![entry.name,...entry.aliases].some(n=>normalizeIdentity(n)===normalizeIdentity(row.name))||normalizeIdentity(row.properties?.address)!==normalizeIdentity(entry.address))return null;
 return {entityId:row.entity_id,name:row.name,address:row.properties.address,catalogueId:entry.id,access:'unknown'};
}
const auditRecord=()=>({runtime:`@qloo/qloo-harness@${HARNESS_VERSION}`,workflowExecutions:0,networkDispatches:0,dispatchCountComplete:true,generator:'none'});
const envelopeValid=d=>d?.operation==='describe'&&d.schema_version==='1.0-preview.1'&&typeof d.execution?.correlation_id==='string';
export function resolutionDiagnostic(d,entry){
 const workflowStatus=['ok','partial','degraded','needs_input','empty','error'].includes(d?.status)?d.status:'unknown';
 const issues=Array.isArray(d?.resolution?.issues)?d.resolution.issues:[];
 const issue=issues.length===1&&issues[0]?.input===entry.name&&issues[0]?.input_kind==='entity'&&issues[0]?.field==='entity'&&issues[0]?.scope==='urn:entity:place'?issues[0]:null;
 const issueKind=['ambiguous','not_found'].includes(issue?.kind)?issue.kind:'unknown';
 const candidateCount=Array.isArray(issue?.candidates)?Math.min(issue.candidates.length,5):0;
 const reason=workflowStatus==='needs_input'?(issueKind==='not_found'?'no_match':issueKind==='ambiguous'?'ambiguous':'unresolved'):workflowStatus==='error'?'provider_error':workflowStatus==='empty'?'empty':'incomplete';
 return {workflowStatus,issueKind,candidateCount,candidateCountTruncated:Array.isArray(issue?.candidates)&&issue.candidates.length>5,reason};
}
function exactChoice(d,entry){
 const diagnostic=resolutionDiagnostic(d,entry);
 if(diagnostic.reason!=='ambiguous')return null;
 const issue=d.resolution.issues[0];if(!Array.isArray(issue.candidates)||issue.candidates.length>5)return null;
 const matches=issue.candidates.map(c=>validateCataloguePlace({entity_id:c.id,name:c.name,type:c.type,subtype:c.subtype,properties:{address:c.address}},{},entry)).filter(Boolean);
 return matches.length===1?matches[0]:null;
}
export async function resolveCatalogue(b,{key,signal,run=runHarness}={}){
 const audit=auditRecord();
 const response=(code,message,status=422,extra={})=>({status,body:{requestId:randomUUID(),code,message,cards:[],audit,...extra}});
 if(b.destination.trim().toLowerCase()!=='mesa')return response('catalogue_region','This fixed local shortlist supports Mesa. No provider call was made.');
 if(!key)return response('not_configured','Server-side Qloo credential is not configured.',503);
 const cards=[];
 try{
  for(const id of pilotCatalogueIds){
   const entry=catalogue.find(c=>c.id===id);
   audit.workflowExecutions++;const result=await run('describe',{entity:entry.name,type:'place'},{key,signal});audit.networkDispatches+=result.dispatches;
   const d=result.data;
   if(!envelopeValid(d))return response('catalogue_schema','Place resolution returned an invalid schema. No ranking was run.',502);
   if(!['ok','partial','degraded'].includes(d.status)||d.results?.length!==1){
    const diagnostic=resolutionDiagnostic(d,entry),choice=cards.length===1&&id===pilotCatalogueIds[1]?exactChoice(d,entry):null;
    const progress={matchedCount:cards.length,total:pilotCatalogueIds.length,stoppedAtCatalogueName:entry.name,...diagnostic};
    if(choice&&!cards.some(c=>c.entityId.toLowerCase()===choice.entityId.toLowerCase()))return response('catalogue_choice','One local identity matched. A search candidate exactly matches the second catalogue name, full address and place type. Confirm it explicitly to verify its identity with one additional call; no selection or ranking has run.',200,{resolutionProgress:progress,privateCatalogueChoice:{cards,entryId:entry.id,candidateId:choice.entityId,region:'Mesa area'}});
    return response('catalogue_unresolved',`${cards.length} of ${pilotCatalogueIds.length} local identities matched. ${entry.name}: ${diagnostic.reason.replaceAll('_',' ')}. Stopped without retry, substitution or ranking.`,422,{resolutionProgress:progress});
   }
   const card=validateCataloguePlace(d.results[0],d.interpretation,entry);
   if(!card||cards.some(c=>c.entityId.toLowerCase()===card.entityId.toLowerCase()))return response('catalogue_unresolved',`${cards.length} of ${pilotCatalogueIds.length} local identities matched. ${entry.name} did not pass exact name, address and place-identity checks. Stopped without retry or ranking.`,422,{resolutionProgress:{matchedCount:cards.length,total:pilotCatalogueIds.length,stoppedAtCatalogueName:entry.name,workflowStatus:d.status,reason:'identity_mismatch'}});
   cards.push(card);
  }
  return response('catalogue_resolved','Two local visitor identities matched the independently sourced catalogue. Rank this fixed shortlist with your favorite; access remains unknown.',200,{resolvedPlaceCount:cards.length,resolvedPlaces:cards.map(c=>catalogue.find(e=>e.id===c.catalogueId).name),privateCatalogueContext:{cards,region:'Mesa area',source:'session-bound official place resolution'}});
 }catch(e){audit.dispatchCountComplete=false;return response(e.code==='process_termination_unknown'?'process_termination_unknown':'catalogue_failed','Place resolution could not finish safely. No automatic retry or ranking was run.',502);}
}
export async function confirmCatalogue(b,{key,signal,choiceContext,run=runHarness}={}){
 const audit=auditRecord();const response=(code,message,status=422,extra={})=>({status,body:{requestId:randomUUID(),code,message,cards:[],audit,...extra}});
 const entry=catalogue.find(c=>c.id===choiceContext?.entryId);
 if(!entry||entry.id!==pilotCatalogueIds[1]||choiceContext?.cards?.length!==1||choiceContext.cards[0].catalogueId!==pilotCatalogueIds[0]||!uuid.test(choiceContext.candidateId)||b.destination.trim().toLowerCase()!=='mesa')return response('catalogue_choice_invalid','The confirmation context is invalid. Resolve the local shortlist again.');
 if(!key)return response('not_configured','Server-side Qloo credential is not configured.',503);
 try{
  audit.workflowExecutions++;const out=await run('describe',{entity:choiceContext.candidateId,type:'place'},{key,signal,dispatchBudget:1});audit.networkDispatches+=out.dispatches;
  const d=out.data,expected=choiceContext.candidateId.toLowerCase();
  if(!envelopeValid(d)||d.status!=='ok'||d.results?.length!==1||d.resolution?.outcomes?.length!==1)return response('catalogue_confirmation_failed','The selected identity could not be verified. No ranking or automatic retry was run.');
  const outcome=d.resolution.outcomes[0],selected=outcome?.selected,row=d.results[0];
  const equalId=id=>typeof id==='string'&&id.toLowerCase()===expected;
  if(outcome.status!=='resolved'||outcome.match!=='identifier'||!equalId(outcome.input)||!equalId(selected?.id)||!equalId(row?.entity_id)||!equalId(d.interpretation?.entity?.entityId))return response('catalogue_confirmation_failed','The returned identity did not match the selected candidate. No ranking was run.');
  const selectedCard=validateCataloguePlace({entity_id:selected.id,name:selected.name,type:selected.type,subtype:selected.subtype,properties:{address:selected.address}},{},entry);
  const hydrated=validateCataloguePlace({...row,properties:{...row.properties,address:row.properties?.address??selected.address}},d.interpretation,entry);
  if(!selectedCard||!hydrated||choiceContext.cards.some(c=>c.entityId.toLowerCase()===expected))return response('catalogue_confirmation_failed','The selected identity failed exact name, full-address or place-type checks. No ranking was run.');
  const cards=[...choiceContext.cards,hydrated];
  return response('catalogue_resolved','Both local identities now match the independently sourced catalogue. Ranking requires its own click; access remains unknown.',200,{resolvedPlaceCount:2,resolvedPlaces:cards.map(c=>catalogue.find(e=>e.id===c.catalogueId).name),privateCatalogueContext:{cards,region:'Mesa area',source:'session-bound official place resolution and explicit identity confirmation'}});
 }catch(e){audit.dispatchCountComplete=false;return response(e.code==='process_termination_unknown'?'process_termination_unknown':'catalogue_confirmation_failed','Identity confirmation could not finish safely. No automatic retry or ranking was run.',502);}
}
export function createCatalogueSessions(now=()=>Date.now()){
 const sets=new Map(),choices=new Map(),generations=new Map();
 const prune=()=>{for(const map of [sets,choices,generations])for(const [id,s]of map)if(now()-s.created>900000)map.delete(id);};
 const remember=(map,context,owner)=>{prune();if(map.size>=1000)map.delete(map.keys().next().value);const id=randomUUID();map.set(id,{context:structuredClone(context),owner,created:now()});return id;};
 const get=(map,id,b,owner)=>{prune();const s=map.get(id);if(!s||s.owner!==owner)throw Error('Local identity context expired or unknown. Resolve it again.');if(b.destination.trim().toLowerCase()!=='mesa')throw Error('Local shortlist supports Mesa only.');return structuredClone(s.context);};
 return {
  remember:(context,owner)=>remember(sets,context,owner),
  resolve:(b,owner)=>get(sets,b.catalogueSetId,b,owner),
  rememberChoice(context,owner,generation){prune();if(!generations.has(owner)){if(generations.size>=1000)generations.delete(generations.keys().next().value);generations.set(owner,{id:randomUUID(),created:now()});}const current=generations.get(owner).id;if(generation!==undefined&&generation!==current)return null;return remember(choices,{...context,generation:current},owner);},
  isCurrent(owner,generation){prune();return typeof generation==='string'&&generations.get(owner)?.id===generation;},
  resolveChoice:(b,owner)=>get(choices,b.catalogueChoiceToken,b,owner),
  takeChoice(b,owner){const context=get(choices,b.catalogueChoiceToken,b,owner);choices.delete(b.catalogueChoiceToken);return context;},
  clearChoices(owner){prune();for(const [id,s]of choices)if(s.owner===owner)choices.delete(id);if(generations.size>=1000&&!generations.has(owner))generations.delete(generations.keys().next().value);const id=randomUUID();generations.set(owner,{id,created:now()});return id;}
 };
}
