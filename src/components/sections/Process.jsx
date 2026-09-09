import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initReveals } from "../../lib/reveal";

gsap.registerPlugin(ScrollTrigger);

/**
 * MÉTHODE + CHIFFRES
 * ============================================================================
 *
 * POURQUOI LE RAIL A DISPARU
 * --------------------------
 * La version précédente dessinait une colonne verticale avec une barre de
 * progression qui se remplissait au défilement et des pastilles à chaque
 * étape. C'est mot pour mot l'interdit du §09 : « marqueur qui suit le
 * défilement le long d'une colonne ».
 *
 * Le déroulé reste chronologique — les numéros ont donc un sens — mais c'est
 * LE CHIFFRE qui fait la structure. Aucun connecteur, aucune pastille, aucun
 * filet entre les blocs.
 *
 * LES COMPTEURS RESTENT
 * ---------------------
 * Ils ne bouclent pas et ne pulsent pas : ils comptent une fois, à l'entrée
 * dans l'écran. Ce sont des preuves chiffrées, ce que le §01 réclame
 * explicitement (« des chiffres vérifiables, jamais d'approximation
 * flatteuse »), pas une animation d'ambiance.
 *
 * anime.js n'est plus nécessaire : GSAP compte aussi bien, et cela retire une
 * dépendance d'animation au projet.
 */
const steps = [
  {
    week: "Semaine 1",
    title: "Cadrage",
    body: "Un atelier de 2 h, un document d'une page. On valide le périmètre, le budget et la date de livraison.",
  },
  {
    week: "Semaines 2–3",
    title: "Direction artistique",
    body: "Deux pistes visuelles complètes. Vous en choisissez une, on l'affine ensemble.",
  },
  {
    week: "Semaines 4–7",
    title: "Production",
    body: "Design puis développement, avec une préversion en ligne mise à jour chaque semaine.",
  },
  {
    week: "Semaine 8",
    title: "Mise en ligne",
    body: "Recette, formation de vos équipes, transfert des accès. Le site vous appartient.",
  },
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
    if (!el) return undefined;

    const ctx = gsap.context(() => {
      initReveals(el);

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const counters = el.querySelectorAll("[data-count]");

      counters.forEach((node) => {
        const target = Number(node.dataset.count);

        if (reduced) {
          node.textContent = String(target);
          return;
        }

        const state = { value: 0 };

        gsap.to(state, {
          value: target,
          duration: 1.4,
          ease: "power2.out",
          /*
            `once: true` : un compteur qui se relance à chaque passage
            deviendrait une animation en boucle, ce que le §09 interdit.
          */
          scrollTrigger: { trigger: node, start: "top 85%", once: true },
          onUpdate: () => {
            node.textContent = String(Math.round(state.value));
          },
        });
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} data-ground="clair" className="offscreen-idle py-28 md:py-36">
      <div className="edge">
        <h2
          data-reveal="text"
          className="max-w-3xl font-display text-d2 font-black lowercase tracking-tight"
        >
          huit semaines, de bout en bout.
        </h2>

        <ol className="mt-24 space-y-16 md:space-y-20">
          {steps.map((step, i) => (
            <li
              key={step.title}
              data-reveal="fade"
              className="grid gap-4 md:grid-cols-[6rem_1fr]"
            >
              <span className="ink-40 font-mono text-[11px] tabular-nums tracking-[0.18em]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="max-w-2xl">
                <p className="ink-40 font-mono text-[11px] uppercase tracking-[0.18em]">
                  {step.week}
                </p>
                <h3 className="mt-3 text-d3 font-medium lowercase">{step.title}</h3>
                <p className="ink-60 mt-4 text-[17px] leading-relaxed">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div
          data-reveal="lines"
          className="rule-ink mt-28 grid gap-12 border-t pt-12 sm:grid-cols-3"
        >
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="font-display text-d3 font-black tabular-nums">
                <span data-count={stat.value}>0</span>
                {stat.suffix}
              </p>
              <p className="ink-40 mt-2 font-mono text-[11px] uppercase tracking-[0.18em]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
