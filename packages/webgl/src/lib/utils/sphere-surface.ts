import { BufferGeometry, Float32BufferAttribute } from 'three';
import { resolveRasterBounds, sampleGridAtBounds } from 'layerchart';

import type { GridDataProps } from './grid.js';
import { sphereGrid, type Sphere } from './globe.js';

/** How many segments around a globe of `radius` pixels for samples about `pixelSize` apart */
export function sphereSegments(radius: number, pixelSize: number) {
  return Math.round(Math.min(720, Math.max(64, (2 * Math.PI * radius) / pixelSize)));
}

/**
 * A grid of values over a globe's vertices, from the same inputs as a flat grid: a function of
 * longitude and latitude, or a `data` grid laid across `x1` / `y1` to `x2` / `y2` (longitude /
 * latitude).  `NaN` where there's nothing (scattered rows aren't sampled onto a globe).
 */
export function sphereValues(sphere: Sphere, props: GridDataProps, segments: number) {
  const grid = sphereGrid(sphere, segments);
  const count = grid.columns * grid.rows;
  const values = new Float64Array(count).fill(NaN);
  const isGrid = !!(props.data && props.width && props.height);
  const source = isGrid ? Float64Array.from(props.data as ArrayLike<number>) : null;
  const bounds = isGrid
    ? resolveRasterBounds(props.width!, props.height!, props.x1, props.y1, props.x2, props.y2)
    : null;
  const fn =
    typeof props.value === 'function' && props.value.length >= 2
      ? (props.value as (x: number, y: number) => number)
      : null;
  for (let k = 0; k < count; k++) {
    const longitude = grid.lonLat[k * 2];
    const latitude = grid.lonLat[k * 2 + 1];
    if (fn) values[k] = fn(longitude, latitude);
    else if (source && bounds)
      values[k] = sampleGridAtBounds(
        source,
        props.width!,
        props.height!,
        bounds,
        longitude,
        latitude
      );
  }
  return { grid, values };
}

/**
 * The globe as a mesh: each vertex raised `heightAt(k)` pixels off the surface (`NaN` leaves a
 * hole), with texture coordinates for an equirectangular image, and `colors` (RGBA) when given.
 */
export function sphereMesh(
  sphere: Sphere,
  grid: ReturnType<typeof sphereGrid>,
  heightAt: (k: number) => number,
  colors?: Float32Array
) {
  const count = grid.columns * grid.rows;
  const positions = new Float32Array(count * 3);
  const uvs = new Float32Array(count * 2);
  const heights = new Float64Array(count);
  for (let k = 0; k < count; k++) {
    const longitude = grid.lonLat[k * 2];
    const latitude = grid.lonLat[k * 2 + 1];
    heights[k] = heightAt(k);
    positions.set(
      sphere.toScene(longitude, latitude, Number.isFinite(heights[k]) ? heights[k] : 0),
      k * 3
    );
    uvs.set([(longitude + 180) / 360, (latitude + 90) / 180], k * 2);
  }
  const index: number[] = [];
  for (let t = 0; t < grid.index.length; t += 3) {
    const [a, b, c] = [grid.index[t], grid.index[t + 1], grid.index[t + 2]];
    if (Number.isFinite(heights[a]) && Number.isFinite(heights[b]) && Number.isFinite(heights[c])) {
      index.push(a, b, c);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
  if (colors) geometry.setAttribute('color', new Float32BufferAttribute(colors, 4));
  geometry.setIndex(index);
  geometry.computeVertexNormals();
  return geometry;
}

/** The value at the vertex nearest a longitude / latitude on a sphere grid */
export function sphereValueAt(
  grid: ReturnType<typeof sphereGrid>,
  values: ArrayLike<number>,
  longitude: number,
  latitude: number
) {
  const i = Math.round(((longitude + 180) / 360) * (grid.columns - 1));
  const j = Math.round(((90 - latitude) / 180) * (grid.rows - 1));
  return values[
    Math.max(0, Math.min(grid.rows - 1, j)) * grid.columns +
      Math.max(0, Math.min(grid.columns - 1, i))
  ];
}
