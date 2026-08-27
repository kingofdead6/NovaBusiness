import { useState } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { nav } from "../data/site";
import MagneticButton from "./MagneticButton";

/**
 * Barre flottante en pilule, centrée, qui se rétracte au scroll descendant
 * et revient au scroll montant (comme sur la référence).
 */
export default function Navbar() {
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setSolid(y > 40);
    if (open) return;
    setHidden(y > prev && y > 240);
  });

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: hidden ? -100 : 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{ x: "-50%" }}
        className="fixed left-1/2 top-4 z-50 w-[calc(100%-6rem)] max-w-2xl md:top-6 md:w-[calc(100%-2rem)]"
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

          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 md:flex" aria-label="Navigation principale">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                data-cursor="hover"
                /* `py-3` : cible tactile confortable, sans changer le rythme visuel */
                className="link-underline py-3 text-[13px] font-medium text-charbon/75 transition-colors hover:text-charbon"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <MagneticButton
              href="#contact"
              variant="solid"
              strength={0.25}
              className="hidden !px-5 !py-2.5 !text-[11px] md:inline-flex"
            >
              parlons-en
            </MagneticButton>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
              data-cursor="hover"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-charbon/15 md:hidden"
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
          <motion.div
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
                    onClick={() => setOpen(false)}
                    className="block border-b border-ivoire/10 py-3 text-2xl font-semibold lowercase tracking-tight"
                  >
                    {item.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
