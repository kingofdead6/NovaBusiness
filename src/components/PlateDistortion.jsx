/**
 * LE FILTRE DE DÉFORMATION DES PLANCHES (§05)
 * ============================================================================
 *
 * « La main reste visible. Légère irrégularité d'épaisseur, léger tremblé. Le
 * dessin garde sa fabrication. »
 *
 * C'est une consigne de DESSIN, pas d'effet : le brief ne demande pas un
 * gadget, il demande que le trait ne paraisse pas sorti d'une machine. Un
 * `feTurbulence` en bruit fractal, déplaçant les pixels de quelques unités,
 * produit exactement cela — le tracé ondule très légèrement, comme un trait de
 * feutre sur un papier qui n'est pas parfaitement plat.
 *
 * POURQUOI UN FILTRE SVG ET NON UNE ANIMATION
 * -------------------------------------------
 * Le filtre est STATIQUE. Animer la graine ferait bouillonner le trait en
 * permanence : ce serait une animation en boucle, que le §09 interdit. Le
 * tremblé appartient au dessin, pas au mouvement.
 *
 * Trois intensités, parce que la déformation doit suivre l'échelle : une
 * planche minuscule a besoin d'un déplacement plus faible, sinon le trait se
 * casse au lieu d'onduler.
 *
 * Le composant ne rend AUCUN pixel : il ne pose que les définitions, une seule
 * fois pour tout le document.
 */
export default function PlateDistortion() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className="pointer-events-none absolute h-0 w-0 overflow-hidden"
    >
      <defs>
        {/*
          `baseFrequency` basse = ondulation LARGE (le papier gondole).
          `numOctaves` 2 = un peu de détail, sans grain parasite.
          `scale` = amplitude du déplacement, en pixels.
        */}
        <filter id="plate-warp-doux" x="-6%" y="-6%" width="112%" height="112%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.012 0.020"
            numOctaves="2"
            seed="7"
            result="bruit"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="bruit"
            scale="6"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        <filter id="plate-warp" x="-8%" y="-8%" width="116%" height="116%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.009 0.016"
            numOctaves="2"
            seed="17"
            result="bruit"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="bruit"
            scale="11"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        <filter id="plate-warp-fort" x="-12%" y="-12%" width="124%" height="124%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.007 0.013"
            numOctaves="3"
            seed="29"
            result="bruit"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="bruit"
            scale="18"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        {/*
          LE TREMBLÉ QUI RÉPOND AU DÉFILEMENT.

          Celui-ci est le seul dont l'amplitude bouge : `src/lib/warp.js` pilote
          l'attribut `scale` du `feDisplacementMap` au SCRUB, si bien que la
          planche se déforme quand on la traverse et se repose quand on
          s'arrête.

          Ce n'est donc PAS une animation en boucle (§09) : rien ne tourne tout
          seul, le mouvement appartient au geste de l'utilisateur — comme le
          fond, comme les parallaxes. C'est aussi ce que demande le §07 :
          « chaque mouvement peut se produire à l'aller et au retour ».
        */}
        <filter id="plate-warp-scroll" x="-14%" y="-14%" width="128%" height="128%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.008 0.014"
            numOctaves="2"
            seed="43"
            result="bruit"
          />
          <feDisplacementMap
            data-warp-scroll
            in="SourceGraphic"
            in2="bruit"
            scale="4"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}
