// Curated invocation hints are matched only to observed executable names.
export const hints = {
  rg: ["Search code and logs", 'rg "pattern" .', "Search", ["code search", "regex", "files"]],
  fd: ["Find files by name", 'fd "pattern"', "Search", ["files", "discovery"]],
  "ast-grep": [
    "Search and rewrite syntax trees",
    "ast-grep --pattern '$FUNC($$$)' --lang ts",
    "Search",
    ["ast", "refactor", "code"],
  ],
  sg: ["Syntax-aware code search", "sg --help", "Search", ["ast", "code"]],
  vp: [
    "Vite+ development toolchain",
    "vp check",
    "Development",
    ["svelte", "typescript", "test", "build"],
  ],
  vpx: [
    "Run a package command with Vite+",
    "vpx --help",
    "Development",
    ["packages", "javascript"],
  ],
  node: ["JavaScript runtime", "node --version", "Development", ["javascript", "runtime"]],
  bun: ["JavaScript runtime and toolkit", "bun --help", "Development", ["javascript", "runtime"]],
  deno: [
    "JavaScript and TypeScript runtime",
    "deno --help",
    "Development",
    ["typescript", "runtime"],
  ],
  uv: [
    "Python packages, environments, and tools",
    "uv run --help",
    "Development",
    ["python", "packages"],
  ],
  ruff: ["Python linting and formatting", "ruff check .", "Development", ["python", "lint"]],
  ty: ["Python type checker", "ty check", "Development", ["python", "types"]],
  cargo: [
    "Rust build and package tool",
    "cargo clippy -- -D warnings",
    "Development",
    ["rust", "build", "test"],
  ],
  rustc: ["Rust compiler", "rustc --version", "Development", ["rust", "compiler"]],
  go: ["Go compiler and tools", "go version", "Development", ["go", "compiler"]],
  git: ["Version control", "git status --short", "Development", ["git", "source control"]],
  gh: [
    "GitHub CLI",
    "gh repo view --json name,description,url",
    "Automation",
    ["github", "pull requests", "issues"],
  ],
  rtk: [
    "Compact command output for agents",
    "rtk proxy <command>",
    "Agents",
    ["tokens", "cli", "agents"],
  ],
  codex: ["Codex coding agent", "codex --help", "Agents", ["coding", "openai", "agent"]],
  claude: ["Claude coding agent", "claude --help", "Agents", ["coding", "agent"]],
  firecrawl: [
    "Web search, extraction, and browser workflows",
    "firecrawl --help",
    "Browser & web",
    ["web", "scrape", "research"],
  ],
  steel: ["Browser automation CLI", "steel --help", "Browser & web", ["browser", "automation"]],
  "playwright-cli": [
    "Browser interaction and verification",
    "playwright-cli --help",
    "Browser & web",
    ["browser", "screenshot", "testing"],
  ],
  playwright: [
    "Browser automation and testing",
    "playwright --help",
    "Browser & web",
    ["browser", "testing"],
  ],
  docker: [
    "Containers and local services",
    "docker ps",
    "Infrastructure",
    ["containers", "services"],
  ],
  kubectl: [
    "Kubernetes administration",
    "kubectl config current-context",
    "Infrastructure",
    ["kubernetes", "cloud"],
  ],
  railway: ["Railway deployment CLI", "railway status", "Infrastructure", ["deploy", "cloud"]],
  wrangler: [
    "Cloudflare development CLI",
    "wrangler --help",
    "Infrastructure",
    ["cloudflare", "deploy"],
  ],
  temporal: [
    "Workflow orchestration",
    "temporal --help",
    "Automation",
    ["workflow", "orchestration"],
  ],
  jq: ["Query and transform JSON", 'jq "." file.json', "Data", ["json", "filter"]],
  yq: ["Query structured documents", "yq --help", "Data", ["yaml", "json"]],
  duckdb: ["Analytical SQL database", "duckdb --help", "Data", ["sql", "analytics"]],
  ffmpeg: ["Process audio and video", "ffmpeg -version", "Media", ["video", "audio"]],
  magick: ["Image processing", "magick --version", "Media", ["images"]],
  brew: ["Homebrew package manager", "brew list --versions", "Development", ["packages", "macos"]],
  prek: ["Fast pre-commit hooks", "prek run", "Development", ["hooks", "lint"]],
  shellcheck: ["Shell script analysis", "shellcheck script.sh", "Development", ["shell", "lint"]],
  shfmt: ["Shell script formatter", "shfmt -d script.sh", "Development", ["shell", "format"]],
  actionlint: ["GitHub Actions validation", "actionlint", "Automation", ["github", "ci"]],
  zizmor: [
    "GitHub Actions security audit",
    "zizmor .github/workflows",
    "Automation",
    ["github", "security"],
  ],
  trash: ["Recoverable file deletion", "trash --help", "System", ["files", "macos"]],
  wt: ["Worktree management", "wt --help", "Development", ["git", "worktrees"]],
};

export const categories = [
  "Agents",
  "Browser & web",
  "Development",
  "Automation",
  "Infrastructure",
  "Data",
  "Design",
  "Media",
  "Search",
  "System",
  "Other",
];

export function classify(text) {
  const value = text.toLowerCase();
  const rules = [
    ["Browser & web", /playwright|puppeteer|browser.?(automation|use)|web.?scrap|crawl|selenium/],
    ["Agents", /\bagents?\b|\bllm\b|\bmcp\b|codex|claude|langchain|langgraph|autogen/],
    ["Automation", /automat|workflow|orchestrat|github.actions|\brpa\b/],
    ["Infrastructure", /kubernetes|docker|terraform|deploy|infrastructure|cloudflare|devops/],
    ["Data", /database|\bsql\b|analytics|dataframe|etl|data.pipeline|vector.database/],
    ["Design", /\bui\b|\bux\b|design|component|svelte|tailwind|figma|animation/],
    ["Media", /video|audio|image|ffmpeg|music|photo/],
    ["Search", /search|retrieval|ripgrep/],
    [
      "Development",
      /compiler|runtime|developer|framework|javascript|typescript|python|rust|\bcli\b|\bsdk\b/,
    ],
    ["System", /macos|terminal|shell|system|window.manager/],
  ];
  return rules.find(([, rule]) => rule.test(value))?.[0] ?? "Other";
}

export function normalizeStar(item) {
  const repo = item.repo ?? item;
  if (!repo.full_name || !repo.html_url) throw new Error("Invalid GitHub repository payload");
  return {
    id: `github:${repo.full_name.toLowerCase()}`,
    name: repo.name,
    owner: repo.owner?.login ?? repo.full_name.split("/")[0],
    description: repo.description ?? "",
    source: "github",
    kind: "Repository",
    status: "Starred",
    category: classify([repo.name, repo.description, ...(repo.topics ?? [])].join(" ")),
    tags: repo.topics ?? [],
    url: repo.html_url,
    language: repo.language ?? "",
    stars: repo.stargazers_count ?? 0,
    archived: Boolean(repo.archived),
    updatedAt: repo.updated_at,
    starredAt: item.starred_at,
    evidence: `GitHub starred repository · ${repo.full_name}`,
    categoryBasis: "Inferred from repository name, description, and topics",
  };
}
