import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { extraPages } from '../scripts/tools-markup.mjs';
const originalPages=JSON.parse(await fs.readFile(new URL('../data/pages.json',import.meta.url),'utf8'));
const pages=[...originalPages,...extraPages];
const keywords=JSON.parse(await fs.readFile(new URL('../data/keywords.json',import.meta.url),'utf8'));
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
    assert.equal(website.name,'HowLong');assert.equal(webPage.url,new URL(page.route,website.url).href);
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
