import { derived } from 'svelte/store';
import { max, min } from 'd3-array';

import { isScaleBand } from './scales.js';
import type { ChartContext } from '../components/ChartContext.svelte';
import { accessor, type Accessor } from './common.js';

type DimensionGetterOptions = {
  /** Override `x` accessor from context */
  x?: Accessor;
  /** Override `y` accessor from context */
  y?: Accessor;
  /** Override `x1` accessor from context */
  x1?: Accessor;
  /** Override `y1` accessor from context */
  y1?: Accessor;
  inset?: number;
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

  const inset = options?.inset ?? 0;

  return derived(
    [xScale, x1Scale, yScale, y1Scale, xAccessor, yAccessor, x1Accessor, y1Accessor],
    ([$xScale, $x1Scale, $yScale, $y1Scale, $xAccessor, $yAccessor, $x1Accessor, $y1Accessor]) => {
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
            firstValue($yScale(_y(item)) ?? 0) + ($y1Scale ? $y1Scale(_y1(item)) : 0) + inset / 2;
          const height = Math.max(
            0,
            $yScale.bandwidth
              ? ($y1Scale ? ($y1Scale.bandwidth?.() ?? 0) : $yScale.bandwidth()) - inset
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

          return {
            x: $xScale(left),
            y,
            width: $xScale(right) - $xScale(left),
            height,
          };
        } else {
          // Vertical band or linear
          const x =
            firstValue($xScale(_x(item))) + ($x1Scale ? $x1Scale(_x1(item)) : 0) + inset / 2;
          const width = Math.max(
            0,
            $xScale.bandwidth
              ? ($x1Scale ? ($x1Scale.bandwidth?.() ?? 0) : $xScale.bandwidth()) - inset
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

          return {
            x,
            y: $yScale(top),
            width,
            height: $yScale(bottom) - $yScale(top),
          };
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
