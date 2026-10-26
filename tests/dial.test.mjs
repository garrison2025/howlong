import test,{beforeEach,after} from 'node:test';
import assert from 'node:assert/strict';
import {mountDial} from '../dist/assets/dial.js';

let media,doc,observers;
beforeEach(()=>{
  media=new EventTarget();media.matches=false;
  doc=new EventTarget();doc.hidden=false;
  observers=[];
  globalThis.document=doc;
  globalThis.matchMedia=()=>media;
  globalThis.IntersectionObserver=class{
    constructor(callback){this.callback=callback;observers.push(this);}
    observe(target){this.target=target;}
    visible(value){this.callback([{target:this.target,isIntersecting:value,intersectionRatio:value?1:0}]);}
  };
});
after(()=>{delete globalThis.document;delete globalThis.matchMedia;delete globalThis.IntersectionObserver;});
function dial(){
  const nodes=Object.fromEntries(['#clock-hand','.dial-minute','.dial-second'].map(key=>[key,{style:{transform:'initial'}}]));
  return {nodes,querySelector:key=>nodes[key]};
}

test('dial uses exact supplied time for fractional hands and midnight wrap',()=>{
  const element=dial();let time={hour:10,minute:30,second:45};
  const update=mountDial(element,()=>time);observers[0].visible(true);
  assert.equal(element.nodes['#clock-hand'].style.transform,'rotate(315.375deg)');
  assert.equal(element.nodes['.dial-minute'].style.transform,'rotate(184.5deg)');
  assert.equal(element.nodes['.dial-second'].style.transform,'rotate(270deg)');
  time={hour:23,minute:59,second:59};update();assert.equal(element.nodes['.dial-second'].style.transform,'rotate(354deg)');
  time={hour:0,minute:0,second:0};update();
  for(const node of Object.values(element.nodes))assert.equal(node.style.transform,'rotate(0deg)');
});
test('offscreen and hidden clocks do no work and resynchronize immediately on return',()=>{
  const element=dial();let reads=0,time={hour:3,minute:0,second:1};
  const update=mountDial(element,()=>{reads++;return time;});
  update();assert.equal(reads,0);
  observers[0].visible(true);assert.equal(reads,1);
  observers[0].visible(false);update(true);assert.equal(reads,1);
  doc.hidden=true;observers[0].visible(true);update();assert.equal(reads,1);
  time={hour:7,minute:15,second:50};doc.hidden=false;doc.dispatchEvent(new Event('visibilitychange'));
  assert.equal(reads,2);assert.equal(element.nodes['.dial-second'].style.transform,'rotate(300deg)');
});
test('reduced-motion keeps one static frame while preference and explicit changes recalibrate',()=>{
  const element=dial();let reads=0,time={hour:3,minute:0,second:1};media.matches=true;
  const update=mountDial(element,()=>{reads++;return time;});observers[0].visible(true);
  time={hour:4,minute:10,second:20};update();assert.equal(reads,1);
  update(true);assert.equal(reads,2);assert.equal(element.nodes['.dial-second'].style.transform,'rotate(120deg)');
  media.matches=false;media.dispatchEvent(new Event('change'));update();assert.equal(reads,4);
  media.matches=true;media.dispatchEvent(new Event('change'));const count=reads;update();assert.equal(reads,count);
});
test('pages without a dial and browsers without observation keep the static fallback',()=>{
  const fail=()=>{throw new Error('Static fallback should not read the clock');};
  assert.doesNotThrow(()=>mountDial(null,fail)());
  const element=dial();delete globalThis.IntersectionObserver;
  assert.doesNotThrow(()=>mountDial(element,fail)(true));
  assert.equal(element.nodes['.dial-second'].style.transform,'initial');
});
