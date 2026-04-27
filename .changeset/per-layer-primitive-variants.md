---
'layerchart': minor
---

feat: Per-layer variants of layer-agnostic primitives (`layerchart/svg`, `layerchart/canvas`, `layerchart/html`)

Layer-agnostic primitives auto-detect the surrounding `<Svg>`, `<Canvas>`, or `<Html>` layer and bundle all three render paths. The new sub-path exports expose layer-specific variants so consumers committed to a single rendering layer can opt into a smaller bundle.

```ts
// Default: agnostic, dispatches at runtime — works in any layer
import { Rect, Circle, Text, Path } from 'layerchart';

// SVG-only — skips canvas + html branches (~25-45% smaller per primitive)
import { Rect, Circle, Text, Path } from 'layerchart/svg';

// Canvas-only
import { Rect, Circle, Text } from 'layerchart/canvas';

// HTML-only — drops canvas + svg overhead (some primitives are ~95% smaller)
import { Rect, Circle, Text, Pattern, LinearGradient } from 'layerchart/html';
```

The agnostic versions (e.g. `Rect.svelte`) now dispatch to the corresponding per-layer variant under the hood (`Rect.svg.svelte`, `Rect.canvas.svelte`, `Rect.html.svelte`) — no breaking change for existing consumers.

**Components split:** `Circle`, `Text`, `Rect`, `Line`, `Path`, `Ellipse`, `Polygon`, `Group`, `Image`, `ClipPath`, `Pattern`, `LinearGradient`, `RadialGradient` — 13 primitives total.

**Standout per-layer wins** (gz, vs agnostic baseline):
- `Pattern` html: 14.81 → 0.92 KB (-94%) — HTML implementation is just CSS-string generation
- `LinearGradient` html: 14.38 → 0.53 KB (-96%)
- `Image` canvas: 14.95 → 3.73 KB (-75%)
- `Text` svg/html: 29.13 → ~16 KB (-45%)

For a consumer who migrates all primitive imports to a single layer (e.g., `layerchart/svg`), cumulative savings are ~50-70 KB gz across the 13 primitives.

See the new ["Bundle Size" guide](https://layerchart.com/docs/guides/bundle-size) for the full table and tradeoffs.

**Behavior:** identical. Visual output, props, types, and bindable refs all match the agnostic versions. The dispatcher pattern adds ~0.2 KB per primitive to `core` for users on the agnostic API (transitive cost from `Highlight`/`Axis` etc.) — a worthwhile tradeoff for the opt-in per-layer savings.
