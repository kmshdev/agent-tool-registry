# Agent Tool Registry

A local capability registry built from the xyflow Vite / Svelte Flow template. The workbench combines PATH executables, installed Homebrew packages, macOS application bundles, personal agent and skill files, cached plugin skills, GitHub stars, and saved resources.

## Run

```sh
vp install
vp dev
```

Open http://127.0.0.1:4317. If the port is occupied, Vite selects another and prints the URL. For a production build with the same live API:

```sh
vp build
vp run start
```

The production port defaults to 4317 and supports `PORT`. The app listens on loopback only. Refreshing stops when the server stops; the last snapshot remains searchable through the offline CLI. The preview command is a static build preview and does not provide the registry API; use `vp run start` for the complete app.

The Overview uses a navy editorial layout inspired by the user-selected Stripe developer theme, with continuously animated pattern studies, an API-backed statistics ticker, compact search, and saved resources. GitHub stars appear on the home page and in Inventory as a pinned timeline: scrolling the page moves cards horizontally, and selecting a card opens its detail modal. Reduced motion uses native horizontal scrolling without a long pinned section. Inventory, the template-backed capability map, source health, and activity remain available. See DESIGN.md for typography and motion ownership.

## Discover and query

- PATH executables: executable access checks, never bulk execution of discovered programs. Priority follows the server's launch environment. Restart after changing shell PATH configuration.
- Homebrew: `brew info --json=v2 --installed`, with automatic Homebrew updates disabled.
- Mac apps: application bundles under `/Applications`, `/System/Applications`, and `~/Applications`, including two levels of grouping folders. Version and bundle metadata are read with `plutil`.
- Agents and skills: `~/.codex/agents`, `~/.codex/skills`, `~/.agents/skills`, `~/.claude/agents`, `~/.claude/skills`, and the Codex plugin cache. Cached plugin entries are labeled `Cached`; presence does not prove activation. Symlinked directories are deduplicated.
- GitHub: every page of the authenticated user's starred repositories, using the existing `gh` login. A starred repository is a candidate, not proof of installation. No connector credentials enter the browser.

Local sources refresh every 60 seconds; GitHub refreshes every 15 minutes. Manual refresh is available per source or globally. Large JSON responses use negotiated gzip compression while retaining `no-store` caching. Server-sent events announce revisions; the UI fetches only when an event is newer than its snapshot, with a 15-second polling fallback. Source failures retain the last good data and publish an error with the last successful timestamp. Successful rescans remove missing detections. Annotations survive rescans and restarts.

The totals count **source records**, not unique products: a CLI, Homebrew package, and app can describe the same product. Capability labels are inferred from source metadata or a small curated mapping in `server/catalog.mjs`. The graph shows category membership for a bounded sample, not dependency or execution relationships. All matching records remain in Inventory.

```sh
node scripts/registry.mjs search "browser automation" --limit 12
node scripts/registry.mjs search "python" --source cli
node scripts/registry.mjs get "cli:rg"
node scripts/registry.mjs stats
node scripts/registry.mjs export
node scripts/registry.mjs refresh github
```

Search, get, stats, and export read `.registry/registry.json` offline. Refresh calls the running API on port 4317. In the original workspace, the companion `tool-registry` skill in `~/.codex/skills/tool-registry` points Codex tasks to this query interface. A fresh clone does not install a global skill or modify shell configuration.

## Persistence and boundaries

`.registry/registry.json` is a private local snapshot with annotations and bounded refresh history. Writes are serialized and atomically renamed. Keep one registry server running per directory. Back up this file to preserve favorites and notes. The snapshot and intermediate files are ignored. Do not publish them: they contain local paths and personal inventory.

The API validates same-origin requests and loopback hostnames, limits mutation bodies, and never offers shell execution, installation, or arbitrary file-reading endpoints. Discovered descriptions and user notes remain untrusted data. Custom links accept HTTP(S) URLs without credentials. Scanners read metadata, not credential values or agent instruction bodies into the frontend.

## Verify

```sh
vp run check
vp test
vp build
```

Tests cover reconciliation, failed refresh retention, concurrency, annotation persistence, input validation, origin checks, negotiated snapshot compression, and live revision events. Browser verification artifacts belong in task-specific ignored `.agent/` directories; the latest interface pass is in `.agent/taste-redesign/`.

This application lives in its own `tool-registry` directory. Projects in the parent directory are outside its build and check scope. See `THIRD_PARTY_NOTICES.md` for template and component attribution.

## Local typography asset

Berkeley Mono is optional and is not redistributed. If your license permits local web use, place your WOFF2 file at `public/fonts/berkeley-mono.woff2`. The interface falls back to system monospace when it is absent. Snapattern artwork has separate CC BY 4.0 attribution in THIRD_PARTY_NOTICES.md.
