/** Bounded DOM range, with neighboring cards ready before they enter the viewport. */
export function timelineRange(offset: number, width: number, stride: number, count: number) {
  const start = Math.max(0, Math.floor(offset / stride) - 2);
  const end = Math.min(count, Math.ceil((offset + width) / stride) + 2);
  return { start: Math.min(start, Math.max(0, count - 1)), end };
}

export function timelinePosition(scrollY: number, sceneStart: number, travel: number) {
  return Math.max(0, Math.min(travel, scrollY - sceneStart));
}

/** The document owns progress. Horizontal gestures are explicit inputs, never scroll feedback. */
export function timelineScroll(
  track: HTMLElement,
  scene: HTMLElement,
  count: () => number,
  update: (metrics: {
    start: number;
    end: number;
    stride: number;
    gap: number;
    height: number;
  }) => void,
) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  let origin = 0;
  let travel = 0;
  let stride = 410;
  let gap = 50;
  let width = 0;
  let height = 0;
  let position = 0;
  let frame = 0;
  let disposed = false;
  let touch: { x: number; y: number; position: number } | undefined;
  let lastMetrics = "";

  function publish() {
    const range = timelineRange(position, width, stride, count());
    const metrics = { ...range, stride, gap, height };
    const key = `${range.start}:${range.end}:${stride}:${gap}:${height}`;
    if (key !== lastMetrics) {
      lastMetrics = key;
      update(metrics);
    }
  }
  function project() {
    frame = 0;
    position = reduce.matches ? track.scrollLeft : timelinePosition(window.scrollY, origin, travel);
    if (!reduce.matches && Math.abs(track.scrollLeft - position) > 0.5) track.scrollLeft = position;
    publish();
  }
  function schedule() {
    if (!frame) frame = requestAnimationFrame(project);
  }
  function measure() {
    if (disposed || !track.isConnected) return;
    const style = getComputedStyle(track);
    gap = parseFloat(style.columnGap) || 0;
    const slot = track.querySelector<HTMLElement>(".timeline-slot");
    stride = (slot?.offsetWidth || 360) + gap;
    width = track.clientWidth;
    const sticky = track.parentElement!;
    const stickyTop = parseFloat(getComputedStyle(sticky).top) || 0;
    origin = scene.getBoundingClientRect().top + window.scrollY - stickyTop;
    travel = Math.max(0, count() * stride - gap - width);
    height = sticky.clientHeight + (reduce.matches ? 0 : travel);
    project();
  }
  function seek(left: number) {
    position = Math.max(0, Math.min(travel, left));
    track.scrollLeft = position;
    publish();
    if (!reduce.matches) window.scrollTo({ top: origin + position, behavior: "instant" });
  }
  function wheel(event: WheelEvent) {
    if (reduce.matches || event.ctrlKey || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
    event.preventDefault();
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? width : 1;
    seek(position + event.deltaX * unit);
  }
  function keydown(event: KeyboardEvent) {
    if (reduce.matches || event.target !== track || event.metaKey || event.ctrlKey || event.altKey)
      return;
    const delta: Record<string, number> = {
      ArrowLeft: -stride,
      ArrowRight: stride,
      PageUp: -width,
      PageDown: width,
      Home: -travel,
      End: travel,
    };
    if (!(event.key in delta)) return;
    event.preventDefault();
    seek(position + delta[event.key]);
  }
  function focus(event: FocusEvent) {
    const card = (event.target as HTMLElement).closest<HTMLElement>("[data-timeline-index]");
    if (!card || reduce.matches) return;
    const left = Number(card.dataset.timelineIndex) * stride;
    if (left < position || left + stride - gap > position + width) seek(left);
  }
  function pointerdown(event: PointerEvent) {
    if (event.pointerType === "touch" && !reduce.matches)
      touch = { x: event.clientX, y: event.clientY, position };
  }
  function pointermove(event: PointerEvent) {
    if (!touch || Math.abs(event.clientX - touch.x) <= Math.abs(event.clientY - touch.y)) return;
    seek(touch.position + touch.x - event.clientX);
  }
  function pointerup() {
    touch = undefined;
  }
  const nativeScroll = () => {
    if (reduce.matches) schedule();
  };
  const resize = new ResizeObserver(measure);
  resize.observe(track);
  resize.observe(scene.parentElement!);
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", measure);
  reduce.addEventListener("change", measure);
  track.addEventListener("scroll", nativeScroll, { passive: true });
  track.addEventListener("wheel", wheel, { passive: false });
  track.addEventListener("keydown", keydown);
  track.addEventListener("focusin", focus);
  track.addEventListener("pointerdown", pointerdown, { passive: true });
  track.addEventListener("pointermove", pointermove, { passive: true });
  track.addEventListener("pointerup", pointerup);
  track.addEventListener("pointercancel", pointerup);
  void document.fonts.ready.then(measure);
  measure();
  return {
    measure,
    seek,
    get stride() {
      return stride;
    },
    destroy() {
      disposed = true;
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      reduce.removeEventListener("change", measure);
      track.removeEventListener("scroll", nativeScroll);
      track.removeEventListener("wheel", wheel);
      track.removeEventListener("keydown", keydown);
      track.removeEventListener("focusin", focus);
      track.removeEventListener("pointerdown", pointerdown);
      track.removeEventListener("pointermove", pointermove);
      track.removeEventListener("pointerup", pointerup);
      track.removeEventListener("pointercancel", pointerup);
    },
  };
}
