# Third-party components

## Svelte Flow template

Started from [xyflow/vite-svelte-flow-template](https://github.com/xyflow/vite-svelte-flow-template), using Svelte 5 and `@xyflow/svelte`. Svelte Flow is MIT licensed, copyright xyflow. Its dependency distribution contains its license.

## Beautiful UI

The registry inventory rows, tool chips, and sidebar adapt the visual component patterns demonstrated at [beautifului.dev](https://www.beautifului.dev): Records Table, Tool Chips, and Sidebar Nav. These are original Svelte implementations informed by the observed component examples; no React package is represented as installed. The active layout combines these patterns with the editorial references described in DESIGN.md.

## Rare UI Animated Counter

`src/components/Counter.svelte` adapts the digit-wheel structure, 1.5em line height, easing, fade mask, and reduced-motion treatment from [Rare UI Animated Counter](https://github.com/swamimalode07/rare-ui/blob/main/components/ui/animated-counter.tsx), presented at [rareui.com/components](https://www.rareui.com/components). The Svelte version uses CSS transitions rather than React Motion and intentionally supports nonnegative integer counts only.

MIT License

Copyright (c) 2026 Swami Malode

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Icons and typography

Navigation uses bundled Phosphor Bold SVGs (MIT) via Iconify, discovered through [Icônes](https://github.com/antfu-collective/icones). Other controls retain Lucide with stronger strokes, imported through individual icon exports rather than the full development barrel. The logo is an original SVG interpretation of the supplied geometric reference.

Berkeley Mono is served locally from the user's supplied variable font (400–700), converted to WOFF2. The font file is ignored by Git and is not included in source distribution. It is not covered by this project's component licenses. System monospace is the fallback. The UI no longer requests Google Fonts.

## Notifications and navigation

[Svelte Sonner](https://github.com/wobsoriano/svelte-sonner) provides the actual toast queue, dismissal and accessible notifications. Its MIT license is included with the dependency.

State chips are original Svelte adaptations of the observed Beautiful UI examples. The retired activity notification affordance was informed by Rare UI Notification Bell. The earlier Rare UI counter adaptation remains in source; active ticker counts now use Number Flow. Folder rail icons are original Svelte/CSS experiments informed by Urmauur’s file-format badges and frosted folder interaction; no upstream source code was copied.

## Fancy Components

The retained character-proximity utility and retained typewriter component were adapted for Svelte from [Fancy Components](https://github.com/danielpetho/fancy).

MIT License

Copyright (c) 2024 Daniel Petho

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Motion libraries and design references

Motion, DialKit, Kugiri, and Cuelume are installed dependencies; DialKit loads on demand when the local motion-tuning section opens; their distributions include upstream licenses. Stripe, the AI Interface Museum, Blocks, Morphrig, and U.S. Graphics inform original layout and interaction code. Their site artwork and logos are not copied into the application.

Snapattern artwork was exported from the user’s copy of [Snapatterns — 50 Seamless Pattern library](https://www.figma.com/community/file/1503771629691015061/snapatterns-50-seamless-pattern-library), by Briston. The source listing specifies [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), verified September 9, 2026. The app recolors, rotates, and crops these exports for feature panels, repository artwork, and the page background. Original animated SVG contours are layered over the masks. This artwork is licensed separately from application code.

## Number Flow and Taste review

[@number-flow/svelte](https://github.com/barvian/number-flow), discovered in the user's GitHub stars, supplies active animated counts. It is MIT licensed; the installed package includes its license. The [native Svelte documentation](https://number-flow.barvian.me/svelte) informed integration.

The user-requested [Taste skill](https://github.com/Leonxlnx/taste-skill/blob/main/skills/taste-skill/SKILL.md) informed the September 9 design review, motion lifecycle, and verification workflow. The app retains its existing Svelte/CSS stack. No React component collection is represented as installed.

## Space Grotesk and project previews

The hero tagline uses [Space Grotesk](https://www.freefaces.gallery/typefaces/space-grotesk), by Florian Karsten, bundled locally from Google Fonts under SIL Open Font License 1.1. The full license accompanies the WOFF2 in `public/fonts/space-grotesk-OFL.txt`. No runtime font CDN request is needed.

Project preview images are local screenshots of repository-linked public websites, generated by Playwright. The local capture cache is ignored. The public showcase includes selected screenshots associated with verified public repositories, exported separately for the user-authorized public site. Website content retains its respective owners' rights. Box-drawing artwork is an original composition using the locally available monospace font.

## Fey typography and resource paper

The type scale was inspected in the user-selected [Fey UI Kit Typography frame](https://www.figma.com/design/HfZ1EK15P2R3HqaAHtiDNG/Fey-UI-kit-V1.0--unofficial----Community--Community-?node-id=4008-2544). The scale is mapped to Berkeley Mono; no Calibre font is bundled. The supplied information-card image informs the paper layout and shadow. Its engineering illustration is an original SVG composition.

[Molesk](https://www.freefaces.gallery/typefaces/molesk), by Pedro Lobo / UPPERtype, was requested as an additional display face. The official download link currently returns a service error. No Molesk font file is included or represented as active.

## Featured public contributions

Olas Trader and Agents.fun / Eliza are Valory projects under Apache-2.0. The portfolio describes KMSH’s contributions and retains Valory ownership; it does not claim sole authorship. Agents.fun / Eliza is marked archived. Databento Adapter and the CSS Tokenography plugin marketplace are public MIT-licensed projects. No source from the featured repositories is copied into this app.
