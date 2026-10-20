export function canStartLive({configured,credits,runs},required){return configured===true&&Number.isInteger(credits)&&credits>=required&&Number.isInteger(runs)&&runs>0;}
