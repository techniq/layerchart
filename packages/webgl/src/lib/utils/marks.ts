import {
  accessor,
  extractRawDataValue,
  isDataProp,
  isScaleBand,
  resolveColorProp,
  type Accessor,
  type ChartState,
  type DataProp,
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

/**
 * `place`, with the chart's globe, projection, or scales read once: for placing many rows, as
 * reading them (reactive state) for every row adds up
 */
export function placer(
  ctx: ChartState<any>,
  sphere: Sphere | null,
  scales?: { x: any; y: any }
): (xValue: unknown, yValue: unknown, height: number) => ScenePoint {
  if (sphere) return (x, y, height) => sphere.toScene(Number(x), Number(y), height);
  const projection = ctx.geo.projection;
  if (projection) {
    return (x, y, height) => {
      const [px, py] = projection([Number(x), Number(y)]) ?? [NaN, NaN];
      return [px, height, py];
    };
  }
  const xScale = scales?.x ?? (ctx.xScale as any);
  const yScale = scales?.y ?? (ctx.yScale as any);
  const xBand = isScaleBand(xScale) ? xScale.bandwidth() / 2 : 0;
  const yBand = isScaleBand(yScale) ? yScale.bandwidth() / 2 : 0;
  return (x, y, height) => [Number(xScale(x)) + xBand, height, Number(yScale(y)) + yBand];
}

/**
 * Whether a scale maps values to pixels linearly (linear or time), so panning and zooming its
 * domain moves every pixel by one scale and offset
 */
export function isLinearScale(scale: any) {
  return (
    !isScaleBand(scale) &&
    typeof scale?.invert === 'function' &&
    !('base' in scale) &&
    !('exponent' in scale) &&
    !('constant' in scale)
  );
}

/** The scale and offset taking `from`'s pixels to `to`'s, two linear scales over the same values */
export function linearShift(from: any, to: any): [k: number, t: number] {
  const [d0, d1] = to.domain();
  const [a0, a1] = [Number(from(d0)), Number(from(d1))];
  const [b0, b1] = [Number(to(d0)), Number(to(d1))];
  const k = a1 === a0 ? 1 : (b1 - b0) / (a1 - a0);
  return [k, b0 - k * a0];
}

/** `rowColor`, with the chart's color settings read once, for coloring many rows */
export function colorer(
  ctx: ChartState<any>,
  value: ColorProp<any> | undefined,
  fallback: string
): (d: any) => string {
  const cScale = ctx.cScale;
  if (value != null) return (d) => resolveColorProp(value, d, cScale) ?? fallback;
  if (ctx.config.c != null && cScale) {
    const cGet = ctx.cGet;
    return (d) => String(cGet(d) ?? fallback);
  }
  return () => fallback;
}

/**
 * Where a row's `x` / `y` props put it on the plot, as LayerChart's primitives resolve them: a
 * number in pixels, and a data key or function through the chart's projection on a map
 * (longitude, latitude), else its scales (at the middle of a band)
 */
export function positionOf(
  ctx: ChartState<any>,
  x: DataProp | undefined,
  y: DataProp | undefined,
  d: any,
  { bandStart = false } = {}
): [number, number] {
  if (ctx.geo.projection && isDataProp(x) && isDataProp(y)) {
    return position(ctx, extractRawDataValue(x, d), extractRawDataValue(y, d));
  }
  const along = (scale: any, prop: DataProp | undefined) => {
    if (typeof prop === 'number') return prop;
    if (prop == null) return 0;
    const value = extractRawDataValue(prop, d);
    return bandStart ? Number(scale(value)) : scaled(scale, value);
  };
  return [along(ctx.xScale, x), along(ctx.yScale, y)];
}

/**
 * Where a row's `x` / `y` / `z` props put it in the scene's axes (`x` across, height, `y` down):
 * on the chart's globe at its longitude / latitude (`z` out from the surface), else on the floor
 * where `positionOf` puts it, `z` up.  `z` is a number in pixels, or a data key or function
 * through the chart's `z` scale.
 */
export function placeOf(
  ctx: ChartState<any>,
  sphere: Sphere | null,
  x: DataProp | undefined,
  y: DataProp | undefined,
  z: DataProp | undefined,
  d: any
): ScenePoint {
  const height = z == null ? 0 : ctx.heightOf(d, z)[1];
  if (sphere && isDataProp(x) && isDataProp(y)) {
    return sphere.toScene(
      Number(extractRawDataValue(x, d)),
      Number(extractRawDataValue(y, d)),
      height
    );
  }
  const [px, py] = positionOf(ctx, x, y, d);
  return [px, height, py];
}

/**
 * The rows a mark draws: its `data`, else the chart's when its props read rows (as LayerChart's
 * primitives do), else one, for a mark placed by numbers alone
 */
export function markRows(ctx: ChartState<any>, data: any[] | undefined, ...props: unknown[]) {
  if (data) return data;
  return props.some(isDataProp) ? ((ctx.data ?? []) as any[]) : [undefined];
}

/**
 * Pixels between ticks along an axis, as LayerChart's `Axis` spaces them when its ticks don't
 * say: wider across (`x`) than up or down (`y`, and the height `z`)
 */
export const TICK_SPACING = { x: 80, y: 50, z: 50 } as const;

/** About one tick per `spacing` pixels along an axis `length` long */
export function tickCount(length: number, spacing: number) {
  return Math.max(2, Math.round(length / spacing));
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
