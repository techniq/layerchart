---
description: Primitive component creating individual rectangular bars to represent and compare discrete data values.
category: primitives
layers: [svg, canvas]
related: [Bars]
---

## Usage

:example{ component="Bars" name="vertical-customize-individual-styles" showCode }

Typically the component is rendered within the `Bars` mark but can be rendered explicitly when you need more control on a per-mark basis.

## Fixed width

Use `width` or `height` to override the scale-derived size with a fixed pixel value. The bar is centered within its band.

:example{ component="Bars" name="vertical-fixed-width" showCode }
