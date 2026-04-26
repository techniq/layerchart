---
'layerchart': patch
---

fix(GeoPath): Avoid passing `undefined` event handlers to underlying `Path`, preventing a Svelte error while preserving canvas hit-testing for non-interactive paths
