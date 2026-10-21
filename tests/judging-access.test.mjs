import test from 'node:test';
import assert from 'node:assert/strict';
import {createApp} from '../server/index.mjs';
import {canStartLive} from '../public/capacity.mjs';
const env={ACCESS_MODE:'pilot',APP_ORIGIN:'https://demo.example',QLOO_API_KEY:'OFFLINE-TEST-ONLY'};
const brief={destination:'Mesa',favorite:'Arrival',type:'movie',mode:'qloo',verifiedOnly:false};
const request=()=>new Request(`${env.APP_ORIGIN}/api/recommend`,{method:'POST',headers:{origin:env.APP_ORIGIN,'content-type':'application/json'},body:JSON.stringify(brief)});
const status=async app=>(await app(new Request(`${env.APP_ORIGIN}/api/status`))).json();
test('capacity is shared across visitors and status never labels it account allowance',async()=>{
 let calls=0;
 const app=createApp({env,workflow:async()=>{calls++;return {status:200,body:{cards:[]}};}});
 for(const ip of ['visitor-one','visitor-two','visitor-three'])assert.equal((await app(request(),ip)).status,200);
 assert.equal((await app(request(),'judge-four')).status,429);
 const s=await status(app);assert.equal(s.dispatchCreditsRemaining,0);assert.equal(s.liveRunsRemaining,0);assert.equal(s.budgetScope,'process');assert.equal(s.providerAllowanceKnown,false);assert.equal(calls,3);
});
test('new app process resets pilot reservations, not provider allowance',async()=>{
 const options={env,workflow:async()=>({status:200,body:{cards:[]}})};
 const first=createApp({...options,now:()=>1000});await first(request());
 assert.equal((await status(first)).dispatchCreditsRemaining,8);
 const second=createApp({...options,now:()=>2000});const s=await status(second);
 assert.equal(s.dispatchCreditsRemaining,12);assert.equal(s.providerAllowanceKnown,false);assert.equal(s.processStartedAt,new Date(2000).toISOString());
});
test('uncertain termination pauses status and UI despite unused credits',async()=>{
 const app=createApp({env,workflow:async()=>({status:502,body:{code:'process_termination_unknown',cards:[]}})});
 await app(request());const s=await status(app);
 assert.equal(s.dispatchCreditsRemaining,8);assert.equal(s.liveExecutionAllowed,false);assert.equal(s.livePauseReason,'termination_uncertain');
 assert.equal(canStartLive({configured:s.configured,credits:s.dispatchCreditsRemaining,runs:s.liveRunsRemaining,executionAllowed:s.liveExecutionAllowed},4),false);
 assert.equal((await app(request())).status,429);
});

test('policy rejects malformed values',async()=>{
 for(const extra of [{ACCESS_MODE:'unknown'},{MAX_DISPATCH_CREDITS:'Infinity'},{MAX_DISPATCH_CREDITS:'0'},{LIVE_ACCESS_UNTIL:'2026-11-31T00:00:00.000Z'},{LIVE_ACCESS_UNTIL:'tomorrow'}])assert.throws(()=>createApp({env:{...env,...extra}}));
});
test('expiry prevents dispatch and retains already charged reservations',async()=>{
 let time=1000,calls=0;
 const app=createApp({env:{...env,MAX_DISPATCH_CREDITS:'24',MAX_LIVE_RUNS:'6',LIVE_ACCESS_UNTIL:'1970-01-01T00:00:02.000Z'},now:()=>time,workflow:async()=>{calls++;return {status:200,body:{cards:[]}};}});
 assert.equal((await app(request())).status,200);time=2000;
 const s=await status(app);assert.equal(s.maxDispatchCredits,24);assert.equal(s.dispatchCreditsRemaining,20);assert.equal(s.liveExecutionAllowed,false);assert.equal(s.livePauseReason,'access_expired');assert.equal(s.providerAllowanceKnown,false);
 assert.equal((await app(request())).status,429);assert.equal(calls,1);
});
test('concurrent requests reserve before dispatch and failures are not refunded',async()=>{
 const completions=[];let calls=0;
 const app=createApp({env,workflow:()=>{calls++;return new Promise(resolve=>completions.push(resolve));}});
 const first=app(request(),'one'),second=app(request(),'two');
 while(completions.length<2)await new Promise(r=>setImmediate(r));
 assert.equal((await app(request(),'three')).status,429);assert.equal(calls,2);assert.equal((await status(app)).dispatchCreditsRemaining,4);
 for(const done of completions)done({status:502,body:{code:'harness_error',cards:[]}});await Promise.all([first,second]);
 assert.equal((await status(app)).dispatchCreditsRemaining,4);
});

test('default judging mode ignores old global test caps and serves independent sessions',async()=>{
 let calls=0;const app=createApp({env:{...env,ACCESS_MODE:undefined,MAX_LIVE_RUNS:'3'},workflow:async()=>{calls++;return {status:200,body:{cards:[]}};}});
 for(let i=0;i<8;i++)assert.equal((await app(request(),'same-render-proxy')).status,200);
 const s=await status(app);assert.equal(s.accessMode,'judging');assert.equal(s.dispatchCreditsRemaining,null);assert.equal(s.liveRunsRemaining,null);assert.equal(s.budgetScope,'operation');assert.equal(calls,8);
 assert.equal(canStartLive({configured:true,accessMode:'judging',credits:null,runs:null,executionAllowed:true},7),true);
});
test('judging rate limits a session but not another judge behind the same proxy',async()=>{
 let time=0,calls=0;const app=createApp({env:{...env,ACCESS_MODE:'judging'},now:()=>time,workflow:async()=>{calls++;return {status:200,body:{cards:[]}};}});
 const send=cookie=>{const req=request();req.headers.set('cookie',`compass_session=${cookie}`);return app(req,'same-proxy');};
 const one='11111111-1111-4111-8111-111111111111',two='22222222-2222-4222-8222-222222222222';
 for(let i=0;i<4;i++)assert.equal((await send(one)).status,200);
 assert.equal((await send(one)).status,429);assert.equal((await send(two)).status,200);
 time=60000;assert.equal((await send(one)).status,200);assert.equal(calls,6);
});
test('judging mode pauses after provider auth errors and temporarily after 429, never retries automatically',async()=>{
 for(const code of ['provider_auth','provider_rate_limited']){
  let time=0,calls=0;const app=createApp({env:{...env,ACCESS_MODE:'judging'},now:()=>time,workflow:async()=>{calls++;return {status:502,body:{code,cards:[]}};}});
  assert.equal((await app(request())).status,502);assert.equal((await status(app)).livePauseReason,code);
  assert.equal((await app(request())).status,429);assert.equal(calls,1);time=60000;
  assert.equal((await status(app)).liveExecutionAllowed,code==='provider_rate_limited');assert.equal(calls,1);
 }
});

test('a longer provider cooldown is not silently shortened to one minute',async()=>{
 let time=0,calls=0;const app=createApp({env:{...env,ACCESS_MODE:'judging'},now:()=>time,workflow:async()=>{calls++;return {status:502,body:{code:'provider_rate_limited',retryAfterMs:3600000,cards:[]}};}});
 await app(request());time=60000;assert.equal((await status(app)).liveExecutionAllowed,false);assert.equal((await app(request())).status,429);assert.equal(calls,1);
 time=3600000;assert.equal((await status(app)).liveExecutionAllowed,true);assert.equal(calls,1);
});

test('later concurrent short provider cooldown cannot overwrite a longer pause',async()=>{
 let time=0;const pending=[];const app=createApp({env:{...env,ACCESS_MODE:'judging'},now:()=>time,workflow:()=>new Promise(resolve=>pending.push(resolve))});
 const long=app(request(),'one'),short=app(request(),'two');while(pending.length<2)await new Promise(r=>setImmediate(r));
 pending[0]({status:502,body:{code:'provider_rate_limited',retryAfterMs:3600000,cards:[]}});await long;time=1000;
 pending[1]({status:502,body:{code:'provider_rate_limited',retryAfterMs:60000,cards:[]}});await short;time=61000;
 const s=await status(app);assert.equal(s.liveExecutionAllowed,false);assert.equal(s.providerRetryAt,'1970-01-01T01:00:00.000Z');
});
