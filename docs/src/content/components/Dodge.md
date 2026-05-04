---
description: Layout transform that packs items along one axis to avoid overlaps, deterministically.
category: layout
layers: [svg, canvas, html]
related: [ForceSimulation, Points, Circle]
---

The **Dodge** component repositions items along one axis so they don't overlap, given their positions on the other axis. Unlike [`ForceSimulation`](/docs/components/ForceSimulation), it's deterministic — the same input always produces the same layout — and faster to compute. Modeled after [Observable Plot's `dodge` transform](https://observablehq.com/plot/transforms/dodge).

It's a non-rendering composition component: pass it your data and a few layout props, and it yields each item's computed pixel `x`/`y` (and resolved `r`) via the children snippet for you to render however you want — typically with `<Circle>`, but `<Image>`, `<Rect>`, or `<Text>` work too.

## Algorithm

The packing uses a greedy O(n log n) interval-tree-based algorithm: for each item in input order, the candidate positions along the dodge axis are computed from the tangency equation against any horizontally-overlapping placed items, and the candidate closest to the anchor is chosen. Layout is **stable for a given input** — there's no animation or jitter.

## Axis & anchor

`axis` selects which dimension Dodge computes. Items are anchored on the _other_ axis (their natural data position) and stacked along the dodge axis to avoid overlaps.

`anchor` selects which edge items grow away from along the dodge axis:

| `axis` | Valid `anchor` values           | Default    |
| ------ | ------------------------------- | ---------- |
| `'x'`  | `'left'`, `'middle'`, `'right'` | `'left'`   |
| `'y'`  | `'top'`, `'middle'`, `'bottom'` | `'bottom'` |

:example{ name="anchor" }

A classic 1-D beeswarm is `axis="y"` + `anchor="middle"` — items spread symmetrically around the chart's vertical center.

:example{ name="beeswarm" }

## Sizing (`r`)

`r` is the per-item collision radius (constant or accessor). When omitted, Dodge falls back to the chart's `r` accessor / `rScale`. This lets the `<Chart>` declare `r="propertyName"` once and have Dodge pick it up automatically.

:example{ name="variable-radius" }

Any mark works inside the snippet — drive a `<Text>` font size from the resolved `r` to scale labels alongside the dodge radius.

:example{ name="text-beeswarm" }

## Row mode (`rowHeight`)

Circular packing produces unnecessarily large vertical gaps when collision radius is much wider than item height — typical for text labels where `r ≈ labelWidth/2`. Set `rowHeight` to switch to rectangular row-based packing: items are placed in fixed-height rows, with collision checked horizontally only.

:example{ name="timeline" }

## Sub-region dodging (`baseline`)

By default, Dodge anchors items to a chart edge (or center). Pass `baseline` to anchor against an arbitrary pixel coordinate along the dodge axis — for example, a band scale's `bandLeft + bandwidth/2` so each group dodges around its own column center, or a horizontal divider so labels stack above (`anchor="bottom"`) and below (`anchor="top"`) a shared baseline.

This works by combining multiple `<Dodge>` instances, each with its own `baseline` and `position` accessor. Output positions are already in chart coordinates, so the snippet doesn't need to translate them.

:example{ name="grouped-vertical" }

## Time-range lanes (Gantt-style)

For events with start/end ranges, pass each item's pixel midpoint as `position` and half its pixel width as `r`. With `rowHeight` set, Dodge packs each event into the lowest non-overlapping lane.

:example{ name="duration-bars-dense-lanes" }
