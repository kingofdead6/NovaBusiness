import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * LA PLANCHE GRAVÉE, TRAITÉE POUR LES DEUX FONDS
 * ============================================================================
 *
 * Les planches d'origine (Bayer, Hevelius, Apianus) sont des ENCRES SOMBRES
 * SUR PAPIER CRÈME. Posées telles quelles sur l'aubergine, elles y colleraient
 * un grand rectangle clair — exactement ce que le §03 refuse, puisque le ciel
 * doit « envahir l'écran ».
 *
 * D'où ce traitement, en trois temps, entièrement en CSS :
 *
 *   1. `mix-blend-mode` fait disparaître le papier.
 *      - Sur le CLAIR : `multiply` — le papier crème se fond dans le fond
 *        clair, seule l'encre sombre subsiste.
 *      - Sur le CIEL : `screen` sur l'image INVERSÉE — le papier (devenu
 *        sombre) disparaît dans l'aubergine, et l'encre (devenue claire)
 *        ressort en parchemin.
 *      Dans les deux cas il ne reste QUE LE TRAIT, ce qu'exige le §05.
 *
 *   2. `grayscale(1)` neutralise les couleurs de la planche. Le §04 est
 *      catégorique : « le site n'a jamais plus de deux couleurs à l'écran en
 *      même temps ». Une planche coloriée à la main en introduirait quatre.
 *
 *   3. La bascule entre les deux traitements suit `--ground` : la planche
 *      s'inverse EN MÊME TEMPS que le fond, sans code par section.
 *
 * On garde l'image plutôt que de la redessiner : le §05 dit « on leur emprunte
 * le trait du dessin principal, la hachure, le cadre ». Le trait gravé du
 * XVIIe siècle est précisément ce qu'aucun tracé refait à la main n'égalerait.
 */
/*
  Trois intensités de tremblé (§05). `null` laisse la planche parfaitement
  nette — utile quand elle est déjà très petite, où la déformation casserait
  le trait au lieu de l'onduler.
*/
const WARP = {
  doux: "url(#plate-warp-doux)",
  normal: "url(#plate-warp)",
  fort: "url(#plate-warp-fort)",
  /* amplitude pilotée au défilement — voir `src/lib/warp.js` */
  scroll: "url(#plate-warp-scroll)",
};

export default function Engraving({
  src,
  alt = "",
  label = "",
  ratio = "4/5",
  parallax = 0,
  warp = "normal",
  className = "",
}) {
  const root = useRef(null);

  useEffect(() => {
    const el = root.current;
    if (!el || !parallax) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return undefined;

    const ctx = gsap.context(() => {
      /*
        Parallaxe douce : la planche dérive un peu plus lentement que la page.
        `scrub` — donc réversible, et arrêtée quand on s'arrête (§07).
      */
      gsap.fromTo(
        el.querySelector("[data-plate-img]"),
        { yPercent: parallax },
        {
          yPercent: -parallax,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8,
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [parallax]);

  return (
    <figure
      ref={root}
      /*
        `relative` n'est PAS posé ici : l'appelant place souvent la planche en
        `absolute` dans sa section, et deux classes de positionnement à
        spécificité égale laissent l'ordre d'émission de Tailwind décider — la
        planche restait alors dans le flux. La position appartient donc
        entièrement à l'appelant.
      */
      className={`engraving overflow-hidden ${className}`}
      style={{ aspectRatio: ratio }}
    >
      {/*
        L'élément peint un aplat de l'encre courante, découpé par l'alpha de
        la planche. Ce n'est donc pas une <img> : le fichier sert de MASQUE,
        ce qui permet à la planche de suivre le fond.

        `role="img"` + `aria-label` rendent la planche accessible malgré tout.
      */}
      <div
        data-plate-img
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
        aria-hidden={alt ? undefined : "true"}
        className="engraving-img h-full w-full"
        style={{
          "--plate": `url(${src})`,
          filter: WARP[warp] ?? undefined,
        }}
      />
      {label ? (
        <figcaption className="ink-40 absolute bottom-0 left-0 font-mono text-[10px] uppercase tracking-[0.16em]">
          {label}
        </figcaption>
      ) : null}
    </figure>
  );
}
