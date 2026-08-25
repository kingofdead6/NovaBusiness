import { useEffect, useRef, useMemo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * EMPLACEMENT IMAGE — VERSION ÉCLATÉE ET VIVANTE.
 *
 * Découpe UNE SEULE image en quadrilatères (coupes obliques horizontales ET
 * verticales) et anime chaque morceau sur TROIS couches indépendantes :
 *
 *   1. dérive permanente  — le morceau flotte en boucle, même à l'arrêt
 *   2. dérive au scroll   — chaque morceau glisse à sa propre vitesse
 *   3. dérive interne     — l'illustration bouge À L'INTÉRIEUR de son cadre,
 *                           la découpe, elle, ne bouge pas
 *
 * Chaque couche vit sur son propre élément : c'est ce qui leur permet de
 * s'additionner sans que GSAP n'écrase la transform de la précédente.
 *
 * L'image fournie doit être ENTIÈRE et propre : le découpage se fait ici.
 *
 * props
 *  - src, alt     : l'image finale (vide = cadre de repérage)
 *  - ratio        : "3/5", "16/10"…
 *  - label        : description de l'image attendue
 *  - rows         : bandes horizontales (3 à 7 ; 5 par défaut)
 *  - chaos        : 0 = sage, 1 = très disloqué (défaut 0.7)
 *  - spread       : amplitude du décalage au scroll, en % (défaut 9)
 *  - drift        : amplitude de la dérive permanente, en % (défaut 1.6 ; 0 = figé)
 *  - innerDrift   : amplitude du mouvement interne, en % (défaut 0)
 *  - seed         : change toute la découpe sans toucher au reste
 *  - tone         : "light" (sur ivoire) | "dark" (sur charbon)
 */
export default function ShardedMedia({
  src,
  alt = "",
  ratio = "3/5",
  label = "Image",
  rows = 5,
  chaos = 0.7,
  spread = 9,
  drift = 1.6,
  innerDrift = 0,
  seed = 1,
  tone = "light",
  className = "",
}) {
  const root = useRef(null);
  const floaters = useRef([]); // couche 1 — dérive permanente
  const shards = useRef([]); // couche 2 — découpe + dérive au scroll
  const inners = useRef([]); // couche 3 — mouvement interne

  const pieces = useMemo(
    () => buildShards({ rows, seed, chaos, spread }),
    [rows, seed, chaos, spread]
  );

  useEffect(() => {
    const ctx = gsap.context(() => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const shardNodes = shards.current.filter(Boolean);
      const floatNodes = floaters.current.filter(Boolean);
      const innerNodes = inners.current.filter(Boolean);

      // inclinaison + échelle du morceau : posées une fois
      shardNodes.forEach((node, i) => {
        gsap.set(node, {
          rotation: pieces[i].rot,
          scale: pieces[i].scale,
          transformOrigin: `${pieces[i].cx}% ${pieces[i].cy}%`,
        });
      });

      // l'image est légèrement agrandie pour pouvoir bouger sans
      // découvrir le bord de son cadre
      if (innerDrift > 0) {
        gsap.set(innerNodes, { scale: 1 + innerDrift / 34 });
      }

      if (reduced) {
        gsap.set([...shardNodes, ...floatNodes], {
          xPercent: 0,
          yPercent: 0,
          rotation: 0,
          scale: 1,
        });
        return;
      }

      // arrivée
      gsap.from(floatNodes, {
        opacity: 0,
        duration: 1,
        ease: "expo.out",
        stagger: { each: 0.055, from: "random" },
        scrollTrigger: { trigger: root.current, start: "top 88%", once: true },
      });

      pieces.forEach((p, i) => {
        /* ---- couche 2 : dérive au scroll ---- */
        gsap.fromTo(
          shardNodes[i],
          { xPercent: p.x, yPercent: p.y },
          {
            xPercent: -p.x,
            yPercent: -p.y,
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );

        /* ---- couche 1 : dérive permanente ---- */
        if (drift > 0 && floatNodes[i]) {
          const node = floatNodes[i];
          gsap.set(node, { transformOrigin: `${p.cx}% ${p.cy}%` });

          // trois boucles de durées premières entre elles : le motif ne se
          // répète pas à l'œil, le morceau a l'air de flotter librement
          gsap.to(node, {
            xPercent: p.dx * drift,
            duration: p.t1,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            delay: -p.t1 * p.phase,
          });
          gsap.to(node, {
            yPercent: p.dy * drift,
            duration: p.t2,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            delay: -p.t2 * p.phase,
          });
          gsap.to(node, {
            rotation: p.dr * drift,
            duration: p.t3,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            delay: -p.t3 * p.phase,
          });
        }

        /* ---- couche 3 : l'illustration bouge dans son cadre ---- */
        if (innerDrift > 0 && innerNodes[i]) {
          gsap.to(innerNodes[i], {
            xPercent: -p.dx * innerDrift,
            yPercent: -p.dy * innerDrift,
            duration: p.t2 * 1.4,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            delay: -p.t2 * p.phase,
          });
        }
      });
    }, root);

    return () => ctx.revert();
  }, [pieces, drift, innerDrift]);

  const dark = tone === "dark";

  return (
    <div
      ref={root}
      className={`relative ${className}`}
      style={{ aspectRatio: ratio }}
      role={src ? "img" : undefined}
      aria-label={src ? alt : undefined}
    >
      {pieces.map((p, i) => (
        // couche 1 — flotte en boucle
        <div
          key={i}
          ref={(el) => (floaters.current[i] = el)}
          className="absolute inset-0 will-change-transform"
          aria-hidden="true"
        >
          {/* couche 2 — porte la découpe et la dérive au scroll */}
          <div
            ref={(el) => (shards.current[i] = el)}
            className="absolute inset-0 overflow-hidden will-change-transform"
            style={{ clipPath: p.clip, WebkitClipPath: p.clip }}
          >
            {src ? (
              // couche 3 — bouge à l'intérieur du cadre
              <img
                ref={(el) => (inners.current[i] = el)}
                src={src}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover will-change-transform"
              />
            ) : (
              <div
                ref={(el) => (inners.current[i] = el)}
                className={`h-full w-full ${dark ? "bg-charbon" : "bg-ivoire"}`}
                style={{
                  backgroundImage: `repeating-linear-gradient(${
                    30 + i * 17
                  }deg, ${dark ? "#C9A86A" : "#8A6045"}2E 0 1px, transparent 1px 9px)`,
                  outline: `1px dashed ${dark ? "#C9A86A" : "#8A6045"}55`,
                  outlineOffset: "-1px",
                }}
              />
            )}
          </div>
        </div>
      ))}

      {!src && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
          <span
            className={`font-mono text-[10px] uppercase tracking-[0.18em] ${
              dark ? "text-dore/80" : "text-bronze/80"
            }`}
          >
            {label}
          </span>
          <span
            className={`font-mono text-[10px] ${
              dark ? "text-dore/50" : "text-bronze/50"
            }`}
          >
            {ratio} — image entière, {pieces.length} fragments
          </span>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- */

/** PRNG déterministe : la même `seed` redonne toujours la même découpe. */
function rng(seed) {
  let s = seed * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/** y de la coupe à l'abscisse x, entre son bord gauche et son bord droit */
const edgeAt = (edge, x) => edge.l + (edge.r - edge.l) * (x / 100);

/**
 * 1. Découpe l'image en `rows` bandes obliques d'épaisseurs inégales.
 * 2. Recoupe certaines bandes verticalement — la coupe penche elle aussi —
 *    ce qui donne des quadrilatères et non des barres.
 * 3. Attribue à chaque morceau ses décalages, son inclinaison, son échelle
 *    et les paramètres de sa dérive permanente.
 */
function buildShards({ rows, seed, chaos, spread }) {
  const rand = rng(seed);
  const k = Math.max(0, Math.min(1, chaos));
  const step = 100 / rows;
  // bridé : au-delà, deux coupes voisines se croiseraient
  const tiltMax = Math.min(step * 0.42, 4 + 9 * k);

  const cuts = Array.from({ length: rows + 1 }, (_, i) => {
    if (i === 0) return { l: 0, r: 0 };
    if (i === rows) return { l: 100, r: 100 };
    const base = i * step + (rand() - 0.5) * step * 0.45 * k;
    const tilt = (rand() - 0.5) * 2 * tiltMax;
    return { l: base - tilt, r: base + tilt };
  });

  const out = [];

  for (let i = 0; i < rows; i++) {
    const top = cuts[i];
    const bottom = cuts[i + 1];
    const splitIt = rand() < 0.3 + 0.55 * k;

    if (!splitIt) {
      out.push(
        makePiece(
          [
            [0, top.l],
            [100, top.r],
            [100, bottom.r],
            [0, bottom.l],
          ],
          rand,
          k,
          spread,
          i
        )
      );
      continue;
    }

    const xMid = 28 + rand() * 44;
    // bridé : une coupe verticale trop penchée fabrique des échardes
    const lean = (rand() - 0.5) * 2 * (5 + 7 * k);
    const xTop = clamp(xMid + lean, 8, 92);
    const xBottom = clamp(xMid - lean, 8, 92);

    out.push(
      makePiece(
        [
          [0, top.l],
          [xTop, edgeAt(top, xTop)],
          [xBottom, edgeAt(bottom, xBottom)],
          [0, bottom.l],
        ],
        rand,
        k,
        spread,
        i
      )
    );

    out.push(
      makePiece(
        [
          [xTop, edgeAt(top, xTop)],
          [100, top.r],
          [100, bottom.r],
          [xBottom, edgeAt(bottom, xBottom)],
        ],
        rand,
        k,
        spread,
        i
      )
    );
  }

  return out;
}

function makePiece(pts, rand, k, spread, rowIndex) {
  const clip = `polygon(${pts.map(([x, y]) => `${r2(x)}% ${r2(y)}%`).join(", ")})`;

  // barycentre du morceau : pivot de l'inclinaison
  const cx = r2(pts.reduce((a, p) => a + p[0], 0) / pts.length);
  const cy = r2(pts.reduce((a, p) => a + p[1], 0) / pts.length);

  const dir = rowIndex % 2 === 0 ? 1 : -1;
  const swing = 0.35 + rand() * 0.9;

  return {
    clip,
    cx,
    cy,
    // dérive au scroll
    x: r2(dir * spread * swing),
    y: r2((rand() - 0.5) * spread * (0.4 + 0.8 * k)),
    rot: r2((rand() - 0.5) * 2 * (1 + 4.5 * k)),
    scale: r2(1 + (rand() - 0.5) * 0.09 * k),
    // dérive permanente : direction, durées et phase de départ
    dx: r2((rand() - 0.5) * 2),
    dy: r2((rand() - 0.5) * 2),
    dr: r2((rand() - 0.5) * 1.6),
    t1: r2(5.5 + rand() * 5),
    t2: r2(6.5 + rand() * 5),
    t3: r2(8 + rand() * 6),
    // départ décalé : les morceaux ne repartent jamais tous ensemble
    phase: r2(rand()),
  };
}

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const r2 = (n) => Math.round(n * 100) / 100;