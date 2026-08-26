import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import useReveal from "../../hooks/useReveal";
import TypedHeading from "../TypedHeading";
import Media from "../Media";
import MagneticButton from "../MagneticButton";
import { projects } from "../../data/site";

/**
 * SECTION 06 — RÉALISATIONS
 * Carrousel 3D centré : la carte active est de face, les voisines reculent,
 * tournent et se réduisent.
 *
 * Navigation :
 * - Clic sur une carte voisine → saut INSTANTANÉ (pas d'animation de vol).
 * - Glisser-déposer (souris/tactile) SUR TOUTE LA ZONE du carrousel
 *   (pas seulement la carte active) → défilement manuel.
 * - Flèches (boutons + clavier, depuis n'importe quel élément focalisé
 *   du carrousel).
 * - Défilement automatique, mis en pause au survol, au focus clavier,
 *   au toucher et pendant le glisser.
 *
 * Alignement : en-tête, scène et légende sont tous DANS UN SEUL bloc
 * ".edge", donc ils partagent exactement la même boîte de contenu.
 *
 * Accessibilité : un seul arrêt de tabulation (la carte active), la légende
 * est une région live, et `prefers-reduced-motion` coupe le défilement
 * automatique ainsi que les animations.
 */
export default function Work() {
  const [active, setActive] = useState(Math.floor(projects.length / 2));
  const [isInteracting, setIsInteracting] = useState(false); // drag, survol ou focus
  const total = projects.length;
  const autoplayRef = useRef(null);
  const reduce = useReducedMotion();

  // vrai uniquement pour le saut au clic : on saute alors sans animer.
  // Un ref (et non un state) : la valeur est posée par l'événement qui
  // déclenche le rendu, donc aucune course possible avec l'autoplay.
  const instantRef = useRef(false);

  const pause = useCallback(() => setIsInteracting(true), []);
  const resume = useCallback(() => setIsInteracting(false), []);

  const go = useCallback(
    (dir) => {
      instantRef.current = false;
      setActive((i) => (i + dir + total) % total);
    },
    [total]
  );

  const revealRoot = useReveal();

  const goToIndex = useCallback((i) => {
    instantRef.current = true;
    setActive(i);
  }, []);

  // le saut instantané ne vaut que pour le rendu déclenché par le clic
  useEffect(() => {
    instantRef.current = false;
  }, [active]);

  // --- Défilement automatique ---
  useEffect(() => {
    if (isInteracting || reduce) return undefined;

    autoplayRef.current = setInterval(() => {
      go(1);
    }, 4500);

    return () => clearInterval(autoplayRef.current);
  }, [isInteracting, reduce, go]);

  const onKeyDown = (e) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    }
  };

  const cardTransition =
    reduce || instantRef.current
      ? { duration: 0 }
      : { duration: 0.85, ease: [0.16, 1, 0.3, 1] };

  return (
    <section
      ref={revealRoot}
      id="realisations"
      aria-roledescription="carrousel"
      aria-label="Réalisations récentes"
      className="relative overflow-hidden bg-ivoire py-24 md:py-32"
    >
      <div className="edge">
        <div className="mb-12 flex items-end justify-between gap-6">
          <div>
            <span data-reveal="fade" className="eyebrow mb-6 block">
              Réalisations
            </span>
            <TypedHeading
              as="h2"
              className="text-d2 font-medium lowercase"
              text="travaux récents"
              html={'travaux <span class="font-display italic text-bronze">récents</span>'}
            />
          </div>
          <MagneticButton href="#contact" variant="ghost" className="hidden md:inline-flex">
            tous les projets
          </MagneticButton>
        </div>

        {/* scène 3D — le centrage des cartes est fait EN FLEX par le calque
            positionné (.absolute.inset-0), JAMAIS par une classe
            -translate-x-1/2 : Framer écrit `transform` en inline sur la
            carte et écraserait la translation de centrage, ce qui décalait
            tout le carrousel vers la droite. */}
        <div
          className="relative flex h-[46vw] min-h-[320px] items-center justify-center md:h-[38vw]"
          style={{ perspective: "2000px" }}
          onKeyDown={onKeyDown}
          onMouseEnter={pause}
          onMouseLeave={resume}
          onFocusCapture={pause}
          onBlurCapture={resume}
          onPointerDownCapture={pause}
          onPointerUp={resume}
          onPointerCancel={resume}
        >
          {/* zone de glisser-déposer : couvre TOUTE la scène, pas seulement
              la carte active, donc on peut faire défiler à la main en
              cliquant/touchant n'importe où dans le carrousel */}
          <motion.ul
            className="relative m-0 h-full w-full cursor-grab list-none select-none p-0 touch-pan-y active:cursor-grabbing"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.12}
            dragMomentum={false}
            onDragStart={pause}
            onDragEnd={(_, info) => {
              resume();
              if (info.offset.x < -70) go(1);
              if (info.offset.x > 70) go(-1);
            }}
          >
            {projects.map((p, i) => {
              let offset = i - active;
              // boucle : on prend le chemin le plus court
              if (offset > total / 2) offset -= total;
              if (offset < -total / 2) offset += total;

              const isActive = offset === 0;
              const abs = Math.abs(offset);
              const hidden = abs > 2;

              return (
                // calque de positionnement : centre la carte en flex, sans
                // transform — et laisse passer le pointeur vers le calque
                // de glisser en dessous
                <li
                  key={p.name}
                  className="pointer-events-none absolute inset-0 flex items-center justify-center"
                  style={{ zIndex: 10 - abs }}
                  aria-hidden={hidden || undefined}
                >
                  <motion.button
                    type="button"
                    tabIndex={isActive ? 0 : -1}
                    aria-label={isActive ? `Projet ${p.name}` : `Voir ${p.name}`}
                    aria-current={isActive || undefined}
                    onClick={() => !isActive && goToIndex(i)}
                    data-cursor="hover"
                    data-cursor-text={isActive ? "" : "voir"}
                    initial={false}
                    animate={{
                      x: `${offset * 34}%`,
                      scale: isActive ? 1 : 0.74 - abs * 0.06,
                      rotateY: offset * -13,
                      opacity: hidden ? 0 : 1,
                      filter: isActive ? "grayscale(0)" : "grayscale(1)",
                    }}
                    transition={cardTransition}
                    className={`w-[62%] md:w-[46%] ${
                      hidden || isActive ? "pointer-events-none" : "pointer-events-auto"
                    }`}
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <div className="overflow-hidden rounded-[3px] bg-blanc shadow-[0_30px_80px_-40px_rgba(28,28,28,0.55)]">
                      <Media
                        src={p.img}
                        ratio="16/10"
                        alt={`Projet ${p.name}`}
                        label={p.mediaLabel}
                      />
                    </div>
                  </motion.button>
                </li>
              );
            })}
          </motion.ul>
        </div>

        {/* légende du projet actif */}
        <div className="mt-9 flex items-center justify-between gap-6">
          {/* région live STABLE : elle ne doit pas être démontée par
              AnimatePresence, sinon l'annonce devient peu fiable */}
          <div aria-live="polite" aria-atomic="true" className="min-h-[4.5rem]">
            <AnimatePresence mode="wait">
              <motion.div
                key={projects[active].name}
                initial={{ opacity: 0, y: reduce ? 0 : 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduce ? 0 : -14 }}
                transition={{ duration: reduce ? 0 : 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                <h3 className="text-d3 font-bold tracking-tight">{projects[active].name}</h3>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-pierre">
                  {projects[active].kind} — {projects[active].year}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="font-mono text-[11px] text-pierre">
              {String(active + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
            {[-1, 1].map((dir) => (
              <button
                key={dir}
                type="button"
                onClick={() => go(dir)}
                onKeyDown={onKeyDown}
                data-cursor="hover"
                aria-label={dir === -1 ? "Projet précédent" : "Projet suivant"}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-charbon/15 transition-colors duration-500 ease-nova hover:border-bronze hover:bg-bronze hover:text-blanc"
              >
                <span aria-hidden="true">{dir === -1 ? "←" : "→"}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
