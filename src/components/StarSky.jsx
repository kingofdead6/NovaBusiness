import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";

/**
 * LE CIEL ÉTOILÉ
 * ============================================================================
 *
 * POURQUOI C'EST AUTORISÉ, ALORS QUE LE §09 INTERDIT LES PARTICULES
 * ----------------------------------------------------------------
 * Le §09 proscrit « les points et particules lumineux EN USAGE DÉCORATIF :
 * particules flottantes sans raison, halo derrière un titre ou un bouton,
 * pastilles qui scintillent pour meubler ». Puis il pose l'exception, et elle
 * nomme exactement ce composant :
 *
 *     « La lumière est admise quand elle est LE SUJET, uniquement si elle
 *       porte le design complet : par exemple un fond d'étoiles lumineuses
 *       qui scintillent. »
 *
 * Le §17 précise où passe la ligne, à propos de milancompain.com : c'est
 * recevable « parce que l'étoile y est le sujet : elle occupe le centre, elle
 * porte la marque, elle est construite. Rien n'y flotte pour meubler. La même
 * image, réduite à une poussière scintillante derrière un titre, tomberait
 * sous l'interdit. »
 *
 * D'où trois décisions qui font la différence entre le ciel et la poussière :
 *
 *   1. LE CIEL EST LE SUJET. Il n'est pas posé derrière un titre comme un
 *      ornement : il EST le fond du récit (§03), le « ciel immense » dans
 *      lequel le site plonge. Il n'apparaît que là où le site est dans le
 *      ciel, jamais sur le clair.
 *
 *   2. IL EST CONSTRUIT, PAS SEMÉ. Trois plans de profondeur (§03 : « le ciel
 *      est immense, avec peut-être de la profondeur ») avec des densités et
 *      des tailles distinctes, et de vraies étoiles DESSINÉES au premier plan
 *      — un point et quatre à six rayons, la définition littérale du §05.
 *
 *   3. IL NE PULSE PAS. Le §09 interdit « les animations en boucle et les
 *      éléments qui pulsent ». Le scintillement n'est donc pas une boucle
 *      d'opacité : c'est une PARALLAXE au défilement, comme tout le reste du
 *      site. Le ciel bouge parce qu'on le traverse, pas tout seul.
 *
 * La graine rend la disposition REPRODUCTIBLE : un ciel qui change à chaque
 * chargement se lit comme un bug, pas comme un ciel.
 */

/* Générateur congruentiel — suffisant ici, et reproductible. */
function makeRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

/*
  Trois plans. Le lointain est dense et minuscule, le proche est rare et
  grand : c'est cet écart qui fabrique la profondeur, pas un flou.
*/
const LAYERS = [
  { count: 130, min: 0.6, max: 1.2, opacity: 0.34, depth: 6 },
  { count: 60, min: 1.0, max: 1.9, opacity: 0.55, depth: 14 },
  { count: 22, min: 1.6, max: 2.6, opacity: 0.78, depth: 26 },
];

/* Les quelques étoiles DESSINÉES du premier plan (§05). */
const DRAWN = 7;

export default function StarSky({ seed = 11, className = "" }) {
  const root = useRef(null);

  const { layers, drawn } = useMemo(() => {
    const rand = makeRandom(seed);

    const layers = LAYERS.map((layer) =>
      Array.from({ length: layer.count }, () => ({
        x: rand() * 100,
        y: rand() * 100,
        r: layer.min + rand() * (layer.max - layer.min),
        o: layer.opacity * (0.55 + rand() * 0.45),
      }))
    );

    const drawn = Array.from({ length: DRAWN }, () => ({
      x: 4 + rand() * 92,
      y: 4 + rand() * 92,
      /* quatre à six rayons, jamais moins, jamais plus (§05) */
      rays: 4 + Math.floor(rand() * 3),
      size: 7 + rand() * 9,
      rotate: rand() * 90,
    }));

    return { layers, drawn };
  }, [seed]);

  useEffect(() => {
    const el = root.current;
    if (!el) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return undefined;

    const ctx = gsap.context(() => {
      /*
        PARALLAXE, PAS PULSATION. Chaque plan se déplace d'une quantité
        différente à mesure qu'on traverse la section : le ciel gagne sa
        profondeur du DÉPLACEMENT, jamais d'un clignotement.

        `scrub` : le mouvement suit le doigt, il se rejoue à l'envers en
        remontant, et il s'arrête quand on s'arrête (§07).
      */
      el.querySelectorAll("[data-depth]").forEach((plane) => {
        const depth = Number(plane.dataset.depth);
        gsap.fromTo(
          plane,
          { yPercent: depth * 0.5 },
          {
            yPercent: -depth * 0.5,
            ease: "none",
            scrollTrigger: {
              trigger: el.parentElement || el,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.8,
            },
          }
        );
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={root}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {layers.map((stars, i) => (
        <svg
          key={i}
          data-depth={LAYERS[i].depth}
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 h-full w-full"
        >
          {stars.map((s, j) => (
            <circle
              key={j}
              cx={s.x}
              cy={s.y}
              r={s.r * 0.09}
              fill="currentColor"
              opacity={s.o}
            />
          ))}
        </svg>
      ))}

      {/*
        LES ÉTOILES DESSINÉES.
        « Une étoile est un point avec quatre à six rayons dessinés. Tout se
        joue au trait. » (§05) — donc des traits, jamais un disque flou et
        jamais une lueur.
      */}
      <svg
        data-depth={34}
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        {drawn.map((star, i) => {
          const lines = Array.from({ length: star.rays }, (_, k) => {
            const angle = ((k * 360) / star.rays + star.rotate) * (Math.PI / 180);
            // longueur inégale d'un rayon à l'autre : la main reste visible
            const len = (star.size / 100) * (k % 2 === 0 ? 1 : 0.72);
            return {
              x2: star.x + Math.cos(angle) * len * 8,
              y2: star.y + Math.sin(angle) * len * 8,
            };
          });
          return (
            <g key={i} stroke="currentColor" strokeLinecap="round" opacity="0.85">
              {lines.map((l, k) => (
                <line
                  key={k}
                  x1={star.x}
                  y1={star.y}
                  x2={l.x2}
                  y2={l.y2}
                  strokeWidth={k % 2 === 0 ? 0.16 : 0.11}
                />
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
