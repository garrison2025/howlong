import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { extraPages } from '../scripts/tools-markup.mjs';
import { clockInterval, durationText, parseDuration } from '../dist/assets/tools-core.js';
const originalPages=JSON.parse(await fs.readFile(new URL('../data/pages.json',import.meta.url),'utf8'));
const pages=[...originalPages,...extraPages];
const config=JSON.parse(await fs.readFile(new URL('../site.config.json',import.meta.url),'utf8'));
const keywords=JSON.parse(await fs.readFile(new URL('../data/keywords.json',import.meta.url),'utf8'));

test('initial tool answers match the actual default inputs without running browser JavaScript',async()=>{
  for(const [route,calculate]of [
    ['/time-duration-calculator/',values=>durationText(clockInterval(values('interval-start'),values('interval-end'),false))],
    ['/time-calculator/',values=>durationText(parseDuration(values('arithmetic-a'))+parseDuration(values('arithmetic-b')))]
  ]){
    const html=await fs.readFile(new URL(`../dist${route}index.html`,import.meta.url),'utf8');
    const values=id=>html.match(new RegExp(`<input[^>]*id="${id}"[^>]*value="([^"]+)"`))?.[1];
    const answer=calculate(values);
    assert.equal(html.match(/id="tool-result"[^>]*>([^<]+)/)?.[1],answer);
    assert(html.match(/id="result-summary"[^>]*>([^<]+)/)?.[1].includes(answer));
    assert.match(html,/<tbody id="tool-details"><tr>/);
  }
  const event=await fs.readFile(new URL('../dist/countdown-to-date/index.html',import.meta.url),'utf8');
  assert.match(event,/id="tool-result"[^>]*>Choose your inputs/);
});

test('sitemap lastmod uses only explicitly recorded content dates, not the build date',async()=>{
  const updates=JSON.parse(await fs.readFile(new URL('../data/page-updates.json',import.meta.url),'utf8'));
  const xml=await fs.readFile(new URL('../dist/sitemap.xml',import.meta.url),'utf8');
  let dated=0;
  for(const [,location,date]of xml.matchAll(/<url><loc>([^<]+)<\/loc>(?:<lastmod>([^<]+)<\/lastmod>)?<\/url>/g)){
    const route=new URL(location).pathname;
    assert.equal(date,updates[route]);
    if(date){assert.match(date,/^\d{4}-\d{2}-\d{2}$/);dated++;}
  }
  assert.equal(dated,Object.keys(updates).length);
  assert.equal(dated,2);
});

test('answer conditions and citation section links remain visible and resolve on their page',async()=>{
  for(const page of pages){
    const html=await fs.readFile(new URL(`../dist${page.route}index.html`,import.meta.url),'utf8');
    const ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
    for(const link of html.matchAll(/href="#([^"]+)"/g))assert(ids.has(link[1]),`${page.route}#${link[1]}`);
  }
  const fixed=await fs.readFile(new URL('../dist/how-long-is/100-hours/index.html',import.meta.url),'utf8');
  assert(fixed.includes('id="counting-rules"'));
  assert(fixed.includes('Fixed-unit conversions use 24-hour days'));
  assert(fixed.includes('href="#calculation-method"'));
  const clock=await fs.readFile(new URL('../dist/how-long-until/3-pm/index.html',import.meta.url),'utf8');
  assert(clock.includes('hypothetical example, not your live remaining time'));
  assert(clock.includes('14:00 UTC'));
  const year=await fs.readFile(new URL('../dist/how-long-ago-was/2018/index.html',import.meta.url),'utf8');
  assert(year.includes('reference date is explicitly January 1, 2019, not today'));
  const business=await fs.readFile(new URL('../dist/business-days-calculator/index.html',import.meta.url),'utf8');
  assert(business.includes('id="references"'));
  assert(business.includes('they do not certify this calculator'));
});

test('preset answers use exact compound units and task descriptions match their tools',async()=>{
  for(const [route,answer]of [['100-hours','100 hours = 4 days 4 hours.'],['90-days','90 days = 12 weeks 6 days.'],['90-minutes','90 minutes = 1 hour 30 minutes.'],['72-hours','72 hours = 3 days.']]){
    const html=await fs.readFile(new URL(`../dist/how-long-is/${route}/index.html`,import.meta.url),'utf8');
    const lead=html.match(/id="conversion-lead"[^>]*>(.*?)<\/p>/s)[1];
    assert(lead.includes(answer),route);
    assert(html.match(/name="description" content="([^"]*)/)[1].includes(answer),route);
    if(route==='100-hours'||route==='90-days')assert(lead.includes('approximately'),route);
    if(route==='90-minutes')assert(!lead.includes('approximately'),route);
  }
  const hub=await fs.readFile(new URL('../dist/business-days-calculator/index.html',import.meta.url),'utf8');
  assert(hub.includes('Choose a working-day task'));
  assert(hub.includes('count working days between two dates'));
  const leaf=await fs.readFile(new URL('../dist/how-long-is/3-business-days/index.html',import.meta.url),'utf8');
  assert(leaf.includes('3 business days means 3 working days'));
  assert(!leaf.includes('Choose a working-day task'));
  for(const route of ['/business-days-calculator/','/time-duration-converter/','/holiday-countdown/','/how-long-is/3-business-days/','/how-long-is/5-business-days/','/how-long-is/3-5-business-days/','/how-long-is/a-fortnight/','/how-long-is/a-century/','/how-long-until/halloween/','/how-long-until/thanksgiving/']){
    const html=await fs.readFile(new URL(`../dist${route}index.html`,import.meta.url),'utf8');
    assert(!html.match(/name="description" content="([^"]*)/)[1].includes('Free, precise countdowns'),route);
  }
});

test('general hubs explain their broad task and specialized tools offer relevant destinations',async()=>{
  const years=await fs.readFile(new URL('../dist/years-ago-calculator/index.html',import.meta.url),'utf8');
  assert(years.includes('<h2>How to calculate years ago</h2>'));
  assert(!years.includes('<h2>How long ago was 2018?</h2>'));
  assert(years.includes('1,827 calendar days'));
  const year=await fs.readFile(new URL('../dist/how-long-ago-was/2018/index.html',import.meta.url),'utf8');
  assert(year.includes('<h2>How long ago was 2018?</h2>'));
  const converter=await fs.readFile(new URL('../dist/time-duration-converter/index.html',import.meta.url),'utf8');
  for(const text of ['Choose the right duration conversion','Decimal hours and compound durations','Months and years need a counting method'])assert(converter.includes(text),text);
  for(const page of extraPages){
    const html=await fs.readFile(new URL(`../dist${page.route}index.html`,import.meta.url),'utf8');
    const related=html.match(/<section class="related">(.*?)<\/section>/s)[1];
    const destinations=[...related.matchAll(/href="([^"]+)"/g)].map(m=>m[1]);
    assert.equal(destinations.length,3,page.route);
    assert.equal(new Set(destinations).size,3,page.route);
    assert(!destinations.includes(page.route),page.route);
  }
  for(const route of ['1-30','3-30','3','4']){
    const html=await fs.readFile(new URL(`../dist/how-long-until/${route}/index.html`,import.meta.url),'utf8');
    assert(!html.includes('AM and PM Countdowns Live Countdown'));
    assert.match(html,/<title>How Long Until .*?Live AM and PM Countdowns/);
    assert(html.includes('id="am-result"')&&html.includes('id="pm-result"'));
  }
});

test('search entry and worked examples are available before JavaScript',async()=>{
  const home=await fs.readFile(new URL('../dist/index.html',import.meta.url),'utf8');
  assert.match(home,/<nav id="main-nav"[^>]*>.*?href="\/time-duration-calculator\/"/s);
  assert.match(home,/<div class="hero-actions">.*?href="\/time-duration-calculator\/">Calculate time duration<\/a>/s);
  const interval=await fs.readFile(new URL('../dist/time-duration-calculator/index.html',import.meta.url),'utf8');
  assert.equal(interval.match(/<title>(.*?)<\/title>/)[1],'Time Duration Calculator — Hours Between Two Times');
  assert(interval.includes('8 hours 30 minutes (8.5 hours)'));
  assert(interval.includes('End time is on the next day'));
  const years=await fs.readFile(new URL('../dist/years-ago-calculator/index.html',import.meta.url),'utf8');
  assert(!years.match(/<meta name="description" content="([^"]+)"/)[1].includes('2018'));
});

test('duration related links prioritize nearby amounts in the same unit',async()=>{
  for(const page of originalPages.filter(p=>/^\/how-long-is\/\d+-(seconds|minutes|hours|days|weeks|months)\/$/.test(p.route))){
    const [,amount,unit]=page.route.match(/\/(\d+)-(\w+)\/$/);
    const html=await fs.readFile(new URL(`../dist${page.route}index.html`,import.meta.url),'utf8');
    const related=html.match(/<section class="related">(.*?)<\/section>/s)[1];
    const links=[...related.matchAll(/class="directory-link" href="([^"]+)"/g)].map(m=>m[1]);
    const same=originalPages.filter(p=>p.route!==page.route&&new RegExp(`^/how-long-is/\\d+-${unit}/$`).test(p.route)).sort((a,b)=>Math.abs(Number(a.route.match(/\/(\d+)-/)[1])-Number(amount))-Math.abs(Number(b.route.match(/\/(\d+)-/)[1])-Number(amount))||a.route.localeCompare(b.route)).slice(0,8);
    assert.deepEqual(links.slice(0,same.length),same.map(p=>p.route),page.route);
    assert(!html.includes('Adding 72 elapsed hours'),page.route);
  }
});

test('domain migration consistently emits the configured origin, site identity and public contact address',async()=>{
  assert.equal(config.url,'https://timedurationcalculator.cc');
  assert.equal(config.contactEmail,'contact@timedurationcalculator.cc');
  const origin=new URL(process.env.SITE_URL||config.url).origin;
  for(const page of pages){
    const html=await fs.readFile(new URL(`../dist${page.route}index.html`,import.meta.url),'utf8');
    assert(html.includes(`<link rel="canonical" href="${origin}${page.route}">`),page.route);
    assert(html.includes(`<meta property="og:url" content="${origin}${page.route}">`),page.route);
    assert(!html.includes('howlong-7sh.pages.dev'),page.route);
    const schema=JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
    assert.equal(schema['@graph'].find(node=>node['@type']==='WebSite').url,origin+'/');
  }
  const contact=await fs.readFile(new URL('../dist/contact/index.html',import.meta.url),'utf8');
  assert(contact.includes('href="mailto:contact@timedurationcalculator.cc"'));
  assert(contact.includes('>contact@timedurationcalculator.cc</a>'));
  const robots=await fs.readFile(new URL('../dist/robots.txt',import.meta.url),'utf8');
  if(origin.startsWith('https://'))assert(robots.includes(`Sitemap: ${origin}/sitemap.xml`));
});
test('all 83 original and 17 screenshot keywords have one primary page across 64 targets',()=>{
  assert.equal(originalPages.length,72);assert.equal(pages.length,77);
  assert.equal(new Set(pages.map(p=>p.route)).size,77);
  assert.equal(keywords.filter(k=>k.source==='original').length,83);
  assert.equal(keywords.filter(k=>k.source==='screenshot').length,17);
  assert.equal(new Set(keywords.map(k=>k.keyword)).size,100);
  assert.equal(new Set(keywords.filter(k=>k.source==='original').map(k=>k.route)).size,64);
  for(const k of keywords)assert(pages.some(p=>p.route===k.route),k.keyword);
});
test('all 77 pre-rendered pages have unique metadata, one H1, controls, and valid internal links',async()=>{
  const titles=new Set(),routes=new Set(pages.map(p=>p.route)),incoming=new Map(pages.map(p=>[p.route,0]));
  for(const page of pages){
    const html=await fs.readFile(new URL(`../dist${page.route}index.html`,import.meta.url),'utf8');
    const title=html.match(/<title>(.*?)<\/title>/)?.[1];
    assert(title&&!titles.has(title),page.route);titles.add(title);
    assert.equal((html.match(/<h1[ >]/g)||[]).length,1,page.route);
    assert.match(html,/<meta name="description" content="[^"]+">/);
    assert.match(html,new RegExp(`<link rel="canonical" href="https?://[^\"]+${page.route}">`));
    assert(!html.includes('example.com'));
    assert.match(html,/<html lang="en">/);
    assert.match(html,/<script type="module" src="\/assets\/app\.js\?v=[a-f0-9]{12}"><\/script>/);
    assert.match(html,/<link rel="stylesheet" href="\/assets\/styles\.css\?v=[a-f0-9]{12}">/);
    const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
    assert.equal(ids.length,new Set(ids).size,`Duplicate ID at ${page.route}`);
    for(const label of html.matchAll(/<label[^>]*for="([^"]+)"/g))assert(ids.includes(label[1]),`Missing field ${label[1]}`);
    for(const link of html.matchAll(/<a[^>]*href="(\/[^"#]*)"/g)){assert(routes.has(link[1]),`${page.route} links to ${link[1]}`);if(link[1]!==page.route)incoming.set(link[1],incoming.get(link[1])+1);}
    const cfg=JSON.parse(html.match(/<script id="page-config" type="application\/json">(.*?)<\/script>/)[1]);
    if(!['legal','holiday-hub'].includes(cfg.type))assert(ids.includes('tool-status'),page.route);
    if(cfg.type==='duration'){assert.equal(cfg.amount,Number(page.route.match(/\/(\d+)-/)[1]));assert(html.includes(`value="${cfg.amount}"`));}
    if(cfg.type==='ambiguous')assert(ids.includes('am-result')&&ids.includes('pm-result'));
  }
  for(const [route,count]of incoming)assert(count>0,`Orphan route ${route}`);
});
test('sitemap contains all canonical pages and no parameter URLs, and 404 is not indexed',async()=>{
  const xml=await fs.readFile(new URL('../dist/sitemap.xml',import.meta.url),'utf8');
  const locations=[...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
  assert.equal(locations.length,77);assert.equal(new Set(locations).size,77);
  for(const location of locations){const url=new URL(location);assert.equal(url.search,'');assert.equal(url.hash,'');assert(pages.some(p=>p.route===url.pathname));}
  const html=await fs.readFile(new URL('../dist/404.html',import.meta.url),'utf8');assert.match(html,/name="robots" content="noindex"/);
});
test('tricky keywords retain the correct distinct task and page',()=>{
  const target=k=>keywords.find(x=>x.keyword===k).route;
  assert.equal(target('how long until 2:30'),'/how-long-until/2-30-pm/');
  assert.equal(target('how long until 3'),'/how-long-until/3/');
  assert.equal(target('how long is 90 seconds in minutes'),'/how-long-is/90-seconds/');
  assert.notEqual(target('how long is 90 seconds in minutes'),target('how long is 90 minutes'));
  assert.equal(target('how long ago was august 2018'),'/how-long-ago-was/2018/');
  assert.equal(target('how long is 2-3 business days'),'/business-days-calculator/');
});

test('website entities and breadcrumbs match visible route hierarchy on every page',async()=>{
  for(const page of pages){
    const html=await fs.readFile(new URL(`../dist${page.route}index.html`,import.meta.url),'utf8');
    const schema=JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
    assert.equal(schema['@context'],'https://schema.org');
    const website=schema['@graph'].find(n=>n['@type']==='WebSite');
    const webPage=schema['@graph'].find(n=>n['@type']==='WebPage');
    assert.equal(website.name,config.name);assert.equal(webPage.url,new URL(page.route,website.url).href);
    assert.equal(webPage.isPartOf['@id'],website['@id']);
    const breadcrumb=schema['@graph'].find(n=>n['@type']==='BreadcrumbList');
    if(page.route==='/'){assert.equal(breadcrumb,undefined);continue;}
    assert.match(html,/<nav class="breadcrumb" aria-label="Breadcrumb">/);
    assert.equal(breadcrumb.itemListElement.at(-1).item,webPage.url);
    breadcrumb.itemListElement.forEach((entry,i)=>{assert.equal(entry.position,i+1);assert(pages.some(p=>p.route===new URL(entry.item).pathname));assert(html.includes(entry.name.replaceAll('&','&amp;')));});
    if(page.route==='/how-long-until/3-pm/')assert.equal(breadcrumb.itemListElement[1].item,new URL('/how-long-until/',website.url).href);
    if(page.route==='/how-long-until/thanksgiving/')assert.equal(breadcrumb.itemListElement[1].item,new URL('/holiday-countdown/',website.url).href);
  }
});

test('runtime calculation and motion imports share the entry version and exist in the build',async()=>{
  const html=await fs.readFile(new URL('../dist/index.html',import.meta.url),'utf8');
  const version=html.match(/app\.js\?v=([a-f0-9]{12})/)[1];
  const app=await fs.readFile(new URL('../dist/assets/app.js',import.meta.url),'utf8');
  for(const module of ['core','motion','dial','tools','tools-core']){
    assert(app.includes(`from './${module}.js?v=${version}'`),`${module} cache version`);
    assert((await fs.stat(new URL(`../dist/assets/${module}.js`,import.meta.url))).size>0);
  }
});
