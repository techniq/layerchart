---
title: Animation
order: 8
---

LayerChart has a unified `motion` prop that animates values across primitives, scales, and transforms. It supports spring (physics-based), tween (time-based), or no animation — configured with a simple string or detailed options object.

## Motion types

| Type     | Description                               | Best for                             |
| -------- | ----------------------------------------- | ------------------------------------ |
| `spring` | Physics-based animation (Svelte `Spring`) | Interactive updates, responsive feel |
| `tween`  | Time-based with easing (Svelte `Tween`)   | Predictable, controlled transitions  |
| `none`   | Instant updates, no animation             | Disabling motion when not needed     |

## Configuration

The `motion` prop accepts several forms, from simple strings to detailed per-property configs.

### String shorthand

```svelte
<Bars motion="spring" />
<Spline motion="tween" />
<Bars motion="none" />
```

### Object with options

```svelte
<Bars motion={{ type: 'spring', stiffness: 0.5, damping: 0.8 }} />
<Bars motion={{ type: 'tween', duration: 300, easing: cubicInOut }} />
```

**Spring options:** `stiffness`, `damping`

**Tween options:** `duration`, `easing`, `delay`

### Per-property config

Some components animate multiple properties. Use a property map to configure each independently:

```svelte
<Bars
	motion={{
		y: { type: 'tween', duration: 500, easing: cubicInOut },
		height: { type: 'tween', duration: 500, easing: cubicInOut }
	}}
/>
```

### Disabling motion

```svelte
<Bars motion="none" />
<Bars motion={false} />
```

## Primitive animation

Individual shape primitives support the `motion` prop for animating their visual properties. This is commonly used for mount/enter animations and data-driven transitions.

### Bars — tween on mount

Use `initialY` and `initialHeight` to set starting values, then `motion` animates to the final position:

:example{ component="Bars" name="vertical-tween-on-mount" }

### Staggered bar animation

Animate individual `Bar` components with `delay` for a stagger effect:

:example{ component="Bars" name="vertical-stagger-tween-on-mount" }

### Area — clip reveal

Animate an area chart into view by tweening a `ChartClipPath` width from 0:

:example{ component="Area" name="clip-tween-on-mount" }

### Arc — tween value

Animate arc values from an initial value to their target:

:example{ component="Arc" name="tween-value-on-mount" }

### Spline — path interpolation

Path-based components like `Spline` and `Area` smoothly interpolate between path shapes using `d3-interpolate-path`:

:example{ component="Spline" name="tweened" }

:::tip
Path interpolation works best with `tween` motion. Spring motion is not supported for path `d` attribute interpolation.
:::

### Pie / Arc charts

Pie and arc chart components animate slice angles and radii:

:example{ component="PieChart" name="motion-spring" }

:example{ component="PieChart" name="motion-tween" }

## Scale animation

Pass `motion` to `<Chart>` to animate scale domain transitions globally. When data changes, all scales (and everything downstream — axes, grid lines, marks) animate smoothly to the new domain.

```svelte
<Chart {data} x="date" y="value" motion="spring">
	<!-- All scale-dependent components animate when data changes -->
</Chart>
```

```svelte
<Chart {data} x="date" y="value" motion={{ type: 'tween', duration: 500 }}>
```

This is visible when data updates, brush zoom occurs, or domains change for any reason.

:example{ component="LineChart" name="dynamic-data" }

### Per-component scale motion

Axes and grids also accept their own `motion` prop to animate tick/label transitions independently:

```svelte
<Axis placement="left" motion={{ type: 'tween', duration: 200 }} />
<Grid motion="spring" />
```

:example{ component="ScatterChart" name="series-tween" }

## Transform

The [Transform](/docs/guides/transform#motion--animation) system has its own `motion` prop for animating pan and zoom. During drag/wheel interactions, motion is automatically instant for responsiveness; animation kicks in after release.

```svelte
<!-- Spring animation for pan/zoom -->
<Chart transform={{ mode: 'domain', motion: 'spring' }} />

<!-- Tween with easing -->
<Chart transform={{ mode: 'canvas', motion: { type: 'tween', duration: 800, easing: cubicOut } }} />
```

Click a circle to zoom into it with animated motion:

:example{ component="Pack" name="basic" }

Click a country to zoom with spring animation on the projection:

:example{ component="GeoPath" name="animated-globe" }

### Inertia

Enable `inertia` to let the view coast after a drag release:

```svelte
<Chart
	transform={{
		mode: 'projection',
		motion: 'spring',
		inertia: true
	}}
/>
```

:example{ component="GeoPath" name="transform-globe-inertia" }

See the [Transform guide](/docs/guides/transform#motion--animation) for full details on transform animation, inertia options, and programmatic zoom.

## Tooltip animation

Tooltip position tracking is animated by default with `motion="spring"`. Disable or customize it:

```svelte
<!-- Default: spring (smooth tracking) -->
<Tooltip.Root />

<!-- Custom tween -->
<Tooltip.Root motion={{ type: 'tween', duration: 200 }} />

<!-- No animation (instant snap) -->
<Tooltip.Root motion="none" />
```

:example{ component="Tooltip" name="basic" }

## Draw animation

The `draw` prop on path-based components uses Svelte's built-in `draw` transition to animate the stroke of a path over time, creating a visual effect where the line appears to be drawn on screen.

Pass `true` for defaults, or an object with `duration`, `easing`, and `delay`:

```svelte
<!-- Default draw animation -->
<Spline draw class="stroke-primary stroke-2" />

<!-- Custom duration and easing -->
<Spline draw={{ duration: 3000, easing: linear }} />
```

:example{ component="Spline" name="draw" }

### End content

`Path` and `Spline` support `endContent` and `startContent` snippets that track the endpoint of the path as it's being drawn — useful for showing a circle or value label that follows the animation:

:example{ component="Spline" name="end-snippet-with-draw" }

### Syncing with MotionPath

Combine `draw` with `MotionPath` to synchronize path drawing with an object moving along the path:

:example{ component="MotionPath" name="sync-with-draw" }

**Supported components:** `Path`, `Spline`, `GeoPath`, `GeoSpline`

## MotionPath

The `MotionPath` component uses SVG's native `<animateMotion>` element to move objects along a path. This is a different system from the `motion` prop — it's declarative SVG animation, not value interpolation.

```svelte
<MotionPath duration="5s" repeatCount="indefinite" rotate="auto">
	{#snippet children({ pathId, objectId })}
		<!-- Define path and animated object -->
	{/snippet}
</MotionPath>
```

:example{ component="MotionPath" name="rotate-object-with-path" }

## Components with motion support

The `motion` prop is supported across many components:

| Component          | Animated properties      |
| ------------------ | ------------------------ |
| `Chart`            | Scale domains (global)   |
| `Arc`              | Angle, radius values     |
| `Area`             | Path shape (d attribute) |
| `Bar` / `Bars`     | x, y, width, height      |
| `Circle`           | Position, radius         |
| `Spline`           | Path shape (d attribute) |
| `Axis`             | Tick/label positions     |
| `Grid`             | Grid line positions      |
| `Highlight`        | Overlay position         |
| `Tooltip.Root`     | Tooltip position         |
| `ChartClipPath`    | Clip dimensions          |
| `TransformContext` | Scale and translate      |

## Quick reference

| Use case                | Configuration                                                   |
| ----------------------- | --------------------------------------------------------------- |
| Spring animation        | `motion="spring"`                                               |
| Tween with easing       | `motion={{ type: 'tween', duration: 500, easing: cubicInOut }}` |
| Per-property control    | `motion={{ y: 'spring', width: 'tween' }}`                      |
| Staggered animation     | `motion={{ y: { type: 'tween', delay: i * 30 } }}`              |
| Animate scales globally | `<Chart motion="spring">`                                       |
| Animate pan/zoom        | `transform={{ motion: 'spring' }}`                              |
| Disable tooltip motion  | `<Tooltip.Root motion="none" />`                                |
| Draw path on mount      | `draw` or `draw={{ duration: 3000 }}`                           |
| Disable all motion      | `motion={false}` or `motion="none"`                             |
