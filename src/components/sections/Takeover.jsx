import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Star } from "../Plate";
import Engraving from "../Engraving";
import taureau from "../../assets/plates/taureau-trait.png";
import StarSky from "../StarSky";
import { splitCharsRich } from "../../lib/text";
import { palette } from "../../lib/tokens";

/** Mélange deux couleurs hex. `t` = 0 → `a`, 1 → `b`. */
function mixHex(a, b, t) {
  const parse = (h) => h.replace("#", "").match(/../g).map((x) => parseInt(x, 16));
  const A = parse(a);
  const B = parse(b);
  return (
    "#" +
    A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join("")
  );
}

gsap.registerPlugin(ScrollTrigger);

/**
 * ÉTAT 2 — L'IMMERSION (§07)
 * ============================================================================
 *
 * « Au scroll, le ciel monte et recouvre l'écran. Pleine couleur. C'est le
 * point le plus profond de la page, et c'est là qu'a lieu l'embrasement. »
 *
 * L'ÉPINGLAGE SURVIT, SON CONTENU NON
 * -----------------------------------
 * La version précédente de cette section était une scène de 400vh avec des
 * éclats d'images et un voile liquide. On garde l'épinglage — c'est le seul
 * endroit du site avec assez de course pour que le ciel monte VRAIMENT — et
 * on jette tout le reste.
 *
 * Ce qui reste épinglé : une phrase, et le récit du §02 énoncé en trois
 * temps. Le fond fait le travail ; le contenu reste stable, comme l'exige
 * le §03.
 *
 * L'EMBRASEMENT
 * -------------
 * Les lettres de « impossible à manquer » gagnent du contraste une à une,
 * exactement comme le nom au chargement : de la couleur du fond vers le
 * parchemin plein. Aucune lueur — le §05 est catégorique, et le §09 interdit
 * le halo derrière un titre.
 */
export default function Takeover() {
  const root = useRef(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return undefined;

    const ctx = gsap.context(() => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const blaze = el.querySelector("[data-blaze]");
      const chars = blaze ? splitCharsRich(blaze) : [];

      if (reduced) {
        gsap.set(chars, { color: palette.contraste });
        return;
      }

      /*
        Les lettres partent à la couleur du FOND : invisibles, présentes.
        Elles ne se fondent pas depuis l'opacité 0 — elles émergent par le
        contraste, ce qui est la mécanique même d'une nova (§02).

        On interpole entre deux couleurs RÉSOLUES : GSAP ne sait pas
        interpoler `color-mix()` ni `var()`, le tween échouerait en silence.
      */
      gsap.fromTo(
        chars,
        { color: mixHex(palette.ciel, palette.contraste, 0.08) },
        {
          color: palette.contraste,
          ease: "none",
          stagger: 0.04,
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: "60% top",
            scrub: 0.5,
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="studio"
      ref={root}
      data-ground="ciel"
      className="relative h-[300vh]"
    >
      <div className="sticky top-0 flex h-stage items-center overflow-hidden">
        {/*
          LE CIEL. Il n'est pas un décor posé derrière le texte : c'est le
          fond du récit lui-même (§03), et il n'existe que là où le site est
          dans le ciel. Voir `StarSky` pour l'exception du §09.
        */}
        <StarSky seed={11} className="text-contraste" />
        <div className="edge grid w-full items-center gap-12 lg:grid-cols-[1fr_auto]">
          <div className="max-w-2xl">
            <p className="ink-40 mb-8 font-mono text-[11px] uppercase tracking-[0.2em]">
              Le récit
            </p>

            <p className="text-d3 font-medium leading-[1.15]">
              Une nova n'est pas une étoile nouvelle.
            </p>

            <p className="ink-60 mt-6 max-w-lg text-[17px] leading-relaxed">
              C'est une étoile déjà présente, trop faible pour qu'on la
              remarque, qui multiplie soudain son éclat. Rien n'est né, le ciel
              n'a pas changé : elle vient de devenir visible.
            </p>

            {/*
              L'EMBRASEMENT. Les lettres gagnent du contraste au défilement.
              Le mot est écrit une seule fois — c'est un vrai titre, lu par
              les lecteurs d'écran, pas un effet posé par-dessus.
            */}
            <p
              data-blaze
              className="mt-12 font-display text-d2 font-black lowercase tracking-tight"
            >
              impossible à manquer.
            </p>
          </div>

          {/*
            BAYER, URANOMETRIA — LE TAUREAU (1603).

            L'annexe A la désigne comme « déjà un système de design : un cadre,
            une structure, un motif », et c'est la planche la plus graphique du
            répertoire — monochrome, hachurée, les étoiles posées sur une
            grille. Elle tient donc la place principale de l'immersion.

            Elle est traitée par `Engraving` : le papier crème disparaît et
            seul le trait reste, en parchemin sur l'aubergine.
          */}
          <div className="relative hidden w-[26vw] max-w-sm lg:block">
            <Engraving
              src={taureau}
              ratio="4/5"
              parallax={5}
              className="relative"
              alt="Planche gravée — le Taureau, Uranometria de Bayer, 1603"
              label="Bayer · Uranometria · 1603"
            />
            <Star rays={5} className="absolute -left-6 top-8 h-6 w-6" />
            <Star rays={4} className="absolute -right-2 bottom-16 h-4 w-4" />
          </div>
        </div>
      </div>
    </section>
  );
}
