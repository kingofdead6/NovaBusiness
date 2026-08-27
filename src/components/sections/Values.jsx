import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { values } from "../../data/site";
import { splitWords } from "../../lib/text";
import CardBird from "../CardBird";
import CardBird2 from "../CardBird2"
import StarField from "../StarField";
import value2 from "../../assets/Values/value2.jpg";
import valuebox1 from "../../assets/Values/valuebox1.png";
import valuebox2 from "../../assets/Values/valuebox2.png";
import valuebox3 from "../../assets/Values/valuebox3.png";

gsap.registerPlugin(ScrollTrigger);

const valueImages = [valuebox1, valuebox2, valuebox3];


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
          /*
            La vignette n'est plus un fond en `object-cover` mais un petit
            visuel en haut à gauche : un zoom 1.25 → 1 y serait illisible. Elle
            arrive donc en fondu, légèrement décalée.
          */
          .fromTo(
            media,
            { opacity: 0, y: -10, scale: 0.9 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.9,
              ease: "expo.out",
              /*
                On rend la main au CSS une fois l'entrée jouée : GSAP laisse
                sinon `opacity: 1` en style INLINE, qui l'emporte sur les
                classes `group-hover:opacity-0` — la vignette ne s'effaçait
                alors jamais au survol.
              */
              clearProps: "opacity,transform",
            },
            0.15
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
            /*
              Même amplitude pour les trois cartes : elles restent alignées sur
              UNE seule ligne, comme dans la référence. Auparavant la carte du
              milieu dérivait deux fois plus vite et cassait l'alignement.
            */
            yPercent: -6,
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
      className="relative -mt-px overflow- bg-charbon pb-28 pt-[18vh] md:pb-40 md:pt-[22vh]"
    >
      {/*
        SEMIS D'ÉTOILES — fond de section. Positions tirées d'une graine fixe,
        donc identiques à chaque rendu ; chaque point scintille sur sa propre
        boucle. Purement décoratif (aria-hidden dans le composant).
      */}
      <StarField className="z-0" stars={20} dust={38} seed={11} />

      <div
        data-float="1"
        aria-hidden="true"
        className="pointer-events-none absolute -left-10 top-16 hidden w-[420px] lg:block"
      >
        <CardBird2 className="h-auto w-full text-dore/80" />
      </div>

      <div
        data-float="-1"
        aria-hidden="true"
        className="pointer-events-none absolute -right-6 bottom-10  w-[260px]  lg:block"
      >
        <img
          src={value2}
          alt=""
          loading="lazy"
          className=" w-full rounded-[3px] object-cover"
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
      
        <div className="relative ">
          <div aria-hidden="true" className="pointer-events-none absolute -left-[26vw] 
          -top-[250px] hidden w-[42vw] max-w-[620px] lg:block xl:-left-[22vw] xl:w-[38vw]" >
            <CardBird className="h-auto w-full text-dore/80" />
          </div>

        <div
          className=" mt-[300px]
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
                group relative isolate flex h-[300px] min-w-[76vw] shrink-0 snap-start
                flex-col justify-end overflow-hidden rounded-[6px]
                border border-ivoire/25 p-6
                transition-all duration-500 ease-nova
                will-change-transform
                hover:border-dore/70 focus-visible:border-dore/70
                md:h-[320px] md:min-w-0 md:shrink md:p-7
                lg:h-[360px] lg:p-8
              `}
            >
              {/* ---------------- VISUEL ---------------- */}
              {/*
                Vignette en haut à gauche, au-dessus du damier de survol (`z-0`
                contre `-z-10` pour le voile et le damier), sinon celui-ci la
                recouvrirait.

                AU SURVOL elle s'efface : la carte cède alors toute la place au
                texte descriptif qui monte à la place du titre.
              */}
              <div
                data-card-media
                aria-hidden="true"
                className="
                  absolute inset-0 z-0 will-change-transform
                  transition-all duration-500 ease-nova
                  group-hover:opacity-0 group-focus-visible:opacity-0
                "
              >
                {/*
                  `object-contain` + `max-*-full` : l'illustration s'inscrit
                  ENTIÈREMENT dans son cadre (pas de recadrage), sans jamais le
                  déborder — sans les bornes, une image large sortait de la
                  carte.
                */}
                <img
                  src={valueImages[i]}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover object-center"
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
                /*
                  Ancré en HAUT À DROITE, hors du flux : la carte est en
                  `justify-end`, un élément dans le flux se serait retrouvé
                  collé au titre en bas.

                  L'illustration occupe désormais toute la carte : sans une
                  pastille sombre derrière lui, le numéro devenait illisible
                  par-dessus la gravure.
                */
                className="card-ink-index absolute right-5 top-5 z-10 rounded-full bg-charbon/70 px-2.5 py-1 font-mono text-[11px] tracking-[0.18em] backdrop-blur-sm transition-colors duration-500 group-hover:text-bronze group-focus-visible:text-bronze lg:right-6 lg:top-6"
              >
                {String(i + 1).padStart(2, "0")} / 03
              </span>

              {/* ---------------- TITRE ↔ CORPS ---------------- */}
              {/*
                Le titre s'efface vers le haut pendant que le corps monte à sa
                place : les deux occupent la même boîte, donc la carte ne
                change jamais de hauteur au survol.
              */}

              {/*
                Marge haute : elle réserve la place de la vignette, qui passe
                derrière le titre. Au survol la vignette s'efface et le corps
                de texte monte occuper toute la carte.
              */}
              <div className="relative">
                <h3 className="card-ink-title text-d3 font-bold lowercase leading-[0.95] transition-all duration-500 ease-nova group-hover:-translate-y-3 group-hover:opacity-0 group-focus-visible:-translate-y-3 group-focus-visible:opacity-0">
                  {v.title}
                </h3>

                <p className="absolute inset-x-0 bottom-0 translate-y-3 text-[16px] leading-[1.6] text-charbon opacity-0 transition-all duration-700 ease-nova group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 md:text-[17px]">
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
      </div>
    </section>
  );
}
