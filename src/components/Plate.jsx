import { plates } from "../art/plates";

/**
 * LA PLANCHE GRAVÉE (§05)
 * ============================================================================
 *
 * « La structure fait l'image. Une étoile est un point avec quatre à six
 * rayons dessinés. Tout se joue au trait. »
 *
 * POURQUOI DU SVG EN LIGNE, ET JAMAIS UNE IMAGE
 * ---------------------------------------------
 * Les quatre règles du §05 — une seule couleur de trait, deux états,
 * l'épaisseur qui porte le sens, la main qui reste visible — sont TOUTES des
 * propriétés du tracé. Un PNG ne peut pas s'inverser avec le fond.
 *
 * Ici chaque tracé est `stroke="currentColor"` sans remplissage.
 * `currentColor` résout vers `--ground-ink`, hérité du document : la planche
 * s'inverse donc AUTOMATIQUEMENT quand le site plonge dans le ciel. La règle
 * des deux états est satisfaite structurellement, sans travail par planche.
 *
 * L'ÉPAISSEUR
 * -----------
 * `vector-effect="non-scaling-stroke"` est délibérément OMIS : on veut que
 * le trait épaississe quand la planche s'agrandit, comme un vrai feutre. La
 * prop `weight` multiplie toutes les épaisseurs d'un coup, ce qui permet
 * d'accorder une planche à son voisinage sans retoucher ses données.
 *
 * LA MAIN VISIBLE
 * ---------------
 * L'irrégularité est DESSINÉE DANS LES DONNÉES, jamais générée au rendu :
 * une planche qui change à chaque chargement ne se lit pas comme une main,
 * elle se lit comme un bug.
 *
 * LE REPLI
 * --------
 * Sans dessin correspondant, on rend un cadre au trait avec repères d'angle
 * et le libellé — même idée que l'emplacement annoté de `Media`. Ce repli
 * étant lui aussi au trait et inversible, une page entière de placeholders
 * démontre déjà correctement le système des deux fonds : le chantier n'est
 * jamais bloqué par l'absence d'artwork.
 */
export default function Plate({
  name,
  weight = 1,
  ratio = "4/5",
  label = "",
  className = "",
}) {
  const plate = plates[name];

  return (
    <div
      className={`relative w-full ${className}`}
      style={{ aspectRatio: ratio }}
      role={label ? "img" : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : "true"}
    >
      {plate ? (
        <svg
          viewBox={plate.viewBox}
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-full w-full"
        >
          {plate.paths.map((p, i) => (
            <path key={i} d={p.d} strokeWidth={(p.w ?? 1) * weight} />
          ))}
        </svg>
      ) : (
        <PlateSlot label={label} />
      )}
    </div>
  );
}

/**
 * EMPLACEMENT ANNOTÉ — au trait, donc conforme au §05 même en attente.
 * Les repères d'angle plutôt qu'un cadre plein : c'est le langage des
 * planches d'astronomie, et cela reste lisible sur les deux fonds.
 */
function PlateSlot({ label }) {
  return (
    <svg
      viewBox="0 0 100 125"
      preserveAspectRatio="none"
      fill="none"
      stroke="currentColor"
      className="h-full w-full opacity-30"
      aria-hidden="true"
    >
      {/* repères d'angle */}
      <path d="M2 12 V2 H12" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
      <path d="M88 2 H98 V12" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
      <path d="M98 113 V123 H88" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
      <path d="M12 123 H2 V113" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
      {label ? (
        <text
          x="50"
          y="64"
          textAnchor="middle"
          fontSize="4"
          fill="currentColor"
          stroke="none"
          className="font-mono uppercase"
        >
          {label}
        </text>
      ) : null}
    </svg>
  );
}

/**
 * L'ÉTOILE (§05) — « un point avec quatre à six rayons dessinés ».
 *
 * Jamais un disque plein, jamais une lueur. Un seul composant pour toutes les
 * étoiles du site : l'étoile est un SYSTÈME, pas un motif redessiné section
 * par section.
 */
export function Star({ rays = 4, weight = 1, className = "" }) {
  const count = Math.min(6, Math.max(4, rays));
  const lines = Array.from({ length: count }, (_, i) => {
    const angle = (i * 360) / count;
    const rad = (angle * Math.PI) / 180;
    // longueur légèrement inégale d'un rayon à l'autre : la main reste visible
    const len = 9 + (i % 2 === 0 ? 1.4 : 0);
    return {
      x1: 12 - Math.cos(rad) * 2,
      y1: 12 - Math.sin(rad) * 2,
      x2: 12 + Math.cos(rad) * len,
      y2: 12 + Math.sin(rad) * len,
    };
  });

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      {lines.map((l, i) => (
        <line
          key={i}
          x1={l.x1}
          y1={l.y1}
          x2={l.x2}
          y2={l.y2}
          strokeWidth={0.9 * weight}
        />
      ))}
    </svg>
  );
}
