---
title: Primitives
order: 3
---

<script lang="ts">
  import { allComponents } from 'content-collections';
  import ComponentLink from '$lib/components/ComponentLink.svelte';

  let primitiveComponents = allComponents.filter(c => c.category === 'primitives');
</script>

Primitives are foundational components which support rendering within different layer types including `Svg`, `Canvas`, or `Html`. These components can be used directly and are also used internally by many components.

## Features

- Styling using attributes (`fill`, `stroke`, etc), `style`, and `class` (including CSS variables and media queries)
- Pointer events (click, down, enter, move, leave, etc)
- Motion-enabled, providing tween and spring based transitions for location (x/y) and dimensions (width/height)

These features are available across all layer types (including `Canvas`).

## Layer support

Some primitives are not available in all layer types based on the primitive's needs and browser [capabilities](/docs/guides/layers).

LayerChart does provide extended support than what is natively possible in some cases. For example `Text` provides word wrapping in `Svg` and `Canvas` layers, and all primitives support pointer and css styling in `Canvas`).

## Components

<div class="grid grid-cols-sm gap-3 mt-8">
{#each primitiveComponents as component}
  <ComponentLink
    component={component.name}
    aspect="screenshot"
    supportedLayers={component.layers}
  />
{/each}
</div>

## Data Mode

Primitive components (`Circle`, `Ellipse`, `Group`, `Image`, `Line`, `Polygon`, `Rect`, `Text`) can operate in two modes:

- **Pixel mode** — pass numbers for direct pixel positioning
- **Data mode** — pass strings or functions to automatically resolve values through chart scales and iterate over data

Without data mode, using primitives in data space requires accessing scales and manually iterating over data:

```svelte
<Chart {data} x="date" y="value">
	{#snippet marks({ context })}
		{#each data as d}
			<Circle cx={context.xScale(d.date)} cy={context.yScale(d.value)} r={5} />
		{/each}
	{/snippet}
</Chart>
```

With data mode, the same result is achieved declaratively:

```svelte
<Chart {data} x="date" y="value">
	{#snippet marks()}
		<Circle cx="date" cy="value" r={5} />
	{/snippet}
</Chart>
```

- **Data-driven** — renders one element per data item without an explicit `{#each}` loop
- **Scale-aware** — string props like `cx="date"` resolve through the chart's scales automatically
- **Composable** — pixel values like `r={5}` continue to work alongside data-driven props

### Prop Resolution Rules

| Prop value    | Mode  | What happens                                            |
| ------------- | ----- | ------------------------------------------------------- |
| `number`      | Pixel | Used directly as pixel value                            |
| `string`      | Data  | Treated as data property name, resolved via chart scale |
| `function(d)` | Data  | Called per data item, result passed through chart scale |

Note that passing a scale result directly (e.g. `cx={xScale(10)}`) produces a number, so it stays in pixel mode. Using a function accessor (e.g. `cx={d => d.value}`) enters data mode — the returned value is passed through the chart scale regardless of whether it's a string or number.

When **any** positional prop is a string or function, the component enters data mode and renders one element per data item.

### Data Source

In data mode, components iterate over data from (in priority order):

::steps

## Explicit `data` prop on the component

```svelte
<Chart {data}>
	{#snippet marks()}
		<Circle data={filteredData} cx="date" cy="value" r={5} />
	{/snippet}
</Chart>
```

## Chart context data (`ctx.data`)

```svelte
<Chart {data}>
	{#snippet marks()}
		<Circle cx="date" cy="value" r={5} />
	{/snippet}
</Chart>
```

::

### Circle

:example{ component="Circle" name="data-mode" showCode }

Each data item's `date` property is passed through `xScale`, and `value` through `yScale`. Since `r={5}` is a number, it stays as a pixel value.

You can also use function accessors (`cx={d => d.date}`) or mix data-driven and pixel values (`cx="date" cy={50}`).

---

### Line

:example{ component="Line" name="data-mode" showCode }

Each line draws from the baseline (`y1={d => 0}` passes `0` through `yScale`) up to the data value (`y2="value"`). The `x1` and `x2` props both use `"date"` so each line is vertical at the data point's x position.

---

### Rect

Rect supports two data modes: **standard** (x/y + pixel width/height) and **edge-based** (x0/x1/y0/y1).

:example{ component="Rect" name="data-mode-edge" showCode }

This histogram uses edge-based mode with `x0`/`x1`/`y0`/`y1` props. Each prop resolves through the chart's scales. `y0={(d) => 0}` passes `0` through `yScale` to anchor bars at the baseline. The `insets={{ x: 1 }}` adds 1px gaps between bars.

Rect also supports a **standard data mode** where `x`/`y` resolve through scales while `width`/`height` remain pixel values:

```svelte
<Rect x="date" y="value" width={20} height={10} />
```

---

### Text

Text has special handling: CSS-like strings (`"50%"`, `"1em"`) remain SVG values, while other strings (`"date"`, `"label"`) are treated as data property accessors.

:example{ component="Text" name="data-mode" showCode }

In data mode, `value` accepts a string property name (`value="label"` resolves to `d.label`) or a function accessor (`value={d => d.label}`) to compute the displayed text per data item. CSS-like strings like `x="50%"` continue to work as SVG positioning values.

---

### Ellipse

Works identically to Circle with separate x/y radii.

:example{ component="Ellipse" name="data-mode" showCode }

---

### Group

Group can also be data-driven, positioning compound elements (e.g. circle + label) at each data point.

:example{ component="Group" name="data-mode" showCode }

Each group is translated to the data point's position. Children like `Circle` and `Text` render relative to the group's origin.

---

### Image

Image renders one image per data item, with positions resolved through chart scales. The `href` prop resolves per item (as a data property name or function accessor). Use `r` for circular clipping.

:example{ component="Image" name="country-flags" showCode }

---

### Polygon

Polygon supports data mode for `cx`, `cy`, and `r`, rendering one polygon per data item.

:example{ component="Polygon" name="data-mode" showCode }

Shape options like `points`, `rotate`, `inset`, `cornerRadius`, `scaleX`/`scaleY`, etc. apply uniformly to each data-driven polygon.

---

### Data-Driven Colors

In data mode, `fill` and `stroke` can also resolve per-item through the chart's color scale (`cScale`).

| Prop value                   | What happens                                           |
| ---------------------------- | ------------------------------------------------------ |
| `"category"` (data property) | `d.category` resolved through `cScale` → color string  |
| `"red"` (CSS color)          | Used as a literal color (not found as a data property) |
| `(d) => d.category`          | Function result passed through `cScale` → color string |

**String disambiguation:** If `d[value]` exists, the string is treated as a data property and resolved through `cScale`. Otherwise, it's used as a literal CSS color.

```svelte
<Chart {data} x="date" y="value" c="category" cRange={['steelblue', 'coral']}>
	{#snippet marks()}
		<Circle cx="date" cy="value" r={5} fill="category" />
	{/snippet}
</Chart>
```

Each circle's fill is determined by its `category` value, resolved through the chart's color scale. Literal colors like `fill="red"` continue to work as expected.

---

### Scale Mapping Reference

| Prop                        | Scale used                         |
| --------------------------- | ---------------------------------- |
| `cx`, `x`, `x0`, `x1`, `x2` | `xScale`                           |
| `cy`, `y`, `y0`, `y1`, `y2` | `yScale`                           |
| `r`, `rx`, `ry`             | `rScale` (falls back to raw value) |
| `fill`, `stroke`            | `cScale` (falls back to raw value) |
| `href` (Image)              | Data property or literal URL       |

### Notes

- **Motion/animation**: Only works in pixel mode. In data mode, motion props are ignored.
- **`ref` binding**: Only available in pixel mode (single element).
- **Events**: In data mode, event handlers (onclick, etc.) are attached to each rendered element.
- **Key function**: Use `key={(d, i) => d.id}` for efficient keyed rendering in data mode.
