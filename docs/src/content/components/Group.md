---
description: Primitive component which clusters multiple chart elements together, allowing them to be managed, styled, or transformed as a single unit.
category: primitives
layers: [svg, canvas, html]
related: []
---

## Usage

### Pixel mode

Pass numeric pixel values for `x` and `y` to translate the group to an exact position, or `center` to center within the chart.

:example{ name="basic" showCode }

### Data mode

Pass string property names or accessor functions to `x` and `y` to position groups from data. The component renders one group per data item, useful for placing compound elements (e.g. circle + label) at each data point.

:example{ name="data-mode" showCode }

### Series state

Pass `seriesKey` to follow a [series](/docs/guides/series). The group fades while another series is highlighted, and is removed while the legend has that series hidden — so hand-composed content stays in step with the marks it belongs to.

:example{ name="series-state" }
