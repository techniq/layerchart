---
description: Primitive component which clusters multiple chart elements together, allowing them to be managed, styled, or transformed as a single unit.
category: primitives
layers: [svg, html]
related: []
---

## Usage

### Pixel mode

Pass numeric pixel values for `x` and `y` to translate the group to an exact position. Use `center` to center within the chart.

:example{ name="basic" showCode }

### Data mode

Pass string property names or accessor functions to `x` and `y` to position groups from data. The component renders one group per data item, useful for placing compound elements (e.g. circle + label) at each data point.

:example{ name="data-mode" showCode }
