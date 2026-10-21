import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {canStartLive} from '../public/capacity.mjs';
import {applyDomainScope} from '../public/domain.mjs';
import {createRefinement} from '../public/refine.mjs';
import {catalogue} from '../public/catalogue.mjs';

// Minimal DOM fixture runs the actual application handlers without a browser or network.
async function mount(response) {
 const elements=new Map();let activeElement=null;const calls=[];
 class Element {
  constructor(tag){this.tagName=tag;this.children=[];this.listeners={};this.attributes={};this.value='';this.checked=false;this.hidden=false;this._text='';}
  set textContent(v){this._text=String(v);this.children=[];}
  get textContent(){return this._text+this.children.map(c=>c.textContent).join(' ');}
  append(...children){this.children.push(...children);}
  replaceChildren(...children){this._text='';this.children=children;}
  setAttribute(k,v){this.attributes[k]=v;}
  addEventListener(k,fn){this.listeners[k]=fn;}
  focus(){activeElement=this;}
 }
 for(const id of ['workflow','results','payload','status','badge','run','rerank','choices','seed','destination','favorite','type','verified','mode','heritage','form','readiness','scope-summary','mode-summary','discovery-options','resolve-local','rank-local'])elements.set(id,new Element('div'));
 elements.get('destination').value='Mesa';elements.get('favorite').value='Arrival';elements.get('type').value='movie';elements.get('mode').value='qloo';elements.get('choices').hidden=true;
 const panel=new Element('section');
 const document={getElementById:id=>elements.get(id),createElement:tag=>new Element(tag),querySelector:()=>panel,get activeElement(){return activeElement;}};
 const fetch=async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>url==='/api/status'?{configured:true,dispatchCreditsRemaining:12,liveRunsRemaining:3}:structuredClone(typeof response==='function'?response(options):response)};};
 const source=(await readFile(new URL('../public/app.mjs',import.meta.url),'utf8')).replace(/^import .*;\n/gm,'');
 vm.runInNewContext(source,{document,fetch,canStartLive,applyDomainScope,createRefinement,AbortController,setTimeout,clearTimeout,console});
 await new Promise(resolve=>setImmediate(resolve));
 const all=()=>{const out=[];const walk=e=>{out.push(e);e.children.forEach(walk);};walk(elements.get('results'));return out;};
 return {elements,calls,document,all,submit:(id='run')=>elements.get('form').listeners.submit({preventDefault(){},submitter:{id}}),change:(id,value)=>{elements.get(id).value=value;elements.get(id).listeners.input();},click:label=>{const e=all().find(e=>e.tagName==='button'&&e.textContent===label);assert.ok(e,`button ${label}`);return e.listeners.click();}};
}
const result={mode:'qloo',code:'results',operation:'recommend',workflowState:'ok',brief:{destination:'Mesa',favorite:'Arrival',type:'movie'},seed:{name:'Arrival (2016)',entityId:'seed'},candidateSetId:'opaque',cards:[{entityId:'place',name:'Fixture Museum',address:'Mesa',affinity:0.7,resultPosition:2,explanation:'Compass query summary',mapping:'direct Qloo place entity',access:'unknown'}]};

test('discovery context uses completed resolved seed and keeps affinity and access visible',async()=>{
 const ui=await mount(result);await ui.submit();const text=ui.elements.get('results').textContent;
 assert.match(text,/Arrival \(2016\) · Mesa/);assert.match(text,/Arrival \(2016\)/);assert.match(text,/Compass query context/);assert.match(text,/Qloo affinity: 0.7 · not a probability/);assert.match(text,/Access: unknown/);
 const details=ui.all().find(e=>e.tagName==='details'&&e.textContent.includes('Place evidence'));assert.ok(details);assert.match(details.textContent,/Qloo entity: place/);
});
test('shortlist next step stays local, preserves focus and provider position',async()=>{
 const ui=await mount(result);await ui.submit();const before=ui.calls.length;ui.click('Shortlist this place');
 assert.match(ui.elements.get('results').textContent,/Check the venue/);assert.equal(ui.document.activeElement.textContent,'Remove from shortlist');assert.equal(ui.calls.length,before);assert.equal(ui.all().find(e=>e.className==='number').textContent,'2');
 ui.click('Hide locally · no taste signal');assert.equal(ui.document.activeElement.textContent,'Restore locally');ui.click('Restore locally');assert.equal(ui.document.activeElement.textContent,'Shortlist this place');assert.equal(ui.calls.length,before);
});
test('editing brief clears personalized summary without losing retained rerank capability',async()=>{
 const ui=await mount(result);await ui.submit();ui.change('favorite','Dune');assert.equal(ui.elements.get('results').textContent,'');assert.equal(ui.elements.get('rerank').disabled,false);assert.equal(ui.calls.filter(c=>c.url==='/api/recommend').length,1);
});
test('empty and failed responses do not present personalized cards or invented signals',async()=>{
 for(const response of [{code:'controlled_failure',cards:[]},{...result,cards:[]}]){const ui=await mount(response);await ui.submit();assert.doesNotMatch(ui.elements.get('results').textContent,/Your discovery signal|Suggested next step/);}
});
test('scope exclusion cannot become a suggested discovery card',async()=>{
 const ui=await mount(result);ui.elements.get('heritage').checked=true;await ui.submit();assert.equal(ui.all().filter(e=>e.className==='card').length,0);assert.match(ui.elements.get('results').textContent,/No places visible/);assert.doesNotMatch(ui.elements.get('results').textContent,/Suggested next step/);
});
test('provider strings are inserted as text and local navigation is a stable anchor',async()=>{
 const ui=await mount({...result,seed:{name:'<img src=x onerror=alert(1)>'}});await ui.submit();assert.match(ui.elements.get('results').textContent,/<img src=x/);assert.equal(ui.all().filter(e=>e.tagName==='img').length,0);assert.equal(ui.all().find(e=>e.tagName==='a'&&e.textContent==='Edit your brief').href,'#favorite');
});
test('destination and category edits clear seed choices and stale summary; only category preserves rerank',async()=>{
 for(const [id,value,canRank] of [['destination','Phoenix',false],['type','book',true]]){
  const ui=await mount(result);await ui.submit();ui.elements.get('choices').hidden=false;ui.elements.get('seed').append({textContent:'Old seed'});
  ui.change(id,value);assert.equal(ui.elements.get('results').textContent,'');assert.equal(ui.elements.get('seed').children.length,0);assert.equal(ui.elements.get('choices').hidden,true);assert.equal(ui.elements.get('rerank').disabled,!canRank);
 }
});
test('rank context uses prior discovery geography without claiming a new location check',async()=>{
 const ui=await mount({...result,operation:'rank'});await ui.submit();assert.match(ui.elements.get('results').textContent,/Qloo reranked retained places; location comes from earlier discovery around Mesa/);
});
test('restoring a place excluded by scope returns focus to the scope control',async()=>{
 const ui=await mount(result);await ui.submit();ui.click('Hide locally · no taste signal');ui.elements.get('heritage').checked=true;ui.elements.get('heritage').listeners.change();ui.click('Restore locally');assert.equal(ui.document.activeElement,ui.elements.get('heritage'));assert.equal(ui.elements.get('discovery-options').open,true);assert.equal(ui.all().filter(e=>e.className==='card').length,0);
});

test('visible option summaries track scope and no-call modes',async()=>{
 const ui=await mount(result);ui.elements.get('heritage').checked=true;ui.elements.get('heritage').listeners.change();assert.match(ui.elements.get('scope-summary').textContent,/scope is on/);
 ui.elements.get('heritage').checked=false;ui.elements.get('heritage').listeners.change();assert.match(ui.elements.get('scope-summary').textContent,/Broad provider results/);
 for(const [mode,copy] of [['test-failure',/No provider call/],['without-qloo',/no generator/],['qloo',/Qloo taste-led discovery selected/]]){ui.elements.get('mode').value=mode;ui.elements.get('mode').listeners.change();assert.match(ui.elements.get('mode-summary').textContent,copy);}
 assert.equal(ui.calls.filter(c=>c.url==='/api/recommend').length,0);
});
test('local shortlist requires explicit resolution then explicit ranking, with no automatic provider calls',async()=>{
 const ui=await mount(options=>JSON.parse(options.body).action==='resolve-catalogue'?{code:'catalogue_resolved',message:'Two matched',resolvedPlaceCount:2,catalogueSetId:'opaque-local',cards:[]}:result);
 assert.equal(ui.elements.get('rank-local').disabled,true);assert.equal(ui.calls.filter(c=>c.url==='/api/recommend').length,0);
 await ui.submit('resolve-local');assert.equal(ui.elements.get('rank-local').disabled,false);assert.equal(ui.calls.filter(c=>c.url==='/api/recommend').length,1);assert.equal(ui.all().filter(e=>e.className==='card').length,0);
 ui.change('favorite','Another film');assert.equal(ui.elements.get('rank-local').disabled,false);await ui.submit('rank-local');const requests=ui.calls.filter(c=>c.url==='/api/recommend').map(c=>JSON.parse(c.options.body));assert.equal(requests[1].action,'catalogue');assert.equal(requests[1].catalogueSetId,'opaque-local');assert.equal(requests[1].candidateIds,undefined);
 ui.change('destination','Paris');assert.equal(ui.elements.get('rank-local').disabled,true);assert.equal(ui.elements.get('resolve-local').disabled,true);
});
test('failed or single-place resolution never enables personalized local ranking',async()=>{
 for(const response of [{code:'catalogue_unresolved',cards:[]},{code:'catalogue_resolved',resolvedPlaceCount:1,catalogueSetId:'single',cards:[]}]){const ui=await mount(response);await ui.submit('resolve-local');assert.equal(ui.elements.get('rank-local').disabled,true);assert.equal(ui.all().filter(e=>e.className==='card').length,0);}
});
test('resolved local identities show ready state, and an expired context disables rank',async()=>{let step=0;const ui=await mount(()=>++step===1?{code:'catalogue_resolved',message:'Two matched',resolvedPlaceCount:2,catalogueSetId:'opaque',cards:[]}:{code:'catalogue_not_ready',message:'Expired',cards:[]});await ui.submit('resolve-local');assert.match(ui.elements.get('workflow').textContent,/MATCHED → RANK/);assert.match(ui.elements.get('badge').textContent,/READY TO RANK/);await ui.submit('rank-local');assert.equal(ui.elements.get('rank-local').disabled,true);});
test('zero or one visible catalogue-ranked results disclose that a choice is not demonstrated',async()=>{const entry=catalogue.find(c=>c.id==='real-06');const card={...result.cards[0],entityId:'11111111-1111-4111-8111-111111111111',name:entry.name,address:entry.address};for(const cards of [[],[card]]){const ui=await mount({...result,cards,candidatePool:{note:'Fixed shortlist; access unknown'},reviewedMappings:[{entityId:card.entityId,catalogueId:entry.id}]});await ui.submit();assert.equal(ui.elements.get('heritage').checked,true);assert.equal(ui.all().filter(e=>e.className==='card').length,cards.length);assert.match(ui.elements.get('results').textContent,/does not demonstrate a personalized choice/);}});
test('production broad discovery defaults to explicit unscoped results, not an always-empty reviewed gate',async()=>{const html=await readFile(new URL('../public/index.html',import.meta.url),'utf8');assert.match(html,/<input id="heritage" type="checkbox">/);assert.match(html,/Broad provider results selected/);const ui=await mount(result);await ui.submit();assert.equal(ui.all().filter(e=>e.className==='card').length,1);assert.match(ui.elements.get('results').textContent,/may be residential/);});
