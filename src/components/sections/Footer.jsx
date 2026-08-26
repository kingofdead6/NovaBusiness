import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { contact } from "../../data/site";
import MagneticButton from "../MagneticButton";
import { splitChars } from "../../lib/text";
import { initReveals } from "../../lib/reveal";
import TypedHeading from "../TypedHeading";

gsap.registerPlugin(ScrollTrigger);

/**
 * SECTION 12 — PIED DE PAGE
 *
 * Le pied de page bascule du clair au sombre pendant qu'on le traverse, puis
 * le nom géant se compose lettre par lettre, rogné par le bas de l'écran.
 *
 * L'inversion se fait en animant l'OPACITÉ d'un calque charbon posé derrière
 * le contenu, et non en interpolant des variables CSS : GSAP traite une
 * custom property non enregistrée comme une chaîne et ne sait pas interpoler
 * les `rgb()` qu'elle contient. Le texte, lui, passe en clair via une seule
 * variable `--ink` pilotée par la même progression.
 */
export default function Footer() {
  const root = useRef(null);
  const veil = useRef(null);
  const wordmark = useRef(null);

  useEffect(() => {
    if (!root.current) return undefined;

    const ctx = gsap.context(() => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const el = root.current;

      initReveals(el);

      /* ------------------------------------------------------------------ */
      /* 1. INVERSION CLAIR → SOMBRE                                         */
      /* ------------------------------------------------------------------ */

      /*
       * Un seul curseur `t` (0 = clair, 1 = sombre) commande :
       *  - l'opacité du calque charbon
       *  - la couleur de l'encre, via une variable CSS reprise par tout le
       *    contenu (`color-mix` fait le mélange, pas GSAP)
       */
      const invert = { t: 0 };
      const applyInvert = () => {
        if (veil.current) veil.current.style.opacity = String(invert.t);
        el.style.setProperty("--ink", String(invert.t));
      };

      applyInvert();

      if (!reduced) {
        gsap.to(invert, {
          t: 1,
          ease: "none",
          onUpdate: applyInvert,
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            end: "top 15%",
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });
      } else {
        invert.t = 1;
        applyInvert();
      }

      /* ------------------------------------------------------------------ */
      /* 2. COMPOSITION DU NOM                                               */
      /* ------------------------------------------------------------------ */

      const chars = splitChars(wordmark.current);

      if (chars.length) {
        if (reduced) {
          gsap.set(chars, { yPercent: 0, opacity: 1 });
        } else {
          /*
            `fromTo` et NON `set(...)` + `to(...)` : avec deux appels séparés,
            l'état fermé posé par `set` devient aussi la valeur d'arrivée du
            tween quand celui-ci est créé alors que le déclencheur est déjà
            franchi — les lettres restaient bloquées 198 px plus bas, à cheval
            sur l'accroche. `fromTo` fixe explicitement départ ET arrivée.

            Le déclencheur vise le NOM lui-même et non le footer entier : ce
            dernier est très haut, son sommet franchissait le seuil bien avant
            que le mot n'entre à l'écran.
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
              scrollTrigger: {
                trigger: wordmark.current,
                start: "top 95%",
                once: true,
              },
            }
          );
        }
      }

      /* ------------------------------------------------------------------ */
      /* 3. LÉGÈRE DÉRIVE DU NOM                                             */
      /* ------------------------------------------------------------------ */

      /*
       * Le nom ouvre désormais le footer : il n'est plus rogné par le bas de
       * page, donc plus de décalage vertical permanent (l'ancien yPercent 22
       * → 12 servait uniquement à ce cadrage). On garde une dérive minime au
       * scroll pour que le bloc ne soit pas complètement figé.
       *
       * Le mouvement reste porté par GSAP et NON par une classe Tailwind :
       * les deux écriraient `transform` sur le même élément, et l'inline de
       * GSAP écraserait la classe.
       */
      /*
       * Pas de dérive verticale sur le nom : un `yPercent` déplace l'élément
       * SANS réserver d'espace dans le flux, et le mot venait alors recouvrir
       * l'accroche placée juste dessous. Le bloc reste donc calé, et c'est la
       * composition lettre par lettre (§2) qui porte l'animation.
       */
    }, root);

    return () => ctx.revert();
  }, []);

  const year = new Date().getFullYear();

  return (
    <footer
      ref={root}
      id="contact"
      className="footer-invert relative overflow-hidden bg-ivoire pb-10 pt-16 md:pt-20"
    >
      {/* calque d'inversion : c'est son opacité qui bascule, pas une variable */}
      <div
        ref={veil}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-charbon opacity-0"
      />

      {/*
        Nom géant EN OUVERTURE du footer : c'est la première chose qu'on lit,
        le reste du contenu vient se ranger dessous.

        `clamp()` sur mesure plutôt que `text-giant` : le mot fait 14
        caractères, il doit se caler sur la LARGEUR disponible (vw) et non sur
        une échelle pensée pour un mot court, sinon il déborde du cadre.

        Quand le nom était en BAS de page, le conteneur le rognait volontairement
        (`overflow-hidden` + `leading-[0.8]`), ce qui coupait les glyphes une
        fois le bloc remonté en tête. Les deux sont retirés : l'entrée des
        lettres est masquée par leur opacité (0 → 1), pas par un rognage.
      */}
      <div className="relative mb-16 px-2 md:mb-20">
        <h2
          ref={wordmark}
          aria-label="Nova Business"
          className="whitespace-nowrap pb-[0.08em] text-center font-black lowercase leading-[1] tracking-[-0.04em] text-[color:var(--f-fg)]"
          style={{ fontSize: "clamp(2.5rem, 12.5vw, 15rem)" }}
        >
          nova business.
        </h2>
      </div>

      <div className="edge relative">
        {/* ---- Accroche ---- */}
        <div className="max-w-4xl">
          <span className="footer-accent-cycle eyebrow mb-6 block text-[color:var(--f-accent)]">
            Prendre contact
          </span>
          <TypedHeading
            as="h2"
            className="text-d2 font-medium lowercase leading-[0.95] text-[color:var(--f-fg)]"
            text="parlons de votre projet"
            html={
              'parlons de <span class="font-display italic text-[color:var(--f-accent)]">votre projet</span>'
            }
          />
          <p
            data-reveal="fade"
            data-reveal-delay="0.15"
            className="mt-6 max-w-md text-[15px] leading-relaxed text-[color:var(--f-muted)]"
          >
            Un mail, trois lignes sur votre besoin. Réponse sous 24 h ouvrées.
          </p>
        </div>

        {/* ---- Email en grand ---- */}
        <a
          href={`mailto:${contact.email}`}
          data-cursor="hover"
            className="group mt-12 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3 border-t border-[color:var(--f-line)] pt-8 text-[color:var(--f-fg)]"
        >
          {/* `break-all` en secours : l'adresse ne doit jamais déborder */}
          <span className="break-all text-xl font-semibold tracking-tight transition-transform duration-700 ease-nova group-hover:translate-x-2 sm:text-3xl md:text-5xl">
            {contact.email}
          </span>
          <span
            aria-hidden="true"
            className="footer-accent-cycle shrink-0 font-mono text-xl text-[color:var(--f-accent)] transition-transform duration-700 ease-nova group-hover:translate-x-1 md:text-3xl"
          >
            ↗
          </span>
        </a>

        {/* ---- Colonnes ---- */}
        <div className="mt-16 grid gap-12 border-t border-[color:var(--f-line)] pt-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <span
              data-reveal="fade"
              className="eyebrow mb-5 block text-[color:var(--f-faint)]"
            >
              Téléphone
            </span>
            <a
              href={`tel:${contact.phone.replace(/\s/g, "")}`}
              data-cursor="hover"
              className="link-underline font-mono text-[15px] text-[color:var(--f-muted)] transition-colors duration-500 hover:text-[color:var(--f-fg)]"
            >
              {contact.phone}
            </a>

            <div className="mt-9 flex flex-wrap gap-3">
              <MagneticButton href={`mailto:${contact.email}`} variant="solid">
                démarrer un projet
              </MagneticButton>
              <MagneticButton
                href="#realisations"
                variant="outline"
                className="!border-[color:var(--f-line)] !text-[color:var(--f-fg)] hover:!border-[color:var(--f-accent)] hover:!bg-[color:var(--f-accent)] hover:!text-ivoire"
              >
                voir le book
              </MagneticButton>
            </div>
          </div>

          <div className="md:col-span-4">
            <span
              data-reveal="fade"
              className="eyebrow mb-5 block text-[color:var(--f-faint)]"
            >
              Adresse
            </span>
            <address
              data-reveal="lines"
              data-reveal-delay="0.1"
              className="not-italic text-[15px] leading-relaxed text-[color:var(--f-muted)]"
            >
              {contact.address.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
          </div>

          <div className="md:col-span-3">
            <span
              data-reveal="fade"
              className="eyebrow mb-5 block text-[color:var(--f-faint)]"
            >
              Suivre
            </span>
            <ul data-reveal="lines" data-reveal-delay="0.1" className="flex flex-col">
              {contact.socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    data-cursor="hover"
                    className="group flex items-center justify-between border-b border-[color:var(--f-line)] py-3 text-[15px] text-[color:var(--f-muted)] transition-colors duration-500 hover:text-[color:var(--f-fg)]"
                  >
                    <span className="transition-transform duration-500 ease-nova group-hover:translate-x-1">
                      {s.label}
                    </span>
                    <span
                      aria-hidden="true"
                      className="footer-accent-cycle -translate-x-1 font-mono text-xs text-[color:var(--f-accent)] opacity-0 transition-all duration-500 ease-nova group-hover:translate-x-0 group-hover:opacity-100"
                    >
                      →
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ---- Barre légale ---- */}
        <div className="mt-14 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-t border-[color:var(--f-line)] py-7 font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--f-faint)]">
          <span>© {year} Nova Business</span>
          <span className="flex gap-6">
            <a href="/mentions-legales" className="link-underline">
              Mentions légales
            </a>
            <a href="/confidentialite" className="link-underline">
              Confidentialité
            </a>
          </span>
          <a
            href="#top"
            data-cursor="hover"
            className="group flex items-center gap-2 transition-colors duration-500 hover:text-[color:var(--f-fg)]"
          >
            retour en haut
            <span
              aria-hidden="true"
              className="transition-transform duration-500 ease-nova group-hover:-translate-y-1"
            >
              ↑
            </span>
          </a>
        </div>
      </div>

    </footer>
  );
}
