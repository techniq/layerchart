---
description: Subdivides each bar into countable square cells, ideal for showing exact quantities.
category: marks
layers: [svg, canvas]
related: [Bar, Bars, BarChart]
---

The **Waffle** mark visualizes quantities as a grid of small, countable square cells. Each cell represents a discrete `unit` of value, so a waffle of 24 cells unambiguously says "twenty-four" — much easier to read at a glance than a continuous bar of equivalent height.

Waffles are rendered as a single `<Path>` per datum filled with a tiled `<Pattern>` (one cell per tile), so even a 1,000-cell waffle costs a single path node. Cells aren't individually addressable for hover/click — for that, use a [Cell](/docs/components/Cell) grid instead.

:example{ name="fruits" }

## Axis

`axis` selects the value axis. The other axis is the **anchor axis** — typically a band scale of categories.

| `axis` | Direction                         | Plot equivalent |
| ------ | --------------------------------- | --------------- |
| `'y'`  | Cells stack upward from `y=0`     | `waffleY`       |
| `'x'`  | Cells extend rightward from `x=0` | `waffleX`       |

When omitted, `axis` falls back to the chart's `valueAxis`.

:example{ name="horizontal" }

A horizontal waffle works equally well for showing a single composition broken into named segments — here, the days of each month across a year:

:example{ name="months" }

## Cells (`unit`, `multiple`, `gap`)

| Prop       | Default | Purpose                                                                                                          |
| ---------- | ------- | ---------------------------------------------------------------------------------------------------------------- |
| `unit`     | `1`     | Quantity each cell represents. For large values, increase to keep cell counts manageable.                        |
| `multiple` | _auto_  | Cells per row (along the anchor axis). Auto-computed from bar width and unit so cells stay approximately square. |
| `gap`      | `1`     | Pixel separation between adjacent cells.                                                                         |
| `round`    | `false` | Partial-cell handling: `true` for `Math.round`, or pass a custom function (`Math.floor`, `Math.ceil`).           |

Larger units shrink the cell count — useful when raw values produce thousands of cells. Try a few values:

:example{ name="olympians-by-sex" }

For finer-grained binning, group by an interval (e.g. 5-year birth cohorts) and pick a unit that keeps each group readable:

:example{ name="olympians-by-birth-year" }

Tweak `unit` and `multiple` interactively to see how they affect cell count and grid shape:

:example{ name="multiple" }

## Cell shape (`rx` / `ry`)

`rx` and `ry` round each cell's corners (in pixels, or `"100%"` for circles — a stacked-dots look).

:example{ name="circular-cells" }

## Stacking

Stacked waffles share a cell grid across the stack so cells line up across series — the cleanest way to compare composition. Use [`groupStackData`](/docs/utils/stack) to prepare the data and color via the chart's `c` accessor:

:example{ name="penguins" }

A wider stack with finer bins — athletes by 10kg weight cohort, split by sex:

:example{ name="olympians-weight-by-sex" }

For per-series rendering with explicit `seriesKey`, see the basic stacked example:

:example{ name="stacked" }
