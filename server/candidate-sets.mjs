import {randomUUID} from 'node:crypto';
export function createCandidateSets(now=()=>Date.now()){
 const sets=new Map();
 const prune=()=>{for(const [id,v]of sets)if(now()-v.created>15*60000)sets.delete(id);};
 return {
  remember(body,owner){prune();if(body.mode!=='qloo'||!body.cards?.length||body.brief.verifiedOnly)return null;if(sets.size>=1000)sets.delete(sets.keys().next().value);const id=randomUUID();sets.set(id,{owner,created:now(),requestId:body.requestId,brief:structuredClone(body.brief),cards:structuredClone(body.cards),seed:structuredClone(body.seed)});return id;},
  resolve(b,owner){prune();const previous=sets.get(b.candidateSetId);if(!previous||previous.owner!==owner)throw Error('Candidate set expired or unknown. Discover places again.');
   if(b.destination.trim()!==previous.brief.destination||b.verifiedOnly!==previous.brief.verifiedOnly)throw Error('Destination or access requirement changed. Run a fresh discovery.');
   if(b.favorite.trim()===previous.brief.favorite&&b.type===previous.brief.type)throw Error('Change your cultural favorite before requesting a taste rerank. Local hiding alone is not a new taste signal.');
   if(!Array.isArray(b.candidateIds)||b.candidateIds.length<1||b.candidateIds.length>3||!Array.isArray(b.excludedIds)||b.excludedIds.length>3)throw Error('Choose one to three retained places.');
   const valid=new Set(previous.cards.map(c=>c.entityId));const chosen=new Set(b.candidateIds);if(chosen.size!==b.candidateIds.length||new Set(b.excludedIds).size!==b.excludedIds.length||[...chosen,...b.excludedIds].some(id=>typeof id!=='string'||!valid.has(id))||b.excludedIds.some(id=>chosen.has(id)))throw Error('Only confirmed, unhidden places from this result can be ranked.');
   return {...structuredClone(previous),cards:structuredClone(previous.cards.filter(c=>chosen.has(c.entityId)))};
  }
 };
}
