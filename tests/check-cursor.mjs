import { chromium } from 'playwright';

/*
  LE CURSEUR SUIT LE FOND
  ============================================================================
  Le disque doit être peint en `ciel` sur le fond clair et en `contraste` sur
  le ciel — donc s'inverser aux trois bascules de la page.

  Ce test existe parce que la panne était SILENCIEUSE : le curseur lisait la
  luminance en parsant la chaîne CSS, ce qui a cessé de fonctionner quand le
  fond est passé en `color-mix(in oklab, …)`. Les composantes `oklab` vont de
  0 à 1, l'ancien parseur les divisait par 255, trouvait une luminance quasi
  nulle, et le curseur se croyait en permanence sur du sombre. Rien ne
  plantait ; le disque était simplement invisible sur le fond clair.
*/

const URL = process.env.NOVA_URL || 'http://localhost:5173/';
const CIEL = 'rgb(46, 26, 71)';
const CONTRASTE = 'rgb(237, 226, 204)';

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(URL, { waitUntil: 'networkidle' });
await p.waitForTimeout(3400);

const h = await p.evaluate(() => document.body.scrollHeight);

const lire = async (frac) => {
  await p.evaluate((v) => window.scrollTo(0, v), Math.round((h - 900) * frac));
  await p.waitForTimeout(1500);
  await p.mouse.move(500, 480);
  await p.waitForTimeout(800);
  return p.evaluate(() => {
    const dot = [...document.querySelectorAll('div')].find((d) => {
      const cs = getComputedStyle(d);
      return cs.position === 'fixed' && cs.width === '12px' && cs.borderRadius.includes('9999');
    });
    return {
      dot: dot ? getComputedStyle(dot).backgroundColor : null,
      ground: document.documentElement.getAttribute('data-ground-state'),
    };
  });
};

const points = [0.02, 0.24, 0.6, 0.995];
let echecs = 0;

for (const f of points) {
  const r = await lire(f);
  const attendu = r.ground === 'ciel' ? CONTRASTE : CIEL;
  const ok = r.dot === attendu;
  if (!ok) echecs += 1;
  console.log(
    `${ok ? 'PASS' : 'FAIL'}  fond=${String(r.ground).padEnd(6)} curseur=${r.dot}` +
      (ok ? '' : `  (attendu ${attendu})`)
  );
}

console.log(echecs ? `\n${echecs} ÉCHEC(S)` : '\nLe curseur suit le fond partout');
await b.close();
if (echecs) process.exit(1);
