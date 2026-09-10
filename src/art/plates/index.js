/**
 * LE RÉPERTOIRE DES PLANCHES
 * ============================================================================
 *
 * Chaque planche est un MODULE DE DONNÉES, pas un fichier `.svg` :
 *
 *     { viewBox: "0 0 400 500", paths: [{ d: "M…", w: 1.2 }, …] }
 *
 * Deux raisons de ne pas importer des `.svg` :
 *   1. le §05 veut que « l'épaisseur porte le sens », donc il faut une
 *      épaisseur PAR TRACÉ, réglable ;
 *   2. la prop `weight` de <Plate> multiplie toutes les épaisseurs d'un coup,
 *      ce qu'un fichier importé — bloc opaque non restylable — interdit.
 *
 * Les tracés doivent être dessinés à la main dans un outil vectoriel puis
 * exportés : l'irrégularité et le léger tremblé du §05 s'obtiennent en
 * DESSINANT, pas en perturbant des coordonnées au rendu.
 *
 * Tant qu'une entrée manque, <Plate> rend un emplacement annoté au trait —
 * la mise en page tient, le chantier n'est pas bloqué.
 */
export const plates = {
  // en attente des dessins définitifs (phase 6)
};
