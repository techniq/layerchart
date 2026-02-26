---
title: Features
order: 1
draft: true
---

## Layers

LayerChart provides first-class support for Svg, Canvas, and Html visualizations via [layers](/docs/guides/layers) and [primitives](/docs/guides/primitives).

Each chart can use multiple layers which can be of different types, allowing you to leverage a layer's strengths (or workaround a weakness)

### Use cases

- Hierarchy with nodes rendered as `Html` to utlize flexbox/grid layouts and link paths rendred with `Svg` or `Canvas`
- `Svg` for text along an arc
- `Html` for word wrapping
- `Canvas` for performance of high density data, complex geo paths, or when overall rendering performance is crucial.
  - Rendering 55k records on line chart renders in `~25-40ms` and continued optimizations are being investigated.

## Broad range of chart support

- Cartesian ([Area](/docs/components/AreaChart), [Bar](/docs/components/BarChart), [Line](/docs/components/LineChart), [Scatter](/docs/components/ScatterChart))
- Radial/polar charts ([Arc](/docs/components/ArcChart), [Area](/docs/components/AreaChart/radial), [Bar](/docs/examples?filter=radial&category=BarChart), [Line](/docs/components/LineChart/large-radial-series), [Radar](/docs/examples?filter=radar), [Pie](/docs/components/PieChart))
- Hierarchical ([Pack](/docs/components/Pack), [Partition](/docs/components/Partition), [Tree](/docs/components/Tree), [Treemap](/docs/components/Treemap))
- Graph ([Dagre](/docs/components/Dagre), [Force](/docs/components/ForceSimulation), [Sankey](/docs/components/Sankey))
- Geo ([Choropleth](/docs/components/GeoPath/choropleth), [Spike](/docs/components/GeoPath/spike-map), [Bubble](/docs/components/GeoPath/bubble-map), [Point](/docs/components/GeoPoint), [Globe](/docs/examples?filter=globe))
- [Calendar](/docs/components/Calendar)
- see [examples](/docs/examples) for more

## Interactivity

- Robust [Tooltips](/docs/components/Tooltip) with various modes
- Pan/zoom [transforms](http://localhost:3002/docs/components/TransformContext)
  - Imperative access (`transform.zoomTo()`, `<Chart bind:context>`)
  - Use cases
    - Geo ([Projections](/docs/components/GeoPath/transform-projection), [Canvas](/docs/components/GeoPath/transform-canvas), and [Zoomable seamless tiles](/docs/components/GeoTile/zoomable-seamless-layers))
    - Hierarchial ([Circle pack](/docs/components/Pack/basic), [Treemap stacked zoom](/docs/components/Treemap/stacked-zoom) and [Treemap nested zoom](/docs/components/Treemap/nested-zoom))
    - General pan/zoom canvas ([Html](/docs/components/TransformContext/pan-zoom-html-image) / [Svg](/docs/components/TransformContext/pan-zoom-svg-image))
- [Brushing](/docs/components/Brush)
- Motion-enabled [primatives](/docs/guides/primitives) including tween and spring trannsitions

## Annotations (line, point, range) with series integration

## Styling

- Tailwind integration
  - Easily integrates into existing theming including [Svelte UX](https://svelte-ux.techniq.dev/), [shadcn-svelte](https://www.shadcn-svelte.com/), [Skeleton](https://www.skeleton.dev/), [daisyUI](https://daisyui.com/), and others
  - Supports light/dark mode (including when using Canvas layers)
- Canvas supports CSS variables and classes and scheme/theme reactive

## Compositional chart components

- Easy to modify or bring in your own components/markup

## Simplified setup with higher-level abstractions

- Simplified charts, patterns, gradients, etc
- Simplified charts
  - Setup common component (Axis, Grid, Marks, Highlight, Tooltip), tooltip mode, padding, legend (opt-in) with integrations (hover legend, hover series point)
  - Using `props` and granular `snippets` makes it easy to override/customize just the functionality you want without having to start from scratch
  - Override with `children` snippet for full control, but with simplified setup (scale setup, tooltip mode)
  - Some chart types are more challenging in a common `Chart` (more exploration needed)
    - Cartesian vs Radial vs Hierarchy vs Graph vs Force
  - Automatically detect data type (will be moved up to Chart)
- Props are useful where composition can be more challenging

## Performance

- Typically provides more than adequate performance with challenging use cases (leveraging canvas and Svelte 5 optimizations)

## Text

- Rotate, along arc, word wrapping, truncation, scale to fit
