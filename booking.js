/* Confirm only bookings acknowledged by the live calendar API. */
(() => {
  const today=new Date(), initial=today.getFullYear()*12+today.getMonth();
  let view=initial,availability={},date=null,time=null,timeZone='',request=0,submitting=false;
  const $=id=>document.getElementById(id),grid=$('cal-days'),form=$('booking-form');
  const status=document.createElement('p');status.id='booking-status';status.setAttribute('role','status');status.className='booking-status';$('booking-widget').prepend(status);
  const error=document.createElement('p');error.setAttribute('role','alert');form.append(error);
  function show(step){
    ['date','time','confirm','done'].forEach(name=>$('step-'+name).hidden=name!==step);
    const heading=$('step-'+step).querySelector('h2');heading.tabIndex=-1;heading.focus({preventScroll:true});
    $('booking-widget').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
  }
  function formatDate(value){return new Date(value+'T12:00:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});}
  async function render(){
    const token=++request,year=Math.floor(view/12),month=view%12;
    $('cal-month-label').textContent=new Date(year,month,1).toLocaleDateString('en-US',{month:'long',year:'numeric'});
    $('cal-prev').disabled=view<=initial;$('cal-next').disabled=view>=initial+12;
    grid.textContent='Loading availability…';grid.setAttribute('aria-busy','true');status.textContent='';
    try{
      const response=await fetch(`/api/availability?year=${year}&month=${month+1}`);
      if(!response.ok)throw Error();const data=await response.json();
      if(!data.available||!data.timeZone)throw Error();if(token!==request)return;
      availability=data.available;timeZone=data.timeZone;
      $('booking-tz').textContent=`All times are in ${timeZone.replace(/_/g,' ')} (host timezone).`;
      grid.replaceChildren();
      for(let i=0;i<new Date(year,month,1).getDay();i++)grid.append(document.createElement('span'));
      for(let day=1;day<=new Date(year,month+1,0).getDate();day++){
        const key=`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        const button=document.createElement('button');button.type='button';button.className='calendar-day';button.textContent=day;button.setAttribute('aria-label',formatDate(key));
        button.disabled=!availability[key]?.length;
        if(!button.disabled){button.classList.add('calendar-day-available');button.onclick=()=>{date=key;time=null;renderTimes();show('time');};}
        if(key===date){button.classList.add('calendar-day-selected');button.setAttribute('aria-pressed','true');}
        grid.append(button);
      }
      if(!Object.values(availability).some(slots=>slots.length))status.textContent='No appointments this month. Try another month or contact us.';
    }catch{
      if(token!==request)return;availability={};grid.replaceChildren();
      const retry=document.createElement('button');retry.type='button';retry.className='button';retry.textContent='Retry availability';retry.onclick=render;grid.append(retry);
      status.replaceChildren(document.createTextNode('Online scheduling is unavailable. '));const link=document.createElement('a');link.href='contact.html';link.textContent='Contact us to arrange a time →';status.append(link);
      $('booking-tz').textContent='No appointment has been booked.';
    }finally{if(token===request)grid.removeAttribute('aria-busy');}
  }
  function renderTimes(){
    $('selected-date-label').textContent=`${formatDate(date)} · ${timeZone.replace(/_/g,' ')}`;
    $('time-slots').replaceChildren();
    for(const value of availability[date]||[]){
      const button=document.createElement('button');button.type='button';button.className='time-slot';button.textContent=value;
      button.onclick=()=>{time=value;$('summary-date').textContent=formatDate(date);$('summary-time').textContent=`${time} · 30 minutes · ${timeZone.replace(/_/g,' ')}`;error.textContent='';show('confirm');};$('time-slots').append(button);
    }
  }
  $('cal-prev').onclick=()=>{if(view>initial){view--;render();}};
  $('cal-next').onclick=()=>{if(view<initial+12){view++;render();}};
  $('back-to-date').onclick=()=>{show('date');render();};
  $('back-to-time').onclick=()=>{show('time');renderTimes();};
  form.onsubmit=async event=>{
    event.preventDefault();if(submitting||!date||!time||!form.reportValidity())return;
    submitting=true;const button=form.querySelector('[type=submit]');button.disabled=true;button.textContent='Confirming…';error.textContent='';
    const payload=Object.fromEntries(new FormData(form));payload.date=date;payload.time=time;
    try{
      const response=await fetch('/api/book',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      const result=await response.json();
      if(!response.ok||!result.success||!result.eventId)throw Error(result.error||'We could not confirm your booking. Please contact us before retrying.');
      $('done-summary').textContent=`${formatDate(date)} at ${time} · ${timeZone.replace(/_/g,' ')}`;$('done-email').textContent=payload.email;show('done');
    }catch(err){error.textContent=err.message==='Failed to fetch'?'Connection lost. Your booking is not confirmed here; please contact us before retrying.':err.message;}
    finally{submitting=false;button.disabled=false;button.textContent='Confirm booking →';}
  };
  render();
})();
