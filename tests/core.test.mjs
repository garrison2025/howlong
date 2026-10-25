import test from 'node:test';
import assert from 'node:assert/strict';
import {addDays,addMonths,businessDays,calendarEnd,dateDifference,dateISO,durationParts,fixedSeconds,holidayTarget,nextClock,parseDate,thanksgiving,wallTimes,zonedParts} from '../dist/assets/core.js';
const d=parseDate;
test('strict dates reject invalid dates, empty inputs and impossible leap days',()=>{
  for(const value of ['', '2026-2-01','2026-02-29','2024-04-31','2024-00-01','0000-01-01','10000-01-01'])assert.throws(()=>d(value));
  assert.equal(dateISO(d('2024-02-29')),'2024-02-29');
});
test('month end clamps for leap years and ordinary years',()=>{
  assert.equal(dateISO(addMonths(d('2024-01-31'),1)),'2024-02-29');
  assert.equal(dateISO(addMonths(d('2025-01-31'),1)),'2025-02-28');
  assert.equal(dateISO(addMonths(d('2024-03-31'),-1)),'2024-02-29');
  assert.equal(dateISO(addMonths(d('2024-02-29'),12)),'2025-02-28');
});
test('calendar operations cross year boundaries without UTC/local drift',()=>{
  assert.equal(dateISO(addDays(d('2026-12-31'),1)),'2027-01-01');
  assert.equal(dateISO(addDays(d('2024-03-01'),-1)),'2024-02-29');
  assert.equal(dateISO(calendarEnd(d('2026-01-31'),50,'months')),'2030-03-31');
  assert.throws(()=>calendarEnd(d('2026-01-01'),1.2,'months'));
  assert.throws(()=>addDays(d('9999-12-31'),1));
});
test('countdown ordinary today, next day, and passed today',()=>{
  const now=Date.parse('2026-10-23T14:00:00Z');
  assert.equal(nextClock(now,15,0,'UTC').epoch-now,3600000);
  const after=Date.parse('2026-10-23T16:00:00Z');
  assert.equal(nextClock(after,15,0,'UTC').epoch-after,23*3600000);
  assert.equal(nextClock(after,15,0,'UTC','today').passed,true);
  assert.equal(nextClock(now,15,0,'UTC','tomorrow').epoch-now,25*3600000);
});
test('New York spring gap advances a missing wall time by the gap',()=>{
  const result=wallTimes(d('2026-03-08'),2,30,'America/New_York');
  assert.equal(result.adjusted,true);
  assert.deepEqual(result.instants,[Date.parse('2026-03-08T07:30:00Z')]);
  assert.equal(zonedParts(result.instants[0],'America/New_York').hour,3);
});
test('New York fall repeated hour retains both instants and chooses next future one',()=>{
  const result=wallTimes(d('2026-11-01'),1,30,'America/New_York');
  assert.deepEqual(result.instants,[Date.parse('2026-11-01T05:30:00Z'),Date.parse('2026-11-01T06:30:00Z')]);
  assert.equal(nextClock(Date.parse('2026-11-01T05:45:00Z'),1,30,'America/New_York').epoch,Date.parse('2026-11-01T06:30:00Z'));
});
test('a calendar day across DST is 23 or 25 elapsed hours',()=>{
  const spring=nextClock(Date.parse('2026-03-07T20:00:00Z'),15,0,'America/New_York','tomorrow');
  assert.equal(spring.epoch-Date.parse('2026-03-07T20:00:00Z'),23*3600000);
  const fall=nextClock(Date.parse('2026-10-31T19:00:00Z'),15,0,'America/New_York','tomorrow');
  assert.equal(fall.epoch-Date.parse('2026-10-31T19:00:00Z'),25*3600000);
});
test('Los Angeles DST and half-hour time zones resolve correctly',()=>{
  assert.deepEqual(wallTimes(d('2026-11-01'),1,30,'America/Los_Angeles').instants,[Date.parse('2026-11-01T08:30:00Z'),Date.parse('2026-11-01T09:30:00Z')]);
  assert.equal(wallTimes(d('2026-01-01'),15,0,'Asia/Kolkata').instants[0],Date.parse('2026-01-01T09:30:00Z'));
  assert.throws(()=>nextClock(Date.now(),25,0,'UTC'));
  assert.throws(()=>nextClock(Date.now(),15,0,'No/Such_Zone'));
});
test('72 elapsed hours remain 259200 seconds even over a DST transition',()=>{
  assert.equal(fixedSeconds(72,'hours'),259200);
  assert.equal(fixedSeconds(90,'minutes'),5400);
  assert.equal(fixedSeconds(90,'seconds'),90);
  assert.equal(fixedSeconds(1.5,'hours'),5400);
  assert.equal(fixedSeconds(-1,'days'),-86400);
  assert.throws(()=>fixedSeconds(NaN,'hours'));
  assert.throws(()=>fixedSeconds(Infinity,'hours'));
  assert.throws(()=>fixedSeconds(2,'months'));
});
test('countdown rounding never produces negative numbers',()=>{
  assert.deepEqual(durationParts(-1000),{days:0,hours:0,minutes:0,seconds:0});
  assert.deepEqual(durationParts(86401000),{days:1,hours:0,minutes:0,seconds:1});
  assert.equal(durationParts(1).seconds,1);
});
test('Friday plus three business days excludes weekend and start by default',()=>{
  const result=businessDays(d('2026-10-23'),3);
  assert.equal(dateISO(result.end),'2026-10-28');
  assert.deepEqual(result.steps.map(x=>x.counted),[false,false,true,true,true]);
});
test('business-day custom exclusions and included start date',()=>{
  assert.equal(dateISO(businessDays(d('2026-10-23'),3,{excluded:['2026-10-26']}).end),'2026-10-29');
  assert.equal(dateISO(businessDays(d('2026-10-23'),3,{includeStart:true}).end),'2026-10-27');
  assert.equal(dateISO(businessDays(d('2026-10-24'),1,{includeStart:true}).end),'2026-10-26');
});
test('business-day backwards, zero, alternative weekends and cross-year exclusions',()=>{
  assert.equal(dateISO(businessDays(d('2026-10-26'),-1).end),'2026-10-23');
  assert.equal(dateISO(businessDays(d('2026-10-24'),0).end),'2026-10-24');
  assert.equal(dateISO(businessDays(d('2026-10-22'),1,{weekend:[5,6]}).end),'2026-10-25');
  assert.equal(dateISO(businessDays(d('2026-12-31'),1,{excluded:['2027-01-01']}).end),'2027-01-04');
  assert.equal(dateISO(businessDays(d('2024-02-28'),1).end),'2024-02-29');
  assert.throws(()=>businessDays(d('2026-01-01'),1.2));
  assert.throws(()=>businessDays(d('2026-01-01'),10001));
  assert.throws(()=>businessDays(d('2026-01-01'),1,{weekend:[0,1,2,3,4,5,6]}));
  assert.throws(()=>businessDays(d('2026-01-01'),1,{excluded:['2026-02-30']}));
});
test('date difference clamps month ends and labels future dates',()=>{
  assert.deepEqual(dateDifference(d('2024-01-31'),d('2024-03-01')),{years:0,months:1,days:1,totalDays:30,future:false});
  assert.deepEqual(dateDifference(d('2018-01-01'),d('2026-10-25')),{years:8,months:9,days:24,totalDays:3219,future:false});
  assert.equal(dateDifference(d('2027-01-01'),d('2026-01-01')).future,true);
  assert.equal(dateDifference(d('2026-01-01'),d('2026-01-01')).totalDays,0);
});
test('Thanksgiving is the fourth Thursday, not a fixed day or Canadian holiday',()=>{
  assert.equal(dateISO(thanksgiving(2026)),'2026-11-26');
  assert.equal(dateISO(thanksgiving(2027)),'2027-11-25');
  const result=holidayTarget(Date.parse('2026-11-27T12:00:00Z'),'thanksgiving','America/New_York');
  assert.equal(dateISO(result.date),'2027-11-25');
});
test('Halloween rolls after midnight of the defined target date',()=>{
  const before=holidayTarget(Date.parse('2026-10-30T12:00:00Z'),'halloween','UTC');
  assert.equal(dateISO(before.date),'2026-10-31');
  const after=holidayTarget(Date.parse('2026-10-31T01:00:00Z'),'halloween','UTC');
  assert.equal(dateISO(after.date),'2027-10-31');
});
test('century lengths reflect the Gregorian leap-year exception',()=>{
  assert.equal(dateDifference(d('2000-01-01'),d('2100-01-01')).totalDays,36525);
  assert.equal(dateDifference(d('1900-01-01'),d('2000-01-01')).totalDays,36524);
});
