import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * LE BALAYAGE DU CIEL (§03, §07)
 * ============================================================================
 *
 * « Au scroll, la couleur monte depuis le bas. Le ciel monte et recouvre
 * l'écran. »
 *
 * POURQUOI UN BALAYAGE ET NON UN FONDU — LA DÉCISION LA PLUS IMPORTANTE DU
 * MOTEUR
 * ------------------------------------------------------------------------
 * Le §04 prévient que le contraste « cède le plus facilement » pendant la
 * bascule. C'est vérifié, et le résultat est sans appel.
 *
 * Si le fond ET l'encre se fondent ensemble, le contraste tombe à 1.00 au
 * milieu : le texte devient littéralement invisible, et 51 % de la transition
 * passe sous le seuil AA. On a essayé toutes les échappatoires :
 *
 *     encre décalée du fond ......... creux à 1.45
 *     encre à rampe raide ........... creux à 1.08
 *     encre en marche d'escalier .... creux à 2.79 (le meilleur cas)
 *
 * Aucune ne passe les 4.5 exigés. La raison est structurelle : un fond
 * aubergine à mi-course est un gris-violet moyen, et AUCUNE encre n'est
 * lisible dessus — ni le noir, ni le parchemin.
 *
 * Et l'argument « ça ne dure qu'une seconde » ne tient pas : en `scrub`, la
 * durée n'est pas fixée par une horloge mais par le doigt de l'utilisateur.
 * Un défilement lent gare la page au milieu de la bande illisible aussi
 * longtemps qu'il le veut.
 *
 * D'où ce composant. Le fond ne se mélange JAMAIS : il change d'un coup,
 * masqué par un voile opaque qui traverse l'écran. Chaque pixel est donc à
 * tout instant soit entièrement clair, soit entièrement ciel — le contraste
 * ne descend jamais sous 12.07, contre 1.00 avec un fondu.
 *
 * C'est aussi plus fidèle au brief, qui parle d'une couleur qui MONTE, pas
 * d'une couleur qui se fond.
 */
export default function SkyVeil() {
  const veil = useRef(null);

  useEffect(() => {
    /*
      Le voile est piloté par `src/lib/ground.js` via la variable
      `--veil` (0 = hors écran en bas, 1 = couvre tout, 2 = sorti par le
      haut). On ne fait ici que le rendre : la logique de frontière
      appartient au moteur, qui seul connaît l'ordre des sections.
    */
    gsap.set(veil.current, { visibility: "visible" });
  }, []);

  return (
    <div
      ref={veil}
      aria-hidden="true"
      data-sky-veil
      className="pointer-events-none fixed inset-0 z-[35] invisible"
      style={{
        backgroundColor: "var(--veil-color, var(--ciel))",
        /*
          `translateY` en pourcentage plutôt que `clip-path` : le composite
          se fait sur le GPU sans repeindre, ce qui protège l'INP nommé par
          le §07 comme limite dure.
        */
        transform: "translateY(calc((1 - var(--veil, 0)) * 100%))",
      }}
    />
  );
}
