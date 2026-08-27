import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import anime from "animejs/lib/anime.es.js";
import { initReveals } from "../../lib/reveal";
import TypedHeading from "../TypedHeading";
import Media from "../Media";
import ShardedMedia from "../SharedMedia";
import people from "../../assets/People/people.jpg"
/**
 * SECTION 08 — MÉTHODE + CHIFFRES
 * Un vrai déroulé chronologique (donc les numéros ont un sens), avec une barre
 * de progression qui se remplit au scroll et des compteurs anime.js.
 */
const steps = [
  { week: "Semaine 1", title: "Cadrage", body: "Un atelier de 2 h, un document d'une page. On valide le périmètre, le budget et la date de livraison." },
  { week: "Semaines 2–3", title: "Direction artistique", body: "Deux pistes visuelles complètes. Vous en choisissez une, on l'affine ensemble." },
  { week: "Semaines 4–7", title: "Production", body: "Design puis développement, avec une préversion en ligne mise à jour chaque semaine." },
  { week: "Semaine 8", title: "Mise en ligne", body: "Recette, formation de vos équipes, transfert des accès. Le site vous appartient." },
];

const stats = [
  { value: 40, suffix: "+", label: "marques accompagnées" },
  { value: 96, suffix: "", label: "score Lighthouse moyen" },
  { value: 8, suffix: " sem.", label: "délai moyen de livraison" },
];

export default function Process() {
  const root = useRef(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      initReveals(el);

      // barre de progression du déroulé
      gsap.fromTo(
        el.querySelector("[data-progress]"),
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          transformOrigin: "top",
          scrollTrigger: {
            trigger: el.querySelector("[data-steps]"),
            start: "top 70%",
            end: "bottom 75%",
            scrub: true,
          },
        }
      );

      // compteurs — déclenchés une seule fois
      ScrollTrigger.create({
        trigger: el.querySelector("[data-stats]"),
        start: "top 82%",
        once: true,
        onEnter: () => {
          el.querySelectorAll("[data-count]").forEach((node) => {
            const target = { v: 0 };
            const end = Number(node.dataset.count);
            anime({
              targets: target,
              v: end,
              round: 1,
              duration: 1600,
              easing: "easeOutExpo",
              update: () => {
                node.textContent = target.v;
              },
            });
          });
        },
      });
    }, el);

    return () => ctx.revert();
  }, []);

  /*
   * `overflow-hidden` sur la section : les éclats de <ShardedMedia> se
   * déplacent hors de leur cadre, et la section les laissait élargir la mise
   * en page sur mobile.
   */
  return (
    <section ref={root} className="relative overflow-hidden bg-ivoire py-24 md:py-32">
      <div className="edge">
        <div className="grid gap-14 lg:grid-cols-[1fr_0.85fr] lg:gap-20">
          <div>
            <span data-reveal="fade" className="eyebrow mb-6 block">
              Méthode
            </span>
            <TypedHeading
              as="h2"
              className="text-d2 font-medium"
              text="Huit semaines, sans surprise"
              html={'Huit semaines, <span class="font-display italic text-bronze">sans surprise</span>'}
            />

            <div data-steps className="relative mt-14 pl-8">
              {/* rail + progression */}
              <span className="absolute left-0 top-1 h-full w-px bg-charbon/10" aria-hidden="true" />
              <span
                data-progress
                className="absolute left-0 top-1 h-full w-px bg-bronze"
                aria-hidden="true"
              />

              <ol className="flex flex-col gap-11">
                {steps.map((s) => (
                  <li key={s.title} data-step className="relative">
                    <span
                      className="absolute -left-8 top-2 h-2 w-2 -translate-x-1/2 rounded-full bg-bronze"
                      aria-hidden="true"
                    />
                    <span
                      data-reveal="fade"
                      className="block font-mono text-[11px] uppercase tracking-[0.18em] text-pierre"
                    >
                      {s.week}
                    </span>
                    <TypedHeading
                      as="h3"
                      className="mt-2 text-2xl font-bold tracking-tight"
                      text={s.title}
                      speed={34}
                    />
                    <p
                      data-reveal="fade"
                      data-reveal-delay="0.1"
                      className="mt-2 max-w-md text-[15px] leading-relaxed text-pierre"
                    >
                      {s.body}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <ShardedMedia
              src={people}
              ratio="4/5"
              parallax={10}
              label="Photo d'équipe ou de l'atelier — portrait 4/5"
            />

            <div data-stats className="grid grid-cols-3 gap-4 border-t border-charbon/10 pt-8">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="text-3xl font-black tracking-tight md:text-4xl">
                    <span data-count={s.value}>0</span>
                    {s.suffix}
                  </p>
                  <p
                    data-reveal="fade"
                    className="mt-2 text-[12px] leading-snug text-pierre"
                  >
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}