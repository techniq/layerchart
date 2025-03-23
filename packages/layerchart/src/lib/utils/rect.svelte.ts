import type { ChartContextValue } from 'layerchart/components/Chart.svelte';
import { accessor, type Accessor } from './common.js';
import { isScaleBand } from './scales.svelte.js';
import { max, min } from 'd3-array';

/**
 * A set of inset distances, applied to a rectangle to shrink or expand
 * the area  represented by that rectangle.
 */
export type Insets = {
  /** Applies an inset all sides of a rectangle: `left`, `right`, `bottom`, and `top` */
  all?: number;
  /** Applies an inset all horizontal sides of a rectangle: `left`, and `right`, overriding `all` */
  x?: number;
  /** Applies an inset all vertical sides of a rectangle: `top`, and `bottom`, overriding `all` */
  y?: number;
  /** Applies an inset the left side of a rectangle, overriding `x` */
  left?: number;
  /** Applies an inset the right side of a rectangle, overriding `x` */
  right?: number;
  /** Applies an inset the top side of a rectangle, overriding `y` */
  top?: number;
  /** Applies an inset the bottom side of a rectangle, overriding `y` */
  bottom?: number;
};

type DimensionGetterOptions = {
  /** Override `x` accessor from context */
  x?: Accessor;
  /** Override `y` accessor from context */
  y?: Accessor;
  /** Override `x1` accessor from context */
  x1?: Accessor;
  /** Override `y1` accessor from context */
  y1?: Accessor;
  insets?: Insets;
};

type ResolvedInsets = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

function resolveInsets(insets?: Insets): ResolvedInsets {
  const all = insets?.all ?? 0;

  const x = insets?.x ?? all;
  const y = insets?.y ?? all;

  const left = insets?.left ?? x;
  const right = insets?.right ?? x;
  const top = insets?.top ?? y;
  const bottom = insets?.bottom ?? y;

  return { left, right, bottom, top };
}

export function createDimensionGetter<TData>(
  ctx: ChartContextValue<TData>,
  getOptions?: () => DimensionGetterOptions
) {
  const options = $derived(getOptions?.());

  return (item: TData) => {
    const insets = resolveInsets(options?.insets);
    // Use `xscale.domain()` instead of `$xDomain` to include `nice()` being applied
    const xDomainMinMax = ctx.xScale.domain();
    const yDomainMinMax = ctx.yScale.domain();

    const _x = accessor(options?.x ?? ctx.x);
    const _y = accessor(options?.y ?? ctx.y);
    const _x1 = accessor(options?.x1 ?? ctx.x1);
    const _y1 = accessor(options?.y1 ?? ctx.y1);

    if (isScaleBand(ctx.yScale)) {
      // Horizontal band
      const y =
        firstValue(ctx.yScale(_y(item)) ?? 0) +
        (ctx.y1Scale ? ctx.y1Scale(_y1(item)) : 0) +
        insets.top;

      const height = Math.max(
        0,
        ctx.yScale.bandwidth
          ? (ctx.y1Scale ? (ctx.y1Scale.bandwidth?.() ?? 0) : ctx.yScale.bandwidth()) -
              insets.bottom -
              insets.top
          : 0
      );

      const xValue = _x(item);

      let left = 0;
      let right = 0;
      if (Array.isArray(xValue)) {
        // Array contains both top and bottom values (stack, etc);
        left = min(xValue);
        right = max(xValue);
      } else if (xValue == null) {
        // null/undefined value
        left = 0;
        right = 0;
      } else if (xValue > 0) {
        // Positive value
        left = max([0, xDomainMinMax[0]]);
        right = xValue;
      } else {
        // Negative value
        left = xValue;
        right = min([0, xDomainMinMax[1]]);
      }

      const x = ctx.xScale(left) + insets.left;
      const width = Math.max(0, ctx.xScale(right) - ctx.xScale(left) - insets.left - insets.right);

      return { x, y, width, height };
    } else {
      // Vertical band or linear
      const x =
        firstValue(ctx.xScale(_x(item))) + (ctx.x1Scale ? ctx.x1Scale(_x1(item)) : 0) + insets.left;

      const width = Math.max(
        0,
        ctx.xScale.bandwidth
          ? (ctx.x1Scale ? (ctx.x1Scale.bandwidth?.() ?? 0) : ctx.xScale.bandwidth()) -
              insets.left -
              insets.right
          : 0
      );

      const yValue = _y(item);

      let top = 0;
      let bottom = 0;
      if (Array.isArray(yValue)) {
        // Array contains both top and bottom values (stack, etc);
        top = max(yValue);
        bottom = min(yValue);
      } else if (yValue == null) {
        // null/undefined value
        top = 0;
        bottom = 0;
      } else if (yValue > 0) {
        // Positive value
        top = yValue;
        bottom = max([0, yDomainMinMax[0]]);
      } else {
        // Negative value
        top = min([0, yDomainMinMax[1]]);
        bottom = yValue;
      }

      const y = ctx.yScale(top) + insets.top;
      const height = ctx.yScale(bottom) - ctx.yScale(top) - insets.bottom - insets.top;

      return { x, y, width, height };
    }
  };
}

/**
 * If value is an array, returns first item, else returns original value
 * Useful when x/y getters for band scale are an array (such as for histograms)
 */
export function firstValue(value: number | number[]) {
  return Array.isArray(value) ? value[0] : value;
}
