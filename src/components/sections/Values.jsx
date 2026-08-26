import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { values } from "../../data/site";
import { splitWords } from "../../lib/text";
import value1 from "../../assets/Values/value1.jpg";
import value2 from "../../assets/Values/value2.jpg";
import valuebox1 from "../../assets/Values/valuebox1.png";
import valuebox2 from "../../assets/Values/valuebox2.png";
import valuebox3 from "../../assets/Values/valuebox3.png";

gsap.registerPlugin(ScrollTrigger);

const valueImages = [valuebox1, valuebox2, valuebox3];

/**
 * SECTION 04 — CE QU'ON APPORTE
 *
 * Seconde moitié du diptyque ouvert par Takeover. Les deux composants restent
 * indépendants, mais la lecture ne se coupe pas :
 *
 *   - Takeover entre sur `bg-ivoire` : c'est LA COULÉE qui fait basculer le
 *     fond du clair au sombre au fil du scroll. Sa dernière couche est
 *     #1C1C1C, soit exactement le `bg-charbon` de cette section : une fois la
 *     couverture faite, le raccord ne présente ni bande ni saut de teinte.
 *   - `-mt-px` mange l'éventuel liseré d'un pixel dû à l'arrondi sous-pixel
 *     quand la page est zoomée ou sur un écran à densité fractionnaire.
 *   - Takeover ne pose pas de padding en bas ; Values ouvre sur une zone de
 *     repos (`pt-[18vh]`) : la matière fraîchement posée a le temps de se
 *     stabiliser avant que le contenu ne reprenne.
 *   - L'intertitre reprend au bord droit, là où la description de Takeover
 *     s'est arrêtée, et le filet doré du haut prolonge celui du bas de
 *     Takeover — même graisse, même couleur, même animation de scaleX.
 *   - Les trois cartes reprennent la numérotation en mono commencée par
 *     l'eyebrow de Takeover.
 */
export default function Values() {
  const root = useRef(null);

  useEffect(() => {
    if (!root.current) return undefined;

    const ctx = gsap.context(() => {
      const q = (sel) => root.current.querySelector(sel);
      const qa = (sel) => root.current.querySelectorAll(sel);
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const title = q("[data-split]");
      const rule = q("[data-rule]");
      const eyebrow = q("[data-eyebrow]");
      const lede = q("[data-lede]");
      const cards = qa("[data-card]");
      const seam = q("[data-seam]");

      /* ------------------------------------------------------------------ */
      /* MOUVEMENT RÉDUIT                                                    */
      /* ------------------------------------------------------------------ */

      if (reduced) {
        if (rule) gsap.set(rule, { scaleX: 1 });
        return;
      }

      /* ------------------------------------------------------------------ */
      /* RACCORD — la coulée finit de se déposer                             */
      /* ------------------------------------------------------------------ */
      /*
       * Une nappe très douce, de la même famille tonale que la dernière couche
       * du voile, se résorbe sur le premier tiers de la section. Visuellement,
       * la matière arrivée de Takeover « sèche » ici plutôt que de disparaître
       * net au changement de composant.
       */

      if (seam) {
        gsap.fromTo(
          seam,
          { opacity: 1, yPercent: 0 },
          {
            opacity: 0,
            yPercent: -18,
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top bottom",
              end: "top 20%",
              scrub: 0.6,
            },
          }
        );
      }

      /* ------------------------------------------------------------------ */
      /* EN-TÊTE                                                             */
      /* ------------------------------------------------------------------ */

      const head = gsap.timeline({
        scrollTrigger: { trigger: q("[data-head]"), start: "top 78%" },
      });

      if (rule) {
        head.fromTo(
          rule,
          { scaleX: 0, transformOrigin: "0% 50%" },
          { scaleX: 1, duration: 1.1, ease: "expo.out" },
          0
        );
      }

      if (eyebrow) {
        head.fromTo(
          eyebrow,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.9, ease: "expo.out" },
          0.1
        );
      }

      if (title) {
        head.from(
          splitWords(title),
          { yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.05 },
          0.18
        );
      }

      if (lede) {
        head.fromTo(
          lede,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.9, ease: "expo.out" },
          0.42
        );
      }

      /* ------------------------------------------------------------------ */
      /* CARTES — révélation en décalé                                       */
      /* ------------------------------------------------------------------ */
      /*
       * Chaque carte a son propre déclencheur plutôt qu'un stagger global :
       * en lecture rapide, un stagger commun laisse la dernière carte arriver
       * alors qu'elle est déjà au milieu de l'écran. Ici chacune se révèle
       * quand elle entre réellement dans le champ.
       */

      cards.forEach((card, i) => {
        const media = card.querySelector("[data-card-media]");
        const index = card.querySelector("[data-card-index]");

        gsap
          .timeline({ scrollTrigger: { trigger: card, start: "top 88%" } })
          .fromTo(
            card,
            { y: 90, opacity: 0, clipPath: "inset(12% 0% 0% 0%)" },
            {
              y: 0,
              opacity: 1,
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 1.2,
              ease: "expo.out",
            },
            0
          )
          .fromTo(
            media,
            { scale: 1.25 },
            { scale: 1, duration: 1.4, ease: "expo.out" },
            0
          )
          .fromTo(
            index,
            { opacity: 0, x: -10 },
            { opacity: 1, x: 0, duration: 0.7, ease: "power2.out" },
            0.25
          );

        /*
         * Parallaxe : le décalage vertical des cartes n'est plus une marge
         * statique mais un vrai mouvement au scroll. Les colonnes glissent à
         * des vitesses différentes, ce qui aère la grille sans la casser —
         * et se neutralise sous `md`, où les cartes défilent horizontalement.
         *
         * La fenêtre s'arrête à `bottom 85%` : le mouvement est TERMINÉ avant
         * que la section ne cède la place à la suivante. Avec `bottom top` les
         * cartes dérivaient encore alors que Services entrait déjà dans le
         * champ, ce qui faisait mordre l'animation sur la section suivante.
         */
        gsap.fromTo(
          card,
          { yPercent: 0 },
          {
            yPercent: -6 * (i % 2 === 0 ? 1 : 2),
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top bottom",
              end: "bottom 85%",
              scrub: 1,
            },
          }
        );

        /*
         * ENCRE — la typo se réchauffe pendant qu'on traverse la carte.
         *
         * GSAP n'interpole qu'un NOMBRE (`ink.t`, 0 → 1) ; c'est `color-mix`,
         * dans la feuille de style, qui en dérive les teintes. Deux raisons :
         *
         *  1. GSAP ne sait pas interpoler une couleur portée par une custom
         *     property — c'est ce qui avait cassé la bascule du pied de page.
         *  2. Une valeur écrite en style inline l'emporterait sur les classes
         *     `:hover`. En n'écrivant qu'un nombre, `group-hover:text-bronze`
         *     garde la priorité et le survol continue de fonctionner.
         *
         * Fenêtre : de l'entrée de la carte jusqu'à ce qu'elle atteigne le
         * tiers haut du viewport — la transition se joue donc pendant qu'on la
         * lit, et `scrub` la rend réversible à la remontée.
         */
        const ink = { t: 0 };

        gsap.to(ink, {
          t: 1,
          ease: "none",
          onUpdate: () => card.style.setProperty("--card-ink", String(ink.t)),
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            end: "top 30%",
            scrub: 1.2,
          },
        });
      });

      /* ------------------------------------------------------------------ */
      /* VISUELS DE FOND — dérive lente                                      */
      /* ------------------------------------------------------------------ */

      qa("[data-float]").forEach((el) => {
        const dir = Number(el.dataset.float) || 1;

        gsap.fromTo(
          el,
          { yPercent: 14 * dir, rotate: -2 * dir },
          {
            yPercent: -14 * dir,
            rotate: 2 * dir,
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top bottom",
              end: "bottom 85%",
              scrub: 1.2,
            },
          }
        );
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      data-flock
      className="relative -mt-px overflow-hidden bg-charbon pb-28 pt-[18vh] md:pb-40 md:pt-[22vh]"
    >
      {/* ================================================================ */}
      {/* RACCORD — la matière déposée par Takeover finit de se stabiliser  */}
      {/* ================================================================ */}

      {/*
        VISUELS FLOTTANTS — deux portraits en arrière-plan, à gauche et à
        droite. Réservés au grand écran (`lg:block`) : en dessous, la place
        manque et ils viendraient chevaucher les cartes.

        `pointer-events-none` + `aria-hidden` : purement décoratifs, ils ne
        doivent ni capter la souris ni être annoncés par un lecteur d'écran.
      */}
      <div
        data-float="1"
        aria-hidden="true"
        className="pointer-events-none absolute -left-10 top-16 hidden w-[220px] opacity-30 lg:block"
      >
        <img
          src={value1}
          alt=""
          loading="lazy"
          className="aspect-[3/4] w-full rounded-[3px] object-cover"
        />
      </div>

      <div
        data-float="-1"
        aria-hidden="true"
        className="pointer-events-none absolute -right-6 bottom-10 hidden w-[260px] opacity-30 lg:block"
      >
        <img
          src={value2}
          alt=""
          loading="lazy"
          className="aspect-[4/5] w-full rounded-[3px] object-cover"
        />
      </div>

      <div className="edge relative z-10">
        {/* ============================================================== */}
        {/* EN-TÊTE — aligné à droite, dans la continuité de Takeover       */}
        {/* ============================================================== */}

        <div data-head className="mb-16 flex justify-center md:mb-24 md:justify-end">
          <div className="w-full max-w-[640px]">
            <span
              data-rule
              aria-hidden="true"
              className="mb-6 block h-px w-full bg-dore/50"
            />

            <span data-eyebrow className="eyebrow mb-6 block text-dore">
              Notre façon de travailler
            </span>

            <h2 data-split className="text-d2 font-medium text-ivoire">
              Trois choses qu&apos;on refuse de négocier
            </h2>

            <p
              data-lede
              className="mt-6 max-w-[46ch] text-[15px] leading-relaxed text-ivoire/50 md:text-base"
            >
              Ce sont les trois réflexes qui décident de tout le reste : ce que
              nous acceptons, ce que nous refusons, et la façon dont un projet
              se termine.
            </p>
          </div>
        </div>

        {/* ============================================================== */}
        {/* LES TROIS CARTES                                                */}
        {/* ============================================================== */}
        {/*
          `items-start` + `md:mt-*` par colonne : le décalage vertical est une
          règle de mise en page, non plus un `style` calculé au rendu. Il se
          neutralise donc proprement en dessous de `md`, où les cartes passent
          en défilement horizontal aimanté.
        */}

        <div
          className="
            flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-4
            md:grid md:grid-cols-3 md:items-start md:gap-5 md:overflow-visible md:pb-0
            lg:gap-6
          "
        >
          {values.map((v, i) => (
            <article
              key={v.title}
              data-card
              data-cursor="hover"
              tabIndex="0"
              className={`
                card-ink
                group relative isolate flex h-[420px] min-w-[82vw] shrink-0 snap-start
                flex-col justify-between overflow-hidden
                border border-ivoire/[0.14] p-7
                transition-colors duration-500 ease-nova
                will-change-transform
                hover:border-dore/60 focus-visible:border-dore/60
                md:h-auto md:min-h-[440px] md:min-w-0 md:shrink
                lg:min-h-[480px] lg:p-8
                ${i === 1 ? "md:mt-10" : ""}
                ${i === 2 ? "md:mt-20" : ""}
              `}
            >
              {/* ---------------- VISUEL DE FOND ---------------- */}

              <div
                data-card-media
                aria-hidden="true"
                className="absolute inset-0 -z-20 will-change-transform"
              >
                <img
                  src={valueImages[i]}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[1200ms] ease-nova group-hover:scale-105 group-focus-visible:scale-105"
                />
              </div>

              {/* voile charbon : lisibilité au repos, il s'efface au survol */}
              <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 bg-gradient-to-t from-charbon via-charbon/60 to-charbon/20 transition-opacity duration-700 group-hover:opacity-0 group-focus-visible:opacity-0"
              />

              {/* damier ivoire révélé au survol */}
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

              {/* ---------------- INDEX ---------------- */}

              <span
                data-card-index
                className="card-ink-index font-mono text-[11px] tracking-[0.18em] transition-colors duration-500 group-hover:text-bronze group-focus-visible:text-bronze"
              >
                {String(i + 1).padStart(2, "0")} / 03
              </span>

              {/* ---------------- TITRE ↔ CORPS ---------------- */}
              {/*
                Le titre s'efface vers le haut pendant que le corps monte à sa
                place : les deux occupent la même boîte, donc la carte ne
                change jamais de hauteur au survol.
              */}

              <div className="relative">
                <h3 className="card-ink-title text-d3 font-bold lowercase leading-none transition-all duration-500 ease-nova group-hover:-translate-y-2 group-hover:opacity-0 group-focus-visible:-translate-y-2 group-focus-visible:opacity-0">
                  {v.title}
                </h3>

                <p className="absolute inset-x-0 bottom-0 translate-y-4 text-[17px] leading-[1.55] text-charbon opacity-0 transition-all duration-700 ease-nova group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 md:text-[18px]">
                  {v.body}
                </p>
              </div>

              {/* ---------------- FILET ---------------- */}

              <span
                aria-hidden="true"
                className="mt-8 block h-px w-0 bg-dore transition-all duration-700 ease-nova group-hover:w-full group-focus-visible:w-full"
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
