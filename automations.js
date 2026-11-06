(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const script = document.currentScript.src;
  fetch(new URL('automation-data.json', script)).then(r => { if (!r.ok) throw Error('Workflow data unavailable'); return r.json(); }).then(data => {
    const states = new Map();
    const phases = ['01 / By hand', '02 / AI prepares', '03 / Your review', '04 / Ready for the next step'];
    function render(el) {
      const s = states.get(el), item = s.item;
      el.querySelector('.film-phase').textContent = phases[s.step];
      el.querySelector('h3').textContent = item.title;
      el.querySelector('.film-caption').textContent = [item.before,item.prepare,item.review,'The reviewed output is ready. This is a demo; no messages, records, or payments have been changed.'][s.step];
      el.querySelector('.film-count').textContent = `${s.step + 1} / 4`;
      el.querySelector('[data-film-play]').textContent = s.playing ? 'Pause' : s.step === 3 ? 'Replay demo' : 'Play demo';
      el.querySelector('.film-progress i').style.width = `${(s.step+1)*25}%`;
      const screen = el.querySelector('.film-screen');
      const lines = item.lines.map((l,i) => `<div class="screen-row" style="--row:${i}"><span>${escape(l.split(' · ')[0])}</span><b>${escape(l.split(' · ').slice(1).join(' · '))}</b></div>`).join('');
      let content;
      if(s.step === 0) content = `<div class="paper-stack"><div>Notes to check</div><div>Details to copy</div><div>Waiting for someone</div></div><span class="screen-status">Manual work queue</span>`;
      else content = `<div class="screen-chrome"><i></i><i></i><i></i><span>${escape(item.tools)}</span></div><div class="screen-content screen-${item.kind}">${item.kind==='document'?'<div class="document-heading">Working draft</div>':''}${lines}${item.kind==='chart'?'<div class="screen-bars"><i></i><i></i><i></i><i></i><i></i></div>':''}</div><div class="screen-status">${s.step===1?'✳ Preparing a first pass':s.step===2?'◉ Waiting for your review':'✓ Reviewed in this demo'}</div>${s.step===2?'<div class="screen-actions"><span>Review details</span><span>Request changes</span></div>':''}`;
      screen.innerHTML = content;
      screen.classList.remove('screen-enter'); void screen.offsetWidth; screen.classList.add('screen-enter');
    }
    function stop(el) { const s=states.get(el); s.playing=false; clearInterval(s.timer); el.querySelector('[data-film-play]').textContent=s.step===3?'Replay demo':'Play demo'; }
    function play(el) {
      const s=states.get(el); clearInterval(s.timer); if(s.step===3)s.step=0; s.playing=true; render(el);
      s.timer=setInterval(()=>{if(document.hidden||!s.visible)return; if(s.step===3){stop(el);return;} s.step++;render(el);},3000);
    }
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      const s=states.get(entry.target);s.visible=entry.isIntersecting;
      if(s.visible&&!s.seen){s.seen=true;if(!reduced.matches)play(entry.target);}
    }),{threshold:.35});
    document.querySelectorAll('[data-film]').forEach(el=>{
      const item=data.items.find(i=>i.id===el.dataset.film);if(!item)return;
      states.set(el,{item,step:0,playing:false,visible:false,seen:false,timer:null});render(el);observer.observe(el);
      el.querySelector('[data-film-play]').onclick=()=>{const s=states.get(el);s.seen=true;if(s.playing)stop(el);else play(el);};
      el.querySelector('[data-film-next]').onclick=()=>{stop(el);const s=states.get(el);s.seen=true;s.step=(s.step+1)%4;render(el);};
    });
    document.querySelectorAll('[data-category-demo]').forEach(button=>button.addEventListener('click',()=>{
      const el=document.querySelector('#home-automation-demo [data-film]');stop(el);const s=states.get(el);
      s.item=data.items.find(i=>i.category===button.dataset.categoryDemo);s.step=0;
      el.setAttribute('aria-label',`Illustrative workflow: ${s.item.title}`);
      document.querySelectorAll('[data-category-demo]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
      render(el);if(!reduced.matches)play(el);
    }));
    reduced.addEventListener('change',()=>{if(reduced.matches)states.forEach((s,el)=>stop(el));});
    const search=document.getElementById('automation-search');let filter='all';
    function applyFilter(){
      const terms=search.value.toLowerCase().trim().split(/\s+/).filter(Boolean);let count=0;
      document.querySelectorAll('.library-card').forEach(card=>{
        card.hidden=!(filter==='all'||card.dataset.libraryCategory===filter)||!terms.every(t=>card.dataset.search.includes(t));
        if(!card.hidden)count++;else {const el=card.querySelector('[data-film]');stop(el);}
      });
      document.querySelectorAll('[data-group]').forEach(g=>g.hidden=![...g.querySelectorAll('.library-card')].some(c=>!c.hidden));
      document.getElementById('library-count').textContent=`${count} workflow${count===1?'':'s'}`;
      document.getElementById('library-empty').hidden=count!==0;
    }
    if(search){search.addEventListener('input',applyFilter);document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));applyFilter();});}
  }).catch(()=>{
    document.querySelectorAll('.film-controls').forEach(el=>{el.innerHTML='<span>Demo unavailable. The workflow description is shown above.</span>';});
  });
})();
