// Visitor choices are local annotations, never new Qloo rankings or scores.
export function createRefinement(cards) {
 const original=structuredClone(cards),ids=new Set(original.map(c=>c.entityId));
 if(ids.size!==original.length)throw Error('Duplicate card identity');
 const shortlisted=new Set(),excluded=new Set();
 const check=id=>{if(!ids.has(id))throw Error('Unknown card identity');};
 return {
  toggleShortlist(id){check(id);if(excluded.has(id))throw Error('Restore this place before shortlisting it');if(shortlisted.has(id))shortlisted.delete(id);else shortlisted.add(id);},
  toggleExcluded(id){check(id);if(excluded.has(id))excluded.delete(id);else{excluded.add(id);shortlisted.delete(id);}},
  snapshot(){return {cards:structuredClone(original.filter(c=>!excluded.has(c.entityId))),excluded:structuredClone(original.filter(c=>excluded.has(c.entityId))),shortlistedIds:[...shortlisted],excludedIds:[...excluded],source:'visitor choices in this browser',providerOrderUnchanged:true,additionalProviderCalls:0};}
 };
}
