import { chromium } from 'playwright';

/*
  L'URL est paramétrable : le port de Vite change d'une session à l'autre
  (il glisse quand le port est déjà pris), et un test qui code son port en
  dur finit par mesurer une AUTRE application — c'est arrivé pendant la
  refonte, et les résultats n'avaient aucun sens.

      NOVA_URL=http://localhost:5180/ node tests/check-bans.mjs
*/
const URL = process.env.NOVA_URL || 'http://localhost:5173/';
const b = await chromium.launch();
const p = await b.newPage({ viewport:{width:1440,height:900} });
await p.goto(URL,{waitUntil:'networkidle'});
await p.waitForTimeout(2500);

const h = await p.evaluate(()=>document.body.scrollHeight);
const rows=[];
for(let i=0;i<=60;i++){
  const y = Math.round((h-900)*(i/60));
  await p.evaluate(v=>window.scrollTo(0,v), y);
  /*
    On attend que le SCRUB soit vraiment retombé avant de mesurer : GSAP
    continue d'assouplir `--ground` après l'arrêt du défilement, si bien
    qu'une mesure trop précoce attrapait la pilule et le bouton à mi-mélange
    — un faux échec intermittent, mais invisible à l'œil puisque le voile
    opaque couvre encore la zone à cet instant.
  */
  await p.waitForTimeout(130);
  await p.evaluate(() => new Promise((r) => {
    let stable = 0, last = null;
    // plafond de sécurité : on ne bloque jamais si la valeur ne se fige pas
    const fin = performance.now() + 900;
    const tick = () => {
      if (performance.now() > fin) return r();
      const g = getComputedStyle(document.documentElement).getPropertyValue('--ground');
      if (g === last) { if (++stable > 6) return r(); } else { stable = 0; last = g; }
      requestAnimationFrame(tick);
    };
    tick();
  }));
  const r = await p.evaluate(()=>{
    /*
      Pendant le balayage, un voile OPAQUE couvre tout ou partie de l'écran :
      le texte qui se trouve dessous n'est pas visible, et le comparer au fond
      du body n'a aucun sens. On saute donc ces instants — c'est précisément
      ce que le balayage garantit : à aucun moment un texte visible ne se
      trouve sur un fond intermédiaire.
    */
    const veil=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--veil')||'0');
    if(veil>0.02) return {worst:99,txt:'(balayage en cours)',pair:'',ground:parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ground'))};
    /*
      Le navigateur renvoie désormais des couleurs en `oklab()` (le fond est
      calculé par `color-mix(in oklab, …)`). Les parser à la main comme du
      rgb() donnait des luminances fausses — d'où un ratio de 1.00 partout.
      On laisse donc le navigateur convertir, via un canvas.
    */
    const cv=document.createElement('canvas');cv.width=cv.height=1;
    const cx=cv.getContext('2d',{willReadFrequently:true});
    const toRgb=(c)=>{cx.clearRect(0,0,1,1);cx.fillStyle='#000';cx.fillStyle=c;
      cx.fillRect(0,0,1,1);const d=cx.getImageData(0,0,1,1).data;return [d[0],d[1],d[2]];};
    const lum=(c)=>{const v=toRgb(c).map(x=>{x/=255;return x<=0.03928?x/12.92:Math.pow((x+0.055)/1.055,2.4);});
      return 0.2126*v[0]+0.7152*v[1]+0.0722*v[2];};
    // real painted backdrop: walk up past transparent backgrounds
    /*
      L'opacité doit être lue APRÈS résolution par le navigateur : les couleurs
      arrivent désormais en `oklab(... / a)`, dont un simple `match` de nombres
      lisait le mauvais champ — un bouton parfaitement contrasté était compté
      en échec parce qu'on remontait au-delà de son propre fond.
    */
    const alphaOf=(c)=>{cx.clearRect(0,0,1,1);cx.fillStyle=c;cx.fillRect(0,0,1,1);
      return cx.getImageData(0,0,1,1).data[3]/255;};
    const backdrop=(el)=>{let n=el;
      while(n&&n!==document.documentElement){
        const bg=getComputedStyle(n).backgroundColor;
        if(bg&&bg!=='transparent'&&alphaOf(bg)>=0.5) return bg;
        n=n.parentElement;}
      return getComputedStyle(document.body).backgroundColor;};
    const els=[...document.querySelectorAll('h1,h2,h3,p,a,li,span,address')].filter(e=>{
      const r=e.getBoundingClientRect();
      if(r.height<8||r.width<8||r.bottom<10||r.top>890) return false;
      if(!e.textContent.trim()) return false;
      // only leaf-ish text nodes
      return [...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim().length>2);
    });
    let worst=99, txt='', pair='';
    for(const e of els){
      const cs=getComputedStyle(e);
      if(parseFloat(cs.opacity)<0.15) continue;
      const L1=lum(cs.color), L2=lum(backdrop(e));
      if(L1===null||L2===null) continue;
      const [hi,lo]=L1>L2?[L1,L2]:[L2,L1];
      const ratio=(hi+0.05)/(lo+0.05);
      if(ratio<worst){worst=ratio;txt=e.textContent.trim().slice(0,30);pair=cs.color+' on '+backdrop(e);}
    }
    return {worst,txt,pair,ground:parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ground'))};
  });
  rows.push({i,...r});
}
const real=rows.filter(r=>r.worst<90);
console.log('steps measured :', real.length);
console.log('worst overall  :', Math.min(...real.map(r=>r.worst)).toFixed(2));
const bad=real.filter(r=>r.worst<4.5);
console.log('steps below AA :', bad.length);
bad.slice(0,10).forEach(r=>console.log(`  step ${r.i} ground=${r.ground.toFixed(2)} ratio=${r.worst.toFixed(2)} "${r.txt}"\n      ${r.pair}`));
await b.close();
