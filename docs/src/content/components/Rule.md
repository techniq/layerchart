---
description: Commonly used component acting as a visual guideline on a chart that helps align and measure data values along an axis.
category: common
layers: [svg, canvas, html]
related: [Axis, Line, AnnotationLine]
---

## Usage

:example{ name="baseline-x-y" showCode }

## Use cases

A `Rule` component can be used for various use cases include:

### Axis baseline

with `x={true}` / `y={true}`

:example{ name="baseline-x-y" showCode }

### Annotation

with `x={Number}` / `y={Number}`

:example{ name="annotation-y" showCode }

### Data mark

using `<Chart data>` and either:

- implicit `x` / `y` (using `<Chart x={..} y={...}>`)

:example{ name="data-x-range" showCode }

- explicit `x="property"` / `y="property"`

:example{ name="candlestick" showCode }

<!-- ## Examples

### Baseline (x / y)

:example{ name="baseline-x-y" }

### Baseline (top / right)

:example{ name="baseline-top-right" }

### Baseline (x with negative values)

:example{ name="baseline-x-negative" }

### Baseline (y with negative values)

:example{ name="baseline-y-negative" }

### Annotation (x)

:example{ name="annotation-x" }

### Annotation (y)

:example{ name="annotation-y" }

### Data driven (x date)

:example{ name="data-x-date" }

### Data driven (x band)

:example{ name="data-x-band" }

### Data driven (x range)

:example{ name="data-x-range" }

### Data driven (y range)

:example{ name="data-y-range" } -->
