const {zone,localInstant,parseSlot,busy,overlaps,calendarClient}=require('../lib/calendar-utils');
module.exports=async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
  const year=Number(req.query?.year),month=Number(req.query?.month),now=new Date();
  if(!Number.isInteger(year)||!Number.isInteger(month)||month<1||month>12||year<now.getUTCFullYear()||year>now.getUTCFullYear()+1)return res.status(400).json({error:'Choose a month within the next year.'});
  try{
    const calendar=calendarClient(true),calendarId=process.env.GOOGLE_CALENDAR_ID;
    const first=`${year}-${String(month).padStart(2,'0')}-01`;
    const next=new Date(Date.UTC(year,month,1)).toISOString().slice(0,10);
    const result=await calendar.freebusy.query({requestBody:{timeMin:localInstant(first,0,0).toISOString(),timeMax:localInstant(next,0,0).toISOString(),items:[{id:calendarId}]}});
    const blocks=busy(calendarId,result),available={};
    for(let d=1;d<=new Date(Date.UTC(year,month,0)).getUTCDate();d++){
      const date=`${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const slots=[];
      for(let h=9;h<16;h++)for(const m of ['00','30']){
        const time=`${h%12||12}:${m} ${h>=12?'PM':'AM'}`,slot=parseSlot(date,time,now);
        if(slot&&!overlaps(slot,blocks))slots.push(time);
      }
      if(slots.length)available[date]=slots;
    }
    return res.status(200).json({available,timeZone:zone()});
  }catch(err){console.error('Availability request failed:',err.code||'calendar_unavailable');return res.status(503).json({error:'Online scheduling is temporarily unavailable. Please contact us to arrange a time.'});}
};
