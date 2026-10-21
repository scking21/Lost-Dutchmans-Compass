import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const html=await readFile(new URL('../public/index.html',import.meta.url),'utf8');
const css=await readFile(new URL('../public/style.css',import.meta.url),'utf8');
const app=await readFile(new URL('../public/app.mjs',import.meta.url),'utf8');
// Source contracts, not a substitute for rendered-browser layout/keyboard QA.
test('essential controls, consent and access warning precede primary action; options follow',()=>{
 const run=html.indexOf('id="run"');const options=html.indexOf('<details id="discovery-options"');
 for(const id of ['destination','type','favorite','choices','seed','scope-summary'])assert.ok(html.indexOf(`id="${id}"`)<run);
 assert.ok(html.indexOf('submitting sends your city and favorite to Qloo')<run);
 assert.ok(html.indexOf('Visitor access is unknown.')<run);
 assert.ok(run<options);assert.ok(options<html.indexOf('id="rerank"'));
 const disclosure=html.slice(options,html.indexOf('</details>',options));
 assert.match(disclosure,/<summary>Scope, test modes and request limits<\/summary>/);
 for(const id of ['heritage','mode','verified'])assert.match(disclosure,new RegExp(`id="${id}"`));
 assert.match(html,/<input id="heritage" type="checkbox">/);
 assert.match(html,/<input id="verified" type="checkbox" disabled>/);
 assert.match(html,/<button id="run" type="submit" disabled>Recommend places<\/button>/);
});
test('all existing handler IDs remain unique and secondary action remains a submitter',()=>{
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);
 for(const id of ['workflow','results','payload','status','badge','run','rerank','choices','seed','destination','favorite','type','verified','mode','heritage','form','readiness'])assert.ok(ids.includes(id));
 assert.match(html,/<button id="rerank" class="secondary" type="submit" disabled>/);
 assert.doesNotMatch(html,/↗|↓/);assert.doesNotMatch(app,/↗/);
});
test('responsive source uses aligned non-stretching results and bounded typography without remote fonts',()=>{
 assert.match(css,/grid-template-columns:340px minmax\(0,1fr\);align-items:start/);
 assert.match(css,/\.result-panel\{[^}]*align-self:start/);assert.doesNotMatch(css,/min-height:280px/);
 assert.match(css,/@media\(max-width:760px\)/);assert.match(css,/grid-template-columns:minmax\(0,1fr\)/);
 assert.match(css,/font-size:16px/);assert.match(css,/label\{[^}]*font-size:14px/);
 assert.doesNotMatch(css,/font-size:(?:[0-9]|1[0-3])px/);assert.doesNotMatch(css,/@import|https?:|@font-face/);
 assert.match(css,/prefers-reduced-motion/);assert.match(css,/cursor:not-allowed/);
});
function luminance(hex){const c=hex.replace('#','').match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2];}
function ratio(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
test('palette text pairs meet normal-text contrast thresholds',()=>{
 for(const [a,b] of [['#173e3a','#f6f2e9'],['#52655f','#f6f2e9'],['#52655f','#eaece1'],['#52655f','#fffdf7'],['#ffffff','#185d52'],['#714b0a','#f8e8bc'],['#8f3f2b','#fbede7']])assert.ok(ratio(a,b)>=4.5,`${a} on ${b}: ${ratio(a,b)}`);
 assert.match(css,/--muted:#52655f/);assert.match(css,/--action:#185d52/);assert.match(css,/--border:#758a7f/);
});
test('control boundary and focus contrast meet three-to-one on adjacent surfaces',()=>{
 for(const bg of ['#fffdf7','#eaece1'])assert.ok(ratio('#758a7f',bg)>=3);
 for(const bg of ['#fffdf7','#f6f2e9','#eaece1'])assert.ok(ratio('#185d52',bg)>=3);
 assert.match(css,/:focus-visible\{outline:3px solid var\(--action\);outline-offset:4px/);
});
test('About describes current judging capacity without presenting old pilot exhaustion as current',()=>{
 const about=html.slice(html.indexOf('<h3>What works, and what remains unverified?</h3>'));
 assert.match(about,/Judging mode has no shared test ceiling/);assert.match(about,/one request at a time/);assert.match(about,/Busy requests require an explicit later retry/);assert.doesNotMatch(about,/64fd67a|eedf07b|at 04:39 UTC found live capacity exhausted/);
 assert.match(about,/Mobile rendering remains unverified/);assert.match(about,/does not report the Qloo account allowance/);assert.match(about,/Current visitor access and safety remain unverified/);
});
