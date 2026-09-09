import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { splitWords, prefersReducedMotion } from "./text";

gsap.registerPlugin(ScrollTrigger);

/**
 * Système de révélation au scroll, partagé par toutes les sections.
 *
 * On pose un attribut sur le markup et le scroll fait le reste :
 *
 *   data-reveal="text"   → le texte est découpé en mots qui montent depuis
 *                          un masque, décalés les uns après les autres.
 *   data-reveal="fade"   → simple montée en fondu (paragraphes, boutons…).
 *   data-reveal="lines"  → chaque enfant direct monte en fondu, en cascade.
 *   data-reveal="plate"  → une planche gravée ÉMERGE : elle gagne son opacité
 *                          et se dilate à peine, comme une image qui se
 *                          révèle sur le papier. C'est l'embrasement du §02
 *                          appliqué au dessin — jamais une lueur.
 *   data-reveal="rule"   → un filet se TRACE de gauche à droite. Le §05 veut
 *                          que « tout se joue au trait » : un trait qui
 *                          apparaît doit donc se dessiner, pas se fondre.
 *
 * Options par élément (facultatives) :
 *   data-reveal-delay="0.2"   décalage avant le départ
 *   data-reveal-stagger="0.03"  écart entre les mots / enfants
 *   data-reveal-start="top 90%" position de déclenchement ScrollTrigger
 */

const DEFAULT_START = "top 85%";

/**
 * Masque immédiatement les blocs à révéler pour éviter le flash.
 * Fait en JS (et non dans le JSX) : si le script ne tourne pas, le texte
 * reste visible — la dégradation est sûre.
 */
function markPending(els) {
  els.forEach((el) => el.setAttribute("data-reveal-pending", "true"));
}

function clearPending(el) {
  el.removeAttribute("data-reveal-pending");
}

/** Anime un seul élément porteur de data-reveal. */
function revealOne(el) {
  const kind = el.dataset.reveal || "fade";
  const delay = parseFloat(el.dataset.revealDelay) || 0;
  const start = el.dataset.revealStart || DEFAULT_START;
  const stagger =
    parseFloat(el.dataset.revealStagger) ||
    (kind === "text" ? 0.035 : 0.08);

  // cible : les mots découpés, les enfants directs, ou l'élément lui-même
  let targets;
  let from;

  if (kind === "text") {
    targets = splitWords(el);
    from = { yPercent: 115, duration: 1.05, ease: "expo.out" };
  } else if (kind === "lines") {
    targets = Array.from(el.children);
    from = { y: 26, opacity: 0, duration: 0.9, ease: "expo.out" };
  } else if (kind === "plate") {
    /*
      La planche n'arrive pas par le bas : elle ÉMERGE sur place. Le léger
      agrandissement (1.04 → 1) donne l'impression d'une image qui se fixe,
      et l'opacité cible est reprise du style de l'élément — chaque planche a
      la sienne, très basse, pour rester en marge.
    */
    targets = [el];
    from = { opacity: 0, scale: 1.04, duration: 1.6, ease: "expo.out" };
  } else if (kind === "rule") {
    targets = [el];
    from = { scaleX: 0, transformOrigin: "left center", duration: 1.1, ease: "expo.out" };
  } else {
    targets = [el];
    from = { y: 22, opacity: 0, duration: 0.9, ease: "expo.out" };
  }

  if (!targets.length) {
    clearPending(el);
    return;
  }

  clearPending(el);

  /*
    `immediateRender: true` pose l'état de départ dès la création du tween :
    le texte est donc déjà masqué avant le premier rendu, sans qu'on ait à
    figer les valeurs à la main.

    (Un `gsap.set(...)` séparé AVANT un `gsap.from(...)` est un piège : le
    tween part alors de la valeur qu'on vient de poser POUR arriver à cette
    même valeur — l'élément reste invisible et rien ne s'anime.)
  */
  gsap.from(targets, {
    immediateRender: true,
    ...from,
    delay,
    stagger,
    /*
      On ne purge QUE l'opacité. Un `clearProps: "transform"` effacerait les
      transformations qu'une AUTRE animation pilote sur la même cible — le
      `xPercent` scrubbé du bandeau défilant, par exemple, disparaîtrait au
      premier scroll. Les propriétés de départ (y / yPercent) sont remises à
      zéro par l'animation elle-même.
    */
    /*
      On ne purge QUE l'opacité, et JAMAIS pour une planche : la sienne est
      fixée par une classe (très basse, pour rester en marge), et la purger
      la ferait sauter à 1 à la fin de l'animation.

      Un `clearProps: "transform"` effacerait par ailleurs les
      transformations qu'une AUTRE animation pilote sur la même cible — la
      parallaxe des planches, par exemple.
    */
    clearProps: kind === "plate" ? "" : "opacity",
    scrollTrigger: {
      trigger: el,
      start,
      once: true,
    },
  });
}

/**
 * Branche la révélation sur tous les [data-reveal] contenus dans `root`.
 * À appeler dans un gsap.context() pour que le nettoyage soit automatique.
 */
export function initReveals(root) {
  if (!root) return;
  const els = Array.from(root.querySelectorAll("[data-reveal]"));
  if (!els.length) return;

  markPending(els);

  // mouvement réduit : on affiche tout, sans animation
  if (prefersReducedMotion()) {
    els.forEach((el) => {
      if (el.dataset.reveal === "text") splitWords(el);
      gsap.set([el, ...el.children], { clearProps: "all", opacity: 1, y: 0 });
      clearPending(el);
    });
    return;
  }

  els.forEach(revealOne);
}
