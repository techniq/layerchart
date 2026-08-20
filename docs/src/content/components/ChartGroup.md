---
description: Synchronize state between multiple charts, such as showing the tooltip and highlight on every chart when hovering any one of them.
category: interactions
related: [Chart, Tooltip, Highlight]
---

## Usage

### Basic

:example{name="basic"}

### Faceted member

:example{name="faceted-group"}

### Highlight without tooltips

Set `pointer={{ tooltip: false }}` so the other charts show the highlight without their own tooltip.

:example{name="highlight-only"}

### Synced legend

Series highlight and visibility are shared — hovering a legend item fades that series on every chart, and clicking one hides it everywhere. Series are matched by key, so a chart is only affected by keys it has.

:example{name="synced-legend"}

### Programmatic control

`ChartGroupState` is plain reactive state, so buttons and keyboard handlers can drive every chart in the group without touching a chart.

:example{name="programmatic-control"}

### Synced brushes

Brush selections are shared — dragging on one chart selects the same domain range on the others. Here each detail chart also takes its domain from the shared selection.

:example{name="synced-brushes"}

### Synced zoom

Brush-to-zoom on one chart zooms every chart in the group.

:example{name="synced-zoom"}

### Minimap

An overview whose brush zooms the _other_ charts without zooming itself, via `publish: ['domain']`. Both charts are brushable and the most recent one wins.

:example{name="minimap"}
