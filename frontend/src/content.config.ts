import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { postSchema } from '../../shared/schema';
const collection=(directory:string)=>defineCollection({loader:glob({pattern:'**/*.md',base:`../content/${directory}`,generateId:({data})=>String(data.slug)}),schema:postSchema});
export const collections={posts:collection('posts'),notes:collection('rag-notes'),ragProjects:collection('rag-projects')};
