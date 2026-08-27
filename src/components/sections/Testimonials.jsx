import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Media from "../Media";
import useReveal from "../../hooks/useReveal";
import WriteIn from "../WriteIn";
import { testimonials } from "../../data/site";
import testimonialspic from "../../assets/People/Testimonials.png"
/**
 * SECTION 09 — TÉMOIGNAGES
 * Un seul avis à l'écran, changement automatique toutes les 7 s (interrompu
 * dès qu'on clique). Fond charbon pour créer une respiration entre deux
 * sections ivoire.
 */
export default function Testimonials() {
  const root = useReveal();
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => setI((v) => (v + 1) % testimonials.length), 7000);
    return () => clearInterval(id);
  }, [auto]);

  const t = testimonials[i];

  return (
    <section
      ref={root}
      className="relative overflow-hidden bg-charbon py-24 text-ivoire md:py-32"
    >
      <div className="edge">
        <span data-reveal="fade" className="eyebrow mb-12 block text-dore">
          Ce qu'ils en disent
        </span>

        <div className="grid items-center gap-12 md:grid-cols-[0.4fr_1fr] md:gap-16">
          <div className="w-40 md:w-full md:max-w-[260px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={t.author}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <Media
                  src={testimonialspic}
                  ratio="2/2"
                  tone="dark"
                  rounded="rounded-full"
                  label={`Portrait — ${t.author}`}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          <div>
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={t.quote}
                /* simple fondu : le mouvement est porté par <WriteIn>,
                   qui écrit la citation mot à mot à chaque rotation */
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="text-balance font-display text-2xl leading-snug md:text-[2.4rem] md:leading-[1.15]">
                  <WriteIn text={`« ${t.quote} »`} />
                </p>
                <footer className="mt-7 font-mono text-[11px] uppercase tracking-[0.18em] text-ivoire/50">
                  <WriteIn
                    text={`${t.author} — ${t.role}`}
                    stagger={0.02}
                    delay={0.35}
                  />
                </footer>
              </motion.blockquote>
            </AnimatePresence>

            <div className="mt-10 flex gap-2" role="tablist" aria-label="Témoignages">
              {testimonials.map((item, idx) => (
                <button
                  key={item.author}
                  type="button"
                  role="tab"
                  aria-selected={idx === i}
                  aria-label={`Témoignage de ${item.author}`}
                  data-cursor="hover"
                  onClick={() => {
                    setI(idx);
                    setAuto(false);
                  }}
                  /*
                    La barre visible fait 3 px, mais la CIBLE tactile doit
                    atteindre ~44 px : on ajoute du rembourrage vertical
                    transparent (`py-5`) et on dessine le trait avec un
                    pseudo-fond via `before:`.
                  */
                  className={`group relative flex h-11 items-center transition-all duration-500 ease-nova ${
                    idx === i ? "w-14" : "w-7"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`block h-[3px] w-full transition-colors duration-500 ${
                      idx === i ? "bg-dore" : "bg-ivoire/25 group-hover:bg-ivoire/50"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
