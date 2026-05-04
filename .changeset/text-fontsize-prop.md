---
'layerchart': minor
---

feat(Text): Add `fontSize` prop with auto-derived `capHeight`

Adds a typed `fontSize?: number | string` prop on `<Text>` (number = pixels, string passes through). When set, `capHeight` defaults to `fontSize * 0.71` instead of the legacy `'0.71em'` — so per-item scaled labels with `verticalAnchor="middle"` align to a common visual baseline without an explicit `capHeight` override.

Previously, `getPixelValue` resolved `'0.71em'` against a hard-coded 16px, so vertical centering was only correct for ~16px text. Larger labels sat too low, smaller ones too high — visible on text-driven beeswarms or any caller scaling labels per-element.

```svelte
<!-- Before: needed both font-size and capHeight to center correctly -->
<Text font-size={r * 1.4} capHeight="{r * 1.4 * 0.71}px" verticalAnchor="middle" ... />

<!-- After: one prop, centering handled automatically -->
<Text fontSize={r * 1.4} verticalAnchor="middle" ... />
```
