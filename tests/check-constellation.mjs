import { chromium } from 'playwright';

/*
  LE RÉCIT DE LA CONSTELLATION
  ============================================================================
  Le §02 doit se jouer entièrement au défilement, dans l'ordre :

    1. les points sont DÉJÀ LÀ, aucun trait     (« rien n'était né »)
    2. les traits se dessinent                  (on relie ce qui existait)
    3. UNE étoile s'embrase, rayons dessinés    (l'embrasement)
    4. la figure se retire, l'étoile RESTE      (ce qui est visible le reste)

  Et tout doit être RÉVERSIBLE (§07).

  Ce test existe parce que la panne serait silencieuse : un déclencheur mal
  ancré (le SVG est `sticky`, il ne bouge pas dans la fenêtre) donnerait une
  progression figée à zéro. Rien ne planterait ; le récit ne se jouerait
  simplement jamais.
*/

const URL = process.env.NOVA_URL || 'http://localhost:5173/';

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(URL, { waitUntil: 'networkidle' });
await p.waitForTimeout(3400);

const scope = await p.evaluate(() => {
  const n = document.querySelector('[data-constellation-scope]');
  return n ? { top: n.offsetTop, height: n.offsetHeight } : null;
});

if (!scope) {
  console.log('FAIL  aucune constellation trouvée');
  await b.close();
  process.exit(1);
}

const lire = async (frac) => {
  await p.evaluate(
    (v) => window.scrollTo(0, v),
    Math.round(scope.top + (scope.height - 900) * frac)
  );
  await p.waitForTimeout(1100);
  return p.evaluate(() => {
    const svg = document.querySelector('[data-constellation-scope] svg[viewBox="0 0 100 80"]');
    const dessines = (sel) =>
      [...svg.querySelectorAll(sel)].filter((n) => Number(n.style.strokeDashoffset) < 0.5).length;
    return {
      traits: dessines('[data-trait]'),
      rayons: dessines('[data-rayon]'),
      novaR: Number(svg.querySelector('[data-nova]').getAttribute('r')),
    };
  });
};

let echecs = 0;
const check = (nom, ok, detail = '') => {
  if (!ok) echecs += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${nom}${detail ? '  ' + detail : ''}`);
};

const debut = await lire(0.05);
check('1 · ciel sans repère (aucun trait)', debut.traits === 0, `traits=${debut.traits}`);

const milieu = await lire(0.5);
check('2 · les points se rattachent', milieu.traits > 0 && milieu.traits < 8, `traits=${milieu.traits}/8`);

const feu = await lire(0.8);
check('3 · embrasement (rayons + croissance)', feu.rayons === 6 && feu.novaR > debut.novaR,
  `rayons=${feu.rayons}/6 r=${debut.novaR}→${feu.novaR}`);

const fin = await lire(1);
check('4 · la figure se retire, l\'étoile reste',
  fin.traits === 0 && fin.novaR >= feu.novaR,
  `traits=${fin.traits}/8 r=${fin.novaR}`);

// réversibilité : remonter doit défaire le récit
const retour = await lire(0.05);
check('réversible (remonter défait le récit)', retour.traits === 0 && retour.rayons === 0,
  `traits=${retour.traits} rayons=${retour.rayons}`);

console.log(echecs ? `\n${echecs} ÉCHEC(S)` : '\nLe récit se joue en entier, dans les deux sens');
await b.close();
if (echecs) process.exit(1);
