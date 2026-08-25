import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * SECTION 07 — BANDEAU DÉFILANT
 * Deux lignes qui défilent en sens opposé ; la vitesse dépend de la vitesse
 * de scroll (le texte « accélère » quand on scrolle vite).
 */
const LINE_A = ["fondateurs", "maisons", "restaurants", "studios", "indépendants"];
const LINE_B = ["sites", "identités", "contenus", "acquisition", "conseil"];

export default function Marquee() {
  const root = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;

      const rows = gsap.utils.toArray("[data-row]");

      rows.forEach((row, i) => {
        const dir = i % 2 === 0 ? -1 : 1;

        gsap.to(row, {
          xPercent: dir * 50,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.2,
          },
        });
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      className="relative overflow-hidden border-y border-charbon/10 bg-ivoire py-12 md:py-16"
      aria-label="Pour qui nous travaillons"
    >
      <div className="flex flex-col gap-2">
        <div data-row className="flex w-max items-center gap-8 whitespace-nowrap">
          {[...LINE_A, ...LINE_A, ...LINE_A].map((w, i) => (
            <span key={i} className="flex items-center gap-8">
              <span className="text-d2 font-black lowercase leading-none">{w}</span>
              <span className="h-2 w-2 rounded-full bg-bronze" aria-hidden="true" />
            </span>
          ))}
        </div>

        <div
          data-row
          className="flex w-max -translate-x-1/4 items-center gap-8 whitespace-nowrap"
        >
          {[...LINE_B, ...LINE_B, ...LINE_B].map((w, i) => (
            <span key={i} className="flex items-center gap-8">
              <span className="text-d2 font-display italic leading-none text-bronze/45">
                {w}
              </span>
              <span className="h-px w-14 bg-charbon/20" aria-hidden="true" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
