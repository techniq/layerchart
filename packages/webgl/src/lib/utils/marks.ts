import {
  accessor,
  isScaleBand,
  resolveColorProp,
  type Accessor,
  type ChartState,
} from 'layerchart';
import type { ColorProp } from 'layerchart';

import type { ScenePoint, Sphere } from './globe.js';

/** A chart scale's pixel position for `value`, at the middle of its band on a band scale */
export function scaled(scale: any, value: unknown): number {
  const position = Number(scale(value));
  return isScaleBand(scale) ? position + scale.bandwidth() / 2 : position;
}

/**
 * Where a row's `x` / `y` values sit on the plot, in pixels: through the chart's projection on a
 * map (longitude, latitude), else its scales (at the middle of a band)
 */
export function position(ctx: ChartState<any>, xValue: unknown, yValue: unknown): [number, number] {
  const projection = ctx.geo.projection;
  if (projection) return projection([Number(xValue), Number(yValue)]) ?? [NaN, NaN];
  return [scaled(ctx.xScale, xValue), scaled(ctx.yScale, yValue)];
}

/**
 * Where a row stands in the scene's axes (`x` across, height, `y` down): on the chart's globe at
 * its longitude / latitude (`height` out from the surface), else on the floor where `position`
 * puts it
 */
export function place(
  ctx: ChartState<any>,
  sphere: Sphere | null,
  xValue: unknown,
  yValue: unknown,
  height: number
): ScenePoint {
  if (sphere) return sphere.toScene(Number(xValue), Number(yValue), height);
  const [px, py] = position(ctx, xValue, yValue);
  return [px, height, py];
}

/** A mark's accessor, else the chart's */
export function resolveAccessor(prop: Accessor | undefined, fallback: Accessor | undefined) {
  return accessor(prop ?? fallback);
}

/**
 * A row's color: from the mark's `fill` / `stroke` (a CSS color, a data key, or a function, run
 * through the chart's color scale), else the chart's `c`, else `fallback`.
 */
export function rowColor(
  ctx: ChartState<any>,
  value: ColorProp<any> | undefined,
  d: any,
  fallback: string
): string {
  if (value != null) return resolveColorProp(value, d, ctx.cScale) ?? fallback;
  if (ctx.config.c != null && ctx.cScale) return String(ctx.cGet(d) ?? fallback);
  return fallback;
}

/** Whether a row has a value to draw at: not `null` / `undefined` / `NaN` */
export function defined(value: unknown) {
  return value != null && !(typeof value === 'number' && Number.isNaN(value));
}
