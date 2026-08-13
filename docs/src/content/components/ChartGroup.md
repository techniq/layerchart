---
description: Synchronize state between multiple charts, such as showing the tooltip and highlight on every chart when hovering any one of them.
category: interactions
related: [Chart, Tooltip, Highlight]
---

## Usage

### Basic

:example{name="basic"}

### Highlight without tooltips

Set `pointer={{ tooltip: false }}` so the other charts show the highlight without their own tooltip.

:example{name="highlight-only"}

### Programmatic control

`ChartGroupState` is plain reactive state, so buttons and keyboard handlers can drive every chart in the group without touching a chart.

:example{name="programmatic-control"}
