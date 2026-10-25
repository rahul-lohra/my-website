import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import {postSchema,projectSchema,readingTime} from '../shared/schema';
const origin=process.env.SITE_URL || 'https://rahullohra.com';
const base='/'+(process.env.BASE_PATH||'').split('/').filter(Boolean).join('/');
const url=(p:string)=>`${base==='/'?'':base}${p}`;
const load=(dir:string)=>fs.readdirSync(dir).filter(f=>f.endsWith('.md')).map(f=>{const {data,content}=matter(fs.readFileSync(path.join(dir,f),'utf8'));const parsed=postSchema.parse(data);return {...parsed,date:parsed.date.toISOString(),body:content,readingTime:readingTime(content)};}).filter(p=>!p.draft).sort((a,b)=>b.date.localeCompare(a.date)||a.slug.localeCompare(b.slug));
const posts=load('content/posts');const notes=load('content/rag-notes');const ragProjects=load('content/rag-projects');
const projects=projectSchema.array().parse(JSON.parse(fs.readFileSync('content/projects.json','utf8'))).filter(p=>!p.draft);
for(const items of [posts,notes,ragProjects,projects]){if(new Set(items.map(p=>p.slug)).size!==items.length)throw Error('Duplicate slugs');}
for(const p of projects)for(const slug of p.articles)if(!posts.some(x=>x.slug===slug))throw Error(`Unknown related article: ${slug}`);
fs.mkdirSync('backend/src/generated',{recursive:true});fs.writeFileSync('backend/src/generated/content.json',JSON.stringify({posts,projects,notes,ragProjects},null,2));
// Remove only compatibility files generated on the previous run, including newly unpublished posts.
if(fs.existsSync('content/redirects.json'))for(const legacy of Object.keys(JSON.parse(fs.readFileSync('content/redirects.json','utf8')))){if(/^\/[a-z0-9/._-]+\.html$/.test(legacy)&&!legacy.includes('..'))fs.rmSync('frontend/public'+legacy,{force:true});}
const redirects:Record<string,string>={};
for(const p of posts)for(const legacy of p.legacyUrls){redirects[legacy]='/blog/'+p.slug+'/';const target=url(redirects[legacy]);const out='frontend/public'+legacy;fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Article moved</title><meta http-equiv="refresh" content="0;url=${target}"><link rel="canonical" href="${origin}${target}"></head><body><p>This article has moved. <a href="${target}">Read ${p.title.replaceAll('&','&amp;').replaceAll('<','&lt;')}</a>.</p></body></html>`);}
fs.writeFileSync('content/redirects.json',JSON.stringify(redirects,null,2));
console.log(`Validated ${posts.length} posts, ${projects.length} projects; generated API bundle and compatibility pages.`);
