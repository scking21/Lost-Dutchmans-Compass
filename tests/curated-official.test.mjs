import test from 'node:test';import assert from 'node:assert/strict';import {fileURLToPath} from 'node:url';
import {createCuratedService} from '../server/curated-service.mjs';import {runHarness,executeProcess} from '../server/harness.mjs';
const fixture=fileURLToPath(new URL('./fixture-curated-fetch.mjs',import.meta.url));
const run=(op,input,opts)=>runHarness(op,input,{...opts,execute:(command,args,options)=>executeProcess(command,['--import',fixture,...args],options)});
test('installed pinned CLI completes four individually confirmed options and two tastes then all seven bounded rank dispatches offline',async()=>{
 const service=createCuratedService({run}),base={destination:'Mesa',favorite:'Fixture Film',type:'movie',mode:'qloo',verifiedOnly:false};
 const request=async extra=>{const b={...base,...extra};return service.execute(b,{key:'OFFLINE-FIXTURE',owner:'fixture-owner',context:service.preflight(b,'fixture-owner')});};
 async function confirm(extra){const choice=await request(extra);assert.equal(choice.body.code,'curated_choice',JSON.stringify(choice));assert.equal(choice.body.audit.networkDispatches,2);const done=await request({action:'curated-confirm',choiceToken:choice.body.choiceToken,choiceIndex:0});assert.equal(done.body.code,'curated_confirmed',JSON.stringify(done));assert.equal(done.body.audit.networkDispatches,1);return done.body.identityToken;}
 const placeTokens=[];for(const catalogueId of ['real-03','real-06','real-07','real-08'])placeTokens.push(await confirm({action:'curated-place',catalogueId}));
 const tasteTokens=[await confirm({action:'curated-signal'}),await confirm({action:'curated-signal',favorite:'Fixture Artist',type:'artist'})];
 const result=await request({action:'curated-rank',placeTokens,tasteTokens});assert.equal(result.body.code,'curated_results',JSON.stringify(result));assert.equal(result.body.cards.length,4);assert.equal(result.body.audit.workflowExecutions,1);assert.equal(result.body.audit.networkDispatches,7);assert.deepEqual(result.body.returnedCatalogueIds,['real-08','real-07','real-06','real-03']);assert.equal(result.body.cards[0].providerExplanation.fixture,'Actual returned per-row fixture detail');
});
