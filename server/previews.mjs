import { readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

export function previewPath(directory, entry) {
  const key = createHash("sha256").update(`${entry.id}\n${entry.homepage}`).digest("hex");
  return path.join(directory, "previews", `${key}.jpg`);
}

export async function withPreviews(directory, snapshot) {
  const files = new Set(
    await readdir(path.join(directory, "previews")).catch((error) => {
      if (error.code === "ENOENT") return [];
      throw error;
    }),
  );
  return {
    ...snapshot,
    entries: snapshot.entries.map((entry) => ({
      ...entry,
      ...(entry.source === "github" &&
      entry.homepage &&
      files.has(path.basename(previewPath(directory, entry)))
        ? { previewUrl: `/api/previews/${encodeURIComponent(entry.id)}` }
        : {}),
    })),
  };
}
