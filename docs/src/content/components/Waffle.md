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

The waffle mark comes in two orientations. `axis="y"` extends vertically (Plot's `waffleY`); `axis="x"` extends horizontally (Plot's `waffleX`). The other axis is the **anchor axis** — typically a band scale of categories. When `axis` is omitted, it falls back to the chart's `valueAxis`.

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

The waffle mark automatically determines the appropriate number of cells along the anchor axis (`multiple`) so that cells stay square, don't overlap, and remain consistent with position scales. Drag the slider to see how the layout adapts as the value changes:

:example{ name="auto-multiple" }

:::note
The number of cells along the anchor axis is guaranteed to be an integer, but it might not be a multiple or factor of the value-axis tick interval. For example, the waffle might have 5 rows while the x-axis shows ticks every 20 units.
:::

:::tip
To set `multiple` directly, pass the prop — though note that manually setting it may produce non-square cells if there isn't enough room. Alternatively, you can bias the automatic value while preserving square cells by adjusting the band scale's padding: `multiple = floor(sqrt(bandwidth / scale))`, so a tighter band (`scaleBand().padding(0.4)`) produces a **smaller** `multiple` than a looser one (`padding(0.1)`).
:::

Larger `unit` values shrink the cell count — useful when raw values would otherwise produce thousands of cells:

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
