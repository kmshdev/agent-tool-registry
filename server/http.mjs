import { readFile } from "node:fs/promises";
import { previewPath, withPreviews } from "./previews.mjs";
import { gzip, constants } from "node:zlib";

const send = (res, status, payload) => {
  const data = Buffer.from(JSON.stringify(payload));
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    Vary: "Accept-Encoding",
  };
  const acceptsGzip = (res.req.headers["accept-encoding"] ?? "").split(",").some((part) => {
    const [encoding, ...parameters] = part.trim().toLowerCase().split(";");
    const quality = parameters.find((value) => value.trim().startsWith("q="));
    return encoding === "gzip" && (!quality || Number(quality.trim().slice(2)) > 0);
  });
  if (data.length >= 1024 && acceptsGzip) {
    gzip(data, { level: constants.Z_BEST_SPEED }, (error, compressed) => {
      if (res.destroyed) return;
      res.writeHead(status, error ? headers : { ...headers, "Content-Encoding": "gzip" });
      res.end(error ? data : compressed);
    });
  } else {
    res.writeHead(status, headers);
    res.end(data);
  }
};
export function trustedRequest(req) {
  if (!/^(127\.0\.0\.1|localhost)(:\d+)?$/.test(req.headers.host ?? "")) return false;
  if (req.headers["sec-fetch-site"] === "cross-site") return false;
  if (req.headers.origin && req.headers.origin !== `http://${req.headers.host}`) return false;
  return true;
}
async function body(req) {
  if (!req.headers["content-type"]?.startsWith("application/json"))
    throw new Error("Expected application/json");
  let text = "";
  for await (const chunk of req) {
    text += chunk;
    if (text.length > 16000) throw new Error("Request too large");
  }
  return JSON.parse(text || "{}");
}
export function handler(registry) {
  return async (req, res, next = () => send(res, 404, { error: "Not found" })) => {
    if (!req.url?.startsWith("/api/")) return next();
    if (!trustedRequest(req)) return send(res, 403, { error: "Local same-origin access required" });
    const url = new URL(req.url, "http://localhost");
    try {
      if (req.method === "GET" && url.pathname.startsWith("/api/previews/")) {
        const id = decodeURIComponent(url.pathname.slice("/api/previews/".length));
        const entry = registry
          .snapshot()
          .entries.find((item) => item.id === id && item.source === "github" && item.homepage);
        if (!entry) return send(res, 404, { error: "No project preview" });
        try {
          const image = await readFile(previewPath(registry.directory, entry));
          res.writeHead(200, {
            "Content-Type": "image/jpeg",
            "Cache-Control": "private, max-age=3600",
            "X-Content-Type-Options": "nosniff",
          });
          return res.end(image);
        } catch (error) {
          if (error.code !== "ENOENT") throw error;
          return send(res, 404, { error: "Preview not captured" });
        }
      }
      if (req.method === "GET" && url.pathname === "/api/registry")
        return send(res, 200, await withPreviews(registry.directory, registry.snapshot()));
      if (req.method === "GET" && url.pathname === "/api/search") {
        const query = (url.searchParams.get("q") ?? "").toLowerCase();
        const source = url.searchParams.get("source");
        const limit = Math.max(1, Math.min(200, Number(url.searchParams.get("limit")) || 30));
        const matches = registry
          .snapshot()
          .entries.filter(
            (entry) =>
              (!source || entry.source === source) &&
              `${entry.name} ${entry.description} ${entry.tags.join(" ")} ${entry.category}`
                .toLowerCase()
                .includes(query),
          );
        return send(res, 200, { total: matches.length, entries: matches.slice(0, limit) });
      }
      if (req.method === "GET" && url.pathname === "/api/events") {
        res.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          "X-Accel-Buffering": "no",
        });
        const changed = (revision) => res.write(`data: ${JSON.stringify({ revision })}\n\n`);
        changed(registry.state.revision);
        registry.on("change", changed);
        const heartbeat = setInterval(() => res.write(": heartbeat\n\n"), 20000);
        req.on("close", () => {
          clearInterval(heartbeat);
          registry.off("change", changed);
        });
        return;
      }
      if (req.method === "POST" && url.pathname === "/api/refresh") {
        const input = await body(req);
        if (input.source !== "all" && !Object.keys(registry.scanners).includes(input.source))
          return send(res, 400, { error: "Unknown source" });
        void registry.refresh(input.source).catch(() => {});
        return send(res, 202, { accepted: true });
      }
      if (req.method === "POST" && url.pathname === "/api/entries")
        return send(res, 201, { id: await registry.add(await body(req)) });
      if (url.pathname.startsWith("/api/entries/")) {
        const id = decodeURIComponent(url.pathname.slice("/api/entries/".length));
        if (req.method === "PATCH") {
          await registry.annotate(id, await body(req));
          return send(res, 200, { ok: true });
        }
        if (req.method === "DELETE") {
          await registry.remove(id);
          return send(res, 200, { ok: true });
        }
      }
      return send(res, 404, { error: "Not found" });
    } catch (error) {
      return send(res, 400, {
        error: error instanceof SyntaxError ? "Invalid JSON request" : error.message,
      });
    }
  };
}
