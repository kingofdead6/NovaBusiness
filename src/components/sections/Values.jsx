import { useEffect, useRef } from "react";
import gsap from "gsap";
import Media from "../Media";
import DriftArt from "../DriftArt";
import { values } from "../../data/site";
import { splitWords } from "../../lib/text";
import value1 from "../../assets/Values/value1.jpg";
import value2 from "../../assets/Values/value2.jpg";
import valuebox1 from "../../assets/Values/valuebox1.png";
import valuebox2 from "../../assets/Values/valuebox2.png";
import valuebox3 from "../../assets/Values/valuebox3.png";
const valueImages = [valuebox1, valuebox2, valuebox3];
/**
 * SECTION 04 — CE QU'ON APPORTE
 * Trois cartes qui montent en décalé sur fond charbon, avec deux visuels en
 * parallaxe qui « flottent » derrière (l'équivalent des poissons/illustrations
 * de la référence).
 */
export default function Values() {
  const root = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const title = root.current.querySelector("[data-split]");
      const words = splitWords(title);

      gsap.from(words, {
        yPercent: 110,
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.05,
        scrollTrigger: { trigger: title, start: "top 82%" },
      });

      gsap.from(root.current.querySelectorAll("[data-card]"), {
        y: 70,
        opacity: 0,
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.12,
        scrollTrigger: { trigger: root.current, start: "top 62%" },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} data-flock className="relative overflow-hidden bg-charbon py-24 md:py-36">
      {/* visuels flottants en arrière-plan */}

      <div className="pointer-events-none absolute -left-10 top-16 hidden w-[220px] opacity-30 lg:block">
        <Media src={value1} ratio="3/4" parallax={22} tone="dark" label="Ambiance atelier — portrait" />
      </div>
      <div className="pointer-events-none absolute -right-6 bottom-10 hidden w-[260px] opacity-30 lg:block">
        <Media src={value2} ratio="4/5" parallax={-18} tone="dark" label="Détail Paris — portrait" />
      </div>

     

      <div className="edge relative z-10">
        <div className="mb-14 max-w-2xl">
          <span className="eyebrow mb-6 block text-dore">Notre façon de travailler</span>
          <h2 data-split className="text-d2 font-medium text-ivoire">
            Trois choses qu'on refuse de négocier
          </h2>
        </div>

        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-4 md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
          {values.map((v, i) => (
            <article
              key={v.title}
              data-card
              data-cursor="hover"
              tabIndex="0"
              className="group relative isolate flex h-[380px] min-w-[82vw] shrink-0 snap-start flex-col justify-between overflow-hidden border border-ivoire/12 p-7 transition-colors duration-500 ease-nova hover:border-dore/60 focus-visible:border-dore/60 md:h-auto md:min-w-0 md:shrink md:min-h-[380px]"
              style={{ marginTop: `${i * 26}px` }}
            >
              <img
                src={valueImages[i]}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 -z-20 h-full w-full object-cover transition-transform duration-1000 ease-nova group-hover:scale-105 group-focus-visible:scale-105"
              />
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-charbon/95 via-charbon/25 to-charbon/10 transition-opacity duration-700 group-hover:opacity-0 group-focus-visible:opacity-0" />
              <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-700 group-hover:opacity-100 group-focus-visible:opacity-100"
                style={{
                  backgroundColor: "#f5f0e8",
                  backgroundImage:
                    "linear-gradient(45deg, #d9d9d9 25%, transparent 25%), linear-gradient(-45deg, #d9d9d9 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #d9d9d9 75%), linear-gradient(-45deg, transparent 75%, #d9d9d9 75%)",
                  backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0",
                  backgroundSize: "16px 16px",
                }}
              />

              <span className="font-mono text-[11px] text-dore transition-colors duration-500 group-hover:text-bronze group-focus-visible:text-bronze">
                {String(i + 1).padStart(2, "0")}
              </span>

              <div className="relative">
                <h3 className="text-d3 font-bold lowercase leading-none text-ivoire transition-all duration-500 group-hover:-translate-y-2 group-hover:text-charbon group-hover:opacity-0 group-focus-visible:-translate-y-2 group-focus-visible:text-charbon group-focus-visible:opacity-0">
                  {v.title}
                </h3>
                <p className="absolute inset-x-0 bottom-0 translate-y-4 text-[17px] leading-[1.55] text-charbon opacity-0 transition-all duration-700 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 md:text-[18px]">
                  {v.body}
                </p>
              </div>

              <span className="mt-8 block h-px w-0 bg-dore transition-all duration-700 ease-nova group-hover:w-full group-focus-visible:w-full" />
            </article>
          ))}
        </div>
      </div>

    </section>
  );
}
