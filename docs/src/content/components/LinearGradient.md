---
description: Fill component providing a linear gradient fill pattern for chart elements.
category: fill
layers: [svg, canvas, html]
related: [RadialGradient, Pattern]
---

## Usage

### Direction with custom colors

:example{ name="direction-with-custom-colors" noResize}

### Explicit offsets

:example{ name="explicit-offsets" noResize}

### Tailwind colors

:example{ name="tailwind-colors" noResize clip}

::note
Tailwind 4 now uses `color-mix()` for opacity, which causes an issue with `0%` rendering gray (similar to `transparent`). Recommend using `1%` gradients (ex. `from-primary/50 to-primary/1`) to workaround the issue. See [post](https://bsky.app/profile/techniq.dev/post/3lk6qr6e5b22t) for more details.
::

### Units

:example{ name="units" noResize clip}
