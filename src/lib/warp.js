import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * LE TREMBLÉ PILOTÉ PAR LE DÉFILEMENT
 * ============================================================================
 *
 * Le §05 veut que « la main reste visible ». Les filtres fixes le font déjà.
 * Celui-ci va plus loin : son amplitude SUIT LE SCROLL, si bien que la planche
 * se déforme quand on la traverse et se repose quand on s'arrête.
 *
 * POURQUOI CE N'EST PAS UNE ANIMATION EN BOUCLE
 * ---------------------------------------------
 * Le §09 interdit « les animations en boucle et les éléments qui pulsent ».
 * Ici rien ne tourne tout seul : l'amplitude est une fonction de la position
 * de défilement. Immobile, la planche est parfaitement stable. Le mouvement
 * appartient au geste de l'utilisateur — exactement comme le fond, les
 * parallaxes et les révélations.
 *
 * Et il est RÉVERSIBLE, ce que le §07 exige explicitement : remonter défait le
 * tremblé dans l'autre sens.
 *
 * PERFORMANCE
 * -----------
 * On écrit sur UN seul attribut SVG, partagé par toutes les planches qui
 * utilisent ce filtre — pas un filtre par planche. Le coût est donc constant
 * quel que soit le nombre de planches à l'écran, et le §07 nomme l'INP comme
 * limite dure.
 */

/** Amplitude maximale du déplacement, en pixels. */
const MAX = 26;

export function initWarp() {
  const node = document.querySelector("[data-warp-scroll]");
  if (!node) return () => {};

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    node.setAttribute("scale", "3");
    return () => {};
  }

  const state = { v: 0 };

  /*
    La déformation est maximale au MILIEU de la traversée et nulle aux deux
    bouts : la planche se tord en passant, puis se repose. Un simple `fromTo`
    donnerait une déformation permanente en fin de course.
  */
  const tween = gsap.fromTo(
    state,
    { v: 0 },
    {
      v: 1,
      ease: "none",
      scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.9,
      },
      onUpdate: () => {
        // sinusoïde : 0 aux extrémités, 1 au centre, plusieurs fois sur la page
        const amp = Math.abs(Math.sin(state.v * Math.PI * 3));
        node.setAttribute("scale", String(3 + amp * MAX));
      },
    }
  );

  return () => {
    tween.scrollTrigger?.kill();
    tween.kill();
  };
}
