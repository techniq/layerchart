---
description: Geographic component which provides geographic projection and scaling context to children for accurate rendering of geographic data.
category: geo
layers: [svg, canvas]
related: [Chart]
order: 1
---

::tip
Geographic projections / state are integrated into `<Chart geo={...}>` but `GeoProjection` can be used to provide a secondary projection / context, such as for a translucent globe effect
::

## Satellite

The satellite projection from `d3-geo-projection` simulates viewing Earth from orbit. Configure `distance` (altitude) and `tilt` (perspective angle) via the projection factory, with `clipAngle` derived from distance to clip the visible horizon.

:example{ name="satellite" showCode }

## Playground

:example{ name="projection-playground" }
