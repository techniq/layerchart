---
'layerchart': minor
---

feat(tooltipContext, Voronoi): Add `x`/`y` accessor overrides and default array endpoint to max

- **New `x`/`y` props** on `tooltipContext` and `Voronoi` accept an `Accessor` (property name string or function). When set, hit-detection points use these accessors instead of the Chart's `x`/`y`. Useful when the Chart's accessor returns an array (e.g. `x={['POP_1980', 'POP_2015']}`) and you want detection at a specific endpoint:
  ```svelte
  <Chart {data} x={['POP_1980', 'POP_2015']} tooltipContext={{ mode: 'voronoi', x: 'POP_2015', y: 'R90_10_2015' }}>
  ```
- **Breaking (minor)**: when the chart's x/y accessor returns an array (duration bars, candlesticks, stacked areas, etc.), quadtree and voronoi hit-detection now default to the **max** value of the array instead of the **min**. For most use cases (target endpoint, stack top) this is the more natural hover position. If you need the old behavior, pass an explicit `x`/`y` accessor on `tooltipContext`/`Voronoi`.
