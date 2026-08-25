import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * EMPLACEMENT D'IMAGE AVEC ENTRÉE / SORTIE AU SCROLL.
 *
 * Tant que `src` est vide, un cadre de repérage indique le format attendu.
 * Dès qu'on passe une image, elle prend toute la place sans rien changer
 * d'autre.
 *
 * MOUVEMENT — entièrement piloté par le scroll, donc réversible :
 *
 *   loin (avant)   inclinée, tournée, décalée, réduite
 *        ↓ on approche
 *   en place       droite, à l'échelle 1, à sa position finale
 *        ↓ on s'éloigne
 *   loin (après)   elle repart vers son état initial
 *
 * Le tween est un `fromTo` en `yoyo` sur un ScrollTrigger `scrub` : la
 * première moitié de la traversée joue l'entrée, la seconde rejoue la sortie
 * en miroir. Remonter rejoue exactement l'inverse — il n'y a aucune animation
 * autonome, la position de scroll est la seule source de vérité.
 *
 * props
 *  - src, alt   : l'image finale (vide = cadre de repérage)
 *  - label      : ce que l'image doit montrer (visible sur le cadre)
 *  - ratio      : format du cadre, ex. "3/4"
 *  - from       : état de départ//arrivée — { x, y, rotate, scale }
 *  - tone       : "light" (sur ivoire) | "dark" (sur charbon)
 */
export default function DriftArt({
  src,
  alt = "",
  label = "Image",
  ratio = "3/4",
  className = "",
  from = {},
  tone = "dark",
  scrollStart = "top bottom",
  scrollEnd = "bottom top",
}) {
  const wrap = useRef(null);

  const { x = 0, y = 60, rotate = -8, scale = 0.86 } = from;

  useEffect(() => {
    if (!wrap.current) return undefined;

    const ctx = gsap.context(() => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const trigger = wrap.current.closest("section") || wrap.current;

      if (reduced) {
        gsap.set(wrap.current, { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 });
        return;
      }

      /*
       * `yoyo: true` + `repeat: 1` sur un tween scrubbé : GSAP parcourt
       * l'aller sur la première moitié de la plage, puis le retour sur la
       * seconde. L'image arrive donc en place au milieu de la traversée et
       * repart ensuite d'où elle venait.
       */
      gsap.fromTo(
        wrap.current,
        { x, y, rotate, scale, opacity: 0 },
        {
          x: 0,
          y: 0,
          rotate: 0,
          scale: 1,
          opacity: 1,
          ease: "power2.out",
          repeat: 1,
          yoyo: true,
          scrollTrigger: {
            trigger,
            start: scrollStart,
            end: scrollEnd,
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        }
      );
    }, wrap);

    return () => ctx.revert();
  }, [x, y, rotate, scale, scrollStart, scrollEnd]);

  const dark = tone === "dark";

  return (
    <div ref={wrap} className={`will-change-transform ${className}`}>
      <div className="relative h-full w-full overflow-hidden" style={{ aspectRatio: ratio }}>
        {src ? (
          <img src={src} alt={alt} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div
            aria-hidden="true"
            className={`flex h-full w-full flex-col items-center justify-center gap-3 border border-dashed p-5 text-center ${
              dark ? "border-dore/40 bg-charbon/40 text-dore/70" : "border-bronze/35 bg-bronze/[0.05] text-bronze/70"
            }`}
          >
            <svg viewBox="0 0 40 40" className="h-7 w-7 opacity-60" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="2" y="6" width="36" height="28" />
              <path d="M2 27l10-9 8 7 6-5 12 10" />
              <circle cx="29" cy="15" r="3" />
            </svg>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em]">{label}</span>
            <span className="font-mono text-[10px] opacity-60">{ratio}</span>
          </div>
        )}
      </div>
    </div>
  );
}
