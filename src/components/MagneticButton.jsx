import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * Bouton "magnétique" : suit légèrement le curseur quand on l'approche.
 * variant: "solid" (bronze plein) | "outline" | "ghost" | "light" (sur charbon)
 */
export default function MagneticButton({
  as = "a",
  href = "#contact",
  children,
  variant = "solid",
  strength = 0.35,
  className = "",
  onClick,
  ...rest
}) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  const handleMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((e.clientY - (rect.top + rect.height / 2)) * strength);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  const variants = {
    solid:
      "bg-bronze text-blanc hover:bg-dore hover:text-charbon border border-transparent",
    outline:
      "bg-transparent text-bronze border border-bronze hover:bg-bronze hover:text-blanc",
    ghost:
      "bg-transparent text-charbon border border-charbon/20 hover:border-charbon hover:bg-charbon hover:text-ivoire",
    light:
      "bg-ivoire text-charbon border border-transparent hover:bg-dore hover:text-charbon",
  };

  const Tag = motion[as] || motion.a;

  return (
    <Tag
      ref={ref}
      href={as === "a" ? href : undefined}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ x: sx, y: sy }}
      data-cursor="hover"
      className={`inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-[13px] font-semibold uppercase tracking-[0.1em] transition-colors duration-500 ease-nova ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
