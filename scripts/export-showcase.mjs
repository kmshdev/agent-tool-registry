#!/usr/bin/env node
import { readFile, mkdir, copyFile, writeFile, readdir, rename } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { publicSnapshot } from "../server/showcase.mjs";
import { previewPath } from "../server/previews.mjs";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const state = JSON.parse(await readFile(path.join(root, ".registry/registry.json"), "utf8"));
const snapshot = publicSnapshot(state);
if (!snapshot.entries.length)
  throw new Error(
    "No verified public repositories. Refresh GitHub with the current importer first.",
  );
const output = path.join(root, "public/discoveries");
await mkdir(path.join(output, "previews"), { recursive: true });
let previews = 0;
for (const entry of snapshot.entries) {
  if (!entry.homepage) continue;
  const source = previewPath(path.join(root, ".registry"), entry);
  try {
    await copyFile(source, path.join(output, "previews", path.basename(source)));
    entry.previewUrl = `/discoveries/previews/${path.basename(source)}`;
    previews++;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}
const expected = new Set(
  snapshot.entries
    .filter((entry) => entry.previewUrl)
    .map((entry) => path.basename(entry.previewUrl)),
);
for (const file of await readdir(path.join(output, "previews"))) {
  if (expected.has(file)) continue;
  const retired = path.join(root, ".registry/retired-showcase-previews");
  await mkdir(retired, { recursive: true, mode: 0o700 });
  await rename(path.join(output, "previews", file), path.join(retired, Date.now() + "-" + file));
}
await writeFile(path.join(output, "registry.json"), JSON.stringify(snapshot));
console.log(
  JSON.stringify({
    publicRepositories: snapshot.entries.length,
    previews,
    publishedAt: snapshot.publishedAt,
  }),
);
