import {catalogue} from './catalogue.mjs';
// Deliberately narrow normalization: Unicode, punctuation and common street suffixes.
// No fuzzy names, distance proxy, generated coordinates or inferred identity.
export const normalizeIdentity=v=>typeof v==='string'?v.normalize('NFKC').toLowerCase().replace(/[.,:’'\-]/g,' ').replace(/\broad\b/g,'rd').replace(/\s+/g,' ').trim():'';
const residential={name:'Lost Dutchman',address:'10936 E Apache Trail Apache Junction AZ 85120',source:'https://www.suncommunities.com/arizona/lost-dutchman'};
export function applyDomainScope(cards,identities=[],entries=catalogue){
 const reviewedMappings=new Map(identities.map(i=>[i.entityId.toLowerCase(),i.catalogueId]));
 const eligible=[],excluded=[];
 for(const card of cards){
  if(normalizeIdentity(card.name)===normalizeIdentity(residential.name)&&normalizeIdentity(card.address)===normalizeIdentity(residential.address)){excluded.push({entityId:card.entityId,name:card.name,resultPosition:card.resultPosition,reason:'Official operator identifies this address as a residential community, not the state park or a catalogue visitor attraction.',source:residential.source});continue;}
  const named=entries.filter(c=>[c.name,...c.aliases].some(n=>normalizeIdentity(n)===normalizeIdentity(card.name)));
  const matched=named.filter(c=>c.address&&normalizeIdentity(c.address)===normalizeIdentity(card.address));
  if(matched.length!==1){excluded.push({entityId:card.entityId,name:card.name,resultPosition:card.resultPosition,reason:named.length?'Name match without independently matching public address; identity unresolved.':'No exact name-and-address match in the frozen eight-place catalogue; visitor scope is unverified.'});continue;}
  const entry=matched[0];if(entry.blocked){excluded.push({entityId:card.entityId,name:card.name,resultPosition:card.resultPosition,reason:'Official source snapshot reports a seasonal closure/status conflict; excluded pending a current check.',source:entry.sources[0].url});continue;}
  if(reviewedMappings.get(typeof card.entityId==='string'?card.entityId.toLowerCase():'')!==entry.id){excluded.push({entityId:card.entityId,name:card.name,resultPosition:card.resultPosition,reason:'Name and address match, but Qloo-to-catalogue identity mapping has not been reviewed. Excluded pending review.'});continue;}
  eligible.push({...card,catalogueEvidence:{catalogueId:entry.id,match:'Reviewed Qloo entity ID plus exact name or recorded alias and normalized public street address',categories:entry.categories,sources:entry.sources,visitWarning:entry.visitWarning,access:'unknown'}});
 }
 return {cards:eligible,excluded,inputCount:cards.length,eligibleCount:eligible.length,catalogueSize:entries.length,reviewedMappingCount:reviewedMappings.size,matchedCatalogueCount:new Set(eligible.map(c=>c.catalogueEvidence.catalogueId)).size,additionalProviderCalls:0,providerOrderUnchanged:true,note:'Local factual scope filter over Qloo-returned places, not a new Qloo ranking. Catalogue absence does not establish that a place is unsuitable. Access, opening hours and safety remain unverified.'};
}
