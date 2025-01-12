import type { ComponentProps } from 'svelte';
import { get } from 'lodash-es';

import type Chart from '../components/Chart.svelte';
import type LineChart from '../components/charts/LineChart.svelte';

export type Accessor<TData = any> =
  | number
  | string
  | ((d: TData) => any)
  | undefined
  | null
  | Accessor<TData>[];

export function accessor<TData = any>(prop: Accessor<TData>): (d: TData) => any {
  if (Array.isArray(prop)) {
    return (d: TData) => prop.map((p) => accessor<TData>(p)(d));
  } else if (typeof prop === 'function') {
    // function
    return prop;
  } else if (typeof prop === 'string' || typeof prop === 'number') {
    // path string or number (array index)
    return (d: TData) => get(d, prop);
  } else {
    // return full object
    return (d: TData) => d;
  }
}

/** Guarantee chart data is an array */
export function chartDataArray<TData = any>(data: ComponentProps<Chart<TData>>['data']) {
  if (data == null) {
    return [];
  } else if (Array.isArray(data)) {
    return data;
  } else if ('nodes' in data) {
    return data.nodes;
  } else {
    return data.descendants();
  }
}

// Using LineChart but could any simplified chart
type SimplifiedChartProps = ComponentProps<LineChart<any>>;

export function defaultChartPadding(
  axis: SimplifiedChartProps['axis'],
  legend: SimplifiedChartProps['legend']
) {
  if (axis === false) {
    return undefined;
  } else {
    return {
      top: axis === true || axis === 'y' ? 4 : 0,
      left: axis === true || axis === 'y' ? 20 : 0,
      bottom: (axis === true || axis === 'x' ? 20 : 0) + (legend === true ? 32 : 0),
      right: axis === true || axis === 'x' ? 4 : 0,
    };
  }
}
