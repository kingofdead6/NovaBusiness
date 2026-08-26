import { useCallback, useEffect, useRef } from "react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import anime from "animejs/lib/anime.es.js";

import { splitChars } from "../../lib/text";
import LiquidVeil from "../LiquidVeil";
import building from "../../assets/takeover/building.png";
import flower from "../../assets/takeover/flower.png";

gsap.registerPlugin(ScrollTrigger);

/**
 * SECTION 03 — RECOUVREMENT LIQUIDE
 *
 * Première moitié d'un diptyque : Takeover recouvre l'écran de matière
 * charbon, Values EST cette matière une fois posée. La dernière couche du
 * voile (#1C1C1C) est exactement `bg-charbon` : le raccord entre les deux
 * sections est donc invisible, et ce qui commence ici se termine là-bas.
 *
 * Composition — deux couches superposées dans le cadre sticky, qui se
 * relaient au scroll :
 *
 *   ┌───────────────────────────────────────────┐      ┌──────────────────────┐
 *   │  eyebrow                                  │      │  eyebrow             │
 *   │                                           │  →   │  nova.      ← replié │
 *   │                 nova.                     │      │ [img] description    │
 *   └───────────────────────────────────────────┘      └──────────────────────┘
 *        titre plein cadre                          il RESTE, en petit, au-dessus
 *
 * DÉROULÉ (celui de la référence vidéo) :
 *
 *   1. FOND CLAIR   — on entre sur `bg-ivoire`, le voile est encore hors cadre
 *   2. COULÉE       — la matière monte et recouvre l'écran ; le titre se
 *                     révèle dessus une fois la couverture faite
 *   3. LE TITRE SE REPLIE — il se réduit et remonte se poser sous l'eyebrow,
 *                     où il RESTE affiché jusqu'à la fin de la section
 *   4. DESCRIPTION  — elle entre par la droite, et À SA HAUTEUR les deux
 *                     visuels apparaissent aux bords gauche et droit
 *
 * Les visuels sont des PNG détourés, posés sans cadre ni fond. Ils ENTRENT EN
 * PIVOTANT : le pivot est placé loin au-dessus d'eux, si bien que la rotation
 * décrit un arc large qui les amène du hors-champ jusqu'à leur place. Leur
 * ancrage CSS, lui, ne bouge jamais.
 *
 * C'est le voile — et lui seul — qui fait passer le fond du clair au sombre.
 * La <section> reste donc `bg-ivoire` : c'est ce qu'on voit à l'entrée.
 */

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
       * Les visuels PIVOTENT POUR ENTRER. Leur pivot est placé très haut
       * au-dessus d'eux (`transformOrigin: 50% -140%`) : à cette distance, une
       * rotation décrit un arc large, et c'est cet arc — pas une translation —
       * qui les fait venir du hors-champ jusqu'à leur place. Le point d'ancrage
       * reste rigoureusement fixe ; seule l'amplitude de départ change.
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
        [leftArt, rightArt].forEach((el) => {
          if (el) gsap.set(el, { rotate: 0, opacity: 1 });
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
       *   0.66 → 0.88  les visuels PIVOTENT depuis le hors-champ, texte entre
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
       * Les visuels ENTRENT EN PIVOTANT : ils partent à ~38° — donc bien
       * au-delà des bords — et l'arc les amène jusqu'à leur position de repos.
       * Le fondu accompagne le mouvement au lieu de le remplacer.
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
      <div className="sticky top-0 h-stage overflow-hidden">
        <LiquidVeil onProgress={updateText} />

        {/*
          COMPOSITION — deux couches indépendantes dans le cadre sticky.

          Elles se succèdent au scroll comme dans la référence : le TITRE
          occupe l'écran une fois la coulée posée, puis s'élève et sort par le
          haut ; la DESCRIPTION prend le relais, flanquée des deux visuels qui
          arrivent EXACTEMENT à sa hauteur, en débord des bords gauche et
          droit.

          Deux couches superposées plutôt qu'une grille en colonne : chacune
          est centrée sur le cadre pour son propre compte, donc la sortie de
          l'une n'entraîne jamais l'autre.
        */}

        {/* ===================== EYEBROW ===================== */}

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
          Les deux visuels sont des PNG détourés : ils sont posés TELS QUELS,
          sans cadre, sans fond, sans rognage ni dégradé. Leur ancrage est fixe
          (`top-[34%]`) ; c'est la ROTATION, autour d'un pivot très haut placé,
          qui les fait entrer depuis le hors-champ et se poser à cet endroit.
        */}

        <div
          data-desc-layer
          className="absolute inset-0 z-10 flex items-center will-change-transform"
        >
          {/* -------------- VISUEL GAUCHE -------------- */}

          <figure
            data-art-left
            aria-hidden="true"
            className="
              pointer-events-none absolute origin-top will-change-transform
              -left-[10%] top-[58%] w-[52vw] opacity-70
              sm:-left-[6%] sm:w-[46vw]
              md:left-0 md:top-[34%] md:w-[32vw] md:max-w-[300px] md:opacity-100
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

          {/* -------------- VISUEL DROIT -------------- */}

          <figure
            data-art-right
            aria-hidden="true"
            className="
              pointer-events-none absolute origin-top will-change-transform
              -right-[8%] top-[68%] w-[46vw] opacity-70
              sm:-right-[4%] sm:w-[42vw]
              md:right-0 md:top-[34%] md:w-[28vw] md:max-w-[280px] md:opacity-100
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
