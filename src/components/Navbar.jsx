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
          className={`relative flex items-center justify-between rounded-full py-2 pl-4 pr-2 transition-all duration-500 ease-nova md:pl-6 ${
            solid
              ? "bg-ivoire/85 shadow-[0_10px_40px_-18px_rgba(28,28,28,0.5)] backdrop-blur-md"
              : "bg-ivoire/40 backdrop-blur-sm"
          }`}
        >
          <a
            href="#top"
            data-cursor="hover"
            className="flex items-center gap-2 py-2 text-charbon"
            aria-label="Nova Business, retour en haut"
          >
            <svg viewBox="0 0 120 120" className="h-7 w-7" fill="none" aria-hidden="true">
              <path d="M96 34a48 48 0 1 0 -6 62" stroke="#8A6045" strokeWidth="6" strokeLinecap="round" />
              <path
                d="M28 82c4-22 12-28 16-14s12 10 20-4 14-16 24-20"
                stroke="#8A6045"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <path d="M88 30l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#C9A86A" />
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
              className="group flex h-10 w-10 items-center justify-center rounded-full border border-charbon/15 transition-colors duration-300 hover:border-charbon/40"
            >
              <span className="relative block h-3 w-4">
                <span
                  className={`absolute left-0 block h-[1.5px] w-4 bg-charbon transition-all duration-300 ${
                    open ? "top-1.5 rotate-45" : "top-0"
                  }`}
                />
                <span
                  className={`absolute left-0 block h-[1.5px] w-4 bg-charbon transition-all duration-300 ${
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
            {/* ---------------- MOBILE : carte compacte (inchangée) ---------------- */}
            <motion.div
              key="menu-mobile"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-x-4 top-20 z-40 rounded-3xl bg-charbon p-6 text-ivoire md:hidden"
            >
              <ul className="flex flex-col gap-1">
                {nav.map((item, i) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.06 * i + 0.1 }}
                  >
                    <a
                      href={item.href}
                      onClick={close}
                      className="block border-b border-ivoire/10 py-3 text-2xl font-semibold lowercase tracking-tight"
                    >
                      {item.label}
                    </a>
                  </motion.li>
                ))}
              </ul>
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
              className="fixed inset-0 z-40 hidden bg-charbon text-ivoire outline-none md:block"
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
                        className="border-b border-ivoire/10"
                      >
                        <a
                          href={item.href}
                          onClick={close}
                          data-cursor="hover"
                          className="menu-row group flex items-baseline gap-6 py-5 lg:py-6"
                        >
                          <span className="font-mono text-[11px] tabular-nums text-ivoire/35">
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
                              className="menu-label-bottom absolute inset-0 block text-d3 font-black lowercase tracking-tight text-dore"
                            >
                              {item.label}
                            </span>
                          </span>
                          <span className="menu-arrow ml-auto self-center text-xl text-ivoire/40">
                            ↗
                          </span>
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
                  <div className="text-ivoire/45">
                    <p className="mb-2">contact</p>
                    <a
                      href={`mailto:${contact.email}`}
                      onClick={close}
                      data-cursor="hover"
                      className="link-underline block text-ivoire"
                    >
                      {contact.email}
                    </a>
                    <a
                      href={`tel:${contact.phone.replace(/\s/g, "")}`}
                      onClick={close}
                      data-cursor="hover"
                      className="link-underline mt-1 block text-ivoire"
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
                          className="link-underline text-ivoire/70 transition-colors hover:text-ivoire"
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
