/* Progressive enhancement: navigation, searchable content, and reading progress. */
(() => {
  const path=location.pathname.replace(/\/index\.html$/,'/');
  document.querySelectorAll('nav a').forEach(a=>{
    const target=new URL(a.href).pathname;
    if(target===path||(target.endsWith('/blog.html')&&path.includes('/blog/'))||(target.endsWith('/case-studies.html')&&path.includes('/case-studies/')))a.setAttribute('aria-current',target===path?'page':'true');
    else a.removeAttribute('aria-current');
  });
  const normalize=s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const blog=document.getElementById('blog-search');
  if(blog){
    const entries=[...document.querySelectorAll('.blog-entry')];
    const filter=()=>{const terms=normalize(blog.value).trim().split(/\s+/).filter(Boolean);let count=0;entries.forEach(el=>{el.hidden=!terms.every(t=>normalize(el.textContent).includes(t));if(!el.hidden)count++;});document.getElementById('blog-count').textContent=`${count} article${count===1?'':'s'}`;document.getElementById('blog-empty').hidden=count>0;};
    blog.addEventListener('input',filter);document.getElementById('blog-clear').onclick=()=>{blog.value='';filter();blog.focus();};
  }
  const search=document.getElementById('automation-search');
  if(search){
    let category='all';const cards=[...document.querySelectorAll('.library-card')],buttons=[...document.querySelectorAll('[data-filter]')];
    const filter=()=>{const terms=normalize(search.value).trim().split(/\s+/).filter(Boolean);let count=0;cards.forEach(card=>{card.hidden=!(category==='all'||card.dataset.libraryCategory===category)||!terms.every(t=>normalize(card.dataset.search).includes(t));if(!card.hidden)count++;});document.querySelectorAll('[data-group]').forEach(group=>group.hidden=![...group.querySelectorAll('.library-card')].some(c=>!c.hidden));buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===category)));document.getElementById('library-count').textContent=`${count} workflow${count===1?'':'s'}`;document.getElementById('library-empty').hidden=count>0;};
    search.addEventListener('input',filter);buttons.forEach(b=>b.onclick=()=>{category=b.dataset.filter;filter();});
    document.getElementById('library-reset').onclick=()=>{category='all';search.value='';filter();search.focus();};
  }
  const article=document.querySelector('.article-body');
  if(article){
    const meta=document.querySelector('.article-meta');if(meta){const mins=Math.max(1,Math.ceil(article.textContent.trim().split(/\s+/).length/220));meta.append(document.createTextNode(` · ${mins} min read`));}
    const progress=document.createElement('div');progress.className='reading-progress';progress.setAttribute('aria-hidden','true');document.body.append(progress);
    let scheduled=false;
    const update=()=>{const r=article.getBoundingClientRect();progress.style.transform=`scaleX(${Math.max(0,Math.min(1,(innerHeight*.3-r.top)/(r.height-innerHeight*.3)))})`;scheduled=false;};
    window.addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(update);}},{passive:true});window.addEventListener('resize',update);update();
  }
})();
