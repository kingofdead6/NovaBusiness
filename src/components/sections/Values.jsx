import useReveal from "../../hooks/useReveal";
import { values } from "../../data/site";

/**
 * ÉTAT 2 (suite) — TOUT OU RIEN
 * ============================================================================
 *
 * Toujours dans le ciel. C'est ici que la position du §02 s'énonce en pleine
 * taille, juste après l'embrasement.
 *
 * POURQUOI PLUS DE CARTES
 * -----------------------
 * La version précédente rendait ces trois valeurs en trois cartes d'image
 * avec voile, index en gélule et bascule titre/corps au survol. Le §09
 * interdit littéralement cette structure — « grand titre centré, trois cartes
 * de bénéfices » — et le refus « porte sur la structure autant que sur
 * l'habillage ».
 *
 * Le survol posait en plus un vrai problème : il CACHAIT le corps du texte
 * tant qu'on ne pointait pas la carte. Le §07 protège explicitement la
 * lisibilité par les moteurs et les IA ; un contenu révélé au survol est
 * invisible à l'un comme à l'autre, et inatteignable au toucher.
 *
 * La copie française d'origine est conservée telle quelle : elle est bonne,
 * et le brief ne demandait pas de la réécrire. Elle est simplement reposée
 * en prose, à grande échelle, dans beaucoup de vide.
 */
export default function Values() {
  const root = useReveal();

  return (
    <section
      ref={root}
      data-ground="ciel"
      className="relative pb-40 pt-24 md:pb-56"
    >
      <div className="edge">
        <h2
          data-reveal="text"
          className="max-w-4xl font-display text-d2 font-black lowercase tracking-tight"
        >
          tout, ou rien.
        </h2>

        <div className="mt-10 grid gap-x-16 gap-y-6 md:grid-cols-2">
          <p data-reveal="fade" className="ink-60 text-[17px] leading-relaxed">
            <span className="ink">Tout.</span> Image de marque, site,
            application, référencement, contenu, community management. La chaîne
            complète, de bout en bout. Une marque visible ne se découpe pas en
            prestations séparées, confiées à trois fournisseurs qui ne se
            parlent pas.
          </p>

          <p data-reveal="fade" className="ink-60 text-[17px] leading-relaxed">
            <span className="ink">Ou rien.</span> Cent pour cent, ou pas du
            tout. Pas de site correct, pas de compromis sur le soin, pas de
            prestation rabotée pour tenir un budget. Une chaîne ne vaut que son
            maillon le plus faible.
          </p>
        </div>

        {/*
          Les trois refus, en liste. Le chiffre EST la structure : pas de
          carte, pas de bordure, pas de puce en gélule, et surtout aucun
          connecteur dessiné d'un bloc à l'autre (§09).
        */}
        <ul data-reveal="lines" className="mt-28 space-y-16 md:space-y-20">
          {values.map((value, i) => (
            <li key={value.title} className="grid gap-4 md:grid-cols-[6rem_1fr]">
              <span className="ink-40 font-mono text-[11px] tabular-nums tracking-[0.18em]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="max-w-2xl">
                <h3 className="text-d3 font-medium lowercase">{value.title}</h3>
                <p className="ink-60 mt-4 text-[17px] leading-relaxed">
                  {value.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
