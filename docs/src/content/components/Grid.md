---
description: Commonly used component which draws horizontal and vertical lines respecting scales across a chart to enhance readability and help align data points with axis values.
category: common
layers: [svg, canvas, html]
related: [Axis, Rule]
components:
  - { name: Grid }
  - { name: webgl/Grid, label: Grid (WebGL) }
---

## Usage

:example{ name="basic" showCode }

<!-- ## Examples

### Basic

:example{ name="basic" }

### Padding

Respects padding

:example{ name="padding" }

### Single axis (x)

:example{ name="x-only" }

### Single axis (y)

:example{ name="y-only" }

### Dashed lines

:example{ name="dashed-lines" }

### Band scale (align center / default)

:example{ name="band-scale-default" }

### Band scale (align between)

:example{ name="band-scale-between" }

### Radial

:example{ name="radial" }

### Radial (linear)

:example{ name="radial-linear" }

### Integer-only ticks

:example{ name="integer-only" }

### Explicit ticks

:example{ name="explicit-ticks" }

### Inject tick value

:example{ name="inject-tick-value" }

### Tick count

:example{ name="tick-count" }

### Remove default tick count

:example{ name="tick-count-null" } -->

## WebGL

In a [`WebGL`](/docs/components/WebGL) layer, from [`@layerchart/webgl`](/docs/guides/webgl), it lines the plot box's floor and back walls. See the [WebGL guide](/docs/guides/webgl) to get started.

The floor and the two walls behind the plot, with lines at the scales' ticks. The walls move to the far sides as the view turns.

```svelte
<WebGL>
	<Grid />
	<Points />
</WebGL>
```

:example{ component="Points" name="scatter-3d" }

Set `x`, `y`, or `z` to `false` to leave out a direction's lines (ex. `<Grid z={false} />`).

:example{ component="Bin" name="hexbin" }
