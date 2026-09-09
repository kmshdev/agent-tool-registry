#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const command = args.shift() ?? "help";
const option = (name, fallback) => {
  const i = args.indexOf(name);
  if (i < 0) return fallback;
  const value = args[i + 1];
  args.splice(i, 2);
  return value ?? fallback;
};
const source = option("--source", "");
const limit = Math.max(1, Math.min(2000, Number(option("--limit", "20")) || 20));
const print = (value) => console.log(JSON.stringify(value, null, 2));
if (command === "help" || command === "--help") {
  console.log(
    'Tool registry\n\n  node scripts/registry.mjs search "browser automation" [--source cli|brew|agents|apps|github|custom] [--limit 20]\n  node scripts/registry.mjs stats\n  node scripts/registry.mjs get "cli:rg"\n  node scripts/registry.mjs refresh [all|cli|brew|agents|apps|github]\n  node scripts/registry.mjs export\n\nSearch and export read the durable snapshot even when the app is stopped. Refresh needs the local server on port 4317.',
  );
} else if (command === "refresh") {
  const response = await fetch("http://127.0.0.1:4317/api/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source: args[0] || "all" }),
  });
  print(await response.json());
  if (!response.ok) process.exitCode = 1;
} else {
  try {
    const snapshot = JSON.parse(await readFile(path.join(root, ".registry/registry.json"), "utf8"));
    const entries = snapshot.entries.map((entry) => ({
      ...entry,
      ...snapshot.preferences[entry.id],
    }));
    if (command === "stats")
      print({ revision: snapshot.revision, total: entries.length, sources: snapshot.sources });
    else if (command === "export")
      print({ revision: snapshot.revision, sources: snapshot.sources, entries });
    else if (command === "get") {
      const entry = entries.find((entry) => entry.id === args[0]);
      if (!entry) {
        print({ error: "Record not found" });
        process.exitCode = 1;
      } else print(entry);
    } else if (command === "search") {
      const terms = args.join(" ").toLowerCase().split(/\s+/).filter(Boolean);
      const matches = entries
        .filter(
          (entry) =>
            (!source || entry.source === source) &&
            terms.every((term) =>
              `${entry.name} ${entry.description} ${entry.category} ${entry.tags.join(" ")}`
                .toLowerCase()
                .includes(term),
            ),
        )
        .sort(
          (a, b) =>
            Number(Boolean(b.favorite)) - Number(Boolean(a.favorite)) ||
            Number(b.status === "Installed") - Number(a.status === "Installed") ||
            Number(Boolean(b.command)) - Number(Boolean(a.command)) ||
            a.name.localeCompare(b.name),
        );
      print({
        total: matches.length,
        revision: snapshot.revision,
        sources: snapshot.sources,
        entries: matches.slice(0, limit),
      });
    } else {
      print({ error: `Unknown command: ${command}` });
      process.exitCode = 1;
    }
  } catch (error) {
    print({
      error:
        error.code === "ENOENT" ? "No snapshot yet. Start the app with vp dev." : error.message,
    });
    process.exitCode = 1;
  }
}
