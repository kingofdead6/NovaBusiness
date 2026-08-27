import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

/**
 * Curseur maison : un petit disque qui grossit sur les éléments marqués
 * `data-cursor="hover"` et affiche un libellé sur `data-cursor-text`.
 * Désactivé au toucher et si l'utilisateur a réduit les animations.
 *
 * Le disque s'INVERSE selon le fond qu'il survole : bronze sur les surfaces
 * claires, ivoire sur les surfaces sombres. La teinte est déduite du fond
 * réellement peint sous le curseur (voir `readBackdrop`), et non d'une liste
 * de sections codée en dur — les blocs sombres vivent à des profondeurs très
 * variables (section entière pour Values, simple carte pour SplitCta), et
 * une liste de sélecteurs se désynchroniserait à la première refonte.
 */

/* Couleurs du disque selon le fond. */
const INK_ON_LIGHT = "#8A6045"; // bronze
const INK_ON_DARK = "#F5F0E8"; // ivoire

/* Variantes au survol d'une cible `data-cursor`. */
const ACCENT_ON_LIGHT = "#C9A86A"; // doré
const ACCENT_ON_DARK = "#FFFFFF";

/**
 * Luminance perçue d'une couleur CSS `rgb()` / `rgba()`.
 * Renvoie `null` si la couleur est absente ou totalement transparente.
 */
function luminanceOf(color) {
  if (!color) return null;

  const parts = color.match(/[\d.]+/g);
  if (!parts || parts.length < 3) return null;

  const [r, g, b] = parts.map(Number);
  const alpha = parts.length > 3 ? Number(parts[3]) : 1;

  // un fond transparent ne peint rien : il faut continuer à remonter l'arbre
  if (alpha < 0.5) return null;

  // pondération ITU-R BT.601 : suffisamment fidèle à l'œil, et sans le coût
  // de la linéarisation sRGB pour un simple test clair/sombre
  return (r * 299 + g * 587 + b * 114) / 255000;
}

/**
 * Remonte depuis l'élément survolé jusqu'à trouver un fond réellement opaque,
 * et dit s'il est sombre.
 *
 * On interroge la chaîne des parents plutôt que le seul `e.target` : la
 * plupart des éléments (titres, liens, spans) n'ont AUCUN fond propre et
 * renvoient `rgba(0,0,0,0)` — c'est le conteneur au-dessus qui peint.
 */
function isOnDarkBackdrop(startEl) {
  let node = startEl;

  while (node && node !== document.documentElement) {
    if (node.nodeType === 1) {
      /*
        Un élément marqué `data-cursor-invert` impose la réponse. Cela couvre
        les fonds que le calcul ne peut pas voir : image sombre, dégradé,
        `background-clip`… Le curseur reste alors juste sans deviner.
      */
      const forced = node.getAttribute?.("data-cursor-invert");
      if (forced === "dark") return true;
      if (forced === "light") return false;

      const lum = luminanceOf(getComputedStyle(node).backgroundColor);
      if (lum !== null) return lum < 0.5;
    }
    node = node.parentElement;
  }

  // rien d'opaque trouvé : le <body> est ivoire, donc clair
  return false;
}

export default function Cursor() {
  const dot = useRef(null);
  const [label, setLabel] = useState("");
  /*
   * Le libellé est peint PAR-DESSUS le disque : sa couleur doit donc être
   * l'opposée de celle du disque, sans quoi il disparaît. C'est le seul
   * élément d'état d'inversion qui doit atteindre le rendu React.
   */
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    document.body.classList.add("has-cursor");

    const xTo = gsap.quickTo(dot.current, "x", { duration: 0.35, ease: "power3" });
    const yTo = gsap.quickTo(dot.current, "y", { duration: 0.35, ease: "power3" });

    /*
     * État courant, conservé hors de React : ces deux valeurs changent à
     * chaque mouvement de souris, or elles ne servent qu'à choisir une
     * couleur — les passer par `useState` provoquerait un rendu par frame.
     */
    let onDark = false;
    let hovering = false;

    const paint = () => {
      const accent = onDark ? ACCENT_ON_DARK : ACCENT_ON_LIGHT;
      const ink = onDark ? INK_ON_DARK : INK_ON_LIGHT;
      gsap.to(dot.current, {
        backgroundColor: hovering ? accent : ink,
        duration: 0.35,
        ease: "power3.out",
      });
    };

    const onMove = (e) => {
      xTo(e.clientX);
      yTo(e.clientY);

      /*
        `elementFromPoint` et non `e.target` : le curseur est un élément
        `fixed`, et surtout le voile de lisibilité du Hero (`inset-0`) recouvre
        la zone — `e.target` renverrait ce voile, dont le fond dégradé n'est
        pas lisible par `backgroundColor`. On repart donc du point réel.

        Le disque lui-même est en `pointer-events: none`, il ne peut pas
        s'auto-détecter.
      */
      const under = document.elementFromPoint(e.clientX, e.clientY);
      const next = under ? isOnDarkBackdrop(under) : false;

      if (next !== onDark) {
        onDark = next;
        /*
          `setDark` ne redéclenche un rendu que sur un CHANGEMENT de fond
          (quelques fois par page), pas à chaque frame : le libellé suit
          l'inversion sans coût notable.
        */
        setDark(next);
        paint();
      }
    };

    const onOver = (e) => {
      const target = e.target.closest("[data-cursor]");
      if (!target) return;
      const text = target.getAttribute("data-cursor-text") || "";
      setLabel(text);
      hovering = true;
      gsap.to(dot.current, {
        scale: text ? 3.6 : 2.4,
        duration: 0.4,
        ease: "power3.out",
      });
      paint();
    };

    const onOut = (e) => {
      if (!e.target.closest?.("[data-cursor]")) return;
      setLabel("");
      hovering = false;
      gsap.to(dot.current, {
        scale: 1,
        duration: 0.4,
        ease: "power3.out",
      });
      paint();
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);

    return () => {
      document.body.classList.remove("has-cursor");
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
    };
  }, []);

  return (
    <div
      ref={dot}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[70] hidden h-3 w-3 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-bronze md:flex"
    >
      {label && (
        <span
          className={`whitespace-nowrap font-mono text-[3.2px] uppercase tracking-[0.14em] ${
            dark ? "text-charbon" : "text-ivoire"
          }`}
        >
          {label}
        </span>
      )}
    </div>
  );
}
