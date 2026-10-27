import { addDays, dateDifference, dateEpoch, dateISO, durationParts, formatNumber, parseDate, prettyDate, zonedParts, type ClockParts, type Unit } from './core.js';
import { annualTarget, calendarFile, clockInterval, dateShift, dateTime, durationText, eventHref, parseClock, parseDuration } from './tools-core.js';

type Helpers={protect:(action:()=>void)=>void;message:(text:string,error?:boolean)=>void;copyText:(text:string)=>Promise<void>;tableRows:(id:string,rows:string[][])=>void};
const field=(id:string)=>document.getElementById(id) as HTMLInputElement;
const value=(id:string)=>field(id).value;
const checked=(id:string)=>field(id).checked;
const text=(id:string,content:string)=>{document.getElementById(id)!.textContent=content;};
const show=(id:string,visible:boolean)=>{document.getElementById(id)!.hidden=!visible;};
const timeText=(p:ClockParts)=>`${String(p.hour).padStart(2,'0')}:${String(p.minute).padStart(2,'0')}:${String(p.second).padStart(2,'0')}`;
const formatted=(epoch:number,zone:string)=>new Intl.DateTimeFormat('en-US',{dateStyle:'medium',timeStyle:'long',timeZone:zone}).format(epoch);

export function soundControls():{play:()=>void;stop:()=>void} {
  let audio:AudioContext|null=null,tone:OscillatorNode|null=null;
  const stop=()=>{try{tone?.stop();}catch{/* It may already have ended. */}tone=null;};
  const play=(test=false)=>{
    if(!test&&!checked('sound-alert'))return;
    try{audio??=new AudioContext();void audio.resume();stop();tone=audio.createOscillator();const gain=audio.createGain();tone.connect(gain);gain.connect(audio.destination);tone.frequency.value=660;gain.gain.setValueAtTime(.12,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+1);tone.start();tone.stop(audio.currentTime+1);}catch{const status=document.getElementById('tool-status');if(status)status.textContent='Sound is unavailable in this browser.';}
  };
  field('sound-alert').addEventListener('change',()=>{if(checked('sound-alert')){try{audio??=new AudioContext();void audio.resume();}catch{field('sound-alert').checked=false;}}});
  document.getElementById('sound-test')?.addEventListener('click',()=>play(true));
  document.getElementById('sound-stop')?.addEventListener('click',stop);
  return {play:()=>play(),stop};
}

export function mountTools(type:string,h:Helpers):void {
  const panel=document.querySelector('.control-panel');
  const controls=()=>[...document.querySelectorAll<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>('.control-panel input,.control-panel select,.control-panel textarea')];
  const getSettings=()=>Object.fromEntries(controls().map(control=>[control.id,control instanceof HTMLInputElement&&control.type==='checkbox'?control.checked:control.value]));
  const restore=(settings:unknown)=>{
    if(!settings||typeof settings!=='object'||Array.isArray(settings))throw new Error('This settings link is invalid.');
    for(const control of controls()){
      if(!Object.hasOwn(settings,control.id))continue;
      const saved=(settings as Record<string,unknown>)[control.id];
      if(control instanceof HTMLInputElement&&control.type==='checkbox'){if(typeof saved==='boolean')control.checked=saved;}
      else if(typeof saved==='string'&&saved.length<=5000){if(control instanceof HTMLSelectElement&&!Array.from(control.options).some(option=>option.value===saved))continue;control.value=saved;}
    }
  };
  const restoreHash=()=>{
    const raw=new URLSearchParams(location.hash.slice(1)).get('settings');
    if(!raw)return false;
    try{if(raw.length>20000)throw new Error('This settings link is too long.');restore(JSON.parse(raw));return true;}catch{h.message('The shared settings could not be loaded. Current inputs are unchanged.',true);return false;}
  };
  const restored=restoreHash();

  let resultEpoch:number|null=null,eventTarget:number|null=null,notify=false,alerted:number|null=null;
  const eventZone=()=>type==='event'?value('event-zone'):Intl.DateTimeFormat().resolvedOptions().timeZone;
  const setResult=(answer:string,caption:string,rows:string[][],note='')=>{text('tool-result',answer);text('tool-caption',caption);text('tool-note',note);h.tableRows('tool-details',rows);text('result-summary',`${caption}. ${answer}. ${rows.map(row=>row.join(': ')).join('. ')}. ${note}`);};
  const number=(id:string)=>{const raw=value(id).trim();if(!raw||!Number.isFinite(Number(raw)))throw new Error('Enter a valid number.');return Number(raw);};
  const validate=()=>{for(const control of controls())if(!control.disabled&&!control.closest('[hidden]')&&!control.checkValidity())throw new Error('Complete the highlighted fields with valid values.');};
  const linkResult=()=>{const link=document.getElementById('tool-event-link') as HTMLAnchorElement|null;if(link){link.hidden=resultEpoch===null;if(resultEpoch!==null)link.href=eventHref(resultEpoch,eventZone());}};
  const update=()=>{
    resultEpoch=null;linkResult();if(type==='event')eventTarget=null;
    h.protect(()=>{
      if(type==='interval'){show('interval-date-fields',value('interval-mode')==='dates');show('interval-next-field',value('interval-mode')!=='dates');}
      if(type==='dates'){show('date-difference-fields',value('date-mode')!=='shift');show('date-shift-fields',value('date-mode')==='shift');}
      if(type==='arithmetic'){show('arithmetic-clock-field',value('arithmetic-mode')==='clock');show('arithmetic-duration-field',value('arithmetic-mode')!=='clock');}
      validate();
      if(type==='interval'){
        const dated=value('interval-mode')==='dates';show('interval-date-fields',dated);show('interval-next-field',!dated);
        const start=value('interval-start'),end=value('interval-end');
        let raw:number,wall:number;
        if(dated){
          const zone=value('interval-zone'),a=dateTime(value('interval-start-date'),start,zone,value('interval-start-occurrence')),b=dateTime(value('interval-end-date'),end,zone,value('interval-end-occurrence'));
          raw=(b-a)/1000;wall=(dateEpoch(parseDate(value('interval-end-date')))-dateEpoch(parseDate(value('interval-start-date'))))/1000+clockInterval(start,end,false);resultEpoch=b;
        }else{raw=clockInterval(start,end,checked('interval-next'));wall=raw;}
        const rest=number('interval-break')*60;if(rest<0||rest>Math.abs(raw))throw new Error('Break time must be nonnegative and cannot exceed the elapsed interval.');
        const net=Math.sign(raw)*(Math.abs(raw)-rest);
        setResult(durationText(net),'Time between your selected endpoints',[["Elapsed before break",durationText(raw)],['Break deducted',durationText(rest)],['Total hours',formatNumber(net/3600)],['Total minutes',formatNumber(net/60)],['Total seconds',formatNumber(net)],['Clock-face difference before break',durationText(wall)]],dated?'Actual elapsed time uses the selected time zone; clock-face time may differ at a clock change.':checked('interval-next')?'The end time is on the next day.':'Both clock times are on the same day; negative results preserve the input order.');
      }else if(type==='dates'){
        const shift=value('date-mode')==='shift';show('date-difference-fields',!shift);show('date-shift-fields',shift);
        const start=parseDate(value('date-start'));
        if(shift){const end=dateShift(value('date-start'),number('date-amount'),value('date-unit') as Unit);setResult(prettyDate(end),`${value('date-amount')} calendar ${value('date-unit')} from ${dateISO(start)}`,[['Result date',dateISO(end)],['Calendar day change',String((dateEpoch(end)-dateEpoch(start))/86400000)]],'Months clamp to month end when needed.');}
        else{const end=parseDate(value('date-end')),distance=Math.round((dateEpoch(end)-dateEpoch(start))/86400000),count=Math.max(0,Math.abs(distance)+1-Number(!checked('date-include-start'))-Number(!checked('date-include-end')))*(distance<0?-1:1),parts=dateDifference(start,end);
          setResult(`${formatNumber(count)} calendar days`,`${dateISO(start)} to ${dateISO(end)}`,[['Calendar difference (unsigned)',`${parts.years} years, ${parts.months} months, ${parts.days} days`],['Start date included',checked('date-include-start')?'Yes':'No'],['End date included',checked('date-include-end')?'Yes':'No']],'The signed day count applies the endpoint options; the calendar difference is shown separately.');}
      }else if(type==='arithmetic'){
        const clock=value('arithmetic-mode')==='clock';show('arithmetic-clock-field',clock);show('arithmetic-duration-field',!clock);
        const sign=value('arithmetic-operation')==='subtract'?-1:1,delta=parseDuration(value('arithmetic-b'))*sign;
        let total=delta;
        if(clock){const start=parseClock(value('arithmetic-clock'));total+=start.hour*3600+start.minute*60+start.second;const days=Math.floor(total/86400),seconds=((total%86400)+86400)%86400;
          const shown=`${String(Math.floor(seconds/3600)).padStart(2,'0')}:${String(Math.floor(seconds/60)%60).padStart(2,'0')}:${(seconds%60<10?'0':'')+String(Number((seconds%60).toFixed(3)))}`;
          setResult(shown,'Fixed clock arithmetic',[['Day change',days===0?'Same day':days===1?'Next day':days===-1?'Previous day':`${days>0?'+':''}${days} days`],['Duration applied',durationText(delta)]],'A fixed 24-hour clock calculation; no time-zone or DST adjustment.');
        }else{total+=parseDuration(value('arithmetic-a'));if(Math.abs(total)>1e12)throw new Error('The result exceeds ±1 trillion seconds.');setResult(durationText(total),'Duration calculation',[['Decimal hours',formatNumber(total/3600)],['Total minutes',formatNumber(total/60)],['Total seconds',formatNumber(total)]]);}
      }else if(type==='zones'){
        const source=value('zone-source'),target=value('zone-target'),epoch=dateTime(value('zone-date'),value('zone-time'),source,value('zone-occurrence')),p=zonedParts(epoch,target);parseDate(dateISO(p));resultEpoch=epoch;
        const offset=(zone:string)=>new Intl.DateTimeFormat('en-US',{timeZone:zone,timeZoneName:'longOffset'}).formatToParts(epoch).find(part=>part.type==='timeZoneName')!.value.replace('GMT','UTC');
        const dayChange=Math.round((dateEpoch(p)-dateEpoch(parseDate(value('zone-date'))))/86400000);
        setResult(`${dateISO(p)} · ${timeText(p)}`,target,[['Source',formatted(epoch,source)],['Source UTC offset',offset(source)],['Target UTC offset',offset(target)],['Day change',dayChange===0?'Same calendar date':`${dayChange>0?'+':''}${dayChange} calendar day(s)`]],'Offsets come from browser time-zone data for the selected date.');
      }else if(type==='event'){
        show('event-leap-field',value('event-repeat')==='yearly');
        eventTarget=value('event-repeat')==='yearly'?annualTarget(Date.now(),value('event-date'),value('event-time'),value('event-zone'),value('event-leap') as 'feb28'|'mar1',value('event-occurrence')):dateTime(value('event-date'),value('event-time'),value('event-zone'),value('event-occurrence'));
        resultEpoch=eventTarget;drawEvent();
      }
      linkResult();
    });
  };
  const sound=type==='event'?soundControls():null;
  function drawEvent():void {
    if(eventTarget===null)return;
    const now=Date.now(),remaining=eventTarget-now,name=value('event-name').trim()||'My event';
    const elapsed=value('event-after')==='elapsed',parts=durationParts(Math.abs(remaining));
    setResult(remaining<=0&&!elapsed?'Completed':`${parts.days}d ${parts.hours}h ${parts.minutes}m ${parts.seconds}s`,`${name} · ${formatted(eventTarget,value('event-zone'))}`,[['Target time zone',value('event-zone')],['State',remaining>0?'Time remaining':elapsed?'Time since target':'Target reached']],'Uses your device clock. Yearly events move to the next occurrence after reaching their target.');
    if(remaining<=0&&alerted!==eventTarget){alerted=eventTarget;sound?.play();if(notify&&Notification.permission==='granted')try{new Notification('Your countdown has finished',{body:name});}catch{/* Browser support varies. */}}
    if(remaining<=0&&value('event-repeat')==='yearly'){eventTarget=annualTarget(now+1000,value('event-date'),value('event-time'),value('event-zone'),value('event-leap') as 'feb28'|'mar1',value('event-occurrence'));resultEpoch=eventTarget;}
  }

  if(['interval','event','dates','arithmetic','zones'].includes(type)){
    panel?.addEventListener('input',update);
    panel?.addEventListener('change',update);
    if(type==='interval')document.getElementById('interval-swap')!.addEventListener('click',()=>{for(const [a,b]of [['interval-start','interval-end'],['interval-start-date','interval-end-date'],['interval-start-occurrence','interval-end-occurrence']]){const original=value(a!);field(a!).value=value(b!);field(b!).value=original;}update();});
    if(type==='dates')document.getElementById('date-swap')!.addEventListener('click',()=>{const original=value('date-start');field('date-start').value=value('date-end');field('date-end').value=original;update();});
    if(type==='zones')document.getElementById('zone-swap')!.addEventListener('click',()=>h.protect(()=>{const source=value('zone-source'),target=value('zone-target'),epoch=dateTime(value('zone-date'),value('zone-time'),source,value('zone-occurrence')),p=zonedParts(epoch,target);field('zone-source').value=target;field('zone-target').value=source;field('zone-date').value=dateISO(p);field('zone-time').value=timeText(p);field('zone-occurrence').value=dateTime(dateISO(p),timeText(p),target,'earlier')===epoch?'earlier':'later';update();}));
    update();
    if(type==='event'){
      document.getElementById('event-share')!.addEventListener('click',()=>{if(eventTarget!==null&&!document.getElementById('result-panel')!.hasAttribute('data-invalid'))void h.copyText(new URL(eventHref(eventTarget,value('event-zone'),value('event-name')),location.origin).href);});
      document.getElementById('event-calendar')!.addEventListener('click',()=>h.protect(()=>{if(eventTarget===null||document.getElementById('result-panel')!.hasAttribute('data-invalid'))throw new Error('Choose valid event settings first.');const url=URL.createObjectURL(new Blob([calendarFile(eventTarget,value('event-name')||'My event',Date.now())],{type:'text/calendar;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download='howlong-event.ics';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}));
      document.getElementById('event-notifications')!.addEventListener('click',async()=>{if(!('Notification'in window)){h.message('Notifications are not supported here.');return;}try{notify=(await Notification.requestPermission())==='granted';h.message(notify?'Notifications enabled while this page stays open.':'Notifications were not enabled.');}catch{h.message('Notifications are unavailable in this browser.');}});
      const tick=()=>{try{drawEvent();}catch(error){eventTarget=null;h.protect(()=>{throw error;});}};
      setInterval(()=>{if(!document.hidden||checked('sound-alert')||notify)tick();},1000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)tick();});
    }
  }else if(restored){for(const control of controls()){control.dispatchEvent(new Event('input',{bubbles:true}));control.dispatchEvent(new Event('change',{bubbles:true}));}}

  const applyHash=()=>{
    if(!restoreHash())return;
    if(['interval','event','dates','arithmetic','zones'].includes(type))update();
    else for(const control of controls()){control.dispatchEvent(new Event('input',{bubbles:true}));control.dispatchEvent(new Event('change',{bubbles:true}));}
  };
  window.addEventListener('hashchange',applyHash);
  if(!document.getElementById('save-calculation'))return;
  type Saved={id:string;name:string;href:string};
  const storageKey='howlong-saved-calculations';
  const readSaved=():Saved[]=>{try{const data:unknown=JSON.parse(localStorage.getItem(storageKey)??'[]');if(!Array.isArray(data))return [];return data.filter((item):item is Saved=>!!item&&typeof item.id==='string'&&typeof item.name==='string'&&item.name.length<=80&&typeof item.href==='string'&&item.href.length<=25000&&item.href.startsWith('/')&&!item.href.startsWith('//')&&new URL(item.href,location.origin).origin===location.origin).slice(0,12);}catch{return [];}};
  const savedMessage=(message:string)=>text('saved-status',message);
  const renderSaved=()=>{
    const list=document.getElementById('saved-list')!;list.replaceChildren();
    for(const saved of readSaved()){const li=document.createElement('li'),link=document.createElement('a'),remove=document.createElement('button');link.textContent=saved.name;link.href=saved.href;link.addEventListener('click',event=>{if(saved.href===location.pathname+location.hash){event.preventDefault();applyHash();}});remove.type='button';remove.className='quiet-button';remove.textContent='Delete';remove.setAttribute('aria-label',`Delete ${saved.name}`);remove.addEventListener('click',()=>{try{localStorage.setItem(storageKey,JSON.stringify(readSaved().filter(row=>row.id!==saved.id)));renderSaved();savedMessage('Saved calculation deleted.');}catch{savedMessage('Local storage is unavailable.');}});li.append(link,remove);list.append(li);}
  };
  const snapshot=()=>{if(document.getElementById('result-panel')?.hasAttribute('data-invalid'))throw new Error('Correct the calculation before saving or sharing.');const hash=new URLSearchParams({settings:JSON.stringify(getSettings())});return location.pathname+'#'+hash;};
  document.getElementById('save-calculation')!.addEventListener('click',()=>{try{const name=value('saved-name').trim()||(document.getElementById('event-name') as HTMLInputElement|null)?.value||document.querySelector('h1')!.textContent||'My calculation',href=snapshot();const next=[{id:crypto.randomUUID(),name:name.slice(0,80),href},...readSaved().filter(row=>row.href!==href)].slice(0,12);localStorage.setItem(storageKey,JSON.stringify(next));renderSaved();savedMessage('Saved on this device. Up to 12 calculations are kept.');}catch(error){savedMessage(error instanceof Error?error.message:'Local storage is unavailable.');}});
  document.getElementById('share-calculation')!.addEventListener('click',()=>{try{void h.copyText(new URL(snapshot(),location.origin).href);}catch(error){savedMessage((error as Error).message);}});
  document.getElementById('clear-calculations')!.addEventListener('click',()=>{try{localStorage.removeItem(storageKey);renderSaved();savedMessage('Saved calculations cleared.');}catch{savedMessage('Local storage is unavailable.');}});
  window.addEventListener('storage',event=>{if(event.key===storageKey)renderSaved();});renderSaved();
}
