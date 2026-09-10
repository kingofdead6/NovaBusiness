import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { palette } from "../lib/tokens";

/**
 * Curseur maison : un petit disque qui grossit sur les éléments marqués
 * `data-cursor="hover"` et affiche un libellé sur `data-cursor-text`.
 * Désactivé au toucher et si l'utilisateur a réduit les animations.
 *
 * Le disque SUIT LE FOND qu'il survole : il se peint en ciel sur le clair, en
 * contraste sur le ciel. La teinte est déduite du fond RÉELLEMENT PEINT sous
 * le curseur, et non d'une liste de sections codée en dur — les surfaces
 * sombres vivent à des profondeurs très variables (une section entière, une
 * simple carte), et une liste de sélecteurs se désynchroniserait à la
 * première refonte.
 *
 * Cela couvre donc aussi bien les trois bascules de fond de la page que les
 * blocs qui portent leur propre couleur.
 */

/*
  Les couleurs viennent de la source unique (`src/lib/tokens.js`) : ce
  composant compare des LUMINANCES, il lui faut donc de vraies valeurs et
  non des variables CSS. C'est le seul consommateur de ce genre.

  Sur le clair on dessine avec le ciel, sur le ciel avec le contraste : la
  règle du §04 appliquée au curseur lui-même.
*/
const INK_ON_LIGHT = palette.ciel;
const INK_ON_DARK = palette.contraste;

/* Au survol d'une cible, le disque passe dans l'autre sens : négatif local. */
const ACCENT_ON_LIGHT = palette.noir;
const ACCENT_ON_DARK = palette.clair;

/**
 * RÉSOLUTION DES COULEURS
 * ============================================================================
 *
 * On laisse le NAVIGATEUR convertir, via un canvas de 1×1 pixel, au lieu de
 * parser la chaîne CSS à la main.
 *
 * C'est indispensable depuis que le fond est calculé par `color-mix(in oklab,
 * …)` : les couleurs arrivent alors en `oklab(0.94 0.0006 0.017)`, dont les
 * composantes vont de 0 à 1 et non de 0 à 255. L'ancien parseur les divisait
 * par 255 et trouvait une luminance quasi nulle — le curseur se croyait donc
 * en PERMANENCE sur un fond sombre et restait parchemin, invisible sur le
 * fond clair.
 *
 * Le canvas résout n'importe quelle notation (`rgb`, `oklab`, `color-mix`,
 * `lab`…) sans qu'on ait à en connaître une seule.
 */
let probe = null;

function toRgba(color) {
  if (!color) return null;
  if (!probe) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    probe = canvas.getContext("2d", { willReadFrequently: true });
  }
  probe.clearRect(0, 0, 1, 1);
  probe.fillStyle = "#000";
  probe.fillStyle = color; // ignoré si la couleur est invalide
  probe.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = probe.getImageData(0, 0, 1, 1).data;
  return { r, g, b, a: a / 255 };
}

/**
 * Luminance perçue d'une couleur CSS, quelle que soit sa notation.
 * Renvoie `null` si la couleur ne peint rien (trop transparente).
 */
function luminanceOf(color) {
  const c = toRgba(color);
  if (!c) return null;

  // un fond trop transparent ne peint pas : il faut continuer à remonter
  if (c.a < 0.5) return null;

  // pondération ITU-R BT.601 : assez fidèle à l'œil pour un test clair/sombre
  return (c.r * 299 + c.g * 587 + c.b * 114) / 255000;
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

  /*
    Rien d'opaque trouvé au-dessus : c'est le <body> qui peint, et son fond
    suit `--ground`. On le lit donc plutôt que de supposer « clair » — le
    site passe la moitié de son parcours dans le ciel.
  */
  const bodyLum = luminanceOf(getComputedStyle(document.body).backgroundColor);
  return bodyLum !== null ? bodyLum < 0.5 : false;
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

    /*
      PEINTURE INITIALE.

      `paint()` n'était appelé que sur un CHANGEMENT de fond. Au chargement,
      le disque gardait donc la couleur posée par le style inline, quel que
      soit le fond réel — et il restait faux tant qu'on ne traversait pas une
      frontière. On lit donc l'état une première fois, tout de suite.
    */
    onDark = isOnDarkBackdrop(document.body);
    setDark(onDark);
    gsap.set(dot.current, { backgroundColor: onDark ? INK_ON_DARK : INK_ON_LIGHT });

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
      /*
        Aucune couleur de fond en style inline : c'est l'effet qui la pose dès
        le montage, en lisant le fond réel. Une valeur écrite ici resterait
        celle du premier rendu et rendrait le disque faux tant qu'on n'aurait
        pas franchi une bascule.
      */
      className="pointer-events-none fixed left-0 top-0 z-[70] hidden h-3 w-3 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full md:flex"
    >
      {label && (
        <span
          /*
            Le libellé est peint SUR le disque : sa couleur est donc celle du
            fond que le disque recouvre, jamais celle du disque lui-même.
          */
          className="whitespace-nowrap font-mono text-[3.2px] uppercase tracking-[0.14em]"
          style={{ color: dark ? palette.ciel : palette.clair }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
