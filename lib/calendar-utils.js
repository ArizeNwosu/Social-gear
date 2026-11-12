const crypto = require('node:crypto');
const SLOT_MS = 30 * 60 * 1000;
const LEAD_MS = 60 * 60 * 1000;
function zone() { return process.env.CALENDAR_TIMEZONE || 'America/New_York'; }
function parts(date, timeZone) {
  return Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone, year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', hourCycle:'h23' }).formatToParts(date).filter(p=>p.type!=='literal').map(p=>[p.type,Number(p.value)]));
}
function localInstant(date, hour, minute, timeZone=zone()) {
  const [year,month,day]=date.split('-').map(Number);
  const target=Date.UTC(year,month-1,day,hour,minute);
  let instant=target;
  for(let i=0;i<4;i++) {
    const p=parts(new Date(instant),timeZone);
    const difference=target-Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute);
    if(!difference) return new Date(instant);
    instant+=difference;
  }
  throw new Error('Invalid local time');
}
function parseSlot(date,time,now=new Date()) {
  if(typeof date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(date)||typeof time!=='string') return null;
  const day=new Date(date+'T12:00:00Z');
  if(!Number.isFinite(+day)||day.toISOString().slice(0,10)!==date||[0,6].includes(day.getUTCDay())) return null;
  const m=/^(\d{1,2}):(00|30) (AM|PM)$/.exec(time);
  if(!m||Number(m[1])<1||Number(m[1])>12)return null;
  const hour=Number(m[1])%12+(m[3]==='PM'?12:0);
  if(hour<9||hour>=16)return null;
  const start=localInstant(date,hour,Number(m[2]));
  if(+start<+now+LEAD_MS||+start>+now+366*86400000)return null;
  return {start,end:new Date(+start+SLOT_MS)};
}
function busy(calendarId,response) {
  const calendar=response.data.calendars?.[calendarId];
  if(!calendar||calendar.errors?.length)throw new Error('Calendar availability unavailable');
  return (calendar.busy||[]).map(b=>({start:new Date(b.start),end:new Date(b.end)}));
}
function overlaps(slot,blocks){return blocks.some(b=>slot.start<b.end&&slot.end>b.start);}
function eventId(start){return 'sg'+crypto.createHash('sha256').update(start.toISOString()).digest('hex');}
function calendarClient(readOnly=false){
  if(!process.env.GOOGLE_SERVICE_ACCOUNT_KEY||!process.env.GOOGLE_CALENDAR_ID)throw new Error('Calendar not configured');
  const {google}=require('googleapis');
  const auth=new google.auth.GoogleAuth({credentials:JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),scopes:[`https://www.googleapis.com/auth/calendar${readOnly?'.readonly':''}`]});
  return google.calendar({version:'v3',auth});
}
module.exports={zone,localInstant,parseSlot,busy,overlaps,eventId,calendarClient};
