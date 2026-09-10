import { useRef, useEffect } from "react";
import gsap from "gsap";

/**
 * EMPLACEMENT IMAGE.
 *
 * Tant que `src` est vide, on affiche un cadre annoté (ratio + description).
 * Pour remplir : <Media src="/images/hero.jpg" alt="..." ... />
 *
 * props
 *  - src, alt      : l'image finale
 *  - ratio         : "16/10", "4/5", "1/1"… (aspect-ratio CSS)
 *  - label         : ce que l'image doit montrer (visible sur le placeholder)
 *  - parallax      : nombre de px de décalage au scroll (0 = désactivé)
 *  - rounded       : classes de border-radius
 *  - tone          : "light" (sur ivoire) | "dark" (sur charbon)
 */
export default function Media({
  src,
  alt = "",
  ratio = "16/10",
  label = "Image",
  parallax = 0,
  rounded = "rounded-[2px]",
  tone = "light",
  className = "",
  imgClassName = "",
}) {
  const wrap = useRef(null);
  const inner = useRef(null);

  useEffect(() => {
    if (!parallax || !inner.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        inner.current,
        { yPercent: -parallax },
        {
          yPercent: parallax,
          ease: "none",
          scrollTrigger: {
            trigger: wrap.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    }, wrap);
    return () => ctx.revert();
  }, [parallax]);

  const dark = tone === "dark";

  return (
    <div
      ref={wrap}
      className={`relative overflow-hidden ${rounded} ${className}`}
      style={{ aspectRatio: ratio }}
    >
      <div ref={inner} className="absolute inset-0 h-full w-full scale-[1.12]">
        {src ? (
          /*
            L'illustration est rendue TELLE QUELLE, avec ses couleurs.

            Une version précédente la peignait dans l'encre courante en s'en
            servant de masque, comme les planches gravées : cela l'alignait
            sur la palette, mais au prix de tout son coloris. Les
            illustrations du client sont des pièces à part entière, pas des
            éléments d'interface.
          */
          <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            className={`h-full w-full object-cover ${imgClassName}`}
          />
        ) : (
          <div
            /*
              L'emplacement annoté suit l'encre courante : il est donc juste
              sur le clair comme sur le ciel, sans variante par fond. La prop
              `dark` n'a plus lieu d'être depuis que le fond est global.
            */
            className="rule-ink ink-60 flex h-full w-full flex-col items-center justify-center gap-3 border border-dashed p-6 text-center"
          >
            <svg
              viewBox="0 0 40 40"
              className="h-7 w-7 opacity-60"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
            >
              <rect x="2" y="6" width="36" height="28" />
              <path d="M2 27l10-9 8 7 6-5 12 10" />
              <circle cx="29" cy="15" r="3" />
            </svg>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em]">
              {label}
            </span>
            <span className="font-mono text-[10px] opacity-60">{ratio}</span>
          </div>
        )}
      </div>
    </div>
  );
}
