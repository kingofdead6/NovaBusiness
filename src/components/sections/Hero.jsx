import { useEffect, useRef } from "react";
import gsap from "gsap";
import { motion } from "framer-motion";
import Media from "../Media";
import MagneticButton from "../MagneticButton";
import { splitWords, splitCharsRich } from "../../lib/text";
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

    let cleanupSpot;

    const ctx = gsap.context(() => {
      const words = splitWords(el.querySelector("[data-split]"));
      const fades = el.querySelectorAll("[data-fade]");
      const arts = el.querySelectorAll("[data-art]");
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduced) {
        gsap.set([...words, ...fades, ...arts], { y: 0, yPercent: 0, opacity: 1 });
        // la timeline ne jouera pas : on relâche le rognage tout de suite
        el.setAttribute("data-split-done", "true");
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

      /*
        Les mots ont fini de monter : le rognage des lignes peut être relâché
        pour laisser les lettres dépasser sous l'effet du magnétisme.
      */
      tl.eventCallback("onComplete", () => {
        el.setAttribute("data-split-done", "true");
      });

  
      const mm = gsap.matchMedia();

      mm.add("(max-width: 1023px)", () => {
        arts.forEach((art, i) => {
          gsap.to(art, {
            // sens opposé d'une image à l'autre : le duo respire
            y: i % 2 === 0 ? 14 : -14,
            duration: 2.6,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            /*
              On attend la fin de l'animation d'arrivée (`tl`, qui anime ces
              mêmes éléments en yPercent) : sans ce décalage les deux tweens
              écrivent la même transform en même temps et l'entrée saccade.
            */
            delay: tl.duration() + i * 0.35,
          });
        });
      });

      /* ------------------------------------------------------------------ */
      /* PROJECTEUR D'INVERSION                                              */
      /* ------------------------------------------------------------------ */

      /*
       * Un CALQUE JUMEAU du bloc de texte, peint en couleurs inversées, est
       * superposé au bloc d'origine et révélé par un masque circulaire centré
       * sur le curseur : là où passe la souris, l'écriture apparaît inversée.
       *
       * Deux copies du texte plutôt qu'un filtre `mix-blend-mode: difference`
       * sur le curseur : le disque est un élément `fixed` posé très haut
       * (z-70), et un mode de fusion l'aurait fait réagir à TOUT ce qu'il
       * survole (images comprises), là où l'effet ne doit toucher que le
       * texte du Hero.
       *
       * Le masque est piloté par deux variables CSS et non par un état React :
       * la position change à chaque frame.
       */
      const spot = el.querySelector("[data-hero-spot]");
      const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

      let onSpotMove;
      let onSpotLeave;

      /* ------------------------------------------------------------------ */
      /* MAGNÉTISME DES LETTRES (même principe que le pied de page)          */
      /* ------------------------------------------------------------------ */

      /*
       * Les deux exemplaires du titre sont découpés en lettres et reçoivent
       * EXACTEMENT les mêmes transformations, appliquées dans la même boucle.
       *
       * C'est la condition pour que l'effet de recoloration continue de
       * fonctionner : si une seule copie bougeait, les glyphes se
       * désaligneraient et le calque révélé par le masque ne coïnciderait
       * plus avec le titre du dessous.
       *
       * On mesure la position sur les lettres de l'ORIGINAL uniquement — le
       * jumeau est superposé au pixel près, mesurer les deux doublerait le
       * coût pour un résultat identique.
       */
      const heroTitle = el.querySelector("[data-hero-title]");
      const heroChars = heroTitle ? splitCharsRich(heroTitle) : [];
      const twinChars = spot ? splitCharsRich(spot.querySelector("[data-hero-twin]")) : [];

      /*
        Les deux découpes doivent produire le même nombre de lettres, sans quoi
        l'appariement par index serait faux. Si le balisage venait à diverger,
        on renonce au magnétisme plutôt que d'afficher un titre disloqué.
      */
      const paired = heroChars.length === twinChars.length ? twinChars : [];

      let onCharMove;
      let onCharLeave;

      if (heroChars.length && fine) {
        const setters = heroChars.map((char, i) => ({
          char,
          y: gsap.quickTo(char, "y", { duration: 0.5, ease: "power3.out" }),
          scale: gsap.quickTo(char, "scale", { duration: 0.5, ease: "power3.out" }),
          twinY: paired[i]
            ? gsap.quickTo(paired[i], "y", { duration: 0.5, ease: "power3.out" })
            : null,
          twinScale: paired[i]
            ? gsap.quickTo(paired[i], "scale", { duration: 0.5, ease: "power3.out" })
            : null,
        }));

        // rayon d'influence : au-delà, la lettre est au repos
        const RADIUS = 160;

        onCharMove = (event) => {
          setters.forEach(({ char, y, scale, twinY, twinScale }) => {
            const rect = char.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const distance = Math.hypot(event.clientX - cx, event.clientY - cy);
            // 0 au bord du rayon, 1 sous le curseur
            const force = Math.max(0, 1 - distance / RADIUS);
            const lift = -26 * force;
            const grow = 1 + 0.1 * force;
            y(lift);
            scale(grow);
            twinY?.(lift);
            twinScale?.(grow);
          });
        };

        onCharLeave = () => {
          setters.forEach(({ y, scale, twinY, twinScale }) => {
            y(0);
            scale(1);
            twinY?.(0);
            twinScale?.(1);
          });
        };

        el.addEventListener("pointermove", onCharMove);
        el.addEventListener("pointerleave", onCharLeave);
      }

      if (spot && fine) {
        /*
          `unit: "px"` est obligatoire : une propriété personnalisée n'a pas de
          type, GSAP y écrirait un nombre nu (`--spot-x: 421`) que
          `radial-gradient` rejette — le masque disparaîtrait entièrement.

          On pose aussi la valeur de départ, sinon le premier tween part de la
          chaîne `"50%"` déclarée en CSS et GSAP ne sait pas l'interpoler
          vers des pixels.
        */
        gsap.set(spot, { "--spot-x": "0px", "--spot-y": "0px" });

        const xTo = gsap.quickTo(spot, "--spot-x", {
          duration: 0.28,
          ease: "power3",
          unit: "px",
        });
        const yTo = gsap.quickTo(spot, "--spot-y", {
          duration: 0.28,
          ease: "power3",
          unit: "px",
        });

        onSpotMove = (event) => {
          /*
            Coordonnées relatives au bloc : le calque est en `absolute` dans
            le Hero, un point en coordonnées écran serait décalé dès que la
            page défile.
          */
          const rect = spot.getBoundingClientRect();
          xTo(event.clientX - rect.left);
          yTo(event.clientY - rect.top);
          gsap.to(spot, { "--spot-r": "90px", duration: 0.4, ease: "power3.out" });
        };

        /*
          Le rayon retombe à zéro quand la souris quitte la section : sans
          cela le halo resterait figé sur le dernier point survolé.
        */
        onSpotLeave = () => {
          gsap.to(spot, { "--spot-r": "0px", duration: 0.45, ease: "power3.out" });
        };

        el.addEventListener("pointermove", onSpotMove);
        el.addEventListener("pointerleave", onSpotLeave);
      }

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
      /*
        Les écouteurs sont posés sur la section, hors du champ de `gsap.context`
        (qui ne connaît que les tweens) : on les retire donc à la main.
      */
      cleanupSpot = () => {
        if (onSpotMove) el.removeEventListener("pointermove", onSpotMove);
        if (onSpotLeave) el.removeEventListener("pointerleave", onSpotLeave);
        if (onCharMove) el.removeEventListener("pointermove", onCharMove);
        if (onCharLeave) el.removeEventListener("pointerleave", onCharLeave);
      };
    }, el);

    return () => {
      cleanupSpot?.();
      ctx.revert();
    };
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
        className="pointer-events-none absolute -left-10 bottom-0 z-[6] block h-[34vh] w-[62vw] max-w-[260px] lg:-left-24 lg:bottom-auto lg:top-0 lg:z-0 lg:h-full lg:w-[26vw] lg:max-w-[380px]"
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
        className="pointer-events-none absolute -right-[50px]  top-16 z-[6] block h-[34vh] w-[62vw] max-w-[440px] lg:right-0 lg:top-0 lg:z-0 lg:h-full lg:w-[30vw]"
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

        {/*
          PROJECTEUR D'INVERSION.

          Le titre est posé DEUX fois, superposé au pixel près : l'exemplaire
          du dessous est le vrai (animé par GSAP, lu par les lecteurs d'écran),
          celui du dessus reprend les mêmes mots en couleurs inversées et n'est
          révélé qu'à travers un disque suivant le curseur.

          Le calque du dessus est `aria-hidden` et `pointer-events-none` : il
          ne doit ni être annoncé une seconde fois, ni intercepter la souris.
        */}
        <div className="relative">
          <h1 data-hero-title className="text-d1 font-medium">
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

          {/*
            `inset-0` + mêmes classes typographiques : le jumeau se cale
            exactement sur l'original sans qu'aucune mesure JS n'intervienne,
            donc il reste aligné à toutes les largeurs.
          */}
          <div
            data-hero-spot
            aria-hidden="true"
            className="hero-spot pointer-events-none absolute inset-0 hidden select-none md:block"
          >
            {/*
              Couleurs du calque : le titre normal est charbon + italique
              bronze, le calque passe en bronze + italique doré. L'écart est
              net sous le curseur tout en restant lisible sur l'ivoire — un
              texte clair aurait disparu, faute de fond sombre pour le porter.
            */}
            <p data-hero-twin className="text-d1 font-medium text-bronze">
              <span className="block">On donne aux marques une façade</span>
              <span className="mt-1 block">
                {/*
                  Même `text-shadow` que l'original : sans lui, le liseré
                  ivoire qui détache l'italique des images disparaîtrait sous
                  le curseur et la lettre paraîtrait « sauter ».
                */}
                <span className="font-display italic text-dore [text-shadow:0_1px_0_rgb(245_240_232/0.9)]">qu'on remarque</span>{" "}
                <span className="font-black">de loin.</span>
              </span>
            </p>
          </div>
        </div>

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