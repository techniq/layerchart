---
description: Layout component which computes a chord diagram from an adjacency matrix, rendering group arcs and ribbon paths to visualize relationships and flow between categories.
category: layout
layers: [svg, canvas]
related: [Arc, Ribbon]
---

## Usage

:example{ name="basic" showCode }

## Directed

Use `variant="directed"` with directed `Ribbon` to show flow direction with arrowheads.

:example{ name="directed" showCode }

## Gradient

Ribbons with per-chord gradients blending source to target colors, with hover interaction.

:example{ name="gradient" showCode }

## Radial ticks

Chord diagram with radial tick marks and labels around the outer ring, based on the [Observable D3 chord diagram](https://observablehq.com/@d3/chord-diagram).

:example{ name="ticks" showCode }

## Hover interaction

Hover over groups or ribbons to highlight connections.

:example{ name="hover" showCode }
