import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { contact } from "../../data/site";
import { splitChars } from "../../lib/text";

gsap.registerPlugin(ScrollTrigger);

/**
 * SECTION 12 — PIED DE PAGE
 *
 * Bloc plein bronze, épuré : le logo et deux boutons en haut, l'adresse en
 * colonne, puis le nom géant en italique qui occupe toute la largeur et une
 * barre de bas de page (année + email).
 *
 * Pas de titre d'accroche, pas de liens sociaux, pas de barre légale : la
 * composition repose entièrement sur le contraste d'échelle entre les petites
 * mentions et le mot géant.
 *
 * Le nom se compose lettre par lettre à l'entrée dans l'écran (`splitChars`).
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

      if (reduced) {
        gsap.set(chars, { yPercent: 0, opacity: 1 });
        return;
      }

      /*
        `fromTo` et NON `set(...)` + `to(...)` : avec deux appels séparés,
        l'état fermé posé par `set` devient aussi la valeur d'arrivée du tween
        lorsque celui-ci est créé alors que le déclencheur est déjà franchi —
        les lettres restent alors bloquées en position basse.

        Le déclencheur vise le NOM lui-même et non le footer entier : ce
        dernier est très haut, son sommet franchirait le seuil bien avant que
        le mot n'entre à l'écran.
      */
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
          /*
            `top bottom` et non `top 95%` : le pied de page fait toute la
            hauteur de l'écran, et sur mobile le nom se retrouve DÉJÀ au-dessus
            de la ligne des 95 % quand on arrive en bas de page — le
            déclencheur n'était jamais franchi et les lettres restaient
            invisibles. Avec `top bottom` il suffit que le mot entre par le bas
            de la fenêtre.
          */
          scrollTrigger: {
            trigger: wordmark.current,
            start: "top bottom",
            once: true,
          },
        }
      );
      /* ------------------------------------------------------------------ */
      /* 3. AJUSTEMENT DU NOM À LA LARGEUR                                   */
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
          Largeur RÉELLEMENT disponible pour le texte : `clientWidth` du parent
          inclut son rembourrage, que les lettres ne peuvent pas occuper. On le
          retranche, sans quoi le mot dépasse systématiquement d'environ 5 à
          10 %.
        */
        const parent = node.parentElement;
        const pcs = getComputedStyle(parent);
        const available =
          parent.clientWidth -
          parseFloat(pcs.paddingLeft) -
          parseFloat(pcs.paddingRight);
        if (!available || available <= 0) return;

        /*
          On mesure l'ENCRE réelle (du bord gauche de la 1re lettre au bord
          droit de la dernière) et non `scrollWidth` : `splitChars` a déjà
          emballé chaque caractère dans un span inline-block, et la largeur de
          défilement du conteneur ne reflète alors plus celle du texte.

          Les lettres sont translatées verticalement pendant l'animation, ce
          qui ne change pas leur position horizontale : la mesure reste juste.
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
      cleanup = () => window.removeEventListener("resize", fitWordmark);
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
      className="relative flex flex-col overflow-hidden bg-bronze px-5 py-10 text-ivoire md:px-10 md:py-12"
    >
      {/* ---------------- HAUT : logo + actions ---------------- */}
      <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
        {/*
          Le logo fourni est un JPEG (fond ivoire, pas de transparence) : posé
          tel quel sur le bronze il afficherait un rectangle blanc. On l'assume
          donc comme une CARTE ivoire — c'est net et volontaire, là où un
          détourage approximatif se verrait.
        */}
        <a
          href="#top"
          data-cursor="hover"
          aria-label="Nova Business, retour en haut"
          className="inline-block w-fit rounded-[4px] bg-ivoire p-3 transition-transform duration-500 ease-nova hover:-translate-y-0.5 md:p-4"
        >
          <img
            src="/Logo.jpg"
            alt="Nova Business"
            className="block h-9 w-auto md:h-12"
          />
        </a>

        <div className="flex flex-col gap-3 sm:flex-row md:items-center">
          <a
            href="#realisations"
            data-cursor="hover"
            className="rounded-full border border-ivoire/70 px-7 py-3 text-center text-[13px] font-bold lowercase transition-colors duration-500 ease-nova hover:border-ivoire hover:bg-ivoire hover:text-bronze"
          >
            nos réalisations
          </a>
          <a
            href={`mailto:${contact.email}`}
            data-cursor="hover"
            className="rounded-full bg-ivoire px-7 py-3 text-center text-[13px] font-bold lowercase text-bronze transition-colors duration-500 ease-nova hover:bg-blanc"
          >
            parlons-en
          </a>
        </div>
      </div>

      {/* ---------------- COORDONNÉES ---------------- */}
      {/*
        La hauteur du pied de page est dictée par son CONTENU (pas de
        `min-h-[100svh]`) : sur grand écran cela évitait un large vide au
        milieu, le bloc était étiré pour rien. Les espacements fixes donnent un
        rythme régulier d'un écran à l'autre.
      */}
      <div className="grid gap-8 pt-24 text-[13px] font-bold lowercase leading-relaxed sm:grid-cols-2 md:pt-32">
        <div>
          <p className="mb-4 text-ivoire/55">adresse</p>
          <address className="not-italic">
            {contact.address.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </address>
        </div>

        <div className="sm:justify-self-end sm:text-right">
          <p className="mb-4 text-ivoire/55">contact</p>
          {/* `py-2` : porte la cible tactile à ~40 px sans changer le rythme visuel */}
          <a
            href={`tel:${contact.phone.replace(/\s/g, "")}`}
            data-cursor="hover"
            className="block py-3 transition-opacity duration-500 hover:opacity-70"
          >
            {contact.phone}
          </a>
          <a
            href={`mailto:${contact.email}`}
            data-cursor="hover"
            className="block py-3 transition-opacity duration-500 hover:opacity-70"
          >
            {contact.email}
          </a>
        </div>
      </div>

      {/* ---------------- NOM GÉANT ---------------- */}
      {/*
        Le nom est la pièce maîtresse : gras plein (`font-black`), interlettrage
        resserré et taille calée sur la LARGEUR de l'écran pour qu'il remplisse
        la ligne d'un bord à l'autre.

        `min(…vw, …rem)` plutôt que `clamp()` : au-delà d'un très grand écran on
        plafonne, mais en dessous le mot suit fidèlement la largeur — il n'y a
        jamais de « trou » à droite.
      */}
      <h2
        ref={wordmark}
        aria-label="Nova Business"
        /*
          La taille est mesurée en JS (voir §3 de l'effet) et non fixée en
          `vw` : la marge latérale change selon le point de rupture, donc une
          échelle en `vw` qui tenait sur mobile débordait sur tablette. On part
          de la largeur RÉELLE du conteneur, le mot remplit toujours la ligne
          au pixel près.
        */
        className="mt-10 w-full whitespace-nowrap pb-[0.04em] font-black leading-[0.78] tracking-[-0.045em]"
      >
        nova business.
      </h2>

      {/* ---------------- BARRE DE BAS DE PAGE ---------------- */}
      <div className="mt-6 flex items-center justify-between border-t border-ivoire/20 pt-5 text-[12px] font-bold lowercase text-ivoire/70">
        <span>@nova {year}</span>
        <a
          href="#top"
          data-cursor="hover"
          className="-my-3 py-3 transition-opacity duration-500 hover:text-ivoire hover:opacity-100"
        >
          retour en haut ↑
        </a>
      </div>
    </footer>
  );
}
