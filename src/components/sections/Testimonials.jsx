import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Media from "../Media";
import { testimonials } from "../../data/site";
import testimonialspic from "../../assets/People/Testimonials.png"
/**
 * SECTION 09 — TÉMOIGNAGES
 * Un seul avis à l'écran, changement automatique toutes les 7 s (interrompu
 * dès qu'on clique). Fond charbon pour créer une respiration entre deux
 * sections ivoire.
 */
export default function Testimonials() {
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => setI((v) => (v + 1) % testimonials.length), 7000);
    return () => clearInterval(id);
  }, [auto]);

  const t = testimonials[i];

  return (
    <section className="relative overflow-hidden bg-charbon py-24 text-ivoire md:py-32">
      <div className="edge">
        <span className="eyebrow mb-12 block text-dore">Ce qu'ils en disent</span>

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
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="text-balance font-display text-2xl leading-snug md:text-[2.4rem] md:leading-[1.15]">
                  « {t.quote} »
                </p>
                <footer className="mt-7 font-mono text-[11px] uppercase tracking-[0.18em] text-ivoire/50">
                  {t.author} — {t.role}
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
                  className={`h-[3px] transition-all duration-500 ease-nova ${
                    idx === i ? "w-14 bg-dore" : "w-7 bg-ivoire/25 hover:bg-ivoire/50"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
