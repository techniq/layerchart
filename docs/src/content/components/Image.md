---
description: Primitive component which renders an image within a chart, supporting data-driven positioning, circular clipping, and rotation.
category: primitives
layers: [svg, canvas, html]
related: [Circle, Rect]
---

## Usage

### Country flags

Scatter plot of countries using flag images, with circular clipping via the `r` prop and a function accessor for `href`.

:example{ name="country-flags" showCode }

### US Presidents

President portraits plotted by inauguration date and historical rating, clipped to circles using the `r` prop with `preserveAspectRatio="xMidYMid slice"` for crop-fill.

:example{ name="us-presidents" showCode }

### Planets

Solar system planets on a log scale, with image size driven by planet diameter using function accessors for `width`, `height`, and `r`.

:example{ name="planets" showCode }

### Sports logos

NFL team logos plotted by wins vs points scored, using rectangular images with fixed pixel dimensions.

:example{ name="sports-logos" showCode }

### Pixel mode

Pass numeric pixel values for `x`, `y`, `width`, and `height` to position and size a single image directly. Images are centered on `(x, y)`.

:example{ name="pixel-mode" showCode }
