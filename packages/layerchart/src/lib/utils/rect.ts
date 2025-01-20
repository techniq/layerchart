import { derived } from 'svelte/store';
import { max, min } from 'd3-array';

import { isScaleBand } from './scales.js';
import type { ChartContext } from '../components/ChartContext.svelte';
import { accessor, type Accessor } from './common.js';

/** A set of inset distances, applied to a rectangle to shrink or expand the area represented by that rectangle. */
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

type ResolvedInsets = {
  left: number;
  right: number;
  top: number;
  bottom: number;
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

export function createDimensionGetter<TData>(
  context: ChartContext<TData>,
  options?: DimensionGetterOptions
) {
  const {
    xScale,
    yScale,
    x: xAccessor,
    y: yAccessor,
    x1: x1Accessor,
    y1: y1Accessor,
    x1Scale,
    y1Scale,
  } = context;

  return derived(
    [xScale, x1Scale, yScale, y1Scale, xAccessor, yAccessor, x1Accessor, y1Accessor],
    ([$xScale, $x1Scale, $yScale, $y1Scale, $xAccessor, $yAccessor, $x1Accessor, $y1Accessor]) => {
      const insets = resolveInsets(options?.insets);
      // Use `xscale.domain()` instead of `$xDomain` to include `nice()` being applied
      const [minXDomain, maxXDomain] = $xScale.domain();
      const [minYDomain, maxYDomain] = $yScale.domain();

      const _x = accessor(options?.x ?? $xAccessor);
      const _y = accessor(options?.y ?? $yAccessor);
      const _x1 = accessor(options?.x1 ?? $x1Accessor);
      const _y1 = accessor(options?.y1 ?? $y1Accessor);

      // @ts-expect-error
      return function getter(item) {
        if (isScaleBand($yScale)) {
          // Horizontal band
          const y =
            firstValue($yScale(_y(item)) ?? 0) + ($y1Scale ? $y1Scale(_y1(item)) : 0) + insets.top;
          const height = Math.max(
            0,
            $yScale.bandwidth
              ? ($y1Scale ? ($y1Scale.bandwidth?.() ?? 0) : $yScale.bandwidth()) -
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
            left = max([0, minXDomain]);
            right = xValue;
          } else {
            // Negative value
            left = xValue;
            right = min([0, maxXDomain]);
          }

          const x = $xScale(left) + insets.left;
          const width = Math.max(0, $xScale(right) - $xScale(left) - insets.left - insets.right);

          return { x, y, width, height };
        } else {
          // Vertical band or linear
          const x =
            firstValue($xScale(_x(item))) + ($x1Scale ? $x1Scale(_x1(item)) : 0) + insets.left;
          const width = Math.max(
            0,
            $xScale.bandwidth
              ? ($x1Scale ? ($x1Scale.bandwidth?.() ?? 0) : $xScale.bandwidth()) -
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
            bottom = max([0, minYDomain]);
          } else {
            // Negative value
            top = min([0, maxYDomain]);
            bottom = yValue;
          }

          const y = $yScale(top) + insets.top;
          const height = $yScale(bottom) - $yScale(top) - insets.bottom - insets.top;

          return { x, y, width, height };
        }
      };
    }
  );
}

/**
 * If value is an array, returns first item, else returns original value
 * Useful when x/y getters for band scale are an array (such as for histograms)
 */
export function firstValue(value: number | number[]) {
  return Array.isArray(value) ? value[0] : value;
}

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
