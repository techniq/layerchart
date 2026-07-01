/**
 * Data generation utilities for benchmarks.
 */

import type { GeoPermissibleObjects } from 'd3-geo';

export type TimeSeriesPoint = { date: Date; value: number };
export type MultiSeriesPoint = Record<string, Date | number>;

/**
 * Generate time series data with the given number of points.
 */
export function generateTimeSeriesData(count: number): TimeSeriesPoint[] {
  const start = new Date('2020-01-01').getTime();
  const dayMs = 86_400_000;
  const data: TimeSeriesPoint[] = new Array(count);

  let value = 50;
  for (let i = 0; i < count; i++) {
    value += (Math.random() - 0.5) * 10;
    data[i] = {
      date: new Date(start + i * dayMs),
      value,
    };
  }
  return data;
}

/**
 * Generate wide-format multi-series data (one row per date, multiple value columns).
 */
export function generateMultiSeriesData(count: number, seriesKeys: string[]): MultiSeriesPoint[] {
  const start = new Date('2020-01-01').getTime();
  const dayMs = 86_400_000;
  const data: MultiSeriesPoint[] = new Array(count);

  const values = Object.fromEntries(seriesKeys.map((k) => [k, 50]));

  for (let i = 0; i < count; i++) {
    const row: MultiSeriesPoint = { date: new Date(start + i * dayMs) };
    for (const key of seriesKeys) {
      values[key] += (Math.random() - 0.5) * 10;
      row[key] = values[key];
    }
    data[i] = row;
  }
  return data;
}

/**
 * Generate separate data arrays for each series (long format).
 */
export function generateSeparateSeriesData(
  count: number,
  seriesKeys: string[]
): Record<string, TimeSeriesPoint[]> {
  const result: Record<string, TimeSeriesPoint[]> = {};
  for (const key of seriesKeys) {
    result[key] = generateTimeSeriesData(count);
  }
  return result;
}

/**
 * Generate a single polygon feature resembling a country-like shape.
 * `vertexCount` controls the complexity of the polygon boundary.
 */
function generatePolygonFeature(
  centerLon: number,
  centerLat: number,
  size: number,
  vertexCount: number,
  id: number
): GeoPermissibleObjects {
  const coords: [number, number][] = [];
  for (let i = 0; i < vertexCount; i++) {
    const angle = (2 * Math.PI * i) / vertexCount;
    const jitter = 0.5 + Math.random() * 0.5; // random radius variation
    const lon = centerLon + size * jitter * Math.cos(angle);
    const lat = centerLat + size * 0.6 * jitter * Math.sin(angle);
    coords.push([lon, lat]);
  }
  // Close the ring
  coords.push(coords[0]);

  return {
    type: 'Feature',
    id,
    properties: { name: `Region ${id}` },
    geometry: {
      type: 'Polygon',
      coordinates: [coords],
    },
  };
}

/**
 * Generate a GeoJSON FeatureCollection with `count` polygon features.
 * `verticesPerFeature` controls polygon boundary complexity.
 */
export function generateGeoFeatures(
  count: number,
  verticesPerFeature = 20
): { features: GeoPermissibleObjects[]; collection: GeoPermissibleObjects } {
  const cols = Math.ceil(Math.sqrt(count));
  const size = 300 / cols; // spread across ~300 degrees of longitude
  const features: GeoPermissibleObjects[] = [];

  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const lon = -150 + col * size + size / 2;
    const lat = -60 + row * size + size / 2;
    features.push(generatePolygonFeature(lon, lat, size * 0.4, verticesPerFeature, i));
  }

  return {
    features,
    collection: { type: 'FeatureCollection', features } as GeoPermissibleObjects,
  };
}
