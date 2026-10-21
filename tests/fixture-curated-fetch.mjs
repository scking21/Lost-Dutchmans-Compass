// Synthetic transport only. Public catalogue facts are independent inputs; IDs/scores are invented.
import {catalogue} from '../public/catalogue.mjs';
const id=n=>`${String(n).padStart(8,'0')}-1111-4111-8111-111111111111`;
const entries=catalogue.filter(e=>!e.blocked&&e.address).map((e,i)=>({entity_id:id(i+1),name:e.name,type:'urn:entity',subtype:'urn:entity:place',properties:{address:e.address}}));
entries.push({entity_id:id(20),name:'Fixture Film',type:'urn:entity',subtype:'urn:entity:movie',properties:{}},{entity_id:id(21),name:'Fixture Artist',type:'urn:entity',subtype:'urn:entity:artist',properties:{}});
globalThis.fetch=async input=>{const u=new URL(input instanceof Request?input.url:String(input));if(u.origin!=='https://hackathon.api.qloo.com')throw Error('Fixture refuses host');
 if(u.pathname==='/search')return Response.json({success:true,results:entries.filter(e=>e.name===u.searchParams.get('query'))});
 if(u.pathname==='/entities')return Response.json({success:true,results:{entities:entries.filter(e=>e.entity_id===u.searchParams.get('entity_ids'))}});
 if(['/v2/insights','/v2/insights/'].includes(u.pathname)){const options=u.searchParams.get('filter.results.entities').split(',');return Response.json({success:true,results:{entities:options.toReversed().map((id,i)=>({...entries.find(e=>e.entity_id===id),query:{affinity:.9-i/10,explainability:{fixture:'Actual returned per-row fixture detail'}}}))}});}
 throw Error('Fixture refuses path');
};
