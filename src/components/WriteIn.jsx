import { motion } from "framer-motion";

/**
 * Texte qui « s'écrit » mot à mot.
 *
 * Contrairement aux révélations au scroll (lib/reveal.js) qui ne jouent
 * qu'une fois, ce composant rejoue son animation à chaque changement de
 * `text` — indispensable pour les blocs qui tournent (témoignages).
 *
 * Passez une `key` qui change avec le texte pour que React remonte le bloc.
 */
export default function WriteIn({
  text,
  className = "",
  stagger = 0.03,
  delay = 0,
  once = false,
}) {
  const words = String(text).split(/\s+/).filter(Boolean);

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: stagger, delayChildren: delay } },
  };

  const word = {
    hidden: { y: "110%" },
    show: { y: "0%", transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <motion.span
      className={className}
      variants={container}
      initial="hidden"
      animate={once ? undefined : "show"}
      whileInView={once ? "show" : undefined}
      viewport={once ? { once: true, amount: 0.3 } : undefined}
      aria-label={text}
    >
      {words.map((w, i) => (
        <span key={`${w}-${i}`} aria-hidden="true">
          {/* le masque coupe le mot pendant qu'il remonte */}
          <span className="inline-block overflow-hidden align-bottom">
            <motion.span variants={word} className="inline-block">
              {w}
            </motion.span>
          </span>
          {/* l'espace reste HORS du masque, sinon il est rogné */}
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </motion.span>
  );
}
