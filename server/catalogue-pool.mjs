import {randomUUID} from 'node:crypto';
import {catalogue} from '../public/catalogue.mjs';
import {normalizeIdentity} from '../public/domain.mjs';
import {runHarness,HARNESS_VERSION} from './harness.mjs';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const pilotCatalogueIds=Object.freeze(['real-06','real-07']);
export function validateCataloguePlace(row,interpretation,entry){
 if(!row||typeof row.entity_id!=='string'||!uuid.test(row.entity_id)||entry.blocked||!entry.address)return null;
 const scalars=[row.type,row.subtype].filter(v=>v!==undefined);
 if(scalars.some(v=>typeof v!=='string'||!['place','urn:entity:place','urn:entity'].includes(v)))return null;
 const explicit=scalars.some(v=>['place','urn:entity:place'].includes(v));
 const resolved=interpretation?.entity;
 const bound=resolved&&typeof resolved.entityId==='string'&&resolved.entityId.toLowerCase()===row.entity_id.toLowerCase()&&['place','urn:entity:place'].includes(resolved.type);
 if(!explicit&&!bound)return null;
 if(![entry.name,...entry.aliases].some(n=>normalizeIdentity(n)===normalizeIdentity(row.name))||normalizeIdentity(row.properties?.address)!==normalizeIdentity(entry.address))return null;
 return {entityId:row.entity_id,name:row.name,address:row.properties.address,catalogueId:entry.id,access:'unknown'};
}
export async function resolveCatalogue(b,{key,signal,run=runHarness}={}){
 const audit={runtime:`@qloo/qloo-harness@${HARNESS_VERSION}`,workflowExecutions:0,networkDispatches:0,dispatchCountComplete:true,generator:'none'};
 const response=(code,message,status=422,extra={})=>({status,body:{requestId:randomUUID(),code,message,cards:[],audit,...extra}});
 if(b.destination.trim().toLowerCase()!=='mesa')return response('catalogue_region','This fixed local shortlist supports Mesa and the nearby Apache Junction corridor. No provider call was made.');
 if(!key)return response('not_configured','Server-side Qloo credential is not configured.',503);
 const cards=[];
 try{
  for(const id of pilotCatalogueIds){
   const entry=catalogue.find(c=>c.id===id);
   audit.workflowExecutions++;const result=await run('describe',{entity:entry.name,type:'place'},{key,signal});audit.networkDispatches+=result.dispatches;
   const d=result.data;
   if(d.operation!=='describe'||d.schema_version!=='1.0-preview.1'||!d.execution?.correlation_id)return response('catalogue_schema','Place resolution returned an invalid schema. No ranking was run.',502);
   if(!['ok','partial','degraded'].includes(d.status)||d.results?.length!==1)return response('catalogue_unresolved',`${cards.length} of ${pilotCatalogueIds.length} local identities matched. ${entry.name} was unresolved or ambiguous. Stopped without retry or ranking.`,422,{resolutionProgress:{matchedCount:cards.length,total:pilotCatalogueIds.length,stoppedAtCatalogueName:entry.name,reason:'unresolved_or_ambiguous'}});
   const card=validateCataloguePlace(d.results[0],d.interpretation,entry);
   if(!card||cards.some(c=>c.entityId.toLowerCase()===card.entityId.toLowerCase()))return response('catalogue_unresolved',`${cards.length} of ${pilotCatalogueIds.length} local identities matched. ${entry.name} did not pass exact name, address and place-identity checks. Stopped without retry or ranking.`,422,{resolutionProgress:{matchedCount:cards.length,total:pilotCatalogueIds.length,stoppedAtCatalogueName:entry.name,reason:'identity_mismatch'}});
   cards.push(card);
  }
  return response('catalogue_resolved','Two local visitor identities matched the independently sourced catalogue. Rank this fixed shortlist with your favorite; access remains unknown.',200,{resolvedPlaceCount:cards.length,resolvedPlaces:cards.map(c=>catalogue.find(e=>e.id===c.catalogueId).name),privateCatalogueContext:{cards,region:'Mesa area',source:'session-bound official place resolution'}});
 }catch(e){audit.dispatchCountComplete=false;return response(e.code==='process_termination_unknown'?'process_termination_unknown':'catalogue_failed','Place resolution could not finish safely. No automatic retry or ranking was run.',502);}
}
export function createCatalogueSessions(now=()=>Date.now()){
 const sets=new Map();
 const prune=()=>{for(const [id,s]of sets)if(now()-s.created>900000)sets.delete(id);};
 return {
  remember(context,owner){prune();if(sets.size>=1000)sets.delete(sets.keys().next().value);const id=randomUUID();sets.set(id,{context:structuredClone(context),owner,created:now()});return id;},
  resolve(b,owner){prune();const s=sets.get(b.catalogueSetId);if(!s||s.owner!==owner)throw Error('Local shortlist expired or unknown. Resolve it again.');if(b.destination.trim().toLowerCase()!=='mesa')throw Error('Local shortlist supports Mesa only.');return structuredClone(s.context);}
 };
}
