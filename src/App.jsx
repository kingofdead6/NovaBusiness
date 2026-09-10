import { useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initGround } from "./lib/ground";
import { initWarp } from "./lib/warp";

import SmoothScroll from "./components/SmoothScroll";
import Preloader from "./components/Preloader";
import Cursor from "./components/Cursor";
import Navbar from "./components/Navbar";
import SkyVeil from "./components/SkyVeil";
import PlateDistortion from "./components/PlateDistortion";

import Hero from "./components/sections/Hero";
import Boussole from "./components/sections/Boussole";
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
    const stopGround = initGround(document);
    const stopWarp = initWarp();
    return () => {
      stopGround();
      stopWarp();
    };
  }, [ready]);

  return (
    <SmoothScroll>
      <div className="grain relative">
        <Preloader onDone={() => setReady(true)} />
        <SkyVeil />
        {/* définitions des filtres de tremblé, posées une seule fois */}
        <PlateDistortion />
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
          {/*
            LE SEUIL. Dernier geste sur le fond clair : l'aiguille cherche,
            puis se fixe — et c'est à cet instant que le ciel monte.
            La section déclare `clair`, comme le hero : elle ne crée donc pas
            de bascule, elle DÉPLACE la première à sa propre frontière avec
            l'immersion.
          */}
          <Boussole />
          <Takeover />
          {/*
            LE RETOUR. Le ciel vient de se retirer : la boussole marque la
            sortie comme elle avait marqué l'entrée, l'aiguille tournant cette
            fois dans l'autre sens. C'est ici que l'illustration du client
            prend place — elle montre exactement ce que le site vient de
            faire : traverser l'horizon entre les deux fonds.
          */}
          <Boussole variante="retour" />
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
