---
description: 'Marking component drawing arrows or spikes in a WebGL chart, pointing each row a direction, a length long.'
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
