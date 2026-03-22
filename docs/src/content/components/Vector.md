---
description: Primitive component which draws directional arrows or spikes at data points to show magnitude and direction.
category: primitives
layers: [svg, canvas]
related: [Line, Circle, GeoPath]
---

## Usage

### Basic

Place vectors at specific pixel positions with configurable rotation and length.

:example{ name="basic" showCode }

### Anchor

Control where the position point sits relative to the vector: `"start"` (base), `"middle"` (center, default for arrow), or `"end"` (tip).

:example{ name="anchor" showCode }

### Shapes

Compare built-in shapes (`arrow`, `spike`) with proportional and fixed sizing, plus custom shapes via the `children` snippet. When `width` is not set, it scales proportionally with length.

:example{ name="shapes" showCode }

### Data mode

Pass string property names to `x`, `y`, `length`, and `rotate` to drive vectors from data. Length is resolved through `rScale`.

:example{ name="data-mode" showCode }

### Flow field

A grid of vectors arranged in a flow pattern, demonstrating data-driven direction and magnitude.

:example{ name="flow-field" showCode }

### Election wind map

A geographic wind map showing 2020 US presidential election results by county. Blue spikes lean left for Democratic wins, red spikes lean right for Republican wins, with length proportional to vote margin.

:example{ name="election-wind-map" showCode }
