import {createController,localTransport,INTERESTS} from './core.mjs';
const $=id=>document.getElementById(id),form=$('form'),interest=$('interest'),scenario=$('scenario'),run=$('run'),status=$('status'),results=$('results'),payload=$('payload'),trace=$('trace');
function group(title,rows,ranked=false){const h=document.createElement('h3');h.className='group-title';h.textContent=title;results.append(h);for(const [i,row] of rows.entries()){const card=document.createElement('article');card.className='card';const number=document.createElement('span');number.className='number';number.textContent=ranked?String(i+1):'·';const body=document.createElement('div'),name=document.createElement('h4'),detail=document.createElement('p');name.textContent=row.name;detail.textContent=row.access.evidence;body.append(name,detail);card.append(number,body);results.append(card);}}
function render(state){results.replaceChildren();payload.textContent='';trace.hidden=true;run.disabled=state.status==='loading';
 if(state.status==='idle'){status.textContent='Choose an interest to begin.';return;}
 if(state.status==='loading'){status.textContent='Running the synthetic example…';return;}
 if(state.status==='error'){status.textContent='No recommendation shown';const p=document.createElement('p');p.textContent=state.message;results.append(p);return;}
 const {result,excluded}=state.data;status.textContent=result.ranked.length?`Example matches for ${INTERESTS[state.request.interest].toLowerCase()}`:'No ranked results';
 if(result.ranked.length)group('Handcrafted example ordering',result.ranked,true);
 if(result.unscored.length)group('No score available · not recommended',result.unscored);
 if(excluded.length)group('Excluded · fictional closure',excluded);
 payload.textContent=JSON.stringify({notice:'Local synthetic request/result only; no API dispatch',request:state.request,response:state.data},null,2);trace.hidden=false;
}
const controller=createController(localTransport,render,2500);form.addEventListener('submit',e=>{e.preventDefault();void controller.run(interest.value,scenario.value);});for(const select of [interest,scenario])select.addEventListener('change',()=>controller.invalidate());controller.invalidate();
