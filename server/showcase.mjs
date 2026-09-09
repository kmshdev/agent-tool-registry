/** Explicit allowlist: local inventory, preferences, notes and paths never leave the registry. */
export function publicSnapshot(snapshot) {
  const entries = snapshot.entries
    .filter((entry) => entry.source === "github" && entry.isPublic === true)
    .map((entry) => ({
      id: entry.id,
      name: entry.name,
      owner: entry.owner,
      description: entry.description,
      source: "github",
      kind: "Repository",
      status: "Starred",
      category: entry.category,
      tags: entry.tags,
      url: entry.url,
      ...(entry.homepage ? { homepage: entry.homepage } : {}),
      language: entry.language,
      stars: entry.stars,
      archived: entry.archived,
      updatedAt: entry.updatedAt,
      starredAt: entry.starredAt,
      evidence: `Public GitHub repository · ${entry.owner}/${entry.name}`,
      categoryBasis: "Inferred from public repository metadata",
    }));
  const publishedAt = new Date().toISOString();
  return {
    revision: Date.now(),
    publishedAt,
    entries,
    sources: [
      {
        id: "github",
        name: "Public GitHub discoveries",
        status: "published",
        count: entries.length,
        updatedAt: publishedAt,
      },
    ],
    categories: [...new Set(entries.map((entry) => entry.category))].sort(),
    activity: [],
  };
}
