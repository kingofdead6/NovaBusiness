import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import horizon from "../assets/plates/horizon.jpg";

gsap.registerPlugin(ScrollTrigger);

/**
 * L'HORIZON — l'illustration du client
 * ============================================================================
 *
 * « Les deux fonds au repos, l'horizon comme charnière. »
 *
 * POURQUOI ICI, ET EN PLEINE LARGEUR
 * ----------------------------------
 * Cette image porte exactement les deux fonds du site : un ciel étoilé
 * sombre au-dessus, une carte crème au-dessous, séparés par une ligne.
 *
 * Elle ferme donc l'immersion, sans cadre et sans marge : son ciel PROLONGE
 * celui de la section, et sa carte ANNONCE le fond clair qui revient juste
 * après. Elle n'est pas une image posée sur la page — elle en est la
 * charnière, ce que son titre dit littéralement.
 *
 * Un premier essai la plaçait à la sortie du ciel, juste après le balayage :
 * elle y redisait en fixe ce que le site venait de faire en mouvement, et
 * concurrençait sa propre mécanique. Ici elle la PRÉPARE.
 *
 * NOTE DE CONFORMITÉ : elle porte des figures humaines contemporaines, que le
 * §09 interdit — l'exception ne couvrant que les figures gravées de
 * constellation. Elle est utilisée sur demande explicite du client, qui
 * tranche donc ce point.
 */
export default function Horizon() {
  const root = useRef(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return undefined;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    const ctx = gsap.context(() => {
      /*
        L'image monte un peu moins vite que la page : la ligne d'horizon
        glisse donc lentement vers le haut à mesure qu'on s'en approche, et
        la charnière se lit comme un mouvement plutôt que comme un collage.
      */
      gsap.fromTo(
        el.querySelector("img"),
        { yPercent: -6, scale: 1.06 },
        {
          yPercent: 6,
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8,
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <figure ref={root} className="horizon relative mt-24 w-full overflow-hidden md:mt-32">
      <img
        src={horizon}
        alt="L'horizon comme charnière : un ciel étoilé au-dessus, une carte au-dessous"
        loading="lazy"
        decoding="async"
        className="w-full"
      />
    </figure>
  );
}
