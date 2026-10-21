// Synthetic in-memory transport: no credential or provider network request.
globalThis.fetch=async()=>new Response(JSON.stringify({error:'Synthetic rate limit'}),{status:429,headers:{'content-type':'application/json','retry-after':'3600'}});
