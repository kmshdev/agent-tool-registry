import { splitText, type TextSplit } from "kugiri";

/** Replay a masked word reveal when a heading enters the viewport. */
export function revealText(node: HTMLElement) {
  let split: TextSplit | undefined;
  let animations: Animation[] = [];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const observer = new IntersectionObserver(
    ([entry]) => {
      animations.forEach((a) => a.cancel());
      split?.revert();
      split = undefined;
      if (!entry.isIntersecting || reduce.matches) return;
      split = splitText(node, { type: ["words"], mask: "words" });
      animations = split.words.map((word, i) =>
        word.animate(
          [
            { opacity: 0, transform: "translateY(105%) rotate(2deg)" },
            { opacity: 1, transform: "translateY(0) rotate(0)" },
          ],
          { duration: 650, delay: i * 55, easing: "cubic-bezier(.16,1,.3,1)", fill: "backwards" },
        ),
      );
      const current = split;
      void Promise.all(animations.map((a) => a.finished))
        .then(() => {
          if (split === current) {
            split?.revert();
            split = undefined;
          }
        })
        .catch(() => {});
    },
    { threshold: 0.25 },
  );
  const reset = () => {
    animations.forEach((a) => a.cancel());
    split?.revert();
    split = undefined;
  };
  window.addEventListener("resize", reset);
  observer.observe(node);
  return {
    destroy() {
      window.removeEventListener("resize", reset);
      observer.disconnect();
      animations.forEach((a) => a.cancel());
      split?.revert();
    },
  };
}

/** Pause decorative loops outside the viewport. */
export function inViewMotion(node: HTMLElement) {
  const observer = new IntersectionObserver(([entry]) =>
    node.classList.toggle("in-view", entry.isIntersecting),
  );
  observer.observe(node);
  return {
    destroy() {
      observer.disconnect();
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

/** Reveal the whole card as it enters either edge of the scroll viewport. */
export function revealCard(node: HTMLElement) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  let animation: Animation | undefined;
  const observer = new IntersectionObserver(
    ([entry]) => {
      animation?.cancel();
      if (!entry.isIntersecting || reduce.matches) return;
      const direction = entry.boundingClientRect.left > innerWidth / 2 ? 1 : -1;
      animation = node.animate(
        [
          { opacity: 0, translate: `${direction * 34}px 28px`, filter: "blur(3px)" },
          { opacity: 1, translate: "0 0", filter: "blur(0)" },
        ],
        { duration: 650, easing: "cubic-bezier(.16,1,.3,1)", fill: "backwards" },
      );
    },
    { threshold: 0.12 },
  );
  observer.observe(node);
  return {
    destroy() {
      observer.disconnect();
      animation?.cancel();
    },
  };
}
