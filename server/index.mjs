import {readAccessPolicy} from './access-policy.mjs';
import {catalogue} from '../public/catalogue.mjs';
import {resolveCatalogue,confirmCatalogue,createCatalogueSessions} from './catalogue-pool.mjs';
import {createCandidateSets} from './candidate-sets.mjs';
import http from 'node:http';import {readFile,readdir} from 'node:fs/promises';import {fileURLToPath,pathToFileURL} from 'node:url';import {createHash,randomUUID} from 'node:crypto';import {recommend,validBrief} from './workflow.mjs';
const publicRoot=new URL('../public/',import.meta.url),assets=new Map();
async function load(path=''){for(const f of await readdir(new URL(path,publicRoot),{withFileTypes:true})){const name=path+f.name;if(f.isDirectory())await load(name+'/');else assets.set('/'+name,await readFile(new URL(name,publicRoot)));}}
await load();
const security={'cache-control':'no-store','x-content-type-options':'nosniff','referrer-policy':'no-referrer','content-security-policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'"};
const json=(data,status=200)=>Response.json(data,{status,headers:security});
export function createApp({env=process.env,workflow=recommend,catalogueResolver=resolveCatalogue,catalogueConfirmer=confirmCatalogue,now=()=>Date.now(),concurrencyLimit=1}={}){
 if(![1,2].includes(concurrencyLimit))throw Error('Invalid concurrency limit');
 const processStartedAt=new Date(now()).toISOString();
 let active=0,liveRuns=0,reservedDispatches=0,terminationUncertain=false,providerAuthPaused=false,providerRetryAt=0;const candidateSets=createCandidateSets(now),catalogueSessions=createCatalogueSessions(now);const rate=new Map(),socketRate=new Map();const {mode:accessMode,maxLiveRuns,maxDispatchCredits,expiresAt}=readAccessPolicy(env);
 const pauseReason=()=>terminationUncertain?'termination_uncertain':providerAuthPaused?'provider_auth':now()<providerRetryAt?'provider_rate_limited':expiresAt!==null&&now()>=expiresAt?'access_expired':null;
 return async(request,remoteAddress='shared')=>{
  const u=new URL(request.url);
  const session=request.headers.get('cookie')?.match(/(?:^|;\s*)compass_session=([0-9a-f-]{36})(?:;|$)/)?.[1]||randomUUID();
  const sessionCookie=`compass_session=${session}; Path=/; HttpOnly; SameSite=Strict; Max-Age=900${u.protocol==='https:'?'; Secure':''}`;
  if(request.method==='GET'&&u.pathname==='/api/status'){const response=json({configured:!!env.QLOO_API_KEY,generatorConfigured:false,runtime:'@qloo/qloo-harness@0.1.26',accessMode,budgetScope:accessMode==='pilot'?'process':'operation',processStartedAt,providerAllowanceKnown:false,liveExecutionAllowed:pauseReason()===null,livePauseReason:pauseReason(),providerRetryAt:providerRetryAt>now()?new Date(providerRetryAt).toISOString():null,accessExpiresAt:expiresAt===null?null:new Date(expiresAt).toISOString(),maxDispatchCredits,maxConcurrentSubmissions:concurrencyLimit,activeSubmissions:active,maxWorkflowsPerSubmission:2,maxNetworkDispatchesPerSubmission:7,dispatchCreditsRemaining:maxDispatchCredits===null?null:Math.max(0,maxDispatchCredits-reservedDispatches),liveRunsRemaining:maxLiveRuns===null?null:Math.max(0,maxLiveRuns-liveRuns)});response.headers.set('set-cookie',sessionCookie);return response;}
  if(u.pathname==='/api/recommend'){
   if(request.method!=='POST')return json({code:'method_not_allowed'},405);
   if(!env.APP_ORIGIN)return json({code:'origin_not_configured',message:'The server owner needs to configure the public app origin.',cards:[]},503);
   if(request.headers.get('origin')!==env.APP_ORIGIN||u.origin!==env.APP_ORIGIN)return json({code:'origin',message:'Submit from the configured app page.',cards:[]},403);
   if(!request.headers.get('content-type')?.startsWith('application/json'))return json({code:'input'},400);
   let body;try{const reader=request.body?.getReader();let text='',bytes=0;const decoder=new TextDecoder();if(!reader)throw Error();while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.length;if(bytes>4096){await reader.cancel();throw Error();}text+=decoder.decode(value,{stream:true});}text+=decoder.decode();body=JSON.parse(text);}catch{return json({code:'input',message:'The brief is invalid or too large.',cards:[]},400);}
   if(!validBrief(body))return json({code:'input',message:'Enter a valid public city and favorite. No pilot credits were reserved.',cards:[]},400);
   let rankContext;if(body?.action==='rank'){try{rankContext=candidateSets.resolve(body,session);}catch(e){return json({code:'candidate_set',message:e.message,cards:[],workflowState:'needs_input'},422);}}
   if(body?.action==='catalogue'){try{rankContext=catalogueSessions.resolve(body,session);}catch(e){return json({code:'catalogue_not_ready',message:e.message,cards:[],workflowState:'needs_input'},422);}}
   let choiceContext;if(body.action==='confirm-catalogue'){try{choiceContext=catalogueSessions.resolveChoice(body,session);}catch(e){return json({code:'catalogue_choice_invalid',message:e.message,cards:[]},422);}}
   if(body.action==='resolve-catalogue'&&body.destination.trim().toLowerCase()!=='mesa')return json({code:'catalogue_region',message:'Local resolution supports Mesa only. No pilot credits reserved.',cards:[]},422);
   const reservation=body.action==='confirm-catalogue'?1:['rank','catalogue'].includes(body?.action)?7:4;
   const live=body?.mode==='qloo'&&!!env.QLOO_API_KEY;
   if(live){
    const time=now();for(const map of [rate,socketRate])for(const [k,v]of map)if(time-v.start>=60000)map.delete(k);
    // Only socket address; caller-controlled forwarding headers are not trusted.
    const socketId=createHash('sha256').update(remoteAddress).digest('hex'),id=socketId+':'+session;let bucket=rate.get(id),socketBucket=socketRate.get(socketId);
    if(!socketBucket){if(socketRate.size>=1024)return json({code:'busy',message:'Try later.',cards:[]},429);socketBucket={start:time,count:0};socketRate.set(socketId,socketBucket);}
    if(!bucket){if(rate.size>=1024)return json({code:'busy',message:'Try later.',cards:[]},429);bucket={start:time,count:0};rate.set(id,bucket);}
    if(active>=concurrencyLimit)return json({code:'busy',retryable:true,message:'Another live request is running on this free demo. Wait for it to finish, then click this action again. No provider call or reservation was made for this attempt.',cards:[]},429);
    if(pauseReason()||bucket.count>=4||socketBucket.count>=60||(maxLiveRuns!==null&&liveRuns>=maxLiveRuns)||(maxDispatchCredits!==null&&reservedDispatches+reservation>maxDispatchCredits))return json({code:'budget',message:pauseReason()==='provider_auth'?'Qloo authentication is unavailable. The owner needs to check the existing credential.':pauseReason()==='provider_rate_limited'?'Qloo requested a pause. Wait at least a minute before an explicit new attempt; no automatic retry will run.':pauseReason()==='access_expired'?'The configured live-access window has ended.':pauseReason()==='termination_uncertain'?'Live execution is paused because a prior process could not be confirmed stopped.':'The request rate, concurrency or configured pilot limit has been reached. Wait a minute before an explicit new attempt; no workflow was started.',cards:[]},429);
    bucket.count++;socketBucket.count++;liveRuns++;reservedDispatches+=reservation;active++;
   }
   try{let generation;if(body.action==='resolve-catalogue')generation=catalogueSessions.clearChoices(session);if(body.action==='confirm-catalogue')choiceContext=catalogueSessions.takeChoice(body,session);const result=await (body.action==='resolve-catalogue'?catalogueResolver:body.action==='confirm-catalogue'?catalogueConfirmer:workflow)(body,{key:env.QLOO_API_KEY,signal:request.signal,rankContext,choiceContext});if(result.body.code==='provider_auth')providerAuthPaused=true;if(result.body.code==='provider_rate_limited')providerRetryAt=Math.max(providerRetryAt,now()+Math.max(60000,Number.isSafeInteger(result.body.retryAfterMs)&&result.body.retryAfterMs<=8e15?result.body.retryAfterMs:60000));if(result.body.code==='process_termination_unknown')terminationUncertain=true;if((body.action==='resolve-catalogue'&&!catalogueSessions.isCurrent(session,generation))||(body.action==='confirm-catalogue'&&!catalogueSessions.isCurrent(session,choiceContext.generation))){delete result.body.privateCatalogueChoice;delete result.body.privateCatalogueContext;result.body.code='catalogue_superseded';result.body.message='A newer local resolution replaced this request. No new usable pool was created.';result.body.cards=[];result.status=409;}let choiceToken;if(result.body.privateCatalogueChoice){const context=result.body.privateCatalogueChoice;const entry=catalogue.find(c=>c.id===context.entryId);choiceToken=catalogueSessions.rememberChoice(context,session,generation);delete result.body.privateCatalogueChoice;result.body.catalogueChoice={token:choiceToken,name:entry.name,address:entry.address,note:'One returned candidate matches these catalogue facts. Explicit confirmation verifies its ID with at most one additional dispatch; no rank runs automatically.'};}let catalogueSetId;if(result.body.privateCatalogueContext){catalogueSetId=catalogueSessions.remember(result.body.privateCatalogueContext,session);delete result.body.privateCatalogueContext;result.body.catalogueSetId=catalogueSetId;}const setId=candidateSets.remember(result.body,session);if(setId)result.body.candidateSetId=setId;result.body.pilotBudget={reservedForSubmission:live?reservation:0,reservedThisProcess:reservedDispatches,totalCeiling:maxDispatchCredits,remaining:maxDispatchCredits===null?null:maxDispatchCredits-reservedDispatches,accessMode,note:'Conservative upper-bound reservations, not a report of actual provider dispatches. Failed/cancelled runs are not refunded.'};if(result.body.code==='process_termination_unknown')terminationUncertain=true;const response=json(result.body,result.status);response.headers.set('set-cookie',sessionCookie);return response;}catch{return json({code:'internal_error',message:'The request could not finish safely.',cards:[]},500);}finally{if(live)active--;}
  }
  if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405,headers:security});
  const path=u.pathname==='/'?'/index.html':u.pathname==='/fixture/'?'/fixture/index.html':u.pathname;
  if(!assets.has(path))return new Response('Not found',{status:404,headers:security});
  const type=path.endsWith('.html')?'text/html; charset=utf-8':path.endsWith('.css')?'text/css; charset=utf-8':'text/javascript; charset=utf-8';
  return new Response(request.method==='HEAD'?null:assets.get(path),{headers:{...security,'content-type':type}});
 };
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const app=createApp();const server=http.createServer(async(req,res)=>{const abort=new AbortController();const onDisconnect=()=>{if(!res.writableEnded)abort.abort();};req.once('aborted',onDisconnect);res.once('close',onDisconnect);try{
  const origin=process.env.APP_ORIGIN||'http://localhost:'+String(process.env.PORT||3000);
  const request=new Request(new URL(req.url,origin),{method:req.method,headers:req.headers,signal:abort.signal,...(!['GET','HEAD'].includes(req.method)?{body:req,duplex:'half'}:{})});
  const result=await app(request,req.socket.remoteAddress||'shared');res.writeHead(result.status,Object.fromEntries(result.headers));res.end(Buffer.from(await result.arrayBuffer()));
 }catch{res.writeHead(500,{'content-type':'text/plain'});res.end('Request failed');}finally{req.removeListener('aborted',onDisconnect);res.removeListener('close',onDisconnect);}});
 server.requestTimeout=15000;server.headersTimeout=10000;server.listen(Number(process.env.PORT||3000),'0.0.0.0',()=>console.log('Compass server ready. Official harness0.1.26; no workflow runs until explicit submission.'));
}
