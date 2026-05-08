---
description: Subdivides each bar into countable square cells, ideal for showing exact quantities.
category: marks
layers: [svg, canvas]
related: [Bar, Bars, BarChart]
---

The **Waffle** mark visualizes quantities as a grid of small, countable square cells. Each cell represents a discrete `unit` of value, so a waffle of 24 cells unambiguously says "twenty-four" — much easier to read at a glance than a continuous bar of equivalent height.

Waffles are rendered as a single `<Path>` per datum filled with a tiled `<Pattern>` (one cell per tile), so even a 1,000-cell waffle costs a single path node. Cells aren't individually addressable for hover/click — for that, use a [Cell](/docs/components/Cell) grid instead.

:example{ name="basic" }

## Axis

The waffle mark comes in two orientations. `axis="y"` extends vertically; `axis="x"` extends horizontally. The other axis is the **anchor axis** — typically a band scale of categories. When `axis` is omitted, it falls back to the chart's `valueAxis`.

:example{ name="horizontal" }

## Cells (`unit`, `multiple`, `gap`)

`Waffle` automatically determines the appropriate number of cells along the anchor axis (`multiple`) so that cells stay square, don't overlap, and remain consistent with position scales.

| Prop       | Default | Purpose                                                                                                          |
| ---------- | ------- | ---------------------------------------------------------------------------------------------------------------- |
| `unit`     | `1`     | Quantity each cell represents. For large values, increase to keep cell counts manageable.                        |
| `multiple` | _auto_  | Cells per row (along the anchor axis). Auto-computed from bar width and unit so cells stay approximately square. |
| `gap`      | `1`     | Pixel separation between adjacent cells.                                                                         |
| `round`    | `false` | Partial-cell handling: `true` for `Math.round`, or pass a custom function (`Math.floor`, `Math.ceil`).           |

Drag the slider to see how the layout adapts as the value changes:

:example{ name="auto-multiple" }

:::note
The number of cells along the anchor axis is guaranteed to be an integer, but it might not be a multiple or factor of the value-axis tick interval. For example, the waffle might have 5 rows while the x-axis shows ticks every 20 units.
:::

You can also set `multiple` directly, though note that manually setting it may produce non-square cells if there isn't enough room.

:example{ name="unit-multiple" }

Alternatively, you can bias the automatic `multiple` value while preserving square cells by adjusting the band scale's padding.

:example{ name="band-padding" }

For large values, increasing `unit` keeps cell counts manageable while still showing the discrete nature of the data. Here, each cell represents 5 Olympians born in the same 5-year period:

:example{ name="olympians-by-birth-year" }

## Cell shape (`rx` / `ry`)

`rx` and `ry` round each cell's corners (in pixels, or `"100%"` for circles — a stacked-dots look).

:example{ name="circular-cells" }

## Proportion of a whole

Two waffle marks layered together — a faded one sized to the total and an opaque one sized to the value — turn each band into a "X out of N" graphic. After ["Teens in Syria"](https://www.economist.com/graphic-detail/2015/08/19/teens-in-syria) (_The Economist_, August 2015):

:example{ name="survey" }

## Custom symbol

Pass a `symbol` snippet to render an icon, glyph, or arbitrary SVG in each cell instead of the default rect. The snippet receives the cell's `width` and `height` — pass them straight to an inner `<svg>` with the icon's native `viewBox` to scale the shape to fit. The cell's resolved color (from the chart's `c` scale, the series, or `fill`) is set via CSS `color` on the wrapping element, so any `fill="currentColor"` (or stroke) inside the snippet inherits it.

```svelte
<Waffle>
	{#snippet symbol({ width, height })}
		<svg {width} {height} viewBox="0 0 64 64">
			<path fill="currentColor" d={iconPath} />
		</svg>
	{/snippet}
</Waffle>
```

:example{ name="custom-symbol" }

:::note
`symbol` is supported on the SVG layer only — canvas falls back to the default rect.
:::

## Stacking

Stacked waffles share a cell grid across the stack so cells line up across series — the cleanest way to compare composition. Configure `series` + `seriesLayout="stack"` and render one `<Waffle seriesKey={...}>` per visible series. Toggling the legend hides a series and restacks the remaining segments to the baseline.

For long-format input (one row per category × stack key), pivot to wide format with [`pivotWider`](/docs/utils/pivot) so each row has one column per series key:

:example{ name="penguins" }

A wider stack with finer bins — athletes by 10kg weight cohort, split by sex:

:example{ name="olympians-weight-by-sex" }

The same pattern with already-wide data:

:example{ name="stacked" }

A stacked horizontal waffle works equally well for showing a single composition broken into named segments — here, the days of each month across a year:

:example{ name="months" }
