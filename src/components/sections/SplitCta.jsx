import { useRef } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import MagneticButton from "../MagneticButton";
import Media from "../Media";
import cta from "../../assets/People/cta.jpg";

/**
 * SECTION 10 — DOUBLE APPEL À L'ACTION
 * Deux panneaux côte à côte : un devis à gauche (bronze), le book à droite
 * (ivoire + visuel). Entrée / sortie pilotées par le scroll.
 */
export default function SplitCta() {
  const ref = useRef(null);
  const reduce = useReducedMotion();

  // 0 = section arrive en bas de l'écran, 1 = section sort par le haut
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // lissage pour éviter le suivi trop "collé" au scroll
  const p = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.4,
  });

  const xLeft = useTransform(p, [0, 0.35, 0.62, 1], ["-60%", "0%", "0%", "-60%"]);
  const xRight = useTransform(p, [0, 0.35, 0.62, 1], ["60%", "0%", "0%", "60%"]);
  const opacity = useTransform(p, [0, 0.28, 0.7, 1], [0, 1, 1, 0]);
  const scale = useTransform(p, [0, 0.35, 0.62, 1], [0.93, 1, 1, 0.93]);

  const leftStyle = reduce ? undefined : { x: xLeft, opacity, scale };
  const rightStyle = reduce ? undefined : { x: xRight, opacity, scale };

  return (
    <section ref={ref} className="overflow-hidden bg-ivoire py-6 md:py-10">
      <div className="edge grid gap-4 md:grid-cols-2">
        <motion.div
          style={leftStyle}
          className="flex min-h-[340px] flex-col justify-between rounded-[3px] bg-bronze p-8 text-blanc will-change-transform md:p-10"
        >
          <div>
            <h2 className="text-d3 font-black leading-[0.95]">
              Un projet en tête ?<br />
              <span className="font-display font-normal italic">Dites-nous tout.</span>
            </h2>
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-blanc/75">
              Décrivez votre besoin en trois lignes. Réponse sous 24 h ouvrées,
              avec une première estimation de budget et de délai.
            </p>
          </div>

          <MagneticButton href="#contact" variant="light" className="mt-8 self-start">
            demander un devis
          </MagneticButton>
        </motion.div>

        <motion.div
          style={rightStyle}
          className="relative flex min-h-[340px] flex-col justify-between overflow-hidden rounded-[3px] border border-charbon/10 bg-blanc p-8 will-change-transform md:p-10"
        >
          <div className="pointer-events-none absolute -right-12 -top-12 w-56 opacity-20">
            <Media src={cta} ratio="2/2" label="Motif / texture" rounded="rounded-full" />
          </div>

          <div className="relative">
            <h2 className="text-d3 font-black leading-[0.95]">
              Pas encore prêt ?<br />
              <span className="font-display font-normal italic text-bronze">
                Prenez le book.
              </span>
            </h2>
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-pierre">
              12 projets détaillés, nos tarifs de départ et la liste des
              questions à se poser avant de lancer une refonte.
            </p>
          </div>

          <MagneticButton href="#contact" variant="outline" className="relative mt-8 self-start">
            recevoir le book (PDF)
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  );
}