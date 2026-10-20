export const LABEL='Synthetic fixture ranking; no live Qloo data';
export const INTERESTS={geology:'Rock formations',mining:'Mining stories',scenery:'Desert scenery'};
export const SCENARIOS=['normal','missing','empty','closed','invalid','timeout'];
const text=v=>typeof v==='string'&&v.trim().length>0;
const need=(ok,message)=>{if(!ok)throw Error(message);};
const fields=(x,keys)=>need(x&&Object.getPrototypeOf(x)===Object.prototype&&Object.keys(x).length===keys.length&&keys.every(k=>Object.hasOwn(x,k)),'Malformed fixture record');
export function rankCatalog(catalog,ranking){
 need(Array.isArray(catalog),'Catalog must be a list');fields(ranking,['origin','source','results']);
 need(ranking.origin==='fixture'&&ranking.source==='synthetic-fixture'&&Array.isArray(ranking.results),'Only labelled synthetic ranking supported');
 const ids=new Set();
 for(const row of catalog){fields(row,['id','name','access','rights']);need(text(row.id)&&!ids.has(row.id)&&text(row.name),'Missing or duplicate catalog identity');ids.add(row.id);fields(row.access,['allowed','evidence']);need(typeof row.access.allowed==='boolean'&&text(row.access.evidence),'Invalid access evidence');fields(row.rights,['source','license']);need(text(row.rights.source)&&text(row.rights.license),'Invalid rights evidence');}
 const scores=new Map();
 for(const row of ranking.results){fields(row,['id','score']);need(text(row.id)&&ids.has(row.id)&&!scores.has(row.id),'Unknown or duplicate ranked identity');need(typeof row.score==='number'&&Number.isFinite(row.score),'Invalid fixture score');scores.set(row.id,row.score);}
 const eligible=structuredClone(catalog.filter(row=>row.access.allowed));
 return {ranked:eligible.filter(row=>scores.has(row.id)).sort((a,b)=>scores.get(b.id)-scores.get(a.id)),unscored:eligible.filter(row=>!scores.has(row.id)),excluded_ids:catalog.filter(row=>!row.access.allowed).map(row=>row.id),label:LABEL};
}
export function makeRequest(interest,scenario,id){
 need(Object.hasOwn(INTERESTS,interest)&&SCENARIOS.includes(scenario)&&text(id),'Choose a supported interest and scenario');
 return {id,interest,scenario,dispatch_enabled:false,provenance:'Handcrafted synthetic fixture; no Qloo entity resolution'};
}
export function catalogFor(scenario){return [
 {id:'rock',name:'Example rock-formation overlook',description:'An invented geology stop inspired by the desert landscape.'},
 {id:'mine',name:'Example mining-story exhibit',description:'An invented history stop. Its closure tests access filtering.'},
 {id:'desert',name:'Example desert-view walk',description:'An invented scenery stop used to compare fixture ordering.'}
 ].map(({id,name})=>({id,name,access:{allowed:scenario!=='closed'&&id!=='mine',evidence:scenario==='closed'||id==='mine'?'Fictional closure for testing. No real access information.':'Fictional permission for testing. No real access information.'},rights:{source:'Invented demo catalog',license:'Synthetic fixture only'}}));}
export function responseFor(request){
 makeRequest(request.interest,request.scenario,request.id);
 need(request.dispatch_enabled===false,'Live dispatch is unsupported');
 const catalog=catalogFor(request.scenario);
 const values={geology:[.9,.99,.4],mining:[.4,.99,.6],scenery:[.3,.99,.95]}[request.interest];
 let rows=catalog.map((row,i)=>({id:row.id,score:values[i]}));
 if(request.scenario==='missing')rows=rows.filter(row=>row.id!=='desert');
 if(request.scenario==='empty')rows=[];
 if(request.scenario==='invalid')rows[0].score='invalid';
 const result=rankCatalog(catalog,{origin:'fixture',source:'synthetic-fixture',results:rows});
 return {mode:'synthetic',request:{id:request.id,interest:request.interest,scenario:request.scenario},result,excluded:catalog.filter(row=>result.excluded_ids.includes(row.id))};
}
function validateResponse(data,request){
 need(data?.mode==='synthetic'&&data.request?.id===request.id&&data.request?.interest===request.interest&&data.request?.scenario===request.scenario,'Response does not match the selected fixture request');
 const expected=responseFor(request);
 need(JSON.stringify(data)===JSON.stringify(expected),'Malformed or inconsistent synthetic response');
 return data;
}
export function createController(transport,render,timeoutMs=2500){
 let generation=0;
 return {async run(interest,scenario){
  const current=++generation;render({status:'loading'});let timer;
  try{
   const request=makeRequest(interest,scenario,`fixture-${current}`);
   const timeout=new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('The synthetic request timed out. No recommendation shown.')),timeoutMs);});
   const data=validateResponse(await Promise.race([Promise.resolve().then(()=>transport(request)),timeout]),request);
   if(current===generation)render({status:'ready',data,request});
  }catch(error){if(current===generation)render({status:'error',message:error instanceof Error?error.message:'Synthetic request failed'});}
  finally{clearTimeout(timer);}
 },invalidate(){generation++;render({status:'idle'});}};
}
export async function localTransport(request){
 if(request.scenario==='timeout')return new Promise(()=>{});
 await new Promise(resolve=>setTimeout(resolve,180));return responseFor(request);
}
