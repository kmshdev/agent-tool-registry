export type RegistryRoute = {
  view: "overview" | "list" | "map" | "activity";
  section: string;
  selectedId: string;
  sourcesOpen: boolean;
};
const views = ["overview", "list", "map", "activity"];
const sections = ["all", "cli", "brew", "agents", "apps", "github", "favorites", "custom"];
export function parseRoute(hash: string): RegistryRoute {
  const [path, query = ""] = hash.replace(/^#\/?/, "").split("?");
  const [view, section] = path.split("/");
  return {
    view: views.includes(view) ? (view as RegistryRoute["view"]) : "overview",
    section: sections.includes(section) ? section : "all",
    selectedId: new URLSearchParams(query).get("resource") ?? "",
    sourcesOpen: view === "sources",
  };
}
export function routeHash(route: RegistryRoute): string {
  const query = new URLSearchParams();
  if (route.selectedId) query.set("resource", route.selectedId);
  return `#/${route.sourcesOpen ? "sources" : route.view}/${route.section}${query.size ? "?" + query.toString() : ""}`;
}
