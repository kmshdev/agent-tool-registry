# Registry interface

`src/editorial.css` owns global styles. The accepted direction is a personal developer workbench informed by Stripe's compact technical navigation and editorial sections, with a navy canvas, cyan controls, amber display text, and distinct source colors. The September 9 Taste review replaces the earlier bounded shell and hover-only pattern panels.

## Layout and typography

The shell fills the viewport. The navigation rail floats independently at x=8px and y=12px, is 58px wide, hugs its contents, and is bounded by the viewport height. It does not reserve a grid column. Ordinary content uses fixed 104px side gutters, reduced to 84px below 1100px and 18px on mobile. The starred collection bleeds through those gutters to the actual viewport edges. Its background is continuous with the page. Mobile navigation uses the same compact rail as a dismissible drawer.

The mobile drawer takes focus, contains keyboard navigation, makes the page behind it inert, and restores focus on dismissal. View tabs support arrow keys and Home/End.

The desktop header is 46px tall and the view tabs are 36px tall. Search and filters share compact ruled rows. On mobile, each resource places status below its name and description; a separate status column must not squeeze identifiers into narrow vertical fragments. Source headings count the matching records rather than the entire registry.

Berkeley Mono is an optional, locally licensed WOFF2 asset, excluded from Git. System monospace is its fallback. System sans provides the editorial headings and readable repository titles. The U.S. Graphics TX-02 datasheet informed technical labels and aligned numbers; these application sizes are project decisions, not prescriptions from that reference.

| Role | Active size |
| --- | --- |
| Navigation and technical labels | 10–12px |
| Compact controls and records | 12–14px |
| Descriptions | 14–18px |
| Feature headings | 25px desktop, 34px ultrawide, 22px mobile |
| Inventory title | 40px desktop, 32px mobile |
| Home display | 100px desktop, 128px ultrawide, 76px tablet, 49px mobile |

Descriptions can wrap. Full repository descriptions and identifiers remain available in the detail dialog. Tables and live counters use aligned numerals.

## Artwork and motion ownership

- `PatternStudy` composes three exported Snapattern masks (orbit, maze, rings) with four original animated SVG studies: orbital rings, nested signal contours, resonance, and a layered stack. Blue, green, amber, and violet distinguish the studies. A subtle fixed Snapattern layer continues behind the page; dense inventory rows use an opaque surface for readability.
- IntersectionObserver mounts animated SVGs only while their artwork is visible. The masks and sculpture transforms move continuously, with a reduced-motion override. Repository copy is separate from the art on a solid, high-contrast panel.
- Number Flow's native Svelte component animates actual API-backed counts in the feature labels and statistics ticker. The ticker repeats the same current snapshot, exposes connection status and pause/play, pauses on hover and offscreen, and becomes static under reduced motion. It never simulates activity or increments counts artificially.
- Kugiri splits headings into masked words when they enter the viewport. The action cancels obsolete animations, restores the original markup after completion and on teardown, and replays on re-entry. Accent text has its own reveal target so splitting does not remove its styling.
- Welcome text types once per home arrival. Cuelume supplies synthesized cues with a persisted sound preference.
- `MorphIcon` keeps three persistent SVG slots with equal cubic path structure. Unused strokes park with zero opacity; Motion interpolates from the current frame, following Morphrig correspondence guidance.
- `SpringModal` uses native dialog semantics, focus restoration, Escape/backdrop dismissal, and Motion's visual-duration spring. Its close header stays reachable when content scrolls. Repository details use two columns on desktop and one column on mobile. Add resource retains DialKit tuning in a collapsed Motion controls section.

## Collection and application behavior

The starred gallery orders records by saved date. Desktop cards alternate around a date axis; mobile uses a single row for readable cards. Motion's `scroll` API projects document scrolling into horizontal travel through a sticky viewport stage. Native horizontal input and keyboard scrolling remain available and synchronize with the document position. Year jumps expand the rendered record range. Artwork remains visibility-gated even after all records are present. Card snapping is disabled because it fights continuous projection. Reduced motion removes the long pinned travel and retains a native horizontal collection with instant year jumps.

Inventory, filters, pagination, favorites, saved resources, notes, export, source refresh, activity, and the category map retain their existing data ownership. The map uses a bounded category sample, with a navy dot field and readable controls; it is not an execution graph. The browser remains a projection of the local API. The home renders before the initial snapshot arrives and shows unknown counts as dashes. Live events announce revisions; unchanged revisions do not refetch the full snapshot, and newer events arriving during a request are coalesced without losing the latest revision. Large API responses negotiate gzip; their decoded data and no-store policy are unchanged.

## Design history and verification

Earlier pale themes, the full-height rail, and the bounded 2560px shell were rejected. The September 9 interaction pass also replaced repetitive grid banners, oversized duplicate detail headers, the mismatched map grid, and cramped mobile table columns. Those earlier decisions are superseded by the rules above.

Verification evidence is recorded in ignored `.agent/taste-redesign/`: desktop, 2847px ultrawide, and 390px mobile screenshots; interaction and error-recovery checks; reduced-motion behavior; type/build/test logs; and accessibility findings. Acceptance is based on those checks, not a self-assigned visual score. The user's visual review remains the aesthetic acceptance decision.

The final audit passes type/lint/build checks and 12 regression tests. The audited home, inventory, map, source-health, and CLI-detail views have no failing accessibility audits. Mobile-throttled cold-load performance remains a documented optimization item (Lighthouse 65); layout shift improved to .076. This is separate from visual acceptance.
