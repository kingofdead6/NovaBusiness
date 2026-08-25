/**
 * GÉOMÉTRIE LIQUIDE — 100 % procédurale et DÉTERMINISTE.
 *
 * Tout est fonction d'un seul paramètre `p` (progression de scroll, 0 → 1).
 * Aucune notion de temps : à `p` égal, la forme est rigoureusement identique.
 * C'est ce qui permet au scroll d'être la seule source de vérité — avancer,
 * reculer ou s'arrêter à mi-chemin donne toujours l'état attendu.
 *
 * La matière n'est pas une simple vague : c'est une topologie « papier
 * découpé » comme dans la référence —
 *   1. un FRONT continu qui monte, aux lobes bulbeux reliés par des cols
 *      étroits (plus proche des métaboules que d'une sinusoïde) ;
 *   2. des ÎLOTS détachés qui précèdent le front et fusionnent avec lui ;
 *   3. des TROUS fermés à l'intérieur de la masse, qui se résorbent.
 *
 * Îlots et trous sont émis dans le MÊME `d` que le front, en sous-chemins
 * fermés. Le rendu utilise `fill-rule: evenodd` : un sous-chemin posé sur la
 * matière y perce un trou, un sous-chemin posé sur le vide y pose un îlot.
 *
 * Toutes les formes d'une couche donnée partagent EXACTEMENT la même
 * structure de commandes (même nombre de C, dans le même ordre). Seuls les
 * nombres changent. GSAP peut donc interpoler l'attribut `d` sans MorphSVG.
 */

export const W = 1000;
export const H = 1000;
export const VIEWBOX = `0 0 ${W} ${H}`;

/* -------------------------------------------------------------------------- */
/* BRUIT DÉTERMINISTE                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Bruit de valeur 1D, lisse et sans période visible.
 * Déterministe : `noise(x, seed)` renvoie toujours la même valeur.
 * Utilisé partout à la place de Math.random(), qui casserait le scroll arrière.
 */
function hash(n) {
  const s = Math.sin(n) * 43758.5453123;
  return s - Math.floor(s);
}

function noise(x, seed = 0) {
  const i = Math.floor(x);
  const f = x - i;
  // lissage en smoothstep : dérivée nulle aux extrémités, donc pas de cassure
  const u = f * f * (3 - 2 * f);
  const a = hash(i + seed * 57.13);
  const b = hash(i + 1 + seed * 57.13);
  return a + (b - a) * u;
}

/** Bruit fractal : plusieurs octaves pour une courbure locale variée. */
function fbm(x, seed = 0, octaves = 3) {
  let sum = 0;
  let amp = 1;
  let freq = 1;
  let norm = 0;

  for (let o = 0; o < octaves; o++) {
    sum += noise(x * freq, seed + o * 19.7) * amp;
    norm += amp;
    amp *= 0.5;
    freq *= 2.03; // légèrement irrationnel : évite que les octaves se realignent
  }

  return sum / norm; // 0 → 1
}

/* -------------------------------------------------------------------------- */
/* OUTILS                                                                     */
/* -------------------------------------------------------------------------- */

const r = (n) => Math.round(n * 10) / 10;
const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Rampe douce entre deux bornes — sert à faire naître/mourir un élément. */
function smoothstep(edge0, edge1, x) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/**
 * Catmull-Rom → cubiques de Bézier.
 * La courbe passe par tous les points, avec une tangente continue : c'est ce
 * qui donne le galbe « peinture épaisse » plutôt qu'un polygone arrondi.
 *
 * @param closed  true → boucle fermée (îlots, trous)
 * @param tension 1 = Catmull-Rom standard ; >1 gonfle les lobes
 */
function toBezier(pts, closed = false, tension = 1) {
  const n = pts.length;
  if (n < 2) return "";

  const at = (i) => {
    if (closed) return pts[(i + n) % n];
    return pts[Math.max(0, Math.min(n - 1, i))];
  };

  const k = tension / 6;
  let d = `M ${r(pts[0][0])} ${r(pts[0][1])}`;
  const last = closed ? n : n - 1;

  for (let i = 0; i < last; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);

    const c1x = p1[0] + (p2[0] - p0[0]) * k;
    const c1y = p1[1] + (p2[1] - p0[1]) * k;
    const c2x = p2[0] - (p3[0] - p1[0]) * k;
    const c2y = p2[1] - (p3[1] - p1[1]) * k;

    d += ` C ${r(c1x)} ${r(c1y)}, ${r(c2x)} ${r(c2y)}, ${r(p2[0])} ${r(p2[1])}`;
  }

  if (closed) d += " Z";
  return d;
}

/**
 * Boucle fermée organique : un « blob ».
 * Le rayon varie par bruit fractal selon l'angle → contour bosselé et non
 * elliptique. `wobble` contrôle l'écart au cercle.
 *
 * IMPORTANT : `steps` est constant pour un blob donné, donc la structure de
 * commandes ne change jamais d'une progression à l'autre.
 */
function blob(cx, cy, rx, ry, seed, steps = 14, wobble = 0.34) {
  const pts = [];

  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    // bruit continu sur le cercle : on échantillonne un tour complet
    const nz = fbm(Math.cos(a) * 1.7 + 3.1, seed, 3) * 0.6 + fbm(Math.sin(a) * 1.7 + 7.7, seed + 5, 2) * 0.4;
    const k = 1 + (nz - 0.5) * 2 * wobble;
    pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }

  return toBezier(pts, true, 1.15);
}

/* -------------------------------------------------------------------------- */
/* FRONT DE MATIÈRE                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Bord supérieur de la coulée.
 *
 * Le front ne fait PAS que translater : sa forme même évolue avec `p`.
 * - `lobe`  : bosses larges et bulbeuses (basse fréquence, forte amplitude)
 * - `neck`  : cols étroits entre les lobes (fréquence moyenne)
 * - `detail`: micro-courbure (haute fréquence, faible amplitude)
 *
 * L'amplitude s'écrase quand `p → 1` : la surface s'aplanit une fois l'écran
 * couvert, comme une peinture qui se stabilise.
 */
function frontPoints({ p, seed, amp, nodes, drips }) {
  const pts = [];

  // hauteur moyenne : de sous le cadre (p=0) à au-dessus (p=1)
  const baseY = lerp(H + amp * 1.9, -amp * 1.35, p);

  // la déformation culmine à mi-parcours puis s'apaise
  const shape = Math.sin(clamp01(p) * Math.PI) * 0.75 + 0.25;
  const A = amp * shape;

  // débord latéral : jamais de liseré sur les bords
  const OVER = 120;

  for (let i = 0; i <= nodes; i++) {
    const t = i / nodes;
    const x = lerp(-OVER, W + OVER, t);

    // phase qui dérive avec p → le profil se réorganise pendant la montée
    const ph = p * 1.35;

    /*
     * Profil « métaboule » plutôt que sinusoïde.
     *
     * On part d'un bruit basse fréquence, puis on l'écrase vers ses extrêmes
     * avec une puissance impaire : les valeurs moyennes s'aplatissent et les
     * pics s'arrondissent. On obtient de gros lobes pleins reliés par des
     * cols étroits — la signature de la référence — au lieu d'une vague
     * régulière. Le signe est conservé, donc bosses et creux restent
     * symétriques.
     */
    const raw = (fbm(t * 1.75 + ph * 0.85 + seed * 3.7, seed, 2) - 0.5) * 2;
    const lobe = Math.sign(raw) * Math.pow(Math.abs(raw), 0.62) * A;

    // seconde famille de lobes, plus serree et dephasee : les bosses ne se
    // repartissent plus regulierement, certaines fusionnent, d'autres se
    // pincent en cols etroits
    const raw2 = (fbm(t * 3.05 - ph * 1.1 + seed * 8.3, seed + 31, 2) - 0.5) * 2;
    const lobe2 = Math.sign(raw2) * Math.pow(Math.abs(raw2), 0.7) * A * 0.5;

    const neck = (fbm(t * 4.1 - ph * 0.55 + seed * 1.9, seed + 11, 3) - 0.5) * 2 * A * 0.3;
    const detail = (fbm(t * 8.6 + ph * 0.3 + seed * 5.1, seed + 23, 2) - 0.5) * 2 * A * 0.08;

    let y = baseY + lobe + lobe2 + neck + detail;

    /*
     * COULURES — de vraies coulées de peinture, pas des bosses.
     *
     * Dans la référence ce sont des doigts LONGS et ÉTROITS, à flancs presque
     * parallèles et à bout arrondi, qui pendent bien au-delà du front.
     *
     * Le profil en cloche ne sait pas faire ça : il redescend dès qu'on
     * s'écarte du centre, ce qui donne un triangle. On utilise donc un
     * plateau à flancs raides — `1 - u^n` avec n élevé reste proche de 1 sur
     * presque toute la largeur, puis tombe d'un coup sur les bords. Le bout
     * s'arrondit tout seul, la courbe de Catmull-Rom passant par les points.
     */
    for (const d of drips) {
      const u = (t - d.at) / d.w;
      const au = Math.abs(u);
      if (au < 1) {
        /*
         * Deux termes combinés :
         *  - un plateau à flancs raides (1 - u^4) → les côtés du doigt
         *  - une calotte arrondie (√(1-u²), un demi-cercle) → le bout
         * Le produit donne un doigt à flancs presque droits terminé par une
         * goutte arrondie, au lieu d'une colonne à bout carré.
         */
        const flanks = 1 - Math.pow(au, 4);
        const cap = Math.sqrt(Math.max(0, 1 - au * au));
        const k = flanks * (0.72 + 0.28 * cap);

        /*
         * La coulure s'allonge progressivement : elle naît courte quand le
         * front arrive, puis s'étire. `grow` est monotone en p, donc le
         * scroll arrière la rétracte exactement de la même façon.
         */
        const grow = smoothstep(d.from, d.from + 0.42, p);
        const life = 1 - smoothstep(0.86, 1, p); // absorbée quand tout est couvert

        y += k * d.len * grow * life;
      }
    }

    pts.push([x, y]);
  }

  return pts;
}

/* -------------------------------------------------------------------------- */
/* COUCHE COMPLÈTE                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Construit le `d` complet d'une couche pour une progression donnée.
 *
 * Structure émise, toujours dans cet ordre et toujours de même longueur :
 *   [front ondulé] L(droite,bas) L(gauche,bas) Z
 *   [îlot 1] Z  [îlot 2] Z … [trou 1] Z [trou 2] Z …
 *
 * Îlots et trous existent à TOUTES les progressions : pour les faire
 * « apparaître », on les réduit à un point (rayon ~0) plutôt que de les
 * retirer du chemin. La structure de commandes reste ainsi constante, ce qui
 * est la condition pour interpoler `d` sans MorphSVG.
 */
export function liquidPath(layer, p, flip = false) {
  const { seed, amp, nodes, drips, islands, holes, tension } = layer;

  /*
   * Retournement : un simple miroir vertical appliqué au moment d'émettre
   * les coordonnées. La géométrie, elle, n'est calculée qu'une seule fois et
   * de la même façon — la coulée « qui descend du haut » est exactement la
   * même matière, vue à l'envers. Tous les réglages restent donc partagés.
   */
  const fy = flip ? (y) => H - y : (y) => y;

  const pts = frontPoints({ p, seed, amp, nodes, drips }).map(([x, y]) => [x, fy(y)]);

  // le front, puis on ferme bien au-delà du cadre : la matière remplit tout
  // ce qui se trouve derrière elle (en bas, ou en haut si retourné)
  const far = flip ? -400 : H + 400;
  let d = toBezier(pts, false, tension);
  d += ` L ${W + 120} ${far} L ${-120} ${far} Z`;

  // --- îlots : blobs détachés qui devancent le front ---
  for (const is of islands) {
    // ils naissent, grossissent, puis sont absorbés par la matière qui monte
    const born = smoothstep(is.from, is.from + 0.16, p);
    const eaten = smoothstep(is.to - 0.14, is.to, p);
    const k = born * (1 - eaten);

    // ils dérivent vers le haut avec la coulée
    const cy = lerp(is.y0, is.y1, p);
    const rr = is.r * k;

    d += " " + blob(is.x * W, fy(cy), rr * is.sx, rr, seed + is.seed, is.steps, is.wobble);
  }

  // --- trous : poches de vide enfermées dans la matière ---
  for (const ho of holes) {
    // ils s'ouvrent quand le front les dépasse, puis se referment
    const open = smoothstep(ho.from, ho.from + 0.13, p);
    const close = smoothstep(ho.to - 0.2, ho.to, p);
    const k = open * (1 - close);

    const cy = lerp(ho.y0, ho.y1, p);
    const rr = ho.r * k;

    d += " " + blob(ho.x * W, fy(cy), rr * ho.sx, rr, seed + ho.seed, ho.steps, ho.wobble);
  }

  return d;
}

/* -------------------------------------------------------------------------- */
/* COUCHES                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Trois couches en DÉGRADÉ TONAL vers le charbon — comme la référence, qui
 * empile des valeurs d'une même teinte pour lire comme une seule masse
 * profonde, et non comme trois bandes de couleurs différentes.
 *
 * Chaque couche a sa propre géométrie, sa propre amplitude, ses propres
 * coulures ET sa propre réponse au scroll (`bias`) : elles ne sont pas un
 * simple décalage l'une de l'autre.
 */
export const LAYERS = [
  {
    id: "pale",
    color: "#D8CFC2", // ivoire ombré : l'avant-garde de la coulée
    seed: 1.7,
    amp: 158,
    nodes: 96,
    tension: 1.22,
    bias: 1.55, // monte plus vite : c'est elle qui arrive en tête
    drips: [
      { at: 0.17, w: 0.07, len: 300, from: 0.05 },
      { at: 0.38, w: 0.05, len: 190, from: 0.18 },
      { at: 0.66, w: 0.078, len: 355, from: 0.1 },
      { at: 0.88, w: 0.056, len: 235, from: 0.24 },
    ],
    islands: [
      { x: 0.24, y0: 980, y1: 210, r: 74, sx: 1.5, seed: 3.3, steps: 14, wobble: 0.36, from: 0.05, to: 0.62 },
      { x: 0.71, y0: 1040, y1: 250, r: 54, sx: 1.9, seed: 8.1, steps: 12, wobble: 0.3, from: 0.12, to: 0.7 },
    ],
    holes: [
      { x: 0.42, y0: 900, y1: 300, r: 60, sx: 1.35, seed: 5.9, steps: 14, wobble: 0.4, from: 0.3, to: 0.88 },
    ],
  },
  {
    id: "mid",
    color: "#7C6B5B", // valeur intermédiaire : donne l'épaisseur
    seed: 4.2,
    amp: 142,
    nodes: 104,
    tension: 1.16,
    bias: 1.24,
    drips: [
      { at: 0.1, w: 0.059, len: 250, from: 0.12 },
      { at: 0.3, w: 0.081, len: 380, from: 0.06 },
      { at: 0.57, w: 0.053, len: 205, from: 0.22 },
      { at: 0.79, w: 0.071, len: 320, from: 0.14 },
    ],
    islands: [
      { x: 0.13, y0: 1020, y1: 300, r: 62, sx: 1.6, seed: 2.2, steps: 14, wobble: 0.34, from: 0.14, to: 0.68 },
      { x: 0.52, y0: 1060, y1: 340, r: 48, sx: 1.4, seed: 6.6, steps: 12, wobble: 0.42, from: 0.2, to: 0.74 },
      { x: 0.84, y0: 1000, y1: 280, r: 58, sx: 1.7, seed: 9.4, steps: 14, wobble: 0.3, from: 0.1, to: 0.66 },
    ],
    holes: [
      { x: 0.3, y0: 940, y1: 340, r: 66, sx: 1.5, seed: 4.4, steps: 16, wobble: 0.44, from: 0.34, to: 0.9 },
      { x: 0.68, y0: 980, y1: 380, r: 50, sx: 1.25, seed: 7.7, steps: 14, wobble: 0.38, from: 0.42, to: 0.94 },
    ],
  },
  {
    id: "deep",
    color: "#1C1C1C", // la couche dominante : c'est elle qui recouvre tout
    seed: 7.9,
    amp: 126,
    nodes: 112,
    tension: 1.1,
    bias: 0.78, // la plus lente : elle ferme la marche
    drips: [
      { at: 0.22, w: 0.065, len: 330, from: 0.08 },
      { at: 0.45, w: 0.046, len: 215, from: 0.26 },
      { at: 0.71, w: 0.078, len: 400, from: 0.04 },
      { at: 0.94, w: 0.054, len: 245, from: 0.2 },
    ],
    islands: [
      { x: 0.35, y0: 1080, y1: 400, r: 56, sx: 1.55, seed: 1.1, steps: 14, wobble: 0.32, from: 0.2, to: 0.78 },
      { x: 0.79, y0: 1040, y1: 430, r: 44, sx: 1.8, seed: 5.5, steps: 12, wobble: 0.36, from: 0.26, to: 0.82 },
    ],
    holes: [
      { x: 0.22, y0: 1000, y1: 430, r: 52, sx: 1.4, seed: 3.7, steps: 14, wobble: 0.42, from: 0.5, to: 0.97 },
      { x: 0.58, y0: 1020, y1: 400, r: 62, sx: 1.3, seed: 8.8, steps: 16, wobble: 0.46, from: 0.44, to: 0.95 },
    ],
  },
];

/**
 * Réponse au scroll propre à chaque couche.
 * `bias > 1` → la couche prend de l'avance ; `< 1` → elle traîne.
 * La courbe reste monotone : le scroll arrière rejoue exactement l'aller.
 */
export function layerProgress(p, bias) {
  return clamp01(Math.pow(clamp01(p), 1 / bias));
}

/**
 * Palettes.
 *
 * La géométrie est la même dans les deux cas : seules les valeurs changent.
 *  - "dark"  : la matière s'assombrit vers le charbon (sur fond ivoire)
 *  - "light" : elle s'éclaircit vers l'ivoire (sur fond charbon)
 *
 * Dans les deux sens, on garde un dégradé TONAL d'une même famille : c'est ce
 * qui fait lire l'ensemble comme une seule masse profonde.
 */
export const PALETTES = {
  dark: ["#D8CFC2", "#7C6B5B", "#1C1C1C"],
  light: ["#3A342E", "#93826D", "#F5F0E8"],
};

/** Couleur d'une couche pour une palette donnée. */
export function layerColor(index, palette = "dark") {
  const set = PALETTES[palette] || PALETTES.dark;
  return set[index] ?? set[set.length - 1];
}

/* -------------------------------------------------------------------------- */
/* FIORITURES                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Petits arcs dessinés « à la main » près des lobes, comme dans la référence.
 * Ce sont de simples courbes ouvertes, non fermées, tracées et non remplies.
 */
export function flourishPath(f, p, flip = false) {
  const life = smoothstep(f.from, f.from + 0.2, p) * (1 - smoothstep(f.to - 0.16, f.to, p));
  const cy = lerp(f.y0, f.y1, p);
  const s = f.r * life;

  const pts = [];
  for (let i = 0; i <= 6; i++) {
    const t = i / 6;
    const a = f.a0 + (f.a1 - f.a0) * t;
    const y = cy + Math.sin(a) * s;
    pts.push([f.x * W + Math.cos(a) * s * f.sx, flip ? H - y : y]);
  }

  return toBezier(pts, false, 1.1);
}

export const FLOURISHES = [
  { x: 0.16, y0: 960, y1: 300, r: 46, sx: 1.5, a0: 2.6, a1: 5.0, from: 0.16, to: 0.72 },
  { x: 0.47, y0: 1000, y1: 350, r: 34, sx: 1.7, a0: 3.2, a1: 5.6, from: 0.26, to: 0.8 },
  { x: 0.74, y0: 980, y1: 330, r: 40, sx: 1.4, a0: 2.2, a1: 4.7, from: 0.2, to: 0.76 },
  { x: 0.9, y0: 1020, y1: 380, r: 30, sx: 1.6, a0: 3.6, a1: 6.0, from: 0.32, to: 0.86 },
];
