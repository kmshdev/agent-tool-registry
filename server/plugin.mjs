import path from "node:path";
import { Registry } from "./registry.mjs";
import { handler } from "./http.mjs";

export function registryPlugin() {
  let registry;
  return {
    name: "local-tool-registry",
    async configureServer(server) {
      registry = await new Registry(path.join(server.config.root, ".registry")).load();
      server.middlewares.use(handler(registry));
      registry.start();
      server.httpServer?.on("close", () => registry.stop());
    },
  };
}
