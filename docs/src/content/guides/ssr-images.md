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
  import { Area, Spline } from 'layerchart';

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
  padding={{ top: 20, right: 20, bottom: 24, left: 24 }}
>
  <Area fill="rgba(59, 130, 246, 0.15)" stroke="none" />
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
    createCanvas: (w, h) => createCanvas(w, h) as any,
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
  format: 'png',         // 'png' | 'jpeg'
  quality: 0.92,         // JPEG quality (0-1)
  devicePixelRatio: 2,   // High-DPI output
});
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `width` | `number` | — | Image width in pixels |
| `height` | `number` | — | Image height in pixels |
| `props` | `Record<string, any>` | `{}` | Additional props passed to the chart component |
| `createCanvas` | `(w, h) => Canvas` | — | Canvas factory (e.g. from `@napi-rs/canvas`) |
| `format` | `'png' \| 'jpeg'` | `'png'` | Output format |
| `quality` | `number` | `0.92` | JPEG quality |
| `devicePixelRatio` | `number` | `1` | Pixel ratio for high-DPI |

### `renderCapturedChart(capture, options)`

Lower-level function for advanced use cases where you need control over the SSR render step. See `createCaptureCallback()` for the capture workflow.

### `<ServerChart>`

A wrapper component around `<Chart>` + `<Canvas>` designed for server rendering. Accepts all `<Chart>` props plus:

| Prop | Type | Description |
|------|------|-------------|
| `capture` | `CaptureTarget` | Object populated with chart state during SSR |
| `onCapture` | `(data) => void` | Callback alternative to the `capture` prop |

## Supported components

Server-side rendering works with components that have **canvas rendering support**. Most primitive and data mark components work:

| Works | Component |
|-------|-----------|
| Yes | `Spline`, `Area`, `Line`, `Path`, `Rect`, `Circle`, `Ellipse`, `Polygon` |
| Yes | `Bars`, `Points`, `Group`, `Text`* |
| Yes | `LinearGradient`, `RadialGradient`, `Pattern`, `ClipPath` |
| Yes | `GeoPath` (via `Path` canvas render) |
| No | `Axis`, `Grid`, `Rule` (SVG-only) |
| No | `Tooltip`, `Legend`, `Highlight` (interactive/DOM) |

\* `Text` requires DOM for font resolution via `getComputedStyles`. When rendering server-side, text will use fallback font metrics. For reliable text, set explicit font styles.

## Tips

### Grid lines without `Grid`

Since `Grid` and `Axis` are SVG-only, you can draw grid lines using `Line` which has canvas support:

```svelte
<script lang="ts">
  import { getChartContext, isScaleBand, Line } from 'layerchart';
  const ctx = getChartContext();
  const ticks = $derived(ctx.yScale.ticks?.(5) ?? []);
</script>

{#each ticks as tick}
  <Line
    x1={0}
    y1={ctx.yScale(tick)}
    x2={ctx.width}
    y2={ctx.yScale(tick)}
    stroke="rgba(0,0,0,0.08)"
    strokeWidth={1}
  />
{/each}
```

### High-DPI images

Pass `devicePixelRatio: 2` for retina-quality output (doubles the canvas resolution):

```ts
const buffer = renderChart(MyChart, {
  width: 800,
  height: 400,
  devicePixelRatio: 2,
  // ...
});
```

### Inline styles only

Since there is no DOM or CSS engine on the server, use inline style props (`fill`, `stroke`, `strokeWidth`, etc.) instead of CSS classes or Tailwind utilities.

```svelte
<!-- Do this -->
<Spline stroke="rgb(59, 130, 246)" strokeWidth={2} />

<!-- Not this -->
<Spline class="stroke-blue-500 stroke-2" />
```
