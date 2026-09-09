# Public showcase on Vercel

The public site is https://kmsh.tech, served by the Vercel project kmsh-tech in kmsh-dev-pro. The domain is registered with Vercel and uses ns1.vercel-dns.com / ns2.vercel-dns.com; Vercel's default apex ALIAS supplies routing. The local workbench remains a separate loopback-only application.

## Public boundary

Vercel builds with "vp run build:showcase", which selects the showcase Vite mode. This mode excludes the registry server plugin and reads /discoveries/registry.json. No local scanners, mutation API, SSE stream, personal inventory, notes, or favorites are deployed. The public interface retains category browsing, search, the gallery, map, export, and read-only repository details. Four curated projects and credited public contributions are also bundled from src/lib/featured-projects.ts, separately from starred counts; they contain only public editorial metadata and repository links.

server/showcase.mjs explicitly allowlists public GitHub fields. Repositories must have isPublic=true from a current GitHub import; private and unknown-visibility records are excluded. The exporter never spreads arbitrary registry fields or preferences. Its regression test includes private, unknown, local, and extra-secret-field fixtures.

The public snapshot and selected website previews under public/discoveries/ are source-controlled for reproducible builds. Refreshing the local registry does not automatically publish data. To publish a new snapshot:

    node scripts/registry.mjs refresh github
    # Wait for the GitHub source to finish successfully.
    node scripts/export-showcase.mjs
    vp run check
    vp test

Review the exported changes before committing. Removed screenshot references are moved into ignored .registry/retired-showcase-previews/, so obsolete images do not remain in the public folder.

## Build and release

Use the existing checkout. Vercel project linking is stored in ignored .vercel/; environment files and private caches are excluded from Git and source uploads.

    vp dlx vercel pull --yes --environment production
    vp dlx vercel build --prod
    vp dlx vercel deploy --prebuilt --prod --yes

The initial release used the prebuilt workflow, including the user's locally supplied Berkeley Mono web asset. The font is excluded from Git and source uploads; a clean remote Git build uses the documented monospace fallback unless the operator supplies an appropriately licensed font asset. Space Grotesk and its OFL license are bundled in the repository.

The Vercel project is connected to the GitHub repository. Local releases deploy the current checkout explicitly; no branch switch or PR merge is required. A Git-triggered build uses the checked-in public snapshot rather than accessing the operator's machine.

## Verification and rollback

Verify the actual custom domain without authenticated deployment-bypass headers:

- / serves the showcase over HTTPS.
- /discoveries/registry.json contains only public GitHub records.
- Referenced preview images return successfully.
- /api/registry and /.registry/registry.json return 404.
- Category browsing, search, details, and mobile navigation work.

Use Vercel's deployment history or "vercel rollback <previous-production-url>" to restore a previously verified release. Keep the domain attached to the project; a content rollback does not require changing DNS.

Initial release: September 10, 2026 (Asia/Kolkata), 1,397 public repositories and 35 previews. Build and browser evidence is in ignored .agent/vercel-deploy/.
