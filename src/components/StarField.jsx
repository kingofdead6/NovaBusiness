import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";

/**
 * Semis d'étoiles et de poussière pour le fond d'une section sombre.
 *
 * Les positions sont tirées d'un générateur À GRAINE : la disposition est donc
 * identique à chaque rendu (pas de sautillement au remontage du composant,
 * pas d'écart entre serveur et client) tout en gardant un aspect aléatoire.
 *
 * Deux familles :
 *   - étoiles  : petites croix à quatre branches, comme celle du logo ;
 *   - poussière: simples points, plus nombreux et plus discrets.
 *
 * Chacune scintille sur sa propre boucle, de durées différentes, pour que le
 * motif ne se répète jamais à l'œil.
 */
export default function StarField({
  stars = 18,
  dust = 34,
  seed = 7,
  className = "",
}) {
  const root = useRef(null);

  const points = useMemo(() => {
    // générateur congruentiel : suffisant ici, et reproductible
    let s = seed;
    const rand = () => {
      s = (s * 1664525 + 1013904223) % 4294967296;
      return s / 4294967296;
    };

    const make = (count, kind) =>
      Array.from({ length: count }, () => ({
        kind,
        x: rand() * 100,
        y: rand() * 100,
        size: kind === "star" ? 6 + rand() * 10 : 1.5 + rand() * 2,
        opacity: kind === "star" ? 0.25 + rand() * 0.45 : 0.15 + rand() * 0.3,
        delay: rand() * 4,
        dur: 2.4 + rand() * 3.6,
      }));

    return [...make(stars, "star"), ...make(dust, "dust")];
  }, [stars, dust, seed]);

  useEffect(() => {
    const el = root.current;
    if (!el) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    const ctx = gsap.context(() => {
      el.querySelectorAll("[data-twinkle]").forEach((node) => {
        const base = Number(node.dataset.opacity);
        gsap.to(node, {
          opacity: base * 0.25,
          scale: 0.75,
          duration: Number(node.dataset.dur),
          delay: Number(node.dataset.delay),
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          transformOrigin: "50% 50%",
        });
      });
    }, el);

    return () => ctx.revert();
  }, [points]);

  return (
    <div
      ref={root}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {points.map((p, i) =>
        p.kind === "star" ? (
          <svg
            key={i}
            data-twinkle
            data-opacity={p.opacity}
            data-delay={p.delay}
            data-dur={p.dur}
            viewBox="0 0 24 24"
            className="absolute text-dore"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              opacity: p.opacity,
            }}
          >
            {/* étoile à quatre branches, concave — même dessin que le logo */}
            <path
              d="M12 0c1 7 4 11 12 12-8 1-11 5-12 12-1-7-4-11-12-12C8 11 11 7 12 0z"
              fill="currentColor"
            />
          </svg>
        ) : (
          <span
            key={i}
            data-twinkle
            data-opacity={p.opacity}
            data-delay={p.delay}
            data-dur={p.dur}
            className="absolute rounded-full bg-ivoire"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              opacity: p.opacity,
            }}
          />
        )
      )}
    </div>
  );
}
