import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * LA BOUSSOLE — LE SEUIL
 * ============================================================================
 *
 * Elle marque les deux frontières du ciel : juste AVANT que l'aubergine ne
 * monte, et juste APRÈS qu'elle se soit retirée. Le même instrument aux deux
 * bouts de la plongée, avec un geste inverse.
 *
 * POURQUOI UNE BOUSSOLE
 * ---------------------
 * L'annexe A range les instruments — astrolabe, sextant, rose des vents —
 * parmi les « objets fermés, symétriques, lisibles en petit », et les désigne
 * comme « candidats naturels pour des marqueurs de section ». Une boussole
 * est un marqueur de seuil.
 *
 * Et elle dit ce que fait l'agence : elle ne crée pas le nord, elle le TROUVE.
 * C'est le §02 en un objet — l'aiguille cherche, hésite, dépasse, revient,
 * puis se fixe sur ce qui était déjà là.
 *
 * LE GESTE, EN CINQ COUCHES
 * -------------------------
 * Tout est piloté par UNE progression de défilement, et chaque couche en lit
 * une tranche différente :
 *
 *   1. LA ROSE SE DESSINE     traits, graduations, branches — au trait (§05)
 *   2. LES ANNEAUX TOURNENT   en sens INVERSE l'un de l'autre, l'extérieur
 *                             plus lentement : la profondeur vient de l'écart
 *   3. L'AIGUILLE CHERCHE     plusieurs tours, un DÉPASSEMENT amorti, puis
 *                             l'arrêt — une aiguille aimantée, pas un moteur
 *   4. LES REPÈRES RAYONNENT  quatre traits sortent des cardinaux au moment
 *                             où l'aiguille se fixe
 *   5. LE MOT ÉMERGE          il gagne son contraste, comme l'embrasement
 *
 * RIEN NE TOURNE TOUT SEUL (§09) : chaque valeur est une fonction de la
 * position de défilement. Immobile, l'instrument est parfaitement figé, et
 * remonter défait le geste exactement (§07).
 */

/* Graduations de la rose : 32 traits, trois longueurs selon l'importance. */
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

  Elles occupent les DIAGONALES et non les axes cardinaux : sur ceux-ci
  l'aiguille les recouvrait presque exactement, et la rose ne se lisait plus.
*/
const BRANCHES = [45, 135, 225, 315];

/* Les quatre repères qui rayonnent quand l'aiguille se fixe. */
const REPERES = [0, 90, 180, 270];

/* Nombre de tours balayés avant l'arrêt. */
const TOURS = 3;

/** Ramène une progression globale sur un intervalle, bornée 0–1. */
const phase = (p, a, b) => Math.max(0, Math.min(1, (p - a) / (b - a)));

/**
 * `variante` :
 *   "seuil"  — sur le clair, avant la plongée. L'aiguille CHERCHE le nord.
 *   "retour" — sur le clair, après la remontée. Elle le retrouve, et
 *              l'illustration du client accompagne la sortie.
 */
export default function Boussole({ variante = "seuil" }) {
  const root = useRef(null);
  const retour = variante === "retour";

  useEffect(() => {
    const el = root.current;
    if (!el) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const traces = el.querySelectorAll("[data-trace]");
    const aiguille = el.querySelector("[data-aiguille]");
    const anneauInt = el.querySelector("[data-anneau-int]");
    const anneauExt = el.querySelector("[data-anneau-ext]");
    const reperes = el.querySelectorAll("[data-repere]");
    const mot = el.querySelector("[data-mot]");

    /*
      Mouvement réduit : on pose l'état FINAL — rose tracée, aiguille au nord.
      Le seuil reste lisible, il ne se joue simplement pas.
    */
    if (reduced) {
      [...traces, ...reperes].forEach((t) => {
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
      [...traces, ...reperes].forEach((node) => {
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
            DEUX FENÊTRES, parce que les deux boussoles n'ont pas le même
            rendez-vous avec la frontière.

            AU SEUIL, le geste doit s'ACHEVER quand le ciel monte : la fenêtre
            court donc jusqu'au bas de la section. Une fenêtre plus courte
            laissait un défilement mort entre l'arrêt de l'aiguille et la
            bascule.

            AU RETOUR, c'est l'inverse : le geste doit être DÉJÀ EN COURS
            pendant que le ciel se retire au-dessus. Il démarre donc dès que
            la section entre par le bas et s'achève avant la fin, sinon la
            boussole restait vide au moment précis du balayage.
          */
          trigger: el,
          start: retour ? "top bottom" : "top 85%",
          end: retour ? "bottom 60%" : "bottom bottom",
          scrub: 0.6,
        },
        onUpdate: () => {
          const p = state.p;

          /* 1 · LA ROSE SE DESSINE, trait par trait. */
          const trace = phase(p, 0, 0.42);
          const part = 1 / traces.length;
          traces.forEach((t, i) => {
            const local = phase(trace, i * part * 0.65, i * part * 0.65 + part);
            const len = longueurs.get(t);
            t.style.strokeDashoffset = String(len * (1 - local));
          });

          /*
            2 · LES ANNEAUX TOURNENT EN SENS INVERSE.

            L'extérieur va moins vite que l'intérieur : c'est cet ÉCART qui
            fabrique la profondeur, pas une ombre. Les deux se calment en même
            temps que l'aiguille.
          */
          const derive = 1 - phase(p, 0.15, 0.82);
          if (anneauInt) {
            anneauInt.style.transform = `rotate(${(derive * 84).toFixed(2)}deg)`;
          }
          if (anneauExt) {
            anneauExt.style.transform = `rotate(${(derive * -52).toFixed(2)}deg)`;
          }

          /*
            3 · L'AIGUILLE CHERCHE, DÉPASSE, PUIS SE FIXE.

            Une aiguille aimantée ne s'arrête pas net : elle franchit le nord,
            revient, oscille de moins en moins. On modélise donc une sinusoïde
            AMORTIE plutôt qu'un simple ralentissement — le premier essai, en
            `1-(1-t)³`, avait l'air d'un moteur qui freine.

            `e^(-6t)` éteint l'oscillation ; à t = 1 elle est nulle et
            l'aiguille est parfaitement immobile.
          */
          const cherche = phase(p, 0.18, 0.86);
          const amorti = Math.exp(-6 * cherche);
          const balayage = TOURS * 360 * (1 - cherche);
          const oscillation = Math.sin(cherche * Math.PI * 5) * 26 * amorti;
          const angle = (balayage + oscillation) * (retour ? -1 : 1);
          if (aiguille) {
            aiguille.style.transform = `rotate(${angle.toFixed(2)}deg)`;
          }

          /* 4 · LES REPÈRES RAYONNENT quand l'aiguille se pose. */
          const pose = phase(p, 0.72, 0.96);
          const partR = 1 / (reperes.length || 1);
          reperes.forEach((r, i) => {
            const local = phase(pose, i * partR * 0.5, i * partR * 0.5 + partR);
            const len = longueurs.get(r);
            r.style.strokeDashoffset = String(len * (1 - local));
          });

          /* 5 · LE MOT ÉMERGE, comme l'embrasement en tout petit. */
          const emerge = phase(p, 0.5, 0.9);
          if (mot) mot.style.opacity = (emerge * 0.6).toFixed(3);

        },
      });

    }, el);

    return () => ctx.revert();
  }, [retour]);

  return (
    <section
      ref={root}
      data-ground="clair"
      aria-label={retour ? "Le nord retrouvé" : "Trouver le nord"}
      className={`relative flex items-center justify-center overflow-hidden ${
        retour ? "pb-24 pt-6 md:pb-32 md:pt-10" : "py-24 md:py-32"
      }`}
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
          {/* l'anneau extérieur : cercle + graduations, tourne à contresens */}
          <g data-anneau-ext className="boussole-pivot">
            <circle data-trace cx="0" cy="0" r="46" strokeWidth="0.7" opacity="0.55" />
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
          </g>

          {/* l'anneau intérieur : le cercle et les branches de la rose */}
          <g data-anneau-int className="boussole-pivot">
            <circle data-trace cx="0" cy="0" r="38" strokeWidth="0.4" opacity="0.35" />
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
          </g>

          {/* les repères qui rayonnent une fois l'aiguille posée */}
          {REPERES.map((a, i) => {
            const rad = (a * Math.PI) / 180;
            return (
              <line
                key={`r${i}`}
                data-repere
                x1={Math.cos(rad) * 48}
                y1={Math.sin(rad) * 48}
                x2={Math.cos(rad) * 56}
                y2={Math.sin(rad) * 56}
                strokeWidth="0.8"
                opacity="0.7"
              />
            );
          })}

          {/*
            L'AIGUILLE. Elle pivote autour du centre — d'où
            `transform-box: fill-box` en CSS, sans quoi un `rotate()` sur un
            groupe SVG tourne autour de l'ORIGINE DU VIEWBOX et l'aiguille
            décrirait une orbite au lieu de tourner sur elle-même.
          */}
          <g data-aiguille className="boussole-pivot">
            <path d="M 0 -40 L 5 0 L 0 40 L -5 0 Z" strokeWidth="0.8" opacity="0.9" />
            <line x1="0" y1="-40" x2="0" y2="40" strokeWidth="0.4" opacity="0.5" />
          </g>

          {/* le pivot */}
          <circle cx="0" cy="0" r="2.2" strokeWidth="0.7" opacity="0.8" />
        </svg>

        <p
          data-mot
          className="ink font-mono text-[11px] uppercase tracking-[0.3em] opacity-0"
        >
          {retour ? "le nord, retrouvé" : "trouver le nord"}
        </p>
      </div>
    </section>
  );
}
