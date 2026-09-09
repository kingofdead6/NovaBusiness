import { readFileSync, readdirSync } from 'fs';

/*
  LA RÈGLE DES DEUX COULEURS, RENDUE MÉCANIQUE (§04)
  ============================================================================
  « Le site n'a jamais plus de deux couleurs à l'écran en même temps. »

  Une règle qu'on se contente d'énoncer dérive. La version précédente du site
  en est la preuve : sa palette vivait à trois endroits, plus une vingtaine de
  littéraux enfouis dans le CSS du pied de page, et les trois avaient divergé.

  Ce test échoue donc sur TOUTE couleur écrite en dur hors de la source
  unique. C'est ce qui tient la ligne, bien plus qu'une consigne.
*/
const ALLOWED = ['src/lib/tokens.js'];

const walk = (d) =>
  readdirSync(d, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(`${d}/${e.name}`) : [`${d}/${e.name}`]
  );

const files = walk('src').filter((f) => /\.(jsx?|css)$/.test(f));
const hits = [];

for (const f of files) {
  if (ALLOWED.some((a) => f.endsWith(a.replace('src/', '')) && f.includes('tokens'))) continue;
  readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
    // on ignore les commentaires et le noir/blanc des masques SVG
    const code = line.split('//')[0];
    if (/^\s*\*/.test(line)) return;
    const m = code.match(/#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)/g);
    if (!m) return;
    const bad = m.filter((c) => !/^#(000|fff|000000|ffffff)$/i.test(c));
    if (bad.length) hits.push(`${f}:${i + 1}  ${bad.join(' ')}`);
  });
}

if (hits.length) {
  console.log('ÉCHEC — couleurs écrites en dur hors de src/lib/tokens.js :\n');
  hits.forEach((h) => console.log('  ' + h));
  process.exit(1);
}
console.log('PASS  aucune couleur en dur hors de la source unique');
