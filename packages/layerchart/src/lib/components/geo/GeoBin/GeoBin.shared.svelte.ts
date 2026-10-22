import type { SVGAttributes } from 'svelte/elements';
import type { Without } from '$lib/utils/types.js';
import type { Accessor } from '$lib/utils/common.js';
import type { BinPropsWithoutHTML, BinShape } from '../../Bin/Bin.shared.svelte.js';

export type GeoBinPropsWithoutHTML<T = any> = Omit<
  BinPropsWithoutHTML<T>,
  'x' | 'y' | 'shape' | 'size'
> & {
  /** Longitude accessor.  Defaults to the chart's `x`. */
  x?: Accessor<T>;
  /** Latitude accessor.  Defaults to the chart's `y`. */
  y?: Accessor<T>;
  /**
   * Shape of the cells tiling the sphere: hexagons (and 12 pentagons) from a subdivided icosahedron,
   * or triangles joining the hexagons' centers — both near-equal in area — or squares between the
   * meridians and parallels of a graticule, which narrow toward the poles.
   * @default 'hexagon'
   */
  shape?: BinShape;
  /**
   * Width of a cell in pixels at the projection's center.  Kept to a few resolutions as the map
   * zooms, and to at most about 100,000 cells over the sphere.  Squares take the nearest graticule
   * step that divides 180° (1°, 2°, 3°, 5°, 10°…), so they line up with a `Graticule` drawn at it.
   * @default 20
   */
  size?: number;
  /**
   * Cell spacing in degrees, rather than `size` in pixels — a square's side, or the distance between
   * hexagon centers or along a triangle's side.  The grid then stays the same however the map is
   * sized or zoomed, ex. `step={0.25}` to draw 15′ gridded data cell for cell.
   */
  step?: number;
};

export type GeoBinProps<T = any> = GeoBinPropsWithoutHTML<T> &
  Without<SVGAttributes<SVGGElement>, BinPropsWithoutHTML<T>>;
