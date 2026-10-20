import http from 'node:http';import {readFile,readdir} from 'node:fs/promises';import {fileURLToPath,pathToFileURL} from 'node:url';import {createHash} from 'node:crypto';import {recommend} from './workflow.mjs';
const publicRoot=new URL('../public/',import.meta.url),assets=new Map();
async function load(path=''){for(const f of await readdir(new URL(path,publicRoot),{withFileTypes:true})){const name=path+f.name;if(f.isDirectory())await load(name+'/');else assets.set('/'+name,await readFile(new URL(name,publicRoot)));}}
await load();
const security={'cache-control':'no-store','x-content-type-options':'nosniff','referrer-policy':'no-referrer','content-security-policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'"};
const json=(data,status=200)=>Response.json(data,{status,headers:security});
export function createApp({env=process.env,workflow=recommend,now=()=>Date.now()}={}){
 let active=0,liveRuns=0,terminationUncertain=false;const rate=new Map();const maxLiveRuns=Number(env.MAX_LIVE_RUNS||3);
 if(!Number.isInteger(maxLiveRuns)||maxLiveRuns<1||maxLiveRuns>1000)throw Error('Invalid MAX_LIVE_RUNS');
 return async(request,remoteAddress='shared')=>{
  const u=new URL(request.url);
  if(request.method==='GET'&&u.pathname==='/api/status')return json({configured:!!env.QLOO_API_KEY,generatorConfigured:false,runtime:'@qloo/qloo-harness@0.1.26',maxWorkflowsPerSubmission:2,maxNetworkDispatchesPerSubmission:4,liveRunsRemaining:Math.max(0,maxLiveRuns-liveRuns)});
  if(u.pathname==='/api/recommend'){
   if(request.method!=='POST')return json({code:'method_not_allowed'},405);
   if(!env.APP_ORIGIN)return json({code:'origin_not_configured',message:'The server owner needs to configure the public app origin.',cards:[]},503);
   if(request.headers.get('origin')!==env.APP_ORIGIN||u.origin!==env.APP_ORIGIN)return json({code:'origin',message:'Submit from the configured app page.',cards:[]},403);
   if(!request.headers.get('content-type')?.startsWith('application/json'))return json({code:'input'},400);
   let body;try{const reader=request.body?.getReader();let text='',bytes=0;const decoder=new TextDecoder();if(!reader)throw Error();while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.length;if(bytes>4096){await reader.cancel();throw Error();}text+=decoder.decode(value,{stream:true});}text+=decoder.decode();body=JSON.parse(text);}catch{return json({code:'input',message:'The brief is invalid or too large.',cards:[]},400);}
   const live=body?.mode==='qloo'&&!!env.QLOO_API_KEY;
   if(live){
    const time=now();for(const [k,v]of rate)if(time-v.start>=60000)rate.delete(k);
    // Only socket address; caller-controlled forwarding headers are not trusted.
    const id=createHash('sha256').update(remoteAddress).digest('hex');let bucket=rate.get(id);
    if(!bucket){if(rate.size>=1024)return json({code:'busy',message:'Try later.',cards:[]},429);bucket={start:time,count:0};rate.set(id,bucket);}
    if(terminationUncertain||bucket.count>=4||active>=2||liveRuns>=maxLiveRuns)return json({code:'budget',message:'The pilot request budget or concurrency limit has been reached. No harness workflow was started.',cards:[]},429);
    bucket.count++;liveRuns++;active++;
   }
   try{const result=await workflow(body,{key:env.QLOO_API_KEY,signal:request.signal});if(result.body.code==='process_termination_unknown')terminationUncertain=true;return json(result.body,result.status);}catch{return json({code:'internal_error',message:'The request could not finish safely.',cards:[]},500);}finally{if(live)active--;}
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
