import { chromium, devices } from 'playwright';

/*
  LE TÉLÉPHONE A DROIT AU MÊME SITE
  ============================================================================
  Trois pannes constatées, toutes silencieuses :

    1. La CONSTELLATION — la pièce centrale du site — était en `lg:block`,
       donc purement et simplement absente sous 1024 px. Le téléphone se
       retrouvait privé du récit du §02.

    2. Toutes les PLANCHES gravées étaient masquées de la même façon : le
       monde astronomique disparaissait, et il ne restait que du texte.

    3. Le bouton « parlons-en » est masqué sous 768 px pour que la pilule
       tienne — et le menu mobile ne portait aucun contact. Il n'existait
       donc AUCUN chemin vers le contact depuis un téléphone.

  Aucune de ces trois ne lève d'erreur : seule une vérification les attrape.
*/

const URL = process.env.NOVA_URL || 'http://localhost:5173/';

const b = await chromium.launch();
const p = await b.newPage({ ...devices['iPhone 13'] });
const erreurs = [];
p.on('pageerror', (x) => erreurs.push(String(x).slice(0, 140)));

await p.goto(URL, { waitUntil: 'networkidle' });
await p.waitForTimeout(4200);

let echecs = 0;
const check = (nom, ok, detail = '') => {
  if (!ok) echecs += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${nom}${detail ? '  ' + detail : ''}`);
};

const h = await p.evaluate(() => document.body.scrollHeight);

/* --- pas de débordement horizontal --- */
const large = await p.evaluate(() => ({
  scrollW: document.documentElement.scrollWidth,
  vw: window.innerWidth,
}));
check('aucun débordement horizontal', large.scrollW <= large.vw, `${large.scrollW} / ${large.vw}`);

/* --- la constellation existe et se joue --- */
const scope = await p.evaluate(() => {
  const n = document.querySelector('[data-constellation-scope]');
  return n ? { top: n.offsetTop, height: n.offsetHeight } : null;
});
check('la constellation est présente', !!scope);

if (scope) {
  await p.evaluate((v) => window.scrollTo(0, v), Math.round(scope.top + (scope.height - 664) * 0.8));
  await p.waitForTimeout(1600);
  const c = await p.evaluate(() => {
    const svg = document.querySelector('[data-constellation-scope] svg[viewBox="0 0 100 80"]');
    if (!svg) return null;
    const visible = svg.getBoundingClientRect().width > 40;
    const traits = [...svg.querySelectorAll('[data-trait]')].filter(
      (n) => Number(n.style.strokeDashoffset) < 0.5
    ).length;
    return { visible, traits };
  });
  check('la constellation est visible', !!c && c.visible);
  check('le récit se joue', !!c && c.traits > 0, c ? `${c.traits}/8 traits` : '');

  /* --- la scène épinglée tient dans l'écran --- */
  await p.evaluate((v) => window.scrollTo(0, v), Math.round(scope.top + (scope.height - 664) * 0.3));
  await p.waitForTimeout(1400);
  const tient = await p.evaluate(() => {
    const panel = document.querySelector('[data-constellation-scope] .sticky');
    const kids = [...panel.querySelector('.edge').children];
    const haut = kids[0].getBoundingClientRect().top;
    const bas = kids[kids.length - 1].getBoundingClientRect().bottom;
    return { haut: Math.round(haut), bas: Math.round(bas), vp: window.innerHeight };
  });
  check(
    'la scène épinglée tient dans l\'écran',
    tient.haut >= 0 && tient.bas <= tient.vp,
    `${tient.haut} → ${tient.bas} / ${tient.vp}`
  );
}

/* --- TOUTES les sections sont rendues --- */
/*
  Ce contrôle existe parce que `<Values />` a disparu de `App.jsx` lors d'une
  édition : l'import restait, la section ne se montait plus, et RIEN ne
  signalait la perte — ni le build, ni aucun test. Le récit du site avait
  simplement un chapitre en moins.
*/
const attendues = ['top', 'studio', 'services', 'realisations', 'journal', 'contact'];
// `<footer id="contact">` n'est pas une <section> : on interroge les deux
const presentes = await p.evaluate(() =>
  [...document.querySelectorAll('section[id], footer[id]')].map((s) => s.id)
);
const manquantes = attendues.filter((id) => !presentes.includes(id));
check('toutes les sections sont rendues', manquantes.length === 0,
  manquantes.length ? 'manquantes : ' + manquantes.join(', ') : `${presentes.length} sections`);

/* --- au moins une planche gravée est rendue --- */
const planches = await p.evaluate(
  () =>
    [...document.querySelectorAll('.engraving')].filter(
      (n) => n.getBoundingClientRect().width > 20
    ).length
);
check('des planches gravées sont rendues', planches > 0, `${planches} visible(s)`);

/* --- le contact est joignable depuis le menu --- */
await p.evaluate(() => window.scrollTo(0, 0));
await p.waitForTimeout(900);
await p.locator('header button').click();
await p.waitForTimeout(1300);
const contact = await p.evaluate(() =>
  [...document.querySelectorAll('a')].some((a) => a.getAttribute('href')?.startsWith('mailto:'))
);
check('le contact est joignable depuis le menu', contact);

/* --- les fonds basculent, et se rejouent à l'envers --- */
const marks = [0, 0.2, 0.4, 0.6, 0.8, 1];
const lire = async (m) => {
  await p.evaluate((v) => window.scrollTo(0, v), Math.round((h - 664) * m));
  await p.waitForTimeout(950);
  return p.evaluate(() => document.documentElement.getAttribute('data-ground-state'));
};
await p.keyboard.press('Escape');
await p.waitForTimeout(600);
const descente = [];
for (const m of marks) descente.push(await lire(m));
const remontee = [];
for (const m of [...marks].reverse()) remontee.push(await lire(m));
remontee.reverse();

check('les fonds basculent', new Set(descente).size > 1, descente.join(' '));
check('les fonds sont réversibles', JSON.stringify(descente) === JSON.stringify(remontee));

check('aucune erreur console', erreurs.length === 0, erreurs.join(' | '));

console.log(echecs ? `\n${echecs} PROBLÈME(S)` : '\nLe téléphone a bien le même site');
await b.close();
if (echecs) process.exit(1);
