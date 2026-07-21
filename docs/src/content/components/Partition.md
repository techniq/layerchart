---
description: Layout component which divides a hierarchical dataset into nested, space-filling rectangles or arcs to represent the structure and relative sizes of each node.
category: layout
layers: [svg, canvas]
related: []
---

## Usage

:example{ name="horizontal"}

### Flame graph

Icicle layout (root at top, depth downward) styled as a [flame graph](https://github.com/spiermar/d3-flame-graph) for profiling data. The profile is loaded as ["folded" / "collapsed" stacks](https://github.com/brendangregg/FlameGraph) — the format most profilers emit — and turned into a hierarchy with the `parseFoldedStacks()` util. Hover a frame for details, click to zoom into a subtree, and use the breadcrumb or "Reset zoom" to zoom back out.

A flame graph aggregates sampled stacks into a space-filling hierarchy — for the [time-aware sibling](https://www.polarsignals.com/blog/posts/2025/05/28/flamecharts-the-time-aware-sibling-of-flame-graphs) that plots a real trace on a time axis (with pan/zoom and an overview brush), see the [flame chart](/docs/components/BrushContext).

:example{ name="flame-graph" }
