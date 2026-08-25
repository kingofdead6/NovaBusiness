import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { contact } from "../../data/site";
import MagneticButton from "../MagneticButton";
import { splitChars } from "../../lib/text";

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
        // état fermé posé AVANT tout rendu animé : évite le flash de texte
        // déjà en place au chargement
        gsap.set(chars, { yPercent: 110, opacity: 0 });

        if (reduced) {
          gsap.set(chars, { yPercent: 0, opacity: 1 });
        } else {
          gsap.to(chars, {
            yPercent: 0,
            opacity: 1,
            duration: 1.1,
            ease: "expo.out",
            stagger: 0.03,
            scrollTrigger: { trigger: el, start: "top 55%", once: true },
          });
        }
      }

      /* ------------------------------------------------------------------ */
      /* 3. LÉGÈRE REMONTÉE DU NOM                                           */
      /* ------------------------------------------------------------------ */

      /*
       * Le décalage vers le bas (le mot est rogné) est porté par GSAP et NON
       * par une classe Tailwind : les deux écriraient `transform` sur le même
       * élément, et l'inline de GSAP écraserait la classe.
       */
      if (wordmark.current) {
        if (reduced) {
          gsap.set(wordmark.current, { yPercent: 14 });
        } else {
          gsap.fromTo(
            wordmark.current,
            { yPercent: 22 },
            {
              yPercent: 12,
              ease: "none",
              scrollTrigger: {
                trigger: el,
                start: "top bottom",
                end: "bottom bottom",
                scrub: true,
              },
            }
          );
        }
      }
    }, root);

    return () => ctx.revert();
  }, []);

  const year = new Date().getFullYear();

  return (
    <footer
      ref={root}
      id="contact"
      className="footer-invert relative overflow-hidden bg-ivoire pt-24 md:pt-32"
    >
      {/* calque d'inversion : c'est son opacité qui bascule, pas une variable */}
      <div
        ref={veil}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-charbon opacity-0"
      />

      <div className="edge relative">
        {/* ---- Accroche ---- */}
        <div className="max-w-4xl">
          <span className="footer-accent-cycle eyebrow mb-6 block text-[color:var(--f-accent)]">
            Prendre contact
          </span>
          <h2 className="text-d2 font-medium lowercase leading-[0.95] text-[color:var(--f-fg)]">
            parlons de{" "}
            <span className="font-display italic text-[color:var(--f-accent)]">
              votre projet
            </span>
          </h2>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-[color:var(--f-muted)]">
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
            <span className="eyebrow mb-5 block text-[color:var(--f-faint)]">
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
            <span className="eyebrow mb-5 block text-[color:var(--f-faint)]">
              Adresse
            </span>
            <address className="not-italic text-[15px] leading-relaxed text-[color:var(--f-muted)]">
              {contact.address.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
          </div>

          <div className="md:col-span-3">
            <span className="eyebrow mb-5 block text-[color:var(--f-faint)]">
              Suivre
            </span>
            <ul className="flex flex-col">
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

      {/*
        Nom géant, volontairement rogné par le bas.

        `clamp()` sur mesure plutôt que `text-giant` : le mot fait 14
        caractères, il doit se caler sur la LARGEUR disponible (vw) et non sur
        une échelle pensée pour un mot court, sinon il déborde du cadre au
        lieu d'être rogné proprement.
      */}
      <div className="relative mt-6 overflow-hidden px-2">
        <h2
          ref={wordmark}
          aria-label="Nova Business"
          className="whitespace-nowrap text-center font-black lowercase leading-[0.8] tracking-[-0.04em] text-[color:var(--f-fg)]"
          style={{ fontSize: "clamp(2.5rem, 12.5vw, 15rem)" }}
        >
          nova business.
        </h2>
      </div>
    </footer>
  );
}
