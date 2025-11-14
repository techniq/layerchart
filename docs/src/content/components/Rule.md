---
description: Commonly used component acting as a visual guideline on a chart that helps align and measure data values along an axis.
section: common
layers: [svg, canvas, html]
related: [Axis, Line, AnnotationLine]
---

<script lang="ts">
	import Example from '$lib/components/Example.svelte';
</script>

## Usage

<Example name="baseline-x-y" showCode />

## Use cases

A `Rule` component can be used for various use cases include:

### Axis baseline

with `x={true}` / `y={true}`

<Example name="baseline-x-y" showCode />

### Annotation

with `x={Number}` / `y={Number}`

<Example name="annotation-y" showCode />

### Data mark

using `<Chart data>` and either:

- implicit `x` / `y` (using `<Chart x={..} y={...}>`)

<Example name="data-x-range" showCode />

- explicit `x="property"` / `y="property"`

<Example name="candlestick" showCode />

<!-- ## Examples

### Baseline (x / y)

<Example name="baseline-x-y" />

### Baseline (top / right)

<Example name="baseline-top-right" />

### Baseline (x with negative values)

<Example name="baseline-x-negative" />

### Baseline (y with negative values)

<Example name="baseline-y-negative" />

### Annotation (x)

<Example name="annotation-x" />

### Annotation (y)

<Example name="annotation-y" />

### Data driven (x date)

<Example name="data-x-date" />

### Data driven (x band)

<Example name="data-x-band" />

### Data driven (x range)

<Example name="data-x-range" />

### Data driven (y range)

<Example name="data-y-range" /> -->
