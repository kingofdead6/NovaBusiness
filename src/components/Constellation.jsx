import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * LA CONSTELLATION
 * ============================================================================
 *
 * C'est LA pièce du site : le §02 joué en entier, par le seul défilement.
 *
 * « Les anciens ont cru voir naître une étoile […] Ils se trompaient. Rien
 * n'était né et le ciel n'avait pas changé : une étoile qui s'y trouvait
 * depuis toujours venait de devenir visible. »
 *
 * Le récit se déroule en quatre temps, et le §11 demande précisément cela —
 * « personne d'autre que NOVA ne pourrait produire ce récit » :
 *
 *   0.00 → 0.28   UN CIEL SANS REPÈRE. Les points sont TOUS déjà là, à peine
 *                 visibles. Rien n'apparaît, rien n'est ajouté : ils étaient
 *                 présents depuis le début, comme l'étoile du récit.
 *
 *   0.28 → 0.62   LES POINTS SE RATTACHENT. Les traits se dessinent d'un
 *                 point à l'autre, dans l'ordre. La figure se révèle — c'est
 *                 le travail de l'agence : relier ce qui existait déjà.
 *
 *   0.62 → 0.84   L'EMBRASEMENT. UNE seule étoile — celle que le récit
 *                 désigne — multiplie son éclat. Pas un halo : ses rayons se
 *                 DESSINENT et son point grossit. Le §05 est catégorique,
 *                 « tout se joue au trait », et le §09 interdit le halo.
 *
 *   0.84 → 1.00   LA FIGURE SE RETIRE, L'ÉTOILE RESTE. Ce qui a été rendu
 *                 visible ne redevient pas invisible.
 *
 * TOUT EST RÉVERSIBLE : la progression est lue au `scrub`, donc remonter
 * défait exactement le récit — ce que le §07 exige (« chaque mouvement peut
 * se produire à l'aller et au retour »).
 *
 * RIEN NE TOURNE TOUT SEUL : aucune boucle, aucune pulsation (§09).
 * Immobile, la constellation est parfaitement figée.
 */

/*
  LA FIGURE.

  Un tracé posé à la main, pas généré : le §05 veut que « la main reste
  visible », et un semis aléatoire ne produit pas une figure — il produit du
  bruit. Les coordonnées sont en pourcentage du cadre.

  `nova: true` marque l'étoile qui s'embrase : celle du récit, celle du
  client. Elle est volontairement décentrée et pas la plus grosse — c'est
  celle qu'on ne remarquait pas.
*/
const POINTS = [
  { x: 12, y: 68 },
  { x: 24, y: 44 },
  { x: 33, y: 55 },
  { x: 41, y: 27 },
  { x: 52, y: 38 },
  { x: 58, y: 63 },
  { x: 68, y: 30, nova: true },
  { x: 79, y: 47 },
  { x: 88, y: 22 },
];

/* Les segments, dans l'ordre où ils se dessinent. */
const SEGMENTS = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [4, 6],
  [6, 7],
  [7, 8],
];

/** Étapes du récit, en progression de 0 à 1. */
const T = {
  relier: 0.28,
  relieFin: 0.62,
  embrase: 0.62,
  embraseFin: 0.84,
  retrait: 0.84,
};

/** Ramène une progression globale sur un intervalle, bornée 0–1. */
const phase = (p, a, b) => Math.max(0, Math.min(1, (p - a) / (b - a)));

export default function Constellation({ className = "" }) {
  const root = useRef(null);

  /* Les rayons de l'étoile qui s'embrase : six, dessinés (§05). */
  const rayons = useMemo(() => {
    const nova = POINTS.find((p) => p.nova);
    return Array.from({ length: 6 }, (_, i) => {
      const a = ((i * 360) / 6 + 12) * (Math.PI / 180);
      // longueurs inégales : la main reste visible
      const len = i % 2 === 0 ? 1 : 0.62;
      return { x: nova.x, y: nova.y, dx: Math.cos(a) * len, dy: Math.sin(a) * len };
    });
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const traits = el.querySelectorAll("[data-trait]");
    const etoiles = el.querySelectorAll("[data-etoile]");
    const rayonsEls = el.querySelectorAll("[data-rayon]");
    const nova = el.querySelector("[data-nova]");

    /*
      Mouvement réduit : on pose l'état FINAL — figure reliée, étoile
      embrasée. Le récit reste lisible, il ne se joue simplement pas.
    */
    if (reduced) {
      traits.forEach((t) => {
        t.style.strokeDasharray = "none";
        t.style.strokeDashoffset = "0";
      });
      rayonsEls.forEach((r) => {
        r.style.strokeDasharray = "none";
        r.style.strokeDashoffset = "0";
      });
      etoiles.forEach((s) => s.setAttribute("opacity", "0.5"));
      if (nova) {
        nova.setAttribute("r", "1.4");
        nova.setAttribute("opacity", "1");
      }
      return undefined;
    }

    const ctx = gsap.context(() => {
      /* Chaque trait connaît sa longueur : c'est elle qui le fait se dessiner. */
      const longueurs = new Map();
      [...traits, ...rayonsEls].forEach((node) => {
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
            Le déclencheur est la SECTION ÉPINGLÉE, pas le SVG : celui-ci est
            `sticky` et ne bouge donc pas dans la fenêtre. Prendre le SVG
            comme déclencheur donnerait une progression qui n'avance jamais.
          */
          trigger: el.closest("[data-constellation-scope]") || el,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.7,
        },
        onUpdate: () => {
          const p = state.p;

          /*
            1 · LES POINTS SONT DÉJÀ LÀ.
            Ils ne surgissent pas : leur opacité monte à peine, de 0.12 à 0.5.
            « Rien n'était né » — ils étaient présents depuis le début.
          */
          const eveil = phase(p, 0, T.relier);
          etoiles.forEach((s, i) => {
            // léger décalage par point : le ciel n'est pas un bloc
            const d = (i % 4) * 0.06;
            const o = 0.12 + Math.max(0, Math.min(1, eveil - d)) * 0.38;
            s.setAttribute("opacity", o.toFixed(3));
          });

          /*
            2 · LES POINTS SE RATTACHENT.
            Les traits se dessinent l'un après l'autre, dans l'ordre du tracé.
          */
          const relie = phase(p, T.relier, T.relieFin);
          const part = 1 / traits.length;
          traits.forEach((t, i) => {
            const local = Math.max(0, Math.min(1, (relie - i * part) / part));
            const len = longueurs.get(t);
            t.style.strokeDashoffset = String(len * (1 - local));
          });

          /*
            3 · L'EMBRASEMENT.
            Les rayons se DESSINENT et le point grossit. Aucune lueur : le §09
            l'interdit, et le §05 veut que le trait porte seul.
          */
          const feu = phase(p, T.embrase, T.embraseFin);
          const partR = 1 / rayonsEls.length;
          rayonsEls.forEach((r, i) => {
            const local = Math.max(0, Math.min(1, (feu - i * partR * 0.5) / partR));
            const len = longueurs.get(r);
            r.style.strokeDashoffset = String(len * (1 - local));
          });
          if (nova) {
            nova.setAttribute("r", (0.5 + feu * 0.9).toFixed(3));
            nova.setAttribute("opacity", (0.35 + feu * 0.65).toFixed(3));
          }

          /*
            4 · LA FIGURE SE RETIRE, L'ÉTOILE RESTE.
            Les traits s'effacent et les points se rendorment ; l'étoile
            embrasée, elle, ne bouge plus.
          */
          const retrait = phase(p, T.retrait, 1);
          if (retrait > 0) {
            traits.forEach((t) => {
              const len = longueurs.get(t);
              t.style.strokeDashoffset = String(len * retrait);
            });
            etoiles.forEach((s) => {
              const o = Number(s.getAttribute("opacity"));
              s.setAttribute("opacity", (o * (1 - retrait * 0.7)).toFixed(3));
            });
          }
        },
      });
    }, el);

    return () => ctx.revert();
  }, []);

  const novaPt = POINTS.find((p) => p.nova);

  return (
    <svg
      ref={root}
      viewBox="0 0 100 80"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      className={`pointer-events-none ${className}`}
    >
      {/* les traits, sous les points */}
      {SEGMENTS.map(([a, b], i) => (
        <line
          key={i}
          data-trait
          x1={POINTS[a].x}
          y1={POINTS[a].y}
          x2={POINTS[b].x}
          y2={POINTS[b].y}
          stroke="currentColor"
          strokeWidth="0.22"
          strokeLinecap="round"
          opacity="0.55"
        />
      ))}

      {/* les points : tous présents dès le départ */}
      {POINTS.map((pt, i) =>
        pt.nova ? null : (
          <circle
            key={i}
            data-etoile
            cx={pt.x}
            cy={pt.y}
            r="0.55"
            fill="currentColor"
            opacity="0.12"
          />
        )
      )}

      {/* l'étoile du récit : un point, et six rayons DESSINÉS (§05) */}
      {rayons.map((r, i) => (
        <line
          key={`r${i}`}
          data-rayon
          x1={r.x}
          y1={r.y}
          x2={r.x + r.dx * 7}
          y2={r.y + r.dy * 7}
          stroke="currentColor"
          strokeWidth="0.26"
          strokeLinecap="round"
        />
      ))}
      <circle
        data-nova
        cx={novaPt.x}
        cy={novaPt.y}
        r="0.5"
        fill="currentColor"
        opacity="0.35"
      />
    </svg>
  );
}
