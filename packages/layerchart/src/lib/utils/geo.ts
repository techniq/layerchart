import {
  geoPath as d3geoPath,
  type GeoContext,
  type GeoPermissibleObjects,
  type GeoProjection,
  type GeoStreamWrapper,
} from 'd3-geo';
import { path, type Path } from 'd3-path';

import { type CurveFactory, type CurveFactoryLineOnly } from 'd3-shape';

/**
 * Render a geoPath() using curve factory
 * @see {@link https://observablehq.com/@d3/context-to-curve}
 */
export function geoCurvePath(
  projection: GeoProjection | GeoStreamWrapper | null,
  curve: CurveFactory | CurveFactoryLineOnly,
  context?: CanvasRenderingContext2D | Path
) {
  const pathContext = context === undefined ? path() : context;
  const geoPath = d3geoPath(projection, curveContext(curve(pathContext)));

  const fn = (object: GeoPermissibleObjects) => {
    geoPath(object);
    return context === undefined ? pathContext + '' : undefined;
  };

  // Expose geoPath properties such as `.centroid()`
  Object.setPrototypeOf(fn, geoPath);

  return fn;
}

/**
 * Translate Curve to GeoContext interface
 */
function curveContext(curve: ReturnType<CurveFactory | CurveFactoryLineOnly>): GeoContext {
  return {
    beginPath() {
      // nothing?
    },
    moveTo(x, y) {
      curve.lineStart();
      curve.point(x, y);
    },
    arc(x, y, radius, startAngle, endAngle, anticlockwise) {
      // nothing?
    },
    lineTo(x, y) {
      curve.point(x, y);
    },
    closePath() {
      curve.lineEnd();
    },
  };
}

/**
 * Return the point on Earth's surface that is diametrically opposite to another point
 * @see: https://en.wikipedia.org/wiki/Antipodes
 */
export function antipode([longitude, latitude]: [number, number]): [number, number] {
  return [longitude + 180, -latitude];
}
