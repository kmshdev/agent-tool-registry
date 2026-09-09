import type { Entry } from "./types";

// Curated work and credited contributions, separate from starred counts and annotations.
const projects = [
  {
    owner: "kmshdev",
    slug: "lwc-databento-adapter",
    name: "Databento Adapter",
    language: "Rust / TypeScript",
    category: "Data",
    kind: "Project",
    archived: false,
    description:
      "A bridge from market history to live charts. A Rust gateway and TypeScript adapter bring Databento data into Lightweight Charts.",
    contribution:
      "Built a history-to-live market-data adapter with credentials kept in the Rust gateway. MIT licensed.",
  },
  {
    owner: "valory-xyz",
    slug: "trader",
    name: "Olas Trader",
    language: "Python",
    category: "Automation",
    kind: "Contribution",
    archived: false,
    description:
      "An autonomous prediction-market agent. My contributions include bet-placement reliability, tool selection, Mech integration, and staking checks.",
    contribution:
      "Contributor to Valory’s Olas Trader, alongside its wider team. Apache-2.0 licensed; not a solo project.",
  },
  {
    owner: "kmshdev",
    slug: "plugins",
    name: "CSS Tokenography",
    language: "Python / CSS",
    category: "Design",
    kind: "Project",
    archived: false,
    description:
      "Turn CSS standards into practical tooling. A deterministic router connects 17 specialists with source inventories, Python adapters, and validation scripts.",
    contribution:
      "Built the CSS Tokenography suite in my MIT-licensed plugin marketplace, with source provenance and coverage checks.",
    sourceUrl: "https://github.com/kmshdev/plugins/tree/main/plugins/css-tokenography",
  },
  {
    owner: "valory-xyz",
    slug: "agents-fun-eliza",
    name: "Agents.fun / Eliza",
    language: "Python / Rust",
    category: "Agents",
    kind: "Contribution",
    archived: true,
    description:
      "An Eliza-based autonomous-agent integration. My work covers local runtime, middleware, storage health checks, and cross-platform binary delivery.",
    contribution:
      "Contributor to Valory’s agent integration, alongside its wider team. Apache-2.0 licensed; now archived.",
  },
];
export const featuredProjects: Entry[] = projects.map((project) => ({
  id: `project:${project.owner}/${project.slug}`,
  name: project.name,
  source: "github",
  kind: project.kind,
  status: "Open source",
  category: project.category,
  description: project.description,
  language: project.language,
  owner: project.owner,
  tags: [
    project.category,
    project.kind === "Contribution" ? "Contributor" : "Author",
    ...project.language.split(" / "),
  ],
  url: project.sourceUrl ?? `https://github.com/${project.owner}/${project.slug}`,
  evidence: `Public source and contribution history: github.com/${project.owner}/${project.slug}`,
  categoryBasis: project.contribution,
  archived: project.archived,
}));
