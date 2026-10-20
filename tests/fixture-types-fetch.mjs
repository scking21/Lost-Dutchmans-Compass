// Test-only transport variant: documented provider types arrays, not scalar subtype.
import './fixture-fetch.mjs';
const original=globalThis.fetch;
const convert=v=>Array.isArray(v)?v.map(convert):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).filter(([k])=>!['type','subtype'].includes(k)).map(([k,x])=>[k,convert(x)]).concat(v.subtype?[['types',[v.subtype]]]:[])):v;
globalThis.fetch=async(...args)=>{const r=await original(...args);return Response.json(convert(await r.json()),{status:r.status});};
