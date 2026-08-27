import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { contact } from "../../data/site";
import { splitChars } from "../../lib/text";
import logo from "../../assets/Logo.jpg"
gsap.registerPlugin(ScrollTrigger);


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

      /* ------------------------------------------------------------------ */
      /* 4. MAGNÉTISME DES LETTRES                                           */
      /* ------------------------------------------------------------------ */

      /*
       * Les lettres proches du curseur se soulèvent et s'éclairent, avec une
       * décroissance douce selon la distance — le mot « respire » sous la
       * souris au lieu de réagir lettre par lettre.
       *
       * Un seul écouteur posé sur le NOM (et non un par caractère) : il y a
       * une quinzaine de spans, et `pointermove` par lettre multiplierait les
       * appels sans rien apporter.
       *
       * `quickTo` plutôt que `gsap.to` : il réutilise le même tween pour
       * chaque lettre au lieu d'en créer un par déplacement du curseur, ce
       * qui reste fluide même à 120 Hz.
       */
      const wordNode = wordmark.current;
      const setters = chars.map((char) => ({
        char,
        y: gsap.quickTo(char, "y", { duration: 0.5, ease: "power3.out" }),
        scale: gsap.quickTo(char, "scale", { duration: 0.5, ease: "power3.out" }),
      }));

      // rayon d'influence : au-delà, la lettre est au repos
      const RADIUS = 190;

      const onPointerMove = (event) => {
        setters.forEach(({ char, y, scale }) => {
          const rect = char.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const distance = Math.hypot(event.clientX - cx, event.clientY - cy);
          // 0 au bord du rayon, 1 sous le curseur
          const force = Math.max(0, 1 - distance / RADIUS);
          y(-38 * force);
          scale(1 + 0.14 * force);
          char.classList.toggle("is-lit", force > 0.12);
        });
      };

      const onPointerLeave = () => {
        setters.forEach(({ char, y, scale }) => {
          y(0);
          scale(1);
          char.classList.remove("is-lit");
        });
      };

      /*
       * `(hover: hover)` : sur un écran tactile un `pointermove` isolé
       * laisserait les lettres soulevées sans jamais recevoir de « leave ».
       */
      const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
      if (finePointer) {
        wordNode.addEventListener("pointermove", onPointerMove);
        wordNode.addEventListener("pointerleave", onPointerLeave);
      }

      /* ------------------------------------------------------------------ */
      /* 5. INVERSION DES COULEURS À L'ENTRÉE                                */
      /* ------------------------------------------------------------------ */

      /*
       * Le pied de page se présente en négatif (fond ivoire, encre bronze)
       * puis rejoint ses couleurs normales à mesure qu'il monte à l'écran.
       *
       * On anime UNE variable, `--f-mix` (0 = inversé, 1 = normal) : la
       * feuille de styles en dérive le fond, l'encre, les bordures et les
       * butées du dégradé du nom. Animer les couleurs une par une depuis JS
       * imposerait de connaître ici chaque élément du bloc.
       *
       * `end: "top center"` : la bascule est CONSOMMÉE dès que le haut du
       * pied de page atteint le milieu de l'écran. Elle sert d'entrée en
       * matière ; la prolonger jusqu'en bas laisserait le bloc à demi
       * inversé pendant toute sa lecture.
       */
      const invert = gsap.fromTo(
        root.current,
        { "--f-mix": 0, "--f-inv": 1 },
        {
          "--f-mix": 1,
          "--f-inv": 0,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top bottom",
            end: "top center",
            scrub: 0.8,
          },
        }
      );

      /* ------------------------------------------------------------------ */
      /* 6. PARALLAXE DU NOM                                                 */
      /* ------------------------------------------------------------------ */

      /*
       * Le nom monte légèrement pendant que le pied de page défile : le bloc
       * gagne de la profondeur sans qu'aucun élément ne change de place au
       * repos (le décalage revient à zéro à mi-parcours).
       */
      const parallax = gsap.fromTo(
        wordNode,
        { yPercent: 6 },
        {
          yPercent: -4,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top bottom",
            end: "bottom bottom",
            scrub: 0.6,
          },
        }
      );

      cleanup = () => {
        window.removeEventListener("resize", fitWordmark);
        if (finePointer) {
          wordNode.removeEventListener("pointermove", onPointerMove);
          wordNode.removeEventListener("pointerleave", onPointerLeave);
        }
        parallax.scrollTrigger?.kill();
        parallax.kill();
        invert.scrollTrigger?.kill();
        invert.kill();
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
      className="footer-invert footer-aurora relative flex flex-col overflow-hidden px-5 py-10 md:px-10 md:py-12"
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
          className="footer-logo inline-block w-fit rounded-[4px] bg-ivoire p-3 ease-nova hover:-translate-y-0.5 md:p-4"
        >
          <img
            src={logo}
            alt="Nova Business"
            className="block h-9 w-auto md:h-12"
          />
        </a>

        <div className="flex flex-col gap-3 sm:flex-row md:items-center">
          <a
            href="#realisations"
            data-cursor="hover"
            className="footer-shine rounded-full border border-ivoire/70 px-7 py-3 text-center text-[13px] font-bold lowercase transition-colors duration-500 ease-nova hover:border-ivoire hover:bg-ivoire hover:text-bronze"
          >
            nos réalisations
          </a>
          <a
            href={`mailto:${contact.email}`}
            data-cursor="hover"
            className="footer-shine footer-shine-dark rounded-full bg-ivoire px-7 py-3 text-center text-[13px] font-bold lowercase text-bronze transition-colors duration-500 ease-nova hover:bg-blanc"
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
            className="footer-link footer-link-right block py-3 transition-opacity duration-500 hover:opacity-70"
          >
            {contact.phone}
          </a>
          <a
            href={`mailto:${contact.email}`}
            data-cursor="hover"
            className="footer-link footer-link-right block py-3 transition-opacity duration-500 hover:opacity-70"
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
        className="footer-wordmark mt-10 w-full whitespace-nowrap pb-[0.04em] font-black leading-[0.78] tracking-[-0.045em]"
      >
        nova business.
      </h2>

      {/* ---------------- BARRE DE BAS DE PAGE ---------------- */}
      <div className="footer-rule mt-6 flex items-center justify-between border-t border-ivoire/20 pt-5 text-[12px] font-bold lowercase text-ivoire/70">
        <span>@nova {year}</span>
        <a
          href="#top"
          data-cursor="hover"
          className="footer-top -my-3 py-3 transition-opacity duration-500 hover:text-ivoire hover:opacity-100"
        >
          retour en haut <span className="footer-top-arrow">↑</span>
        </a>
      </div>
    </footer>
  );
}
