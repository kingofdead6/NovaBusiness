import { useRef } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import Media from "../Media";
import { journal } from "../../data/site";

const EASE = [0.16, 1, 0.3, 1];

/* Mot masqué : monte depuis sa propre boîte (overflow hidden) */
function Reveal({ children, delay = 0, className = "" }) {
  return (
    <span className="inline-block overflow-hidden align-bottom">
      <motion.span
        initial={{ y: "115%" }}
        whileInView={{ y: "0%" }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.9, delay, ease: EASE }}
        className={`inline-block ${className}`}
      >
        {children}
      </motion.span>
    </span>
  );
}

/* Une carte : rideau bronze + parallaxe sur l'image */
function JournalCard({ post, i }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const p = useSpring(scrollYProgress, { stiffness: 100, damping: 30, mass: 0.4 });
  const y = useTransform(p, [0, 1], ["-7%", "7%"]);

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 44 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.75, delay: i * 0.08, ease: EASE }}
      className={`group ${i === 1 ? "md:mt-12" : ""}`}
    >
      <a href="#journal" data-cursor="hover" data-cursor-text="lire" className="block">
        <div className="relative overflow-hidden rounded-[3px]">
          {/* rideau qui se retire vers le haut */}
          <motion.div
            aria-hidden
            initial={{ scaleY: 1 }}
            whileInView={{ scaleY: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 1.05, delay: 0.15 + i * 0.12, ease: EASE }}
            className="absolute inset-0 z-10 origin-top bg-bronze"
          />

          {/* parallaxe : l'image dérive plus lentement que la carte */}
          <motion.div style={reduce ? undefined : { y, scale: 1.14 }}>
            <div className="transition-transform duration-[900ms] ease-nova group-hover:scale-[1.05]">
              <Media src={post.img} alt={post.title} ratio="4/3" label={post.mediaLabel} />
            </div>
          </motion.div>

          {/* voile bronze au survol */}
          <div className="pointer-events-none absolute inset-0 bg-bronze/0 transition-colors duration-700 ease-nova group-hover:bg-bronze/10" />

          {/* index éditorial */}
          <span className="absolute bottom-3 left-4 z-[5] font-mono text-[10px] tracking-[0.2em] text-blanc/70 mix-blend-difference">
            {String(i + 1).padStart(2, "0")}
          </span>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <span className="rounded-full border border-charbon/12 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-bronze">
            {post.tag}
          </span>
          <span className="font-mono text-[10px] text-pierre">{post.read}</span>
          <span className="ml-auto translate-x-[-6px] font-mono text-[11px] text-bronze opacity-0 transition-all duration-500 ease-nova group-hover:translate-x-0 group-hover:opacity-100">
            →
          </span>
        </div>

        <h3 className="mt-3 text-xl font-semibold leading-snug tracking-tight transition-transform duration-500 ease-nova group-hover:translate-x-1">
          {post.title}
        </h3>

        {/* filet qui se trace au survol */}
        <span className="mt-4 block h-px w-full origin-left scale-x-0 bg-charbon/20 transition-transform duration-700 ease-nova group-hover:scale-x-100" />
      </a>
    </motion.article>
  );
}

export default function Journal() {
  const headRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: headRef,
    offset: ["start 0.9", "start 0.45"],
  });
  const ruleScale = useSpring(scrollYProgress, { stiffness: 90, damping: 26 });

  return (
    <section id="journal" className="bg-ivoire py-24 md:py-32">
      <div className="edge">
        <div ref={headRef} className="mb-12">
          <div className="flex items-end justify-between gap-6">
            <div>
              <motion.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="eyebrow mb-6 block"
              >
                Journal
              </motion.span>
              <h2 className="text-d2 font-medium lowercase">
                <Reveal delay={0.05}>ce</Reveal>{" "}
                <Reveal delay={0.12}>qu'on</Reveal>{" "}
                <Reveal delay={0.19} className="font-display italic text-bronze">
                  apprend
                </Reveal>
              </h2>
            </div>
            <a
              href="#journal"
              data-cursor="hover"
              className="link-underline hidden font-mono text-[11px] uppercase tracking-[0.18em] text-pierre md:block"
            >
              tous les articles →
            </a>
          </div>

          {/* filet qui se trace au scroll */}
          <motion.div
            style={{ scaleX: ruleScale }}
            className="mt-8 h-px w-full origin-left bg-charbon/15"
          />
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {journal.map((post, i) => (
            <JournalCard key={post.title} post={post} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}