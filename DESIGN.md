# Registry interface

`src/editorial.css` owns global styles. The accepted direction is a personal developer workbench informed by Stripe's compact technical navigation and editorial sections, with a navy canvas, cyan controls, amber display text, and distinct source colors. The September 9 Taste review replaces the earlier bounded shell and hover-only pattern panels.

## Layout and typography

The shell fills the viewport. The navigation rail floats independently at x=8px and y=61px, is 58px wide, hugs its contents, and is bounded by the viewport height. It does not reserve a grid column. Ordinary content uses fixed 104px side gutters, reduced to 84px below 1100px and 18px on mobile. The starred collection bleeds through those gutters to the actual viewport edges. Its background is continuous with the page. Mobile navigation uses the same compact rail as a dismissible drawer.

The mobile drawer takes focus, contains keyboard navigation, makes the page behind it inert, and restores focus on dismissal. View tabs support arrow keys and Home/End.

The fixed terminal header follows the measured Stripe navigation: 25px rectangular controls, 2px gaps, and a 12px viewport inset (49px total). It replaces both the former header and view tabs. Overview, Inventory, Map, and Activity use bracketed keyboard shortcuts; Console contains add, refresh, export, sound, and source controls. Mobile uses an 8px inset and compact labels (41px total). The rail and sticky gallery sit below the header. Search and filters share compact ruled rows. On mobile, each resource places status below its name and description; a separate status column must not squeeze identifiers into narrow vertical fragments. Source headings count the matching records rather than the entire registry.

Berkeley Mono is the primary font, converted from the user-supplied variable TTF to the locally licensed WOFF2 asset, excluded from Git. System monospace is its fallback. Space Grotesk is the bundled secondary font for editorial accents. Molesk was requested as a secondary display face, but its official download service currently returns an error and no font asset has been supplied; it is not active.

The size scale comes from the selected Typography frame in the Fey UI Kit Figma file (node 4008:2544). Its body sizes are 10, 12, 14, 16, and 18; headings add 20, 24, 32, 40, 48, 56, and 64. The source uses Calibre; this implementation deliberately maps those sizes to the requested Berkeley Mono. Tokens `--type-10` through `--type-64` own the scale. Body copy uses readable 1.4–1.5 leading; compact display text uses the source's 1.0 leading. The scale has zero tracking. Decorative box-drawing artwork can still scale to its container.

| Role | Active size |
| --- | --- |
| Navigation and technical labels | 10–12px |
| Compact controls and records | 12–14px |
| Descriptions | 16px |
| Feature headings | 24px |
| Inventory title | 40px desktop, 32px mobile |
| Home display | 64px desktop, 56px tablet, 32px mobile, 24px below 360px |
| Resource paper | 16px body, 18px subheading, 24px title and closing statement |

Descriptions can wrap. Full repository descriptions and identifiers remain available in the detail dialog. Tables and live counters use aligned numerals.

## Artwork and motion ownership

- Feature art alternates original animated Berkeley-style box drawings with Snapattern studies. `BoxStudy` uses real monospace box-drawing glyphs, connected nodes, and a small signal animation, paused offscreen.
- `PatternStudy` composes three exported Snapattern masks (orbit, maze, rings) with four original animated SVG studies: orbital rings, nested signal contours, resonance, and a layered stack. Blue, green, amber, and violet distinguish the studies. A subtle fixed Snapattern layer continues behind the page; dense inventory rows use an opaque surface for readability.
- IntersectionObserver mounts animated SVGs only while their artwork is visible. The masks and sculpture transforms move continuously, with a reduced-motion override. Repository copy is separate from the art on a solid, high-contrast panel. Repository artwork uses a cached screenshot of its GitHub homepage when available, otherwise mixed box drawings and patterns. Screenshots are captured by a separate local command; the browser/API never starts an external capture.
- Number Flow's native Svelte component animates actual API-backed counts in the statistics ticker. Featured project labels use fixed editorial sequence numbers. The ticker repeats the same current snapshot, exposes connection status and pause/play, pauses on hover and offscreen, and becomes static under reduced motion. It never simulates activity or increments counts artificially.
- Kugiri splits headings into masked words when they enter the viewport. The action cancels obsolete animations, restores the original markup after completion and on teardown, and replays on re-entry. Accent text has its own reveal target so splitting does not remove its styling.
- The hero includes a terminal path and a caret that blinks four times. The earlier typewriter component remains unused in source. Cuelume supplies synthesized cues with a persisted sound preference.
- `MorphIcon` keeps three persistent SVG slots with equal cubic path structure. Unused strokes park with zero opacity; Motion interpolates from the current frame, following Morphrig correspondence guidance.
- `SpringModal` uses native dialog semantics, focus restoration, Escape/backdrop dismissal, and Motion's visual-duration spring. All resource details use the supplied cream-and-orange paper reference: compact brand/action navigation, breadcrumb, uppercase title, description, three summary columns, and a ruled two-column orange section with original engineering line art. Paper, ink, orange, and rule colors are semantic tokens in the global stylesheet. A wide, soft downward shadow lifts the rounded paper off a warm blurred backdrop. Narrow screens stack summary and drawing/specification columns. Every detail label and control stays within 16–24px and uses Berkeley Mono. Local notes, favorites, invocation copying, related records, and custom removal continue below the reference composition; Escape and native dialog focus restoration remain available. Add resource retains DialKit tuning in a collapsed Motion controls section.

## Collection and application behavior

The starred gallery orders records by saved date. Desktop cards alternate around a date axis; mobile uses a single row for readable cards. Motion's `scroll` API projects document scrolling into horizontal travel through a sticky viewport stage. Native horizontal input and keyboard scrolling remain available and synchronize with the document position. Year jumps expand the rendered record range. Artwork remains visibility-gated even after all records are present. Whole cards reveal on entry from either viewport edge, independently from their heading reveal. Cards rest at alternating small angles, straighten and scale on hover/focus, move away from the date axis, and respond on press. The axis marker responds with the card. Card snapping is disabled because it fights continuous projection. Reduced motion removes the long pinned travel and retains a native horizontal collection with instant year jumps.

Inventory, filters, pagination, favorites, saved resources, notes, export, source refresh, activity, and the category map retain their existing data ownership. The map uses a bounded category sample, with a navy dot field and readable controls; it is not an execution graph. The browser remains a projection of the local API. The home renders before the initial snapshot arrives and shows unknown counts as dashes. Live events announce revisions; unchanged revisions do not refetch the full snapshot, and newer events arriving during a request are coalesced without losing the latest revision. Large API responses negotiate gzip; their decoded data and no-store policy are unchanged.

## Design history and verification

Earlier pale themes, the full-height rail, and the bounded 2560px shell were rejected. The September 9 interaction pass also replaced repetitive grid banners, oversized duplicate detail headers, the mismatched map grid, and cramped mobile table columns. Those earlier decisions are superseded by the rules above.

Verification evidence is recorded in ignored `.agent/taste-redesign/`: desktop, 2847px ultrawide, and 390px mobile screenshots; interaction and error-recovery checks; reduced-motion behavior; type/build/test logs; and accessibility findings. Acceptance is based on those checks, not a self-assigned visual score. The user's visual review remains the aesthetic acceptance decision.

The preceding Taste audit passed type/lint/build checks and 12 regression tests. The subsequent terminal-header and project-preview pass records its checks in `.agent/header-redesign/`. The audited home, inventory, map, source-health, and CLI-detail views have no failing accessibility audits. Mobile-throttled cold-load performance remains a documented optimization item (Lighthouse 65); layout shift improved to .076. This is separate from visual acceptance.

## Public showcase

The Vercel build preserves the visual system but uses a published GitHub-only snapshot. The source rail shows discovery categories, with counts drawn from that snapshot. In both modes the four leading cards feature Databento Adapter, Codex Harness, Claude Resource Limiter, and DeepWiki MCP Server. `src/lib/featured-projects.ts` owns this curated public metadata; these records remain separate from starred counts and local annotation APIs. Selecting a feature opens its resource paper and supports a shareable hash route. The ticker says Collection rather than Live. Activity, source refresh, installed-tool views, favorites, notes, and add/remove controls are absent. Repository details retain public metadata and links to GitHub and the project website. Local mode retains all workbench behavior.

The public data contract and deployment ownership are documented in DEPLOYMENT.md. Public builds make no registry API or SSE requests. The exporter requires explicit public visibility and allowlists fields; the public collection is updated only through a reviewed export and deployment.

The September 10 typography/detail pass supersedes the previous fluid hero sizing and two-column dark inspector. Evidence is in `.agent/type-card-redesign/`; the earlier Lighthouse scores are historical, not measurements of this pass.
