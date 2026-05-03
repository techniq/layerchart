---
description: Layout transform that packs items along one axis to avoid overlaps, deterministically.
category: layout
layers: [svg, canvas, html]
related: [ForceSimulation, Points, Circle]
---

The **Dodge** transform repositions items along one axis so they don't overlap, given their positions on the other axis. Unlike [`ForceSimulation`](/docs/components/ForceSimulation), it's deterministic — the same input always produces the same layout — and faster to compute. Modeled after [Observable Plot's `dodge` transform](https://observablehq.com/plot/transforms/dodge).

It's a non-rendering composition component: pass it your data, an `axis`, an `anchor`, and a per-item `r` (collision radius), and it yields each item's computed pixel `x`/`y` via the children snippet for you to render however you want.

## Beeswarm

A 1-D distribution stacked vertically with `axis="y"` and `anchor="middle"`. Pass a constant `r` for uniform circles.

:example{ name="beeswarm" }

## With series

Combine with the `series` prop on `<Chart>` and `<Legend>` for a categorical beeswarm. Filter `data` by `context.series.visibleSeries` so the dodge re-packs when categories are toggled.

:example{ name="penguins" }

## Variable radius

Omit Dodge's `r` prop and configure `r="someProperty"` (with `rRange`) on `<Chart>` — Dodge picks up the chart's `rGet` automatically, the same way `Points` does. Larger items are placed first (closest to the anchor).

:example{ name="variable-radius" }

## Anchor

Use `anchor` to control where the stack grows from along the dodge axis: `'top'`/`'middle'`/`'bottom'` for `axis="y"`, `'left'`/`'middle'`/`'right'` for `axis="x"`. Items always grow _away_ from the anchor.

:example{ name="anchor" }

## Grouped (band scale)

Use a band scale on the category axis and render one `<Dodge>` per band, passing the band's `bandwidth()` as `size` so each group dodges within its own column. Items are then translated to the band's pixel offset.

:example{ name="grouped-vertical" }

For a horizontal layout, swap the axes (band scale on `y`, dodge on `y` per band).

:example{ name="grouped-horizontal" }

## Image beeswarm

Render `<Image>` instead of `<Circle>` inside the snippet — Dodge yields pixel positions and a resolved radius for each item, which double as the image's bounding box.

:example{ name="image-beeswarm" }

## Row-based packing for text labels

Circular dodge produces large vertical gaps when collision radius is meaningfully wider than item height (e.g. text labels where `r ≈ labelWidth/2`). Set `rowHeight` to switch to rectangular row-based packing — items are placed in fixed-height rows, with collision checked horizontally only.

This timeline pans/zooms via `<TransformContext>`; labels re-pack on every zoom step.

:example{ name="timeline" }
