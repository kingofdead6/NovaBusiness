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

  /*
    LA GÉLULE A DISPARU (§09).

    Le brief interdit « le bouton en gélule contournée », qu'il désigne comme
    la signature visuelle des sites générés. Le magnétisme, lui, reste : c'est
    un lien TEXTE qui suit le curseur et se souligne — plus distinctif qu'une
    capsule, et conforme.

    Deux registres seulement, tous deux dérivés de l'encre courante : ils sont
    donc justes sur le clair comme sur le ciel, sans variante par fond.
  */
  const variants = {
    // l'action principale : pleine, en négatif local
    solid: "inverse px-6 py-3",
    // l'action secondaire : un lien souligné, rien de plus
    ghost: "ink link-underline",
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
      className={`inline-flex items-center gap-2.5 text-[13px] font-semibold uppercase tracking-[0.1em] transition-colors duration-500 ease-nova ${variants[variant] ?? variants.ghost} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
