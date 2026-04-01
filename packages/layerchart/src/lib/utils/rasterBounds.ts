import { blur2 } from 'd3-array';

import type { InterpolateMethod } from './rasterInterpolate.js';

export type RasterBounds = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export function resolveRasterBounds(
  width: number,
  height: number,
  x1?: number,
  y1?: number,
  x2?: number,
  y2?: number
): RasterBounds {
  return {
    x1: x1 ?? 0,
    y1: y1 ?? 0,
    x2: x2 ?? width,
    y2: y2 ?? height,
  };
}

export function gridPointToBounds(
  x: number,
  y: number,
  width: number,
  height: number,
  bounds: RasterBounds
) {
  return {
    x: bounds.x1 + (x / width) * (bounds.x2 - bounds.x1),
    y: bounds.y1 + (y / height) * (bounds.y2 - bounds.y1),
  };
}

export function gridCellCenterToBounds(
  column: number,
  row: number,
  width: number,
  height: number,
  bounds: RasterBounds
) {
  return {
    x: bounds.x1 + ((column + 0.5) / width) * (bounds.x2 - bounds.x1),
    y: bounds.y1 + ((row + 0.5) / height) * (bounds.y2 - bounds.y1),
  };
}

export function sampleGridAtBounds(
  values: ArrayLike<number>,
  width: number,
  height: number,
  bounds: RasterBounds,
  x: number,
  y: number,
  method: InterpolateMethod = 'barycentric'
) {
  const dx = bounds.x2 - bounds.x1;
  const dy = bounds.y2 - bounds.y1;

  if (!width || !height || dx === 0 || dy === 0) return NaN;

  const fx = ((x - bounds.x1) / dx) * width - 0.5;
  const fy = ((y - bounds.y1) / dy) * height - 0.5;

  if (fx < -0.5 || fx > width - 0.5 || fy < -0.5 || fy > height - 0.5) {
    return NaN;
  }

  switch (method) {
    case 'barycentric':
      return sampleBilinear(values, width, height, fx, fy);
    case 'nearest':
    case 'none':
    default:
      return sampleNearest(values, width, height, fx, fy);
  }
}

export function blurGridIgnoringNaN(
  values: ArrayLike<number>,
  width: number,
  height: number,
  radius: number
) {
  if (!radius || !values.length) {
    return values instanceof Float64Array ? values : Float64Array.from(values);
  }

  const numerators = new Float64Array(values.length);
  const weights = new Float64Array(values.length);

  for (let index = 0; index < values.length; index++) {
    const value = values[index] ?? NaN;
    if (!Number.isFinite(value)) continue;
    numerators[index] = value;
    weights[index] = 1;
  }

  blur2({ data: numerators, width, height }, radius);
  blur2({ data: weights, width, height }, radius);

  const result = new Float64Array(values.length);
  for (let index = 0; index < values.length; index++) {
    const weight = weights[index];
    result[index] = weight > 1e-12 ? numerators[index] / weight : NaN;
  }

  return result;
}

function sampleNearest(
  values: ArrayLike<number>,
  width: number,
  height: number,
  x: number,
  y: number
) {
  const column = clamp(Math.round(x), 0, width - 1);
  const row = clamp(Math.round(y), 0, height - 1);
  return values[row * width + column] ?? NaN;
}

function sampleBilinear(
  values: ArrayLike<number>,
  width: number,
  height: number,
  x: number,
  y: number
) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = x0 + 1;
  const y1 = y0 + 1;
  const tx = x - x0;
  const ty = y - y0;

  const weightedValues: Array<[number, number]> = [
    [getSample(values, width, height, x0, y0), (1 - tx) * (1 - ty)],
    [getSample(values, width, height, x1, y0), tx * (1 - ty)],
    [getSample(values, width, height, x0, y1), (1 - tx) * ty],
    [getSample(values, width, height, x1, y1), tx * ty],
  ];

  let totalWeight = 0;
  let totalValue = 0;

  for (const [value, weight] of weightedValues) {
    if (!Number.isFinite(value)) continue;
    totalWeight += weight;
    totalValue += value * weight;
  }

  return totalWeight > 0 ? totalValue / totalWeight : NaN;
}

function getSample(values: ArrayLike<number>, width: number, height: number, x: number, y: number) {
  const column = clamp(x, 0, width - 1);
  const row = clamp(y, 0, height - 1);
  return values[row * width + column] ?? NaN;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
