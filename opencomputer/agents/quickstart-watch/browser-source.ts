// Executed in the isolated computer, outside the agent bundler.
export const browserSource = String.raw`
import {chromium} from 'playwright';
import {readFile} from 'node:fs/promises';
import {lookup} from 'node:dns/promises';
import ipaddr from 'ipaddr.js';
const input=JSON.parse(await readFile(process.argv[2],'utf8'));
let context;
try {context=await chromium.launchPersistentContext(input.profile,{headless:true,args:['--no-sandbox'],timeout:30000,...(input.executablePath?{executablePath:input.executablePath}:{})});}
catch {console.log(JSON.stringify({blocked:true,category:'runner',reason:'Chromium could not launch in the isolated runtime. The browser flow was not tested.',nextAction:'Do not retry browser installation. Clean up test resources and call finish_report with verdict blocked.'}));process.exit(0);}
try {
 await context.route('**/*',async route=>{
  try {const u=new URL(route.request().url());if(!['https:','http:'].includes(u.protocol))return route.abort();const ips=await lookup(u.hostname,{all:true});if(!ips.length||ips.some(a=>ipaddr.process(a.address).range()!=='unicast'))return route.abort();await route.continue();}catch{await route.abort();}
 });
 let page=context.pages()[0]||await context.newPage();
 await page.goto(input.url,{waitUntil:'domcontentloaded',timeout:30000});
 for(const action of input.actions){const locator=page.locator(action.selector).first();if(action.kind==='fill')await locator.fill(action.value,{timeout:12000});else if(action.kind==='select')await locator.selectOption(action.value,{timeout:12000});else await locator.click({timeout:12000});}
 page=context.pages().at(-1)||page;
 await page.waitForLoadState('domcontentloaded',{timeout:10000}).catch(()=>{});
 const controls=await page.locator('input,button,a,select').evaluateAll(elements=>elements.slice(0,80).map(el=>({tag:el.tagName.toLowerCase(),text:(el.textContent||'').trim().slice(0,100),id:el.id,name:el.getAttribute('name')||'',type:el.getAttribute('type')||'',placeholder:el.getAttribute('placeholder')||'',href:el.getAttribute('href')||''})));
 console.log(JSON.stringify({url:page.url(),title:await page.title(),text:(await page.locator('body').innerText()).slice(0,12000),controls}));
}finally{await context.close();}
`;
