import type { Entry } from "./types";

// Curated owned projects. Keep these separate from the starred collection.
const projects = [
  {
    slug: "lwc-databento-adapter",
    name: "Databento Adapter",
    language: "Rust / TypeScript",
    category: "Data",
    description:
      "A bridge from market history to live charts. A Rust gateway and TypeScript adapter bring Databento data into Lightweight Charts.",
  },
  {
    slug: "codex-harness",
    name: "Codex Harness",
    language: "Rust",
    category: "Agents",
    description:
      "Give an agent a durable working context. A Rust CLI scaffolds project guidance and audits it for unfinished placeholders and drift.",
  },
  {
    slug: "claude-resource-limiter",
    name: "Claude Resource Limiter",
    language: "Swift / Shell",
    category: "System",
    description:
      "Put a boundary around background work. A macOS utility and shell wrapper help manage Claude’s CPU and memory use.",
  },
  {
    slug: "deepwiki-mcp-server",
    name: "DeepWiki MCP Server",
    language: "Rust",
    category: "Development",
    description:
      "Bring repository knowledge into the editor. A Zed extension connects to DeepWiki through a native MCP bridge.",
  },
];
export const featuredProjects: Entry[] = projects.map((project) => ({
  id: `project:kmshdev/${project.slug}`,
  name: project.name,
  source: "github",
  kind: "Project",
  status: "Open source",
  category: project.category,
  description: project.description,
  language: project.language,
  owner: "kmshdev",
  tags: [project.category, ...project.language.split(" / ")],
  url: `https://github.com/kmshdev/${project.slug}`,
  evidence: `Public repository and README: github.com/kmshdev/${project.slug}`,
  categoryBasis:
    project.slug === "codex-harness"
      ? "Adapted from Walking Labs’ advanced harness pack; see the repository for credits."
      : "Selected from KMSH’s public projects.",
}));
