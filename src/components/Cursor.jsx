import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

/**
 * Curseur maison : un petit disque bronze qui grossit sur les éléments
 * marqués `data-cursor="hover"` et affiche un libellé sur `data-cursor-text`.
 * Désactivé au toucher et si l'utilisateur a réduit les animations.
 */
export default function Cursor() {
  const dot = useRef(null);
  const [label, setLabel] = useState("");

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    document.body.classList.add("has-cursor");

    const xTo = gsap.quickTo(dot.current, "x", { duration: 0.35, ease: "power3" });
    const yTo = gsap.quickTo(dot.current, "y", { duration: 0.35, ease: "power3" });

    const onMove = (e) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };

    const onOver = (e) => {
      const target = e.target.closest("[data-cursor]");
      if (!target) return;
      const text = target.getAttribute("data-cursor-text") || "";
      setLabel(text);
      gsap.to(dot.current, {
        scale: text ? 3.6 : 2.4,
        backgroundColor: text ? "#1C1C1C" : "#C9A86A",
        duration: 0.4,
        ease: "power3.out",
      });
    };

    const onOut = (e) => {
      if (!e.target.closest?.("[data-cursor]")) return;
      setLabel("");
      gsap.to(dot.current, {
        scale: 1,
        backgroundColor: "#8A6045",
        duration: 0.4,
        ease: "power3.out",
      });
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);

    return () => {
      document.body.classList.remove("has-cursor");
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
    };
  }, []);

  return (
    <div
      ref={dot}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[70] hidden h-3 w-3 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-bronze md:flex"
    >
      {label && (
        <span className="whitespace-nowrap font-mono text-[3.2px] uppercase tracking-[0.14em] text-ivoire">
          {label}
        </span>
      )}
    </div>
  );
}
