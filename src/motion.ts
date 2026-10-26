const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
const styles=getComputedStyle(document.documentElement);
export const motionTiming={feedback:parseFloat(styles.getPropertyValue('--motion-feedback'))||160,enter:parseFloat(styles.getPropertyValue('--motion-enter'))||200};
const motions=new Map<HTMLElement,Animation>();

export function cancelFeedback(target:HTMLElement|null):void{if(target)motions.get(target)?.cancel();}

export function animateFeedback(target:HTMLElement|null,frames:Keyframe[],duration=motionTiming.feedback):void{
  if(!target)return;
  cancelFeedback(target);
  if(reducedMotion.matches||document.hidden||typeof target.animate!=='function')return;
  const animation=target.animate(frames,{duration,easing:'cubic-bezier(.2,0,0,1)'});
  motions.set(target,animation);
  const clear=()=>{if(motions.get(target)===animation)motions.delete(target);};
  animation.addEventListener('finish',clear,{once:true});animation.addEventListener('cancel',clear,{once:true});
}

function cancelMotions():void{for(const animation of motions.values())animation.cancel();motions.clear();}
reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches)cancelMotions();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelMotions();});
