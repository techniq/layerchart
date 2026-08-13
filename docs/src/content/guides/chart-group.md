---
title: Chart Group (Syncing)
category: state
---

A `ChartGroup` synchronizes state between two or more charts. Hovering one chart shows the tooltip and highlight on all of them, each resolved against its own data and scales.

## Quick start

Wrap the charts in `<ChartGroup>`:

```svelte
<ChartGroup>
	<LineChart data={requests} x="date" y="value" height={100} />
	<LineChart data={latency} x="date" y="value" height={100} />
	<LineChart data={errors} x="date" y="value" height={100} />
</ChartGroup>
```

:example{ component="ChartGroup" name="basic" }

The charts don't need matching data. Each one looks up the **nearest data point to the shared domain value** in its own data, then positions the highlight with its own scales — so panels with different lengths, sampling rates, value ranges, sizes, or padding all stay in step.

## Sharing without a wrapper

`<ChartGroup>` is sugar over a `ChartGroupState` object. Create one yourself and pass it as `group` when the charts aren't siblings, or when you want to read the shared state:

```svelte
<script>
	import { ChartGroupState } from 'layerchart';
	const group = new ChartGroupState();
</script>

<LineChart {data} x="date" y="value" {group} />
<BarChart {data} x="date" y="count" {group} />

<p>Hovering: {group.pointer.data?.date}</p>
```

Because it's plain reactive state, anything can take part — not just charts. A table row, a value readout, or a video scrubber can drive every chart in the group by writing to it:

```svelte
<button onclick={() => group.setPointer({ x: someDate })}>Jump to date</button>
<button onclick={() => group.clearPointer()}>Clear</button>
```

This is also how you make a synced dashboard keyboard-accessible: screen reader and keyboard users
never trigger the hover tooltip, but they can step the shared pointer along the timeline and have
every chart follow.

:example{ component="ChartGroup" name="programmatic-control" }

::note
Create the state inside a component (or `<ChartGroup>`), not at module scope. A module-level instance is shared across requests on the server and across every user of that module on the client.
::

## Highlight without tooltips

By default every chart shows its own tooltip. For a busy dashboard, `tooltip: false` shows the highlight on the other charts but leaves the tooltip to the one being hovered:

```svelte
<ChartGroup pointer={{ tooltip: false }}>
```

To vary the highlight itself — say, a point on the chart being hovered and just a line on the rest — give each chart an `id` and compare it against `group.pointer.source`:

```svelte
<ChartGroup pointer={{ tooltip: false }}>
	{#snippet children({ group })}
		{#each panels as panel (panel.key)}
			<LineChart
				id={panel.key}
				highlight={{ lines: true, points: group.pointer.source === panel.key }}
				...
			/>
		{/each}
	{/snippet}
</ChartGroup>
```

:example{ component="ChartGroup" name="highlight-only" }

## Matching

`match` controls how a shared position resolves to a data point on each chart.

| Value                    | Behavior                                      | Use when                                        |
| ------------------------ | --------------------------------------------- | ----------------------------------------------- |
| `'value'` (default)      | Nearest data point to the shared domain value | Charts share a domain (ex. the same time range) |
| `'index'`                | Data point at the same index                  | Data arrays are aligned and equal length        |
| `'percent'`              | Same relative position within the plot area   | Domains are unrelated but comparable in shape   |
| `(pointer, ctx) => data` | Resolve it yourself                           | Joining on an id, snapping to an interval, etc. |

```svelte
<ChartGroup pointer={{ match: 'index' }}>
```

`'value'` is the default because it degrades gracefully — charts with different lengths still line up. `'index'` is exact and cheap but silently mismatches when the arrays differ.

Use `axis` to share on `'y'` or `'both'` instead of the default `'x'`:

```svelte
<ChartGroup pointer={{ axis: 'both' }}>
```

## Publishing and subscribing

Each chart can opt out of either direction with `groupOptions`. An overview chart that drives others without being driven by them:

```svelte
<AreaChart {group} groupOptions={{ subscribe: false }} />
<LineChart {group} groupOptions={{ publish: false }} />
```

Both default to `true`. Passing an array (`publish: ['pointer']`) limits it to specific slices.

## Programmatic control

| Member                            | Description                                                                        |
| --------------------------------- | ---------------------------------------------------------------------------------- |
| `pointer`                         | Current shared position — `x`, `y`, `data`, `index`, `percent`, `active`, `source` |
| `setPointer({ x, y, data, ... })` | Publish a position to the group                                                    |
| `clearPointer()`                  | Clear the shared position                                                          |
| `options`                         | The options the group was created with                                             |
| `id`                              | Identity of the group, used as `source` for external writes                        |

### Identifying charts

`pointer.source` is the `id` of the chart that published the current position. Charts get an opaque symbol by default; pass `id` to `Chart` (or any simplified chart) to supply your own, which also lands on the root element:

```svelte
<LineChart id="requests" {group} />
```

Inside a chart, `context.tooltip.source` names whatever drove the tooltip — the chart's own `id` when it came from its own pointer, otherwise the id of the chart or group that drove it:

```svelte
{#if context.tooltip.source === context.id}
	<!-- this chart is the one being hovered -->
{/if}
```

## Syncing brush and zoom

Brush selections are synced today with shared state and the `x` / `onChange` props — see [Syncing charts](/docs/guides/brush#syncing-charts) in the brush guide.

## API reference

- [ChartGroup](/docs/components/ChartGroup) — component API and examples
