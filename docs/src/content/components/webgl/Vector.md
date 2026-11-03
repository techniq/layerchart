---
description: 'Primitive component which draws directional arrows or spikes at data points to show magnitude and direction. In a WebGL layer, they lie on the floor.'
category: WebGL marks
related: [Vector, guides/webgl]
components:
  - { name: webgl/Vector, label: Vector }
---

::tip
Part of [`@layerchart/webgl`](/docs/guides/webgl), drawn in a `WebGL` layer. See the [WebGL guide](/docs/guides/webgl) to get started.
::

## Usage

Arrows (`shape="arrow"`), filled arrows (`'arrow-filled'`), or spikes (`'spike'`) with LayerChart's [Vector](/docs/components/Vector) props: placed at `x` / `y`, `length` long (through the chart's `r` scale), and turned `rotate` degrees, lying on the floor (or `z` pixels above it).

:example{ name="vortex" }
