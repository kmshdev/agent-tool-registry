#!/usr/bin/env node
import { readFile, mkdir, access, rename } from "node:fs/promises";
import { lookup } from "node:dns/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { previewPath } from "../server/previews.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const directory = path.join(root, ".registry");
const limit = Math.max(1, Math.min(2000, Number(process.argv[2]) || 60));
const snapshot = JSON.parse(await readFile(path.join(directory, "registry.json"), "utf8"));
const entries = snapshot.entries
  .filter((e) => e.source === "github")
  .sort((a, b) => (b.starredAt ?? "").localeCompare(a.starredAt ?? ""))
  .slice(0, limit)
  .filter((e) => e.homepage);
await mkdir(path.join(directory, "previews"), { recursive: true, mode: 0o700 });
const browser = await chromium.launch({
  headless: true,
  ...(process.env.PREVIEW_BROWSER_PATH ? { executablePath: process.env.PREVIEW_BROWSER_PATH } : {}),
});
const permitted = new Map();
async function publicUrl(value) {
  const url = new URL(value);
  if (
    !["https:", "http:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    (url.port && !["80", "443"].includes(url.port))
  )
    return false;
  if (!permitted.has(url.hostname))
    permitted.set(
      url.hostname,
      lookup(url.hostname, { all: true })
        .then(
          (addresses) =>
            addresses.length > 0 &&
            addresses.every(
              ({ address }) =>
                !/^(127\.|10\.|192\.168\.|169\.254\.|0\.|172\.(1[6-9]|2\d|3[01])\.|100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.|::|f[cd]|fe[89ab])/i.test(
                  address,
                ),
            ),
        )
        .catch(() => false),
    );
  return permitted.get(url.hostname);
}
const results = [];
try {
  for (const entry of entries) {
    const destination = previewPath(directory, entry);
    try {
      await access(destination);
      results.push({ id: entry.id, status: "cached" });
      continue;
    } catch {
      /* New capture. */
    }
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      deviceScaleFactor: 1,
      serviceWorkers: "block",
      acceptDownloads: false,
    });
    try {
      await context.route("**/*", async (route) => {
        if (await publicUrl(route.request().url()).catch(() => false)) await route.continue();
        else await route.abort();
      });
      await context.routeWebSocket("**/*", (socket) => socket.close());
      const page = await context.newPage();
      const response = await page.goto(entry.homepage, {
        waitUntil: "domcontentloaded",
        timeout: 25000,
      });
      if (!response?.ok()) throw new Error(`HTTP ${response?.status() ?? "no response"}`);
      await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
      await page.evaluate(() =>
        Promise.race([document.fonts.ready, new Promise((resolve) => setTimeout(resolve, 3000))]),
      );
      await page.waitForTimeout(2500);
      await page.screenshot({
        path: `${destination}.tmp`,
        type: "jpeg",
        quality: 78,
        animations: "disabled",
        timeout: 10000,
      });
      await rename(`${destination}.tmp`, destination);
      results.push({ id: entry.id, status: "captured", url: entry.homepage });
    } catch (error) {
      results.push({ id: entry.id, status: "failed", error: error.message });
    } finally {
      await context.close();
    }
    console.log(JSON.stringify(results.at(-1)));
  }
} finally {
  await browser.close();
}
console.log(
  JSON.stringify({
    total: results.length,
    captured: results.filter((r) => r.status === "captured").length,
    cached: results.filter((r) => r.status === "cached").length,
    failed: results.filter((r) => r.status === "failed").length,
  }),
);
