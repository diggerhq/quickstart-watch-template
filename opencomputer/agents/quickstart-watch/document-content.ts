import { normalizeUrl } from './network.js';

// Keep useful guide text and navigation within the runtime's tool-output budget.
export function documentContent(body:string, url:string) {
 const clean=body.replace(/<(script|style|svg)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,'');
 const decode=(text:string)=>text.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&nbsp;/g,' ').replace(/&amp;/g,'&');
 const links:{url:string;text:string}[]=[];
 for(const match of clean.matchAll(/<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
  try {
   const href=normalizeUrl(new URL(decode(match[1]),url).href).href;
   if(href.length>200 || links.some(link=>link.url===href))continue;
   links.push({url:href,text:decode(match[2].replace(/<[^>]*>/g,' ')).replace(/\s+/g,' ').trim().slice(0,80)});
   if(links.length===15)break;
  } catch { /* Unsupported or private link. */ }
 }
 const text=decode(clean.replace(/<\/(p|div|h[1-6]|pre|li|section)>|<br\s*\/?>/gi,'\n').replace(/<[^>]*>/g,'')).replace(/[ \t]+/g,' ').replace(/\n\s*\n/g,'\n').trim();
 return {content:text.slice(0,6000),links,truncated:text.length>6000};
}
