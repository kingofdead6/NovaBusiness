import useReveal from "../../hooks/useReveal";
import { values } from "../../data/site";
import StarSky from "../StarSky";
import Horizon from "../Horizon";
import Engraving from "../Engraving";
import scorpion from "../../assets/plates/scorpion-trait.png";

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
      className="relative overflow-hidden pb-40 pt-24 md:pb-56"
    >
      {/* le ciel continue : autre graine, donc autre semis, même monde */}
      <StarSky seed={29} className="text-contraste" />

      {/*
        HEVELIUS, LE SCORPION.

        L'annexe A retient de ces planches « le trait du dessin principal, la
        hachure, le cadre ». Elle est posée en marge, très grande et très
        discrète : elle habite le ciel sans concurrencer le texte.

        Positionnée sur la SECTION et non dans `.edge` : un `absolute` placé
        dans le conteneur de contenu se calait contre lui et remontait sur la
        barre de navigation.
      */}
      <Engraving
        src={scorpion}
        ratio="1/1"
        parallax={7}
        warp="scroll"
        alt="Planche gravée — le Scorpion, Hevelius"
        data-reveal="plate"
        data-reveal-start="top 80%"
        className="engraving-marge pointer-events-none absolute opacity-[0.10] lg:opacity-[0.16]"
      />

      <div className="edge relative">
        {/*
          La position du §01 s'énonce par l'EMBRASEMENT : les lettres gagnent
          leur contraste au lieu d'arriver en fondu. C'est le geste
          fondamental du site (§07), réservé aux deux phrases qui portent le
          récit — ici et dans l'immersion.
        */}
        <h2
          data-reveal="blaze"
          className="max-w-4xl font-display text-d2 font-black lowercase tracking-tight"
        >
          tout, ou rien.
        </h2>

        {/* le filet se TRACE : « tout se joue au trait » (§05) */}
        <span
          data-reveal="rule"
          data-reveal-delay="0.25"
          aria-hidden="true"
          className="rule-ink mt-8 block h-px w-full border-t"
        />

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
        <ul data-reveal="lines" className="relative mt-28 space-y-16 md:space-y-20">
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

      {/*
        L'HORIZON — l'illustration du client.

        Elle ferme l'immersion, EN PLEINE LARGEUR et sans cadre : son ciel
        étoilé prolonge celui de la section, et sa carte annonce le fond clair
        qui revient juste après. Elle n'est donc pas une image POSÉE sur la
        page, elle en est la charnière — ce que son titre dit littéralement.

        Placée ici plutôt qu'à la sortie du ciel : là-bas elle arrivait juste
        APRÈS le balayage et redisait en fixe ce que le site venait de faire
        en mouvement. Ici elle le PRÉPARE.
      */}
      <Horizon />
    </section>
  );
}
