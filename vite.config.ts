import { defineConfig } from "vite-plus";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { registryPlugin } from "./server/plugin.mjs";

export default defineConfig(({ mode }) => ({
  plugins: [
    ...(mode === "showcase"
      ? [
          {
            name: "showcase-metadata",
            transformIndexHtml(html: string) {
              return html.replace(
                "<title>Agent Tool Registry</title>",
                '<title>KMSH.DEV — Discoveries</title><meta name="description" content="A small corner of the internet. Open-source tools and ideas saved by KMSH."><link rel="canonical" href="https://kmsh.tech/">',
              );
            },
          },
        ]
      : []),
    svelte(),
    ...(mode === "test" || mode === "showcase" ? [] : [registryPlugin()]),
  ],
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
