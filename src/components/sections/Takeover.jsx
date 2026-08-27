import { useCallback, useEffect, useRef } from "react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import anime from "animejs/lib/anime.es.js";

import { splitChars } from "../../lib/text";
import LiquidVeil from "../LiquidVeil";
import building from "../../assets/takeover/takeover1.svg";
import flower from "../../assets/takeover/takeover2.svg";
import centerArt from "../../assets/takeover/takeover3.svg";

gsap.registerPlugin(ScrollTrigger);


/* Fenêtre de progression du voile pendant laquelle le texte se révèle. */
const REVEAL_START = 0.52;
const REVEAL_END = 0.82;

export default function Takeover() {
  const root = useRef(null);
  const textTimeline = useRef(null);

  /** Synchronise la timeline de texte sur la progression de LiquidVeil. */
  const updateText = useCallback((progress) => {
    const tl = textTimeline.current;
    if (!tl) return;

    const t = (progress - REVEAL_START) / (REVEAL_END - REVEAL_START);
    tl.seek(tl.duration * Math.min(1, Math.max(0, t)));
  }, []);

  useEffect(() => {
    if (!root.current) return undefined;

    const ctx = gsap.context(() => {
      const q = (sel) => root.current.querySelector(sel);
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const word = q("[data-word]");
      const sub = q("[data-sub]");
      const eyebrow = q("[data-eyebrow]");
      const rule = q("[data-rule]");
      const titleLayer = q("[data-title-layer]");
      const descLayer = q("[data-desc-layer]");
      const leftArt = q("[data-art-left]");
      const rightArt = q("[data-art-right]");
      const centerArtEl = q("[data-art-center]");

      if (!word || !sub) return;

      const chars = splitChars(word);

      /* ------------------------------------------------------------------ */
      /* ÉTAT INITIAL                                                        */
      /* ------------------------------------------------------------------ */

      gsap.set(chars, {
        opacity: 0,
        yPercent: 70,
        rotate: 5,
        transformOrigin: "50% 100%",
      });
      gsap.set(sub, { opacity: 0, y: 30 });
      if (rule) gsap.set(rule, { scaleX: 0, transformOrigin: "0% 50%" });

      /*
       * La couche description part masquée : elle n'entre qu'une fois le titre
       * sorti.
       *
       * Les visuels de bord (desktop) PIVOTENT POUR ENTRER. Leur pivot est
       * placé très haut au-dessus d'eux (`transformOrigin: 50% -140%`) : à
       * cette distance, une rotation décrit un arc large, et c'est cet arc —
       * pas une translation — qui les fait venir du hors-champ jusqu'à leur
       * place. Le point d'ancrage reste rigoureusement fixe ; seule
       * l'amplitude de départ change.
       *
       * L'amplitude est réduite sur téléphone : à largeur étroite, un arc de
       * 38° projette l'image bien plus loin (le rayon est le même, mais l'écran
       * est deux fois moins large), et elle disparaissait trop longtemps avant
       * de revenir. 24° donne la même lecture sur un petit écran.
       */
      const SWING = window.matchMedia("(max-width: 767px)").matches ? 24 : 38;

      /*
       * La couche titre est ancrée en haut (`items-start`) mais démarre avec
       * un grand retrait qui la place optiquement au CENTRE du cadre. C'est ce
       * retrait que le relais rétracte : le mot remonte donc en se repliant,
       * sans jamais quitter l'écran.
       */
      if (titleLayer) gsap.set(titleLayer, { paddingTop: "38vh" });

      if (descLayer) gsap.set(descLayer, { opacity: 0 });
      if (leftArt) {
        gsap.set(leftArt, { opacity: 0, rotate: -SWING, transformOrigin: "50% -140%" });
      }
      if (rightArt) {
        gsap.set(rightArt, { opacity: 0, rotate: SWING, transformOrigin: "50% -140%" });
      }

      /*
       * Le visuel central (mobile uniquement) n'a pas besoin d'un pivot
       * excentré : il est seul au milieu du cadre, donc son entrée est un
       * simple pop-and-settle sur son propre centre — un arc n'ajouterait
       * rien puisqu'il n'y a pas de hors-champ latéral à traverser.
       */
      if (centerArtEl) {
        gsap.set(centerArtEl, {
          opacity: 0,
          scale: 0.6,
          rotate: -10,
          transformOrigin: "50% 50%",
        });
      }

      /* ------------------------------------------------------------------ */
      /* MOUVEMENT RÉDUIT — tout est posé, rien ne bouge                     */
      /* ------------------------------------------------------------------ */

      if (reduced) {
        gsap.set(chars, { opacity: 1, yPercent: 0, rotate: 0 });
        gsap.set(sub, { opacity: 1, y: 0 });
        if (rule) gsap.set(rule, { scaleX: 1 });
        /*
         * Sans mouvement, on affiche directement l'état final : le titre déjà
         * replié en signature compacte, la description en place dessous.
         */
        if (titleLayer) gsap.set(titleLayer, { paddingTop: "7vh" });
        gsap.set(word, { scale: 0.3 });
        if (descLayer) gsap.set(descLayer, { opacity: 1 });
        [leftArt, rightArt, centerArtEl].forEach((el) => {
          if (el) gsap.set(el, { rotate: 0, opacity: 1, scale: 1 });
        });
        return;
      }

      /* ------------------------------------------------------------------ */
      /* TEXTE — timeline anime.js pilotée par la progression du voile       */
      /* ------------------------------------------------------------------ */

      const timeline = anime.timeline({ autoplay: false, easing: "easeOutExpo" });

      timeline.add({
        targets: chars,
        opacity: [0, 1],
        translateY: ["70%", "0%"],
        rotate: [5, 0],
        duration: 1100,
        delay: anime.stagger(55),
      });

      /*
       * NB : seul le TITRE est piloté par la coulée. La description ne fait
       * plus partie de cette timeline — elle entre plus tard, une fois le
       * titre sorti du cadre, et dépend donc du scroll et non de la
       * progression du voile (voir « RELAIS » plus bas).
       */

      textTimeline.current = timeline;

      /* ------------------------------------------------------------------ */
      /* EYEBROW — apparaît à l'entrée dans la section                       */
      /* ------------------------------------------------------------------ */

      if (eyebrow) {
        gsap.fromTo(
          eyebrow,
          { opacity: 0, y: -14 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "expo.out",
            scrollTrigger: { trigger: root.current, start: "top 70%" },
          }
        );
      }

      /* ------------------------------------------------------------------ */
      /* RELAIS — le titre sort, la description et les visuels prennent la    */
      /* place                                                                */
      /* ------------------------------------------------------------------ */
      /*
       * Une seule timeline scrubée sur toute la traversée de la section. Les
       * positions sont des fractions de sa durée (0 → 1) et se lisent donc
       * directement comme une progression de scroll :
       *
       *   0.00 → 0.62  la coulée monte, le titre se révèle dessus
       *                (piloté par `updateText`, pas par cette timeline)
       *   0.62 → 0.72  LE TITRE S'ÉLÈVE ET SORT par le haut
       *   0.66 → 0.88  les visuels entrent (pivot sur desktop, pop au centre
       *                sur mobile), texte entre
       *   0.86 → 1.00  maintien : tout est lisible avant le passage à Values
       */

      const relay = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
      });

      /* le titre respire pendant que la coulée le recouvre */
      relay.fromTo(
        word,
        { scale: 1, y: 0 },
        { scale: 1.04, y: -18, ease: "none", duration: 0.62 },
        0
      );

      /*
       * ...puis IL SE REPLIE au lieu de partir.
       *
       * Deux tweens simultanés :
       *  - le mot se réduit à ~28 % (origine en haut, donc il se ramasse vers
       *    son propre bord supérieur) ;
       *  - la couche remonte en rétractant son padding, de 38vh à 7vh.
       *
       * Résultat : « nova. » vient se poser en petit sous l'eyebrow et Y RESTE
       * jusqu'à la fin de la section. Comme la timeline est scrubée, remonter
       * le déplie exactement à l'envers — il grandit et retrouve le centre.
       */
      relay.to(
        word,
        { scale: 0.28, y: 0, ease: "power2.inOut", duration: 0.16 },
        0.62
      );

      if (titleLayer) {
        relay.to(
          titleLayer,
          { paddingTop: "7vh", ease: "power2.inOut", duration: 0.16 },
          0.62
        );
      }

      /* la couche description devient active dès que le titre libère le cadre */
      if (descLayer) {
        relay.to(descLayer, { opacity: 1, duration: 0.02 }, 0.66);
      }

      /*
       * Les visuels de bord (desktop) ENTRENT EN PIVOTANT : ils partent à
       * ~38° — donc bien au-delà des bords — et l'arc les amène jusqu'à leur
       * position de repos. Le fondu accompagne le mouvement au lieu de le
       * remplacer.
       */
      [
        [leftArt, 0.66],
        [rightArt, 0.68],
      ].forEach(([el, at]) => {
        if (!el) return;
        relay.to(
          el,
          {
            rotate: 0,
            opacity: 1,
            ease: "power3.out",
            duration: 0.22,
          },
          at
        );
      });

      /*
       * Le visuel central (mobile) POP depuis un léger retrait/rotation avec
       * un rebond en fin de course (`back.out`) : seul au milieu du cadre, il
       * peut se permettre une entrée plus affirmée que les pièces de bord.
       */
      if (centerArtEl) {
        /*
          Entrée avancée à 0.42 (au lieu de 0.67) : le visuel n'atteignait sa
          pleine opacité qu'en toute fin de section, si bien qu'on traversait
          la majeure partie du bloc mobile sur un écran quasi vide.
        */
        relay.to(
          centerArtEl,
          {
            rotate: 0,
            scale: 1,
            opacity: 1,
            ease: "back.out(1.6)",
            duration: 0.3,
          },
          0.42
        );
      }

      /* le filet se trace, puis le paragraphe monte */
      if (rule) {
        relay.to(rule, { scaleX: 1, ease: "expo.out", duration: 0.12 }, 0.72);
      }

      relay.to(
        sub,
        { opacity: 1, y: 0, ease: "expo.out", duration: 0.14 },
        0.76
      );

    }, root);

    return () => {
      ctx.revert();
      textTimeline.current = null;
    };
  }, []);

  return (
    <section
      ref={root}
      id="studio"
      data-flock
      className="relative h-[400vh] bg-ivoire"
      aria-label="Nova Business en un mot"
    >
      {/* `h-stage` : 100vh avec repli 100svh — voir index.css */}
      <div className="sticky top-0 h-stage ">
        <LiquidVeil onProgress={updateText} />

        <p
          data-eyebrow
          className="
            eyebrow absolute inset-x-0 top-0 z-20
            px-5 text-center text-dore
            pt-[calc(env(safe-area-inset-top)+4.5rem)]
            md:px-10 md:pt-24 md:text-left
            xl:px-16
          "
        >
          Depuis 2019 — 40+ marques accompagnées
        </p>

        {/* ====================== TITRE ====================== */}
        {/*
          Le titre NE DISPARAÎT PAS. Il occupe d'abord tout le cadre, puis se
          replie vers le haut pour devenir une signature compacte qui reste
          affichée pendant toute la suite de la section.

          Le pli est un simple `scale` : la couche est ancrée en haut
          (`items-start` + un padding qui la descend au centre), et c'est GSAP
          qui rétracte ce padding. Le mot se réduit donc VERS SON BORD
          SUPÉRIEUR au lieu de fuir hors du cadre — rien ne sort, donc rien
          n'a besoin de « revenir » à la remontée.
        */}

        <div
          data-title-layer
          className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center px-5 will-change-transform"
        >
          <h2
            data-word
            className="
              origin-top text-center text-giant font-black lowercase
              leading-[0.8] text-ivoire
              [text-shadow:0_2px_60px_rgba(28,28,28,0.35)]
              will-change-transform
            "
          >
            nova.
          </h2>
        </div>

        {/* ============= DESCRIPTION + VISUELS DE BORD ============= */}
        {/*
          Les visuels de bord (gauche/droite) sont réservés au desktop
          (`hidden md:block`) : deux PNG détourés posés tels quels, sans
          cadre ni fond, ancrés sur les côtés. Sur mobile, un visuel CENTRAL
          UNIQUE (différent des deux autres) prend leur place — voir plus bas.
        */}

        <div
          data-desc-layer
          className="absolute inset-0 z-10 flex items-center will-change-transform"
        >
          {/* -------------- VISUEL GAUCHE (desktop uniquement) -------------- */}

          <figure
            data-art-left
            aria-hidden="true"
            className="
              pointer-events-none absolute hidden origin-top will-change-transform
              md:block md:left-0 md:top-[34%] md:w-[32vw] md:max-w-[300px] md:opacity-100
              lg:max-w-[380px]
              xl:max-w-[430px]
            "
          >
            <img
              src={building}
              alt=""
              loading="lazy"
              className="block w-full"
            />
          </figure>

          {/* -------------- VISUEL DROIT (desktop uniquement) -------------- */}

          <figure
            data-art-right
            aria-hidden="true"
            className="
              pointer-events-none absolute hidden origin-top will-change-transform
              md:block md:right-0 md:top-[34%] md:w-[28vw] md:max-w-[280px] md:opacity-100
              lg:max-w-[340px]
              xl:max-w-[390px]
            "
          >
            <img
              src={flower}
              alt=""
              loading="lazy"
              className="block w-full"
            />
          </figure>

          {/* -------------- VISUEL CENTRAL (mobile uniquement) -------------- */}

          <figure
            data-art-center
            aria-hidden="true"
            /*
              MOBILE — le visuel était trop petit (52vw), calé à 40 % de la
              hauteur donc À CHEVAL sur le paragraphe, et sa teinte bronze se
              perdait sur le fond charbon.

              Il est désormais nettement plus grand, descendu SOUS le bloc de
              texte, et remonté au-dessus du voile (`z-[15]`, entre la scène en
              z-10 et l'eyebrow en z-20) pour être franchement lisible.

              La largeur est bornée par `34vh` en plus de `70vw` : sur un écran
              court (375 x 667) une taille purement horizontale débordait par
              le bas.
            */
            className="
              pointer-events-none absolute left-1/2 top-[64%] z-[15] block
              w-[min(70vw,290px,30vh)] -translate-x-1/2 -translate-y-1/2
              will-change-transform
              drop-shadow-[0_24px_48px_rgba(0,0,0,0.55)]
              md:hidden
            "
          >
            <img
              src={centerArt}
              alt=""
              loading="lazy"
              className="block w-full"
            />
          </figure>

          {/* ---------------- TEXTE ---------------- */}
          {/*
            Aligné à droite comme dans la référence, mais gardé à l'intérieur
            de la gouttière pour ne jamais passer sous le visuel de droite.
          */}

          {/*
            Le titre replié occupe désormais le haut du cadre en permanence :
            la description est décalée vers le bas pour lui laisser la place au
            lieu de passer dessous. Sur mobile le retrait est plus important —
            le mot y est proportionnellement plus grand.
          */}
          <div
            className="
              relative z-10 w-full self-start px-6
              pt-[calc(env(safe-area-inset-top)+13rem)]
              md:ml-auto md:px-10 md:pt-[26vh]
              xl:px-16
            "
          >
            <div className="w-full max-w-[520px] md:ml-auto md:mr-[16vw] lg:mr-[18vw] xl:mr-[15vw]">
              <span
                data-rule
                aria-hidden="true"
                className="mb-5 block h-px w-full bg-dore/50 md:mb-6"
              />
              <p
                data-sub
                className="
                  text-left text-[19px] font-medium leading-[1.5]
                  tracking-[-0.01em] text-ivoire/80
                  sm:text-xl
                  md:text-2xl md:leading-[1.55] md:text-ivoire/75
                "
              >
                Nous créons des expériences digitales où design, technologie et
                stratégie se rencontrent pour donner aux marques une présence
                forte, distinctive et mémorable.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}