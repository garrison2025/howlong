import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
const root=new URL('../',import.meta.url);
import { extraPages } from './tools-markup.mjs';
const pages=[...JSON.parse(await fs.readFile(new URL('data/pages.json',root),'utf8')),...extraPages];
const origin=process.env.SITE_URL||'https://howlong-7sh.pages.dev';
const results=[],queue=[...pages];
const hash=text=>createHash('sha256').update(text).digest('hex');
await Promise.all(Array.from({length:6},async()=>{
  while(queue.length){
    const page=queue.shift(),response=await fetch(origin+page.route),html=await response.text();
    const get=pattern=>html.match(pattern)?.[1]??'';
    const schema=JSON.parse(get(/<script type="application\/ld\+json">(.*?)<\/script>/s)||'{}');
    const assets=[...html.matchAll(/(?:src|href)="(\/assets\/[^"#]+)"/g)].map(m=>m[1]);
    const links=[...html.matchAll(/<a[^>]*href="(\/[^"#]*)"/g)].map(m=>m[1]);
    const record={route:page.route,status:response.status,title:get(/<title>(.*?)<\/title>/),description:get(/<meta name="description" content="([^"]*)"/),h1:get(/<h1[^>]*>(.*?)<\/h1>/s).replace(/<[^>]*>/g,''),canonical:get(/rel="canonical" href="([^"]*)"/),robots:get(/name="robots" content="([^"]*)"/),headings:[...html.matchAll(/<h[23][^>]*>(.*?)<\/h[23]>/gs)].map(m=>m[1].replace(/<[^>]*>/g,'')),schemaTypes:(schema['@graph']||[schema]).map(n=>n['@type']),contentHash:hash(get(/<main[^>]*>(.*?)<\/main>/s)),internalLinks:[...new Set(links)],assets,errors:[]};
    if(record.status!==200)record.errors.push('status');
    if(record.canonical!==origin+page.route)record.errors.push('canonical');
    if(record.robots!=='index,follow')record.errors.push('robots');
    if(!record.title||!record.description||!record.h1)record.errors.push('metadata');
    if((html.match(/<h1[ >]/g)||[]).length!==1)record.errors.push('H1 count');
    for(const link of links)if(!pages.some(p=>p.route===link))record.errors.push('broken link '+link);
    results.push(record);
  }
}));
const assets=[];
for(const asset of [...new Set(results.flatMap(p=>p.assets))]){const response=await fetch(origin+asset);assets.push({url:asset,status:response.status,bytes:(await response.arrayBuffer()).byteLength});}
const sitemapResponse=await fetch(origin+'/sitemap.xml'),sitemap=await sitemapResponse.text();
const locations=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
const robotsResponse=await fetch(origin+'/robots.txt'),robots=await robotsResponse.text();
const missing=await fetch(origin+'/this-route-is-not-present/'),missingBody=await missing.text();
const redirects=[];
for(const route of ['/how-long-until/3-pm','/how-long-until/3pm/','/how-long-is/72-hours/?amount=4']){const r=await fetch(origin+route,{redirect:'manual'});redirects.push({route,status:r.status,location:r.headers.get('location')});}
const orphan=pages.filter(p=>p.route!=='/'&&!results.some(r=>r.route!==p.route&&r.internalLinks.includes(p.route))).map(p=>p.route);
const report={origin,checkedAt:new Date().toISOString(),keywordHash:hash(await fs.readFile(new URL('data/keywords.json',root))),pages:results.sort((a,b)=>a.route.localeCompare(b.route)),assets,sitemap:{status:sitemapResponse.status,count:locations.length,correct:locations.length===pages.length&&pages.every(p=>locations.includes(origin+p.route))},robots:{status:robotsResponse.status,body:robots},missing:{status:missing.status,noindex:missingBody.includes('noindex')},redirects,orphans:orphan,performance:{field:'UNAVAILABLE: no connected CrUX/GSC data',lab:'NOT RUN: no lab measurement supplied; transfer bytes are not Web Vitals'}};
const failures=results.filter(r=>r.errors.length);
const target=process.argv[2]||'docs/production-baseline.json';
await fs.writeFile(new URL(target,root),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({target,pages:results.length,failures,assets,sitemap:report.sitemap,missing:report.missing,orphans:orphan,redirects},null,2));
if(failures.length||assets.some(a=>a.status!==200)||!report.sitemap.correct||missing.status!==404||!report.missing.noindex||orphan.length)process.exitCode=1;
