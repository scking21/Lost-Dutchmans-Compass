// Local topic guidance only; never a provider signal, affinity or composite score.
export const travelInterests=[
 {id:'history',label:'History',categories:['regional_history_museum','western_film_heritage','mining_interpretation','mining_heritage_attraction','western_history_interpretation','aviation_history_museum','military_history','technology_heritage']},
 {id:'legends',label:'Legends and local lore',categories:[]},
 {id:'nature',label:'Nature and outdoors',categories:['outdoor_recreation','natural_landscape','botanical_garden','desert_plant_conservation','natural_history','natural_history_museum','paleontology']}
];
export function matchedInterests(entry,selected){
 if(!entry)return [];
 return travelInterests.filter(interest=>selected.has(interest.id)&&(interest.id==='legends'?Boolean(entry.legendEvidence):interest.categories.some(category=>entry.categories.includes(category))));
}
