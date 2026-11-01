---
title: 3D Surfaces & Rasters
category: state
---

Grids of values in [3D](/docs/guides/3d): raised into a `Surface`, laid on the floor as a `Raster`, or traced by `Contour` lines. All three take their values the same ways LayerChart's [Raster](/docs/components/Raster) does:

- **A grid:** `data` (row-major values) with `width` × `height`, laid across the plot, or across `x1` / `y1` to `x2` / `y2` in data coordinates.
- **A function:** `value={(x, y) => ...}`, sampled across the plot every `pixelSize` pixels, in data coordinates (longitude and latitude on a map).
- **Scattered rows:** `data` with `x`, `y`, and `value`, interpolated onto a grid (`interpolate`).

Values are colored through the chart's continuous color scale (`cScale`), else yellow-green-blue, as `Raster` colors them.

## Surface

Heights from the values, through the chart's `z` scale (whose domain widens to reach them). `wireframe` draws grid lines over it, and `contours` draws contour lines at their heights. With `tooltip`, the tooltip shows the value at the pointer.

```svelte
<Chart
	xDomain={[-1, 1]}
	yDomain={[-1, 1]}
	cScale={scaleSequential(interpolateRdYlBu)}
	view={perspective}
>
	<WebGL>
		<Surface value={(x, y) => Math.sin(x * Math.PI) * Math.sin(y * Math.PI)} wireframe />
	</WebGL>
</Chart>
```

:example{ component="WebGL" name="surface" }

:example{ component="WebGL" name="volcano" }

:example{ component="WebGL" name="math-functions" }

:example{ component="WebGL" name="mandelbrot" }

| Prop        | What it does                                                        | Default                |
| ----------- | ------------------------------------------------------------------- | ---------------------- |
| `pixelSize` | Pixels between samples of a function, scattered rows, or a map grid | `8`                    |
| `fill`      | One CSS color instead of coloring by value                          |                        |
| `wireframe` | Grid lines: `true`, or along every `n`th sample                     | `false`                |
| `contours`  | Contour lines: a count of thresholds, or the values                 |                        |
| `stroke`    | The lines' CSS color                                                | surface content at 40% |
| `opacity`   |                                                                     | `1`                    |

## Raster

The values as an image on the floor (or `z` pixels above it). `imageRendering="pixelated"` shows each cell with hard edges. The volcano, mandelbrot, and math functions above draw one in their flat style.

## Contour

Contour lines on their own: flat at `z` pixels, or each raised to its threshold's height with `z="value"`. The volcano above draws them over a `Raster` in its flat style.
