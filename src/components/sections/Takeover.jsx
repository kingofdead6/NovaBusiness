import { useCallback, useEffect, useRef } from "react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import anime from "animejs/lib/anime.es.js";

import { splitChars } from "../../lib/text";
import LiquidVeil from "../LiquidVeil";
import DriftArt from "../DriftArt";
import flower from "../../assets/Takeover/flower.png";
import building from "../../assets/Takeover/building.png";
gsap.registerPlugin(ScrollTrigger);

/**
 * SECTION 03 — RECOUVREMENT LIQUIDE
 *
 * Composition:
 *
 *                         nova.
 *
 *   Description
 *   anchored to
 *   the left side
 *
 *   [portrait]                         [portrait]
 *
 * The portraits begin outside the viewport, arrive into
 * position, hold while the text is readable, then drift
 * back out (with a fade) as the section releases.
 */

const REVEAL_START = 0.6;
const REVEAL_END = 0.85;

export default function Takeover() {
  const root = useRef(null);
  const textTimeline = useRef(null);

  /**
   * Synchronise the text animation with LiquidVeil.
   */
  const updateText = useCallback((progress) => {
    const tl = textTimeline.current;

    if (!tl) return;

    const t =
      (progress - REVEAL_START) /
      (REVEAL_END - REVEAL_START);

    tl.seek(
      tl.duration *
        Math.min(
          1,
          Math.max(0, t)
        )
    );
  }, []);

  useEffect(() => {
    if (!root.current) {
      return undefined;
    }

    const ctx = gsap.context(() => {
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      const word =
        root.current.querySelector(
          "[data-word]"
        );

      const sub =
        root.current.querySelector(
          "[data-sub]"
        );

      const leftImage =
        root.current.querySelector(
          "[data-drift-left]"
        );

      const rightImage =
        root.current.querySelector(
          "[data-drift-right]"
        );

      if (!word || !sub) {
        return;
      }

      const chars = splitChars(word);

      /**
       * ---------------------------------------------------------------
       * INITIAL TEXT STATE
       * ---------------------------------------------------------------
       */

      gsap.set(chars, {
        opacity: 0,
        yPercent: 70,
        rotate: 5,
        transformOrigin:
          "50% 100%",
      });

      gsap.set(sub, {
        opacity: 0,
        y: 30,
      });

      /**
       * ---------------------------------------------------------------
       * INITIAL IMAGE STATE
       * ---------------------------------------------------------------
       *
       * Both images start outside the viewport and invisible,
       * so the entrance can fade them in rather than just
       * sliding a fully-opaque image into frame.
       */

      if (leftImage) {
        gsap.set(leftImage, {
          xPercent: -72,
          yPercent: 8,
          rotate: -18,
          scale: 0.82,
          opacity: 0,
          transformOrigin:
            "80% 50%",
        });
      }

      if (rightImage) {
        gsap.set(rightImage, {
          xPercent: 72,
          yPercent: -5,
          rotate: 18,
          scale: 0.82,
          opacity: 0,
          transformOrigin:
            "20% 50%",
        });
      }

      /**
       * ---------------------------------------------------------------
       * REDUCED MOTION
       * ---------------------------------------------------------------
       */

      if (reduced) {
        gsap.set(chars, {
          opacity: 1,
          yPercent: 0,
          rotate: 0,
        });

        gsap.set(sub, {
          opacity: 1,
          y: 0,
        });

        if (leftImage) {
          gsap.set(leftImage, {
            xPercent: 0,
            yPercent: 0,
            rotate: 0,
            scale: 1,
            opacity: 1,
          });
        }

        if (rightImage) {
          gsap.set(rightImage, {
            xPercent: 0,
            yPercent: 0,
            rotate: 0,
            scale: 1,
            opacity: 1,
          });
        }

        return;
      }

      /**
       * ---------------------------------------------------------------
       * TEXT TIMELINE
       * ---------------------------------------------------------------
       */

      const timeline = anime.timeline({
        autoplay: false,
        easing: "easeOutExpo",
      });

      /**
       * NOVA LETTER REVEAL
       */
      timeline.add({
        targets: chars,
        opacity: [0, 1],
        translateY: ["70%", "0%"],
        rotate: [5, 0],
        duration: 1100,
        delay: anime.stagger(55),
      });

      /**
       * DESCRIPTION REVEAL
       */
      timeline.add(
        {
          targets: sub,
          opacity: [0, 1],
          translateY: [30, 0],
          duration: 850,
        },
        "-=600"
      );

      textTimeline.current =
        timeline;

      /**
       * ---------------------------------------------------------------
       * TITLE SCROLL MOVEMENT
       * ---------------------------------------------------------------
       */

      gsap.to(word, {
        scale: 1.045,
        y: -10,
        ease: "none",

        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      });

      /**
       * ---------------------------------------------------------------
       * PORTRAIT ENTRANCE + EXIT
       * ---------------------------------------------------------------
       *
       * A single scroll-scrubbed timeline spans the whole section
       * (top top → bottom bottom, same window as the title). Each
       * portrait gets three beats within it:
       *
       *   1. ENTER  — glides + rotates in from off-screen, fading up
       *   2. HOLD   — sits still while the description is readable
       *   3. EXIT   — continues its outward arc and dissolves away
       *
       * Positions below are fractions of the timeline's own total
       * duration (treated as 0–1), so they map directly onto scroll
       * progress through the section regardless of scrub smoothing.
       */

      const portraitTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
      });

      if (leftImage) {
        portraitTimeline
          .fromTo(
            leftImage,
            {
              xPercent: -72,
              yPercent: 8,
              rotate: -18,
              scale: 0.82,
              opacity: 0,
            },
            {
              xPercent: 0,
              yPercent: 0,
              rotate: 0,
              scale: 1,
              opacity: 1,
              ease: "power2.out",
              duration: 0.24,
            },
            0.04
          )
          // hold from ~0.28 to ~0.74 (implicit gap — nothing to tween)
          .to(
            leftImage,
            {
              xPercent: -46,
              yPercent: -16,
              rotate: -14,
              scale: 0.86,
              opacity: 0,
              ease: "power2.in",
              duration: 0.22,
            },
            0.76
          );
      }

      if (rightImage) {
        portraitTimeline
          .fromTo(
            rightImage,
            {
              xPercent: 72,
              yPercent: -5,
              rotate: 18,
              scale: 0.82,
              opacity: 0,
            },
            {
              xPercent: 0,
              yPercent: 0,
              rotate: 0,
              scale: 1,
              opacity: 1,
              ease: "power2.out",
              duration: 0.24,
            },
            0.0
          )
          // hold from ~0.24 to ~0.78
          .to(
            rightImage,
            {
              xPercent: 52,
              yPercent: -22,
              rotate: 16,
              scale: 0.86,
              opacity: 0,
              ease: "power2.in",
              duration: 0.22,
            },
            0.78
          );
      }
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
      className="
        relative
        h-[400vh]
        bg-ivoire
      "
      aria-label="Nova Business en un mot"
    >
      <div
        className="
          sticky
          top-0
          h-screen
          overflow-hidden
        "
      >
        <LiquidVeil
          onProgress={updateText}
        />

        {/* ============================================================= */}
        {/* SIDE PORTRAITS                                                */}
        {/* ============================================================= */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            z-[5]
          "
        >
          {/* ----------------------------------------------------------- */}
          {/* LEFT                                                         */}
          {/* ----------------------------------------------------------- */}

          <div
            data-drift-left
            className="
              absolute
              -left-[180px]
              top-[56%]
              w-[360px]

              md:-left-[210px]
              md:top-[53%]
              md:w-[470px]

              lg:-left-[230px]
              lg:top-[50%]
              lg:w-[540px]

              will-change-transform
            "
          >
            <DriftArt
              src={building}
              label="Visuel gauche — portrait éditorial"
              ratio="3/4"
              className="w-full"
              scrollStart="60% top"
              scrollEnd="85% top"
              from={{
                x: -70,
                y: 90,
                rotate: -18,
                scale: 0.82,
              }}
            />
          </div>

          {/* ----------------------------------------------------------- */}
          {/* RIGHT                                                        */}
          {/* ----------------------------------------------------------- */}

          <div
            data-drift-right
            className="
              absolute
              right-[2%]
              top-[64%]
              w-[350px]

              md:right-[2%]
              md:top-[61%]
              md:w-[450px]

              lg:right-[2%]
              lg:top-[58%]
              lg:w-[520px]

              will-change-transform
            "
          >
            <DriftArt
              src={flower}
              label="Visuel droit — portrait éditorial"
              ratio="4/5"
              className="w-full"
              scrollStart="60% top"
              scrollEnd="85% top"
              from={{
                x: 70,
                y: 110,
                rotate: 18,
                scale: 0.82,
              }}
            />
          </div>
        </div>

        {/* ============================================================= */}
        {/* CENTRAL CONTENT                                                */}
        {/* ============================================================= */}

        <div
          className="
            relative
            z-10
            flex
            h-full
            flex-col
            items-end
            justify-center
            px-5
          "
        >
          {/* EYEBROW */}

          <p
            className="
              eyebrow
              mb-8
              text-right
              text-dore
            "
          >
            Depuis 2019 — 40+ marques accompagnées
          </p>

          {/* TITLE */}

          <h2
            data-word
            className="
              text-giant
              w-full
              text-center
              font-black
              lowercase
              leading-[0.82]
              text-ivoire
              mb-[200px]
            "
          >
            nova.
          </h2>

          {/* ========================================================= */}
          {/* LEFT-ALIGNED DESCRIPTION                                   */}
          {/* ========================================================= */}

          <div
            className="
              mt-12
              w-full
              px-5

              md:mt-16
              md:px-10

              lg:mt-20
              lg:px-16

              xl:px-20
            "
          >
            <p
              data-sub
              className="
                ml-auto
                max-w-[420px]
                text-left
                text-2xl
                font-medium
                leading-[1.6]
                tracking-[-0.01em]
                text-ivoire/75

                md:max-w-[500px]
                md:text-3xl
                md:leading-[1.55]
              "
            >
              Nous créons des expériences digitales où
              design, technologie et stratégie se
              rencontrent pour donner aux marques une
              présence forte, distinctive et mémorable.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}