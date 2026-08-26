import { useEffect, useRef } from "react";
import Typed from "typed.js";

/**
 * Titre qui se TAPE caractère par caractère (typed.js), déclenché au scroll.
 *
 *   <TypedHeading as="h2" text="parlons de votre projet" />
 *
 * Le texte n'est frappé qu'une fois, quand le titre entre dans l'écran.
 * Avant ça la boîte garde sa hauteur (voir `.typed-slot`), sinon la page
 * sauterait au moment où les lettres arrivent.
 */
export default function TypedHeading({
  as: Tag = "h2",
  text,
  html,
  className = "",
  speed = 42,
  startDelay = 0,
  cursor = true,
}) {
  /*
    `html` permet de taper un titre STYLÉ (ex. un mot en italique bronze) :
    typed.js tourne en contentType "html" et interprète les balises.
    `text` reste la version brute, utilisée pour l'accessibilité.
  */
  const source = html ?? text;

  /*
    typed.js interprète les balises quand contentType vaut "html" — et donc
    aussi les entités : un titre brut contenant « & » (ex. "Sites &
    plateformes") était tronqué net à l'esperluette. On ne passe donc en
    "html" QUE pour les titres stylés fournis via `html`.
  */
  const contentType = html ? "html" : "null";
  const host = useRef(null);   // noeud que typed.js remplit
  const slot = useRef(null);   // conteneur observé + réserve de hauteur

  useEffect(() => {
    const slotEl = slot.current;
    const hostEl = host.current;
    if (!slotEl || !hostEl) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // mouvement réduit : on affiche le titre d'emblée, sans frappe
    if (reduced) {
      if (html) hostEl.innerHTML = html;
      else hostEl.textContent = text;
      slotEl.dataset.typedState = "done";
      return undefined;
    }

    /*
      On fige la hauteur du titre AVANT la frappe, à partir du fantôme rendu
      à sa taille définitive. Sans ça la page remonte à chaque retour à la
      ligne gagné par le texte qui s'allonge.
    */
    const lockHeight = () => {
      const ghost = slotEl.querySelector(".typed-ghost");
      if (!ghost) return;
      ghost.style.height = "auto";
      const h = ghost.getBoundingClientRect().height;
      ghost.style.height = "";
      if (h) slotEl.style.minHeight = `${h}px`;
    };

    lockHeight();
    window.addEventListener("resize", lockHeight);

    let typed;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          io.disconnect();

          slotEl.dataset.typedState = "typing";
          typed = new Typed(hostEl, {
            strings: [source],
            typeSpeed: speed,
            startDelay,
            contentType,
            showCursor: cursor,
            cursorChar: "|",
            loop: false,
            onComplete: () => {
              slotEl.dataset.typedState = "done";
            },
          });
        });
      },
      { threshold: 0.25 }
    );

    io.observe(slotEl);

    return () => {
      window.removeEventListener("resize", lockHeight);
      io.disconnect();
      typed?.destroy();
    };
  }, [source, contentType, speed, startDelay, cursor]);

  return (
    <Tag
      ref={slot}
      className={`typed-slot ${className}`}
      data-typed-state="idle"
      aria-label={text}
    >
      {/*
        Le fantôme réserve la place du titre complet (donc aucun saut de mise
        en page pendant la frappe). Il est masqué à l'oeil ET aux lecteurs
        d'écran — c'est l'aria-label du titre qui porte le texte accessible.
      */}
      {/* le fantôme suit la même règle : HTML seulement si `html` est fourni */}
      {html ? (
        <span
          className="typed-ghost"
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <span className="typed-ghost" aria-hidden="true">
          {text}
        </span>
      )}
      <span ref={host} aria-hidden="true" className="typed-live" />
    </Tag>
  );
}
