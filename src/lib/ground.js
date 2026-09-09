import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * LE MOTEUR DES DEUX FONDS (§03)
 * ============================================================================
 *
 * « Le fil conducteur n'est pas posé sur les pages, il est dessous : c'est le
 * fond qui relie une section à la suivante. »
 *
 * L'état tient en UN nombre, `--ground`, posé sur <html> : 0 = clair,
 * 1 = ciel. Le fond et l'encre en dérivent par `color-mix()` dans
 * `index.css`, donc animer ce seul nombre repeint tout le document.
 *
 * POURQUOI SUR <html> ET PAS DANS UN CONTEXTE REACT
 * -------------------------------------------------
 * Un contexte React re-rendrait l'arbre à chaque frame de défilement, ce qui
 * détruirait l'INP que le §07 nomme comme limite dure. Une propriété
 * personnalisée héritée est lue par tout le document gratuitement, et GSAP
 * l'anime hors de React.
 *
 * COMMENT UNE SECTION DÉCLARE SON FOND
 * ------------------------------------
 *     <section data-ground="clair">…</section>
 *     <section data-ground="ciel">…</section>
 *
 * Aucune section ne connaît ses voisines : c'est ce module qui lit la suite
 * dans l'ordre du document et en déduit les FRONTIÈRES. Ajouter, retirer ou
 * déplacer une section ne demande donc jamais de retoucher le moteur.
 *
 * ALLER ET RETOUR
 * ---------------
 * Chaque frontière est un `fromTo` en `scrub` : ScrollTrigger le rejoue à
 * l'envers quand on remonte, sans code supplémentaire. Le §07 l'exige
 * — « chaque mouvement peut se produire à l'aller et au retour ».
 */

const VALUE = { clair: 0, ciel: 1 };

/**
 * Branche les bascules de fond sur les `[data-ground]` contenus dans `root`.
 * Renvoie une fonction de nettoyage.
 */
export function initGround(root = document) {
  const sections = Array.from(root.querySelectorAll("[data-ground]"));
  if (!sections.length) return () => {};

  const el = document.documentElement;

  // état de départ : celui que déclare la première section
  const first = VALUE[sections[0].dataset.ground] ?? 0;
  gsap.set(el, { "--ground": first });

  const triggers = [];

  /*
    Le mouvement réduit garde les fonds — ce sont des COULEURS, pas une
    animation — mais supprime le scrub : chaque section pose sa valeur d'un
    coup à son entrée. La lisibilité est préservée, le mouvement non.
  */
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  for (let i = 1; i < sections.length; i += 1) {
    const from = VALUE[sections[i - 1].dataset.ground] ?? 0;
    const to = VALUE[sections[i].dataset.ground] ?? 0;

    // deux sections de même fond ne forment pas une frontière
    if (from === to) continue;

    const entering = sections[i];

    if (reduced) {
      const t = ScrollTrigger.create({
        trigger: entering,
        start: "top 60%",
        onEnter: () => gsap.set(el, { "--ground": to }),
        onLeaveBack: () => gsap.set(el, { "--ground": from }),
      });
      triggers.push(t);
      continue;
    }

    /*
      LE BALAYAGE.

      `--veil` va de 0 (voile hors écran, en bas) à 1 (voile couvrant tout
      l'écran). À MI-COURSE — quand le voile couvre entièrement la fenêtre —
      on bascule `--ground` d'un coup : le changement est alors invisible,
      puisque rien du fond n'est à l'écran. Puis le voile continue et sort
      par le haut, découvrant le nouveau fond.

      C'est ce qui garantit qu'aucun pixel n'est jamais à une valeur
      intermédiaire, donc que le contraste ne s'effondre pas (voir le long
      commentaire de `SkyVeil.jsx`).

      Le voile porte la couleur VERS LAQUELLE on va : il faut qu'il se
      confonde avec le fond d'arrivée au moment où il se retire.
    */
    const veilColor = to === 1 ? "var(--ciel)" : "var(--clair)";

    const state = { v: 0 };

    const tween = gsap.to(state, {
      v: 2,
      ease: "none",
      scrollTrigger: {
        trigger: entering,
        start: "top 85%",
        end: "top 15%",
        scrub: 0.4,
      },
      onUpdate: () => {
        const v = state.v;

        /*
          0 → 1 : le voile monte et couvre l'écran.
          1 → 2 : il poursuit sa route et sort par le haut.
          `--veil` vaut donc 1 au plein, et retombe vers 0 en sortant : une
          seule variable décrit les deux moitiés du geste.
        */
        el.style.setProperty("--veil-color", veilColor);
        el.style.setProperty("--veil", String(v <= 1 ? v : 2 - v));

        /*
          Le fond bascule EXACTEMENT quand le voile est plein : le changement
          est alors invisible, puisque aucun pixel du fond n'est à l'écran.
          La condition étant une simple comparaison sur `v`, elle se rejoue
          d'elle-même à l'envers quand on remonte.
        */
        gsap.set(el, { "--ground": v >= 1 ? to : from });
      },
    });

    triggers.push(tween.scrollTrigger);
    triggers.push(tween);
  }

  /*
    GARDE-FOU DE DÉVELOPPEMENT.

    Deux frontières dont les plages se chevauchent se disputeraient `--ground`
    et produiraient un scintillement très difficile à diagnostiquer. Sur
    l'accueil (trois bascules bien séparées) cela n'arrivera pas ; sur les
    pages du §08, à bascule unique, c'est une erreur de composition possible.
  */
  if (import.meta.env?.DEV) {
    const ranges = triggers
      .filter((t) => t && typeof t.start === "number")
      .map((t) => [t.start, t.end])
      .sort((a, b) => a[0] - b[0]);

    for (let i = 1; i < ranges.length; i += 1) {
      if (ranges[i][0] < ranges[i - 1][1]) {
        console.warn(
          "[ground] deux bascules se chevauchent — elles se disputeront --ground :",
          ranges[i - 1],
          ranges[i]
        );
      }
    }
  }

  return () => {
    triggers.forEach((t) => t?.kill?.());
  };
}
