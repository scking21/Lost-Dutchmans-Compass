import test from 'node:test';import assert from 'node:assert/strict';import {fileURLToPath} from 'node:url';import {runHarness,executeProcess} from '../server/harness.mjs';import {recommend} from '../server/workflow.mjs';
const fixture=fileURLToPath(new URL('./fixture-fetch.mjs',import.meta.url));
const run=(operation,input)=>runHarness(operation,input,{key:'OFFLINE-TEST-NOT-A-CREDENTIAL',execute:(command,args,opts)=>executeProcess(command,['--import',fixture,...args],opts)});
test('actual pinned official exec describe and recommend run offline through provider fixtures',async()=>{const result=await recommend({destination:'Mesa',favorite:'Arrival',type:'movie',mode:'qloo',verifiedOnly:false},{key:'OFFLINE',run});assert.equal(result.status,200,JSON.stringify(result));assert.equal(result.body.cards[0].name,'Mock Museum');assert.equal(result.body.audit.workflowExecutions,2);assert.equal(result.body.audit.networkDispatches,4);assert.equal(result.body.workflowState,'ok');assert.equal(result.body.audit.requests[0].operation,'describe');assert.equal(result.body.audit.requests[1].operation,'recommend');assert.equal(result.body.providerExplanation.status,'returned');assert.equal(result.body.providerExplanation.value.signal,'Fixture query-level detail');});
test('actual official ambiguity stops before recommendation and offers real fixture IDs',async()=>{const result=await recommend({destination:'Mesa',favorite:'Ambiguous',type:'movie',mode:'qloo',verifiedOnly:false},{key:'OFFLINE',run});assert.equal(result.status,422);assert.equal(result.body.workflowState,'needs_input');assert.equal(result.body.choices.length,2);assert.equal(result.body.audit.workflowExecutions,1);assert.equal(result.body.audit.networkDispatches,1);});
test('actual official unresolved favorite remains needs_input without fabricated result',async()=>{const result=await recommend({destination:'Mesa',favorite:'Unknown',type:'movie',mode:'qloo',verifiedOnly:false},{key:'OFFLINE',run});assert.equal(result.status,422);assert.equal(result.body.cards.length,0);assert.equal(result.body.audit.workflowExecutions,1);});
test('actual official rank resolves three retained place IDs and new signal in seven bounded dispatches',async()=>{
 const ids=['2','3','4'].map(n=>`${n.repeat(8)}-${n.repeat(4)}-4${n.repeat(3)}-8${n.repeat(3)}-${n.repeat(12)}`);
 const rankContext={requestId:'previous',cards:ids.map((entityId,i)=>({entityId,resultPosition:i+1}))};
 const r=await recommend({destination:'Mesa',favorite:'Arrival',type:'movie',mode:'qloo',verifiedOnly:false,action:'rank'},{key:'OFFLINE',run,rankContext});
 assert.equal(r.status,200,JSON.stringify(r));assert.equal(r.body.audit.networkDispatches,7);assert.equal(r.body.operation,'rank');assert.deepEqual(r.body.cards.map(c=>c.entityId),ids.toReversed());assert.equal(r.body.rankComparison.positions[0].previousPosition,3);assert.equal(r.body.providerExplanation.scope,'query-level');
});
test('actual official types-array compaction preserves describe identity via interpretation and constrained place discovery',async()=>{
 const typesFixture=fileURLToPath(new URL('./fixture-types-fetch.mjs',import.meta.url));
 const runTypes=(operation,input)=>runHarness(operation,input,{key:'OFFLINE-TEST-NOT-A-CREDENTIAL',execute:(command,args,opts)=>executeProcess(command,['--import',typesFixture,...args],opts)});
 const described=await runTypes('describe',{entity:'Arrival',type:'movie'});assert.equal(described.data.results[0].type,undefined);assert.equal(described.data.results[0].subtype,undefined);assert.equal(described.data.interpretation.entity.type,'urn:entity:movie');assert.equal(described.data.interpretation.entity.entityId,described.data.results[0].entity_id);
 const r=await recommend({destination:'Mesa',favorite:'Arrival',type:'movie',mode:'qloo',verifiedOnly:false},{key:'OFFLINE',run:runTypes});assert.equal(r.status,200,JSON.stringify(r));assert.equal(r.body.cards.length,1);assert.equal(r.body.audit.networkDispatches,4);assert.equal(r.body.cards[0].typeEvidence,'official workflow target constraint; entity type omitted by harness');
 const rankContext={requestId:r.body.requestId,cards:r.body.cards};const ranked=await recommend({destination:'Mesa',favorite:'Arrival',type:'movie',mode:'qloo',verifiedOnly:false,action:'rank'},{key:'OFFLINE',run:runTypes,rankContext});assert.equal(ranked.status,200,JSON.stringify(ranked));assert.equal(ranked.body.cards[0].entityId,r.body.cards[0].entityId);assert.equal(ranked.body.audit.networkDispatches,5);
});
test('actual official describe resolves two fixed catalogue identities with types-only fixtures in four dispatches',async()=>{
 const {resolveCatalogue}=await import('../server/catalogue-pool.mjs');
 const catalogueFixture=fileURLToPath(new URL('./fixture-catalogue-fetch.mjs',import.meta.url));
 const runCatalogue=(operation,input)=>runHarness(operation,input,{key:'OFFLINE-TEST-NOT-A-CREDENTIAL',execute:(command,args,opts)=>executeProcess(command,['--import',catalogueFixture,...args],opts)});
 const out=await resolveCatalogue({destination:'Mesa'},{key:'OFFLINE',run:runCatalogue});
 assert.equal(out.status,200,JSON.stringify(out));assert.equal(out.body.audit.workflowExecutions,2);assert.equal(out.body.audit.networkDispatches,4);assert.equal(out.body.privateCatalogueContext.cards.length,2);assert.equal(out.body.privateCatalogueContext.cards[0].access,'unknown');assert.equal(out.body.cards.length,0);
});
test('actual official ambiguity exposes exact candidate evidence; explicit UUID confirmation rechecks selected outcome in one guarded dispatch',async()=>{
 const {resolveCatalogue,confirmCatalogue,resolutionDiagnostic}=await import('../server/catalogue-pool.mjs');
 const ambiguityFixture=fileURLToPath(new URL('./fixture-catalogue-ambiguity-fetch.mjs',import.meta.url));
 const run=(operation,input,options={})=>runHarness(operation,input,{...options,key:'OFFLINE-TEST-NOT-A-CREDENTIAL',execute:(command,args,opts)=>executeProcess(command,['--import',ambiguityFixture,...args],opts)});
 const out=await resolveCatalogue({destination:'Mesa'},{key:'OFFLINE',run});assert.equal(out.body.code,'catalogue_choice',JSON.stringify(out));assert.equal(out.body.audit.networkDispatches,3);assert.equal(out.body.resolutionProgress.workflowStatus,'needs_input');assert.equal(out.body.resolutionProgress.issueKind,'ambiguous');assert.equal(out.body.resolutionProgress.candidateCount,2);assert.equal(out.body.privateCatalogueContext,undefined);
 const confirmed=await confirmCatalogue({destination:'Mesa'},{key:'OFFLINE',run,choiceContext:out.body.privateCatalogueChoice});assert.equal(confirmed.body.code,'catalogue_resolved',JSON.stringify(confirmed));assert.equal(confirmed.body.audit.networkDispatches,1);assert.equal(confirmed.body.privateCatalogueContext.cards.length,2);
 const absent=await run('describe',{entity:'Synthetic missing place',type:'place'});assert.equal(absent.dispatches,1);assert.equal(resolutionDiagnostic(absent.data,{name:'Synthetic missing place'}).reason,'no_match');
});

test('actual pinned CLI provider 429 interrupts its backoff and preserves Retry-After',async()=>{
 const fixture=fileURLToPath(new URL('./fixture-provider-rate-limit-fetch.mjs',import.meta.url));
 const start=Date.now();
 await assert.rejects(()=>runHarness('describe',{entity:'Arrival',type:'movie'},{key:'OFFLINE',execute:(command,args,opts)=>executeProcess(command,['--import',fixture,...args],opts)}),e=>e.code==='provider_rate_limited'&&e.retryAfterMs===3600000);
 assert.ok(Date.now()-start<10000,'Provider pause must interrupt the pinned CLI backoff before the 22-second process timeout');
});
