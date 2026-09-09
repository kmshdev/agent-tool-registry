import { describe, expect, it } from "vite-plus/test";
import { timelinePosition, timelineRange } from "./timeline-scroll";

describe("timeline document projection", () => {
  it("starts at the sticky header offset and clamps both ends without feedback", () => {
    expect(timelinePosition(950, 1000, 24000)).toBe(0);
    expect(timelinePosition(1050, 1000, 24000)).toBe(50);
    expect(timelinePosition(26000, 1000, 24000)).toBe(24000);
    expect(timelinePosition(1050, 1000, 0)).toBe(0);
  });
  it("keeps a bounded card window after jumping across the full collection", () => {
    const range = timelineRange(1100 * 410, 1440, 410, 1397);
    expect(range.start).toBe(1098);
    expect(range.end - range.start).toBeLessThanOrEqual(8);
    expect(range.start).toBeLessThan(1100);
    expect(range.end).toBeGreaterThan(1103);
  });
  it("keeps both boundaries reachable for empty, short and final-page collections", () => {
    expect(timelineRange(0, 1440, 410, 0)).toEqual({ start: 0, end: 0 });
    expect(timelineRange(0, 1440, 410, 2)).toEqual({ start: 0, end: 2 });
    expect(timelineRange(1397 * 410 - 50 - 1440, 1440, 410, 1397).end).toBe(1397);
    expect(timelineRange(0, 390, 324, 60)).toEqual({ start: 0, end: 4 });
  });
});
