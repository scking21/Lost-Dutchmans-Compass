// Test-only fake transport. Never imported by production server code.
const seed={entity_id:'11111111-1111-4111-8111-111111111111',name:'Arrival',type:'urn:entity',subtype:'urn:entity:movie',properties:{release_year:2016}};
const place={entity_id:'22222222-2222-4222-8222-222222222222',name:'Mock Museum',type:'urn:entity',subtype:'urn:entity:place',properties:{address:'Mock address'},query:{affinity:.7}};
const places=[place,...['3','4'].map(n=>({...place,entity_id:`${n.repeat(8)}-${n.repeat(4)}-4${n.repeat(3)}-8${n.repeat(3)}-${n.repeat(12)}`,name:'Mock place '+n}))];
globalThis.fetch=async(input,init)=>{
 const u=new URL(input instanceof Request?input.url:String(input));
 if(u.origin!=='https://hackathon.api.qloo.com')throw Error('Fixture refuses unknown host');
 if(u.pathname==='/search'){const q=u.searchParams.get('query');if(q==='Unknown')return Response.json({success:true,results:[]});if(q==='Ambiguous')return Response.json({success:true,results:[{...seed,name:'Ambiguous'},{...seed,name:'Ambiguous',entity_id:'33333333-3333-4333-8333-333333333333'}]});return Response.json({success:true,results:[seed]});}
 if(u.pathname==='/entities')return Response.json({success:true,results:{entities:[places.find(p=>p.entity_id===u.searchParams.get('entity_ids'))||seed]}});
 if(['/v2/insights','/v2/insights/'].includes(u.pathname))return Response.json({success:true,query:{explainability:{signal:'Fixture query-level detail'}},results:{entities:u.searchParams.has('filter.results.entities')?u.searchParams.get('filter.results.entities').split(',').reverse().map(id=>places.find(p=>p.entity_id===id)):[place]}});
 throw Error('Fixture refuses unknown path');
};
