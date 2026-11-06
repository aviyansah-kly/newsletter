const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),http=require('http');
const root=process.cwd(),out=path.join(root,'qa-weekly-screenshots');
fs.mkdirSync(out,{recursive:true});
const mime={'.html':'text/html','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const safe=path.resolve(root,'.'+pathname);if(!safe.startsWith(root)){res.writeHead(403);return res.end('Forbidden')}const file=fs.existsSync(safe)&&fs.statSync(safe).isDirectory()?path.join(safe,'index.html'):safe;fs.readFile(file,(e,d)=>{if(e){res.writeHead(404);return res.end('Not found')}res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});res.end(d)})});
(async()=>{
await new Promise(r=>server.listen(8766,'127.0.0.1',r));
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
const errors=[];
for(const width of [320,375,390,414,600,1000]){
const page=await browser.newPage({viewport:{width,height:900},deviceScaleFactor:1});
await page.goto('http://127.0.0.1:8766/weekly.html',{waitUntil:'load'});
await page.evaluate(()=>Promise.all([...document.images].map(x=>x.decode().catch(()=>null))));
const result=await page.evaluate(()=>{
const images=[...document.images].map(x=>({alt:x.alt,ok:x.complete&&x.naturalWidth>0}));
const email=document.querySelector('.email'),footer=document.querySelector('.footer-content'),panel=document.querySelector('.wa-panel');
const p=panel?.getBoundingClientRect(),f=footer?.getBoundingClientRect();
const wa=panel?.querySelector('.wa-button'),google=panel?.querySelector('.google-button');
const wr=wa?.getBoundingClientRect(),gr=google?.getBoundingClientRect();
const channelsValid=!!p&&!!wr&&!!gr&&!!wa&&!!google&&
  wa.getAttribute('href')==='https://whatsapp.com/channel/0029Va7woyJ0AgWCuTizri2W'&&
  google.getAttribute('href')==='https://www.google.com/preferences/source?q=liputan6.com'&&
  panel.innerText.includes('kanal pilihanmu')&&
  (innerWidth<=620?wr.width>=p.width*.76&&gr.width>=p.width*.76&&wr.bottom<=gr.top+2:
    wr.right<=gr.left+2&&Math.abs(wr.top-gr.top)<3);
return {
scrollWidth:document.documentElement.scrollWidth,emailWidth:email.getBoundingClientRect().width,images:images.length,broken:images.filter(x=>!x.ok),
weight:Math.max(...[...document.querySelectorAll('h1,h2,h3')].map(x=>parseInt(getComputedStyle(x).fontWeight,10))),
sections:['Minggu ini dalam 60 detik','Cerita Minggu Ini','Yang dekat dengan harimu','YANG RAMAI DIPERTANYAKAN','CATAT UNTUK MINGGU DEPAN'].every(x=>document.body.innerText.includes(x)),
 title:document.querySelector('h1')?.innerText.includes('Minggu ini'),
footer:!!footer&&footer.innerText.includes('Ringkasan Mingguan')&&footer.innerText.includes('Jelajahi Liputan6'),
channelsValid,panelFull:!!p&&Math.abs(p.width-email.getBoundingClientRect().width)<2,digestBox:!!document.querySelector('.digest-box')&&getComputedStyle(document.querySelector('.digest-box')).borderTopLeftRadius==='14px',
blend:!!document.querySelector('.weekly-digest-backdrop')&&getComputedStyle(document.querySelector('.weekly-digest-backdrop')).backgroundImage.includes('linear-gradient'),
coverFull:!!document.querySelector('.weekly-cover')&&Math.abs(document.querySelector('.weekly-cover').getBoundingClientRect().width-email.getBoundingClientRect().width)<2,
impactIcon:!![...document.querySelectorAll('.weekly-impact span')].find(el=>el.innerText.includes('💡')),
briefPhoto:!!document.querySelector('.weekly-brief-img')&&document.querySelector('.weekly-brief-img').getBoundingClientRect().width>=96,
featureHeading:!!document.querySelector('.weekly-feature-heading')&&parseInt(getComputedStyle(document.querySelector('.weekly-feature-heading')).fontSize,10)>=23,
watchCard:!!document.querySelector('.weekly-next')&&getComputedStyle(document.querySelector('.weekly-next')).borderTopLeftRadius==='12px'&&document.body.innerText.includes('Dua hal yang perlu dipantau'),
mobileBrief:(()=>{
const card=document.querySelector('.weekly-brief')?.getBoundingClientRect(),photo=document.querySelector('.weekly-brief-img')?.getBoundingClientRect(),copy=document.querySelector('.weekly-brief-copy')?.getBoundingClientRect();
if(!card||!photo||!copy)return false;
return window.innerWidth<=620 ? photo.width>=card.width-3&&photo.bottom<=copy.top+2 : photo.left>copy.left+copy.width-3;
})(),
recapGap:(()=>{
const intro=document.querySelector('.weekly-intro')?.getBoundingClientRect(),digest=document.querySelector('.digest-box')?.getBoundingClientRect(),feature=document.querySelector('.weekly-feature-header')?.getBoundingClientRect();
return !!intro&&!!digest&&!!feature&&digest.top-intro.bottom<=14&&feature.top-digest.bottom<=24;
})(),
legal:!!footer&&footer.innerText.includes('Ringkasan Mingguan')&&footer.innerText.includes('nama@email.com')&&!!footer.querySelector('a[href="https://www.liputan6.com/info/disclaimer"]')&&!!footer.querySelector('a[href="{{unsubscribe_url}}"]'),
signature:!!document.querySelector('.weekly-signature')&&document.querySelector('.weekly-signature').innerText.includes('Redaksi Liputan6'),
digestContained:!!document.querySelector('.digest-box')&&!document.querySelector('.digest-box').contains(document.querySelector('.weekly-cover'))&&document.querySelector('.digest-box').getBoundingClientRect().bottom<document.querySelector('.weekly-cover').getBoundingClientRect().top,
noEditorialCtas:!/(Baca selengkapnya|Ikuti perkembangan selengkapnya|Ikuti update terbaru)/.test(document.body.innerText),
panelFooterTouch:!!(p&&f&&Math.abs(p.bottom-f.top)<3),
placeholder:/\b(dummy|placeholder|lorem ipsum|generated by ai)\b/i.test(document.body.innerText)
};
});
const overflow=result.scrollWidth>width+1;
if(overflow||result.broken.length||result.weight>700||!result.sections||!result.digestBox||!result.blend||!result.coverFull||!result.impactIcon||!result.briefPhoto||!result.featureHeading||!result.watchCard||!result.mobileBrief||!result.recapGap||!result.signature||!result.legal||!result.digestContained||!result.noEditorialCtas||!result.title||!result.footer||!result.channelsValid||!result.panelFull||!result.panelFooterTouch||result.placeholder)errors.push({width,...result,overflow});
await page.screenshot({path:path.join(out,'weekly-'+width+'.png'),fullPage:true});
console.log(JSON.stringify({width,scrollWidth:result.scrollWidth,emailWidth:result.emailWidth,images:result.images,broken:result.broken.length,overflow,sections:result.sections,briefStack:result.mobileBrief,recapGap:result.recapGap,waFull:result.panelFull}));
await page.close();
}
const direct=await browser.newPage({viewport:{width:375,height:900}});
await direct.goto('http://127.0.0.1:8766/weekly-email.html',{waitUntil:'load'});
const directMatch=await direct.evaluate(()=>document.body.innerText.includes('Minggu ini dalam 60 detik')&&document.body.innerText.includes('Minggu ini')&&document.body.innerText.includes('Ikuti Liputan6 di kanal pilihanmu'));
if(!directMatch)errors.push({directMatch:false});
await direct.close();
await browser.close();server.close();
if(errors.length){console.error(JSON.stringify({FAIL:errors},null,2));process.exit(1)}
console.log('PASS: Weekly and weekly-email responsive, images decoded, editorial sections complete');
})().catch(e=>{console.error(e);process.exit(1)});
