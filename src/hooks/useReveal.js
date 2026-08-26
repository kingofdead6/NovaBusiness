import { useEffect, useRef } from "react";
import gsap from "gsap";
import { initReveals } from "../lib/reveal";

/**
 * Accroche les animations d'écriture au scroll sur une section.
 *
 *   const root = useReveal();
 *   return <section ref={root}> … <h2 data-reveal="text">…</h2> … </section>;
 *
 * Le gsap.context() nettoie tous les ScrollTrigger au démontage.
 */
export default function useReveal(deps = []) {
  const root = useRef(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => initReveals(el), el);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return root;
}
