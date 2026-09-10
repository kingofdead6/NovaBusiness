import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { palette } from "../lib/tokens";

/** Mélange deux couleurs hex. `t` = 0 → `a`, 1 → `b`. */
function mixHex(a, b, t) {
  const parse = (h) => h.replace("#", "").match(/../g).map((x) => parseInt(x, 16));
  const A = parse(a);
  const B = parse(b);
  return (
    "#" +
    A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join("")
  );
}

/**
 * ÉTAPE 0 — L'EMBRASEMENT (§07)
 * ============================================================================
 *
 * « Le chargement est une couleur, pas une barre de progression. »
 *
 * Ni jauge, ni pourcentage : une SCÈNE. Le mot NOVA est présent dès la
 * première frame, mais peint à un pas du fond — donc invisible. Sa couleur
 * monte ensuite jusqu'au parchemin plein : le nom n'arrive pas en fondu, il
 * GAGNE DU CONTRASTE.
 *
 * C'est le §02 exécuté à la lettre : « trop sombre pour être lu, il monte en
 * luminosité jusqu'à devenir impossible à manquer ». Et c'est la mécanique
 * littérale d'une nova — une étoile déjà là, qui multiplie son éclat.
 *
 * Aucune lueur, aucune particule, aucun halo : l'effet est fabriqué par le
 * CONTRASTE seul, ce qui lui fait passer le test du §05 sans effort.
 *
 * Puis le ciel se retire vers le bas et découvre le hero clair. Le
 * préchargement a donc déjà posé le fond d'ouverture du site — et c'est ce
 * qui permet au pied de page de refermer la boucle sur cette même couleur.
 */
export default function Preloader({ onDone }) {
  const root = useRef(null);
  const [gone, setGone] = useState(false);

  /*
    `onDone` est souvent une lambda inline : on la garde dans un ref pour que
    l'effet ne se rejoue pas (il se rejouerait après démontage → root null).
  */
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const el = root.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced || !el) {
      setGone(true);
      onDoneRef.current?.();
      return undefined;
    }

    /*
      Le site doit devenir accessible même si la scène est interrompue —
      onglet mis en arrière-plan, démontage prématuré. La version précédente
      se contentait de mettre la timeline en pause au nettoyage, sans jamais
      appeler `onDone` : `ready` restait alors faux et le Hero ne
      s'initialisait jamais. On garde donc un drapeau et on garantit l'appel.
    */
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      setGone(true);
      onDoneRef.current?.();
    };

    const tl = gsap.timeline({ onComplete: finish });

    /*
      1 · le nom gagne du contraste — il ne se fond pas, il émerge.

      On interpole entre deux couleurs RÉSOLUES et non entre des chaînes
      `color-mix(...)` / `var(...)` : GSAP ne sait pas interpoler ces
      fonctions, le tween échouerait silencieusement et la timeline resterait
      bloquée — donc `onComplete` ne se déclencherait jamais et le site ne
      deviendrait jamais accessible. D'où le mélange calculé ici, en JS.

      Le départ est à un pas du fond : présent, mais illisible. C'est la
      mécanique de la nova (§02), fabriquée par le seul contraste.
    */
    const faint = mixHex(palette.ciel, palette.contraste, 0.12);

    tl.fromTo(
      el.querySelector("[data-pl-word]"),
      { color: faint },
      { color: palette.contraste, duration: 0.9, ease: "power2.in" }
    );

    // 2 · un seul trait se dessine : un geste, pas une jauge
    tl.fromTo(
      el.querySelector("[data-pl-rule]"),
      { scaleX: 0 },
      { scaleX: 1, duration: 0.4, ease: "power2.inOut" },
      "-=0.15"
    );

    /*
      3 · le ciel se retire vers le BAS et découvre le hero.
      L'écran ne glisse pas : c'est le fond qui se retire, comme partout
      ailleurs sur le site.
    */
    tl.to(el, {
      clipPath: "inset(0 0 100% 0)",
      duration: 0.7,
      ease: "power3.inOut",
    });

    return () => {
      tl.kill();
      finish();
    };
  }, []);

  if (gone) return null;

  return (
    <div
      ref={root}
      aria-hidden="true"
      className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-ciel"
      style={{ clipPath: "inset(0 0 0% 0)" }}
    >
      <p
        data-pl-word
        className="font-display text-d1 font-black lowercase tracking-tight"
      >
        nova
      </p>
      <span
        data-pl-rule
        className="mt-4 block h-px w-[min(38vw,20rem)] origin-left bg-contraste"
      />
    </div>
  );
}
