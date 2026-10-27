import test from 'node:test';
import assert from 'node:assert/strict';
import { parseDate, dateISO } from '../dist/assets/core.js';
import { parseClock, parseDuration, durationText, clockInterval, dateTime, businessBetween, federalHolidays, annualTarget, eventHref, calendarFile, normalizeSearch, dateShift } from '../dist/assets/tools-core.js';

test('compound durations accept large hours, decimals and signed values but reject malformed inputs',()=>{
  assert.equal(parseDuration('27:15:30'),98130);
  assert.equal(parseDuration('1h 45m 30s'),6330);
  assert.equal(parseDuration('-1:30'),-5400);
  assert.equal(parseDuration('1.5 hours'),5400);
  assert.equal(durationText(-6330.5),'−1h 45m 30.5s');
  for(const input of ['', '1:60', '1:00:60', '1h garbage', 'Infinity', '999999999999h'])assert.throws(()=>parseDuration(input));
  assert.throws(()=>parseClock('24:00'));assert.throws(()=>parseClock('09:60'));
});
test('clock intervals preserve order and explicitly apply next-day rollover',()=>{
  assert.equal(clockInterval('23:30','01:15',false),-80100);
  assert.equal(clockInterval('23:30','01:15',true),6300);
  assert.equal(clockInterval('09:00:01','09:00:02',false),1);
});
test('dated moments reject skipped DST hours and distinguish repeated-hour endpoints',()=>{
  assert.throws(()=>dateTime('2026-03-08','02:30','America/New_York'),/does not exist/);
  const a=dateTime('2026-11-01','01:30:15','America/New_York','earlier');
  const b=dateTime('2026-11-01','01:30:15','America/New_York','later');
  assert.equal(b-a,3600000);
  assert.equal(dateTime('2026-03-08','03:30','America/New_York')-dateTime('2026-03-08','01:30','America/New_York'),3600000);
  assert.equal(dateTime('2026-10-27','09:00','Asia/Kolkata'),Date.UTC(2026,9,27,3,30));
});
test('business intervals handle endpoint options, reversed order and exclusions without double counting',()=>{
  const opts={includeStart:false,includeEnd:true,weekend:[0,6],excluded:['2026-07-03']};
  const result=businessBetween(parseDate('2026-07-02'),parseDate('2026-07-06'),opts);
  assert.equal(result.days,1);assert.equal(result.weekends,2);assert.equal(result.excluded,1);
  assert.equal(businessBetween(parseDate('2026-07-06'),parseDate('2026-07-02'),opts).days,-1);
  for(const includeStart of [true,false])for(const includeEnd of [true,false])assert.equal(businessBetween(parseDate('2026-07-02'),parseDate('2026-07-02'),{...opts,includeStart,includeEnd}).days,Number(includeStart&&includeEnd));
});
test('US standard federal observances include all 2026 holidays and adjacent New Year observance',()=>{
  const dates=federalHolidays(2026,2026);
  assert.deepEqual(dates,['2026-01-01','2026-01-19','2026-02-16','2026-05-25','2026-06-19','2026-07-03','2026-09-07','2026-10-12','2026-11-11','2026-11-26','2026-12-25']);
  assert(federalHolidays(2021,2021).includes('2021-12-31'));
  assert.throws(()=>federalHolidays(2020,2026));assert.throws(()=>federalHolidays(2026,2101));
});
test('annual dates apply explicit February 29 policy and advance after reaching the occurrence',()=>{
  const now=Date.UTC(2025,0,1);
  assert.equal(annualTarget(now,'2024-02-29','09:00','UTC','feb28','earlier'),Date.UTC(2025,1,28,9));
  assert.equal(annualTarget(now,'2024-02-29','09:00','UTC','mar1','earlier'),Date.UTC(2025,2,1,9));
  assert.equal(annualTarget(Date.UTC(2025,2,2),'2024-02-29','09:00','UTC','mar1','earlier'),Date.UTC(2026,2,1,9));
  assert.equal(annualTarget(Date.UTC(2026,9,27),'2025-03-08','02:30','America/New_York','feb28','earlier'),dateTime('2027-03-08','02:30','America/New_York'));
  assert.equal(dateISO(dateShift('2024-01-31',1,'months')),'2024-02-29');
  assert.throws(()=>dateShift('9999-12-31',1,'days'));
});
test('shared event fixes the exact repeated-hour instant and calendar export escapes and folds text',()=>{
  const epoch=dateTime('2026-11-01','01:30:45','America/New_York','later');
  const href=eventHref(epoch,'America/New_York','Meeting');
  const settings=JSON.parse(new URLSearchParams(href.split('#')[1]).get('settings'));
  assert.equal(settings['event-occurrence'],'later');assert.equal(settings['event-repeat'],'none');
  assert.equal(dateTime(settings['event-date'],settings['event-time'],settings['event-zone'],settings['event-occurrence']),epoch);
  const file=calendarFile(epoch,'Review, plan; next\n'+'生日'.repeat(40),Date.UTC(2026,0,1));
  assert(file.includes('DTSTART:20261101T063045Z\r\n'));
  assert(file.includes('SUMMARY:Review\\, plan\\; next\\n'));
  for(const line of file.split('\r\n'))assert(Buffer.byteLength(line)<=75);
  assert(file.endsWith('END:VCALENDAR\r\n'));
});
test('search normalizes common duration abbreviations and clock spelling',()=>{
  assert.equal(normalizeSearch('90 min'),'90 minutes');
  assert.equal(normalizeSearch('3pm'),'3 pm');
  assert.equal(normalizeSearch('2 hrs 30 secs'),'2 hours 30 seconds');
});
