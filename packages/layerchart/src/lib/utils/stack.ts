import { flatGroup, max, rollup, sum } from 'd3-array';
import { stack, stackOffsetNone, stackOrderNone } from 'd3-shape';
import { pivotWider } from './pivot.js';

type OrderType = typeof stackOrderNone; // all orders share the same API
type OffsetType = typeof stackOffsetNone; // all offsets share the same API

export function createStackData<TData>(
  data: TData[],
  options: {
    xKey: string;
    groupBy?: string;
    stackBy?: string;
    order?: OrderType;
    offset?: OffsetType;
  }
): {
  keys: (string | number)[];
  values: number[];
}[] {
  if (options.groupBy) {
    // Group then Stack (if needed)
    const groupedData = flatGroup(
      data,
      // @ts-expect-error
      (d) => d[options.xKey],
      // @ts-expect-error
      (d) => d[options.groupBy ?? '']
    );

    const result = groupedData.flatMap((d, i) => {
      const groupKeys = d.slice(0, -1); // all but last item
      const itemData = d.slice(-1)[0]; // last item

      const pivotData = pivotWider(itemData, options.xKey, options.stackBy ?? '', 'value');

      const stackKeys: Array<any> = [
        ...new Set(itemData.map((d: any) => d[options.stackBy ?? ''])),
      ];
      // @ts-expect-error
      const stackData = stack().keys(stackKeys).order(options.order).offset(options.offset)(
        pivotData
      );

      return stackData.flatMap((series) => {
        return series.flatMap((s) => {
          return {
            ...itemData[0], // TODO: More than one should use stacks or aggregate values?
            keys: options.stackBy ? [...groupKeys, series.key] : groupKeys,
            values: options.stackBy ? [s[0], s[1]] : [0, sum(itemData, (d: any) => d.value)],
          };
        });
      });
    });

    return result;
  } else if (options.stackBy) {
    // Stack only
    const pivotData = pivotWider(data, options.xKey, options.stackBy, 'value');

    // @ts-expect-error
    const stackKeys: Array<any> = [...new Set(data.map((d) => d[options.stackBy ?? '']))];
    // @ts-expect-error
    const stackData = stack().keys(stackKeys).order(options.order).offset(options.offset)(
      pivotData
    );

    const result = stackData.flatMap((series) => {
      return series.flatMap((s) => {
        return {
          ...s.data,
          keys: [s.data[options.xKey], series.key],
          values: [s[0], s[1]],
        };
      });
    });

    return result;
  } else {
    // No grouping or stacking.  Aggregate based on `xKey`
    return Array.from(
      rollup(
        data,
        (items) => {
          return {
            // @ts-expect-error
            keys: [items[0][options.xKey]],
            // @ts-expect-error
            values: [0, sum(items, (d) => d.value)],
          };
        },
        // @ts-expect-error
        (d) => d[options.xKey]
      ).values()
    );
  }
}

/**
 * Function to offset each layer by the maximum of the previous layer
 *   - see: https://observablehq.com/@mkfreeman/separated-bar-chart
 */
// TODO: Try to find way to support separated with createStackData() (which has isolated stacked per group)
// @ts-expect-error
export function stackOffsetSeparated(series, order) {
  const gap = 200; // TODO: Determine way to pass in as option (curry?)

  if (!((n = series.length) > 1)) return;

  // Standard series
  for (var i = 1, s0, s1 = series[order[0]], n, m = s1.length; i < n; ++i) {
    (s0 = s1), (s1 = series[order[i]]);
    // @ts-expect-error
    let base = max(s0, (d) => d[1]) + gap; // here is where you calculate the maximum of the previous layer
    for (var j = 0; j < m; ++j) {
      // Set the height based on the data values, shifted up by the previous layer
      let diff = s1[j][1] - s1[j][0];
      s1[j][0] = base;
      s1[j][1] = base + diff;
    }
  }
}
