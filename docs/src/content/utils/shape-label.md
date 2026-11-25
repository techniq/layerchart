---
description: Find where a shape has the most room for a label, image or anything else placed inside it.
category: tools
layers: []
related: [components/Labels, components/Voronoi, /docs/components/Image/sports-territories]
---

## Usage

`shapeLabel()` finds a shape's pole of inaccessibility: the point inside it farthest from its edges, where it has the most room. Unlike the centroid, it's always inside the shape, even a concave one (Florida) or one with holes.

```ts
import { shapeLabel } from 'layerchart';

// A polygon: an outer ring followed by any holes, in pixels
const { x, y, width, height } = shapeLabel([
	[
		[0, 0],
		[100, 0],
		[100, 50],
		[0, 50]
	]
]);
```

Pass an array of polygons (ex. a state and its islands) to find the best spot across all of them.

It returns the point (`x`, `y`) and the room there: `width` and `height`, the size of the largest circle (or ellipse, or rect) that fits, and `distance`, from the point to the nearest edge (the circle's radius, or with an `aspect` or `fit: 'rect'`, half the width). Ex. to place an image without crossing the edges:

```ts
const { x, y, width, height } = shapeLabel(polygons, { fit: 'rect' });
// <Image {x} {y} {width} {height} href={...} />
```

## Options

| Option           | Default    | Description                                                                                                                                                                                |
| ---------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `aspect`         | `1`        | Width / height of what's being placed (ex. a label's text), to find the most room for that shape rather than a circle. `distance` is then the half width (half height `distance / aspect`) |
| `fit`            | `'circle'` | `'rect'` for the largest square or rectangle (of `aspect`) rather than circle or ellipse, ex. to place an image without its corners crossing the edges                                     |
| `centroidWeight` | `0`        | How much to prefer points near the centroid over slightly roomier ones farther away, settling ties (ex. a rectangle's center line) and pulling labels off long thin arms                   |
| `minDistance`    | —          | Room that's enough: the point nearest the shape's visual center with at least this much, rather than the most                                                                              |
| `prefer`         | —          | A point to keep (ex. a label's last position) while it's about as good, so labels don't jump between equally good spots as the shape changes                                               |
| `precision`      | `1`        | How close to the best point to search, in the polygon's units                                                                                                                              |

## Playground

Each state's name is placed where `shapeLabel()` finds the most room, with that room drawn beneath it. A wider `aspect` favors the wide parts of a shape (ex. Florida's panhandle over its peninsula), `fit: 'rect'` measures a box rather than an ellipse, and `centroidWeight` pulls each label towards its state's centroid (the dots).

:example{name="playground"}

:::note
[`Labels`](/docs/components/Labels) with `layout="shape"` uses `shapeLabel()` to label map regions and stacked areas, and a [`Voronoi`](/docs/components/Voronoi) cell's `polygons` can be passed to it directly.
:::
