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

Both default to `true`. Passing an array limits it to specific slices — `'pointer'`, `'brush'`, `'domain'`:

```svelte
<Chart {group} groupOptions={{ publish: ['pointer'], subscribe: ['pointer', 'domain'] }} />
```

Naming a slice also opts into behaviour the default doesn't include — see [zooming the others without zooming yourself](#zooming-the-others-without-zooming-yourself).

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

## Brush selections

Charts in a group share their [brush](/docs/guides/brush) selection — dragging on one selects the same domain range on the others. A chart without a brush can follow along by reading `group.brush`, which is all an overview/detail pair needs:

```svelte
<ChartGroup>
	{#snippet children({ group })}
		{@const selection = group.brush.active ? group.brush : null}

		<!-- detail: follows the selection -->
		<Chart {data} x="date" y="value" xDomain={selection?.x}>…</Chart>

		<!-- overview: owns the brush -->
		<Chart {data} x="date" y="value" brush>…</Chart>
	{/snippet}
</ChartGroup>
```

:example{ component="ChartGroup" name="synced-brushes" }

Use `brush: false` to opt out, or `axis` to share `'y'` / `'both'` instead of the default `'x'`:

```svelte
<ChartGroup brush={{ axis: 'both' }}>
```

| Member               | Description                                             |
| -------------------- | ------------------------------------------------------- |
| `brush`              | Current shared selection — `x`, `y`, `active`, `source` |
| `setBrush({ x, y })` | Publish a selection to the group                        |
| `clearBrush()`       | Clear the shared selection                              |

## Zoom

Brush-to-zoom (`zoomOnBrush`, the default on simplified charts) consumes the selection into the chart's domain and resets it — so there is no lasting selection to share. What gets shared instead is the resulting **domain**, which zooms every chart in the group:

```svelte
<ChartGroup>
	<LineChart {data} x="date" y="value" brush />
	<LineChart {data} x="date" y="count" brush />
</ChartGroup>
```

:example{ component="ChartGroup" name="synced-zoom" }

### Zooming the others without zooming yourself

An overview chart shouldn't zoom — it has to keep showing the full extent. Naming `'domain'` in its `publish` makes its brush set the group's domain instead of sharing a selection:

```svelte
{@const viewport = group.brush.active ? group.brush : group.domain}

<Chart
	{data}
	x="x"
	y="y"
	brush={{ x: viewport.x ?? [null, null], y: viewport.y ?? [null, null] }}
	groupOptions={{ publish: ['domain'] }}
/>
```

Controlling the overview's brush is what keeps its rectangle showing the current viewport. Read `group.brush` while a selection is in progress so the rectangle tracks a drag on another chart live, and fall back to `group.domain` once it commits. Use `[null, null]` rather than `undefined` for "no selection" — `undefined` means _uncontrolled_, so the rectangle would stay behind when the domain is cleared.

This has to be asked for by name. The default is to share everything, and under that default every plain brush would zoom the whole group — which is not what making a selection means.

:example{ component="ChartGroup" name="minimap" }

| Member                | Description                                          |
| --------------------- | ---------------------------------------------------- |
| `domain`              | Current shared domain — `x`, `y`, `active`, `source` |
| `setDomain({ x, y })` | Publish a visible domain to the group                |
| `clearDomain()`       | Reset charts to their natural extent                 |

Precedence when several things want to set a chart's domain, highest first:

1. the chart's **own** brush zoom — direct interaction on that chart
2. an explicit `xDomain` / `yDomain` **prop** — a sibling must not override what the app controls
3. the **group's** shared domain

A domain arriving from the group releases a zoom the chart performed earlier, so the most recent interaction wins rather than the first one pinning the chart forever.

::note
Charts using `transform={{ mode: 'domain' }}` publish their zoom but don't currently apply a shared one — the transform narrows the domain itself, so the two would fight.
::

## API reference

- [ChartGroup](/docs/components/ChartGroup) — component API and examples
