import test from 'node:test';import assert from 'node:assert/strict';import {mountCurated} from '../public/curated-ui.mjs';
async function mount(respond,clock={}){const elements=new Map(),calls=[];let focus;
 class E{constructor(tag){this.tagName=tag;this.children=[];this.listeners={};this.attributes={};this.value='';this.checked=false;this.hidden=false;this.textContent='';}append(...c){this.children.push(...c);}replaceChildren(...c){this.children=c;}addEventListener(k,f){this.listeners[k]=f;}setAttribute(k,v){this.attributes[k]=v;}focus(){focus=this;}}
 for(const id of ['form','place','type','favorite','confirm','add-place','add-taste','rank','none','clear','places','tastes','choice','choice-box','results','readiness','status','audit','expiry','interests','interest-guidance'])elements.set('curated-'+id,new E('div'));
 elements.get('curated-favorite').value='Fixture Film';elements.get('curated-type').value='movie';elements.get('curated-choice-box').hidden=true;
 const document={getElementById:id=>elements.get(id),createElement:tag=>new E(tag)};
 const fetch=async(url,options)=>{calls.push({url,options});return {json:async()=>url==='/api/status'?{configured:true,liveExecutionAllowed:true}:respond(JSON.parse(options.body))};};
 const mounted=mountCurated({document,fetch,setTimeout,clearTimeout,AbortController,...clock});await new Promise(r=>setImmediate(r));return {mounted,elements,calls,focus:()=>focus,click:async id=>{await elements.get('curated-'+id).listeners.click();await new Promise(r=>setImmediate(r));},provider:()=>calls.filter(c=>c.url==='/api/recommend')};
}
const choice={code:'curated_choice',choiceToken:'token',message:'Choose',choices:[{name:'Fixture Book A',type:'book'},{name:'Fixture Book B',type:'book'}]};
test('curated initial state sends only readiness and ambiguity never defaults or confirms automatically',async()=>{const ui=await mount(()=>choice);assert.equal(ui.provider().length,0);await ui.click('add-taste');assert.equal(ui.provider().length,1);const e=ui.elements.get('curated-choice');assert.equal(e.value,'');assert.equal(e.children[0].disabled,true);assert.equal(ui.elements.get('curated-confirm').disabled,true);await ui.click('confirm');assert.equal(ui.provider().length,1);await ui.click('none');assert.equal(ui.provider().length,1);assert.equal(ui.focus(),ui.elements.get('curated-favorite'));assert.equal(ui.elements.get('curated-choice-box').hidden,true);});
test('confirmed favorite toggles permit one/both counterfactual ranks without re-resolution or dropping fourth result',async()=>{const ui=await mount(b=>b.action==='curated-rank'?{code:'curated_results',message:'Ranked',confirmedTastes:[{name:'Fixture',type:'movie'}],candidateCount:4,explanationNote:'No invented explanation',cards:Array.from({length:4},(_,i)=>({catalogueId:['real-03','real-06','real-07','real-08'][i],name:'Place '+i,address:'Public address',resultPosition:i+1,affinity:.5,providerExplanation:null}))}:choice);ui.mounted.places.push(...Array.from({length:4},(_,i)=>({token:'p'+i,expiresAt:Date.now()+900000,identity:{name:'Place '+i,type:'place',catalogueId:'real-0'+(i+3)}})));ui.mounted.tastes.push({token:'t1',expiresAt:Date.now()+900000,identity:{name:'Film',type:'movie'},selected:true},{token:'t2',expiresAt:Date.now()+900000,identity:{name:'Artist',type:'artist'},selected:false});await ui.mounted.request('curated-rank',{placeTokens:ui.mounted.places.map(p=>p.token),tasteTokens:['t1']});assert.equal(ui.elements.get('curated-results').children.filter(c=>c.className==='card').length,4);const toggles=ui.elements.get('curated-tastes').children.map(row=>row.children.find(c=>c.tagName==='input'));toggles[0].checked=false;toggles[0].listeners.change();toggles[1].checked=true;toggles[1].listeners.change();await ui.click('rank');assert.deepEqual(JSON.parse(ui.provider().at(-1).options.body).tasteTokens,['t2']);assert.equal(ui.provider().length,2);const pick=ui.elements.get('curated-results').children.find(c=>c.className==='card').children.find(c=>c.tagName==='button');pick.listeners.click();assert.equal(ui.provider().length,2);assert.equal(pick.attributes['aria-pressed'],'true');});
test('busy confirmation preserves token and selected option for explicit retry, while editing invalidates offered choice',async()=>{let n=0;const ui=await mount(()=>++n===1?choice:{code:'busy',message:'Try after active request'});await ui.click('add-taste');const select=ui.elements.get('curated-choice');select.value='1';select.listeners.change();await ui.click('confirm');assert.equal(ui.elements.get('curated-choice-box').hidden,false);assert.equal(ui.elements.get('curated-confirm').disabled,false);assert.equal(ui.provider().length,2);await ui.click('confirm');assert.equal(JSON.parse(ui.provider().at(-1).options.body).choiceIndex,1);ui.elements.get('curated-favorite').listeners.input();assert.equal(ui.elements.get('curated-choice-box').hidden,true);assert.equal(ui.provider().length,3);});
test('Enter and local clear never dispatch and do not silently rewrite a favorite',async()=>{const ui=await mount(()=>choice);ui.elements.get('curated-form').listeners.submit({preventDefault(){}});await ui.click('clear');assert.equal(ui.provider().length,0);assert.equal(ui.elements.get('curated-favorite').value,'Fixture Film');});
test('unconfirmed one-character edit does not poison confirmed-token operations and source warnings render',async()=>{const ui=await mount(()=>({code:'curated_results',confirmedTastes:[{name:'Confirmed',type:'movie'}],candidateCount:2,explanationNote:'Not causal',cards:[{name:'Airbase fixture',catalogueId:'real-08',address:'Fixture address',resultPosition:1,affinity:null,providerExplanation:null,visitWarning:'UNKNOWN_OFFICIAL_PAGES_CONFLICT_RECHECK'}]}));ui.elements.get('curated-favorite').value='A';await ui.mounted.request('curated-rank',{placeTokens:['p1','p2'],tasteTokens:['t1']});assert.ok(JSON.parse(ui.provider()[0].options.body).favorite.length>=2);assert.ok(ui.elements.get('curated-results').children.find(c=>c.className==='card').children.some(c=>c.textContent.includes('Catalogue warning: UNKNOWN_OFFICIAL_PAGES_CONFLICT_RECHECK')));});
test('rejected place name and address render as unverified text without a selection action or automatic call',async()=>{
 const ui=await mount(()=>({code:'curated_unresolved',message:'No exact match',unverifiedPlaceCandidate:{name:'<img src=x onerror=alert(1)>Fixture alternative',address:'Fixture public street'}}));
 await ui.click('add-place');assert.equal(ui.provider().length,1);const box=ui.elements.get('curated-results');assert.ok(box.children.some(c=>c.textContent.includes('Unverified returned place')));assert.ok(box.children.some(c=>c.textContent.includes('<img src=x')));assert.equal(box.children.some(c=>c.tagName==='button'||c.tagName==='img'),false);assert.equal(ui.elements.get('curated-choice-box').hidden,true);assert.equal(ui.elements.get('curated-confirm').disabled,true);assert.equal(ui.mounted.places.length,0);await ui.click('confirm');assert.equal(ui.provider().length,1);
});

test('rank estimate follows exact selected option and signal cardinality',async()=>{
 const ui=await mount(()=>choice);
 ui.mounted.places.push(...Array.from({length:3},(_,i)=>({token:'p'+i,expiresAt:Date.now()+900000,identity:{name:'Place '+i,type:'place'}})));
 ui.mounted.tastes.push(...['movie','artist'].map((type,i)=>({token:'t'+i,expiresAt:Date.now()+900000,identity:{name:'Taste '+i,type},selected:true})));
 ui.elements.get('curated-choice').listeners.change();
 assert.match(ui.elements.get('curated-rank').textContent,/up to 6 calls/);
 const toggles=ui.elements.get('curated-tastes').children.map(r=>r.children.find(c=>c.tagName==='input'));
 toggles[1].checked=false;toggles[1].listeners.change();assert.match(ui.elements.get('curated-rank').textContent,/up to 5 calls/);
 assert.equal(ui.provider().length,0);
});
test('expiry timer blocks stale rank without calls and explicit remove/resolve/confirm recovers',async()=>{
 let time=1000,timer;const clock={now:()=>time,setTimeout:(fn,ms)=>{if(ms!==90000)timer=fn;return 1;},clearTimeout:()=>{}};
 const ui=await mount(b=>b.action==='curated-place'?choice:{code:'curated_confirmed',identityToken:'fresh',identity:{name:'Fresh place',type:'place',catalogueId:'real-03'},identityExpiresAt:new Date(10000).toISOString()},clock);
 ui.mounted.places.push({token:'old',expiresAt:2000,identity:{name:'Old place',type:'place',catalogueId:'real-03'}},{token:'valid',expiresAt:10000,identity:{name:'Valid place',type:'place',catalogueId:'real-06'}});
 ui.mounted.tastes.push({token:'taste',expiresAt:10000,identity:{name:'Taste',type:'movie'},selected:true});
 ui.elements.get('curated-choice').listeners.change();assert.equal(ui.elements.get('curated-rank').disabled,false);
 time=2001;timer();assert.equal(ui.elements.get('curated-rank').disabled,true);assert.match(ui.elements.get('curated-expiry').textContent,/up to 3 calls/);
 await ui.click('rank');assert.equal(ui.provider().length,0);assert.match(ui.elements.get('curated-status').textContent,/not sent/);
 ui.elements.get('curated-places').children[0].children.find(c=>c.tagName==='button').listeners.click();
 assert.equal(ui.mounted.places[0].token,'valid');assert.equal(ui.mounted.tastes[0].token,'taste');assert.equal(ui.provider().length,0);
 await ui.click('add-place');ui.elements.get('curated-choice').value='0';await ui.click('confirm');
 assert.equal(ui.provider().length,2);assert.equal(ui.mounted.places[1].token,'fresh');assert.equal(ui.mounted.places[1].expiresAt,10000);assert.equal(ui.elements.get('curated-rank').disabled,false);
});
test('missing expiry fails closed, while deselected expired taste does not block valid selected taste',async()=>{
 const ui=await mount(()=>choice);
 ui.mounted.places.push(...[0,1].map(i=>({token:'p'+i,expiresAt:Date.now()+900000,identity:{name:'Place '+i,type:'place'}})));
 ui.mounted.tastes.push({token:'bad',identity:{name:'Expired',type:'movie'},selected:true},{token:'good',expiresAt:Date.now()+900000,identity:{name:'Valid',type:'artist'},selected:true});
 ui.elements.get('curated-choice').listeners.change();assert.equal(ui.elements.get('curated-rank').disabled,true);await ui.click('rank');assert.equal(ui.provider().length,0);
 const toggle=ui.elements.get('curated-tastes').children[0].children.find(c=>c.tagName==='input');toggle.checked=false;toggle.listeners.change();
 assert.equal(ui.elements.get('curated-rank').disabled,false);assert.match(ui.elements.get('curated-rank').textContent,/up to 4 calls/);assert.equal(ui.provider().length,0);
});

const textOf=e=>[e.textContent,...e.children.map(textOf)].join(' ');
const interestToggle=(ui,id)=>ui.elements.get('curated-interests').children.flatMap(e=>e.children).find(e=>e.value===id);
test('travel interests guide all eligible choices locally without selecting identities or sending requests',async()=>{
 const ui=await mount(()=>choice),select=ui.elements.get('curated-place'),before=select.children.map(e=>e.value);
 const history=interestToggle(ui,'history');assert.ok(history,'explicit history checkbox exists');history.checked=true;history.listeners.change();
 const legends=interestToggle(ui,'legends');assert.ok(legends);legends.checked=true;legends.listeners.change();
 const guide=textOf(ui.elements.get('curated-interest-guidance'));assert.match(guide,/Goldfield Ghost Town/);assert.match(guide,/Superstition Mountain Lost Dutchman Museum/);assert.match(guide,/local catalogue/i);
 assert.deepEqual(select.children.map(e=>e.value),before);assert.equal(ui.provider().length,0);assert.equal(ui.mounted.places.length,0);assert.equal(ui.mounted.tastes.length,0);
 await ui.click('clear');assert.equal(history.checked,false);assert.equal(legends.checked,false);
});
test('omitted submitted venues remain visible unranked with source links and local shortlist',async()=>{
 const ui=await mount(()=>({code:'curated_results',confirmedTastes:[{name:'Fixture',type:'movie'}],candidateCount:3,explanationNote:'No causal explanation.',submittedCatalogueIds:['real-07','real-06','real-03'],omittedCatalogueIds:['real-03'],cards:[{catalogueId:'real-07',name:'Usery fixture',resultPosition:1,affinity:.7,providerExplanation:null},{catalogueId:'real-06',name:'Museum fixture',resultPosition:2,affinity:.6,providerExplanation:null}]}));
 await ui.mounted.request('curated-rank');const cards=ui.elements.get('curated-results').children.filter(e=>e.className==='card');assert.equal(cards.length,3);assert.match(textOf(cards[0]),/1. Usery fixture/);assert.match(textOf(cards[1]),/2. Museum fixture/);assert.match(textOf(cards[2]),/Goldfield Ghost Town/);assert.match(textOf(cards[2]),/Unranked/);assert.match(textOf(cards[2]),/affinity: unavailable/);assert.ok(cards[2].children.some(e=>e.tagName==='a'&&e.href==='https://goldfieldghosttown.com/attractions/'));
 const pick=cards[2].children.find(e=>e.tagName==='button');pick.listeners.click();assert.equal(pick.attributes['aria-pressed'],'true');const legends=interestToggle(ui,'legends');legends.checked=true;legends.listeners.change();const updated=ui.elements.get('curated-results').children.filter(e=>e.className==='card');assert.match(textOf(updated[2]),/Legends/);assert.equal(updated[2].children.find(e=>e.tagName==='button').attributes['aria-pressed'],'true');assert.equal(ui.provider().length,1);assert.equal(JSON.parse(ui.provider()[0].options.body).interests,undefined);
});
test('omission rendering accepts only submitted catalogue IDs and never duplicates returned cards',async()=>{
 const ui=await mount(()=>({code:'curated_results',confirmedTastes:[],candidateCount:2,explanationNote:'',submittedCatalogueIds:['real-03','real-07'],omittedCatalogueIds:['real-03','real-03','real-06','unknown','real-07'],cards:[{catalogueId:'real-07',name:'Usery fixture',resultPosition:1,providerExplanation:null}]}));await ui.mounted.request('curated-rank');assert.equal(ui.elements.get('curated-results').children.filter(e=>e.className==='card').length,2);
});
test('zero returned ranks still show every submitted omitted option without a fake position',async()=>{
 const ui=await mount(()=>({code:'curated_results',confirmedTastes:[],candidateCount:2,explanationNote:'',submittedCatalogueIds:['real-03','real-01'],omittedCatalogueIds:['real-03','real-01'],cards:[]}));await ui.mounted.request('curated-rank');const cards=ui.elements.get('curated-results').children.filter(e=>e.className==='card');assert.equal(cards.length,2);for(const c of cards){assert.match(textOf(c),/Unranked/);assert.doesNotMatch(textOf(c),/undefined|not a probability/);}await ui.click('clear');assert.equal(ui.elements.get('curated-results').children.length,0);const history=interestToggle(ui,'history');history.checked=true;history.listeners.change();assert.equal(ui.elements.get('curated-results').children.length,0);assert.equal(ui.provider().length,1);
});

test('distinct same-title favorites survive, while explicit reconfirmation refreshes only the same identity',async()=>{
 let n=0;const replies=[['first','key-a'],['second','key-b'],['refreshed','key-a']];
 const ui=await mount(()=>{const [identityToken,identityKey]=replies[n++];return {code:'curated_confirmed',identityToken,identityKey,identity:{name:'Shared title',type:'movie'},identityExpiresAt:new Date(Date.now()+900000+n).toISOString()};});
 for(let i=0;i<3;i++)await ui.mounted.request('curated-confirm',{choiceToken:'explicit-'+i,choiceIndex:0});
 assert.equal(ui.mounted.tastes.length,2);assert.deepEqual(ui.mounted.tastes.map(x=>x.token),['refreshed','second']);assert.equal(ui.provider().length,3);
 ui.mounted.places.push(...[1,2].map(n=>({token:'place'+n,identity:{name:'Place '+n,type:'place'},expiresAt:Date.now()+900000})));
 ui.elements.get('curated-choice').listeners.change();assert.match(ui.elements.get('curated-rank').textContent,/up to 5 calls/);
});
