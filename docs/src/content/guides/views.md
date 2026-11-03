---
title: Views (2D and 3D)
category: state
---

A chart's `view` says how its plot area is seen. Without one, it's flat: `x` across, `y` down, as on any chart. With one, the plot area becomes a **floor** seen at an angle, and `z` rises off it.

```svelte
<Chart view={isometric}>
<Chart view={perspective}>
```

There are three views, which differ in how they're drawn and which layers can draw them.

|            | `isometric`                         | `orthographic`                       | `perspective`                        |
| ---------- | ----------------------------------- | ------------------------------------ | ------------------------------------ |
| Projection | Parallel                            | Parallel                             | Far things smaller                   |
| Drawn by   | `Svg`, `Canvas`, `Html`             | `WebGL`                              | `WebGL`                              |
| Depth      | Faux (2D, back to front)            | True (depth tested, lit)             | True (depth tested, lit)             |
| Guide      | [Isometric](/docs/guides/isometric) | [WebGL](/docs/guides/webgl#the-view) | [WebGL](/docs/guides/webgl#the-view) |

`isometric` draws with LayerChart's own marks, from `layerchart`. The two cameras draw with [`@layerchart/webgl`](/docs/guides/webgl)'s marks, which take the same props.

## Choosing a view

- **`isometric`** keeps everything you already use: the same layers, marks, axes, text, and CSS, with no extra package. It's faux 3D, a 2D drawing of a floor turned and tipped, so it suits charts that read as a raised floor (ex. [3D bars](/docs/guides/isometric#height), calendars, treemaps, maps with height).
- **`orthographic`** draws the same parallel projection in true 3D, with [`@layerchart/webgl`](/docs/guides/webgl): marks hide what's behind them, faces are lit, and lights cast shadows. Reach for it when faux depth isn't enough (ex. dense 3D scatters, surfaces, terrain), or for more marks than `Svg` and `Canvas` keep up with.
- **`perspective`** is `orthographic` with a camera's depth: farther things are smaller, which reads as more natural for scenes and globes, at the cost of comparing sizes across depth.

The same data drawn both ways: `isometric` in an `Svg` layer, and `perspective` (or `orthographic`, with its toggle) in a `WebGL` layer.

:example{ component="Chart" name="isometric-scatter-3d" }

:example{ component="webgl/Points" name="scatter-3d" }

## What they share

All three views take the same options, so moving a chart between them is mostly changing its `view`:

| Option   | What it does                                                                      | Default                                 |
| -------- | --------------------------------------------------------------------------------- | --------------------------------------- |
| `rotate` | Turns the floor about its center, clockwise, in degrees                           | `-45`                                   |
| `tilt`   | Tips it away from the viewer, from `0` (seen from directly above) towards edge on | `54.7356` (`isometric`), `60` (cameras) |
| `aspect` | The floor's width over its depth, or `'auto'` to take it from the data            | `'auto'`                                |
| `motion` | Eases the view to new angles, ex. `'tween'`                                       |                                         |
| `fov`    | `perspective` only: the vertical field of view, in degrees                        | `35`                                    |

- **Height:** `z` is a third position channel, through the chart's `zScale`, from the floor up. Its range defaults to half the floor's shorter side. Marks take `z` the same way in every view (see [Height](/docs/guides/isometric#height)).
- **Turning, panning, and zooming:** a chart's `transform` with `drag: 'rotate'` turns any view, `onTransform` reports the angles as `rotation`, and `rotateExtent` / `tiltExtent` limit them (see [Transform](/docs/guides/transform#constraints), [Dragging the view](/docs/guides/isometric#dragging-the-view), and [Turning, panning, and zooming](/docs/guides/webgl#turning-panning-and-zooming)).
- **Fit:** the floor, and anything rising off it, is fitted into the plot area inside the chart's `padding`. Give it `padding` for room around it (ex. for axis labels).
- **Axes:** `Axis placement="bottom"` and `"left"` run along the floor's edges, and `"back"` up its back corner. Tick labels lie on the floor unless `tickLabelProps={{ viewport: true }}` turns them to face the viewer.

## Mixing layers

An `isometric` view draws in every `Svg`, `Canvas`, and `Html` layer of the chart, so they can be mixed as on a flat chart. `orthographic` and `perspective` are drawn by `WebGL` layers only: `Svg`, `Canvas`, and `Html` layers can't draw through a camera, and warn when they're given one. A layer with `ignoreTransform` draws over the scene, flat (ex. a title), as do `Tooltip` and `Legend`.

Without a `view`, a `WebGL` layer is flat too, lined up pixel for pixel with the chart's other layers: see [Flat (2D)](/docs/guides/webgl#flat-2d).
