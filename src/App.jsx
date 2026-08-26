import { useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import SmoothScroll from "./components/SmoothScroll";
import Preloader from "./components/Preloader";
import Cursor from "./components/Cursor";
import CursorFlock from "./components/CursorFlock";
import Navbar from "./components/Navbar";

import Hero from "./components/sections/Hero";
import Clients from "./components/sections/Clients";
import Takeover from "./components/sections/Takeover";
import Values from "./components/sections/Values";
import Services from "./components/sections/Services";
import Work from "./components/sections/Work";
import Marquee from "./components/sections/Marquee";
import Process from "./components/sections/Process";
import Testimonials from "./components/sections/Testimonials";
import SplitCta from "./components/sections/SplitCta";
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

  return (
    <SmoothScroll>
      <div className="grain relative ">
        <Preloader onDone={() => setReady(true)} />
        <Cursor />
        <CursorFlock />
        <Navbar />

        <main>
          <Hero ready={ready} />
          <Clients />
          <Takeover />
          <Values />
          <Services />
          <Work />
          <Marquee />
          <Process />
          <Testimonials />
          <SplitCta />
          <Journal />
        </main>

        <Footer />
      </div>
    </SmoothScroll>
  );
}
