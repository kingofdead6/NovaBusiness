import { useEffect, useRef } from "react";
import gsap from "gsap";
import Media from "../Media";
import { initReveals } from "../../lib/reveal";
import TypedHeading from "../TypedHeading";
import { services } from "../../data/site";
import Engraving from "../Engraving";
import scorpion from "../../assets/plates/scorpion-trait.png";

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
      data-ground="clair"
      className="relative pb-24 pt-28 md:pb-32 md:pt-36"
    >
      {/*
        HEVELIUS, LE SCORPION — en marge gauche du sommaire.

        ATTENTION : la section ne doit JAMAIS recevoir `overflow-hidden`, il
        casserait le `position: sticky` de l'empilement des cartes. La planche
        est donc bornée par son propre masque, pas par un rognage du parent.
      */}
      <Engraving
        src={scorpion}
        ratio="1/1"
        parallax={8}
        warp="scroll"
        alt=""
        data-reveal="plate"
        data-reveal-start="top 80%"
        className="engraving-marge-gauche pointer-events-none absolute opacity-[0.14] lg:opacity-[0.12]"
      />

      <div className="edge relative z-10">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-xl">
            <span
              data-reveal="fade"
              className="ink-40 mb-6 block font-mono text-[11px] uppercase tracking-[0.18em]"
            >
              Services
            </span>
            <TypedHeading
              as="h2"
              className="text-d2 font-medium"
              text="Quatre métiers, une seule équipe"
              html={'Quatre métiers, <span class="font-display italic ink">une seule équipe</span>'}
            />
          </div>
          <p
            data-reveal="fade"
            data-reveal-delay="0.15"
            className="max-w-xs text-[15px] leading-relaxed ink-40"
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
            className="sticky top-24 mb-4 origin-top overflow-hidden rounded-[3px] rule-ink border bg-[var(--ground-bg)]"
          >
            <div className="grid gap-0 md:grid-cols-2">
              <div className="flex flex-col justify-between p-7 md:p-10">
                <div className="mb-8 flex items-center gap-4">
                  <span className="font-mono text-[11px] ink">{s.index}</span>
                  <span className="rule-ink h-px flex-1 border-t" />
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
                    className="mt-4 max-w-sm text-[15px] leading-relaxed ink-40"
                  >
                    {s.lede}
                  </p>

                  {/*
                    Les prestations ne sont plus des capsules (§09 :
                    « étiquette qui n'est pas cliquable »). Une simple liste
                    séparée par des puces — c'est d'ailleurs ainsi que le §08
                    veut voir énoncé ce qui a été livré.
                  */}
                  <ul className="mt-7 flex flex-wrap gap-x-3 gap-y-1">
                    {s.items.map((item) => (
                      <li key={item} className="ink-60 font-mono text-[11px]">
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
