import { derived } from 'svelte/store';
import { max, min } from 'd3-array';

import { groupScaleBand, isScaleBand } from './scales';

type DimensionGetterOptions = {
  /** Override `x` accessor from context */
  x?: (item: any) => any;
  /** Override `y` accessor from context */
  y?: (item: any) => any;
  groupBy?: string;
  padding?: number;
  groupPadding?: { inner?: number; outer?: number };
};

// TOOD: Pass in overrides for `x` and `y` accessors
export function createDimensionGetter(context, options?: DimensionGetterOptions) {
  const {
    flatData,
    xGet,
    yGet,
    xRange,
    yRange,
    xScale,
    yScale,
    x: xAccessor,
    y: yAccessor,
  } = context;

  const groupBy = options?.groupBy;
  const padding = options?.padding ?? 0;

  return derived(
    [flatData, xGet, yGet, xRange, yRange, xScale, yScale, xAccessor, yAccessor],
    ([$flatData, $xGet, $yGet, $xRange, $yRange, $xScale, $yScale, $xAccessor, $yAccessor]) => {
      return function getter(item) {
        if (isScaleBand($yScale)) {
          // Horizontal band
          const y1Scale = groupBy
            ? groupScaleBand($yScale, $flatData, groupBy, options?.groupPadding)
            : null;
          const y = firstValue($yGet(item)) + (y1Scale ? y1Scale(item[groupBy]) : 0) + padding / 2;
          const height = Math.max(
            0,
            $yScale.bandwidth ? (y1Scale ? y1Scale.bandwidth() : $yScale.bandwidth()) - padding : 0
          );

          const _x = options?.x
            ? typeof options.x === 'string'
              ? (d) => d[options.x]
              : options?.x
            : $xAccessor;
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
            left = min($xRange); // or `0`?
            right = xValue;
          } else {
            // Negative value
            left = xValue;
            right = min($xRange); // or `0`?
          }

          return {
            x: $xScale(left),
            y,
            width: $xScale(right) - $xScale(left),
            height,
          };
        } else {
          // Vertical band or linear
          const x1Scale = groupBy
            ? groupScaleBand($xScale, $flatData, groupBy, options?.groupPadding)
            : null;

          const x = firstValue($xGet(item)) + (x1Scale ? x1Scale(item[groupBy]) : 0) + padding / 2;
          const width = Math.max(
            0,
            $xScale.bandwidth ? (x1Scale ? x1Scale.bandwidth() : $xScale.bandwidth()) - padding : 0
          );

          const _y = options?.y
            ? typeof options.y === 'string'
              ? (d) => d[options.y]
              : options?.y
            : $yAccessor;
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
            bottom = min($yRange); // or `0`?
          } else {
            // Negative value
            top = min($yRange); // or `0`?
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
