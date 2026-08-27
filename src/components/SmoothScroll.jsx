import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/*
 * Référence partagée vers l'instance Lenis courante.
 *
 * Elle est nécessaire parce que le défilement lisse ne passe PAS par
 * `overflow` : Lenis anime lui-même la position, et un `overflow: hidden`
 * posé sur <html> ne l'arrête donc pas. Un composant qui doit geler la page
 * (le menu plein écran) a besoin d'appeler `stop()` sur l'instance réelle.
 *
 * `null` tant qu'aucune instance n'existe — c'est le cas en mouvement
 * réduit, où Lenis n'est jamais créé : les appelants doivent le prévoir.
 */
export const lenisRef = { current: null };

/**
 * Branche Lenis sur le ticker GSAP pour que ScrollTrigger et le scroll
 * fluide restent parfaitement synchronisés (sinon les sections épinglées
 * "sautent" d'une frame).
 */
export default function SmoothScroll({ children }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    });

    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // ancres internes
    const onClick = (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      const id = link.getAttribute("href");
      if (id === "#" || !document.querySelector(id)) return;
      e.preventDefault();
      /*
        `force` : ce même écouteur sert les liens du menu plein écran, qui
        gèle Lenis tant qu'il est ouvert. Le clic referme le menu, mais la
        remise en marche passe par un nettoyage d'effet React — donc APRÈS
        ce gestionnaire. Sans `force`, le défilement serait ignoré et le
        lien resterait sans effet.
      */
      lenis.scrollTo(id, { offset: -80, duration: 1.4, force: true });
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return children;
}
