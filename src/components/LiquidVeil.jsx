import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import {
  LAYERS,
  FLOURISHES,
  VIEWBOX,
  liquidPath,
  flourishPath,
  layerProgress,
  layerColor,
} from "../lib/liquid";

gsap.registerPlugin(ScrollTrigger);

/**
 * VOILE LIQUIDE — recouvrement procédural piloté par le scroll.
 *
 * Le scroll est la SEULE source de vérité : à chaque frame on lit la
 * progression du ScrollTrigger et on régénère la géométrie pour cette valeur.
 * Il n'y a aucune timeline autonome pour le mouvement principal, donc :
 *   - scroll avant   → la coulée avance
 *   - scroll arrière → elle recule exactement de la même façon
 *   - arrêt          → elle se fige dans l'état courant
 *
 * Performance : le DOM SVG est construit UNE fois. À chaque frame on ne
 * réécrit que l'attribut `d` de quelques <path> — aucun re-render React,
 * aucune allocation de nœud, aucune propriété déclenchant un layout.
 *
 * props
 *  - flip       : false → la matière monte depuis le bas (recouvrement)
 *                 true  → elle descend depuis le haut (rideau inversé)
 *  - palette    : "dark" sur fond clair, "light" sur fond sombre
 *  - z          : empilement — 0 pour passer derrière le contenu,
 *                 au-dessus de celui du contenu pour le recouvrir
 *  - reverse    : inverse la progression (1 → 0) : la matière est déjà là
 *                 au début et se retire au fil du scroll
 *  - start/end  : bornes ScrollTrigger, pour adapter à la hauteur de section
 *  - onProgress : reçoit la progression 0→1 à chaque mise à jour
 */

/** Progression minimale entre deux écritures : évite le travail inutile. */
const EPS = 0.0005;

export default function LiquidVeil({
  flip = false,
  palette = "dark",
  z = 0,
  reverse = false,
  start = "top top",
  end = "bottom bottom",
  onProgress,
  className = "",
}) {
  const root = useRef(null);
  const pathRefs = useRef([]);
  const flourishRefs = useRef([]);

  // le callback change d'identité à chaque render du parent : on le garde
  // dans un ref pour ne pas relancer tout l'effet
  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;

  useEffect(() => {
    if (!root.current) return undefined;

    const ctx = gsap.context(() => {
      const section = root.current.closest("section");
      if (!section) return;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      /** Écrit la géométrie correspondant à une progression donnée. */
      const draw = (raw) => {
        const p = reverse ? 1 - raw : raw;
        for (let i = 0; i < LAYERS.length; i++) {
          const path = pathRefs.current[i];
          if (!path) continue;
          const lp = layerProgress(p, LAYERS[i].bias);
          path.setAttribute("d", liquidPath(LAYERS[i], lp, flip));
        }

        for (let i = 0; i < FLOURISHES.length; i++) {
          const el = flourishRefs.current[i];
          if (!el) continue;
          el.setAttribute("d", flourishPath(FLOURISHES[i], p, flip));
        }
      };

      /* ------------------------------------------------------------------ */
      /* MOUVEMENT RÉDUIT                                                    */
      /* ------------------------------------------------------------------ */

      if (reduced) {
        // état final, sans animation : la section reste lisible
        draw(1);
        onProgressRef.current?.(1);
        return;
      }

      /* ------------------------------------------------------------------ */
      /* BOUCLE DE RENDU                                                     */
      /* ------------------------------------------------------------------ */

      // `scrub` interpole la valeur cible : on anime un objet nu, et c'est son
      // onUpdate qui redessine. La géométrie suit donc le scroll avec le même
      // lissage que le reste du site, sans jamais devenir autonome.
      const state = { p: 0 };
      let lastDrawn = -1;

      draw(0);
      onProgressRef.current?.(0);

      const tween = gsap.to(state, {
        p: 1,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start,
          end,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
        onUpdate: () => {
          const p = state.p;
          if (Math.abs(p - lastDrawn) < EPS) return;
          lastDrawn = p;
          draw(p);
          onProgressRef.current?.(p);
        },
      });

      // si la section est déjà dépassée au chargement (rechargement en cours
      // de page), on se cale immédiatement sur le bon état
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        const st = tween.scrollTrigger;
        if (st) {
          draw(st.progress);
          onProgressRef.current?.(st.progress);
        }
      });
    }, root);

    return () => ctx.revert();
  }, [flip, start, end, reverse]);

  return (
    /*
     * `z` est écrit en style inline plutôt qu'en classe : deux utilitaires
     * Tailwind de même spécificité (z-0 et z-20) seraient départagés par leur
     * ordre dans la feuille, pas par l'ordre dans l'attribut — donc peu fiable.
     */
    <div
      ref={root}
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{ zIndex: z }}
      aria-hidden="true"
    >
      <svg
        viewBox={VIEWBOX}
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        style={{ display: "block" }}
      >
        {/*
          fill-rule="evenodd" : c'est lui qui crée la topologie « papier
          découpé ». Un sous-chemin fermé posé SUR la matière y perce un trou,
          le même posé sur le vide y pose un îlot — sans masque ni filtre.
        */}
        {LAYERS.map((layer, i) => (
          <path
            key={layer.id}
            ref={(el) => {
              pathRefs.current[i] = el;
            }}
            fill={layerColor(i, palette)}
            fillRule="evenodd"
            shapeRendering="geometricPrecision"
          />
        ))}

        {/* fioritures dessinées : arcs ouverts, tracés et non remplis */}
        <g
          fill="none"
          stroke={palette === "light" ? "#8A6045" : "#C9A86A"}
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.5"
        >
          {FLOURISHES.map((f, i) => (
            <path
              key={i}
              ref={(el) => {
                flourishRefs.current[i] = el;
              }}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
