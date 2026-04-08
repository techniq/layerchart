---
'layerchart': minor
---

feat(PieChart/ArcChart): Add top-level `labels` prop

`PieChart` and `ArcChart` now accept a `labels` prop that renders text labels on each arc without requiring a custom `arc` snippet. Pass `true` to enable defaults (centroid placement, default value accessor), or an object to configure any `ArcLabel` props — placement, offset, value accessor, callout line lengths, leader line style, text class, etc.

```svelte
<PieChart
  {data}
  labels={{ placement: 'callout', value: 'fruit' }}
/>
```
