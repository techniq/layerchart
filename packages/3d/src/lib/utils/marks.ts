import {
  accessor,
  isScaleBand,
  resolveColorProp,
  type Accessor,
  type ChartState,
} from 'layerchart';
import type { ColorProp } from 'layerchart';

/** A chart scale's pixel position for `value`, at the middle of its band on a band scale */
export function scaled(scale: any, value: unknown): number {
  const position = Number(scale(value));
  return isScaleBand(scale) ? position + scale.bandwidth() / 2 : position;
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
