---
description: Marking component which positions text labels on pie and arc chart segments, including along the arc path, at the centroid (horizontal, tangent-rotated, or radially-rotated), outside the arc, and with callout leader lines.
category: marks
layers: [svg, canvas]
related: [Arc, Pie, PieChart, ArcChart, Labels]
---

## Usage

`ArcLabel` positions a text label (and optional leader line) relative to an arc. It's used by `PieChart` and `ArcChart` internally when the `labels` prop is set, but can also be used directly inside an `Arc` children snippet for full control.

:example{ component="PieChart" name="labels" showCode }

### Placements

- `centroid` — at the arc centroid (horizontal text, default).
- `centroid-rotated` — at the centroid, rotated to follow the arc tangent. The rotation is flipped where needed so text stays upright.
- `centroid-radial` — at the centroid, rotated to read along the radial direction (center → outer edge). Useful for sunburst-style labels.
- `inner` — along the inner arc path.
- `middle` — along the medial arc path (midway between inner and outer).
- `outer` — along the outer arc path.
- `callout` — outside the arc with a polyline leader line that bends horizontally toward the label.

### Offsets

Depending on the placement, different offset props apply:

- `outerPadding` — adds padding to the outer radius used for `inner` / `middle` / `outer` arc text paths.
- `startOffset` — percentage along the arc path where the text starts. Defaults to `'50%'` (centered).
- `calloutLineLength` — length of the radial portion of the `callout` leader line.
- `calloutLabelOffset` — length of the horizontal portion of the `callout` leader line after the bend.
- `calloutPadding` — gap between the end of the leader line and the label text.

### Callout leader lines

`placement="callout"` draws a line from the outer arc edge to the label with a single bend. The line is rendered via the [`Path`](/docs/components/Path) component so it works in both SVG and Canvas chart layers.

Three props control the geometry:

- `calloutLineLength` — length of the radial (first) segment, from the outer arc edge out to the bend.
- `calloutLabelOffset` — length of the horizontal (second) segment, from the bend to the label.
- `calloutPadding` — gap between the end of the line and the label text.

:example{ component="PieChart" name="labels-callout" }

Customize the line itself via the `line` prop, which forwards props to `<Path>`:

```svelte
<PieChart
	{data}
	labels={{
		placement: 'callout',
		value: 'fruit',
		line: { stroke: 'currentColor', strokeWidth: 1.5, class: 'opacity-50' }
	}}
/>
```

### Using `ArcLabel` directly

When using `Arc` directly (outside of `PieChart`/`ArcChart`), render `ArcLabel` inside the `Arc` children snippet. The snippet exposes `centroid`, `startAngle`, `endAngle`, `innerRadius`, `outerRadius`, and `getArcTextProps` — all of which `ArcLabel` accepts.

```svelte
<Arc {...arcProps}>
	{#snippet children({ centroid, startAngle, endAngle, innerRadius, outerRadius, getArcTextProps })}
		<ArcLabel
			{centroid}
			{startAngle}
			{endAngle}
			{innerRadius}
			{outerRadius}
			{getArcTextProps}
			placement="centroid-radial"
			value="Label text"
		/>
	{/snippet}
</Arc>
```
