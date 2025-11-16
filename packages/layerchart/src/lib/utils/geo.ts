import { range } from 'd3-array';
import {
  geoPath as d3geoPath,
  geoCentroid,
  geoDistance,
  geoInterpolate,
  geoProjection,
  geoRotation,
  type GeoContext,
  type GeoPermissibleObjects,
  type GeoProjection,
  type GeoStreamWrapper,
  geoAzimuthalEqualArea,
  geoCircle,
} from 'd3-geo';
// @ts-expect-error - no types available
import { geoGrayFullerRaw, geoAirocean } from 'd3-geo-polygon';
// @ts-expect-error - no types available
import { geoVoronoi } from 'd3-geo-voronoi';
import { path, type Path } from 'd3-path';

import { type CurveFactory, type CurveFactoryLineOnly } from 'd3-shape';
import { radiansToDegrees } from './math.js';

/**
 * Render a geoPath() using curve factory
 * @see {@link https://observablehq.com/@d3/context-to-curve}
 */
export function geoCurvePath(
  projection: GeoProjection | GeoStreamWrapper | null,
  curve: CurveFactory | CurveFactoryLineOnly,
  context?: CanvasRenderingContext2D | Path
): ReturnType<typeof d3geoPath> {
  const pathContext = context === undefined ? path() : context;
  const geoPath = d3geoPath(projection, curveContext(curve(pathContext)));

  const fn = (object: GeoPermissibleObjects) => {
    geoPath(object);
    return context === undefined ? pathContext + '' : undefined;
  };

  // Expose geoPath properties such as `.centroid()`
  Object.setPrototypeOf(fn, geoPath);

  // @ts-expect-error
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

/**
 * Check if point ([x, y]) is visible on projection
 * @see: https://observablehq.com/@d3/testing-projection-visibility
 */
export function isVisible(projection: GeoProjection | GeoStreamWrapper) {
  let visible;
  // @ts-expect-error
  const stream = projection.stream({
    point() {
      visible = true;
    },
  });
  return ([x, y]: [number, number]) => ((visible = false), stream.point(x, y), visible);
}

export function geoFitObjectTransform(
  projection: GeoProjection,
  size: [number, number],
  object: Parameters<typeof projection.fitSize>[1]
) {
  const newProjection = projection.fitSize(size, object);
  const translate = newProjection.translate();
  return { translate: { x: translate[0], y: translate[1] }, scale: newProjection.scale() };
}

/**
 * Cache the contains check for a land feature collection.
 *
 * Calling d3.geoContains(feature, point) repeatedly for many points is
 * about the same as projecting the feature again and again. Slow.
 *
 * This function projects only projects the feature once, on a hidden canvas,
 * and read from the canvas data.
 *
 * @see: https://observablehq.com/@fil/another-hex-map
 */
export function geoContainsCache(land: GeoJSON.FeatureCollection) {
  const w = 5000;
  const h = 5000;
  const projection = geoAzimuthalEqualArea().fitSize([w, h], { type: 'Sphere' });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;
  const path = d3geoPath(projection, context);
  canvas.width = w;
  canvas.height = h;
  context.fillStyle = 'white';
  context.fillRect(0, 0, w, h);
  context.fillStyle = 'black';
  context.beginPath(), path(land), context.fill();
  const imageData = context.getImageData(0, 0, w, h).data;

  // Clean up canvas resources
  canvas.remove();

  return function (point: [number, number]) {
    point = projection(point)!;
    return imageData[4 * (Math.floor(point[0]) + Math.floor(point[1]) * w)] < 128;
  };
}

/**
 * Generate a Gray-Fuller grid of polygons on the Earth's surface.
 *
 * see: https://observablehq.com/@fil/gray-fuller-grid
 * see: https://github.com/tzakharko/uniform-geodesic-grid
 */
export function grayFullerGrid(count: number = 2): GeoJSON.FeatureCollection {
  function* rasterizeTriangle(
    tri: [number, number][],
    k: number,
    includeEdges = false
  ): Generator<[number, number]> {
    const step = 1.0 / k;
    const offset = includeEdges ? 0 : 1;
    for (let u = k - offset; u >= offset; u -= 1) {
      for (let v = offset; v <= k - u - offset; v += 1) {
        const barycentrics = [u * step, v * step, (k - u - v) * step];
        // calculate the point coordinates from barycentrics
        yield tri[0].map((_, ci) => {
          return barycentrics.reduce((sum, w, vi) => sum + tri[vi][ci] * w, 0);
        }) as [number, number];
      }
    }
  }

  // a single icosahedron face as a geodesic triangle
  const theta = radiansToDegrees(Math.atan(0.5));
  const triangle: [number, number][] = [
    [0, theta],
    [36, -theta],
    [-36, -theta],
  ];

  // Create a GeoJSON polygon to calculate centroid
  const centroid = geoCentroid({
    type: 'Polygon',
    coordinates: [[...triangle, triangle[0]]],
  });

  // Set up the Gray-Fuller projection, which we use to project
  // between the geodesic triangle and the planar triangle
  const proj = geoProjection(geoGrayFullerRaw())
    .rotate([-centroid[0], -centroid[1]])
    .center([0, triangle[0][1] - centroid[1]])
    .scale(1)
    .translate([0, 0]);

  // generate equally spaced points on the geodesic sphere
  // note: only consider the point inside the triangle,
  //       we will add edges and vertices later since they are
  //       shared between multiple faces of the icosahedron
  const facePoints = [
    ...rasterizeTriangle(
      triangle.map((p) => proj(p) as [number, number]),
      count,
      false
    ),
  ]
    .map((p) => proj.invert?.(p) as [number, number])
    .map((p) => [p, geoRotation([0, 90 - theta, 180])(p) as [number, number]])
    .flatMap(([[x0, y0], [x1, y1]]) => [
      // 10 triangles forming the middle section of the sphere
      ...range(0, 10).map((i) => [x0 + i * 36, (i % 2 ? -1 : 1) * y0] as [number, number]),
      // 5 triangles forming the north cap
      ...range(0, 5).map((i) => [x1 + i * 72, y1] as [number, number]),
      // 5 triangles forming the south cap
      ...range(0, 5).map((i) => [36 - x1 + i * 72, -y1] as [number, number]),
    ]);

  // generate the vertices and edges
  const vertices: [number, number][] = [
    [0, 90],
    [0, -90],
    ...range(0, 10).map(
      (i) => [((i * 36 + 180) % 360) - 180, i & 1 ? -theta : theta] as [number, number]
    ),
  ];

  const edges = vertices.flatMap((v0, i) =>
    vertices.slice(i + 1).flatMap((v1) => {
      // we know th distance between neighbouring vertices
      if (Math.abs(geoDistance(v0, v1) - 1.1) >= 0.01) return [];

      // interpolate along the edge
      const interpolator = geoInterpolate(v0, v1);
      return [...range(1, count).map((i) => interpolator(i / count))];
    })
  );

  // combine the points and rotate them to place the icosahedron vertices in the ocean
  const points = [...vertices, ...edges, ...facePoints]
    .map((p) => geoRotation([36, 0, 0])(p) as [number, number])
    .map((p) => geoRotation(geoAirocean().rotate()).invert?.(p) as [number, number]);

  // build the voronoi diagram of grid cells
  const voronoi = geoVoronoi(points);
  const delaunay = voronoi.delaunay;

  function makeCellPolygon(delaunay_polygon: number[]): [number, number][] {
    let ring = [...delaunay_polygon.map((j) => delaunay.centers[j])];
    ring.push(ring[0]);
    return ring as [number, number][];
  }

  // Produce GeoJSON representation of cells
  const cellFeatures = range(0, voronoi.points.length).map((i) => {
    return {
      type: 'Feature' as const,
      properties: {
        gid: i,
        centroid: [voronoi.points[i][0], voronoi.points[i][1]],
        neighbors: delaunay.neighbors[i],
        type: (i < vertices.length + edges.length
          ? i < vertices.length
            ? 'vertex'
            : 'edge'
          : 'face') as 'face' | 'edge' | 'vertex',
      },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [makeCellPolygon(delaunay.polygons[i])],
      },
      // geometry: geoCircle()
      //   .radius(180 / count / 6.0)
      //   .center(voronoi.points[i])
      //   .precision(20)(),
    };
  });

  return {
    type: 'FeatureCollection' as const,
    features: cellFeatures,
  };
}
