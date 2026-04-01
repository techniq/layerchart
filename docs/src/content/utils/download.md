---
description: Utility functions to export and download charts as PNG images or SVG files.
category: tools
layers: []
related: []
---

## Usage

### downloadImage()

Downloads a chart container as a PNG (or JPEG / WebP) image. Handles both `<Svg>` and `<Canvas>` layers, compositing them in z-index order.

SVG layer styles (CSS variables, Tailwind classes, etc.) are inlined before rasterisation so the exported image renders correctly outside the browser.

```svelte
<script lang="ts">
  import { Chart, Svg, downloadImage } from 'layerchart';

  let chartRef = $state<HTMLElement>();
</script>

<Chart bind:ref={chartRef} data={[...]} x="date" y="value">
  <Svg>...</Svg>
</Chart>

<button onclick={() => downloadImage(chartRef, { filename: 'my-chart' })}>
  Download PNG
</button>
```

#### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `filename` | `string` | `'chart'` | File name without extension |
| `format` | `'png' \| 'jpeg' \| 'webp'` | `'png'` | Output image format |
| `quality` | `number` | `0.92` | Quality for lossy formats (0–1) |
| `background` | `string` | transparent (PNG) / white (JPEG/WebP) | Background fill color |
| `pixelRatio` | `number` | `window.devicePixelRatio` | Scale factor — higher = crisper on retina |

### downloadSvg()

Downloads the SVG layers of a chart container as a `.svg` file. CSS variables and class-based styles are inlined so the file renders correctly in editors and other tools.

When multiple `<Svg>` layers are present they are composited into a single `<svg>` in z-index order.

Returns `false` (no download triggered) if the container has no SVG layers, e.g. Canvas-only charts.

```svelte
<script lang="ts">
  import { Chart, Svg, downloadSvg } from 'layerchart';

  let chartRef = $state<HTMLElement>();
</script>

<Chart bind:ref={chartRef} data={[...]} x="date" y="value">
  <Svg>...</Svg>
</Chart>

<button onclick={() => downloadSvg(chartRef, { filename: 'my-chart' })}>
  Download SVG
</button>
```

### getChartImageBlob()

Lower-level alternative to `downloadImage()` that returns a `Blob` instead of triggering a download. Useful for copying to the clipboard, uploading to a server, etc.

```ts
import { getChartImageBlob } from 'layerchart';

const blob = await getChartImageBlob(chartRef, { format: 'png', background: 'white' });
await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
```

### getChartSvgString()

Lower-level alternative to `downloadSvg()` that returns the serialized SVG string (or `null` for Canvas-only charts).

```ts
import { getChartSvgString } from 'layerchart';

const svg = getChartSvgString(chartRef);
if (svg) {
  // upload, post-process, etc.
}
```
