import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Registry } from "./registry.mjs";
import { handler, trustedRequest } from "./http.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const registry = await new Registry(path.join(root, ".registry")).load();
const api = handler(registry);
const mime = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
};
const server = createServer((req, res) => {
  if (!trustedRequest(req)) {
    res.writeHead(403);
    res.end("Local access required");
    return;
  }
  void api(req, res, async () => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
      const relative = pathname === "/" ? "index.html" : pathname.slice(1);
      const file = path.resolve(root, "dist", relative);
      if (!file.startsWith(path.join(root, "dist") + path.sep)) throw new Error("Invalid path");
      const data = await readFile(file);
      res.writeHead(200, {
        "Content-Type": mime[path.extname(file)] ?? "application/octet-stream",
        "X-Content-Type-Options": "nosniff",
      });
      res.end(data);
    } catch {
      res.writeHead(404);
      res.end("Not found");
    }
  });
});
server.listen(Number(process.env.PORT) || 4317, "127.0.0.1", () => {
  console.log(`Registry: http://127.0.0.1:${server.address().port}`);
  registry.start();
});
for (const signal of ["SIGTERM", "SIGINT"])
  process.on(signal, () => {
    registry.stop();
    server.closeAllConnections();
    server.close();
  });
