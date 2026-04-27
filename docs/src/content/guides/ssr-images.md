---
title: SSR Images
description: Server-side render charts as PNG/JPEG images
category: advanced
---

LayerChart can render charts to PNG or JPEG images on the server using the `layerchart/server` module. This is useful for generating chart images for social cards, email embeds, Slack/Discord bots, PDF reports, or any context where an interactive chart isn't available.

## How it works

Server-side chart rendering uses three pieces:

1. **`<ServerChart>`** — A wrapper around `<Chart>` + `<Canvas>` that captures the component tree during SSR
2. **`renderChart()`** — Runs Svelte's SSR render, captures chart state, and paints the component tree onto a node canvas
3. **A canvas library** — Such as [`@napi-rs/canvas`](https://github.com/nicolo-ribaudo/napi-rs-canvas) to provide the `Canvas` and `Path2D` APIs on the server

## Quick start

### 1. Install dependencies

```bash
npm install @napi-rs/canvas
```

### 2. Create a chart component

Create a Svelte component using `<ServerChart>` instead of `<Chart>`:

```svelte
<!-- src/lib/charts/MyLineChart.svelte -->
<script lang="ts">
	import { ServerChart } from 'layerchart/server';
	import type { CaptureTarget } from 'layerchart/server';
	import { Axis, Grid, Spline } from 'layerchart';

	let {
		data,
		width,
		height,
		capture,
		onCapture
	}: {
		data: { date: number; value: number }[];
		width: number;
		height: number;
		capture?: CaptureTarget;
		onCapture?: (data: CaptureTarget) => void;
	} = $props();
</script>

<ServerChart
	{capture}
	{onCapture}
	{width}
	{height}
	{data}
	x="date"
	y="value"
	yDomain={[0, null]}
	padding={{ top: 20, right: 20, bottom: 30, left: 40 }}
>
	<Grid y stroke="rgba(0,0,0,0.1)" />
	<Axis placement="bottom" rule stroke="rgba(0,0,0,0.3)" fill="rgba(0,0,0,0.5)" />
	<Axis placement="left" rule stroke="rgba(0,0,0,0.3)" fill="rgba(0,0,0,0.5)" />
	<Spline stroke="rgb(59, 130, 246)" strokeWidth={2} />
</ServerChart>
```

The key props are:

- **`capture`** — An object that `ServerChart` populates with the chart state and component tree during SSR
- **`width` / `height`** — The output image dimensions in pixels

### 3. Create a server endpoint

```ts
// src/routes/api/chart/+server.ts
import { createCanvas, Path2D } from '@napi-rs/canvas';
import { renderChart } from 'layerchart/server';
import type { RequestHandler } from './$types';
import MyLineChart from '$lib/charts/MyLineChart.svelte';

// Register Path2D globally (required once)
if (typeof globalThis.Path2D === 'undefined') {
	(globalThis as any).Path2D = Path2D;
}

const data = Array.from({ length: 50 }, (_, i) => ({
	date: i,
	value: 50 + 30 * Math.sin(i / 5)
}));

export const GET: RequestHandler = async ({ url }) => {
	const width = Number(url.searchParams.get('width') ?? 800);
	const height = Number(url.searchParams.get('height') ?? 400);
	const format = url.searchParams.get('format') === 'jpeg' ? 'jpeg' : 'png';

	const buffer = renderChart(MyLineChart, {
		width,
		height,
		format,
		props: { data },
		createCanvas: (w, h) => createCanvas(w, h) as any
	});

	return new Response(buffer, {
		headers: { 'Content-Type': `image/${format}` }
	});
};
```

The chart image is now available at `/api/chart` and supports query params:

- `/api/chart` — 800x400 PNG (defaults)
- `/api/chart?width=1200&height=600` — custom size
- `/api/chart?format=jpeg` — JPEG output

## API reference

### `renderChart(component, options)`

The simplest way to render a chart to an image buffer. Handles SSR render, capture, and canvas painting in one call.

```ts
import { renderChart } from 'layerchart/server';

const buffer = renderChart(MyChart, {
	width: 800,
	height: 400,
	props: { data: myData },
	createCanvas: (w, h) => createCanvas(w, h),
	// Optional:
	format: 'png', // 'png' | 'jpeg'
	quality: 0.92, // JPEG quality (0-1)
	devicePixelRatio: 2, // High-DPI output
	background: 'white' // Background color (transparent by default)
});
```

| Option             | Type                  | Default | Description                                                            |
| ------------------ | --------------------- | ------- | ---------------------------------------------------------------------- |
| `width`            | `number`              | —       | Image width in pixels                                                  |
| `height`           | `number`              | —       | Image height in pixels                                                 |
| `props`            | `Record<string, any>` | `{}`    | Additional props passed to the chart component                         |
| `createCanvas`     | `(w, h) => Canvas`    | —       | Canvas factory (e.g. from `@napi-rs/canvas`)                           |
| `format`           | `'png' \| 'jpeg'`     | `'png'` | Output format                                                          |
| `quality`          | `number`              | `0.92`  | JPEG quality                                                           |
| `devicePixelRatio` | `number`              | `1`     | Pixel ratio for high-DPI                                               |
| `background`       | `string`              | —       | Background fill color. Omit for transparent PNG. Recommended for JPEG. |

### `renderCapturedChart(capture, options)`

Lower-level function for advanced use cases where you need control over the SSR render step. See `createCaptureCallback()` for the capture workflow.

### `<ServerChart>`

A wrapper component around `<Chart>` + `<Canvas>` designed for server rendering. Accepts all `<Chart>` props plus:

| Prop        | Type             | Description                                  |
| ----------- | ---------------- | -------------------------------------------- |
| `capture`   | `CaptureTarget`  | Object populated with chart state during SSR |
| `onCapture` | `(data) => void` | Callback alternative to the `capture` prop   |

## Examples

These examples are rendered live from the API endpoints in this project.

### Line chart

```svelte
<ServerChart
	{capture}
	{onCapture}
	{width}
	{height}
	{data}
	x="date"
	y="value"
	yDomain={[0, null]}
	padding={{ top: 20, right: 20, bottom: 30, left: 40 }}
>
	<Grid y stroke="rgba(0,0,0,0.1)" />
	<Axis placement="bottom" rule stroke="rgba(0,0,0,0.3)" fill="rgba(0,0,0,0.5)" />
	<Axis placement="left" rule stroke="rgba(0,0,0,0.3)" fill="rgba(0,0,0,0.5)" />
	<Spline stroke="rgb(59, 130, 246)" strokeWidth={2} />
</ServerChart>
```

```html
<img src="/api/charts/line" />
```

![Line chart](/api/charts/line)

### Bar chart

```svelte
<ServerChart
	{capture}
	{onCapture}
	{width}
	{height}
	{data}
	x="category"
	xScale={scaleBand().paddingInner(0.2).paddingOuter(0.1)}
	y="value"
	yDomain={[0, null]}
	padding={{ top: 20, right: 20, bottom: 30, left: 40 }}
>
	<Grid y stroke="rgba(0,0,0,0.1)" />
	<Axis placement="bottom" rule stroke="rgba(0,0,0,0.3)" fill="rgba(0,0,0,0.5)" />
	<Axis placement="left" rule stroke="rgba(0,0,0,0.3)" fill="rgba(0,0,0,0.5)" />
	<Bars fill="rgb(59, 130, 246)" radius={4} />
</ServerChart>
```

```html
<img src="/api/charts/bar" />
```

![Bar chart](/api/charts/bar)

### Area chart (multi-series)

```svelte
<ServerChart
	{capture}
	{onCapture}
	{width}
	{height}
	{data}
	x="date"
	y="value"
	yDomain={[0, null]}
	padding={{ top: 20, right: 20, bottom: 30, left: 40 }}
>
	<Grid y stroke="rgba(0,0,0,0.1)" />
	<Axis placement="bottom" rule stroke="rgba(0,0,0,0.3)" fill="rgba(0,0,0,0.5)" />
	<Axis placement="left" stroke="rgba(0,0,0,0.3)" fill="rgba(0,0,0,0.5)" />
	<Area y1="value2" fill="rgba(249, 115, 22, 0.15)" stroke="none" />
	<Spline y="value2" stroke="rgb(249, 115, 22)" strokeWidth={2} />
	<Area fill="rgba(59, 130, 246, 0.15)" stroke="none" />
	<Spline stroke="rgb(59, 130, 246)" strokeWidth={2} />
</ServerChart>
```

```html
<img src="/api/charts/area" />
```

![Area chart](/api/charts/area)

### Geo chart

```svelte
<script lang="ts">
	import { ServerChart } from 'layerchart/server';
	import type { CaptureTarget } from 'layerchart/server';
	import { GeoPath } from 'layerchart/geo';
	import type { GeoProjection, GeoPermissibleObjects } from 'd3-geo';

	let {
		states,
		projection,
		width,
		height,
		capture,
		onCapture
	}: {
		states: GeoPermissibleObjects & { features: GeoPermissibleObjects[] };
		projection: () => GeoProjection;
		width: number;
		height: number;
		capture?: CaptureTarget;
		onCapture?: (data: CaptureTarget) => void;
	} = $props();
</script>

<ServerChart
	{capture}
	{onCapture}
	{width}
	{height}
	geo={{
		projection,
		fitGeojson: states
	}}
	padding={{ top: 10, right: 10, bottom: 10, left: 10 }}
>
	{#each states.features as feature (feature)}
		<GeoPath
			geojson={feature}
			fill="rgba(59, 130, 246, 0.15)"
			stroke="rgb(59, 130, 246)"
			strokeWidth={0.5}
		/>
	{/each}
</ServerChart>
```

```html
<img src="/api/charts/geo" />
```

![Geo chart](/api/charts/geo)

### Scatter chart

```svelte
<ServerChart
	{capture}
	{onCapture}
	{width}
	{height}
	{data}
	x="x"
	y="y"
	padding={{ top: 20, right: 20, bottom: 30, left: 40 }}
>
	<Grid y stroke="rgba(0,0,0,0.1)" />
	<Axis placement="bottom" rule stroke="rgba(0,0,0,0.3)" fill="rgba(0,0,0,0.5)" />
	<Axis placement="left" rule stroke="rgba(0,0,0,0.3)" fill="rgba(0,0,0,0.5)" />
	<Points fill="rgba(59, 130, 246, 0.6)" stroke="rgb(59, 130, 246)" strokeWidth={1} r={5} />
</ServerChart>
```

```html
<img src="/api/charts/scatter" />
```

![Scatter chart](/api/charts/scatter)

### Sankey chart

```svelte
<ServerChart
	{capture}
	{onCapture}
	{width}
	{height}
	{data}
	flatData={[]}
	padding={{ top: 10, right: 100, bottom: 10, left: 10 }}
>
	<Sankey nodeId={(d) => d.id}>
		{#snippet children({ links, nodes })}
			{#each links as link}
				<Link
					sankey
					data={link}
					strokeWidth={link.width}
					stroke="rgba(59, 130, 246, 0.2)"
					fill="none"
				/>
			{/each}
			{#each nodes as node (node.id)}
				{@const nodeWidth = (node.x1 ?? 0) - (node.x0 ?? 0)}
				{@const nodeHeight = (node.y1 ?? 0) - (node.y0 ?? 0)}
				<Group x={node.x0} y={node.y0}>
					<Rect width={nodeWidth} height={nodeHeight} fill="rgb(59, 130, 246)" />
					<Text
						value={node.id}
						x={node.height === 0 ? -4 : nodeWidth + 4}
						y={nodeHeight / 2}
						textAnchor={node.height === 0 ? 'end' : 'start'}
						verticalAnchor="middle"
						fill="rgba(0,0,0,0.7)"
					/>
				</Group>
			{/each}
		{/snippet}
	</Sankey>
</ServerChart>
```

```html
<img src="/api/charts/sankey" />
```

![Sankey chart](/api/charts/sankey)

### Tree chart

```svelte
<ServerChart
	{capture}
	{onCapture}
	{width}
	{height}
	padding={{ top: 20, bottom: 20, left: 60, right: 60 }}
>
	<Tree {hierarchy} orientation="horizontal">
		{#snippet children({ nodes, links })}
			{#each links as link}
				<Link data={link} orientation="horizontal" stroke="rgba(0,0,0,0.2)" fill="none" />
			{/each}
			{#each nodes as node}
				<Group x={node.y - nodeWidth / 2} y={node.x - nodeHeight / 2}>
					<Rect
						width={nodeWidth}
						height={nodeHeight}
						fill="white"
						stroke={node.children ? 'rgb(59, 130, 246)' : 'rgba(0,0,0,0.3)'}
						rx={10}
					/>
					<Text
						value={node.data.name}
						x={nodeWidth / 2}
						y={nodeHeight / 2}
						dy={-2}
						textAnchor="middle"
						verticalAnchor="middle"
						fill={node.children ? 'rgb(59, 130, 246)' : 'rgba(0,0,0,0.5)'}
					/>
				</Group>
			{/each}
		{/snippet}
	</Tree>
</ServerChart>
```

```html
<img src="/api/charts/tree" />
```

![Tree chart](/api/charts/tree)

### Treemap chart

```svelte
<ServerChart
	{capture}
	{onCapture}
	{width}
	{height}
	padding={{ top: 4, right: 4, bottom: 4, left: 4 }}
>
	<Treemap hierarchy={root} paddingOuter={4} paddingInner={4} paddingTop={20}>
		{#snippet children({ nodes })}
			{#each nodes as node}
				{@const nodeWidth = node.x1 - node.x0}
				{@const nodeHeight = node.y1 - node.y0}
				{@const nodeColor = getNodeColor(node)}
				<Group x={node.x0} y={node.y0}>
					<Rect
						width={nodeWidth}
						height={nodeHeight}
						stroke={hsl(nodeColor).darker(1).toString()}
						fill={nodeColor}
						fillOpacity={node.children ? 0.5 : 1}
						rx={5}
					/>
					<Text value={node.data.name} x={4} y={12} fill="rgba(0,0,0,0.7)" />
				</Group>
			{/each}
		{/snippet}
	</Treemap>
</ServerChart>
```

```html
<img src="/api/charts/treemap" />
```

![Treemap chart](/api/charts/treemap)

## Supported components

Server-side rendering works with components that have **canvas rendering support**. Most primitive and data mark components work:

| Works | Component                                                                |
| ----- | ------------------------------------------------------------------------ |
| Yes   | `Spline`, `Area`, `Line`, `Path`, `Rect`, `Circle`, `Ellipse`, `Polygon` |
| Yes   | `Bars`, `Points`, `Group`, `Text`                                        |
| Yes   | `Axis`, `Grid`, `Rule`                                                   |
| Yes   | `LinearGradient`, `RadialGradient`, `Pattern`, `ClipPath`                |
| Yes   | `GeoPath` (via `Path` canvas render)                                     |
| No    | `Tooltip`, `Legend`, `Highlight` (interactive/DOM)                       |

> **Note:** CSS classes and Tailwind utilities don't apply on the server. Pass explicit `stroke` and `fill` props to `Axis`, `Grid`, and other components for control over colors.

## Tips

### Styling Axis and Grid

Since CSS variables don't resolve on the server, `Axis` and `Grid` accept `stroke` and `fill` props that pass through to their child Lines and Text:

```svelte
<Grid y stroke="rgba(0,0,0,0.1)" />
<Axis placement="bottom" stroke="rgba(0,0,0,0.3)" fill="rgba(0,0,0,0.5)" />
<Axis placement="left" stroke="rgba(0,0,0,0.3)" fill="rgba(0,0,0,0.5)" />
```

- **`stroke`** — applied to grid lines, axis rule, tick marks, and tick label stroke
- **`fill`** — applied to tick labels and axis label text fill

### Transparency and background

PNG output is transparent by default. To add a solid background, use the `background` option:

```ts
const buffer = renderChart(MyChart, {
	width: 800,
	height: 400,
	background: 'white'
	// ...
});
```

JPEG does not support transparency and will render a black background unless you set `background`. Always set a background when using JPEG format.

### High-DPI images

Pass `devicePixelRatio: 2` for retina-quality output (doubles the canvas resolution):

```ts
const buffer = renderChart(MyChart, {
	width: 800,
	height: 400,
	devicePixelRatio: 2
	// ...
});
```

### Cloudflare and edge runtimes

Server-side chart rendering requires a **native Node.js canvas library** such as `@napi-rs/canvas`, `node-canvas`, or `skia-canvas`. These are native addons that do not run on edge runtimes like Cloudflare Workers.

If you deploy to Cloudflare Pages (or similar edge platforms), **prerender your chart endpoints** so the images are generated at build time:

```ts
// +server.ts
export const prerender = true;

export const GET: RequestHandler = async ({ url }) => {
	return renderChartResponse({ component: MyChart, props: { data }, url });
};
```

Prerendered endpoints become static files served directly from the CDN — no server-side canvas library needed at runtime. Note that query parameters (like `?width=1200`) are not available for prerendered routes, so bake any defaults into the endpoint code.

### Inline styles only

Since there is no DOM or CSS engine on the server, use inline style props (`fill`, `stroke`, `strokeWidth`, etc.) instead of CSS classes or Tailwind utilities.

```svelte
<!-- Do this -->
<Spline stroke="rgb(59, 130, 246)" strokeWidth={2} />

<!-- Not this -->
<Spline class="stroke-blue-500 stroke-2" />
```
