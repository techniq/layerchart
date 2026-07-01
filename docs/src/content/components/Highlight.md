---
description: Interaction component manages and displays tooltips allowing dynamic information to appear in response to user interactions.
category: interactions
layers: [svg, canvas, html]
related: [Tooltip, TooltipContext]
---

## Usage

Highlight is typically used via the `highlight` prop on chart components like `ScatterChart`, `LineChart`, or `BarChart`. It renders crosshair lines, points, areas, or bars at the hovered data position.

```svelte
<ScatterChart {data} x="x" y="y" highlight={{ lines: true, points: true, axis: 'both' }} />
```

Highlight reads from [TooltipContext](/docs/components/TooltipContext) by default — when a user hovers over the chart, TooltipContext tracks the nearest data point, and Highlight renders visual indicators at that position. No wiring is needed; both components share the chart context automatically.

## Display modes

Highlight supports several visual modes, each toggled independently:

| Prop     | Renders                                 | Use case                              |
| -------- | --------------------------------------- | ------------------------------------- |
| `lines`  | Dashed crosshair lines across the chart | Show precise x/y position             |
| `points` | Circles at the data point(s)            | Emphasize the hovered value           |
| `area`   | Shaded rectangle region                 | Highlight a band (e.g. time interval) |
| `bar`    | Bar at the data point                   | Highlight a bar in bar charts         |

Each accepts `true`, an object of component props (e.g. `lines={{ class: 'stroke-red-500' }}`), or a snippet for full custom rendering:

```svelte
<Highlight>
	{#snippet points({ points })}
		{#each points as point}
			<Circle cx={point.x} cy={point.y} r={8} fill={point.fill} />
		{/each}
	{/snippet}
</Highlight>
```

## Axis

The `axis` prop controls which crosshair lines are drawn:

| Value    | Effect                             |
| -------- | ---------------------------------- |
| `'x'`    | Vertical line at x position        |
| `'y'`    | Horizontal line at y position      |
| `'both'` | Both lines                         |
| `'none'` | No lines (even if `lines` is true) |

When not set, Highlight auto-detects the appropriate axis based on the chart's scale types.

## Multi-series

In charts with multiple series, Highlight automatically renders a point for each visible series at the hovered position, using each series' color. This works with stacked charts, multi-value accessors, and grouped series.

## Data-driven radius

When using a bubble/scatter chart with an `r` scale, pass `r={true}` to scale highlight points to match the data's radius instead of the default fixed size.

```svelte
<ScatterChart {data} x="x" y="y" r="population" highlight={{ points: true, r: true }} />
```

A custom accessor can also be used:

```svelte
<Highlight points r="population" />
```

See the [zoomable bubble](/docs/components/ScatterChart/zoomable-bubble) ScatterChart example for a full demo.

## Motion

Highlight points and lines animate with spring transitions by default. Disable with `motion={false}`, or pass a custom motion config:

```svelte
<Highlight points lines motion={{ type: 'tween', duration: 150 }} />
```

## Explicit data

By default, Highlight uses `TooltipContext` data. Pass explicit `data` to highlight a specific point (useful for annotations):

```svelte
<Highlight data={specificItem} points lines />
```
