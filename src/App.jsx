import { useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initGround } from "./lib/ground";

import SmoothScroll from "./components/SmoothScroll";
import Preloader from "./components/Preloader";
import Cursor from "./components/Cursor";
import Navbar from "./components/Navbar";
import SkyVeil from "./components/SkyVeil";

import Hero from "./components/sections/Hero";
import Takeover from "./components/sections/Takeover";
import Values from "./components/sections/Values";
import Services from "./components/sections/Services";
import Work from "./components/sections/Work";
import Process from "./components/sections/Process";
import Journal from "./components/sections/Journal";
import Footer from "./components/sections/Footer";

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [ready, setReady] = useState(false);

  // les polices web changent la hauteur des blocs : on recalcule les triggers
  useEffect(() => {
    if (!ready) return;
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }, [ready]);

  /*
    Les bascules de fond ne sont branchées qu'une fois le préchargement
    terminé : leurs positions se mesurent sur la page réelle, et le
    préchargement occupe encore l'écran avant `ready`.
  */
  useEffect(() => {
    if (!ready) return undefined;
    return initGround(document);
  }, [ready]);

  return (
    <SmoothScroll>
      <div className="grain relative">
        <Preloader onDone={() => setReady(true)} />
        <SkyVeil />
        <Cursor />
        <Navbar />

        {/*
          SÉQUENCE DE L'ACCUEIL (§07) — cinq états, trois bascules de fond.

            1 · Hero        clair    une phrase, beaucoup de vide
            2 · Immersion   ciel     Takeover + Values — l'embrasement
            3 · Retrait     clair    les zones de lecture reviennent
            4 · Footer      ciel     bascule au tout dernier moment

          Les sections déclarent leur fond via `data-ground`; c'est
          `src/lib/ground.js` qui en déduit les frontières et pilote le
          balayage. Aucune section ne connaît ses voisines.
        */}
        <main>
          <Hero ready={ready} />
          <Takeover />
          <Values />
          <Services />
          <Work />
          <Process />
          <Journal />
        </main>

        <Footer />
      </div>
    </SmoothScroll>
  );
}
