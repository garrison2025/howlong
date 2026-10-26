type DialTime={hour:number;minute:number;second:number};

export function mountDial(dial:HTMLElement|null,readTime:()=>DialTime):(force?:boolean)=>void{
  if(!dial||typeof IntersectionObserver!=='function')return ()=>{};
  const hour=dial.querySelector<HTMLElement>('#clock-hand'),minute=dial.querySelector<HTMLElement>('.dial-minute'),second=dial.querySelector<HTMLElement>('.dial-second');
  if(!hour||!minute||!second)return ()=>{};
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let visible=false,initialized=false;
  function draw(force=false):void{
    if(!visible||document.hidden||(reduced.matches&&initialized&&!force))return;
    const time=readTime();
    hour!.style.transform=`rotate(${(time.hour%12)*30+time.minute/2+time.second/120}deg)`;
    minute!.style.transform=`rotate(${time.minute*6+time.second/10}deg)`;
    second!.style.transform=`rotate(${time.second*6}deg)`;
    initialized=true;
  }
  const observer=new IntersectionObserver(entries=>{
    for(const entry of entries){if(entry.target!==dial)continue;visible=entry.isIntersecting&&entry.intersectionRatio>0;if(visible)draw(true);}
  },{threshold:.01});
  observer.observe(dial);
  reduced.addEventListener('change',()=>draw(true));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)draw(true);});
  return draw;
}
