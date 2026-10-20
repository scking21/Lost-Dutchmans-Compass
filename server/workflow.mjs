import {randomUUID,createHash} from 'node:crypto';
import {runHarness,HARNESS_VERSION} from './harness.mjs';
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const states=new Set(['ok','empty','needs_input','partial','degraded','error']);
const text=(v,n=200)=>typeof v==='string'?v.slice(0,n):'';
const validId=v=>typeof v==='string'&&UUID.test(v);
const validEntity=r=>r&&validId(r.entity_id)&&typeof r.name==='string'&&r.name.length>0;
const typeMatches=(r,t)=>r.type===t||r.subtype===t||r.type===`urn:entity:${t}`||r.subtype===`urn:entity:${t}`;
const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
export async function recommend(b,{key,signal,run=runHarness}={}){
 const requestId=randomUUID(),audit={runtime:`@qloo/qloo-harness@${HARNESS_VERSION}`,workflowExecutions:0,networkDispatches:0,requests:[],generator:'none'};
 const redact=value=>typeof value==='string'&&key?value.replaceAll(key,'[redacted]'):Array.isArray(value)?value.map(redact):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([k,v])=>[k,redact(v)])):value;
 const reply=(code,message,extra={},status=200)=>({status,body:redact({requestId,code,message,cards:[],audit,...extra})});
 if(!b||typeof b!=='object'||!['movie','artist','book','tv_show'].includes(b.type)||typeof b.favorite!=='string'||b.favorite.trim().length<2||b.favorite.length>100||typeof b.destination!=='string'||b.destination.trim().length<2||b.destination.length>80||typeof b.verifiedOnly!=='boolean'||!['qloo','without-qloo','test-failure'].includes(b.mode)||(b.seedId!==undefined&&!validId(b.seedId)))return reply('input','Enter a public city, favorite and supported category.',{workflowState:'needs_input'},400);
 const brief={destination:b.destination.trim(),favorite:b.favorite.trim(),type:b.type,verifiedOnly:b.verifiedOnly};
 if(b.mode==='without-qloo')return reply('generator_not_configured','Without Qloo: the same-model comparison is not configured. No provider calls were made.',{workflowState:'degraded'},503);
 if(b.mode==='test-failure')return reply('controlled_failure','Controlled failure. No harness workflow or provider was called.',{workflowState:'error'},503);
 if(!key)return reply('not_configured','The server-side Qloo credential is not configured.',{workflowState:'error'},503);
 async function workflow(operation,input){
  if(signal?.aborted)throw Object.assign(new Error(),{code:'cancelled'});
  audit.workflowExecutions++;const execution=await run(operation,input,{key,signal});audit.networkDispatches+=execution.dispatches;
  const d=execution.data;
  if(d.operation!==operation)throw Object.assign(new Error(),{code:'harness_schema'});
  if(!states.has(d.status)){
   if(d.error&&typeof d.error.code==='string')return {status:'error',error:{code:d.error.code}};
   throw Object.assign(new Error(),{code:'harness_schema'});
  }
  if(d.schema_version!=='1.0-preview.1'||!d.execution||typeof d.execution.correlation_id!=='string')throw Object.assign(new Error(),{code:'harness_schema'});
  audit.requests.push({operation,status:d.status,correlationId:text(d.execution.correlation_id),retrievedAt:new Date().toISOString(),responseSha256:hash(d),source:'official Qloo harness',endpoint:operation==='describe'?'/entities':'/v2/insights',documentation:operation==='describe'?'https://docs.qloo.com/reference/get-entities':'https://docs.qloo.com/reference/insights-api-deep-dive'});
  return d;
 }
 try{
  const resolved=await workflow('describe',{entity:brief.favorite,type:brief.type});
  let seed;
  if(resolved.status==='needs_input'){
   const choices=(resolved.resolution?.issues||[]).flatMap(i=>Array.isArray(i.candidates)?i.candidates:[]).filter(c=>validId(c.id)&&typeof c.name==='string'&&typeMatches(c,brief.type)).slice(0,5).map(c=>({entityId:c.id,name:text(c.name),detail:text(c.disambiguation||[c.release_year,c.description].filter(Boolean).join(' · '))}));
   seed=b.seedId?choices.find(c=>c.entityId.toLowerCase()===b.seedId.toLowerCase()):null;
   if(!seed)return reply('choose_seed',choices.length?'Choose the intended match, then submit again.':'The harness needs a clearer favorite. Refine its title or category.',{choices,workflowState:'needs_input'},422);
  }else if(['ok','partial','degraded'].includes(resolved.status)){
   const rows=Array.isArray(resolved.results)?resolved.results.filter(r=>validEntity(r)&&typeMatches(r,brief.type)):[];
   if(rows.length!==1)return reply('unresolved_seed','The harness did not resolve one unambiguous favorite.',{workflowState:'needs_input'},422);
   seed={entityId:rows[0].entity_id,name:text(rows[0].name)};
   if(b.seedId&&b.seedId.toLowerCase()!==seed.entityId.toLowerCase())return reply('seed_changed','Your selected identity no longer matches. Search again.',{workflowState:'needs_input'},422);
  }else return reply('resolution_'+resolved.status,'The official harness could not resolve this favorite. Try a clearer title or check the integration.',{workflowState:resolved.status},resolved.status==='error'?502:200);
  const d=await workflow('recommend',{target_type:'place',signals:[seed.entityId],filter_location:brief.destination,explain:true,limit:3});
  if(d.status==='needs_input')return reply('needs_input','The harness needs clearer recommendation constraints. Refine your city or favorite.',{workflowState:d.status},422);
  if(d.status==='error')return reply('harness_error','The official harness could not complete the recommendation. No fallback results were substituted.',{workflowState:'error'},502);
  if(!Array.isArray(d.results))throw Object.assign(new Error(),{code:'harness_schema'});
  const seen=new Set(),cards=[];
  for(const [index,r]of d.results.entries()){
   if(!validEntity(r)||!typeMatches(r,'place')||seen.has(r.entity_id.toLowerCase())||(r.affinity!==undefined&&(typeof r.affinity!=='number'||!Number.isFinite(r.affinity))))throw Object.assign(new Error(),{code:'harness_schema'});
   seen.add(r.entity_id.toLowerCase());cards.push({entityId:r.entity_id,name:text(r.name),address:text(r.properties?.address,300),affinity:r.affinity??null,resultPosition:index+1,access:'unknown',mapping:'direct Qloo place entity',explanation:`The official harness recommended this entity for ${seed.name}, constrained to ${brief.destination}. This is Compass’s query summary, not a causal claim about you.`});
  }
  return reply(cards.length&&!brief.verifiedOnly?'results':'no_eligible_results',brief.verifiedOnly?'No independently verified access evidence is connected; all returned places are excluded.':cards.length?'Recommendations returned by the official Qloo harness. Check access before visiting.':'The harness returned no places. Refine the brief.',{mode:'qloo',workflowState:d.status,brief,seed,cards:brief.verifiedOnly?[]:cards.slice(0,3),excludedUnverified:brief.verifiedOnly?cards.length:0,warnings:['Access and historical facts are not verified.',...(['partial','degraded'].includes(d.status)?['The harness marked this result '+d.status+'.']:[])]});
 }catch(e){const code=['cancelled','process_termination_unknown','process_timeout','process_output_limit','process_start','invalid_harness_output','harness_schema'].includes(e.code)?e.code:'harness_error';return reply(code,'The official harness workflow could not finish safely. No automatic app retry or fallback was used.',{workflowState:'error'},502);}
}
