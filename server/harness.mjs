import {spawn} from 'node:child_process';
import {mkdtemp,mkdir,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=dirname(dirname(fileURLToPath(import.meta.url)));
export const HARNESS_VERSION='0.1.26';
export class HarnessError extends Error{constructor(code){super(code);this.code=code;}}
export function executeProcess(command,args,{env,cwd,input,signal,spawnImpl=spawn,timeoutMs=22000,maxBytes=1_000_000,terminationWaitMs=2000}={}){
 return new Promise((resolve,reject)=>{
  if(signal?.aborted){reject(new HarnessError('cancelled'));return;}
  let child,out=[],err=[],size=0,settled=false,timer,terminationTimer,terminationError;
  const finish=(error,value)=>{if(settled)return;settled=true;clearTimeout(timer);clearTimeout(terminationTimer);signal?.removeEventListener('abort',onAbort);if(error)reject(error);else resolve(value);};
  const terminate=error=>{if(settled||terminationError)return;terminationError=error;clearTimeout(timer);child.kill('SIGKILL');if(!settled)terminationTimer=setTimeout(()=>finish(new HarnessError('process_termination_unknown')),terminationWaitMs);};
  const onAbort=()=>terminate(new HarnessError('cancelled'));
  try{child=spawnImpl(command,args,{env,cwd,shell:false,stdio:['pipe','pipe','pipe']});}catch{finish(new HarnessError('process_start'));return;}
  timer=setTimeout(()=>terminate(new HarnessError('process_timeout')),timeoutMs);
  signal?.addEventListener('abort',onAbort,{once:true});
  for(const [stream,target] of [[child.stdout,out],[child.stderr,err]])stream.on('data',chunk=>{if(terminationError||settled)return;size+=Buffer.byteLength(chunk);if(size>maxBytes){terminate(new HarnessError('process_output_limit'));return;}target.push(Buffer.from(chunk));});
  child.on('error',()=>{if(terminationError)return;if(child.pid)terminate(new HarnessError('process_start'));else finish(new HarnessError('process_start'));});
  child.on('close',code=>finish(terminationError,{code,stdout:Buffer.concat(out).toString(),stderr:Buffer.concat(err).toString()}));
  child.stdin.on('error',()=>{});if(signal?.aborted)onAbort();else child.stdin.end(input);
 });
}
export async function runHarness(operation,input,{key,signal,execute=executeProcess,dispatchBudget}={}){
 if(dispatchBudget!==undefined&&(dispatchBudget!==1||operation!=='describe'||typeof input?.entity!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.entity)))throw new HarnessError('budget_override_denied');
 if(!['describe','recommend','rank'].includes(operation))throw new HarnessError('operation_denied');
 if(typeof key!=='string'||!key)throw new HarnessError('not_configured');
 if(signal?.aborted)throw new HarnessError('cancelled');
 let preserveTemp=false;
 const temp=await mkdtemp(join(tmpdir(),'compass-harness-'));await mkdir(join(temp,'home'));await mkdir(join(temp,'work'));
 try{
  const env={PATH:process.env.PATH||'/usr/bin:/bin',HOME:join(temp,'home'),QLOO_HOME:join(temp,'state'),QLOO_API_KEY:key,QLOO_BASE_URL:'https://hackathon.api.qloo.com',QLOO_TRUSTED_BASE_URL:'https://hackathon.api.qloo.com',COMPASS_EGRESS_GUARD:'1',COMPASS_WORKFLOW_BUDGET:dispatchBudget===1?'1':operation==='rank'?'5':'2',NO_COLOR:'1'};
  const result=await execute(process.execPath,['--import',join(root,'server/egress-guard.mjs'),join(root,'node_modules/@qloo/qloo-harness/dist/bin.js'),'exec',operation],{env,cwd:join(temp,'work'),input:JSON.stringify(input),signal});
  let data;try{data=JSON.parse(result.stdout);}catch{throw new HarnessError('invalid_harness_output');}
  const matches=[...result.stderr.matchAll(/^COMPASS_EGRESS:([1-5])$/gm)];
  return {data,exitCode:result.code,dispatches:matches.length?Number(matches.at(-1)[1]):0};
 }catch(error){if(error.code==='process_termination_unknown')preserveTemp=true;throw error;}finally{if(!preserveTemp)await rm(temp,{recursive:true,force:true});}
}
