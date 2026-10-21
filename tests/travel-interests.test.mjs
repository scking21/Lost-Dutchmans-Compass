import test from 'node:test';
import assert from 'node:assert/strict';
import {catalogue} from '../public/catalogue.mjs';
import {matchedInterests} from '../public/travel-interests.mjs';
const matches=id=>matchedInterests(catalogue.find(c=>c.id===id),new Set(['history','legends','nature'])).map(m=>m.id);
test('documented legends apply to Goldfield and Superstition Museum, not natural-history museum or Usery',()=>{
 assert.deepEqual(matches('real-03'),['history','legends']);assert.deepEqual(matches('real-01'),['history','legends']);assert.deepEqual(matches('real-06'),['nature']);assert.deepEqual(matches('real-07'),['nature']);
});
test('empty or unknown interests never infer a preference or alter catalogue facts',()=>{
 const before=JSON.stringify(catalogue);assert.deepEqual(matchedInterests(catalogue[0],new Set()),[]);assert.deepEqual(matchedInterests(catalogue[0],new Set(['unknown'])),[]);assert.deepEqual(matchedInterests(undefined,new Set(['history'])),[]);assert.equal(JSON.stringify(catalogue),before);
});
