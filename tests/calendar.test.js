const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const utils=require('../lib/calendar-utils');
process.env.CALENDAR_TIMEZONE='America/New_York';
const now=new Date('2026-11-08T12:00:00Z');
test('calendar times honor daylight saving independent of server timezone',()=>{
 assert.equal(utils.localInstant('2026-11-09',9,0).toISOString(),'2026-11-09T14:00:00.000Z');
 assert.equal(utils.localInstant('2027-07-05',9,0).toISOString(),'2027-07-05T13:00:00.000Z');
 assert.equal(utils.localInstant('2027-03-15',9,30,'America/Los_Angeles').toISOString(),'2027-03-15T16:30:00.000Z');
});
test('reject invalid, past, weekend, off-hours and unaligned slots',()=>{
 for(const [date,time] of [['2026-11-08','9:00 AM'],['2026-11-07','9:00 AM'],['2026-11-31','9:00 AM'],['2026-11-09','4:00 PM'],['2026-11-09','9:15 AM'],['2026-11-09','13:00 AM'],['bad','9:00 AM'],['2028-11-09','9:00 AM']])assert.equal(utils.parseSlot(date,time,now),null,`${date} ${time}`);
 assert.equal(utils.parseSlot('2026-11-09','9:30 AM',now).end.toISOString(),'2026-11-09T15:00:00.000Z');
 assert.equal(utils.parseSlot('2026-11-09','9:00 AM',new Date('2026-11-09T13:30Z')),null);
});
test('overlap catches all-day events and permits adjacent appointments',()=>{
 const slot=utils.parseSlot('2026-11-09','9:00 AM',now);
 assert.equal(utils.overlaps(slot,[{start:new Date('2026-11-09T05:00Z'),end:new Date('2026-11-10T05:00Z')}]),true);
 assert.equal(utils.overlaps(slot,[{start:slot.end,end:new Date(+slot.end+1800000)}]),false);
 assert.throws(()=>utils.busy('main',{data:{calendars:{main:{errors:[{reason:'notFound'}]}}}}));
});
function handler(file,calendar){
 const sandbox={module:{exports:{}},require:()=>({...utils,calendarClient:()=>calendar}),process:{env:{GOOGLE_CALENDAR_ID:'main'}},console:{error:()=>{}}};
 vm.runInNewContext(fs.readFileSync(require.resolve(file),'utf8'),sandbox);return sandbox.module.exports;
}
function response(){return {statusCode:200,setHeader(){},status(n){this.statusCode=n;return this;},json(data){this.data=data;return this;}};}
function future(){let d=new Date(Date.now()+3*86400000);while([0,6].includes(d.getUTCDay()))d=new Date(+d+86400000);return d.toISOString().slice(0,10);}
const valid=()=>({name:'Test User',email:'test@example.com',date:future(),time:'9:00 AM'});
test('booking validates input before touching calendar',async()=>{
 let calls=0;const book=handler('../api/book.js',{freebusy:{query:()=>{calls++;throw Error();}}});
 for(const body of [undefined,{}, {...valid(),email:'invalid'}, {...valid(),name:' '},{...valid(),notes:'a'.repeat(4001)}]){
  const res=response();await book({method:'POST',body},res);assert.equal(res.statusCode,400);
 }
 assert.equal(calls,0);
});
test('busy or failed calendars never return booking success',async()=>{
 for(const fail of [false,true]){
 const calendar={freebusy:{query:async()=>{if(fail)throw Error();return {data:{calendars:{main:{busy:[{start:'2020-01-01',end:'2090-01-01'}]}}}};}}};
 const res=response();await handler('../api/book.js',calendar)({method:'POST',body:valid()},res);assert.equal(res.statusCode,fail?503:409);assert.notEqual(res.data.success,true);
 }
});
test('confirmed booking uses explicit instants and a stable duplicate-resistant id',async()=>{
 let inserted;
 const calendar={freebusy:{query:async()=>({data:{calendars:{main:{busy:[]}}}})},events:{insert:async input=>{inserted=input;return {data:{id:input.requestBody.id,start:input.requestBody.start,end:input.requestBody.end}};}}};
 const res=response(),body=valid();await handler('../api/book.js',calendar)({method:'POST',body},res);
 assert.equal(res.statusCode,200);assert.equal(res.data.success,true);
 assert.equal(inserted.requestBody.id,utils.eventId(utils.parseSlot(body.date,body.time).start));
 assert.equal(inserted.requestBody.start.timeZone,'America/New_York');assert.equal(inserted.sendUpdates,'all');
});
test('calendar insert conflicts and failures are errors, not confirmations',async()=>{
 for(const code of [409,500]){
 const calendar={freebusy:{query:async()=>({data:{calendars:{main:{busy:[]}}}})},events:{insert:async()=>{throw Object.assign(Error(),{code});}}};
 const res=response();await handler('../api/book.js',calendar)({method:'POST',body:valid()},res);assert.equal(res.statusCode,code===409?409:503);assert.notEqual(res.data.success,true);
 }
});
test('availability reports host timezone and excludes busy days',async()=>{
 const date=future(),[year,month]=date.split('-');
 const calendar={freebusy:{query:async()=>({data:{calendars:{main:{busy:[{start:date+'T00:00:00Z',end:date+'T23:59:59Z'}]}}}})}};
 const res=response();await handler('../api/availability.js',calendar)({method:'GET',query:{year,month}},res);
 assert.equal(res.statusCode,200);assert.equal(res.data.timeZone,'America/New_York');assert.equal(res.data.available[date],undefined);
});
