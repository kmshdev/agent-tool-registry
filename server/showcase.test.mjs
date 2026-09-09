import { describe, expect, it } from "vite-plus/test";
import { publicSnapshot } from "./showcase.mjs";

describe("public showcase export", () => {
  it("publishes only verified public GitHub fields and excludes private or unknown visibility", () => {
    const publicEntry = {
      id: "github:owner/project",
      name: "project",
      owner: "owner",
      source: "github",
      isPublic: true,
      category: "Design",
      tags: ["ui"],
      url: "https://github.com/owner/project",
      homepage: "https://example.com",
      description: "Public description",
      notes: "private-note",
      path: "/Users/private",
      command: "private-command",
      favorite: true,
      evidence: "private-evidence",
      model: "private-model",
      futureSecret: "secret",
    };
    const output = publicSnapshot({
      entries: [
        publicEntry,
        { ...publicEntry, id: "github:owner/private", isPublic: false },
        { ...publicEntry, id: "github:owner/unknown", isPublic: undefined },
        { ...publicEntry, id: "cli:private", source: "cli" },
      ],
      preferences: { secret: true },
      activity: [{ detail: "private-log" }],
      sources: { cli: { error: "private-error" } },
    });
    expect(output.entries).toHaveLength(1);
    expect(output.entries[0]).toMatchObject({
      id: "github:owner/project",
      homepage: "https://example.com",
      description: "Public description",
    });
    for (const field of [
      "notes",
      "path",
      "command",
      "favorite",
      "model",
      "futureSecret",
      "isPublic",
    ])
      expect(output.entries[0]).not.toHaveProperty(field);
    expect(JSON.stringify(output)).not.toContain("private");
    expect(output.sources).toHaveLength(1);
    expect(output.sources[0]).toMatchObject({ id: "github", count: 1, status: "published" });
    expect(output.activity).toEqual([]);
  });
});
