---
title: WebGL
category: state
---

`@layerchart/webgl` draws charts with WebGL, using [three.js](https://threejs.org) through [Threlte](https://threlte.xyz): in true 3D, or flat for far more marks than `Svg` or `Canvas` keep up with. It's a separate package, so charts that don't use it never load three.js. For 3D on the existing `Svg`, `Canvas`, and `Html` layers, see [Isometric](/docs/guides/isometric), and [Views](/docs/guides/views) to compare them.

## Installation

:::tabs{key="bundler"}

    ::tab{label="pnpm" icon="vscode-icons:file-type-pnpm"}
    ```sh
    pnpm i @layerchart/webgl
    ```
    ::

    ::tab{label="npm" icon="vscode-icons:file-type-npm"}
    ```sh
    npm i @layerchart/webgl
    ```
    ::

    ::tab{label="bun" icon="vscode-icons:file-type-bun"}
    ```sh
    bun add @layerchart/webgl
    ```
    ::

    ::tab{label="deno" icon="vscode-icons:file-type-deno"}
    ```sh
    deno add npm:@layerchart/webgl
    ```
    ::

    ::tab{label="yarn" icon="vscode-icons:file-type-yarn"}
    ```sh
    yarn add @layerchart/webgl three @threlte/core
    ```
    ::

:::

`@layerchart/webgl` is released with `layerchart`, at the same version, and installs it. If your project also depends on `layerchart` directly, keep the two on the same version. `three` and `@threlte/core` are peer dependencies, so a project has one copy of each that its own code shares with the charts. Most package managers install them along with `@layerchart/webgl`; Yarn needs them listed.

## Quick start

Everything comes from `@layerchart/webgl`. `Chart`, `Tooltip`, and `Legend` are LayerChart's own, re-exported. The chart's `view` says how it's seen (`perspective`, as `isometric` does for flat layers), and the marks inside a [`WebGL`](/docs/components/webgl/WebGL) layer are drawn through it. A `transform` turns, pans, and zooms it.

```svelte
<script>
	import { Axis, Chart, Grid, Points, WebGL, perspective } from '@layerchart/webgl';
</script>

<Chart {data} x="x" y="y" z="z" view={perspective} transform={{ mode: 'canvas', drag: 'rotate' }}>
	<WebGL>
		<Grid />
		<Axis placement="bottom" />
		<Axis placement="left" />
		<Axis placement="back" />
		<Points />
	</WebGL>
</Chart>
```

:example{ component="webgl/Points" name="scatter-3d" }

Drag to turn the view, and shift-drag to pan. Hold shift and scroll to zoom, moving the camera in and out.

## How it works

The chart lays out exactly as a flat one would: `x` across the plot's width, `y` down its height, and `z` up off the floor, all through the chart's scales. The `WebGL` layer then stands that plot box up in 3D, with the floor seen at an angle.

- **The `z` scale** measures up from the floor, as it does for [isometric](/docs/guides/isometric#height). Its range defaults to half the floor's shorter side. Set `zRange={({ height }) => [0, height]}` for a cube.
- **Color, series, stacking, and domains** work as on any chart: marks register with the chart, and `fill` / `stroke` take a CSS color, or a data key or function run through the color scale (`c`, `cRange`, ...). CSS variables like `var(--color-primary)` resolve against the page, and follow theme changes.
- **Tooltips** show the row under the pointer, from the nearest mark with `tooltip` set (it's off by default, as for flat marks). Add `tooltipContext` to the chart and a `Tooltip.Root`.
- **Positions on a mark** (`x`, `y`, `z`, and the like) take a data key or function through the chart's scales, or a number of pixels, as LayerChart's primitives do. Marks take their LayerChart namesakes' props, so a chart moves between `Canvas` and `WebGL` with few changes.

## The view

The chart's `view` is the camera. `perspective` draws farther things smaller; `orthographic` keeps sizes true at any depth, as `isometric` does (see [Views](/docs/guides/views) for how they compare). Call either with options, or pass it as is for the defaults:

```svelte
<Chart view={perspective({ rotate: -30, tilt: 60, fov: 45 })}>
<Chart view={orthographic({ rotate: -30, tilt: 70 })}>
```

| Option   | What it does                                                                         | Default  |
| -------- | ------------------------------------------------------------------------------------ | -------- |
| `rotate` | Turns the floor about its center, clockwise, in degrees (as `isometric`)             | `-45`    |
| `tilt`   | Tips it away from the viewer, from `0` (seen from directly above) towards edge on    | `60`     |
| `fov`    | `perspective`'s vertical field of view, in degrees                                   | `35`     |
| `aspect` | The floor's width over its depth, kept as the chart resizes; `'auto'` as `isometric` | `'auto'` |
| `motion` | Ease to new angles (and `fov`), ex. `'tween'`                                        |          |

The camera fits the whole plot box into the plot area, inside the chart's `padding` as an `isometric` chart does, and refits when the chart resizes. Give it `padding` for room around the box (ex. for its axes' labels). New angles turn the view to them. Without a `view`, the layer is seen from directly above (see [Flat](#flat-2d)).

### Turning, panning, and zooming

A chart's `transform` moves a 3D view as it does an [isometric](/docs/guides/isometric#dragging-the-view) one: `mode: 'canvas'` pans and zooms what's drawn, and with `drag: 'rotate'` a drag turns the view (holding `dragSwitchKey`, `shift` by default, does the other). `scrollMode: 'scale'` zooms on scroll, and `scrollActivationKey` only while a key is held, so scrolling past the chart scrolls the page.

```svelte
<Chart
	view={perspective}
	transform={{ mode: 'canvas', drag: 'rotate', scrollMode: 'scale', scrollActivationKey: 'shift' }}
>
```

`onTransform` reports the angles a drag turns to as `rotation` (`x` is `rotate`, `y` is `tilt`). Hand them back to the view's options to keep controls in step with a drag. The transform's `zoomIn()`, `zoomOut()`, and `reset()` work as on any chart, so `TransformContextControls` works too; the [terrain](/docs/components/webgl/Surface#terrain) examples have them.

```svelte
<script>
	let rotate = $state(-45);
	let tilt = $state(60);
	let dragging = false;
</script>

<Chart
	view={perspective({ rotate, tilt })}
	transform={{ mode: 'canvas', drag: 'rotate' }}
	onTransform={({ rotation }) => {
		if (dragging && rotation) [rotate, tilt] = [rotation.x, rotation.y];
	}}
	ondragstart={() => (dragging = true)}
	ondragend={() => (dragging = false)}
>
```

In the playground below, the controls and dragging set the same view.

:example{ component="webgl/WebGL" name="playground" }

There are two ways to zoom. `mode: 'domain'` zooms the chart's `x` / `y` domains, as on a flat chart: the camera stays, so the axes keep their place and re-tick, and marks are clipped to the plot box (the `WebGL` layer's `clip`). `mode: 'canvas'` dollies the camera in and out instead, moving up to what's drawn (ex. a globe or a terrain). On a `globe`, zooming in brings the camera down towards the surface (its height above it divided by the zoom), so it comes close to the ground without ever passing inside. The transform's [constraints](/docs/guides/transform#constraints) limit how far the view goes: ex. `scaleExtent: [0.5, 3]` stops short of where an image starts to blur. A drag tips the view no further than edge on unless `tiltExtent` lets it: `tiltExtent: [0, 180]` turns on round to look from beneath (ex. a globe's south pole).

`Svg`, `Canvas`, and `Html` layers can't draw through a 3D view, and warn when they're given one. A layer with `ignoreTransform` draws over the scene as usual (ex. a title).

## Flat (2D)

Without a `view`, a `WebGL` layer is seen from directly above and drawn unshaded, each chart pixel where an `Svg` or `Canvas` layer would draw it, so flat layers can draw over it (ex. annotations). Points are discs rather than spheres. It's for charts with more marks than `Svg` or `Canvas` keep up with: a `transform` pans and zooms them.

```svelte
<Chart {data} x="x" y="y" transform={{ mode: 'canvas', scrollMode: 'scale' }}>
	<WebGL>
		<Points r={1.5} />
	</WebGL>
</Chart>
```

:example{ component="webgl/Points" name="scatter" }

Only the marks need a `WebGL` layer: the grid, axes, tooltip highlight, and legend can be LayerChart's own, in `Svg` layers above and below it.

:example{ component="webgl/Points" name="scatter-with-svg" }

## Lights and shadows

A `WebGL` layer lights itself until it has a [`Light`](/docs/components/webgl/Light) of its own: `directional` (like the sun on a map, with `shadow`), `point` (like a star among its planets), or `ambient`.

```svelte
<WebGL>
	<Light azimuth={315} altitude={35} shadow />
	<Light type="ambient" intensity={0.4} />
	...
</WebGL>
```

:example{ component="webgl/Light" name="buildings" }

## Maps and globes

Set a projection on the chart as for a flat map (see the [Geo guide](/docs/guides/geo)), and marks lay out through it: [`Points`](/docs/components/webgl/Points), [`Bars`](/docs/components/webgl/Bars), [`Bin`](/docs/components/webgl/Bin), [`Spline`](/docs/components/webgl/Spline), and [`Area`](/docs/components/webgl/Area) place rows at their longitude (`x`) and latitude (`y`), [`GeoPath`](/docs/components/webgl/GeoPath) extrudes features, [`GeoRaster`](/docs/components/webgl/GeoRaster) lays an image over the map, and a [`Surface`](/docs/components/webgl/Surface) of longitude and latitude is terrain.

:example{ component="webgl/Bin" name="state-population" }

The `globe` projection lays the map on a real sphere you can orbit, and the same marks draw on it.

```svelte
<Chart geo={{ projection: globe, fitGeojson: { type: 'Sphere' } }} view={perspective}>
	<WebGL>
		<GeoRaster image="/images/blue-marble.jpg" />
		<GeoPath geojson={countries} stroke="white" />
	</WebGL>
</Chart>
```

:example{ component="webgl/GeoRaster" name="globe" }

## Surfaces

Grids of values (a `data` grid, a function of `x` and `y`, or scattered rows) raised into a [`Surface`](/docs/components/webgl/Surface), laid on the floor as a [`Raster`](/docs/components/webgl/Raster), or traced by [`Contour`](/docs/components/webgl/Contour) lines, colored through the chart's continuous `cScale`.

:example{ component="webgl/Surface" name="volcano" }

## Limits

- Browsers limit how many WebGL contexts a page can have at once (16 in Chromium). A `WebGL` layer only holds one while it's on screen (or nearly), and gives it back when it's scrolled away.
- Nothing is drawn on the server. The layer renders once it mounts in the browser.
