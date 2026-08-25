import { useEffect, useRef, useState } from "react";
import anime from "animejs/lib/anime.es.js";

/**
 * Écran d'ouverture — anime.js.
 * Le trait du logo se dessine pendant que le compteur monte, puis deux volets
 * ivoire/charbon se retirent vers le haut. Appelle onDone() à la fin.
 */
export default function Preloader({ onDone }) {
  const root = useRef(null);
  const countRef = useRef(null);
  const [gone, setGone] = useState(false);

  // onDone est souvent une lambda inline : on la garde dans un ref pour que
  // l'effet ne se rejoue pas (il se rejouerait après démontage → root null).
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const el = root.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced || !el) {
      setGone(true);
      onDoneRef.current?.();
      return;
    }

    const counter = { value: 0 };

    const tl = anime.timeline({
      easing: "easeOutExpo",
      complete: () => {
        setGone(true);
        onDoneRef.current?.();
      },
    });

    tl.add({
      targets: el.querySelectorAll(".draw"),
      strokeDashoffset: [anime.setDashoffset, 0],
      duration: 1500,
      delay: anime.stagger(140),
      easing: "easeInOutQuart",
    })
      .add(
        {
          targets: counter,
          value: 100,
          round: 1,
          duration: 1500,
          easing: "easeInOutQuart",
          update: () => {
            if (countRef.current) {
              countRef.current.textContent = String(counter.value).padStart(3, "0");
            }
          },
        },
        0
      )
      .add(
        {
          targets: el.querySelectorAll(".word"),
          opacity: [0, 1],
          translateY: [14, 0],
          duration: 700,
          delay: anime.stagger(70),
        },
        "-=700"
      )
      .add({
        targets: el.querySelectorAll(".panel"),
        translateY: ["0%", "-100%"],
        duration: 900,
        delay: anime.stagger(90),
        easing: "cubicBezier(0.76, 0, 0.24, 1)",
      })
      .add(
        {
          targets: el.querySelector(".pl-content"),
          opacity: 0,
          duration: 400,
        },
        "-=800"
      );

    return () => tl.pause();
  }, []);

  if (gone) return null;

  return (
    <div ref={root} className="fixed inset-0 z-[80]" aria-hidden="true">
      <div className="panel absolute inset-0 bg-charbon" />
      <div className="panel absolute inset-0 bg-ivoire" />

      <div className="pl-content absolute inset-0 flex flex-col items-center justify-center gap-8">
        {/* le trait du logo Nova : cercle ouvert + swoop + étoile */}
        <svg viewBox="0 0 120 120" className="h-24 w-24" fill="none">
          <path
            className="draw"
            d="M96 34a48 48 0 1 0 -6 62"
            stroke="#8A6045"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            className="draw"
            d="M28 82c4-22 12-28 16-14s12 10 20-4 14-16 24-20"
            stroke="#8A6045"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            className="draw"
            d="M88 30l3 8 8 3-8 3-3 8-3-8-8-3 8-3z"
            stroke="#C9A86A"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </svg>

        <div className="flex items-baseline gap-3 overflow-hidden">
          <span className="word font-sans text-2xl font-black uppercase tracking-tight opacity-0">
            Nova
          </span>
          <span className="word font-display text-2xl italic text-bronze opacity-0">
            business
          </span>
        </div>

        <span
          ref={countRef}
          className="font-mono text-[11px] tracking-[0.3em] text-pierre"
        >
          000
        </span>
      </div>
    </div>
  );
}
