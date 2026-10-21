import {randomUUID,createHash} from 'node:crypto';
import {catalogue} from '../public/catalogue.mjs';
import {validateCataloguePlace} from './catalogue-pool.mjs';
import {normalizeIdentity} from '../public/domain.mjs';
import {runHarness,HARNESS_VERSION} from './harness.mjs';
import {boundedProviderDetail} from './workflow.mjs';
export const curatedActions=['curated-place','curated-signal','curated-confirm','curated-rank'];
export const selectablePlaces=catalogue.filter(e=>!e.blocked&&e.address).map(e=>e.id);
const types=['movie','artist','book','tv_show'];
const uuid=v=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
const envelope=(d,operation)=>d?.operation===operation&&d.schema_version==='1.0-preview.1'&&typeof d.execution?.correlation_id==='string';
const equal=(a,b)=>typeof a==='string'&&typeof b==='string'&&a.toLowerCase()===b.toLowerCase();
const typeOk=(row,interpretation,type)=>{
 const vals=[row?.type,row?.subtype].filter(v=>v!==undefined);
 if(vals.some(v=>!['urn:entity',type,'urn:entity:'+type].includes(v)))return false;
 return vals.some(v=>[type,'urn:entity:'+type].includes(v))||equal(row?.entity_id,interpretation?.entity?.entityId)&&[type,'urn:entity:'+type].includes(interpretation.entity.type);
};
// Categories only: never copy provider names, IDs, addresses or free-text errors.
function resolutionDiagnostic(d,name,type,entry){
 const workflowStatus=['ok','partial','degraded','needs_input','empty','error'].includes(d.status)?d.status:'unknown';
 const results=Array.isArray(d.results)?d.results:[],issues=Array.isArray(d.resolution?.issues)?d.resolution.issues:[];
 const boundIssues=issues.filter(i=>i?.input===name&&i.input_kind==='entity'&&i.field==='entity'&&i.scope==='urn:entity:'+type);
 const issueKind=boundIssues.length===1&&['not_found','ambiguous'].includes(boundIssues[0].kind)?boundIssues[0].kind:'unknown';
 const candidates=boundIssues.flatMap(i=>Array.isArray(i.candidates)?i.candidates:[]);
 const rejectionReasons=[];let boundSelectedCatalogueMatch=false;
 if(results.length===1){
  const row=results[0],resolved=d.interpretation?.entity;
  if(!uuid(row?.entity_id))rejectionReasons.push('invalid_identity');
  if(!typeOk(row,d.interpretation,type))rejectionReasons.push('type_mismatch');
  if(resolved&&typeof resolved.entityId==='string'&&!equal(resolved.entityId,row?.entity_id))rejectionReasons.push('interpretation_identity_mismatch');
  if(entry){
   if(![entry.name,...entry.aliases].some(n=>normalizeIdentity(n)===normalizeIdentity(row?.name)))rejectionReasons.push('name_mismatch');
   if(typeof row?.properties?.address!=='string'||!row.properties.address.trim())rejectionReasons.push('address_missing');
   else if(normalizeIdentity(row.properties.address)!==normalizeIdentity(entry.address))rejectionReasons.push('address_mismatch');
   const outcomes=d.resolution?.outcomes,outcome=Array.isArray(outcomes)&&outcomes.length===1?outcomes[0]:null,selected=outcome?.selected;
   const bound=outcome?.input===name&&outcome.status==='resolved'&&['exact','semantic'].includes(outcome.match)&&equal(selected?.id,row?.entity_id)&&equal(selected?.id,resolved?.entityId);
   boundSelectedCatalogueMatch=!!(bound&&validateCataloguePlace({entity_id:selected.id,name:selected.name,type:selected.type,subtype:selected.subtype,properties:{address:selected.address}},{},entry));
   if(!validateCataloguePlace(row,d.interpretation,entry)&&!rejectionReasons.length)rejectionReasons.push('other_identity_check');
  }
 }else if(['ok','partial','degraded'].includes(workflowStatus))rejectionReasons.push('unexpected_result_count');
 const reason=workflowStatus==='needs_input'?(issueKind==='not_found'?'no_match':issueKind==='ambiguous'?'ambiguous':'unresolved'):rejectionReasons.length?'identity_mismatch':workflowStatus==='empty'?'empty':workflowStatus==='error'?'provider_error':'unresolved';
 return {workflowStatus,reason,resultCount:Math.min(results.length,6),resultCountTruncated:results.length>6,issueKind,boundIssueCount:Math.min(boundIssues.length,6),candidateCount:Math.min(candidates.length,6),candidateCountTruncated:candidates.length>6,candidateCatalogueMatchCount:entry?Math.min(6,candidates.filter(c=>validateCataloguePlace({entity_id:c?.id,name:c?.name,type:c?.type,subtype:c?.subtype,properties:{address:c?.address}},{},entry)).length):null,rejectionReasons,boundSelectedCatalogueMatch};
}
const publicIdentity=x=>({name:x.name,type:x.type,...(x.catalogueId?{catalogueId:x.catalogueId,address:x.address}:{}),...(x.detail?{detail:x.detail}:{}),...(x.visitWarning?{visitWarning:x.visitWarning}:{}),access:'unknown'});
export function createCuratedService({now=()=>Date.now(),run=runHarness}={}){
 const records=new Map();
 const prune=()=>{for(const [id,r] of records)if(now()-r.created>=900000)records.delete(id);};
 const save=(context,owner)=>{prune();if(records.size>=1000)records.delete(records.keys().next().value);const token=randomUUID();records.set(token,{context:structuredClone(context),owner,created:now()});return token;};
 const get=(token,owner,kind)=>{prune();const r=records.get(token);if(!r||r.owner!==owner||r.context.kind!==kind)throw Error('This identity has expired or belongs to a different session. Resolve it again.');return structuredClone(r.context);};
 function preflight(b,owner){
  if(b.verifiedOnly)throw Error('No independently verified access evidence is available. Verified-only requests are unsupported; no provider call was made.');
  if(b.destination.trim().toLowerCase()!=='mesa')throw Error('This reviewed corridor starts from Mesa and includes Apache Junction and Superior. Use Mesa as the destination.');
  if(b.action==='curated-place'){if(!selectablePlaces.includes(b.catalogueId))throw Error('Choose an addressed, unblocked place from the fixed catalogue.');return {entry:catalogue.find(e=>e.id===b.catalogueId),reservation:2};}
  if(b.action==='curated-signal')return {reservation:2};
  if(b.action==='curated-confirm'){const choice=get(b.choiceToken,owner,'choice');if(!Number.isInteger(b.choiceIndex)||b.choiceIndex<0||b.choiceIndex>=choice.options.length)throw Error('Explicitly choose the intended identity.');return {choice,selected:choice.options[b.choiceIndex],reservation:1};}
  if(b.action==='curated-rank'){
   if(!Array.isArray(b.placeTokens)||b.placeTokens.length<2||b.placeTokens.length>4||!Array.isArray(b.tasteTokens)||b.tasteTokens.length<1||b.tasteTokens.length>2)throw Error('Rank two to four confirmed places with one or two confirmed favorites.');
   const places=b.placeTokens.map(t=>get(t,owner,'identity')),tastes=b.tasteTokens.map(t=>get(t,owner,'identity'));
   if(places.some(p=>p.type!=='place'||!selectablePlaces.includes(p.catalogueId))||tastes.some(t=>!types.includes(t.type))||new Set(places.map(p=>p.catalogueId)).size!==places.length||new Set([...places,...tastes].map(x=>x.entityId.toLowerCase())).size!==places.length+tastes.length)throw Error('Use distinct confirmed place and taste identities in their matching roles.');
   return {places,tastes,reservation:places.length+tastes.length+1};
  }
  throw Error('Unknown reviewed-corridor action.');
 }
 async function execute(b,{key,signal,context,owner}){
  const audit={startedAt:new Date(now()).toISOString(),ownerSessionSha256:createHash('sha256').update(owner).digest('hex'),runtime:`@qloo/qloo-harness@${HARNESS_VERSION}`,workflowExecutions:0,networkDispatches:0,dispatchCountComplete:true,generator:'none'};
  const clean=value=>typeof value==='string'?value.replaceAll(key||'\u0000','[redacted]'):Array.isArray(value)?value.map(clean):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([k,v])=>[clean(k),clean(v)])):value;
  const reply=(code,message,extra={},status=200)=>({status,body:clean({requestId:randomUUID(),code,message,cards:[],audit,...extra})});
  async function invoke(op,input,dispatchBudget){audit.workflowExecutions++;const r=await run(op,input,{key,signal,dispatchBudget});audit.networkDispatches+=r.dispatches;if(!envelope(r.data,op))throw Object.assign(Error(),{code:'harness_schema'});return r.data;}
  try{
   if(b.action==='curated-place'||b.action==='curated-signal'){
    const entry=context.entry,type=entry?'place':b.type,name=entry?entry.name:b.favorite.trim();
    const d=await invoke('describe',{entity:name,type});let options=[];
    if(['ok','partial','degraded'].includes(d.status)&&d.results?.length===1){const r=d.results[0];if(entry){const matched=validateCataloguePlace(r,d.interpretation,entry);if(matched)options=[{...matched,type,visitWarning:entry.visitWarning}];}else if(uuid(r.entity_id)&&typeof r.name==='string'&&typeOk(r,d.interpretation,type))options=[{entityId:r.entity_id,name:r.name,type,detail:String(r.properties?.description||'').slice(0,200)}];}
    if(d.status==='needs_input'){
     const issues=d.resolution?.issues||[];
     const candidates=issues.filter(i=>i.input===name&&i.input_kind==='entity'&&i.field==='entity'&&i.scope==='urn:entity:'+type).flatMap(i=>Array.isArray(i.candidates)?i.candidates:[]);
     if(candidates.length<=5)options=candidates.flatMap(c=>{if(entry){const v=validateCataloguePlace({entity_id:c.id,name:c.name,type:c.type,subtype:c.subtype,properties:{address:c.address}},{},entry);return v?[{...v,type,visitWarning:entry.visitWarning}]:[];}return uuid(c.id)&&typeof c.name==='string'&&typeOk({entity_id:c.id,type:c.type,subtype:c.subtype},{},type)?[{entityId:c.id,name:c.name,type,detail:String(c.disambiguation||c.description||'').slice(0,200)}]:[];});
     if(entry&&options.length!==1)options=[];
    }
    if(!options.length||new Set(options.map(o=>o.entityId.toLowerCase())).size!==options.length)return reply('curated_unresolved','No usable identity matched. Edit the favorite or choose another catalogue place; no substitute or automatic retry was used.',{workflowState:'needs_input',resolutionDiagnostic:resolutionDiagnostic(d,name,type,entry)},422);
    const choiceToken=save({kind:'choice',options,entryId:entry?.id},owner);
    return reply('curated_choice','Review the identity and explicitly confirm it. No rank has run.',{choiceToken,choices:options.map(publicIdentity),workflowState:'needs_input',resolutionDiagnostic:{...resolutionDiagnostic(d,name,type,entry),reason:'matched'}});
   }
   if(b.action==='curated-confirm'){
    // Consume only after app-level concurrency/rate checks, never on busy responses.
    get(b.choiceToken,owner,'choice');records.delete(b.choiceToken);
    const chosen=context.selected,d=await invoke('describe',{entity:chosen.entityId,type:chosen.type},1),r=d.results?.[0],outcome=d.resolution?.outcomes?.[0];
    if(d.status!=='ok'||d.results?.length!==1||d.resolution?.outcomes?.length!==1||outcome?.status!=='resolved'||outcome.match!=='identifier'||!equal(outcome.input,chosen.entityId)||!equal(outcome.selected?.id,chosen.entityId)||!equal(r?.entity_id,chosen.entityId)||!equal(d.interpretation?.entity?.entityId,chosen.entityId)||typeof r.name!=='string'||r.name!==chosen.name||!typeOk(r,d.interpretation,chosen.type)||outcome.selected.name!==chosen.name||!typeOk({entity_id:outcome.selected.id,type:outcome.selected.type,subtype:outcome.selected.subtype},{},chosen.type))return reply('curated_confirmation_failed','The returned identity did not confirm the selected match. Resolve again explicitly.',{},422);
    let identity={entityId:r.entity_id,name:r.name,type:chosen.type};
    if(context.choice.entryId){const entry=catalogue.find(e=>e.id===context.choice.entryId),selected=outcome.selected;const v=validateCataloguePlace({...r,properties:{...r.properties,address:r.properties?.address??selected.address}},d.interpretation,entry);const sv=validateCataloguePlace({entity_id:selected.id,name:selected.name,type:selected.type,subtype:selected.subtype,properties:{address:selected.address}},{},entry);if(!v||!sv)return reply('curated_confirmation_failed','Name, address or place type did not match the fixed catalogue.',{},422);identity={...v,type:'place',visitWarning:entry.visitWarning};}
    const identityToken=save({kind:'identity',...identity},owner);return reply('curated_confirmed','Identity confirmed for this session. Access remains unknown. Ranking needs a separate click.',{identityToken,identity:publicIdentity(identity),identityConfirmedAt:new Date(records.get(identityToken).created).toISOString(),identityExpiresAt:new Date(records.get(identityToken).created+900000).toISOString(),workflowState:'ok'});
   }
   const {places,tastes}=context;const rankInput={options:places.map(p=>p.entityId),option_type:'place',signals:tastes.map(t=>t.entityId)};audit.rankInputSha256=createHash('sha256').update(JSON.stringify(rankInput)).digest('hex');const d=await invoke('rank',rankInput,context.reservation);
   if(!['ok','partial','degraded','empty'].includes(d.status)||!Array.isArray(d.results))return reply('curated_rank_incomplete','The provider did not return a usable ranking. No fallback order was substituted.',{workflowState:d.status},422);
   const seen=new Set(),cards=[];
   for(const [index,r]of d.results.entries()){
    const p=places.find(p=>equal(p.entityId,r.entity_id)),entry=catalogue.find(e=>e.id===p?.catalogueId);
    const interpreted=d.interpretation?.options?.find(o=>equal(o.entityId,r.entity_id));
    const match=p&&validateCataloguePlace(r,{entity:interpreted},entry);
    if(!match||seen.has(r.entity_id.toLowerCase())||r.affinity!==undefined&&(typeof r.affinity!=='number'||!Number.isFinite(r.affinity)))throw Object.assign(Error(),{code:'harness_schema'});
    seen.add(r.entity_id.toLowerCase());cards.push({...match,visitWarning:entry.visitWarning,resultPosition:index+1,affinity:r.affinity??null,providerExplanation:r.explainability===undefined?null:boundedProviderDetail(r.explainability)});
   }
   return reply('curated_results',cards.length?'Qloo ranked the confirmed options. Access and safety remain unverified.':'No ranked options returned.',{workflowState:d.status,cards,confirmedTastes:tastes.map(publicIdentity),region:'Mesa–Apache Junction–Superior corridor',omittedCatalogueIds:places.filter(p=>!seen.has(p.entityId.toLowerCase())).map(p=>p.catalogueId),candidateCount:places.length,submittedCatalogueIds:places.map(p=>p.catalogueId),returnedCatalogueIds:cards.map(p=>p.catalogueId),explanationNote:'Only actual returned per-result explanation is shown. Rank does not request explanations. Affinities are aggregate signals, not individual probabilities; scores across requests are not comparable.'});
  }catch(e){audit.dispatchCountComplete=false;const code=['provider_auth','provider_rate_limited','process_termination_unknown','process_timeout','cancelled','harness_schema'].includes(e.code)?e.code:'curated_failed';return reply(code,'The request could not finish safely. No automatic retry or fallback was used.',e.code==='provider_rate_limited'?{retryAfterMs:e.retryAfterMs||60000}:{},502);}
 }
 return {preflight,execute};
}
