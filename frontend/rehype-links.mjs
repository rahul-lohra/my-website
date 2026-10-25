import fs from 'node:fs';
export default function links(){return(tree)=>{
 const redirects=JSON.parse(fs.readFileSync(new URL('../content/redirects.json',import.meta.url),'utf8'));
 const base=(process.env.BASE_PATH||'/').replace(/\/$/,'');
 const rewrite=(original)=>{
  let value=original.replace(/^https?:\/\/(?:www\.)?rahullohra\.com(?=\/)/,'');
  const parts=value.split(/(?=[?#])/);parts[0]=redirects[parts[0]]||parts[0];value=parts.join('');
  return value.startsWith('/')&&!value.startsWith('//')?base+value:value;
 };
 function visit(node){
  if(node.type==='element' && node.properties)for(const prop of ['href','src'])if(typeof node.properties[prop]==='string')node.properties[prop]=rewrite(node.properties[prop]);
  // Astro parses raw HTML after custom rehype plugins, so handle its URL attributes here too.
  if(node.type==='raw')node.value=node.value.replace(/\b(href|src)=("|')([^"']+)\2/g,(_,key,quote,value)=>`${key}=${quote}${rewrite(value)}${quote}`);
  node.children?.forEach(visit);
 }
 visit(tree);
};}
