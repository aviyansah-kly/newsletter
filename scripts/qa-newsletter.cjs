const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),http=require('http');
const root=process.cwd();const out=path.join(root,'qa-screenshots');
fs.mkdirSync(out,{recursive:true});
const mime={'.html':'text/html','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.css':'text/css'};
const server=http.createServer((req,res)=>{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const safe=path.resolve(root,'.'+pathname);if(!safe.startsWith(root)){res.writeHead(403);return res.end('Forbidden')}const file=fs.existsSync(safe)&&fs.statSync(safe).isDirectory()?path.join(safe,'index.html'):safe;fs.readFile(file,(e,d)=>{if(e){res.writeHead(404);return res.end('Not found')}res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});res.end(d)})});
(async()=>{
await new Promise(r=>server.listen(8765,'127.0.0.1',r));
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
let errors=[];
const widths=[320,375,390,414,600,1000];
for(const width of widths){
 const page=await browser.newPage({viewport:{width,height:900},deviceScaleFactor:1});
 await page.goto('http://127.0.0.1:8765/daily-email.html',{waitUntil:'load'});
 await page.evaluate(()=>Promise.all(Array.from(document.images).map(img=>img.decode().catch(()=>null))));
 const result=await page.evaluate(()=>{
  const imgs=Array.from(document.images).map(i=>({alt:i.alt,src:i.src,loaded:i.complete&&i.naturalWidth>0}));
  const w=document.documentElement.scrollWidth;
  const rect=document.querySelector('.email').getBoundingClientRect();
  const list=Array.from(document.querySelectorAll('.news-thumb-cell')).map(x=>x.getBoundingClientRect().right);
  return {scrollWidth:w,emailWidth:rect.width,images:imgs,thumbnailsRight:list};
 });
 const missing=result.images.filter(i=>!i.loaded);
 const overflow=result.scrollWidth>width+1;
 if(missing.length||overflow)errors.push({width,overflow,scrollWidth:result.scrollWidth,broken:missing});
 await page.screenshot({path:path.join(out,'email-'+width+'.png'),fullPage:true});
 console.log(JSON.stringify({width,scrollWidth:result.scrollWidth,emailWidth:result.emailWidth,images:result.images.length,broken:missing.length,overflow}));
 await page.close();
}
const p=await browser.newPage({viewport:{width:1100,height:900}});
await p.goto('http://127.0.0.1:8765/',{waitUntil:'load'});
await p.waitForTimeout(1200);
const iframeHeight=await p.locator('iframe').evaluate(x=>({actual:x.getBoundingClientRect().height,bodyHeight:x.contentDocument.body.scrollHeight}));
await p.screenshot({path:path.join(out,'preview-desktop.png'),fullPage:true});
await p.locator('#mobile').click();
await p.waitForTimeout(800);
await p.screenshot({path:path.join(out,'preview-mobile.png'),fullPage:true});
console.log(JSON.stringify({previewIframe:iframeHeight}));
await browser.close();server.close();
if(errors.length){console.error(JSON.stringify({FAIL:errors},null,2));process.exit(1)}
console.log('PASS: all images load and mobile widths show no horizontal overflow');
})().catch(e=>{console.error(e);process.exit(1)});
