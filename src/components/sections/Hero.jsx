import { useEffect, useRef } from "react";
import gsap from "gsap";
import { splitWords, splitCharsRich } from "../../lib/text";
import { clients } from "../../data/site";

/**
 * ÉTAT 1 — LE HERO (§07)
 *
 * Fond clair, horizontal, très sobre : une phrase et beaucoup de vide.
 * C'est la consigne littérale du brief, et elle est tenue par la
 * SOUSTRACTION — pas de colonnes d'images, pas d'indice de défilement
 * pulsé, pas de mention en gélule au-dessus du titre.
 *
 * Deux choses seulement se passent ici :
 *   1. les mots du titre montent depuis un masque à l'arrivée ;
 *   2. les lettres réagissent au curseur, et celles qu'il traverse
 *      changent de couleur (projecteur `.hero-spot`).
 *
 * La preuve client (§01) est posée en bas, à voix basse : six noms en
 * voix secondaire, sans logo, sans défilement, sans bandeau. Le §09
 * interdit la rangée de logos ; huyml.co montre l'alternative.
 */
export default function Hero({ ready = true }) {
  const root = useRef(null);

  useEffect(() => {
    const el = root.current;
    if (!ready || !el) return;

    let cleanup;

    const ctx = gsap.context(() => {
      const words = splitWords(el.querySelector("[data-split]"));
      const fades = el.querySelectorAll("[data-fade]");
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduced) {
        gsap.set([...words, ...fades], { y: 0, yPercent: 0, opacity: 1 });
        el.setAttribute("data-split-done", "true");
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

      tl.from(words, { yPercent: 118, duration: 1.25, stagger: 0.045 })
        .from(fades, { y: 22, opacity: 0, duration: 1, stagger: 0.09 }, "-=0.85");

      /*
        Les mots ont fini de monter : on relâche le rognage des lignes pour
        que les lettres puissent dépasser vers le haut sous l'effet du
        magnétisme (sans quoi elles seraient tranchées au ras de la ligne).
      */
      tl.eventCallback("onComplete", () => {
        el.setAttribute("data-split-done", "true");
      });

      /* ------------------------------------------------------------------ */
      /* PROJECTEUR + MAGNÉTISME                                             */
      /* ------------------------------------------------------------------ */

      const spot = el.querySelector("[data-hero-spot]");
      const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

      const heroTitle = el.querySelector("[data-hero-title]");
      const heroChars = heroTitle ? splitCharsRich(heroTitle) : [];
      const twinChars = spot ? splitCharsRich(spot.querySelector("[data-hero-twin]")) : [];

      /*
        Les deux découpes doivent produire le même nombre de lettres, sans
        quoi l'appariement par index serait faux. Si le balisage venait à
        diverger, on renonce au magnétisme plutôt que d'afficher un titre
        disloqué.
      */
      const paired = heroChars.length === twinChars.length ? twinChars : [];

      const listeners = [];

      if (spot && fine) {
        /*
          `unit: "px"` est obligatoire : une propriété personnalisée n'a pas
          de type, GSAP y écrirait un nombre nu que `radial-gradient` rejette
          — le masque disparaîtrait entièrement.
        */
        gsap.set(spot, { "--spot-x": "0px", "--spot-y": "0px" });

        const xTo = gsap.quickTo(spot, "--spot-x", { duration: 0.28, ease: "power3", unit: "px" });
        const yTo = gsap.quickTo(spot, "--spot-y", { duration: 0.28, ease: "power3", unit: "px" });

        const onSpotMove = (event) => {
          const rect = spot.getBoundingClientRect();
          xTo(event.clientX - rect.left);
          yTo(event.clientY - rect.top);
          gsap.to(spot, { "--spot-r": "90px", duration: 0.4, ease: "power3.out" });
        };

        const onSpotLeave = () => {
          gsap.to(spot, { "--spot-r": "0px", duration: 0.45, ease: "power3.out" });
        };

        el.addEventListener("pointermove", onSpotMove);
        el.addEventListener("pointerleave", onSpotLeave);
        listeners.push(["pointermove", onSpotMove], ["pointerleave", onSpotLeave]);
      }

      if (heroChars.length && fine) {
        /*
          Les deux exemplaires du titre reçoivent EXACTEMENT les mêmes
          transformations, dans la même boucle : si une seule copie bougeait,
          les glyphes se désaligneraient et le calque révélé par le masque ne
          coïnciderait plus avec le titre du dessous.
        */
        const setters = heroChars.map((char, i) => ({
          char,
          y: gsap.quickTo(char, "y", { duration: 0.5, ease: "power3.out" }),
          scale: gsap.quickTo(char, "scale", { duration: 0.5, ease: "power3.out" }),
          twinY: paired[i] ? gsap.quickTo(paired[i], "y", { duration: 0.5, ease: "power3.out" }) : null,
          twinScale: paired[i] ? gsap.quickTo(paired[i], "scale", { duration: 0.5, ease: "power3.out" }) : null,
        }));

        // rayon d'influence : au-delà, la lettre est au repos
        const RADIUS = 160;

        const onCharMove = (event) => {
          setters.forEach(({ char, y, scale, twinY, twinScale }) => {
            const rect = char.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const distance = Math.hypot(event.clientX - cx, event.clientY - cy);
            const force = Math.max(0, 1 - distance / RADIUS);
            const lift = -26 * force;
            const grow = 1 + 0.1 * force;
            y(lift);
            scale(grow);
            twinY?.(lift);
            twinScale?.(grow);
          });
        };

        const onCharLeave = () => {
          setters.forEach(({ y, scale, twinY, twinScale }) => {
            y(0);
            scale(1);
            twinY?.(0);
            twinScale?.(1);
          });
        };

        el.addEventListener("pointermove", onCharMove);
        el.addEventListener("pointerleave", onCharLeave);
        listeners.push(["pointermove", onCharMove], ["pointerleave", onCharLeave]);
      }

      cleanup = () => {
        listeners.forEach(([type, fn]) => el.removeEventListener(type, fn));
      };
    }, el);

    return () => {
      cleanup?.();
      ctx.revert();
    };
  }, [ready]);

  return (
    <section
      id="top"
      ref={root}
      data-ground="clair"
      className="relative flex min-h-[100svh] flex-col justify-between pb-12 pt-40 md:pb-16"
    >
      <div className="edge relative">
        {/*
          Le titre est posé DEUX fois, superposé au pixel près : l'exemplaire
          du dessous est le vrai (animé, lu par les lecteurs d'écran), celui
          du dessus reprend les mêmes mots dans l'autre couleur et n'est
          révélé qu'à travers un disque suivant le curseur.
        */}
        <div className="relative">
          <h1 data-hero-title className="max-w-[16ch] font-display text-d1 font-medium">
            <span data-split className="block">
              On rend visible ce qui est déjà là.
            </span>
          </h1>

          <div
            data-hero-spot
            aria-hidden="true"
            className="hero-spot pointer-events-none absolute inset-0 hidden select-none md:block"
          >
            {/*
              Le calque ne porte AUCUN fond : seules les lettres changent de
              couleur. Un fond dessinerait un disque sur le titre — ce n'est
              pas une inversion du bloc, juste une recoloration des glyphes
              traversés.
            */}
            <p data-hero-twin className="max-w-[16ch] font-display text-d1 font-medium text-ciel">
              <span className="block">On rend visible ce qui est déjà là.</span>
            </p>
          </div>
        </div>

        <p
          data-fade
          className="ink-60 mt-10 max-w-lg text-[17px] leading-relaxed"
        >
          Image de marque, site, application, référencement, contenu. La chaîne
          complète, ou rien.
        </p>
      </div>

      {/*
        PREUVE À VOIX BASSE (§01, §09).

        Six noms, en voix secondaire, sans logo et sans défilement. Le brief
        interdit la rangée de logos alignés ; la preuve se pose en marge, et
        c'est l'écart d'échelle avec le titre qui la rend crédible — pas un
        traitement graphique.
      */}
      <div data-fade className="edge relative">
        <p className="ink-40 font-mono text-[11px] uppercase tracking-[0.18em]">
          {clients.join("  ·  ")}
        </p>
      </div>
    </section>
  );
}
