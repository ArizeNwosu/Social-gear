const {zone,parseSlot,busy,overlaps,eventId,calendarClient}=require('../lib/calendar-utils');
module.exports=async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  const input=req.body;
  if(!input||typeof input!=='object')return res.status(400).json({error:'Please provide your booking details.'});
  const {name,email,company='',notes='',date,time}=input;
  if(typeof name!=='string'||!name.trim()||name.length>160||typeof email!=='string'||email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||typeof company!=='string'||company.length>200||typeof notes!=='string'||notes.length>4000)return res.status(400).json({error:'Please check your name, email, and message length.'});
  try{
    const slot=parseSlot(date,time);
    if(!slot)return res.status(400).json({error:'Choose a future weekday slot between 9 AM and 4 PM, with at least one hour’s notice.'});
    const calendar=calendarClient(),calendarId=process.env.GOOGLE_CALENDAR_ID;
    const availability=await calendar.freebusy.query({requestBody:{timeMin:slot.start.toISOString(),timeMax:slot.end.toISOString(),items:[{id:calendarId}]}});
    if(overlaps(slot,busy(calendarId,availability)))return res.status(409).json({error:'This time is no longer available. Please choose another slot.'});
    const id=eventId(slot.start);
    const event=await calendar.events.insert({calendarId,requestBody:{
      id,summary:`Social Gear AI — ${name.trim()}`,
      description:`Booked via Social Gear AI\nName: ${name.trim()}\nEmail: ${email}\nCompany: ${company}\nNotes: ${notes}`,
      start:{dateTime:slot.start.toISOString(),timeZone:zone()},end:{dateTime:slot.end.toISOString(),timeZone:zone()},
      attendees:[{email}],conferenceData:{createRequest:{requestId:id,conferenceSolutionKey:{type:'hangoutsMeet'}}},
      reminders:{useDefault:true}
    },conferenceDataVersion:1,sendUpdates:'all'});
    return res.status(200).json({success:true,eventId:event.data.id,start:event.data.start.dateTime,end:event.data.end.dateTime,meetLink:event.data.hangoutLink||null,timeZone:zone()});
  }catch(err){
    if(Number(err.code)===409)return res.status(409).json({error:'This slot has already been reserved. Please select another time.'});
    console.error('Booking request failed:',err.code||'calendar_unavailable');
    return res.status(503).json({error:'We could not confirm your booking. Please contact us before trying again.'});
  }
};
