---
description: 'Light for a WebGL layer: directional (like the sun), a point (like a star), or ambient, with optional shadows.'
category: other
related: [guides/webgl]
layers: [webgl]
components:
  - { name: webgl/Light, label: Light }
---

::tip
Part of [`@layerchart/webgl`](/docs/guides/webgl), drawn in a `WebGL` layer. See the [WebGL guide](/docs/guides/webgl) to get started.
::

## Usage

A `WebGL` layer lights itself until it has a `Light` of its own. A `directional` light shines from an `azimuth` (degrees clockwise from the plot's top edge) and an `altitude` (degrees above the floor), and `shadow` casts shadows onto the marks and the floor. An `ambient` light fills in evenly.

```svelte
<WebGL>
	<Light azimuth={315} altitude={35} shadow />
	<Light type="ambient" intensity={0.4} />
	...
</WebGL>
```

:example{ name="buildings" }

## Point lights

A `point` light shines every way from a place in the plot (`x`, `y`, and `z`, in pixels), without fading with distance, so it can light planets from their star.

```svelte
<Light type="point" x={sun[0]} y={sun[1]} z={0} />
```

:example{ component="Points" name="solar-system" }

## Shadows on a map

:example{ component="Bin" name="state-population" }
