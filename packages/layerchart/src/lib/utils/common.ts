import type { Component, ComponentProps } from 'svelte';
import { get } from '@layerstack/utils';

import type Chart from '../components/Chart.svelte';
import type { SimplifiedChartProps } from '$lib/components/charts/types.js';

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
  } else if ('descendants' in data) {
    return data.descendants();
  }
  return [];
}

export function defaultChartPadding<TData, SeriesComponent extends Component, TSnippetProps>(
  options:
    | {
        axis?: SimplifiedChartProps<TData, SeriesComponent, TSnippetProps>['axis'];
        legend?: SimplifiedChartProps<TData, SeriesComponent, TSnippetProps>['legend'];
        top?: number;
        left?: number;
        bottom?: number;
        right?: number;
      }
    | undefined = {}
) {
  const { axis = true, legend = false, top, left, bottom, right } = options;

  if (axis === false) {
    return undefined;
  }

  return {
    top: top ?? (axis === true || axis === 'y' ? 4 : 0),
    left: left ?? (axis === true || axis === 'y' ? 20 : 0),
    bottom: bottom ?? (axis === true || axis === 'x' ? 20 : 0) + (legend ? 32 : 0),
    right: right ?? (axis === true || axis === 'x' ? 4 : 0),
  };
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

/**
 * Return the object if the value is an object, otherwise return null.
 * Functions (including Snippet types) are treated as non-objects and return null.
 */
export function getObjectOrNull<T>(
  value: T
): T extends object
  ? T extends Function
    ? null
    : T
  : T extends null
    ? null
    : T extends undefined
      ? undefined
      : null {
  if (typeof value === 'object') return value as any;
  if (value === undefined) return undefined as any;
  return null as any;
}

/**
 * Call with args if function, otherwise return the value.
 */
export function resolveMaybeFn<T>(value: T | ((...args: any[]) => T), ...args: any[]) {
  return typeof value === 'function' ? (value as Function)(...args) : value;
}
