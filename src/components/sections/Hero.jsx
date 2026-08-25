import { useEffect, useRef } from "react";
import gsap from "gsap";
import { motion } from "framer-motion";
import Media from "../Media";
import MagneticButton from "../MagneticButton";
import { splitWords } from "../../lib/text";
import HeroImageLeft from "../../assets/Hero/HeroLeft.jpg";
import SharedMedia from "../SharedMedia";
import HeroImageRight from "../../assets/Hero/HeroRight.jpg";
/**
 * SECTION 01 — HERO
 * Titre cinétique : les mots montent un par un depuis un masque, les graisses
 * et l'italique didone alternent dans la même phrase. Deux colonnes d'images
 * en parallaxe encadrent le texte (comme les illustrations de la référence).
 */
export default function Hero({ ready = true }) {
  const root = useRef(null);

  useEffect(() => {
    const el = root.current;
    if (!ready || !el) return;

    const ctx = gsap.context(() => {
      const words = splitWords(el.querySelector("[data-split]"));
      const fades = el.querySelectorAll("[data-fade]");
      const arts = el.querySelectorAll("[data-art]");
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduced) {
        gsap.set([...words, ...fades, ...arts], { y: 0, yPercent: 0, opacity: 1 });
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

      tl.from(words, {
        yPercent: 118,
        duration: 1.25,
        stagger: 0.045,
      })
        .from(fades, { y: 22, opacity: 0, duration: 1, stagger: 0.09 }, "-=0.85")
        .from(arts, { yPercent: 12, opacity: 0, duration: 1.6, stagger: 0.12 }, "-=1.2");

      // parallaxe de sortie : le texte part plus vite que les images
      gsap.to(el.querySelector("[data-hero-text]"), {
        yPercent: -18,
        opacity: 0.15,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, el);

    return () => ctx.revert();
  }, [ready]);

  return (
    <section
      id="top"
      ref={root}
      className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden pb-14 pt-32 md:pb-20"
    >
      {/* colonnes d'images décoratives, gauche + droite */}
      <div
        data-art
        className="pointer-events-none absolute -left-24 top-0 hidden h-full w-[26vw] max-w-[380px] lg:block"
      >
        <SharedMedia
          src={HeroImageLeft}
          rows={5} chaos={0.8} spread={9} seed={3}
          ratio="3/5"
          parallax={8}
          label="Visuel gauche — façade / détail architectural, portrait"
          className="h-full"
        />
      </div>
      <div
        data-art
        className="pointer-events-none absolute right-0 top-16 z-[6] block h-[34vh] w-[62vw] max-w-[440px] lg:right-0 lg:top-0 lg:z-0 lg:h-full lg:w-[30vw]"
      >
        <SharedMedia
          src={HeroImageRight}
          rows={5} chaos={0.8} spread={9} seed={3}
          ratio="3/5"
          parallax={12}
          label="Visuel droite — projet phare, portrait"
          className="h-full"
        />
      </div>

      {/* voile de lisibilité : l'ivoire reste plein derrière le texte et
          s'efface vers les bords pour laisser respirer les images */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[5] bg-gradient-to-r from-ivoire via-ivoire/95 to-ivoire lg:from-ivoire/40 lg:via-ivoire/92 lg:to-ivoire/40"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-2/3 bg-gradient-to-t from-ivoire via-ivoire/85 to-transparent"
      />

      <div className="edge relative z-10" data-hero-text>
        <span data-fade className="eyebrow mb-6 block text-charbon/70">
          Studio digital — Paris, 11e
        </span>

        <h1 className="text-d1 font-medium">
          {/* ligne 1 — mots masqués, animés par GSAP */}
          <span data-split className="block">
            On donne aux marques une façade
          </span>
          {/* ligne 2 — mélange graisse + didone italique, comme la référence */}
          <span className="mt-1 block">
            <span className="font-display italic text-bronze [text-shadow:0_1px_0_rgb(245_240_232/0.9)]">qu'on remarque</span>{" "}
            <span className="font-black">de loin.</span>
          </span>
        </h1>

        <div className="mt-9 flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
          <p
            data-fade
            className="max-w-md text-[17px] leading-relaxed text-charbon/75"
          >
            Sites, identités et campagnes pour les maisons qui refusent de
            ressembler à leurs concurrents. Une équipe, un interlocuteur, des
            délais tenus.
          </p>

          <div data-fade className="flex flex-wrap items-center gap-3">
            <MagneticButton href="#contact" variant="solid">
              démarrer un projet
            </MagneticButton>
            <MagneticButton href="#realisations" variant="ghost">
              voir nos réalisations
            </MagneticButton>
          </div>
        </div>

        <div data-fade className="mt-14 flex items-center gap-3 text-charbon/60">
          <motion.span
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className="font-mono text-[11px] uppercase tracking-[0.2em]"
          >
            d'abord ↓ le studio
          </motion.span>
          <span className="hairline max-w-[140px]" />
        </div>
      </div>
    </section>
  );
}
