import { describe, it, expect } from "vite-plus/test";
import { parseRoute, routeHash } from "./routes";
describe("bookmarkable registry navigation", () => {
  it("preserves resource ids containing URL syntax", () => {
    const route = {
      view: "list" as const,
      section: "github",
      selectedId: "github:owner/repo?x=1&y=2#ref",
      sourcesOpen: false,
    };
    expect(parseRoute(routeHash(route))).toEqual(route);
  });
  it("normalizes unknown routes without selecting arbitrary sections", () => {
    expect(parseRoute("#/unknown/unknown")).toEqual({
      view: "overview",
      section: "all",
      selectedId: "",
      sourcesOpen: false,
    });
  });
  it("restores source health as a separate destination", () => {
    expect(parseRoute("#/sources/cli").sourcesOpen).toBe(true);
    expect(routeHash({ view: "map", section: "agents", selectedId: "", sourcesOpen: false })).toBe(
      "#/map/agents",
    );
  });
});
