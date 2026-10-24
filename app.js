'use strict';
const M=window.LaunchModel;let state={...M.defaults,weights:[...M.defaults.weights]},done={};
const $=id=>document.getElementById(id);const labels=['Workflow fit','Volume potential','Public evidence','Ease of entry'];
const fields=[['accounts','Target accounts',1,0,10000],['reply','Positive reply %',1,0,100],['meeting','Reply → meeting %',1,0,100],['qualified','Meeting → qualified %',1,0,100],['pilot','Qualified → pilot %',1,0,100],['acv','Scenario ACV ($)',1000,0,100000000],['budget','Campaign budget ($)',100,0,100000000],['capacity','Pilot capacity',1,0,100]];
function build(){
 $('weights').innerHTML=labels.map((s,i)=>`<label>${s}<input aria-label="${s} weight" data-weight="${i}" type="number" min="0" max="100" value="${state.weights[i]}"></label>`).join('');
 $('inputs').innerHTML=fields.map(([id,label,step,min,max])=>`<div class="input-row"><label for="${id}">${label}</label><input id="${id}" type="number" min="${min}" max="${max}" step="${step}" value="${state[id]}"></div>`).join('');
 $('account-grid').innerHTML=M.accounts.map(a=>`<article class="account"><div class="account-head"><h3>${a.name}</h3><span>${a.rank} / 03</span></div><div><div class="kicker">PUBLIC SIGNAL</div><p>${a.signal}</p></div><div><div class="kicker">DISCOVERY HYPOTHESIS</div><p>${a.hypothesis}</p></div><div><div class="kicker">BUYER ROLE TO VALIDATE</div><p>${a.buyer}</p><p class="question">“${a.question}”</p></div><a class="source-link" href="${a.url}" target="_blank" rel="noopener">${a.label} ↗</a></article>`).join('');
 fields.forEach(([id])=>$(id).addEventListener('input',e=>{state[id]=Number(e.target.value);render();}));
 document.querySelectorAll('[data-weight]').forEach(el=>el.addEventListener('input',e=>{state.weights[Number(e.target.dataset.weight)]=Number(e.target.value);render();}));render();
}
function render(){
 const rank=M.rank(state.weights),c=M.calculate(state),tasks=M.readiness(done);
 $('ranking').innerHTML=rank.map(s=>`<div class="rank-row"><span>${s.short}</span><div class="rank-bar"><div style="width:${s.score*20}%"></div></div><strong>${s.score.toFixed(2)}</strong></div>`).join('');
 $('segment-risk').textContent=rank[0].score?`${rank[0].short} leads under these weights. Watch-out: ${rank[0].risk}`:'Set at least one positive criterion weight before selecting a segment.';
 const funnel=[['Accounts',c.accounts],['Positive replies',c.replies],['Meetings',c.meetings],['Qualified',c.qualified],['Expected pilots',c.pilots]];
 $('funnel').innerHTML=funnel.map(([label,v])=>`<div class="funnel-row"><span>${label}</span><div class="funnel-bar"><div style="width:${c.accounts?v/c.accounts*100:0}%"></div></div><strong>${M.fmt(v)}</strong></div>`).join('');
 $('metrics').innerHTML=[['Cost / meeting',c.costPerMeeting===null?'—':M.money(c.costPerMeeting),'Budget ÷ expected meetings'],['Qualified pipeline',M.money(c.pipeline),'Unweighted; not revenue'],['Supported pilots',M.fmt(c.supported),'Limited by capacity']].map(([label,v,detail])=>`<div class="metric"><span>${label}</span><strong>${v}</strong><small>${detail}</small></div>`).join('');
 $('model-insight').textContent=c.overCapacity?`Capacity constraint: ${M.fmt(c.pilots)} expected pilots vs ${M.fmt(c.capacity)} slots. Stage demand before increasing spend.`:c.meetings<3?'Evidence risk: fewer than three expected meetings. Improve targeting or test messaging before funding a build.':`Capacity fits this scenario. ${M.fmt(c.meetings)} expected meetings still require real discovery; funnel arithmetic does not validate demand.`;
 $('progress').textContent=`${tasks.filter(t=>t.done).length} / ${tasks.length} demo milestones complete`;
 $('experiments').innerHTML=tasks.map(e=>`<article class="experiment ${e.blocked?'blocked':''}"><div class="card-top"><span>WEEK ${e.week} / ${e.owner}</span><b>${e.done?'DONE':e.blocked?'BLOCKED':'READY'}</b></div><h3>${e.title}</h3><p>${e.detail}</p><p class="gate"><strong>Evidence gate:</strong> ${e.success}</p><label class="check"><input type="checkbox" data-task="${e.id}" ${e.done?'checked':''} ${e.blocked?'disabled':''}>${e.blocked?'Complete prerequisites first':'Mark demo gate complete'}</label></article>`).join('');
 document.querySelectorAll('[data-task]').forEach(el=>el.addEventListener('change',e=>{const id=e.target.dataset.task;done[id]=e.target.checked;if(!done[id]){let changed=true;while(changed){changed=false;M.experiments.forEach(t=>{if(done[t.id]&&t.depends.some(d=>!done[d])){done[t.id]=false;changed=true;}});}}render();}));
 $('memo').textContent=M.memo(state,done);
}
function toast(s){$('toast').textContent=s;$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),2200);}
$('reset').addEventListener('click',()=>{state={...M.defaults,weights:[...M.defaults.weights]};done={};build();toast('Scenario reset to illustrative defaults');});
$('downside').addEventListener('click',()=>{Object.assign(state,{reply:10,meeting:35,qualified:30,pilot:20});build();toast('Downside conversion assumptions applied');});
$('download').addEventListener('click',()=>{const b=new Blob([M.memo(state,done)],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(b),a=document.createElement('a');a.href=url;a.download='lio-us-launch-decision-memo.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),500);toast('Decision memo exported with scenario assumptions');});
build();

// Local AI snapshot seam: deterministic, synthetic/public evidence only; no transport.
window.CoSAISnapshot=()=>{const E=(id,label,kind,value)=>({id,label,kind,value});return {evidence:[E('scenario','Campaign assumptions','synthetic',state),E('funnel','Locked funnel calculations','calculated',M.calculate(state)),E('segments','Analyst-weighted segment ranking','calculated',M.rank(state.weights)),E('execution','Owner and dependency gates','synthetic',M.readiness(done)),E('accounts','Public supplier signals; buying intent unknown','public',M.accounts),E('limits','Operating boundaries','constraint','Research candidates are not customers or contacts. No outreach, invented buyers or proof of demand.')]};};
if(typeof window.dispatchEvent==='function')window.dispatchEvent(new Event('cos-ai-snapshot-ready'));
