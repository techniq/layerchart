import type { GeoProjection } from 'd3-geo';
import type { ImageSource } from '../../utils/texture.js';

/**
 * The core `GeoRaster`'s props (in its order, as it describes them), then those of a `WebGL`
 * layer's own (`elevation`, `pixelSize`, `opacity`, `tooltip`)
 */
export type GeoRasterProps = {
  /**
   * The image to lay over the map through the chart's projection (ex. NASA's Blue Marble), or
   * wrap around its `globe`, as the core `GeoRaster` reprojects it: a URL, or an image,
   * canvas, or bitmap already drawn.  Equirectangular unless `sourceProjection` says otherwise:
   * longitude across it from -180° to 180°, latitude down it from 90° to -90°.
   */
  image: ImageSource;
  /**
   * Projection used by the source image. Pass as an uncalled function, e.g.
   * `sourceProjection={geoEquirectangular}`.
   *
   * When omitted, the source is assumed to be an equirectangular (plate carrée) image covering
   * the full globe.  Not on a `globe`, which wraps an equirectangular image.
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
  /**
   * `crossOrigin` attribute applied to the underlying `Image` element when loading from a URL.
   * Set to `null` to disable.
   *
   * @default 'anonymous'
   */
  crossOrigin?: string | null;
  /**
   * Resolution multiplier for the reprojected output, relative to chart CSS pixels: the image is
   * laid over points `pixelSize / resolution` pixels apart, so a value greater than 1 follows the
   * projection's curves (and terrain) more closely, at the cost of more of them.
   *
   * @default 1
   */
  resolution?: number;
  /**
   * Draw the image's pixels as crisp blocks (as `interpolate: 'nearest'`), for a pixel-art look.
   *
   * @default false
   */
  pixelated?: boolean;

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
  /** The opacity of the element. (0 to 1) @default 1 */
  opacity?: number;
  /**
   * Show the tooltip for the longitude / latitude the pointer is over (with the chart's
   * `tooltipContext`), and its `elevation`.
   *
   * @default false
   */
  tooltip?: boolean;
};
