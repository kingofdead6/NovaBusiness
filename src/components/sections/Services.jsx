import { useEffect, useRef } from "react";
import gsap from "gsap";
import Media from "../Media";
import LiquidVeil from "../LiquidVeil";
import { initReveals } from "../../lib/reveal";
import TypedHeading from "../TypedHeading";
import { services } from "../../data/site";

/**
 * SECTION 05 — SERVICES
 * Cartes empilées : chaque carte se colle en haut de l'écran et la suivante
 * vient la recouvrir, pendant que celle du dessous rétrécit légèrement.
 * (position: sticky pour l'empilement + GSAP pour l'échelle.)
 */
export default function Services() {
  const root = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      initReveals(root.current);

      const cards = gsap.utils.toArray("[data-service]");

      cards.forEach((card, i) => {
        if (i === cards.length - 1) return;
        gsap.to(card, {
          scale: 0.94,
          opacity: 0.5,
          ease: "none",
          scrollTrigger: {
            trigger: cards[i + 1],
            start: "top bottom",
            end: "top top",
            scrub: true,
          },
        });
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="services"
      className="relative bg-ivoire pb-24 pt-[42vh] md:pb-32 md:pt-[48vh]"
    >
      {/*
        COULÉE DE RACCORD — sortie de la section Values.

        Values (charbon) se termine, et la matière déborde par le haut de
        Services : elle arrive PLEINE, laisse pendre ses longues coulures, puis
        se retire vers le haut pendant qu'on descend — les cartes Services
        apparaissent dessous, exactement comme dans l'enregistrement.

        `reverse` : progression 1 → 0, la matière part de la couverture totale.
        Le `pt-[42vh]` réserve la hauteur qu'elle occupe, donc le titre n'est
        jamais masqué.

        FENÊTRE : elle démarre à `top 92%` et non `top bottom`. Avec
        `top bottom` la coulée s'animait dès que Services touchait le BAS du
        viewport — soit pendant tout le dernier écran de Values, dont elle
        recouvrait les cartes. Elle ne commence donc plus qu'une fois la
        frontière atteinte, et Values garde ses animations pour elle.

        NB : pas d'`overflow-hidden` sur la <section> — il créerait un
        conteneur de défilement qui casserait le `position: sticky` des
        cartes. Le voile se découpe lui-même en interne.
      */}
      <LiquidVeil flip reverse start="top 92%" end="top 10%" />

      <div className="edge relative z-10">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-xl">
            <span data-reveal="fade" className="eyebrow mb-6 block">
              Services
            </span>
            <TypedHeading
              as="h2"
              className="text-d2 font-medium"
              text="Quatre métiers, une seule équipe"
              html={'Quatre métiers, <span class="font-display italic text-bronze">une seule équipe</span>'}
            />
          </div>
          <p
            data-reveal="fade"
            data-reveal-delay="0.15"
            className="max-w-xs text-[15px] leading-relaxed text-pierre"
          >
            Vous pouvez tout nous confier ou piocher. On travaille aussi en
            renfort d'une équipe interne.
          </p>
        </div>
      </div>

      <div className="edge relative z-10">
        {services.map((s) => (
          <article
            key={s.index}
            data-service
            className="sticky top-24 mb-4 origin-top overflow-hidden rounded-[3px] border border-charbon/10 bg-blanc"
          >
            <div className="grid gap-0 md:grid-cols-2">
              <div className="flex flex-col justify-between p-7 md:p-10">
                <div className="mb-8 flex items-center gap-4">
                  <span className="font-mono text-[11px] text-bronze">{s.index}</span>
                  <span className="hairline flex-1" />
                </div>

                <div>
                  <TypedHeading
                    as="h3"
                    className="text-d3 font-bold tracking-tight"
                    text={s.title}
                    speed={34}
                  />
                  <p
                    data-reveal="fade"
                    data-reveal-delay="0.1"
                    data-reveal-start="top 70%"
                    className="mt-4 max-w-sm text-[15px] leading-relaxed text-pierre"
                  >
                    {s.lede}
                  </p>

                  <ul className="mt-7 flex flex-wrap gap-2">
                    {s.items.map((item) => (
                      <li
                        key={item}
                        className="rounded-full border border-charbon/12 px-3.5 py-1.5 font-mono text-[11px] text-charbon/70"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-3 md:p-4">
                <Media src={s.img} ratio={s.ratio} label={s.mediaLabel} className="w-full" />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
