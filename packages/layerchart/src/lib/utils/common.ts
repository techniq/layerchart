import type Chart from '../components/Chart.svelte';
import { get } from 'lodash-es';
import type { ComponentProps } from 'svelte';

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
  } else if (typeof prop === 'string') {
    // path string
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
