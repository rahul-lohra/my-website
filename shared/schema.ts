import { z } from 'zod';
export const postSchema = z.object({ title:z.string().min(1),slug:z.string().regex(/^[a-z0-9-]+$/),description:z.string().min(1),date:z.coerce.date(),topic:z.string(),tags:z.array(z.string()).default([]),draft:z.boolean().default(false),legacyUrls:z.array(z.string()).default([]),source:z.string().url().optional(),projects:z.array(z.string()).default([]) });
export const projectSchema = z.object({slug:z.string().regex(/^[a-z0-9-]+$/),title:z.string(),description:z.string(),topic:z.string(),tags:z.array(z.string()),kind:z.enum(['Original project','Contribution','Fork']),featured:z.boolean().default(false),draft:z.boolean().default(false),source:z.string().url(),problem:z.string(),approach:z.string(),image:z.string().optional(),imageAlt:z.string().optional(),articles:z.array(z.string()).default([])});
export type Project = z.infer<typeof projectSchema>;
export const readingTime = (body:string) => Math.max(1,Math.ceil(body.split(/\s+/).length/220));
export const profileSchema = z.object({
 name:z.string(),headline:z.string(),summary:z.string(),resumePath:z.string().startsWith('/resume/'),skills:z.array(z.string()),
 experience:z.array(z.object({company:z.string(),role:z.string(),specialty:z.string(),start:z.string(),end:z.string(),summary:z.string(),highlights:z.array(z.string())})),
 education:z.array(z.object({title:z.string(),institution:z.string(),period:z.string()}))
});
