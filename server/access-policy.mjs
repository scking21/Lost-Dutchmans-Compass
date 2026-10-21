// A deployment-local safety envelope, never evidence of a provider allowance.
// Judging is the production default. Pilot ceilings apply only when explicitly selected.
export function readAccessPolicy(env) {
 const integer=(value,fallback,name,max)=>{
  const n=Number(value===undefined||value===''?fallback:value);
  if(!Number.isSafeInteger(n)||n<1||n>max)throw Error(`Invalid ${name}`);
  return n;
 };
 const mode=env.ACCESS_MODE||'judging';
 if(!['pilot','judging'].includes(mode))throw Error('Invalid ACCESS_MODE');
 const maxDispatchCredits=integer(env.MAX_DISPATCH_CREDITS,12,'MAX_DISPATCH_CREDITS',1_000_000);
 const maxLiveRuns=integer(env.MAX_LIVE_RUNS,3,'MAX_LIVE_RUNS',1000);
 const rawExpiry=env.LIVE_ACCESS_UNTIL;
 let expiresAt=null;
 if(rawExpiry){
  if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(rawExpiry)||!Number.isFinite(Date.parse(rawExpiry))||new Date(rawExpiry).toISOString()!==rawExpiry)throw Error('Invalid LIVE_ACCESS_UNTIL');
  expiresAt=Date.parse(rawExpiry);
 }
 return Object.freeze({mode,maxDispatchCredits:mode==='pilot'?maxDispatchCredits:null,maxLiveRuns:mode==='pilot'?maxLiveRuns:null,expiresAt});
}
