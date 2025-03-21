import type { Component, ComponentProps } from 'svelte';
import { get } from 'lodash-es';

import type Chart from '../components/Chart.svelte';
import type { SimplifiedChartProps } from 'layerchart/components/charts/types.js';

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
    // @ts-expect-error - TODO can we refine this?
    return data.descendants();
  }
}

export function defaultChartPadding<TData, SeriesComponent extends Component, TSnippetProps>(
  axis: SimplifiedChartProps<TData, SeriesComponent, TSnippetProps>['axis'],
  legend: SimplifiedChartProps<TData, SeriesComponent, TSnippetProps>['legend']
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

/**
 * Find the first instance within `data` with the same value as `original` using prop accessor.
 * Handles complex objects such as `Date` by invoking `.valueOf()`
 */
export function findRelatedData(data: any[], original: any, accessor: Function) {
  return data.find((d) => {
    return accessor(d)?.valueOf() === accessor(original)?.valueOf();
  });
}

export function getTooltipName(
  name: string | number | undefined | unknown,
  accessor: Accessor<any>
): string | undefined {
  if (name) return `${name}`;
  if (typeof accessor === 'string') return accessor;
}
