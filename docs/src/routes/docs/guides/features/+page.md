# Features

> WIP

## Layers

First-class support for Svg, Canvas, Html via layers and primitives with ability to mix layers to leverage each's strength (or workaround a weakness)

Example use cases

- hierarchy visualization with nodes rendered as `Html` and links rendred with `Svg`/`Canvas`
- `Svg` or text along an arc
- `Html` for word wrapping
- `Canvas` for performance of high density data, complex geo paths, or when overall rendering performance is crucial.
  - Rendering 55k records on line chart renders in `~25-40ms` and continued optimizations are being investigated.

## Broad range of chart types

- Cartesian (bar, area, line, scatter, ...)
- Radial/polar charts (line, bar, pie, arc, ...)
- Hierarchy (pack, tree, treemap, sunburst, ...)
- Graph (sankey, dagre, force, ...)
- Geo (choropleth, spike, bubble, point, globe, ... )
- Calendar
- Multi-series with tooltip/legend integration

## Interactivity

- Robust [Tooltips](/docs/components/Tooltip) with various modes
- Pan/zoom transforms
  - Imperative access (`transform.zoomTo()`, `<Chart bind:transformContext>`)
- Brushing

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

Primarily focuses on application and data exploration use cases

https://bsky.app/profile/techniq.dev/post/3looljuqjns2u
