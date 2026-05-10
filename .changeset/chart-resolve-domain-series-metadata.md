---
'layerchart': patch
---

fix(Chart): Don't compute `[undefined, undefined]` domain when `series` is metadata-only

When `series` is configured for legend/color metadata only (no per-series `data`, and items lack the series-key properties on the value axis), the value-axis domain calculation collected all-undefined values and returned `[undefined, undefined]`. Combined with `motion`, this threw `Cannot spring undefined values` whenever the series visibility changed (e.g. toggling a legend swatch).

The series-aware branch now filters out null/undefined values and falls through to the other domain-resolution paths when nothing remains, instead of returning a poisoned extent.
