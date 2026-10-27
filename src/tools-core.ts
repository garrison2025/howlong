import { addDays, calendarEnd, dateEpoch, dateISO, daysInMonth, parseDate, wallTimes, zonedParts, type CivilDate, type Unit } from './core.js';

export function parseClock(value: string): {hour:number;minute:number;second:number} {
  const match=/^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value);
  if(!match)throw new Error('Enter a complete time, including hours and minutes.');
  const hour=Number(match[1]),minute=Number(match[2]),second=Number(match[3]??0);
  if(hour>23||minute>59||second>59)throw new Error('Enter a valid time from 00:00:00 to 23:59:59.');
  return {hour,minute,second};
}

/** Missing local hours are rejected; repeated hours require an explicit occurrence. */
export function dateTime(dateValue:string,timeValue:string,zone:string,occurrence='earlier'):number {
  const date=parseDate(dateValue),clock=parseClock(timeValue),resolved=wallTimes(date,clock.hour,clock.minute,zone);
  if(resolved.adjusted)throw new Error('This time does not exist in this time zone because the clock moves forward. Choose another time.');
  const epoch=(occurrence==='later'?resolved.instants.at(-1):resolved.instants[0])!+clock.second*1000;
  const parts=zonedParts(epoch,zone);
  if(dateISO(parts)!==dateValue||parts.hour!==clock.hour||parts.minute!==clock.minute||parts.second!==clock.second)throw new Error('This local time cannot be resolved exactly.');
  return epoch;
}

export function parseDuration(value:string):number {
  const text=value.trim().toLowerCase();
  if(!text)throw new Error('Enter a duration such as 1:45:00 or 1h 45m.');
  let seconds:number;
  const colon=/^(-?)(\d+):(\d{2})(?::(\d{2}(?:\.\d+)?))?$/.exec(text);
  if(colon){
    if(Number(colon[3])>59||Number(colon[4]??0)>=60)throw new Error('Minutes and seconds in H:MM:SS must be below 60.');
    seconds=(Number(colon[2])*3600+Number(colon[3])*60+Number(colon[4]??0))*(colon[1]?-1:1);
  }else{
    const units=/^(-?)\s*(?:(\d+(?:\.\d+)?)\s*h(?:ours?)?\s*)?(?:(\d+(?:\.\d+)?)\s*m(?:in(?:ute)?s?)?\s*)?(?:(\d+(?:\.\d+)?)\s*s(?:ec(?:ond)?s?)?\s*)?$/.exec(text);
    if(!units||!units.slice(2).some(Boolean))throw new Error('Use H:MM:SS, or units such as 1h 45m 30s.');
    seconds=(Number(units[2]??0)*3600+Number(units[3]??0)*60+Number(units[4]??0))*(units[1]?-1:1);
  }
  if(!Number.isFinite(seconds)||Math.abs(seconds)>1e12)throw new Error('Use a duration within ±1 trillion seconds.');
  return seconds;
}

export function durationText(seconds:number):string {
  const sign=seconds<0?'−':'';let value=Math.round(Math.abs(seconds)*1000)/1000;
  const hours=Math.floor(value/3600);value-=hours*3600;const minutes=Math.floor(value/60);value-=minutes*60;
  return `${sign}${hours}h ${minutes}m ${Number(value.toFixed(3))}s`;
}

export function clockInterval(start:string,end:string,nextDay:boolean):number {
  const a=parseClock(start),b=parseClock(end);
  return (b.hour-a.hour)*3600+(b.minute-a.minute)*60+b.second-a.second+(nextDay?86400:0);
}

export function businessBetween(start:CivilDate,end:CivilDate,options:{includeStart:boolean;includeEnd:boolean;weekend:number[];excluded:string[]}):{days:number;total:number;weekends:number;excluded:number;steps:{date:string;reason:string}[]} {
  const distance=Math.round((dateEpoch(end)-dateEpoch(start))/86400000),direction=distance<0?-1:1;
  if(Math.abs(distance)>80000)throw new Error('Use a date interval of at most 80,000 calendar days.');
  const exclusions=new Set(options.excluded.map(value=>dateISO(parseDate(value))));
  let days=0,total=0,weekends=0,excluded=0;const steps:{date:string;reason:string}[]=[];
  for(let i=0;i<=Math.abs(distance);i++){
    if((i===0&&!options.includeStart)||(i===Math.abs(distance)&&!options.includeEnd))continue;
    const date=addDays(start,i*direction),iso=dateISO(date),weekend=options.weekend.includes(new Date(dateEpoch(date)).getUTCDay());
    const reason=weekend?'Weekend':exclusions.has(iso)?'Excluded date':'Business day';
    total++;if(weekend)weekends++;else if(reason==='Excluded date')excluded++;else days++;
    if(steps.length<100)steps.push({date:iso,reason});
  }
  return {days:days*direction,total,weekends,excluded,steps};
}

export function federalHolidays(firstYear:number,lastYear:number):string[] {
  if(firstYear<2021||lastYear>2100)throw new Error('The optional US federal calendar covers 2021–2100. Choose custom exclusions for other years.');
  const result=new Set<string>();
  const observed=(year:number,month:number,day:number)=>{const date={year,month,day},weekday=new Date(dateEpoch(date)).getUTCDay();return dateISO(addDays(date,weekday===6?-1:weekday===0?1:0));};
  const nth=(year:number,month:number,weekday:number,n:number)=>{const first=new Date(Date.UTC(year,month-1,1)).getUTCDay();return dateISO({year,month,day:1+(weekday-first+7)%7+(n-1)*7});};
  for(let year=firstYear;year<=lastYear;year++){
    for(const [month,day]of [[1,1],[6,19],[7,4],[11,11],[12,25]])result.add(observed(year,month!,day!));
    for(const [month,weekday,n]of [[1,1,3],[2,1,3],[9,1,1],[10,1,2],[11,4,4]])result.add(nth(year,month!,weekday!,n!));
    const last={year,month:5,day:31};result.add(dateISO(addDays(last,-(new Date(dateEpoch(last)).getUTCDay()+6)%7)));
  }
  // The following New Year's Day may be observed on December 31 of the last year.
  const next=observed(lastYear+1,1,1);if(next.startsWith(String(lastYear)))result.add(next);
  return [...result].sort();
}

export function annualTarget(now:number,dateValue:string,time:string,zone:string,leap:'feb28'|'mar1',occurrence:string):number {
  const original=parseDate(dateValue),today=zonedParts(now,zone);
  for(let year=Math.max(today.year,original.year);year<=9999;year++){
    let month=original.month,day=original.day;
    if(month===2&&day===29&&daysInMonth(year,2)===28){month=leap==='mar1'?3:2;day=leap==='mar1'?1:28;}
    const candidate=dateISO({year,month,day});
    if(candidate<dateISO(today))continue;
    const epoch=dateTime(candidate,time,zone,occurrence);
    if(epoch>=now)return epoch;
  }
  throw new Error('No next occurrence within supported years.');
}

export function eventHref(epoch:number,zone:string,name='My countdown'):string {
  const p=zonedParts(epoch,zone),time=`${String(p.hour).padStart(2,'0')}:${String(p.minute).padStart(2,'0')}:${String(p.second).padStart(2,'0')}`;
  const later=dateTime(dateISO(p),time,zone,'earlier')!==Math.floor(epoch/1000)*1000;
  return '/countdown-to-date/#'+new URLSearchParams({settings:JSON.stringify({'event-date':dateISO(p),'event-time':time,'event-zone':zone,'event-name':name,'event-repeat':'none','event-occurrence':later?'later':'earlier'})});
}

export function calendarFile(epoch:number,name:string,stamp:number):string {
  const utc=(value:number)=>new Date(value).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
  if(!Number.isFinite(epoch)||new Date(epoch).getUTCFullYear()<100||new Date(epoch).getUTCFullYear()>9999)throw new Error('Choose a valid event date before exporting.');
  const escaped=name.replace(/\\/g,'\\\\').replace(/\r\n|\r|\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');
  const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Time Duration Calculator//Time tools//EN','BEGIN:VEVENT',`UID:${Math.floor(epoch)}-${Math.floor(stamp)}@timedurationcalculator.cc`, `DTSTAMP:${utc(stamp)}`,`DTSTART:${utc(epoch)}`,`SUMMARY:${escaped}`,'END:VEVENT','END:VCALENDAR'];
  return lines.map(line=>{let folded='',bytes=0;for(const character of line){const width=new TextEncoder().encode(character).length;if(bytes+width>75){folded+='\r\n ';bytes=1;}folded+=character;bytes+=width;}return folded;}).join('\r\n')+'\r\n';
}

export function normalizeSearch(value:string):string {
  return value.toLowerCase().replace(/(\d)(am|pm)\b/g,'$1 $2').replace(/\bmins?\b/g,'minutes').replace(/\bhrs?\b/g,'hours').replace(/\bsecs?\b/g,'seconds').replace(/[^a-z0-9]+/g,' ').trim();
}

export function dateShift(start:string,amount:number,unit:Unit):CivilDate { return calendarEnd(parseDate(start),amount,unit); }
