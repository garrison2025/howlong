import { addDays, addMonths, businessDays, calendarEnd, dateDifference, dateEpoch, dateISO, daysInMonth, durationParts, FIXED_UNITS, fixedSeconds, formatNumber, holidayTarget, nextClock, parseDate, prettyDate, zonedParts, type CivilDate, type Unit } from './core.js';

type PageConfig = { type: string; hour?: number; minute?: number; amount?: number; unit?: Unit; year?: number; holiday?: 'halloween'|'thanksgiving'; businessMin?: number; businessMax?: number; definition?: 'fortnight'|'century' };
const page = JSON.parse(document.getElementById('page-config')?.textContent ?? '{}') as PageConfig;
const deviceZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const localToday = () => dateISO(zonedParts(Date.now(),deviceZone));
function el<T extends HTMLElement = HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Required control ${id} is missing.`);
  return element as T;
}
const input = (id: string) => el<HTMLInputElement>(id);
const select = (id: string) => el<HTMLSelectElement>(id);
function message(text: string, error = false): void {
  const status = document.getElementById('tool-status');
  if (status) {status.textContent=text;status.classList.toggle('error',error);}
}
function protect(action: () => void): void {
  const panel=document.getElementById('result-panel');
  document.querySelectorAll('[aria-invalid="true"]').forEach(field=>{field.removeAttribute('aria-invalid');field.removeAttribute('aria-describedby');});
  const copy=document.getElementById('copy-result') as HTMLButtonElement|null;
  try { action(); panel?.removeAttribute('data-invalid'); document.getElementById('result-error')?.remove(); if(copy)copy.disabled=false; message(''); }
  catch (error) {
    const text=error instanceof Error?error.message:'Please check the values.';
    panel?.setAttribute('data-invalid','true');
    if(panel){let warning=document.getElementById('result-error');if(!warning){warning=document.createElement('p');warning.id='result-error';warning.className='result-error';panel.prepend(warning);}warning.textContent=text;}
    const summary=document.getElementById('result-summary');if(summary)summary.textContent='No result: '+text;
    if(copy)copy.disabled=true;
    const active=document.activeElement;
    const invalid=[...document.querySelectorAll<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>('.control-panel input:invalid,.control-panel select:invalid,.control-panel textarea:invalid')];
    if(!invalid.length&&(active instanceof HTMLInputElement||active instanceof HTMLSelectElement||active instanceof HTMLTextAreaElement)&&active.closest('.control-panel'))invalid.push(active);
    invalid.forEach(field=>{field.setAttribute('aria-invalid','true');field.setAttribute('aria-describedby','tool-status');});
    message(text,true);
  }
}
function store(key: string,value?: string): string|null { try {if(value!==undefined)localStorage.setItem(key,value);return localStorage.getItem(key);}catch{return null;} }
function number(id: string): number {
  const value=input(id).value.trim();
  if (!value) throw new Error('Enter a number before calculating.');
  const result=Number(value);
  if (!Number.isFinite(result)) throw new Error('Enter a valid finite number.');
  return result;
}
function tableRows(target: string, rows: string[][]): void {
  const body=el(target);
  if(body.children.length===rows.length&&[...body.children].every((row,i)=>row.children.length===rows[i]!.length)){
    rows.forEach((row,i)=>row.forEach((value,j)=>{const cell=body.children[i]!.children[j]!;if(cell.textContent!==value)cell.textContent=value;}));
    return;
  }
  el(target).replaceChildren(...rows.map(row=>{
    const tr=document.createElement('tr');
    row.forEach((value,i)=>{const td=document.createElement(i===0?'th':'td');td.textContent=value;if(i===0)td.setAttribute('scope','row');tr.append(td);});
    return tr;
  }));
}

const themeButton=document.getElementById('theme-toggle');
if(store('howlong-theme')==='dark')document.documentElement.dataset.theme='dark';
function syncTheme(): void {themeButton?.setAttribute('aria-pressed',String(document.documentElement.dataset.theme==='dark'));}
syncTheme();
themeButton?.addEventListener('click',()=>{const theme=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=theme;store('howlong-theme',theme);syncTheme();});
document.getElementById('menu-toggle')?.addEventListener('click',()=>{const open=el('main-nav').classList.toggle('open');el('menu-toggle').setAttribute('aria-expanded',String(open));});

const searchDialog=document.getElementById('search-dialog') as HTMLDialogElement|null;
const searchIndex=JSON.parse(document.getElementById('search-index')?.textContent??'[]') as {route:string;label:string;terms:string}[];
function searchTools(): void {
  const term=input('tool-search').value.toLowerCase().trim();
  const matches=searchIndex.filter(p=>(p.label+' '+p.terms).toLowerCase().includes(term)).slice(0,12);
  const list=el('search-results');list.replaceChildren();
  for(const p of matches){const li=document.createElement('li'),a=document.createElement('a');a.href=p.route;a.textContent=p.label;li.append(a);list.append(li);}
  el('search-count').textContent=matches.length?`${matches.length} tool${matches.length===1?'':'s'} shown`:'No matching tools. Try a time such as 3 PM, hours, or business days.';
}
function openSearch(): void {searchDialog?.showModal();searchTools();input('tool-search').focus();}
document.getElementById('open-search')?.addEventListener('click',openSearch);
document.getElementById('close-search')?.addEventListener('click',()=>searchDialog?.close());
document.getElementById('tool-search')?.addEventListener('input',searchTools);
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&searchDialog?.open){event.preventDefault();searchDialog.close();return;}
  if(event.key==='/'&&!(event.target instanceof HTMLInputElement)&&!(event.target instanceof HTMLTextAreaElement)&&!(event.target instanceof HTMLSelectElement)){event.preventDefault();openSearch();}
});
searchDialog?.addEventListener('click',event=>{if(event.target===searchDialog)searchDialog.close();});

document.querySelectorAll<HTMLInputElement>('input[data-today]').forEach(field=>field.value=localToday());
document.querySelectorAll<HTMLSelectElement>('select[data-time-zone]').forEach(field=>{
  const zones=[...new Set([deviceZone,'UTC','America/New_York','America/Chicago','America/Denver','America/Los_Angeles','Europe/London','Europe/Paris','Asia/Kolkata','Asia/Shanghai','Asia/Tokyo','Australia/Sydney',...Intl.supportedValuesOf('timeZone')])];
  field.replaceChildren(...zones.map(zone=>new Option(zone.replaceAll('_',' '),zone)));
  field.value=deviceZone;
});

async function copyText(text:string):Promise<void>{
  try{await navigator.clipboard.writeText(text);message('Copied to clipboard.');}
  catch{message('Clipboard access is unavailable. Select and copy the result text instead.',true);}
}
document.getElementById('copy-result')?.addEventListener('click',()=>{void copyText((document.getElementById('result-summary')?.textContent??'').trim());});
document.getElementById('fullscreen')?.addEventListener('click',async()=>{
  try{if(document.fullscreenElement)await document.exitFullscreen();else await el('result-panel').requestFullscreen();}
  catch{message('Full screen is not available in this browser.');}
});

if(page.type==='clock'||page.type==='ambiguous'||page.type==='holiday'||page.type==='home'){
  const isHoliday=page.type==='holiday';
  let audio:AudioContext|null=null, notifications=false, previousTarget:number|null=null, alertedTarget:number|null=null;
  let cachedKey='', cached:ReturnType<typeof nextClock>|null=null;
  const hash=new URLSearchParams(location.hash.slice(1));
  if(hash.get('time')&&/^\d{2}:\d{2}$/.test(hash.get('time')!))input('target-time').value=hash.get('time')!;
  if(hash.get('zone')&&[...select('time-zone').options].some(o=>o.value===hash.get('zone')))select('time-zone').value=hash.get('zone')!;
  if(hash.get('day')&&['next','today','tomorrow'].includes(hash.get('day')!))select('target-day').value=hash.get('day')!;
  const storedFormat=store('howlong-clock-format');if(storedFormat)select('clock-format').value=storedFormat;
  input('sound-alert').addEventListener('change',()=>{
    if(input('sound-alert').checked){try{audio??=new AudioContext();void audio.resume();}catch{input('sound-alert').checked=false;message('Sound is unavailable in this browser.');}}
  });
  document.getElementById('enable-notifications')?.addEventListener('click',async()=>{
    if(!('Notification' in window)){message('Notifications are not supported here.');return;}
    try{const permission=await Notification.requestPermission();notifications=permission==='granted';message(notifications?'Notifications enabled while this page stays open.':'Notifications were not enabled. The countdown will still work.');}catch{message('Notifications are unavailable in this browser.');}
  });
  function ring(target:number):void{
    if(alertedTarget===target)return;alertedTarget=target;
    if(input('sound-alert').checked&&audio){const oscillator=audio.createOscillator(),gain=audio.createGain();oscillator.connect(gain);gain.connect(audio.destination);oscillator.frequency.value=660;gain.gain.setValueAtTime(.12,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+1);oscillator.start();oscillator.stop(audio.currentTime+1);}
    if(notifications&&Notification.permission==='granted'){try{new Notification('Your countdown has finished',{body:document.title});}catch{/* Some mobile browsers require a service worker; the on-page result remains available. */}}
    message('The target time has arrived.');
  }
  function tick():void{
    try{
      const now=Date.now(),zone=select('time-zone').value;
      const parts=zonedParts(now,zone),today=dateISO(parts);
      const [hourString,minuteString]=input('target-time').value.split(':');
      const hour=Number(hourString),minute=Number(minuteString),day=select('target-day').value as 'next'|'today'|'tomorrow';
      if(!input('target-time').value)throw new Error('Choose a target time.');
      input('target-time').removeAttribute('aria-invalid');input('target-time').removeAttribute('aria-describedby');
      el<HTMLButtonElement>('copy-result').disabled=false;
      const key=`${zone}/${today}/${hour}/${minute}/${day}`;
      if(previousTarget!==null&&now>=previousTarget&&now-previousTarget<5000)ring(previousTarget);
      let epoch:number,adjusted:boolean,passed=false,targetDate:CivilDate;
      if(isHoliday){const result=holidayTarget(now,page.holiday!,zone);epoch=result.epoch;adjusted=result.adjusted;targetDate=result.date;}
      else{
        if(key!==cachedKey||!cached||(cached.epoch<now&&!cached.passed)){cached=nextClock(now,hour,minute,zone,day);cachedKey=key;}
        epoch=cached.epoch;adjusted=cached.adjusted;passed=cached.passed;targetDate=cached.date;
      }
      previousTarget=epoch;
      const left=durationParts(epoch-now),hours=left.days*24+left.hours;
      el('count-days').textContent=String(left.days).padStart(2,'0');
      el('count-hours').textContent=String(isHoliday?left.hours:hours).padStart(2,'0');
      el('count-minutes').textContent=String(left.minutes).padStart(2,'0');
      el('count-seconds').textContent=String(left.seconds).padStart(2,'0');
      const format=select('clock-format').value==='24'?'h23':'h12';
      const timeFormat=new Intl.DateTimeFormat('en-US',{timeZone:zone,hour:'numeric',minute:'2-digit',hourCycle:format});
      const targetLabel=isHoliday?(page.holiday==='halloween'?'Halloween':'US Thanksgiving'):timeFormat.format(epoch);
      el('target-label').textContent=targetLabel;
      el('clock-now').textContent=`${timeFormat.format(now)} · ${zone.replaceAll('_',' ')}`;
      const sameDate=dateISO(targetDate)===today;
      const dayLabel=sameDate?'Today · ':dateISO(targetDate)===dateISO(addDays(parts,1))?'Tomorrow · ':'';
      el('target-date').textContent=`${dayLabel}${prettyDate(targetDate)} · ${timeFormat.format(epoch)}`;
      const label=passed?'Today’s target has passed':adjusted?'Adjusted for a daylight-saving time gap':sameDate?'Counting down to today’s target':'Counting down to the next target';
      el('countdown-note').textContent=label;
      const summary=`${passed?'Today’s target has passed. ':''}${left.days?`${left.days} days, `:''}${isHoliday?left.hours:hours} hours, ${left.minutes} minutes, ${left.seconds} seconds until ${targetLabel}. ${prettyDate(targetDate)} in ${zone}.`;
      el('result-summary').textContent=summary;
      tableRows('countdown-units', [['Hours',formatNumber(Math.max(0,epoch-now)/3600000)],['Minutes',formatNumber(Math.max(0,epoch-now)/60000)],['Seconds',formatNumber(Math.max(0,epoch-now)/1000)]]);
      if(page.type==='ambiguous'){
        const base=hour%12,am=nextClock(now,base,minute,zone,day),pm=nextClock(now,base+12,minute,zone,day);
        for(const [id,result,period]of [['am-result',am,'AM'],['pm-result',pm,'PM']]as const){const d=durationParts(result.epoch-now);el(id).textContent=result.passed?'Today’s time has passed':`${d.days*24+d.hours}h ${d.minutes}m ${d.seconds}s`;const label=el(id).previousElementSibling;if(label)label.textContent=`${base||12}:${String(minute).padStart(2,'0')} ${period}`;}
      }
      const hand=document.getElementById('clock-hand');if(hand)hand.style.transform=`rotate(${(parts.hour%12)*30+parts.minute/2}deg)`;
      const minuteHand=document.querySelector<HTMLElement>('.dial-minute');if(minuteHand)minuteHand.style.transform=`rotate(${parts.minute*6}deg)`;
      const mini=document.getElementById('home-live-count');if(mini)mini.textContent=`${hours}h ${left.minutes}m ${left.seconds}s until ${targetLabel}`;
    }catch(error){
      previousTarget=null;cached=null;
      for(const id of ['count-days','count-hours','count-minutes','count-seconds'])el(id).textContent='—';
      el('countdown-note').textContent='No countdown: check your settings.';
      el<HTMLButtonElement>('copy-result').disabled=true;
      if(!input('target-time').value){input('target-time').setAttribute('aria-invalid','true');input('target-time').setAttribute('aria-describedby','tool-status');}
      el('result-summary').textContent='No result: check your countdown settings.';
      el('target-date').textContent='Choose valid settings';
      tableRows('countdown-units',[]);
      for(const id of ['am-result','pm-result','home-live-count']){const result=document.getElementById(id);if(result)result.textContent='—';}
      message(error instanceof Error?error.message:'Check your countdown settings.',true);
    }
  }
  function changed():void{cached=null;previousTarget=null;alertedTarget=null;message('');tick();}
  ['target-time','time-zone','target-day','clock-format'].forEach(id=>el(id).addEventListener('change',()=>{if(id==='clock-format')store('howlong-clock-format',select(id).value);changed();}));
  document.querySelectorAll<HTMLButtonElement>('[data-time]').forEach(button=>button.addEventListener('click',()=>{input('target-time').value=button.dataset.time!;changed();}));
  document.getElementById('switch-am-pm')?.addEventListener('click',()=>{const [h,m]=input('target-time').value.split(':');input('target-time').value=`${String((Number(h)+12)%24).padStart(2,'0')}:${m}`;changed();});
  document.getElementById('share-countdown')?.addEventListener('click',()=>{const url=new URL(location.href);url.hash=new URLSearchParams({time:input('target-time').value,zone:select('time-zone').value,day:select('target-day').value}).toString();void copyText(url.href);});
  tick();setInterval(()=>{if(!document.hidden)tick();},1000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)tick();});
}

if(page.type==='duration'||page.type==='converter'){
  function convert():void{
    const value=number('duration-value'),unit=select('duration-unit').value as Unit,mode=select('duration-mode').value;
    const calendar=mode==='calendar';el('calendar-fields').hidden=!calendar;
    const isMonth=unit==='months'||unit==='years';
    el<HTMLButtonElement>('add-from-now').disabled=isMonth;
    el('from-now-result').textContent=isMonth?'For months and years, use a start date in calendar mode above.':'';
    if(calendar){
      const start=parseDate(input('calendar-start').value),end=calendarEnd(start,value,unit);
      el('conversion-result').textContent=prettyDate(end);
      el('conversion-caption').textContent=`${formatNumber(value)} calendar ${unit} after ${prettyDate(start)}`;
      tableRows('conversion-units',[['Calendar days',formatNumber((dateEpoch(end)-dateEpoch(start))/86400000)],['End date',dateISO(end)],['Month-end rule','Clamp to the last valid day']]);
      el('result-summary').textContent=`${value} calendar ${unit} after ${dateISO(start)} is ${dateISO(end)}. Months preserve the day when possible, otherwise use month end.`;
    }else{
      if(isMonth&&mode!=='approximate')throw new Error('Choose calendar or approximate mode for months and years.');
      const seconds=isMonth?value*(unit==='years'?365.2425:365.2425/12)*86400:fixedSeconds(value,unit);
      if(!Number.isFinite(seconds)||Math.abs(value)>1e12)throw new Error('Use a finite number within ±1 trillion.');
      const preferred=unit==='seconds'?'minutes':unit==='minutes'?'hours':unit==='hours'?'days':unit==='days'?'weeks':unit==='weeks'?'days':'days';
      const result=seconds/FIXED_UNITS[preferred];
      el('conversion-result').textContent=`${formatNumber(result)} ${preferred}`;
      el('conversion-caption').textContent=`${mode==='approximate'?'Approximate units · ':''}${formatNumber(value)} ${unit}`;
      const rows=Object.entries(FIXED_UNITS).map(([name,factor])=>[name[0]!.toUpperCase()+name.slice(1),formatNumber(seconds/factor)]);
      if(mode==='approximate'){rows.push(['Months (average)',formatNumber(seconds/(365.2425/12*86400))],['Years (average)',formatNumber(seconds/(365.2425*86400))]);}
      tableRows('conversion-units',rows);
      el('result-summary').textContent=`${formatNumber(value)} ${unit} = ${formatNumber(result)} ${preferred}.${mode==='approximate'?' Approximate months use 365.2425 / 12 days; not a calendar date.':''}`;
    }
  }
  el('duration-unit').addEventListener('change',()=>{
    const u=select('duration-unit').value;
    if(u==='months'||u==='years')select('duration-mode').value='calendar';
    else if(select('duration-mode').value==='calendar'&&['seconds','minutes','hours'].includes(u))select('duration-mode').value='fixed';
    protect(convert);
  });
  ['duration-value','duration-mode','calendar-start'].forEach(id=>el(id).addEventListener('input',()=>protect(convert)));
  document.getElementById('add-from-now')?.addEventListener('click',()=>protect(()=>{
    const seconds=fixedSeconds(number('duration-value'),select('duration-unit').value as Unit);
    const start=Date.now(),end=start+seconds*1000;
    if(!Number.isFinite(end)||Math.abs(end)>8.64e15)throw new Error('This duration is outside the supported date range.');
    const formatter=new Intl.DateTimeFormat('en-US',{dateStyle:'full',timeStyle:'long'});
    el('from-now-result').textContent=`Starts ${formatter.format(start)}. Ends ${formatter.format(end)} (${deviceZone}). This adds elapsed time, not calendar days.`;
  }));
  protect(convert);
}

if(page.type==='business'){
  function calculateBusiness():void{
    const start=parseDate(input('business-start').value),count=number('business-count');
    const weekend={'sat-sun':[0,6],'fri-sat':[5,6],'sun':[0],'none':[]}[select('weekend-rule').value];
    if(!weekend)throw new Error('Choose a valid weekend rule.');
    const excluded=(el<HTMLTextAreaElement>('excluded-dates').value.trim().match(/[^\s,]+/g)??[]);
    const options={weekend,excluded,includeStart:input('include-start').checked};
    const first=businessDays(start,count,options),rawEnd=input('business-range-end').value.trim();
    let end=first;
    if(rawEnd){const second=Number(rawEnd);if(second<count)throw new Error('The range end must be at least the range start.');end=businessDays(start,second,options);}
    el('business-result').textContent=rawEnd?`${dateISO(first.end)} → ${dateISO(end.end)}`:prettyDate(first.end);
    el('business-caption').textContent=`${count}${rawEnd?`–${rawEnd}`:''} business days from ${prettyDate(start)}`;
    tableRows('business-steps',end.steps.slice(0,100).map(step=>[prettyDate(parseDate(step.date)),step.reason,step.counted?String(step.number):'Skipped']));
    el('business-step-note').textContent=end.steps.length>100?`Showing the first 100 of ${end.steps.length} calendar dates. The result includes every date.`:end.steps.length?'Every calendar date in this calculation is shown.':'Zero business days returns the start date.';
    el('result-summary').textContent=`${count}${rawEnd?`–${rawEnd}`:''} business days from ${dateISO(start)}: ${dateISO(first.end)}${rawEnd?` to ${dateISO(end.end)}`:''}. Start date ${options.includeStart?'included when eligible':'excluded'}. Public holidays are excluded only when entered above.`;
  }
  ['business-start','business-count','business-range-end','weekend-rule','excluded-dates','include-start'].forEach(id=>el(id).addEventListener('input',()=>protect(calculateBusiness)));
  protect(calculateBusiness);
}

if(page.type==='years'){
  function differenceText(date:CivilDate,reference:CivilDate):string{const d=dateDifference(date,reference);return `${d.years} year${d.years===1?'':'s'}, ${d.months} month${d.months===1?'':'s'}, ${d.days} day${d.days===1?'':'s'} ${d.future?'after':'before'} the reference date (${formatNumber(d.totalDays)} days)`;}
  function calculateYears():void{
    const year=number('year-value'),month=Number(select('month-value').value),reference=parseDate(input('reference-date').value),exact=input('exact-date').value;
    if(!Number.isInteger(year)||year<100||year>9999)throw new Error('Enter a whole year from 100 to 9999.');
    if(exact){const date=parseDate(exact);el('years-result').textContent=differenceText(date,reference);tableRows('years-details',[['Exact date',prettyDate(date)],['Reference date',prettyDate(reference)]]);}
    else{
      const first={year,month:month||1,day:1},last={year,month:month||12,day:daysInMonth(year,month||12)};
      el('years-result').textContent=`${year}${month?` · ${new Intl.DateTimeFormat('en-US',{month:'long',timeZone:'UTC'}).format(dateEpoch(first))}`:''}`;
      tableRows('years-details',[[prettyDate(first),differenceText(first,reference)],[prettyDate(last),differenceText(last,reference)],['Reference date',prettyDate(reference)]]);
    }
    el('result-summary').textContent=`${el('years-result').textContent}. ${el('years-details').textContent}. A year or month represents a date range unless an exact date is selected.`;
  }
  ['year-value','month-value','reference-date','exact-date'].forEach(id=>el(id).addEventListener('input',()=>protect(calculateYears)));
  protect(calculateYears);
}

if(page.type==='definition'){
  function calculateDefinition():void{
    const start=parseDate(input('definition-start').value),amount=number('definition-amount');
    if(!Number.isInteger(amount)||Math.abs(amount)>10000)throw new Error('Enter a whole number within ±10,000.');
    const end=page.definition==='fortnight'?addDays(start,amount*14):addMonths(start,amount*1200);
    el('definition-result').textContent=prettyDate(end);
    el('result-summary').textContent=`${amount} ${page.definition}${Math.abs(amount)!==1?'s':''} from ${dateISO(start)} is ${dateISO(end)} (${formatNumber((dateEpoch(end)-dateEpoch(start))/86400000)} calendar days).`;
    el('definition-caption').textContent=el('result-summary').textContent;
  }
  ['definition-start','definition-amount'].forEach(id=>el(id).addEventListener('input',()=>protect(calculateDefinition)));
  protect(calculateDefinition);
}

document.getElementById('copy-report')?.addEventListener('click',()=>void copyText(`HowLong feedback\nPage: ${location.origin}${location.pathname}\nTime zone: ${deviceZone}\nObserved result:\nExpected result:\nSteps to reproduce:\n`));
