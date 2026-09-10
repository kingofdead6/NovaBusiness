import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * LA BOUSSOLE — LE SEUIL
 * ============================================================================
 *
 * Elle se tient entre le hero et l'immersion, sur le fond clair, JUSTE AVANT
 * que le ciel ne monte. C'est le dernier geste avant la plongée.
 *
 * POURQUOI UNE BOUSSOLE, ET POURQUOI ICI
 * --------------------------------------
 * L'annexe A range les instruments — astrolabe, sextant, rose des vents —
 * parmi les « objets fermés, symétriques, lisibles en petit », et les désigne
 * comme « candidats naturels pour un jeu d'icônes, des marqueurs de section ».
 * Une boussole est exactement cela : un marqueur de seuil.
 *
 * Et elle dit ce que fait l'agence. Le §02 pose le récit — l'étoile est déjà
 * là, on la rend visible. La boussole est l'outil de ce récit : elle ne crée
 * pas le nord, elle le TROUVE. L'aiguille cherche, hésite, puis se fixe — et
 * le moment où elle se fixe est celui où le ciel monte.
 *
 * LE GESTE, EN TROIS TEMPS
 * ------------------------
 *   0.00 → 0.45   LA ROSE SE DESSINE. Le cercle, les graduations et les
 *                 branches se tracent au trait (§05 : « tout se joue au
 *                 trait »). Rien n'apparaît en fondu.
 *
 *   0.20 → 0.78   L'AIGUILLE CHERCHE. Elle balaie plusieurs tours en
 *                 ralentissant — une vraie aiguille qui se stabilise, pas une
 *                 rotation linéaire. Le mot « nord » gagne son contraste au
 *                 même rythme.
 *
 *   0.78 → 1.00   ELLE SE FIXE. L'aiguille s'arrête au nord et n'en bouge
 *                 plus. C'est le seuil : la section suivante est le ciel.
 *
 * RIEN NE TOURNE TOUT SEUL (§09) : la rotation est une fonction de la
 * position de défilement. Immobile, l'aiguille est parfaitement figée, et
 * remonter défait le geste exactement (§07).
 */

/* Graduations de la rose : 32 traits, quatre longueurs selon l'importance. */
const GRADS = Array.from({ length: 32 }, (_, i) => {
  const angle = (i * 360) / 32;
  const cardinal = i % 8 === 0;
  const majeur = i % 4 === 0;
  return {
    angle,
    len: cardinal ? 9 : majeur ? 6 : 3.4,
    w: cardinal ? 0.9 : majeur ? 0.6 : 0.4,
  };
});

/*
  Les quatre branches de la rose, en losanges dessinés.

  Elles occupent les DIAGONALES (45°, 135°…) et non les axes cardinaux : sur
  ceux-ci l'aiguille les recouvrait presque exactement, et la rose ne se
  lisait plus. Décalées, les deux dessins coexistent.
*/
const BRANCHES = [45, 135, 225, 315];

/* Nombre de tours que l'aiguille balaie avant de se fixer. */
const TOURS = 3;

export default function Boussole() {
  const root = useRef(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const traces = el.querySelectorAll("[data-trace]");
    const aiguille = el.querySelector("[data-aiguille]");
    const mot = el.querySelector("[data-mot]");

    /*
      Mouvement réduit : on pose l'état FINAL — rose tracée, aiguille au nord.
      Le seuil reste lisible, il ne se joue simplement pas.
    */
    if (reduced) {
      traces.forEach((t) => {
        t.style.strokeDasharray = "none";
        t.style.strokeDashoffset = "0";
      });
      if (aiguille) aiguille.style.transform = "rotate(0deg)";
      if (mot) mot.style.opacity = "1";
      return undefined;
    }

    const ctx = gsap.context(() => {
      /* Chaque tracé connaît sa longueur : c'est elle qui le fait se dessiner. */
      const longueurs = new Map();
      traces.forEach((node) => {
        const len = node.getTotalLength();
        longueurs.set(node, len);
        node.style.strokeDasharray = String(len);
        node.style.strokeDashoffset = String(len);
      });

      const state = { p: 0 };

      gsap.to(state, {
        p: 1,
        ease: "none",
        scrollTrigger: {
          /*
            La fenêtre court jusqu'au BAS de la section : l'aiguille se fixe
            donc à l'instant précis où la frontière avec l'immersion est
            atteinte, et le ciel monte dans la foulée. Une fenêtre plus courte
            laissait un défilement mort entre le geste et la bascule.
          */
          trigger: el,
          start: "top 85%",
          end: "bottom bottom",
          scrub: 0.6,
        },
        onUpdate: () => {
          const p = state.p;
          const clamp = (v) => Math.max(0, Math.min(1, v));

          /* 1 · LA ROSE SE DESSINE, trait par trait. */
          const trace = clamp(p / 0.45);
          const part = 1 / traces.length;
          traces.forEach((t, i) => {
            const local = clamp((trace - i * part * 0.65) / part);
            const len = longueurs.get(t);
            t.style.strokeDashoffset = String(len * (1 - local));
          });

          /*
            2 · L'AIGUILLE CHERCHE.

            `1 - (1 - t)^3` : la rotation ralentit fortement en fin de course,
            comme une aiguille aimantée qui se stabilise. Une progression
            linéaire aurait l'air d'un moteur, pas d'un instrument.
          */
          const cherche = clamp((p - 0.2) / 0.58);
          const easing = 1 - Math.pow(1 - cherche, 3);
          const tour = TOURS * 360 * (1 - easing);
          if (aiguille) {
            aiguille.style.transform = `rotate(${tour.toFixed(2)}deg)`;
          }

          /* le mot gagne son contraste au même rythme que l'aiguille se fixe */
          if (mot) mot.style.opacity = (easing * 0.55).toFixed(3);
        },
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      data-ground="clair"
      aria-label="Trouver le nord"
      className="relative flex items-center justify-center overflow-hidden py-24 md:py-32"
    >
      <div className="edge flex flex-col items-center gap-8">
        <svg
          viewBox="-60 -60 120 120"
          className="w-[62vw] max-w-[19rem] sm:max-w-[22rem]"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {/* le cercle extérieur */}
          <circle data-trace cx="0" cy="0" r="46" strokeWidth="0.7" opacity="0.55" />
          <circle data-trace cx="0" cy="0" r="38" strokeWidth="0.4" opacity="0.35" />

          {/* les graduations */}
          {GRADS.map((g, i) => {
            const rad = (g.angle * Math.PI) / 180;
            const r1 = 46 - g.len;
            return (
              <line
                key={i}
                data-trace
                x1={Math.cos(rad) * r1}
                y1={Math.sin(rad) * r1}
                x2={Math.cos(rad) * 46}
                y2={Math.sin(rad) * 46}
                strokeWidth={g.w}
                opacity="0.5"
              />
            );
          })}

          {/*
            LES QUATRE BRANCHES, en losanges dessinés au trait — jamais
            remplies : le §05 veut que la structure fasse l'image.
          */}
          {BRANCHES.map((a, i) => {
            const rad = (a * Math.PI) / 180;
            const perp = rad + Math.PI / 2;
            const pointe = 32;
            const large = 7;
            return (
              <path
                key={`b${i}`}
                data-trace
                d={`M 0 0
                    L ${(Math.cos(perp) * large).toFixed(2)} ${(Math.sin(perp) * large).toFixed(2)}
                    L ${(Math.cos(rad) * pointe).toFixed(2)} ${(Math.sin(rad) * pointe).toFixed(2)}
                    L ${(-Math.cos(perp) * large).toFixed(2)} ${(-Math.sin(perp) * large).toFixed(2)}
                    Z`}
                strokeWidth="0.5"
                opacity="0.45"
              />
            );
          })}

          {/*
            L'AIGUILLE. Elle pivote autour du centre — d'où
            `transform-box: fill-box` et `transform-origin: center` en CSS,
            sans quoi elle tournerait autour du coin du viewBox.
          */}
          <g data-aiguille className="boussole-aiguille">
            <path
              d="M 0 -40 L 5 0 L 0 40 L -5 0 Z"
              strokeWidth="0.8"
              opacity="0.9"
            />
            <line x1="0" y1="-40" x2="0" y2="40" strokeWidth="0.4" opacity="0.5" />
          </g>

          {/* le pivot */}
          <circle cx="0" cy="0" r="2.2" strokeWidth="0.7" opacity="0.8" />
        </svg>

        {/*
          Le mot gagne son contraste quand l'aiguille se fixe. C'est le même
          geste que l'embrasement, en tout petit : rien n'apparaît, quelque
          chose devient lisible.
        */}
        <p
          data-mot
          className="ink font-mono text-[11px] uppercase tracking-[0.3em] opacity-0"
        >
          trouver le nord
        </p>
      </div>
    </section>
  );
}
