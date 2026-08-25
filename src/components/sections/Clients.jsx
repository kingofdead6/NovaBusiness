import { clients } from "../../data/site";

/**
 * SECTION 02 — ILS NOUS FONT CONFIANCE
 * Bandeau logos en défilement CSS infini (dupliqué une fois pour la boucle).
 * Remplacez le <span> par <img src="/images/logos/x.svg" /> quand vous aurez
 * les logos.
 */
export default function Clients() {
  const row = [...clients, ...clients];

  return (
    <section className="relative border-y border-charbon/10 py-8">
      <p className="eyebrow mb-6 text-center">Ils nous font confiance</p>

      <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
        <div className="flex w-max animate-marquee items-center gap-14 md:gap-20">
          {row.map((name, i) => (
            <div
              key={`${name}-${i}`}
              className="flex h-9 shrink-0 items-center opacity-45 grayscale transition duration-500 hover:opacity-100 hover:grayscale-0"
            >
              {/* EMPLACEMENT LOGO — remplacer par une <img> */}
              <span className="whitespace-nowrap font-display text-xl italic tracking-tight text-charbon">
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
