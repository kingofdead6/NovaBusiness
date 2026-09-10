import { palette } from "./src/lib/tokens.js";

/**
 * Les couleurs ne sont PAS écrites ici : elles viennent de `src/lib/tokens.js`,
 * et le plugin en bas de fichier émet les variables `:root` depuis ce même
 * objet. Une seule définition, deux consommateurs — la palette ne peut plus
 * diverger entre la config et la feuille de styles.
 */

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ...palette,
        /*
          Les deux rôles PEINTS. Ils changent avec le fond courant, donc ils
          pointent vers les variables et non vers une valeur : `text-ink` reste
          juste que l'on soit sur le clair ou sur le ciel.
        */
        bg: "var(--ground-bg)",
        ink: "var(--ground-ink)",
      },
      fontFamily: {
        /*
          Trois voix (§06). Le brief laisse les familles ouvertes et n'impose
          que les rôles.

          titrage  — Fraunces, didone variable à fort contraste : elle a le
                     caractère affirmé qu'exige le titrage et son axe optique
                     tient aux très grandes tailles voulues par le §07.
          courant  — Inter, police de labeur, pour le confort de lecture des
                     articles.
          voix     — IBM Plex Mono pour les libellés, compteurs, dates et
                     légendes : la troisième voix distincte du §06.
        */
        display: ["Fraunces", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "monospace"],
      },
      fontSize: {
        // échelle fluide — le §07 veut « de vraies grandes tailles »
        d1: ["clamp(2.75rem, 8.5vw, 8.5rem)", { lineHeight: "0.92", letterSpacing: "-0.04em" }],
        d2: ["clamp(2.25rem, 6vw, 5.5rem)", { lineHeight: "0.95", letterSpacing: "-0.035em" }],
        d3: ["clamp(1.75rem, 3.6vw, 3.25rem)", { lineHeight: "1.02", letterSpacing: "-0.03em" }],
        giant: ["clamp(5.5rem, 22vw, 22rem)", { lineHeight: "0.8", letterSpacing: "-0.05em" }],
      },
      transitionTimingFunction: {
        nova: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      /*
        Aucune `animation` déclarée : le §09 interdit les animations en boucle,
        et le marquee qui vivait ici est parti avec la section Clients.
      */
    },
  },
  plugins: [
    /*
      Émet la palette en variables CSS depuis le MÊME objet que les
      utilitaires ci-dessus. C'est ce qui supprime la duplication au lieu de
      simplement l'aligner : il n'existe plus de second endroit à mettre à
      jour quand on essaie une autre couleur de marque (§04 demande de
      pouvoir en présenter deux ou trois).
    */
    function novaTokens({ addBase }) {
      const vars = Object.fromEntries(
        Object.entries(palette).map(([name, value]) => [`--${name}`, value])
      );
      addBase({ ":root": vars });
    },
  ],
};
