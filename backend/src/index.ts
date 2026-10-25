import content from './generated/content.json';
export interface Env { ALLOWED_ORIGINS?:string }
export default {async fetch(request:Request,env:Env={}):Promise<Response>{
 const origin=request.headers.get('Origin');
 const allowed=(env.ALLOWED_ORIGINS||'http://localhost:4321,http://127.0.0.1:4321').split(',').map(x=>x.trim()).filter(Boolean);
 const headers=new Headers({'Content-Type':'application/json; charset=utf-8','Vary':'Origin','X-Content-Type-Options':'nosniff','Cache-Control':'public, max-age=60'});
 if(origin && allowed.includes(origin)){headers.set('Access-Control-Allow-Origin',origin);headers.set('Access-Control-Allow-Methods','GET, HEAD, OPTIONS');headers.set('Access-Control-Allow-Headers','Content-Type');}
 const json=(value:unknown,status=200)=>new Response(request.method==='HEAD'?null:JSON.stringify(value),{status,headers});
 if(origin && !allowed.includes(origin))return json({error:'Origin not allowed'},403);
 const pathname=new URL(request.url).pathname.replace(/\/$/,'')||'/';
 const [,,collection,slug,...rest]=pathname.split('/');
 const keys:Record<string,unknown[]>={posts:content.posts,projects:content.projects,notes:content.notes,'rag-projects':content.ragProjects};
 const known=pathname==='/api/health'||(pathname.startsWith('/api/') && collection && keys[collection] && !rest.length && (!slug||keys[collection].some((p:any)=>p.slug===slug)));
 if(!known)return json({error:'Not found'},404);
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
 if(!['GET','HEAD'].includes(request.method)){headers.set('Allow','GET, HEAD, OPTIONS');return json({error:'Method not allowed'},405);}
 if(pathname==='/api/health')return json({status:'ok'});
 const rows=keys[collection];return json(slug?rows.find((p:any)=>p.slug===slug):rows);
}};
