# Registry interface

The active style entry point is `src/editorial.css`. The layout uses the user-selected Stripe dark palette: navy canvas, cyan controls, amber display accents, blue-grey body text, and violet outlined count badges. Framed artwork sits beside feature copy. The shell is bounded at 2560px with 24px outer gutters; the navigation rail stays 76px wide, begins 24px from the top, and has a maximum height of the viewport minus 48px. Mobile uses a 76px drawer inset 12px and bounded by the viewport. Desktop content padding is 32px; section gaps are 64px and 40px. Blocks' framed media and shared gutters inform the feature panels.

## Typography

The TX-02 Berkeley Mono datasheet and U.S. Graphics product page inform the technical labels, aligned numbers, restrained weights, and explicit hierarchy. This is an application scale, not a claim that the datasheet prescribes these exact CSS sizes. The local licensed font remains excluded from Git. System monospace is its fallback. Editorial headings use the system sans family to preserve the Stripe reference's contrast.

| Reusable style | Size / line height | Weight | Semantic role |
| --- | --- | --- | --- |
| Meta | 12px / 1.5 | 400 | Dates, source labels, counts, captions |
| Caption | 14px / 1.5 | 400 | Controls and compact records |
| Body | 17px / 1.5 | 400 | Descriptions and readable content |
| Section | 28–34px / 1.15 | 500 | Feature and repository titles |
| Title | 48px / 1.15 | 500 | Inventory page headings |
| Display | 112px / .99 | 500 | Home editorial headline |

Display steps down to 88px and 58px on narrower screens, and up to 160px on large screens. Do not use viewport font sizing. Long descriptions can wrap; truncated repository text remains available in the detail modal. Tables and dynamic counters use aligned numerals.

## Motion and interaction

- `MorphIcon` keeps three persistent SVG slots with equal cubic path structure. Unused strokes park with zero opacity; Motion interpolates coordinates from the current frame, following Morphrig correspondence and parking guidance.
- `SpringModal` uses native dialog semantics, focus restoration, Escape and backdrop dismissal, and Motion's visual-duration spring. Add resource exposes actual DialKit controls for duration, bounce, overlay opacity, corner radius, and replay.
- Kugiri splits the home headline into masked words; the action restores text after animation, on resize, and on teardown.
- Welcome text types once per home arrival. Large card text responds to pointer distance using the Fancy Components character falloff approach. Reduced motion bypasses these effects.
- Cuelume supplies synthesized cues with a persisted sound preference.
- The starred gallery places cards above and below a horizontal date axis, pins the collection while document scrolling projects into horizontal travel, exposes year jumps, incrementally renders records, and opens a wide resource modal on selection. The same page-scroll mapping applies on mobile; native horizontal touch and keyboard scrolling remain available. Card snapping is disabled because it fights the continuous document-scroll projection. The collection is rendered on the home page and in GitHub Inventory.

## Acceptance status

Three distinct Snapattern assets (orbit, maze, rings) are integrated in the feature panels; hover transforms respect reduced motion. Desktop/mobile browser verification, type checks, and production build pass. Detailed local evidence and publication records are tracked in ignored `.agent/redesign/`.

## Design correction checkpoint

The earlier pale theme and full-height rail were rejected in browser comments. The active navy theme supersedes that design. The museum was revisited: clicking Explore the collection and scrolling changed card x-position while preserving y-position. The implementation now uses a sticky stage and page-scroll projection, rather than only intercepting wheel events inside a scrolling box.
