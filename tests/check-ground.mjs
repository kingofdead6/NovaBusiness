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
const errs=[];
p.on('pageerror',e=>errs.push(String(e)));
p.on('console',m=>{ if(m.type()==='error') errs.push(m.text().slice(0,160)); });
await p.goto(URL,{waitUntil:'networkidle'});
await p.waitForTimeout(3500);

const read = () => p.evaluate(()=>{
  const cs=getComputedStyle(document.documentElement);
  return {
    ground: parseFloat(cs.getPropertyValue('--ground')),
    bg: getComputedStyle(document.body).backgroundColor,
    ink: getComputedStyle(document.body).color,
  };
});

const h = await p.evaluate(()=>document.body.scrollHeight);
console.log('page height', h);
const marks=[0,0.2,0.35,0.5,0.7,0.9,1];
const down=[];
for(const m of marks){
  await p.evaluate(y=>window.scrollTo(0,y),Math.round((h-900)*m));
  await p.waitForTimeout(900);
  down.push({at:m, ...(await read())});
}
console.log('\n--- DESCENTE ---');
down.forEach(r=>console.log(`${(r.at*100).toFixed(0).padStart(3)}%  ground=${(r.ground??NaN).toFixed(2)}  bg=${r.bg}`));

const up=[];
for(const m of [...marks].reverse()){
  await p.evaluate(y=>window.scrollTo(0,y),Math.round((h-900)*m));
  await p.waitForTimeout(900);
  up.push({at:m, ...(await read())});
}
console.log('\n--- REMONTÉE ---');
up.forEach(r=>console.log(`${(r.at*100).toFixed(0).padStart(3)}%  ground=${(r.ground??NaN).toFixed(2)}  bg=${r.bg}`));

console.log('\nERRORS:', errs.length? errs.slice(0,4) : 'none');
await b.close();
