import type { HierarchyNode } from 'd3-hierarchy';
import type { AnyScale } from './scales.js';
import type { SankeyGraph } from 'd3-sankey';
import type { TransitionConfig } from 'svelte/transition';

/**
 * Useful to workaround Svelte 3/4 markup type issues
 * TODO: Remove usage after migrating to Svelte 5
 */
export function asAny(x: any): any {
  return x;
}

/**
 * Constructs a new type by omitting properties from type
 * 'T' that exist in type 'U'.
 *
 * @template T - The base object type from which properties will be omitted.
 * @template U - The object type whose properties will be omitted from 'T'.
 * @example
 * type Result = Without<{ a: number; b: string; }, { b: string; }>;
 * // Result type will be { a: number; }
 */
export type Without<T extends object, U extends object> = Omit<T, keyof U>;

export type AxisKey = 'x' | 'y' | 'z' | 'r';

export type Extents = {
  [K in AxisKey]?: Array<number | string>;
};

export type Padding = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type Nice = boolean | number;

export type BaseRange =
  | number[]
  | string[]
  | ((args: { width: number; height: number }) => number[] | string[]);

export type YRangeWithScale =
  | number[]
  | string[]
  | ((args: { yScale: AnyScale; width: number; height: number }) => number[] | string[]);

export type XRangeWithScale =
  | number[]
  | string[]
  | ((args: { xScale: AnyScale; width: number; height: number }) => number[] | string[]);

export type FieldAccessors<T> = {
  x?: (d: T) => number | string | (number | string)[];
  y?: (d: T) => number | string | (number | string)[];
  z?: (d: T) => number | string | (number | string)[];
  r?: (d: T) => number | string | (number | string)[];
};

export type PaddingArray = [number, number] | undefined;

export type DataType<T> = T[] | HierarchyNode<T> | SankeyGraph<any, any>;

export type Transition = (node: Element, params?: any) => TransitionConfig;
export type TransitionParams<T extends Transition> = Parameters<T>[1];
