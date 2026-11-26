import type { Snippet } from 'svelte';
import type { draw as drawTransition } from 'svelte/transition';
import type { ColorProp, DataProp } from 'layerchart';
import type { Feature, FeatureCollection, Geometry, GeometryCollection } from 'geojson';
import type {
  GeoIdentityTransform,
  GeoPath,
  GeoProjection,
  GeoSphere,
  GeoTransformPrototype,
} from 'd3-geo';
import type { CurveFactory, CurveFactoryLineOnly } from 'd3-shape';
import type { MotionOptions } from 'layerchart/utils/motion.svelte';
import type { MarkerOptions } from '../Line/markers.js';

/**
 * The core `GeoPath`'s props (in its order, as it describes them), then those of a `WebGL`
 * layer's own (`class`)
 */
export type GeoPathProps = {
  /**
   * How tall each feature stands: a property key or function of the feature (through the chart's
   * `z` scale), or a number of pixels.  Flat on the floor without one.
   */
  z?: DataProp<Feature>;
  /**
   * A feature, a collection of them (drawn as one mark), or a geometry.  On a `globe`, their
   * lines and outlines draw over it (filled shapes on a globe aren't drawn yet), and
   * `{ type: 'Sphere' }` fills the globe itself (ex. the ocean beneath an image still loading).
   */
  geojson?:
    | Feature
    | FeatureCollection
    | Geometry
    | GeometryCollection
    | GeoSphere
    | null
    | undefined;
  /**
   * Show the tooltip for the feature the pointer is over (with the chart's `tooltipContext`).
   *
   * @default false
   */
  tooltip?: boolean;
  /**
   * Click event handler, called with the path generator (as the core `GeoPath`'s), and the
   * feature clicked
   */
  onclick?: ((e: MouseEvent, geoPath: GeoPath | undefined, feature: Feature) => void) | undefined;
  /**
   * The curve the projected outlines are drawn through, as the core `GeoPath`'s.
   *
   * @default curveLinearClosed
   */
  curve?: CurveFactory | CurveFactoryLineOnly;
  /** Transform the projection's output, ex. to offset or scale every point (a `geoTransform`) */
  geoTransform?: (projection: GeoProjection | GeoIdentityTransform) => GeoTransformPrototype;
  /** Draw in place of the path, given the path generator (as the core `GeoPath`) */
  children?: Snippet<[{ geoPath: GeoPath | undefined }]>;
  /**
   * A CSS color, or a function of the feature returning one (or a value for the chart's color
   * scale).  Lines have no fill.  None by default, as the core `GeoPath` (`null` for none where
   * a `class` sets one).
   */
  fill?: ColorProp<Feature> | null;
  /** The fill opacity of the element. (0 to 1) */
  fillOpacity?: number;
  /**
   * The outlines' color: a CSS color, or a data key / function of the feature run through the
   * chart's color scale (`null` for none).
   *
   * @default 'var(--color-surface-content)'
   */
  stroke?: ColorProp<Feature> | null;
  /**
   * Outline width in pixels, the same at any depth.
   *
   * @default 1
   */
  strokeWidth?: number;
  /** The stroke opacity of the element. (0 to 1) */
  strokeOpacity?: number;
  /** The opacity of the element. (0 to 1) @default 1 */
  opacity?: number;
  /**
   * Whether to animate the drawing of its outlines over time, as one path through its features.
   * Pass either `true` or an object with transition options (`duration`, `delay`, `speed`,
   * `easing`) to enable the transition.  Drawn again as its shapes change.
   */
  draw?: boolean | Parameters<typeof drawTransition>[1];
  /**
   * Marker to attach to both start and end points of the line (one path through its features'
   * outlines): drawn flat on the floor (over a globe, along it), turned along the line, in the
   * first feature's stroke color
   */
  marker?: MarkerOptions;
  /** Marker to attach to the middle point of the line (each point between its ends) */
  markerMid?: MarkerOptions;
  /** Marker to attach to the start point of the line */
  markerStart?: MarkerOptions;
  /** Marker to attach to the end point of the line */
  markerEnd?: MarkerOptions;
  /**
   * Add additional content at the start of the line (its first feature's first point).
   * Receives `{ point: DOMPoint; value: { x: number; y: number } }` as a snippet prop.
   */
  startContent?: Snippet<[{ point: DOMPoint; value: { x: number; y: number } }]>;
  /**
   * Add additional content at the end of the line (following it as `draw` draws it).
   * Receives `{ point: DOMPoint; value: { x: number; y: number } }` as a snippet prop.
   */
  endContent?: Snippet<[{ point: DOMPoint; value: { x: number; y: number } }]>;
  /**
   * Ease each feature's height and fill to new values rather than jumping, ex. `'tween'` or
   * `{ type: 'tween', duration: 800 }`.
   */
  motion?: MotionOptions;

  /**
   * CSS classes to style it by, as the core marks take them (ex. `fill-red-500 opacity-50`):
   * the fill, stroke, stroke width, and opacity they set, where its props don't say
   */
  class?: string;
};
