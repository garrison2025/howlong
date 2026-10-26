import test,{after,afterEach} from 'node:test';
import assert from 'node:assert/strict';

// Browser preference/events are simulated here; these tests do not certify OS emulation.
const media=new EventTarget();media.matches=false;
const doc=new EventTarget();doc.hidden=false;doc.documentElement={};
globalThis.matchMedia=()=>media;
globalThis.document=doc;
globalThis.getComputedStyle=()=>({getPropertyValue:name=>name==='--motion-feedback'?'160ms':'200ms'});
const {animateFeedback,cancelFeedback,motionTiming}=await import('../dist/assets/motion.js');
class Effect extends EventTarget{
  canceled=0;
  cancel(){this.canceled++;this.dispatchEvent(new Event('cancel'));}
  finish(){this.dispatchEvent(new Event('finish'));}
}
function target(){return {effects:[],animate(frames,options){const effect=new Effect();this.effects.push({effect,frames,options});return effect;}};}
const frames=[{opacity:.8},{opacity:1}];
afterEach(()=>{media.matches=true;media.dispatchEvent(new Event('change'));media.matches=false;doc.hidden=false;});
after(()=>{delete globalThis.matchMedia;delete globalThis.document;delete globalThis.getComputedStyle;});

test('rapid motion replaces only the previous effect and completed effects are released',()=>{
  const a=target(),b=target();
  animateFeedback(a,frames);animateFeedback(b,frames,motionTiming.enter);animateFeedback(a,frames);
  assert.equal(a.effects[0].effect.canceled,1);assert.equal(b.effects[0].effect.canceled,0);
  assert.equal(a.effects[1].options.duration,160);assert.equal(b.effects[0].options.duration,200);
  assert.equal(a.effects[1].options.fill,undefined);
  a.effects[1].effect.finish();cancelFeedback(a);assert.equal(a.effects[1].effect.canceled,0);
});
test('reduced-motion skips new effects and cancels running effects immediately on preference change',()=>{
  const a=target();animateFeedback(a,frames);
  media.matches=true;media.dispatchEvent(new Event('change'));
  assert.equal(a.effects[0].effect.canceled,1);
  animateFeedback(a,frames);assert.equal(a.effects.length,1);
});
test('hidden documents cancel effects and missing Web Animations uses the static fallback',()=>{
  const a=target();animateFeedback(a,frames);
  doc.hidden=true;doc.dispatchEvent(new Event('visibilitychange'));
  assert.equal(a.effects[0].effect.canceled,1);
  animateFeedback(a,frames);assert.equal(a.effects.length,1);
  doc.hidden=false;assert.doesNotThrow(()=>animateFeedback({},frames));assert.doesNotThrow(()=>animateFeedback(null,frames));
});
