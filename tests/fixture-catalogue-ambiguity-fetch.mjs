// Entirely synthetic IDs/transport; factual venue labels come from the independent catalogue.
import {catalogue} from '../public/catalogue.mjs';
const places=['real-06','real-07'].map((id,i)=>{const e=catalogue.find(c=>c.id===id),n=String(i+1);return {entity_id:`${n.repeat(8)}-${n.repeat(4)}-4${n.repeat(3)}-8${n.repeat(3)}-${n.repeat(12)}`,name:e.name,types:['urn:entity:place'],properties:{address:e.address}};});
globalThis.fetch=async(input)=>{
 const u=new URL(input instanceof Request?input.url:String(input));
 if(u.origin!=='https://hackathon.api.qloo.com')throw Error('Fixture refuses unknown host');
 if(u.pathname==='/search'){
  const found=places.find(p=>p.name===u.searchParams.get('query'));
  return Response.json({success:true,results:!found?[]:found===places[0]?[found]:[found,{...found,entity_id:'33333333-3333-4333-8333-333333333333',properties:{address:'900 Other Road, Fictional City, ZZ 00000'}}]});
 }
 if(u.pathname==='/entities')return Response.json({success:true,results:{entities:places.filter(p=>p.entity_id===u.searchParams.get('entity_ids'))}});
 throw Error('Fixture refuses unknown path');
};
