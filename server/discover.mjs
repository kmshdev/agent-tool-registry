import { readdir, readFile, access, realpath, stat } from "node:fs/promises";
import { constants } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { hints, classify, normalizeStar } from "./catalog.mjs";
import { parse as parseYaml } from "yaml";
import { parse as parseToml } from "smol-toml";

const run = promisify(execFile);
const home = homedir();
const safeDirs = async (dir) =>
  readdir(dir, { withFileTypes: true }).catch((error) => {
    if (error.code === "ENOENT") return [];
    throw error;
  });
export async function discoverCli(pathValue = process.env.PATH ?? "") {
  const dirs = [...new Set(pathValue.split(path.delimiter).filter(Boolean))];
  const found = new Map();
  for (const dir of dirs) {
    const entries = await safeDirs(dir);
    for (let i = 0; i < entries.length; i += 80) {
      await Promise.all(
        entries.slice(i, i + 80).map(async (entry) => {
          if (entry.isDirectory() || entry.name.startsWith(".")) return;
          const location = path.join(dir, entry.name);
          try {
            if (!(await stat(location)).isFile()) return;
            await access(location, constants.X_OK);
          } catch {
            return;
          }
          const existing = found.get(entry.name);
          if (existing) {
            existing.paths.push(location);
            return;
          }
          const hint = hints[entry.name];
          found.set(entry.name, {
            id: `cli:${entry.name}`,
            name: entry.name,
            source: "cli",
            kind: "CLI",
            status: "Installed",
            category:
              hint?.[2] ??
              (/^\/(usr\/bin|bin|usr\/sbin|sbin)$/.test(dir) ? "System" : "Development"),
            description: hint?.[0] ?? "Executable discovered on the local PATH.",
            command: hint?.[1] ?? "",
            tags: hint?.[3] ?? [],
            path: location,
            paths: [location],
            evidence: `Executable access verified · ${location}`,
            categoryBasis: hint
              ? "Curated capability mapping"
              : "Inferred from executable location",
            system: /^\/(usr\/bin|bin|usr\/sbin|sbin)$/.test(dir),
          });
        }),
      );
    }
  }
  return [...found.values()];
}

export async function discoverBrew() {
  const { stdout } = await run("brew", ["info", "--json=v2", "--installed"], {
    timeout: 90000,
    maxBuffer: 24 * 1024 * 1024,
    env: { ...process.env, HOMEBREW_NO_AUTO_UPDATE: "1" },
  });
  const info = JSON.parse(stdout);
  return [...(info.formulae ?? []), ...(info.casks ?? [])].map((item) => {
    const cask = Boolean(item.token);
    const name = item.token ?? item.name;
    return {
      id: `brew:${name}`,
      name,
      source: "brew",
      kind: cask ? "Package" : "Toolchain",
      status: "Installed",
      description: item.desc ?? "",
      category: classify(`${name} ${item.desc}`),
      tags: ["homebrew", cask ? "cask" : "formula"],
      version: cask
        ? String(item.installed ?? item.version ?? "")
        : (item.installed?.map((v) => v.version).join(", ") ?? ""),
      url: item.homepage ?? "",
      dependencies: [...(item.dependencies ?? []), ...(item.recommended_dependencies ?? [])],
      evidence: `Homebrew installed ${cask ? "cask" : "formula"} · ${name}`,
      categoryBasis: "Inferred from package metadata",
    };
  });
}

export async function discoverApps() {
  const roots = ["/Applications", "/System/Applications", path.join(home, "Applications")];
  const bundles = [];
  async function walk(dir, depth = 0) {
    for (const entry of await safeDirs(dir)) {
      if (!entry.isDirectory() && !entry.isSymbolicLink()) continue;
      const full = path.join(dir, entry.name);
      if (entry.name.endsWith(".app")) bundles.push(full);
      else if (depth < 2 && !entry.name.startsWith(".")) await walk(full, depth + 1);
    }
  }
  for (const root of roots) await walk(root);
  const items = [];
  for (let i = 0; i < bundles.length; i += 20) {
    await Promise.all(
      bundles.slice(i, i + 20).map(async (bundle) => {
        let info = {};
        try {
          const { stdout } = await run(
            "/usr/bin/plutil",
            ["-convert", "json", "-o", "-", path.join(bundle, "Contents/Info.plist")],
            { timeout: 5000, maxBuffer: 1024 * 1024 },
          );
          info = JSON.parse(stdout);
        } catch {
          /* The bundle itself is evidence even when its plist is unreadable. */
        }
        const name = info.CFBundleDisplayName ?? info.CFBundleName ?? path.basename(bundle, ".app");
        items.push({
          id: `app:${bundle}`,
          name,
          source: "apps",
          kind: "Mac app",
          status: "Installed",
          category: classify(`${name} ${info.LSApplicationCategoryType ?? ""}`),
          description:
            info.LSApplicationCategoryType?.replace("public.app-category.", "").replaceAll(
              "-",
              " ",
            ) ?? "macOS application",
          path: bundle,
          version: info.CFBundleShortVersionString ?? "",
          bundleId: info.CFBundleIdentifier ?? "",
          tags: ["macos"],
          evidence: `Application bundle · ${bundle}`,
          categoryBasis: "Inferred from application metadata",
          system: bundle.startsWith("/System/"),
        });
      }),
    );
  }
  return items;
}

export function configurationMetadata(text, toml = false) {
  try {
    const header = toml ? text : (text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1] ?? "");
    const data = toml ? parseToml(header) : parseYaml(header, { maxAliasCount: 20 });
    return Object.fromEntries(
      ["name", "description", "model"].map((key) => [
        key,
        typeof data?.[key] === "string" ? data[key].trim() : "",
      ]),
    );
  } catch {
    return { name: "", description: "", model: "" };
  }
}
export async function discoverAgents() {
  const roots = [
    path.join(home, ".codex/agents"),
    path.join(home, ".agents/skills"),
    path.join(home, ".codex/skills"),
    path.join(home, ".claude/agents"),
    path.join(home, ".claude/skills"),
  ];
  const seen = new Set();
  const items = [];
  async function walk(dir, depth, plugin = false) {
    if (depth > 7) return;
    const canonical = await realpath(dir).catch(() => dir);
    if (seen.has(canonical)) return;
    seen.add(canonical);
    for (const entry of await safeDirs(dir)) {
      if (
        ["node_modules", ".git", "archive", "archives", "scripts", "references", "assets"].includes(
          entry.name,
        )
      )
        continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory() || entry.isSymbolicLink()) {
        if (!entry.name.startsWith(".") || entry.name === ".system")
          await walk(full, depth + 1, plugin);
        continue;
      }
      const skill = entry.name === "SKILL.md";
      const agent =
        /\.(toml|md)$/.test(entry.name) &&
        /[/\\]agents[/\\]/.test(full) &&
        entry.name !== "README.md";
      if (!skill && !agent) continue;
      const content = await readFile(full, "utf8");
      const metadata = configurationMetadata(content, full.endsWith(".toml"));
      const name =
        metadata.name ||
        (skill ? path.basename(dir) : path.basename(full).replace(/\.(toml|md)$/, ""));
      const description = metadata.description;
      const host = full.includes("/.claude/")
        ? "Claude Code"
        : full.includes("/.codex/")
          ? "Codex"
          : "Shared";
      items.push({
        id: `agent:${full}`,
        name,
        source: "agents",
        kind: skill ? "Skill" : "Agent",
        status: plugin ? "Cached" : "Installed",
        category: classify(`${name} ${description}`),
        description: description || `${skill ? "Skill" : "Agent"} configuration`,
        path: full,
        tags: [skill ? "skill" : "subagent", host, ...(plugin ? ["plugin cache"] : [])],
        model: metadata.model,
        evidence: `${plugin ? "Plugin cache; activation not verified" : "Local configuration"} · ${full}`,
        categoryBasis: "Inferred from name and description",
        command: skill ? `Read ${full}` : "",
      });
    }
  }
  for (const root of roots) await walk(root, 0);
  // Cached plugins are explicitly distinct from verified active personal skills.
  await walk(path.join(home, ".codex/plugins/cache"), 0, true);
  return items;
}

export async function discoverGithub() {
  const { stdout } = await run(
    "gh",
    [
      "api",
      "--paginate",
      "--slurp",
      "-H",
      "Accept: application/vnd.github.star+json",
      "/user/starred?per_page=100",
    ],
    { timeout: 120000, maxBuffer: 48 * 1024 * 1024 },
  );
  const pages = JSON.parse(stdout);
  if (!Array.isArray(pages) || !pages.every(Array.isArray))
    throw new Error("Unexpected GitHub pagination response");
  return pages.flat().map(normalizeStar);
}

export const scanners = {
  cli: discoverCli,
  brew: discoverBrew,
  apps: discoverApps,
  agents: discoverAgents,
  github: discoverGithub,
};
