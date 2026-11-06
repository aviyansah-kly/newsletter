const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),http=require('http');
const root=process.cwd(),out=path.join(root,'qa-alternatives-screenshots');
fs.mkdirSync(out,{recursive:true});
const mime={'.html':'text/html','.jpg':'image/jpeg','.svg':'image/svg+xml','.png':'image/png'};
const server=http.createServer((req,res)=>{
const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
const safe=path.resolve(root,'.'+pathname);
if(!safe.startsWith(root)){res.writeHead(403);return res.end('Forbidden')}
const file=fs.existsSync(safe)&&fs.statSync(safe).isDirectory()?path.join(safe,'index.html'):safe;
fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);return res.end('Not found')}
res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});res.end(data)});
});
(async()=>{
await new Promise(resolve=>server.listen(8767,'127.0.0.1',resolve));
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
const errors=[];
for(const filename of ['daily-editorial.html','daily-digest.html']){
for(const width of [320,375,390,414,600,1000]){
const page=await browser.newPage({viewport:{width,height:900},deviceScaleFactor:1});
await page.goto('http://127.0.0.1:8767/'+filename,{waitUntil:'load'});
await page.evaluate(()=>Promise.all([...document.images].map(x=>x.decode().catch(()=>null))));
const result=await page.evaluate(()=>{
const email=document.querySelector('.email');
const images=[...document.images].map(i=>({alt:i.alt,ok:i.complete&&i.naturalWidth>0}));
const text=document.body.innerText;
const unsubscribe=[...document.querySelectorAll('a')].find(a=>a.innerText.includes('Berhenti berlangganan'));
const policy=[...document.querySelectorAll('a')].find(a=>a.innerText.includes('Kebijakan Privasi'));
const editorial=!!document.querySelector('.guardian-heading');
const portrait=document.querySelector('.editor-portrait');
const editorNote=document.querySelector('.editor-note');
const editorCopy=document.querySelector('.editor-byline'),editorPhotoCell=document.querySelector('.editor-photo-cell');
const editorStyle=editorNote&&getComputedStyle(editorNote);
const intro=editorial&&document.querySelector('.editorial-intro');
const brief=editorial&&document.querySelector('.guardian-brief');
const h1=editorial&&document.querySelector('.guardian-heading');
const noSectionGap=editorial?!!intro&&!!brief&&
 Math.abs(intro.getBoundingClientRect().bottom-brief.getBoundingClientRect().top)<=2&&
 Math.abs(editorNote.getBoundingClientRect().bottom-intro.getBoundingClientRect().bottom)<=3&&
 getComputedStyle(intro).borderBottomStyle==='dashed'&&
 getComputedStyle(brief).borderTopStyle==='none':true;
const heroCopyValid=editorial?!!h1&&h1.innerText.includes('Pagi ini,')&&h1.innerText.includes('yang perlu kamu tahu.')&&parseFloat(getComputedStyle(h1).fontSize)<=38:true;
const readableContent=editorial?[...document.querySelectorAll('.editor-note-desc,.editorial-body,.wa-description,.wa-button,.google-button')].every(x=>parseFloat(getComputedStyle(x).fontSize)>=14):true;
const editorPhotoStyle=portrait&&getComputedStyle(portrait);
const editorValid=editorial?!!portrait&&portrait.complete&&portrait.naturalWidth>0&&
  portrait.src.endsWith('/assets/editors/titis-widyatmoko.jpg')&&!!editorNote&&
  document.querySelector('.editor-note-title')?.innerText.includes('Titis Widyatmoko')&&
  document.querySelector('.editor-note-desc')?.innerText.includes('Pagi ini, kami pilihkan kabar')&&
  text.includes('Pemimpin Redaksi Liputan6.com')&&
  editorStyle.borderBottomStyle==='none'&&editorStyle.borderTopStyle==='none'&&
  editorPhotoStyle.clipPath.startsWith('polygon(')&&
  editorCopy.getBoundingClientRect().right<=editorPhotoCell.getBoundingClientRect().left+2 : !portrait;
const wa=document.querySelector('.wa-button'),google=document.querySelector('.google-button');
  const googleLogo=google?.querySelector('img.google-brand-icon');
  const googleLogoValid=!!googleLogo&&googleLogo.complete&&googleLogo.naturalWidth>0&&googleLogo.src.endsWith('Google_icon_2025.png');
  const googleRingValid=!!google&&getComputedStyle(google).animationName.includes('googleRingSpin')&&getComputedStyle(google).backgroundImage.includes('conic-gradient');
 
const panel=document.querySelector('.wa-panel'),pr=panel?.getBoundingClientRect();
const wr=wa?.getBoundingClientRect(),gr=google?.getBoundingClientRect();
const channelsValid=!!wr&&!!gr&&!!pr&&
  wa.getAttribute('href')==='https://whatsapp.com/channel/0029Va7woyJ0AgWCuTizri2W'&&
  google.getAttribute('href')==='https://www.google.com/preferences/source?q=liputan6.com'&&
    googleLogoValid&&googleRingValid&&
  text.includes('Ikuti Liputan6 di kanal pilihanmu')&&
  (innerWidth<=620 ? wr.width>=pr.width*.76&&gr.width>=pr.width*.76&&wr.bottom<=gr.top+2 :
   wr.right<=gr.left+2&&Math.abs(wr.top-gr.top)<3);
const cardLinks=editorial?true:document.querySelectorAll('.fast-fact').length===2&&[...document.querySelectorAll('.fast-fact')].every(c=>!!c.querySelector('a[href*="utm_content=10s_"]'))&&document.querySelectorAll('.article-cta').length===2&&document.querySelectorAll('.summary-link').length>=13&&[...document.querySelectorAll('.summary-link,.article-cta')].every(a=>a.getAttribute('href')?.includes('utm_source=newsletter')&&a.getAttribute('href')?.includes('utm_medium=email'));const paletteValid=editorial?true:getComputedStyle(document.querySelector('.email')).backgroundImage.includes('linear-gradient')&&getComputedStyle(document.querySelector('.time-panel')).backgroundColor==='rgb(247, 248, 249)';
const context=document.querySelector('.digest-context');const contextValid=editorial?true:!!context&&context.querySelectorAll('tr').length===3&&[...context.querySelectorAll('p')].some(x=>x.textContent.trim()==='APA YANG TERJADI?')&&getComputedStyle(context).borderTopStyle==='solid';const image=editorial?document.querySelector('.guardian-photo'):document.querySelector('.digest-feature-img');
const copy=editorial?document.querySelector('.guardian-story-title'):document.querySelector('.digest-feature-copy');
const card=editorial?document.querySelector('.email'):document.querySelector('.digest-feature');
const imageRect=image?.getBoundingClientRect(),copyRect=copy?.getBoundingClientRect(),cardRect=card?.getBoundingClientRect();
const imageLayout=!!imageRect&&!!copyRect&&!!cardRect&&(editorial?
 Math.abs(imageRect.left-copyRect.left)<=2&&Math.abs(imageRect.width-copyRect.width)<=3&&imageRect.top>=copyRect.bottom-2&&getComputedStyle(image).borderTopLeftRadius==='12px':
 (innerWidth<=620?imageRect.width>=cardRect.width-4&&imageRect.bottom<=copyRect.top+3:imageRect.left>copyRect.left+copyRect.width-4));
return {scrollWidth:document.documentElement.scrollWidth,emailWidth:email?.getBoundingClientRect().width,
images:images.length,broken:images.filter(i=>!i.ok),imageLayout,contextValid,cardLinks,paletteValid,editorValid,channelsValid,noSectionGap,heroCopyValid,readableContent,
copy:text.includes('Redaksi Liputan6')&&text.includes('Ringkasan Pagi')&&text.includes('nama@email.com')&&text.includes('Berhenti berlangganan'),
design:editorial?(
 text.includes('Tiga kabar, satu menit.')&&
 text.includes('FOKUS HARI INI')&&
 text.includes('APA YANG TERJADI?')&&
 text.includes('MENGAPA INI PENTING?')&&
 text.includes('Dua cerita untuk dilanjutkan.')&&
 getComputedStyle(document.querySelector('.guardian-heading')).fontFamily.includes('Playfair Display')&&
 document.querySelectorAll('.related-photo').length===2&&
 text.indexOf('Tiga kabar, satu menit.')<text.indexOf('FOKUS HARI INI')&&
 text.indexOf('FOKUS HARI INI')<text.indexOf('Dua cerita untuk dilanjutkan.')
):
 ['Kalau cuma punya 10 detik','Kalau punya 30 detik','Kalau punya 1 menit','QUICK HITS','Punya 2 menit? Ini konteksnya.'].every(s=>text.includes(s))&&text.indexOf('Kalau cuma punya 10 detik')<text.indexOf('Kalau punya 30 detik')&&text.indexOf('Kalau punya 30 detik')<text.indexOf('Kalau punya 1 menit')&&document.querySelectorAll('.time-panel').length===2&&!!document.querySelector('.digest-hero-title'),
privacy:policy?.getAttribute('href')==='https://www.liputan6.com/info/disclaimer',
unsubscribe:unsubscribe?.getAttribute('href')==='{{unsubscribe_url}}',
footer:!!document.querySelector('.footer-content')&&!!document.querySelector('.wa-panel'),
placeholder:/\b(dummy|placeholder|lorem ipsum|generated by ai)\b/i.test(text)};
});
await page.hover('.google-button');
const googleHoverOK=await page.evaluate(()=>{
 const btn=document.querySelector('.google-button'),style=btn&&getComputedStyle(btn);
 return !!style&&style.backgroundImage.includes('linear-gradient')&&style.backgroundImage.includes('conic-gradient')&&
 style.getPropertyValue('--google-fill').trim()==='#F3F8FE'&&
 btn.querySelector('.google-brand-icon')?.getBoundingClientRect().width>=18&&btn.getBoundingClientRect().width>=150;
});
const pass=result.scrollWidth<=width+1&&result.images>=9&&result.broken.length===0&&result.imageLayout&&result.contextValid&&result.cardLinks&&result.paletteValid&&result.editorValid&&result.channelsValid&&result.noSectionGap&&result.heroCopyValid&&result.readableContent&&googleHoverOK&&result.copy&&result.design&&result.privacy&&result.unsubscribe&&result.footer&&!result.placeholder;
console.log(JSON.stringify({filename,width,pass,scrollWidth:result.scrollWidth,emailWidth:result.emailWidth,images:result.images,broken:result.broken.length,imageLayout:result.imageLayout}));
if(!pass)errors.push({filename,width,...result});
await page.screenshot({path:path.join(out,filename.replace('.html','')+'-'+width+'.png'),fullPage:true});
await page.close();
}}
const compare=await browser.newPage({viewport:{width:1200,height:900}});
await compare.goto('http://127.0.0.1:8767/daily-alternatives.html',{waitUntil:'load'});
const links=await compare.locator('.cards .button').count();
if(links!==3)errors.push({comparisonLinks:links});
await compare.screenshot({path:path.join(out,'comparison-desktop.png'),fullPage:true});
await compare.close();
await browser.close();server.close();
if(errors.length){console.error(JSON.stringify({FAIL:errors},null,2));process.exit(1)}
console.log('PASS: both alternative Daily designs and comparison page have working layout and links');
})().catch(e=>{console.error(e);process.exit(1)});
