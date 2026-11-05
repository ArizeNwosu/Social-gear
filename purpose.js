/* Each explainer answers a specific buying question; progression is local only. */
(() => {
 const flows={
 advisory:{name:'Choosing your first AI project',steps:[
 {label:'Find friction',title:'Start with a real business bottleneck.',items:['Weekly updates take too long','People copy the same details between tools','Requests wait for someone to route them'],result:'A short list of recurring problems'},
 {label:'Compare opportunities',title:'Weigh impact against effort.',items:['Weekly reporting: recurring, clear inputs','Customer disputes: nuanced, human judgment','Tool replacement: wider change and training'],result:'A practical priority, with tradeoffs explained'},
 {label:'Agree the pilot',title:'Make the first project manageable.',items:['Scope: draft the weekly status summary','Owner: operations lead reviews every report','Measure: review time and corrections required'],result:'One agreed project and a way to judge it'}]},
 trust:{name:'How approval boundaries work',steps:[
 {label:'Agree access',title:'Define what the tool is allowed to use.',items:['Select the information needed for this workflow','Review the provider and retention settings','Document who can grant or remove access'],result:'Permissions reviewed before connection'},
 {label:'Prepare privately',title:'AI prepares an output for review.',items:['Use the agreed inputs','Keep drafts within the approved workflow','Flag missing details or uncertainty'],result:'Draft prepared — no external action yet'},
 {label:'Human decision',title:'A person decides whether it moves forward.',items:['Check facts and sensitive details','Edit or reject anything unsuitable','Approve the agreed next action'],result:'You control the handoff'}]},
 pricing:{name:'What each engagement delivers',steps:[
 {label:'Your own map',title:'Understand one person’s recurring work.',items:['One inbox in scope','Identify repeated tasks and handoffs','Decide whether a wider assessment would help'],result:'Free · individual starting point'},
 {label:'Your team’s map',title:'Connect the work across your team.',items:['Up to five inboxes','One hour with your Social Gear AI advisor','Discuss the projects worth pricing'],result:'US$1,500 · a clearer investment decision'},
 {label:'AI Sherpa',title:'Build and keep improving together.',items:['Agree scope and responsibilities','Build agents and review their outputs','Maintain the workflows as needs change'],result:'From US$4,500/month · three-month minimum'}]},
 next:{name:'Your first conversation',steps:[
 {label:'Bring a workflow',title:'Tell us what is taking too much time.',items:['A recurring task','The tools and people involved','What you would like to improve'],result:'No technical specification needed'},
 {label:'Explore the fit',title:'Work through the opportunity together.',items:['What could AI help prepare?','Where is human judgment needed?','What constraints should shape the solution?'],result:'A shared view of the problem'},
 {label:'Leave with clarity',title:'Know what to do next.',items:['An assessment, if more context is needed','A focused pilot, if the opportunity is clear','Or a simpler change to your existing process'],result:'A practical next step'}]}
 };
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 document.querySelectorAll('[data-purpose]').forEach(host=>{
 const flow=flows[host.dataset.purpose];let current=0,playing=false,visible=false;
 host.className='purpose-explainer';host.setAttribute('role','group');host.setAttribute('aria-label',flow.name);
 host.innerHTML='<div class="purpose-top"><span>'+flow.name+'</span><small>ILLUSTRATIVE PROCESS</small></div><div class="purpose-steps"></div><div class="purpose-stage"></div><div class="purpose-controls"><button type="button" class="purpose-play">Play sequence</button><button type="button" class="purpose-next">Next step →</button></div>';
 const tabs=host.querySelector('.purpose-steps'),stage=host.querySelector('.purpose-stage'),play=host.querySelector('.purpose-play');
 flow.steps.forEach((s,i)=>{const button=document.createElement('button');button.type='button';button.textContent=`0${i+1} · ${s.label}`;button.onclick=()=>{playing=false;current=i;render()};tabs.append(button)});
 function render(){const s=flow.steps[current];stage.innerHTML='<h3>'+s.title+'</h3><ol>'+s.items.map((item,i)=>`<li style="--delay:${i*100}ms"><span>${i+1}</span>${item}</li>`).join('')+'</ol><p class="purpose-result">'+s.result+'</p>';[...tabs.children].forEach((b,i)=>b.setAttribute('aria-pressed',String(i===current)));play.textContent=playing?'Pause sequence':'Play sequence';stage.setAttribute('aria-live',playing?'off':'polite')}
 host.querySelector('.purpose-next').onclick=()=>{playing=false;current=(current+1)%flow.steps.length;render()};play.onclick=()=>{playing=!playing;render()};
 new IntersectionObserver(entries=>visible=entries[0].isIntersecting).observe(host);
 setInterval(()=>{if(playing&&visible&&!document.hidden){current=(current+1)%flow.steps.length;render()}},6000);
 reduced.addEventListener('change',()=>{playing=false;render()});render();
 });
})();
