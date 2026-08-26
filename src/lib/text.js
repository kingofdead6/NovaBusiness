/**
 * Home-made text splitter — avoids GSAP SplitText (club plugin).
 * Wraps every word in .split-line > .split-inner so you can translate the
 * inner element while the outer one clips it. Returns the inner nodes so
 * GSAP / anime.js can stagger them.
 */
export function splitWords(el) {
  if (!el || el.dataset.split === "true") {
    return el ? Array.from(el.querySelectorAll(".split-inner")) : [];
  }

  el.setAttribute("aria-label", el.textContent.trim());
  el.dataset.split = "true";

  /**
   * On descend dans l'arbre plutôt que de lire `textContent` : les titres
   * contiennent souvent un <span class="italic text-bronze"> qu'il faut
   * conserver. Chaque nœud texte est remplacé par ses mots masqués, et les
   * éléments sont recréés à l'identique autour de leur contenu découpé.
   */
  const walk = (node) => {
    const out = [];

    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent;
        if (!text.trim()) {
          // on garde les espaces significatifs entre deux éléments
          if (text.length) out.push(document.createTextNode(" "));
          return;
        }

        text.trim().split(/\s+/).forEach((word, i, arr) => {
          const outer = document.createElement("span");
          outer.className = "split-line";
          outer.setAttribute("aria-hidden", "true");

          const inner = document.createElement("span");
          inner.className = "split-inner";
          inner.textContent = word;

          outer.appendChild(inner);
          out.push(outer);
          if (i < arr.length - 1) out.push(document.createTextNode(" "));
        });

        // espace de bord conservé (ex. "Quatre métiers, " + <span>)
        if (/\s$/.test(text)) out.push(document.createTextNode(" "));
        return;
      }

      if (child.nodeType === Node.ELEMENT_NODE) {
        const clone = child.cloneNode(false);
        clone.setAttribute("aria-hidden", "true");
        walk(child).forEach((n) => clone.appendChild(n));
        out.push(clone);
      }
    });

    return out;
  };

  const parts = walk(el);
  el.innerHTML = "";
  parts.forEach((n) => el.appendChild(n));

  return Array.from(el.querySelectorAll(".split-inner"));
}

/** Same idea, one node per character. Used for the takeover word. */
export function splitChars(el) {
  if (!el || el.dataset.split === "true") {
    return el ? Array.from(el.querySelectorAll(".char")) : [];
  }

  const source = el.textContent.trim();
  el.dataset.split = "true";
  el.setAttribute("aria-label", source);
  el.innerHTML = "";

  source.split("").forEach((char) => {
    const span = document.createElement("span");
    span.className = "char";
    span.style.display = "inline-block";
    span.style.willChange = "transform";
    span.textContent = char === " " ? "\u00A0" : char;
    span.setAttribute("aria-hidden", "true");
    el.appendChild(span);
  });

  return Array.from(el.querySelectorAll(".char"));
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
