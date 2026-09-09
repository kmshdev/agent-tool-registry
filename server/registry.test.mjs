import { describe, it, expect, afterEach } from "vite-plus/test";
import { mkdtemp, readFile, readdir, unlink, rmdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { Registry } from "./registry.mjs";
import { classify, normalizeStar } from "./catalog.mjs";
import { trustedRequest, handler } from "./http.mjs";
import { createServer } from "node:http";
import { configurationMetadata } from "./discover.mjs";

const directories = [];
async function make(scanners) {
  const dir = await mkdtemp(path.join(tmpdir(), "codex-registry-test-"));
  directories.push(dir);
  return new Registry(dir, scanners).load();
}
const cli = (name) => ({
  id: `cli:${name}`,
  name,
  source: "cli",
  tags: [],
  kind: "CLI",
  category: "Development",
  status: "Installed",
});
afterEach(async () => {
  for (const directory of directories.splice(0)) {
    for (const file of await readdir(directory)) await unlink(path.join(directory, file));
    await rmdir(directory);
  }
});

describe("durable source reconciliation", () => {
  it("removes missing detections while preserving notes, favorites, and other sources", async () => {
    let entries = [cli("rg"), cli("old")];
    const registry = await make({ cli: async () => entries });
    await registry.refresh("cli");
    await registry.annotate("cli:rg", { favorite: true, notes: "Search first" });
    const custom = await registry.add({
      name: "Reference",
      category: "Development",
      description: "A useful link",
      url: "https://example.com",
    });
    entries = [cli("rg"), cli("new")];
    await registry.refresh("cli");
    const reopened = await new Registry(registry.directory, {}).load();
    expect(reopened.snapshot().entries.map((e) => e.id)).toEqual([custom, "cli:rg", "cli:new"]);
    expect(reopened.snapshot().entries.find((e) => e.id === "cli:rg")).toMatchObject({
      favorite: true,
      notes: "Search first",
    });
  });
  it("retains the last good snapshot and does not leak subprocess output on failure", async () => {
    let fail = false;
    const registry = await make({
      cli: async () => {
        if (fail) throw new Error("credential=secret");
        return [cli("rg")];
      },
    });
    await registry.refresh("cli");
    const previousTime = registry.state.sources.cli.updatedAt;
    fail = true;
    await registry.refresh("cli");
    expect(registry.snapshot().entries).toHaveLength(1);
    expect(registry.state.sources.cli).toMatchObject({ status: "error", updatedAt: previousTime });
    expect(JSON.stringify(registry.snapshot())).not.toContain("secret");
  });
  it("serializes simultaneous writes and deduplicates in-flight source refreshes", async () => {
    let calls = 0;
    let release;
    const gate = new Promise((resolve) => (release = resolve));
    const registry = await make({
      cli: async () => {
        calls++;
        await gate;
        return [cli("rg")];
      },
    });
    const first = registry.refresh("cli");
    const second = registry.refresh("cli");
    release();
    await Promise.all([first, second]);
    await Promise.all([
      registry.annotate("cli:rg", { favorite: true }),
      registry.annotate("cli:rg", { notes: "preserved" }),
    ]);
    expect(calls).toBe(1);
    expect(registry.snapshot().entries[0]).toMatchObject({ favorite: true, notes: "preserved" });
    expect(
      JSON.parse(await readFile(path.join(registry.directory, "registry.json"), "utf8")).revision,
    ).toBe(4);
  });
});

describe("API boundaries", () => {
  it("rejects foreign origins, cross-site fetches, and rebound hostnames", () => {
    expect(
      trustedRequest({ headers: { host: "127.0.0.1:4317", origin: "http://127.0.0.1:4317" } }),
    ).toBe(true);
    expect(
      trustedRequest({ headers: { host: "127.0.0.1:4317", origin: "https://evil.example" } }),
    ).toBe(false);
    expect(trustedRequest({ headers: { host: "evil.example:4317" } })).toBe(false);
    expect(
      trustedRequest({ headers: { host: "localhost:4317", "sec-fetch-site": "cross-site" } }),
    ).toBe(false);
  });
  it("validates user data and permits deletion only for custom entries", async () => {
    const registry = await make({ cli: async () => [cli("rg")] });
    await registry.refresh("cli");
    await expect(registry.annotate("cli:rg", { command: "arbitrary" })).rejects.toThrow(
      "Invalid annotation",
    );
    await expect(registry.annotate("cli:rg", { notes: "x".repeat(8001) })).rejects.toThrow();
    await expect(registry.remove("cli:rg")).rejects.toThrow("Only custom");
    await expect(
      registry.add({ name: "x", category: "Other", description: "", url: "javascript:alert(1)" }),
    ).rejects.toThrow();
    await expect(
      registry.add({
        name: "x",
        category: "Other",
        description: "",
        url: "https://user:password@example.com",
      }),
    ).rejects.toThrow();
  });
  it("compresses large snapshots only when gzip is accepted and preserves their data", async () => {
    const entry = {
      ...cli("large-tool"),
      description: "A detailed capability description. ".repeat(100),
    };
    const registry = await make({ cli: async () => [entry] });
    await registry.refresh("cli");
    const server = createServer(handler(registry));
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const url = `http://127.0.0.1:${server.address().port}/api/registry`;
    try {
      const compressed = await fetch(url, { headers: { "Accept-Encoding": "gzip" } });
      expect(compressed.headers.get("content-encoding")).toBe("gzip");
      expect(compressed.headers.get("vary")).toBe("Accept-Encoding");
      expect(compressed.headers.get("cache-control")).toBe("no-store");
      const compressedData = await compressed.json();
      for (const encoding of ["identity", "gzip;q=0, identity"]) {
        const plain = await fetch(url, { headers: { "Accept-Encoding": encoding } });
        expect(plain.headers.get("content-encoding")).toBeNull();
        expect(await plain.json()).toEqual(compressedData);
      }
      expect(compressedData.entries[0].description).toBe(entry.description);
    } finally {
      registry.stop();
      server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
    }
  });
  it("serves searchable records, mutation errors, and revision events", async () => {
    const registry = await make({ cli: async () => [cli("rg")] });
    await registry.refresh("cli");
    const server = createServer(handler(registry));
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    const controller = new AbortController();
    try {
      const result = await fetch(`${base}/api/search?q=rg`).then((r) => r.json());
      expect(result.total).toBe(1);
      const blocked = await fetch(`${base}/api/registry`, {
        headers: { Origin: "https://example.com" },
      });
      expect(blocked.status).toBe(403);
      const invalid = await fetch(`${base}/api/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{invalid",
      });
      expect(invalid.status).toBe(400);
      const events = await fetch(`${base}/api/events`, { signal: controller.signal });
      const reader = events.body.getReader();
      expect(new TextDecoder().decode((await reader.read()).value)).toContain("revision");
      await registry.annotate("cli:rg", { favorite: true });
      expect(new TextDecoder().decode((await reader.read()).value)).toContain(
        `"revision":${registry.state.revision}`,
      );
      controller.abort();
    } finally {
      controller.abort();
      registry.stop();
      server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
    }
  });
});

describe("discovery normalization", () => {
  it("reads multiline skill metadata without treating instruction examples as metadata", () => {
    const text =
      "---\nname: browser-skill\ndescription: |\n  Browser automation\n  and screenshots.\n---\nname: fake-name\nmodel: fake-model";
    expect(configurationMetadata(text)).toEqual({
      name: "browser-skill",
      description: "Browser automation\nand screenshots.",
      model: "",
    });
    expect(
      configurationMetadata(
        'name = "reviewer"\ndescription = """Code\nreview"""\nmodel = "gpt-5.6-terra"',
        true,
      ),
    ).toMatchObject({ name: "reviewer", description: "Code\nreview", model: "gpt-5.6-terra" });
  });
  it("treats stars as discovery, preserves source attribution, and classifies explicit signals", () => {
    const record = normalizeStar({
      starred_at: "2026-09-01",
      repo: {
        full_name: "owner/browser-agent",
        name: "browser-agent",
        html_url: "https://github.com/owner/browser-agent",
        topics: ["browser-automation"],
        stargazers_count: 32,
      },
    });
    expect(record).toMatchObject({
      status: "Starred",
      category: "Browser & web",
      source: "github",
      stars: 32,
    });
    expect(record.command).toBeUndefined();
    expect(classify("Unspecified project")).toBe("Other");
  });
});
