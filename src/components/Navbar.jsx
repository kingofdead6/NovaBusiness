import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { nav, contact } from "../data/site";
import MagneticButton from "./MagneticButton";
import { lenisRef } from "./SmoothScroll";

/**
 * Barre flottante en pilule, centrée, qui se rétracte au scroll descendant
 * et revient au scroll montant (comme sur la référence).
 *
 * Les liens ne sont plus posés à plat dans la pilule : sur TOUS les formats
 * ils vivent désormais derrière un bouton hamburger. Le panneau qui s'ouvre
 * diffère selon la largeur — carte compacte sur mobile (inchangée), rideau
 * plein écran sur ordinateur — mais l'état `open` est unique, ce qui évite
 * deux menus à tenir synchronisés.
 */
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const { scrollY } = useScroll();

  /*
   * On mémorise l'élément qui avait le focus avant l'ouverture pour le lui
   * rendre à la fermeture : sans cela, refermer le menu au clavier renvoie
   * le focus en tête de document et la tabulation repart de zéro.
   */
  const trigger = useRef(null);
  const panel = useRef(null);

  /*
   * La barre ne se rétracte plus au défilement : elle reste visible en
   * permanence. Le seuil pilote désormais deux choses à la fois — le fond
   * qui se densifie ET la LARGEUR de la pilule.
   */
  useMotionValueEvent(scrollY, "change", (y) => {
    setSolid(y > 40);
  });

  /*
   * Rideau ouvert : la page derrière ne doit plus défiler, et `Échap` doit
   * refermer. Les deux effets sont liés au même état, donc réunis ici.
   *
   * Le gel passe par `lenis.stop()` et NON par `overflow: hidden` : le
   * défilement lisse anime la position lui-même, il ignorerait purement et
   * simplement la propriété. `overflow` reste posé en complément pour les
   * cas où Lenis n'existe pas (mouvement réduit) — d'où le `?.`.
   */
  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    lenisRef.current?.stop();
    window.addEventListener("keydown", onKeyDown);

    /*
     * Le focus part sur le panneau lui-même (et non sur le premier lien) :
     * un lecteur d'écran annonce ainsi le menu avant d'énoncer son contenu.
     */
    panel.current?.focus();

    return () => {
      root.style.overflow = previous;
      lenisRef.current?.start();
      window.removeEventListener("keydown", onKeyDown);
      trigger.current?.focus();
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      {/*
        En haut de page la pilule est COMPACTE (elle ne porte que le logo, le
        bouton et le hamburger) ; dès que l'on défile elle s'étire jusqu'à sa
        largeur pleine. Le menu ouvert force l'état large, sinon la barre se
        rétrécirait sous le rideau au moment où l'on remonte en haut.

        C'est `maxWidth` que l'on anime, et non `width` : la largeur reste
        exprimée en pourcentage de l'écran (`w-[calc(100%-2rem)]`), donc la
        pilule ne peut jamais déborder sur les petits écrans — le plafond
        seul se déplace.
      */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{
          y: 0,
          opacity: 1,
          maxWidth: solid || open ? "42rem" : "22rem",
        }}
        transition={{
          y: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
          opacity: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
          maxWidth: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
        }}
        style={{ x: "-50%" }}
        className="fixed left-1/2 top-4 z-50 w-[calc(100%-6rem)] md:top-6 md:w-[calc(100%-2rem)]"
      >
        <div
          data-menu-open={open ? "true" : undefined}
          className={`navbar-corps relative flex items-center justify-between rounded-full py-2 pl-4 pr-2 transition-all duration-500 ease-nova md:pl-6 ${
            solid
              ? "navbar-pilule navbar-pilule--dense rule-ink border backdrop-blur-md"
              : "navbar-pilule border border-transparent backdrop-blur-sm"
          }`}
        >
          <a
            href="#top"
            data-cursor="hover"
            className="ink flex items-center gap-2 py-2"
            aria-label="NOVA, retour en haut"
          >
            {/*
              La marque est une ÉTOILE dessinée (§05 : « un point avec quatre
              à six rayons dessinés »), au trait, en `currentColor` : elle
              s'inverse donc avec le fond sans traitement particulier. Les
              anciens tracés bronze/doré appartenaient à la palette d'avant.
            */}
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <line x1="12" y1="2" x2="12" y2="22" strokeWidth="1.1" />
              <line x1="2" y1="12" x2="22" y2="12" strokeWidth="1.1" />
              <line x1="5" y1="5" x2="19" y2="19" strokeWidth="0.7" />
              <line x1="19" y1="5" x2="5" y2="19" strokeWidth="0.7" />
            </svg>
            <span className="text-[15px] font-extrabold uppercase tracking-tight">
              Nova
            </span>
          </a>

          <div className="flex items-center gap-2">
            <MagneticButton
              href="#contact"
              variant="solid"
              strength={0.25}
              className="hidden !px-5 !py-2.5 !text-[11px] md:inline-flex"
            >
              parlons-en
            </MagneticButton>

            {/*
              Le bouton n'est plus `md:hidden` : c'est désormais l'unique
              entrée vers la navigation, quelle que soit la largeur.
            */}
            <button
              ref={trigger}
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="menu-principal"
              aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
              data-cursor="hover"
              className="rule-ink group flex h-10 w-10 items-center justify-center rounded-full border transition-colors duration-300"
            >
              <span className="relative block h-3 w-4">
                <span
                  className={`absolute left-0 block h-[1.5px] w-4 bg-[var(--ground-ink)] transition-all duration-300 ${
                    open ? "top-1.5 rotate-45" : "top-0"
                  }`}
                />
                <span
                  className={`absolute left-0 block h-[1.5px] w-4 bg-[var(--ground-ink)] transition-all duration-300 ${
                    open ? "top-1.5 -rotate-45" : "top-3"
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <>
            {/* ---------------- MOBILE : rideau plein écran ---------------- */}
            {/*
              Le panneau prend TOUT l'écran, comme sur ordinateur : une carte
              compacte de 4 liens ne portait pas le même poids que le rideau,
              et le téléphone se retrouvait avec une navigation au rabais.

              Il porte aussi le CONTACT : le bouton « parlons-en » est masqué
              sous 768 px pour que la pilule tienne, si bien qu'il n'existait
              plus AUCUN chemin vers le contact depuis le téléphone.
            */}
            <motion.div
              key="menu-mobile"
              initial={{ clipPath: "inset(0 0 100% 0)" }}
              animate={{ clipPath: "inset(0 0 0% 0)" }}
              exit={{ clipPath: "inset(0 0 100% 0)" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-0 z-40 flex flex-col bg-ciel text-contraste md:hidden"
            >
              <div className="flex h-full flex-col justify-between px-5 pb-10 pt-28">
                <nav aria-label="Sections du site">
                  <ul className="flex flex-col">
                    {nav.map((item, i) => (
                      <motion.li
                        key={item.href}
                        initial={{ opacity: 0, y: 26 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 14, transition: { duration: 0.18 } }}
                        transition={{
                          duration: 0.6,
                          delay: 0.12 + i * 0.07,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className="border-b border-contraste/10"
                      >
                        <a
                          href={item.href}
                          onClick={close}
                          className="flex items-baseline gap-4 py-4"
                        >
                          <span className="font-mono text-[10px] tabular-nums text-contraste/35">
                            0{i + 1}
                          </span>
                          <span className="font-display text-d3 font-black lowercase tracking-tight">
                            {item.label}
                          </span>
                        </a>
                      </motion.li>
                    ))}
                  </ul>
                </nav>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="text-[13px] font-bold lowercase"
                >
                  <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-contraste/45">
                    Un projet
                  </p>
                  <a
                    href={`mailto:${contact.email}`}
                    onClick={close}
                    className="link-underline block text-contraste"
                  >
                    {contact.email}
                  </a>
                  <a
                    href={`tel:${contact.phone.replace(/\s/g, "")}`}
                    onClick={close}
                    className="link-underline mt-1 block text-contraste/70"
                  >
                    {contact.phone}
                  </a>
                </motion.div>
              </div>
            </motion.div>

            {/* ---------------- ORDINATEUR : rideau plein écran ---------------- */}
            {/*
              Le panneau se déploie depuis le haut via `clipPath` plutôt qu'en
              translation : le rideau reste ancré au sommet de l'écran et
              « descend » sur la page, au lieu de glisser comme un bloc — et
              rien ne déborde pendant l'animation.
            */}
            <motion.div
              key="menu-desktop"
              id="menu-principal"
              ref={panel}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation principale"
              initial={{ clipPath: "inset(0 0 100% 0)" }}
              animate={{ clipPath: "inset(0 0 0% 0)" }}
              exit={{ clipPath: "inset(0 0 100% 0)" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-0 z-40 hidden bg-ciel text-contraste outline-none md:block"
            >
              {/*
                `pt-28` dégage la pilule flottante, qui reste au-dessus
                (z-50) pour que le hamburger serve aussi de bouton « fermer ».
              */}
              <div className="edge flex h-full flex-col justify-between pb-10 pt-28">
                <nav aria-label="Sections du site">
                  <ul className="flex flex-col">
                    {nav.map((item, i) => (
                      <motion.li
                        key={item.href}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20, transition: { duration: 0.2 } }}
                        transition={{
                          duration: 0.7,
                          delay: 0.1 + i * 0.07,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className="border-b border-contraste/10"
                      >
                        <a
                          href={item.href}
                          onClick={close}
                          data-cursor="hover"
                          className="menu-row group flex items-baseline gap-6 py-5 lg:py-6"
                        >
                          <span className="font-mono text-[11px] tabular-nums text-contraste/35">
                            0{i + 1}
                          </span>
                          {/*
                            Le libellé est doublé : l'exemplaire du dessous
                            monte pendant que celui du dessus s'échappe, ce qui
                            donne le « roulement » de la ligne au survol. Le
                            second est masqué aux lecteurs d'écran pour ne pas
                            annoncer deux fois le même lien.
                          */}
                          <span className="menu-label relative block overflow-hidden">
                            <span className="menu-label-top block text-d3 font-black lowercase tracking-tight">
                              {item.label}
                            </span>
                            <span
                              aria-hidden="true"
                              className="menu-label-bottom absolute inset-0 block text-d3 font-black lowercase tracking-tight text-clair"
                            >
                              {item.label}
                            </span>
                          </span>
                          {/*
                            Plus de glyphe flèche : un TRAIT qui s'allonge au
                            survol. C'est le langage de la planche gravée
                            (§05, tout se joue au trait) et cela évite un
                            caractère pictographique.
                          */}
                          <span
                            aria-hidden="true"
                            className="menu-arrow ml-auto h-px w-10 self-center bg-contraste/40"
                          />
                        </a>
                      </motion.li>
                    ))}
                  </ul>
                </nav>

                {/*
                  Pied du rideau : les coordonnées, pour que le menu ouvert
                  reste une page utile et non une simple liste de liens.
                */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  transition={{ duration: 0.6, delay: 0.35 }}
                  className="flex flex-wrap items-end justify-between gap-6 text-[13px] font-bold lowercase"
                >
                  <div className="text-contraste/45">
                    <p className="mb-2">contact</p>
                    <a
                      href={`mailto:${contact.email}`}
                      onClick={close}
                      data-cursor="hover"
                      className="link-underline block text-contraste"
                    >
                      {contact.email}
                    </a>
                    <a
                      href={`tel:${contact.phone.replace(/\s/g, "")}`}
                      onClick={close}
                      data-cursor="hover"
                      className="link-underline mt-1 block text-contraste"
                    >
                      {contact.phone}
                    </a>
                  </div>

                  <ul className="flex gap-6">
                    {contact.socials.map((social) => (
                      <li key={social.label}>
                        <a
                          href={social.href}
                          onClick={close}
                          data-cursor="hover"
                          className="link-underline text-contraste/70 transition-colors hover:text-contraste"
                        >
                          {social.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
