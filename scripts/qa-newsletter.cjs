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
 await page.goto('http://127.0.0.1:8765/',{waitUntil:'load'});
 await page.evaluate(()=>Promise.all(Array.from(document.images).map(img=>img.decode().catch(()=>null))));
 const result=await page.evaluate(()=>{
  const imgs=Array.from(document.images).map(i=>({alt:i.alt,src:i.src,loaded:i.complete&&i.naturalWidth>0}));
  const fontWeights=Array.from(document.querySelectorAll('h1,h2,h3,.newshead,.wa-title')).map(n=>parseInt(getComputedStyle(n).fontWeight,10));const maxFontWeight=Math.max(...fontWeights);const isRounded=getComputedStyle(document.querySelector('.wa-button')).borderRadius==='999px';const waAnimation=getComputedStyle(document.querySelector('.wa-button')).animationName;const highlight=document.querySelector('h1')?.textContent?.includes('Sorotan Hari Ini');
  const w=document.documentElement.scrollWidth;
  const rect=document.querySelector('.email').getBoundingClientRect();
  const list=Array.from(document.querySelectorAll('.news-thumb-cell')).map(x=>x.getBoundingClientRect().right);
  const panel=document.querySelector('.wa-panel');
  const button=document.querySelector('.wa-button');
  const title=document.querySelector('.wa-title');
  const desc=document.querySelector('.wa-description');
  const panelWidth=panel?.getBoundingClientRect().width||0;
  const buttonWidth=button?.getBoundingClientRect().width||0;
  const titleCentered=title&&getComputedStyle(title).textAlign==='center';
  const descCentered=desc&&getComputedStyle(desc).textAlign==='center';
  const iconPresent=!!button?.querySelector('img[src$="/WA.svg"]');
  return {scrollWidth:w,emailWidth:rect.width,images:imgs,thumbnailsRight:list,maxFontWeight,isRounded,waAnimation,highlight,previewControls:document.querySelectorAll('#desktop,#mobile,iframe,.toggle').length,wa:{panelWidth,buttonWidth,titleCentered,descCentered,iconPresent}};
 });
 const missing=result.images.filter(i=>!i.loaded);
 const overflow=result.scrollWidth>width+1;
 if(missing.length||overflow||result.maxFontWeight>700||!result.isRounded||!result.highlight||result.previewControls||!result.wa.titleCentered||!result.wa.descCentered||!result.wa.iconPresent||result.wa.buttonWidth<result.wa.panelWidth*0.78)errors.push({width,overflow,scrollWidth:result.scrollWidth,broken:missing,previewControls:result.previewControls,whatsApp:result.wa});
 await page.screenshot({path:path.join(out,'email-'+width+'.png'),fullPage:true});
 console.log(JSON.stringify({width,scrollWidth:result.scrollWidth,emailWidth:result.emailWidth,images:result.images.length,broken:missing.length,overflow,previewControls:result.previewControls,wa:result.wa}));
 await page.close();
}
const p=await browser.newPage({viewport:{width:1100,height:900}});
await p.goto('http://127.0.0.1:8765/',{waitUntil:'load'});
await p.evaluate(()=>Promise.all(Array.from(document.images).map(img=>img.decode().catch(()=>null))));
await p.screenshot({path:path.join(out,'preview-desktop.png'),fullPage:true});
const mobile=await browser.newPage({viewport:{width:375,height:900},deviceScaleFactor:1});
await mobile.goto('http://127.0.0.1:8765/',{waitUntil:'load'});
await mobile.evaluate(()=>Promise.all(Array.from(document.images).map(img=>img.decode().catch(()=>null))));
await mobile.screenshot({path:path.join(out,'preview-mobile.png'),fullPage:true});
const direct=await browser.newPage({viewport:{width:375,height:900}});
await direct.goto('http://127.0.0.1:8765/daily-email.html',{waitUntil:'load'});
const same=await direct.evaluate(()=>document.body.innerText.includes('BERITA PILIHAN')&&document.body.innerText.includes('Berita terbaru lewat WhatsApp')&&document.body.innerText.includes('Sorotan Hari Ini'));
if(!same)errors.push({directEmail:"Mismatch with home page"});
await direct.close();await mobile.close();await p.close();
await browser.close();server.close();
if(errors.length){console.error(JSON.stringify({FAIL:errors},null,2));process.exit(1)}
console.log('PASS: root preview and direct email are responsive without toggle/iframe, all images load');
})().catch(e=>{console.error(e);process.exit(1)});
