---
section: common
layers: [svg, canvas, html]
related: [components/Grid, components/Rule]
---

<script lang="ts">
	import Example from '$lib/components/Example.svelte';
</script>

## Examples

### Placement (bottom / left)

<Example name="placement-bottom-left" />

### Placement (top / right)

<Example name="placement-top-right" />

### Placement (bottom / left with rule)

<Example name="placement-bottom-left-rule" />

### Placement (top / right with rule)

<Example name="placement-top-right-rule" />

### Grid

<Example name="grid" />

### Grid (dashed)

<Example name="grid-dashed" />

### Multiple axis grids with single rule

<Example name="multiple-axis-grid-with-single-rule" />

> Axis with rule should be rendered last

### Multiple axis grids and rules

<Example name="multiple-axis-grid-and-rules" />

> Top-most axis must have separate rule due to SVG rendering order

### Multiple axis grids and rules (separate grid)

<Example name="multiple-axis-grid-and-rules" />

### Arrow markers

<Example name="arrow-markers" />

### Tick label styling

<Example name="tick-label-styling" />

### Rotate labels

<Example name="rotate-labels" />

### Remove tick marks

<Example name="remove-tick-marks" />

### Show first/last ticks only with alignment

<Example name="extent-ticks-only" />

### Integer-only ticks (via filter)

<Example name="integer-only-filter" />

### Integer-only ticks (via format)

<Example name="integer-only-format" />

### Hide `0` (via filter)

<Example name="hide-zero-filter" />

### Hide `0` (via format)

<Example name="hide-zero-format" />

### Explicit ticks

<Example name="explicit-ticks" />

### Inject tick value

<Example name="inject-ticks" />

### Tick count

<Example name="tick-count" />

### Tick spacing

<Example name="tick-spacing" />

### Label next to hash

<Example name="labels-next-hash" />

### Override axis ticks with custom scale

<Example name="override-axis-ticks-scale" />

### Axis label placements (top / bottom)

<Example name="axis-label-placement-top-bottom" />

### Axis label placements (left / right)

<Example name="axis-label-placement-left-right" />

### Multiline tick labels with format (`\n`)

<Example name="multiline-tick-labels" />

### Multiple time axis with same placement (bottom)

<Example name="multiple-axis-same-placement-bottom" />

### Multiple time axis with same placement (right)

<Example name="multiple-axis-same-placement-right" />
