---
description: Marking component which plots individual data points on a graph to show distribution, relationships, or clusters without connecting lines.
category: marks
layers: [svg, canvas]
related: [ScatterChart]
---

::tip
See also: [ScatterChart](/docs/components/ScatterChart) for simplified examples
::

## Usage

:example{ name="basic" showCode }

### Color

To change the color you can use two main approaches: discrete color settings (`fill`, `class`) or value-based color scales.

#### Discrete

Color can be set for all points using the `fill` and `stroke` props...

:example{ name="color-via-fill" showCode }

...or using `class` to set fill and stroke via CSS.

:example{ name="color-via-class" showCode }

#### Value

To color points based on each point's value, you can use the color scale.

For example, to color based on thresholds (e.g. red: <50, yellow: 50-90, green: >90)

:example{ name="color-via-threshold-scale" showCode }

You can also color points based the comparison of two values in your data.

:example{ name="color-via-ordinal-scale" showCode }
