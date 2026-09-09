import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { EventEmitter } from "node:events";
import { scanners as defaultScanners } from "./discover.mjs";
import { categories } from "./catalog.mjs";

export const sourceNames = {
  cli: "PATH executables",
  brew: "Homebrew",
  apps: "Mac applications",
  agents: "Agents & skills",
  github: "GitHub stars",
  custom: "Your collection",
};
export class Registry extends EventEmitter {
  constructor(directory, scanners = defaultScanners) {
    super();
    this.directory = directory;
    this.scanners = scanners;
    this.state = {
      schema: 1,
      revision: 0,
      sources: {},
      entries: [],
      preferences: {},
      activity: [],
    };
    this.pending = new Map();
    this.queue = Promise.resolve();
    this.timers = [];
  }
  async load() {
    await mkdir(this.directory, { recursive: true, mode: 0o700 });
    try {
      const saved = JSON.parse(await readFile(path.join(this.directory, "registry.json"), "utf8"));
      if (
        saved.schema !== 1 ||
        !Array.isArray(saved.entries) ||
        !saved.preferences ||
        !saved.sources
      )
        throw new Error("Unsupported registry snapshot");
      this.state = saved;
      for (const source of Object.values(this.state.sources))
        if (source.status === "refreshing") source.status = "stale";
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    return this;
  }
  snapshot() {
    return {
      schema: 1,
      revision: this.state.revision,
      categories,
      entries: this.state.entries.map((entry) => ({
        ...entry,
        ...this.state.preferences[entry.id],
      })),
      sources: Object.keys(sourceNames).map((id) => ({
        id,
        name: sourceNames[id],
        status: "idle",
        count: this.state.entries.filter((entry) => entry.source === id).length,
        ...this.state.sources[id],
      })),
      activity: this.state.activity,
    };
  }
  async commit(change) {
    const operation = this.queue.then(async () => {
      const next = structuredClone(this.state);
      change(next);
      next.revision += 1;
      next.activity = next.activity.slice(0, 80);
      const temporary = path.join(this.directory, `registry-${randomUUID()}.tmp`);
      await writeFile(temporary, JSON.stringify(next), { mode: 0o600 });
      await rename(temporary, path.join(this.directory, "registry.json"));
      this.state = next;
      this.emit("change", next.revision);
    });
    this.queue = operation.catch(() => {});
    return operation;
  }
  refresh(source = "all") {
    const keys = source === "all" ? Object.keys(this.scanners) : [source];
    if (keys.some((key) => !this.scanners[key])) throw new Error("Unknown source");
    return Promise.all(
      keys.map((key) => {
        if (this.pending.has(key)) return this.pending.get(key);
        const work = this.refreshOne(key).finally(() => this.pending.delete(key));
        this.pending.set(key, work);
        return work;
      }),
    );
  }
  async refreshOne(source) {
    await this.commit((state) => {
      state.sources[source] = {
        ...state.sources[source],
        status: "refreshing",
        attemptedAt: new Date().toISOString(),
      };
    });
    try {
      const entries = await this.scanners[source]();
      if (!Array.isArray(entries) || entries.some((entry) => !entry.id || entry.source !== source))
        throw new Error("Invalid scanner result");
      const now = new Date().toISOString();
      await this.commit((state) => {
        const old = new Set(
          state.entries.filter((entry) => entry.source === source).map((entry) => entry.id),
        );
        const fresh = new Set(entries.map((entry) => entry.id));
        const added = entries.filter((entry) => !old.has(entry.id)).length;
        const removed = [...old].filter((id) => !fresh.has(id)).length;
        state.entries = [
          ...state.entries.filter((entry) => entry.source !== source),
          ...entries.map((entry) => ({ ...entry, observedAt: now })),
        ];
        state.sources[source] = {
          status: "healthy",
          updatedAt: now,
          attemptedAt: now,
          count: entries.length,
          error: null,
        };
        state.activity.unshift({
          id: randomUUID(),
          source,
          at: now,
          message: `${sourceNames[source]} refreshed`,
          detail: `${entries.length.toLocaleString()} records · ${added} added · ${removed} removed`,
          status: "success",
        });
      });
      return { source, ok: true };
    } catch {
      // Subprocess errors may contain credential-bearing output; publish only a bounded diagnosis.
      const error =
        source === "github"
          ? "GitHub refresh failed. Check gh authentication and network access."
          : `${sourceNames[source]} scan failed. Check source availability and filesystem permissions.`;
      await this.commit((state) => {
        state.sources[source] = { ...state.sources[source], status: "error", error };
        state.activity.unshift({
          id: randomUUID(),
          source,
          at: new Date().toISOString(),
          message: `${sourceNames[source]} unavailable`,
          detail: error,
          status: "error",
        });
      });
      return { source, ok: false, error };
    }
  }
  async annotate(id, input) {
    if (!this.state.entries.some((entry) => entry.id === id)) throw new Error("Record not found");
    const allowed = Object.keys(input).every((key) => ["favorite", "notes"].includes(key));
    if (
      !allowed ||
      ("favorite" in input && typeof input.favorite !== "boolean") ||
      ("notes" in input && (typeof input.notes !== "string" || input.notes.length > 8000))
    )
      throw new Error("Invalid annotation");
    await this.commit((state) => {
      state.preferences[id] = { ...state.preferences[id], ...input };
    });
  }
  async add(input) {
    if (
      !input ||
      typeof input.name !== "string" ||
      !input.name.trim() ||
      input.name.length > 120 ||
      typeof input.description !== "string" ||
      input.description.length > 2000 ||
      !categories.includes(input.category)
    )
      throw new Error("Name, description, and valid category are required");
    const url = typeof input.url === "string" ? input.url : "";
    if (url && (!/^https?:\/\//i.test(url) || url.length > 2000))
      throw new Error("Use an HTTP or HTTPS URL");
    if (url) {
      const parsed = new URL(url);
      if (parsed.username || parsed.password) throw new Error("URLs cannot contain credentials");
    }
    const id = `custom:${randomUUID()}`;
    await this.commit((state) => {
      state.entries.push({
        id,
        name: input.name.trim(),
        description: input.description.trim(),
        url,
        category: input.category,
        source: "custom",
        kind: "Resource",
        status: "Saved",
        tags: [],
        observedAt: new Date().toISOString(),
        evidence: "Manually added to your collection",
        categoryBasis: "Selected by you",
      });
    });
    return id;
  }
  async remove(id) {
    if (!id.startsWith("custom:") || !this.state.entries.some((entry) => entry.id === id))
      throw new Error("Only custom records can be removed");
    await this.commit((state) => {
      state.entries = state.entries.filter((entry) => entry.id !== id);
      delete state.preferences[id];
    });
  }
  start() {
    void this.refresh("all").catch(() => {});
    const local = setInterval(() => {
      for (const source of ["cli", "brew", "apps", "agents"])
        void this.refresh(source).catch(() => {});
    }, 60000);
    const github = setInterval(() => {
      void this.refresh("github").catch(() => {});
    }, 15 * 60000);
    this.timers.push(local, github);
    for (const timer of this.timers) timer.unref();
  }
  stop() {
    for (const timer of this.timers) clearInterval(timer);
    this.removeAllListeners();
  }
}
