import { chromium } from 'playwright';

/*
  LES TITRES FRAPPÉS NE SONT NI DOUBLÉS NI TRONQUÉS
  ============================================================================
  `TypedHeading` superpose DEUX exemplaires du titre : un fantôme qui réserve
  la place, et l'exemplaire vivant dans lequel typed.js écrit.

  Deux pannes possibles, toutes deux constatées :

    DOUBLÉ   — le fantôme perd son style et devient visible. C'est arrivé
               quand les règles `.typed-*` ont disparu de la feuille de
               styles : tous les titres frappés s'affichaient deux fois.

    TRONQUÉ  — la réserve de hauteur vaut une ligne de moins que le texte
               réel, et la dernière ligne est coupée.

  Ni l'une ni l'autre ne lève d'erreur : seule une mesure les attrape.
*/

const URL = process.env.NOVA_URL || 'http://localhost:5173/';

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(URL, { waitUntil: 'networkidle' });
await p.waitForTimeout(3400);

const h = await p.evaluate(() => document.body.scrollHeight);
const vus = new Map();

// on parcourt la page : chaque titre ne se joue qu'une fois à l'écran
for (let f = 0.28; f <= 0.88; f += 0.025) {
  await p.evaluate((v) => window.scrollTo(0, v), Math.round((h - 900) * f));
  await p.waitForTimeout(1200);
  const lot = await p.evaluate(() =>
    [...document.querySelectorAll('.typed-slot')]
      .filter((s) => {
        const b = s.getBoundingClientRect();
        return b.top < 820 && b.bottom > 80;
      })
      .map((s) => {
        const label = s.getAttribute('aria-label') || '';
        const vu = s.innerText.replace(/\s+/g, ' ').trim();
        const live = s.querySelector('.typed-live').getBoundingClientRect().height;
        const slot = s.getBoundingClientRect().height;
        return {
          label,
          double: vu.length > label.length * 1.6,
          tronque: live > slot + 2,
        };
      })
  );
  lot.forEach((x) => vus.set(x.label, x));
}

let echecs = 0;
for (const [label, v] of vus) {
  const ok = !v.double && !v.tronque;
  if (!ok) echecs += 1;
  console.log(
    `${ok ? 'PASS' : 'FAIL'}  ${label.slice(0, 34)}` +
      (ok ? '' : `  ${v.double ? 'DOUBLÉ ' : ''}${v.tronque ? 'TRONQUÉ' : ''}`)
  );
}

if (!vus.size) {
  console.log('FAIL  aucun titre frappé rencontré');
  echecs = 1;
}

console.log(
  echecs ? `\n${echecs} PROBLÈME(S)` : `\n${vus.size} titres frappés, aucun doublé ni tronqué`
);
await b.close();
if (echecs) process.exit(1);
