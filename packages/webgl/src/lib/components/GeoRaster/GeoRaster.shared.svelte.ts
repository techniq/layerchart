import type { GeoProjection } from 'd3-geo';
import type { ImageSource } from '../../utils/texture.js';

export type GeoRasterProps = {
  /**
   * The image to lay over the map through the chart's projection (ex. NASA's Blue Marble), or
   * wrap around its `globe`, as the core `GeoRaster` reprojects it: a URL, or an image,
   * canvas, or bitmap already drawn.  Equirectangular unless `sourceProjection` says otherwise:
   * longitude across it from -180° to 180°, latitude down it from 90° to -90°.
   */
  image: ImageSource;
  /**
   * The projection the image was drawn in, mapping longitude / latitude to its own pixels (as
   * the core `GeoRaster`).  Equirectangular without one.  Not on a `globe`, which wraps an
   * equirectangular image.
   */
  sourceProjection?: () => GeoProjection;
  /**
   * How the image is sampled between its pixels: `'nearest'` for crisp, blocky pixels, or
   * `'bilinear'` to blend them.  The core `GeoRaster` defaults to `'nearest'`, as blending
   * costs it ~4x the work; here the GPU blends for free.
   *
   * @default 'bilinear'
   */
  interpolate?: 'nearest' | 'bilinear';
  /** Draw the image's pixels as crisp blocks (as `interpolate: 'nearest'`) */
  pixelated?: boolean;
  /**
   * `crossOrigin` for an image loaded from a URL.  `null` for none.
   *
   * @default 'anonymous'
   */
  crossOrigin?: string | null;
  /**
   * Raise the image into terrain: a function of longitude and latitude returning a value for
   * the chart's `z` scale (ex. elevation in meters).  `NaN` leaves a place out (ex. beyond the
   * elevation loaded), as `Surface` does.
   */
  elevation?: (longitude: number, latitude: number) => number;
  /**
   * Pixels between the points the image is laid over.
   *
   * @default 4
   */
  pixelSize?: number;
  /** @default 1 */
  opacity?: number;
  /**
   * Show the tooltip for the longitude / latitude the pointer is over (with the chart's
   * `tooltipContext`), and its `elevation`.
   *
   * @default false
   */
  tooltip?: boolean;
};
