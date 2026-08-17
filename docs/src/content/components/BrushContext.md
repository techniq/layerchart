---
description: Interaction component providing an interactive brush context allowing selection, adjustment, and resetting of x/y domains with draggable handles and event callbacks.
category: interactions
layers: [svg, canvas]
related: [Brush]
---

## Usage

One selection, spanning the plot area, wired into the chart — `transform` zooming, tooltip interop, and a selection drawn in every facet panel. Set it up with the chart's `brush` prop, or this component directly.

::tip
For several selections in one chart, or a brushable region smaller than the plot, see [Brush](/docs/components/Brush) — a mark you place yourself. Both drag through the same gesture; [Brush vs. BrushContext](/docs/components/Brush#brush-vs-brushcontext) compares them.
::

### Basic

:example{name="basic"}

### Simple styling

:example{name="simple-styling"}

### Striped background

:example{name="striped-background"}

### Handle arrows

:example{name="handle-arrows"}

### Handle labels

:example{name="handle-labels"}

### Constant labels

:example{name="constant-labels"}

### Integrated brush (x-axis)

:example{name="integrated-brush-(x-axis)"}

### Integrated brush (y-axis)

:example{name="integrated-brush-(y-axis)"}

### Integrated brush (both axis / area)

:example{name="integrated-brush-(both-axis-area)"}

### Separate chart (clip data)

:example{name="separate-chart-(clip-data)"}

### Separate chart (clip data: y-axis)

:example{name="separate-chart-(clip-data-y-axis)"}

### Separate chart (filter data)

:example{name="separate-chart-(filter-data)"}

### Synced brushes

:example{name="synced-brushes"}

### Tooltip interop

:example{name="tooltip-interop"}

### Selection

:example{name="selection"}

### Programmatic control

:example{name="programmatic-control"}

### Minimap

:example{name="minimap"}

### Flame chart (pan / zoom + overview brush)

A time-based [flame chart](https://pyatyispyatil.github.io/flame-chart-js/) (like Chrome DevTools' Network/Performance panels) — the [time-aware sibling](https://www.polarsignals.com/blog/posts/2025/05/28/flamecharts-the-time-aware-sibling-of-flame-graphs) of the [flame graph](/docs/components/Partition). Brushing the overview `Area` chart selects a time window that zooms the main chart (which also supports **drag** to pan and **scroll** to zoom via `transform`). Frames keep their real `start`/`end` times (the `x={['start', 'end']}` duration model), so **empty gaps reveal idle / I/O wait**.

:example{name="flame-chart"}
