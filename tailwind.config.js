/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        charbon: "#1C1C1C",
        ivoire: "#F5F0E8",
        bronze: "#8A6045",
        dore: "#C9A86A",
        pierre: "#8C8780",
        blanc: "#FFFFFF",
      },
      fontFamily: {
        // heavy grotesque — headlines, UI, body
        sans: ["Archivo", "system-ui", "sans-serif"],
        // didone italic — the "Paris" accent, used with restraint
        display: ["'Bodoni Moda'", "Georgia", "serif"],
        // labels, indices, metadata
        mono: ["'IBM Plex Mono'", "ui-monospace", "monospace"],
      },
      fontSize: {
        // fluid display scale
        d1: ["clamp(2.75rem, 8.5vw, 8.5rem)", { lineHeight: "0.92", letterSpacing: "-0.04em" }],
        d2: ["clamp(2.25rem, 6vw, 5.5rem)", { lineHeight: "0.95", letterSpacing: "-0.035em" }],
        d3: ["clamp(1.75rem, 3.6vw, 3.25rem)", { lineHeight: "1.02", letterSpacing: "-0.03em" }],
        // le plancher est volontairement haut : sur un téléphone, 19vw tombait
        // sous 4rem et le mot « nova. » paraissait timide au milieu de l'écran
        giant: ["clamp(5.5rem, 22vw, 22rem)", { lineHeight: "0.8", letterSpacing: "-0.05em" }],
      },
      transitionTimingFunction: {
        nova: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translate3d(0,0,0)" },
          "100%": { transform: "translate3d(-50%,0,0)" },
        },
      },
      animation: {
        marquee: "marquee 28s linear infinite",
      },
    },
  },
  plugins: [],
};
