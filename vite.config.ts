import { defineConfig } from "vite-plus";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { registryPlugin } from "./server/plugin.mjs";

export default defineConfig(({ mode }) => ({
  plugins: [svelte(), ...(mode === "test" ? [] : [registryPlugin()])],
  server: {
    host: "127.0.0.1",
    port: 4317,
    fs: {
      strict: true,
      deny: [
        "**/.registry/**",
        "**/.agent/**",
        "**/.firecrawl/**",
        "**/.env*",
        "**/*.{crt,pem}",
        "**/.git/**",
      ],
    },
  },
  test: { include: ["server/**/*.test.mjs", "src/**/*.test.ts"] },
  lint: {
    ignorePatterns: [
      "AutaLin/**",
      "browser-workflow/**",
      "chartlib/**",
      "dexance/**",
      "docs/**",
      "html-everything/**",
      "skills/**",
      ".agent/**",
      ".firecrawl/**",
      ".registry/**",
    ],
  },
  fmt: {
    ignorePatterns: [
      "AutaLin/**",
      "browser-workflow/**",
      "chartlib/**",
      "dexance/**",
      "docs/**",
      "html-everything/**",
      "skills/**",
      "agents-md-template.md",
      "gpt-5.6-sol-global-AGENTS.md",
      ".agent/**",
      ".firecrawl/**",
      ".registry/**",
    ],
  },
}));
