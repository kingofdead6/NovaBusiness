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
await p.waitForTimeout(2600);

const css = await p.evaluate(async ()=>{
  let out='';
  for(const s of document.styleSheets){
    try{ for(const r of s.cssRules) out+=r.cssText; }catch(e){}
  }
  return out;
});
const fail=[];
const check=(name,cond,detail='')=>{ console.log((cond?'PASS':'FAIL')+'  '+name+(detail?'  '+detail:'')); if(!cond) fail.push(name); };

check('aucune animation en boucle', !/animation[^;]*infinite/.test(css));
check('aucun radial-gradient décoratif', (css.match(/radial-gradient/g)||[]).filter(x=>true).length<=2, '(2 = masque du projecteur)');
check('aucun text-shadow', !/text-shadow/.test(css));

const dom = await p.evaluate(()=>{
  /*
    Le §09 vise la gélule DÉCORATIVE. Sont donc légitimes : tout ce qui est
    cliquable, le curseur maison (il EST le curseur) et le conteneur de la
    barre flottante (c'est une barre, pas une étiquette).
  */
  const pills=[...document.querySelectorAll('.rounded-full')].filter(e=>{
    const t=e.tagName.toLowerCase();
    if(t==='a'||t==='button'||e.closest('a,button')) return false;
    if(e.closest('header')) return false;
    if(e.getAttribute('aria-hidden')==='true') return false;
    return true;
  }).map(e=>e.className.slice(0,60));
  /*
    `©` est un signe légal, pas un emoji décoratif : on l'exclut
    explicitement plutôt que d'élargir le test.
  */
  const emoji=(document.body.innerText.match(/\p{Extended_Pictographic}/gu)||[]).filter(c=>c!=='©');
  const arrows=(document.body.innerText.match(/[↑↓←→↗↘]/g)||[]);
  const h1=document.querySelectorAll('h1').length;
  const overflowX=getComputedStyle(document.documentElement).overflowX;
  return {pills, emoji, arrows, h1, overflowX};
});
check('aucune gélule décorative', dom.pills.length===0, dom.pills.length?JSON.stringify(dom.pills):'');
check('aucun emoji', dom.emoji.length===0);
check('aucune flèche glyphe', dom.arrows.length===0, dom.arrows.join(''));
check('un seul <h1>', dom.h1===1, 'trouvé '+dom.h1);
check('overflow-x pas hidden sur <html>', dom.overflowX!=='hidden', dom.overflowX);

console.log('\n'+(fail.length?('ÉCHECS: '+fail.join(', ')):'TOUT PASSE'));
await p.screenshot({path:'shot-hero.png'});
await b.close();
