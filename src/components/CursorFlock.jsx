import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * VOLÉE D'OISEAUX QUI SUIT LE CURSEUR
 *
 * - Les oiseaux suivent le curseur en file.
 * - Ils restent toujours derrière le curseur.
 * - Le premier oiseau garde une distance minimale.
 * - Chaque oiseau est progressivement plus éloigné.
 * - Le mouvement est lent et fluide.
 * - La ligne possède une légère ondulation naturelle.
 * - Les ailes battent indépendamment.
 * - Actif uniquement dans les sections [data-flock].
 */

const COUNT = 5;
const FRAMES = 5;
const SPRITE = "/birds.png";

const FLAP = 0.42;

/**
 * Distance entre le curseur et le premier oiseau.
 */
const CURSOR_GAP = 75;

/**
 * Distance entre chaque oiseau.
 */
const BIRD_SPACING = 48;

/**
 * Vitesse de poursuite.
 */
const FOLLOW_SPEED = 0.065;

export default function CursorFlock() {
  const root = useRef(null);
  const birds = useRef([]);

  useEffect(() => {
    const fine = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    ).matches;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!fine || reduced) {
      return undefined;
    }

    const zones = Array.from(
      document.querySelectorAll("[data-flock]")
    );

    if (!zones.length) {
      return undefined;
    }

    let cleanup = null;

    const ctx = gsap.context(() => {
      /**
       * État de chaque oiseau.
       */
      const state = Array.from(
        { length: COUNT },
        () => ({
          x: -200,
          y: -200,
          angle: 0,
          previousX: -200,
          previousY: -200,
        })
      );

      /**
       * Position actuelle de la souris.
       */
      const mouse = {
        x: -200,
        y: -200,
      };

      /**
       * Position précédente de la souris.
       *
       * Elle permet de déterminer la direction
       * dans laquelle le curseur se déplace.
       */
      const previousMouse = {
        x: -200,
        y: -200,
      };

      /**
       * Direction actuelle de la volée.
       */
      const flockDirection = {
        x: 1,
        y: 0,
      };

      let active = false;

      /**
       * Gestion du mouvement de la souris.
       */
      const onMove = (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;

        /**
         * Vérifie si la souris est dans une section
         * possédant l'attribut [data-flock].
         */
        const inZone = zones.some((zone) => {
          const rect = zone.getBoundingClientRect();

          return (
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom
          );
        });

        /**
         * Apparition/disparition de la volée.
         */
        if (inZone !== active) {
          active = inZone;

          gsap.to(root.current, {
            opacity: inZone ? 1 : 0,
            duration: 0.5,
            ease: "power2.out",
          });
        }
      };

      /**
       * Animation principale.
       */
      const tick = () => {
        const time = performance.now();

        /**
         * Déplacement du curseur depuis le dernier frame.
         */
        let directionX =
          mouse.x - previousMouse.x;

        let directionY =
          mouse.y - previousMouse.y;

        const mouseSpeed = Math.hypot(
          directionX,
          directionY
        );

        /**
         * Si la souris bouge suffisamment,
         * mettre à jour la direction de la volée.
         */
        if (mouseSpeed > 0.1) {
          directionX /= mouseSpeed;
          directionY /= mouseSpeed;

          /**
           * Lisser la direction.
           */
          flockDirection.x +=
            (directionX - flockDirection.x) *
            0.08;

          flockDirection.y +=
            (directionY - flockDirection.y) *
            0.08;
        }

        /**
         * Normaliser la direction.
         */
        const directionLength = Math.hypot(
          flockDirection.x,
          flockDirection.y
        );

        if (directionLength > 0.001) {
          flockDirection.x /=
            directionLength;

          flockDirection.y /=
            directionLength;
        }

        /**
         * Direction perpendiculaire.
         *
         * Elle sert à créer une légère ondulation
         * naturelle de la file.
         */
        const perpendicularX =
          -flockDirection.y;

        const perpendicularY =
          flockDirection.x;

        /**
         * Faire avancer chaque oiseau.
         */
        for (
          let i = 0;
          i < state.length;
          i++
        ) {
          const s = state[i];
          const el = birds.current[i];

          if (!el) {
            continue;
          }

          /**
           * Distance de cet oiseau par rapport
           * au curseur.
           */
          const distance =
            CURSOR_GAP +
            i * BIRD_SPACING;

          /**
           * Petite oscillation organique.
           *
           * Elle est différente pour chaque oiseau.
           */
          const wave =
            Math.sin(
              time * 0.0015 +
                i * 1.7
            ) * 8;

          /**
           * Position cible.
           *
           * Le curseur est devant.
           * Les oiseaux restent derrière.
           */
          const targetX =
            mouse.x -
            flockDirection.x *
              distance +
            perpendicularX * wave;

          const targetY =
            mouse.y -
            flockDirection.y *
              distance +
            perpendicularY * wave;

          /**
           * Différence entre l'oiseau
           * et sa position cible.
           */
          const dx = targetX - s.x;
          const dy = targetY - s.y;

          /**
           * Les oiseaux derrière sont
           * légèrement plus lents.
           */
          const ease = Math.max(
            0.025,
            FOLLOW_SPEED -
              i * 0.006
          );

          /**
           * Mouvement lent et fluide.
           */
          s.x += dx * ease;
          s.y += dy * ease;

          /**
           * Direction réelle du mouvement.
           */
          const moveX =
            s.x - s.previousX;

          const moveY =
            s.y - s.previousY;

          const speed = Math.hypot(
            moveX,
            moveY
          );

          /**
           * Rotation des oiseaux.
           */
          if (speed > 0.05) {
            let angle =
              (Math.atan2(
                moveY,
                moveX
              ) *
                180) /
              Math.PI;

            /**
             * Empêcher les oiseaux
             * d'être à l'envers.
             */
            if (angle > 90) {
              angle -= 180;
            }

            if (angle < -90) {
              angle += 180;
            }

            /**
             * Rotation lissée.
             */
            s.angle +=
              (angle - s.angle) *
              0.1;
          }

          /**
           * Sauvegarder la position.
           */
          s.previousX = s.x;
          s.previousY = s.y;

          /**
           * Appliquer la transformation.
           */
          el.style.transform =
            `translate3d(${s.x}px, ${s.y}px, 0) ` +
            `rotate(${s.angle}deg)`;
        }

        /**
         * Sauvegarder la position du curseur
         * pour le prochain frame.
         */
        previousMouse.x = mouse.x;
        previousMouse.y = mouse.y;
      };

      /**
       * Ajouter l'animation au ticker GSAP.
       */
      gsap.ticker.add(tick);

      /**
       * Animation des ailes.
       */
      birds.current.forEach((el, i) => {
        if (!el) {
          return;
        }

        const counter = {
          frame: 0,
        };

        gsap.to(counter, {
          frame: FRAMES - 1,

          duration:
            FLAP + i * 0.035,

          ease: "none",

          repeat: -1,

          yoyo: true,

          delay: -i * 0.13,

          onUpdate: () => {
            const frame = Math.round(
              counter.frame
            );

            const position =
              (frame /
                (FRAMES - 1)) *
              100;

            el.style.maskPosition =
              `${position}% 0`;

            el.style.webkitMaskPosition =
              `${position}% 0`;
          },
        });
      });

      /**
       * Écouter les mouvements de souris.
       */
      window.addEventListener(
        "mousemove",
        onMove,
        {
          passive: true,
        }
      );

      /**
       * Nettoyage.
       */
      cleanup = () => {
        gsap.ticker.remove(tick);

        window.removeEventListener(
          "mousemove",
          onMove
        );
      };
    }, root);

    return () => {
      if (cleanup) {
        cleanup();
      }

      ctx.revert();
    };
  }, []);

  return (
    <div
      ref={root}
      aria-hidden="true"
      className="
        pointer-events-none
        fixed
        inset-0
        z-[65]
        opacity-0
      "
    >
      {Array.from(
        { length: COUNT },
        (_, i) => {
          /**
           * Taille des oiseaux.
           *
           * 48px
           * 44px
           * 40px
           * 36px
           * 32px
           */
          const size = 48 - i * 4;

          return (
            <div
              key={`bird-${i}`}
              ref={(element) => {
                birds.current[i] =
                  element;
              }}
              className="
                absolute
                left-0
                top-0
                bg-dore
                will-change-transform
              "
              style={{
                width: `${size}px`,
                height: `${size}px`,

                marginLeft:
                  `${-size / 2}px`,

                marginTop:
                  `${-size / 2}px`,

                /**
                 * Les oiseaux deviennent
                 * légèrement plus transparents
                 * au fur et à mesure.
                 */
                opacity:
                  1 - i * 0.13,

                /**
                 * Sprite utilisé comme masque.
                 */
                maskImage:
                  `url(${SPRITE})`,

                WebkitMaskImage:
                  `url(${SPRITE})`,

                /**
                 * 5 frames horizontales.
                 */
                maskSize:
                  `${FRAMES * 100}% 100%`,

                WebkitMaskSize:
                  `${FRAMES * 100}% 100%`,

                maskRepeat:
                  "no-repeat",

                WebkitMaskRepeat:
                  "no-repeat",

                /**
                 * Position initiale.
                 */
                transform:
                  "translate3d(-200px, -200px, 0)",
              }}
            />
          );
        }
      )}
    </div>
  );
}