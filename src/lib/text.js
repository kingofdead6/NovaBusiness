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

  const source = el.textContent.trim();
  el.dataset.split = "true";
  el.setAttribute("aria-label", source);
  el.innerHTML = "";

  source.split(/\s+/).forEach((word, i) => {
    const outer = document.createElement("span");
    outer.className = "split-line";
    outer.style.display = "inline-block";
    outer.setAttribute("aria-hidden", "true");

    const inner = document.createElement("span");
    inner.className = "split-inner";
    inner.textContent = word;

    outer.appendChild(inner);
    el.appendChild(outer);

    if (i < source.split(/\s+/).length - 1) {
      el.appendChild(document.createTextNode(" "));
    }
  });

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
