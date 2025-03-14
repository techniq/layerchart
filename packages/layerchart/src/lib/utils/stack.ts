import { flatGroup, group, max, rollup, sum } from 'd3-array';
import { stack } from 'd3-shape';
import { pivotWider } from './pivot.js';

type OrderType = typeof import('d3-shape').stackOrderNone; // all orders share the same API
type OffsetType = typeof import('d3-shape').stackOffsetNone; // all offsets share the same API

export function groupStackData<TData>(
  data: TData[],
  options: {
    xKey: string;
    groupBy?: string;
    stackBy?: string;
    order?: OrderType;
    offset?: OffsetType;
  }
): {
  keys: Record<string, any>; // TODO: Improve type based on key, groupBy, and stackBy values
  values: number[];
}[] {
  const dataByKey = group(data, (d: any) => d[options.xKey]);

  if (options.groupBy) {
    // Group then Stack (if needed)
    const groupedData = flatGroup(
      data,
      (d: any) => d[options.xKey],
      (d: any) => d[options.groupBy ?? '']
    );

    const result = groupedData.flatMap((d, i) => {
      const groupKeys = d.slice(0, -1); // all but last item
      const groupData = d.slice(-1)[0]; // last item

      const pivotData = pivotWider(groupData, options.xKey, options.stackBy ?? '', 'value');

      const stackKeys: Array<any> = [
        ...new Set(groupData.map((d: any) => d[options.stackBy ?? ''])),
      ];
      // @ts-expect-error
      const stackData = stack().keys(stackKeys).order(options.order).offset(options.offset)(
        pivotData
      );

      return stackData.flatMap((series) => {
        return series.flatMap((s) => {
          const keys = {
            [options.xKey]: groupKeys[0],
            [options.groupBy ?? '']: groupKeys[1],
          };
          if (options.stackBy) {
            keys[options.stackBy] = series.key;
          }

          const value = sum(groupData, (d: any) => d.value);

          return {
            ...keys,
            keys,
            value,
            values: options.stackBy ? [s[0], s[1]] : [0, value],
            data: dataByKey.get(keys[options.xKey]),
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
        const keys = {
          [options.xKey]: s.data[options.xKey],
          [options.stackBy ?? '']: series.key,
        };
        return {
          ...keys,
          keys,
          value: s[1] - s[0],
          values: [s[0], s[1]],
          data: dataByKey.get(keys[options.xKey]),
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
          // @ts-expect-error
          const keys = { [options.xKey]: items[0][options.xKey] };
          const value = sum(items, (d: any) => d.value);
          return {
            ...keys,
            keys,
            value,
            values: [0, value],
            data: dataByKey.get(keys[options.xKey]),
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
// TODO: Try to find way to support separated with groupStackData() (which has isolated stacked per group)
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
