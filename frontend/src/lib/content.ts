import { getCollection } from 'astro:content';
import data from '../../../content/projects.json';
import {projectSchema,readingTime} from '../../../shared/schema';
export const projects=projectSchema.array().parse(data).filter(p=>!p.draft);
export const posts=async()=> (await getCollection('posts',({data})=>!data.draft)).sort((a,b)=>b.data.date.getTime()-a.data.date.getTime()||a.id.localeCompare(b.id));
export const href=(p:string)=>`${import.meta.env.BASE_URL.replace(/\/$/,'')}/${p.replace(/^\//,'')}`;
export const date=(d:Date)=>d.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
export { readingTime };
