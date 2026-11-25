import type { ColorProp, DataProp } from 'layerchart';
import type { Feature, FeatureCollection, Geometry, GeometryCollection } from 'geojson';
import type { GeoSphere } from 'd3-geo';
import type { MotionOptions } from 'layerchart/utils/motion.svelte';

export type GeoPathProps = {
  /**
   * A feature, a collection of them (drawn as one mark), or a geometry.  On a `globe`, their
   * lines and outlines draw over it (filled shapes on a globe aren't drawn yet), and
   * `{ type: 'Sphere' }` fills the globe itself (ex. the ocean beneath an image still loading).
   */
  geojson:
    | Feature
    | FeatureCollection
    | Geometry
    | GeometryCollection
    | GeoSphere
    | null
    | undefined;
  /**
   * How tall each feature stands: a property key or function of the feature (through the chart's
   * `z` scale), or a number of pixels.  Flat on the floor without one.
   */
  z?: DataProp<Feature>;
  /**
   * A CSS color, or a function of the feature returning one (or a value for the chart's color
   * scale).  Lines have no fill.
   *
   * @default 'color-mix(in oklab, var(--color-surface-content) 15%, var(--color-surface-100))'
   */
  fill?: ColorProp<Feature> | null;
  /**
   * The outlines' color: a CSS color, or a data key / function of the feature run through the
   * chart's color scale.  No outlines without one.
   */
  stroke?: ColorProp<Feature> | null;
  /**
   * Outline width in pixels, the same at any depth.
   *
   * @default 1
   */
  strokeWidth?: number;
  /**
   * CSS classes to style it by, as the core marks take them (ex. `fill-red-500 opacity-50`):
   * the fill, stroke, stroke width, and opacity they set, where its props don't say
   */
  class?: string;
  /** @default 1 */
  opacity?: number;
  /**
   * Show the tooltip for the row the pointer is over (with the chart's `tooltipContext`).
   *
   * @default false
   */
  tooltip?: boolean;
  /**
   * Ease each feature's height and fill to new values rather than jumping, ex. `'tween'` or
   * `{ type: 'tween', duration: 800 }`.
   */
  motion?: MotionOptions;
};
