import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Engraving from "../Engraving";
import taureau from "../../assets/plates/taureau-trait.png";
import StarSky from "../StarSky";
import Constellation from "../Constellation";
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
      data-constellation-scope
      className="relative h-[300vh]"
    >
      {/*
        Le panneau épinglé doit CONTENIR sa scène : sur mobile, texte et
        constellation empilés dépassaient la hauteur d'écran et débordaient
        sur la section suivante. On centre, on autorise le rétrécissement, et
        on réserve la place de la barre flottante (`pt-24`).
      */}
      <div className="sticky top-0 flex h-stage overflow-hidden pb-6 pt-20 lg:items-center lg:py-0">
        {/*
          LE CIEL. Il n'est pas un décor posé derrière le texte : c'est le
          fond du récit lui-même (§03), et il n'existe que là où le site est
          dans le ciel. Voir `StarSky` pour l'exception du §09.
        */}
        <StarSky seed={11} className="text-contraste" />
        {/*
          SUR MOBILE : une colonne. Le texte garde sa taille naturelle en
          haut, et la constellation occupe SIMPLEMENT CE QUI RESTE (`min-h-0`
          + `flex-1`), au lieu d'imposer sa hauteur et de faire déborder le
          panneau épinglé.

          `min-h-0` est indispensable : sans lui, un enfant flex refuse de
          se réduire sous sa taille de contenu, et tout le calcul échoue.
        */}
        <div className="edge flex h-full min-h-0 w-full flex-col justify-start gap-4 overflow-hidden lg:grid lg:h-auto lg:grid-cols-[1fr_auto] lg:items-center lg:gap-12">
          <div className="max-w-2xl">
            <p className="ink-40 mb-4 font-mono text-[11px] uppercase tracking-[0.2em] lg:mb-8">
              Le récit
            </p>

            <p className="text-[26px] font-medium leading-[1.15] sm:text-d3">
              Une nova n'est pas une étoile nouvelle.
            </p>

            {/*
              Le paragraphe explicatif est réservé aux grands écrans : sur un
              téléphone, la scène épinglée ne tient pas en une hauteur d'écran
              une fois la barre flottante dégagée, et c'est CE bloc qui est le
              plus redondant — le titre et l'embrasement disent déjà le récit.
            */}
            <p className="ink-60 mt-4 hidden max-w-lg text-[15px] leading-relaxed sm:block lg:mt-6 lg:text-[17px]">
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
              className="mt-5 font-display text-[34px] font-black lowercase leading-[0.95] tracking-tight sm:text-d2 lg:mt-12"
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
          {/*
            LA CONSTELLATION prend la place principale : c'est le §02 joué
            par le défilement, et le §11 demande que « personne d'autre que
            NOVA ne pourrait produire ce récit ».

            La planche de Bayer passe DERRIÈRE, très pâle : elle situe le
            monde, la constellation raconte. L'annexe A dit d'ailleurs que
            ces planches sont « des références de langage », pas le sujet.
          */}
          {/*
            SUR MOBILE la constellation n'est PAS masquée : c'est la pièce
            centrale du site, et la cacher revenait à priver le téléphone du
            récit. Elle passe simplement sous le texte, pleine largeur.
          */}
          <div className="relative mx-auto min-h-0 w-full max-w-sm flex-1 lg:mx-0 lg:w-[34vw] lg:max-w-lg lg:flex-none">
            <Engraving
              src={taureau}
              ratio="4/5"
              parallax={5}
              warp="scroll"
              alt=""
              className="constellation-fond pointer-events-none absolute opacity-[0.09]"
            />
            <Constellation className="relative w-full text-contraste" />
          </div>
        </div>
      </div>
    </section>
  );
}
