// External transport guard. The pinned official harness is not modified.
// This module is preloaded only inside the isolated child process.
export function guardedFetch(fetcher,{maxCalls=2,timeoutMs=7000,onDispatch=()=>{},onProviderStop=()=>{}}={}) {
 const seen=new Set();let calls=0,stopped=false;
 return async(input,init={})=>{
  const url=new URL(typeof input==='string'||input instanceof URL?input:input.url);
  const method=init.method||(input instanceof Request?input.method:'GET');
  if(url.origin!=='https://hackathon.api.qloo.com'||url.username||url.password||method!=='GET'||!['/search','/entities','/v2/insights','/v2/insights/'].includes(url.pathname))throw new TypeError('Network destination denied');
  if(stopped)throw new TypeError('Provider requested a pause');
  if(seen.has(url.href)||calls>=maxCalls)throw new TypeError('Network dispatch budget exhausted');
  seen.add(url.href);calls++;onDispatch(calls);
  const signal=init.signal?AbortSignal.any([init.signal,AbortSignal.timeout(timeoutMs)]):AbortSignal.timeout(timeoutMs);
  const result=await fetcher(input,{...init,signal,redirect:'manual'});
  if([401,403,429].includes(result.status)){stopped=true;const raw=result.headers.get('retry-after');const delay=raw&&/^\d+$/.test(raw)?Number(raw)*1000:raw?Date.parse(raw)-Date.now():60000;onProviderStop(result.status,Number.isSafeInteger(delay)&&delay>=0?Math.max(60000,delay):60000);}
  if(result.status>=300&&result.status<400){await result.body?.cancel();throw new TypeError('Redirect denied');}
  return result;
 };
}
if(process.env.COMPASS_EGRESS_GUARD==='1')globalThis.fetch=guardedFetch(globalThis.fetch.bind(globalThis),{maxCalls:['1','2','4','5','6','7'].includes(process.env.COMPASS_WORKFLOW_BUDGET)?Number(process.env.COMPASS_WORKFLOW_BUDGET):2,onProviderStop:(status,delay)=>process.stderr.write(`COMPASS_PROVIDER_STOP:${status}:${delay}\n`),onDispatch:count=>process.stderr.write(`COMPASS_EGRESS:${count}\n`)});
