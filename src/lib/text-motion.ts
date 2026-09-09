import { splitText, type TextSplit } from "kugiri";

/** Kugiri owns only the split; this action owns animation, resizing and cleanup. */
export function revealText(node: HTMLElement) {
  let disposed = false;
  let split: TextSplit | undefined;
  let animations: Animation[] = [];
  let observer: ResizeObserver | undefined;
  let frame = 0;
  void document.fonts.ready.then(() => {
    if (disposed || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    split = splitText(node, { type: ["words"], mask: "words" });
    animations = split.words.map((word, i) =>
      word.animate(
        [
          { opacity: 0, transform: "translateY(100%)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        { duration: 500, delay: i * 45, easing: "cubic-bezier(.22,1,.36,1)", fill: "backwards" },
      ),
    );
    void Promise.all(animations.map((item) => item.finished))
      .then(() => {
        split?.revert();
        split = undefined;
      })
      .catch(() => {});
    let width = node.clientWidth;
    observer = new ResizeObserver(() => {
      if (width === node.clientWidth) return;
      width = node.clientWidth;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        animations.forEach((item) => item.cancel());
        split?.revert();
        split = undefined;
      });
    });
    observer.observe(node);
  });
  return {
    destroy() {
      disposed = true;
      observer?.disconnect();
      cancelAnimationFrame(frame);
      animations.forEach((item) => item.cancel());
      split?.revert();
    },
  };
}

/** Svelte adaptation of Fancy Components' character-distance falloff. */
export function cursorProximity(node: HTMLElement) {
  const original = node.textContent ?? "";
  if (
    matchMedia("(prefers-reduced-motion: reduce)").matches ||
    !matchMedia("(hover:hover)").matches
  )
    return {};
  node.setAttribute("aria-label", original);
  const fragment = document.createDocumentFragment();
  const letters = Array.from(original).map((char) => {
    const span = document.createElement("span");
    span.textContent = char;
    span.setAttribute("aria-hidden", "true");
    span.style.whiteSpace = "pre-wrap";
    fragment.append(span);
    return span;
  });
  node.replaceChildren(fragment);
  const container = node.closest<HTMLElement>("[data-proximity-card]") ?? node;
  let frame = 0;
  function move(event: PointerEvent) {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const values = letters.map((letter) => {
        const box = letter.getBoundingClientRect();
        return Math.max(
          0,
          1 -
            Math.hypot(
              event.clientX - box.x - box.width / 2,
              event.clientY - box.y - box.height / 2,
            ) /
              140,
        );
      });
      letters.forEach((letter, i) => {
        letter.style.fontVariationSettings = `"wght" ${400 + 300 * values[i] ** 2}`;
        letter.style.color = values[i] > 0.45 ? "var(--accent)" : "";
      });
    });
  }
  function leave() {
    cancelAnimationFrame(frame);
    letters.forEach((letter) => {
      letter.style.fontVariationSettings = "";
      letter.style.color = "";
    });
  }
  container.addEventListener("pointermove", move);
  container.addEventListener("pointerleave", leave);
  return {
    destroy() {
      cancelAnimationFrame(frame);
      container.removeEventListener("pointermove", move);
      container.removeEventListener("pointerleave", leave);
      node.textContent = original;
      node.removeAttribute("aria-label");
    },
  };
}
