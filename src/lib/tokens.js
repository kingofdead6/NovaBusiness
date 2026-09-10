/**
 * LA PALETTE — SOURCE DE VÉRITÉ UNIQUE
 * ============================================================================
 *
 * Ce fichier est le SEUL endroit du dépôt où une couleur est écrite en dur.
 * `tailwind.config.js` l'importe pour générer ses utilitaires ET les
 * variables `:root`, et les composants qui ont besoin d'une valeur littérale
 * (le curseur, qui compare des luminances) l'importent aussi.
 *
 * La version précédente du site portait sa palette à trois endroits — la
 * config Tailwind, le `:root` du CSS, et des constantes en dur dans
 * `Cursor.jsx` — plus une vingtaine de littéraux enfouis dans le CSS du pied
 * de page. Les trois avaient divergé. D'où cette règle : une seule
 * définition, tout le reste en dérive.
 *
 * TROIS RÔLES, PAS SIX COULEURS (§04)
 * -----------------------------------
 * Le brief ne demande pas une palette, il demande des rôles :
 *
 *   clair      le sol du site — les zones de lecture, ce vers quoi on revient
 *   ciel       la couleur de marque — en aplat plein quand le site plonge
 *   contraste  ce avec quoi on dessine LORSQU'ON EST SUR LE CIEL
 *   noir       le texte courant sur le clair
 *
 * « Sur le clair, on dessine avec la couleur. Sur la couleur, on dessine
 * avec le contraste. Le site n'a jamais plus de deux couleurs à l'écran en
 * même temps. » Cette règle est structurelle et non déclarative : à tout
 * instant la page ne peint que `--ground-bg` et `--ground-ink`, tous deux
 * dérivés du même nombre `--ground`.
 *
 * POURQUOI CETTE AUBERGINE
 * ------------------------
 * `#2E1A47` satisfait les trois conditions du §04 :
 *   - elle tient en aplat plein écran (ce n'est pas un presque-noir) ;
 *   - elle reste lisible dans les deux sens, très au-delà du seuil AA :
 *       noir      sur clair  → 17,81
 *       contraste sur ciel   → 12,07
 *     (AA exige 4,5 ; AAA exige 7)
 *   - ce n'est pas le bleu de tile.pt, cité pour sa mécanique et non pour
 *     sa couleur.
 */

export const palette = {
  clair: "#F1ECE0",
  ciel: "#2E1A47",
  contraste: "#EDE2CC",
  noir: "#000000",
};

/**
 * Les rôles peints, dérivés de `--ground` (0 = clair, 1 = ciel).
 *
 * Ils vivent en CSS et non ici — `src/index.css` les calcule par
 * `color-mix()`. On expose seulement leurs NOMS, pour que le JS puisse les
 * lire sans les réécrire.
 */
export const groundVars = {
  bg: "--ground-bg",
  ink: "--ground-ink",
  t: "--ground",
};
