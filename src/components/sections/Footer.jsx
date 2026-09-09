import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { contact, nav } from "../../data/site";
import { splitChars } from "../../lib/text";

gsap.registerPlugin(ScrollTrigger);

/**
 * ÉTAT 4 — LE PIED DE PAGE (§07)
 * ============================================================================
 *
 * « Fond clair, puis bascule en pleine couleur au tout dernier moment. La
 * boucle se referme sur l'écran de chargement. »
 *
 * La bascule n'est PAS pilotée ici : le pied de page déclare simplement
 * `data-ground="ciel"`, et `src/lib/ground.js` en déduit la frontière avec la
 * section claire qui le précède. C'est la troisième et dernière bascule de la
 * page, et elle ramène exactement la couleur de l'étape 0.
 *
 * CE QUI A DISPARU
 * ----------------
 * La version précédente empilait ici ~340 lignes de CSS décoratif : aurore de
 * voiles dorés en rotation, grille lumineuse montante, balayage doré sur le
 * nom, `drop-shadow` de lueur sur les lettres survolées, halo du logo, point
 * lumineux voyageant le long du filet, flèche qui saute en boucle. Le §09
 * interdit chacun de ces motifs — lueurs, dégradés décoratifs, animations en
 * boucle — et le §05 exige qu'un dessin tienne au trait seul.
 *
 * CE QUI RESTE
 * ------------
 * Le nom géant, ajusté À LA LARGEUR RÉELLE par mesure (et non par une valeur
 * en `vw` devinée), et le magnétisme des lettres — un mouvement qui répond au
 * geste de l'utilisateur, donc ni une boucle ni un clignotement.
 */
export default function Footer() {
  const root = useRef(null);
  const wordmark = useRef(null);

  useEffect(() => {
    if (!root.current) return undefined;

    let cleanup;

    const ctx = gsap.context(() => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const chars = splitChars(wordmark.current);

      if (!chars.length) return;

      /* ------------------------------------------------------------------ */
      /* 1. ARRIVÉE DES LETTRES                                              */
      /* ------------------------------------------------------------------ */

      /*
        `fromTo` et NON `set(...)` + `to(...)` : avec deux appels séparés,
        l'état fermé posé par `set` devient aussi la valeur d'arrivée du tween
        lorsque celui-ci est créé alors que le déclencheur est déjà franchi —
        les lettres restent alors bloquées en position basse.

        Le déclencheur vise le NOM lui-même et non le pied de page entier : ce
        dernier est très haut, son sommet franchirait le seuil bien avant que
        le mot n'entre à l'écran.
      */
      if (!reduced) {
        gsap.fromTo(
          chars,
          { yPercent: 110, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 1.1,
            ease: "expo.out",
            stagger: 0.03,
            immediateRender: true,
            scrollTrigger: { trigger: wordmark.current, start: "top bottom", once: true },
          }
        );
      }

      /* ------------------------------------------------------------------ */
      /* 2. AJUSTEMENT DU NOM À LA LARGEUR                                   */
      /* ------------------------------------------------------------------ */

      /*
       * On mesure le mot à une taille de référence, puis on applique le
       * rapport largeur_disponible / largeur_mesurée. C'est fiable quels que
       * soient la police, la marge ou le point de rupture — contrairement à
       * une valeur en `vw` qu'il faut deviner pour chaque écran.
       */
      const fitWordmark = () => {
        const node = wordmark.current;
        if (!node || !node.parentElement) return;

        /*
          Largeur RÉELLEMENT disponible : `clientWidth` du parent inclut son
          rembourrage, que les lettres ne peuvent pas occuper. On le retranche,
          sans quoi le mot dépasse systématiquement de 5 à 10 %.
        */
        const parent = node.parentElement;
        const pcs = getComputedStyle(parent);
        const available =
          parent.clientWidth -
          parseFloat(pcs.paddingLeft) -
          parseFloat(pcs.paddingRight);
        if (!available || available <= 0) return;

        /*
          On mesure l'ENCRE réelle (bord gauche de la 1re lettre au bord droit
          de la dernière) et non `scrollWidth` : chaque caractère est déjà
          emballé dans un span inline-block, et la largeur de défilement du
          conteneur ne reflète alors plus celle du texte.
        */
        const glyphs = node.querySelectorAll(".char");
        const REF = 100;
        node.style.fontSize = `${REF}px`;

        let measured;
        if (glyphs.length) {
          const first = glyphs[0].getBoundingClientRect();
          const last = glyphs[glyphs.length - 1].getBoundingClientRect();
          measured = last.right - first.left;
        } else {
          measured = node.scrollWidth;
        }
        if (!measured) return;

        // 0.995 : un cheveu de marge pour que le point final ne rase pas le bord
        const next = Math.min((available / measured) * REF * 0.995, 336);
        node.style.fontSize = `${next}px`;
      };

      fitWordmark();
      // les polices web changent la largeur des glyphes : on remesure après
      document.fonts?.ready.then(fitWordmark);
      window.addEventListener("resize", fitWordmark);

      /* ------------------------------------------------------------------ */
      /* 3. MAGNÉTISME DES LETTRES                                           */
      /* ------------------------------------------------------------------ */

      const wordNode = wordmark.current;
      const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
      let onPointerMove;
      let onPointerLeave;

      if (finePointer && !reduced) {
        /*
          `quickTo` plutôt que `gsap.to` : il réutilise le même tween pour
          chaque lettre au lieu d'en créer un par déplacement du curseur, ce
          qui reste fluide même à 120 Hz. Un seul écouteur sur le NOM, pas un
          par caractère.
        */
        const setters = chars.map((char) => ({
          char,
          y: gsap.quickTo(char, "y", { duration: 0.5, ease: "power3.out" }),
          scale: gsap.quickTo(char, "scale", { duration: 0.5, ease: "power3.out" }),
        }));

        // rayon d'influence : au-delà, la lettre est au repos
        const RADIUS = 190;

        onPointerMove = (event) => {
          setters.forEach(({ char, y, scale }) => {
            const rect = char.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const distance = Math.hypot(event.clientX - cx, event.clientY - cy);
            // 0 au bord du rayon, 1 sous le curseur
            const force = Math.max(0, 1 - distance / RADIUS);
            y(-38 * force);
            scale(1 + 0.14 * force);
          });
        };

        onPointerLeave = () => {
          setters.forEach(({ y, scale }) => {
            y(0);
            scale(1);
          });
        };

        wordNode.addEventListener("pointermove", onPointerMove);
        wordNode.addEventListener("pointerleave", onPointerLeave);
      }

      cleanup = () => {
        window.removeEventListener("resize", fitWordmark);
        if (onPointerMove) wordNode.removeEventListener("pointermove", onPointerMove);
        if (onPointerLeave) wordNode.removeEventListener("pointerleave", onPointerLeave);
      };
    }, root);

    return () => {
      cleanup?.();
      ctx.revert();
    };
  }, []);

  const year = new Date().getFullYear();

  return (
    <footer
      ref={root}
      id="contact"
      data-ground="ciel"
      className="relative flex flex-col overflow-hidden px-5 py-16 md:px-10 md:py-20"
    >
      <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="ink-40 mb-4 font-mono text-[11px] uppercase tracking-[0.18em]">
            Un projet
          </p>
          {/*
            Plus de gélules : deux liens texte. Le §09 range le bouton en
            capsule contournée parmi les signatures de sites générés.
          */}
          <a
            href={`mailto:${contact.email}`}
            data-cursor="hover"
            className="link-underline text-d3 font-medium lowercase"
          >
            {contact.email}
          </a>
        </div>

        <nav aria-label="Pied de page" className="flex flex-col gap-3">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              data-cursor="hover"
              className="link-underline w-fit text-[13px] font-bold lowercase"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>

      <div className="grid gap-8 pt-24 text-[13px] font-bold lowercase leading-relaxed sm:grid-cols-2 md:pt-32">
        <div>
          <p className="ink-40 mb-4">adresse</p>
          <address className="not-italic">
            {contact.address.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </address>
        </div>

        <div className="sm:justify-self-end sm:text-right">
          <p className="ink-40 mb-4">contact</p>
          {/* `py-3` : porte la cible tactile à ~40 px sans changer le rythme */}
          <a
            href={`tel:${contact.phone.replace(/\s/g, "")}`}
            data-cursor="hover"
            className="link-underline block py-3"
          >
            {contact.phone}
          </a>
        </div>
      </div>

      {/*
        LE NOM GÉANT.
        Taille mesurée en JS (voir §2 de l'effet) et non fixée en `vw` : la
        marge latérale change selon le point de rupture, donc une échelle en
        `vw` qui tenait sur mobile débordait sur tablette.
      */}
      <h2
        ref={wordmark}
        aria-label="NOVA"
        className="mt-16 w-full whitespace-nowrap pb-[0.04em] font-display font-black leading-[0.78] tracking-[-0.045em]"
      >
        nova.
      </h2>

      <div className="rule-ink mt-6 flex items-center justify-between border-t pt-5 text-[12px] font-bold lowercase">
        <span className="ink-40">© nova {year}</span>
        <a
          href="#top"
          data-cursor="hover"
          className="link-underline -my-3 py-3"
        >
          retour en haut
        </a>
      </div>
    </footer>
  );
}
