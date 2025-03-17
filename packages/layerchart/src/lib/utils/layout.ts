import type { DomainType } from './scales.svelte.js';
import type {
  AxisKey,
  BaseRange,
  DataType,
  Extents,
  FieldAccessors,
  Nice,
  PaddingArray,
} from './types.js';
import type { AnyScale } from './scales.svelte.js';
import { arraysEqual } from './array.js';
import { toTitleCase } from './string.js';
import { InternSet } from 'd3-array';

type DomainFunction = (extent: number[]) => Array<number | null>;
type DomainArray = Array<number | null>;

type NormalizeArray<T> =
  T extends Array<infer U> ? (U extends string | number ? number[] : never) : never;

function normalizeExtent(values: Array<number | string> | undefined): number[] {
  if (!values) return [0, 0];

  return values.map((value): number => {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : 0;
    }
    if (typeof value === 'string') {
      const num = Number(value);
      return Number.isNaN(num) ? 0 : num;
    }
    return 0;
  });
}

/**
 * Creates a function to calculate a domain based on extents and a domain directive.
 * @param s The key (e.g., 'x', 'y') to look up in the extents object
 * @returns A function that computes the final domain from extents and a domain input
 */
export function calcDomain<K extends AxisKey>(
  s: K,
  extents: Extents,
  domain: DomainType | undefined
): number[] {
  let resolvedDomain: Array<number | null> | undefined;

  if (typeof domain === 'function') {
    const extentNumbers = normalizeExtent(extents?.[s as K]);
    resolvedDomain = (domain as DomainFunction)(extentNumbers);
  } else {
    resolvedDomain = domain as DomainArray | undefined;
  }

  if (extents?.[s as K]) {
    return partialDomain(
      normalizeExtent(extents[s as K]) as NormalizeArray<Extents[K]>,
      resolvedDomain
    );
  }

  return (resolvedDomain?.map((d): number => d ?? 0) ?? [0, 0]) as number[];
}

/**
 * If we have a domain from settings (the directive), fill in
 * any null values with ones from our measured extents;
 * otherwise, return the measured extent.
 * @param domain A two-value array of numbers representing the measured extent
 * @param directive A two-value array of numbers or nulls that will have any nulls filled in from the `domain` array
 * @returns A two-value array of numbers representing the filled-in domain
 */
export function partialDomain(domain: number[] = [], directive?: Array<number | null>): number[] {
  if (Array.isArray(directive) && directive.length === 2) {
    return directive.map((d, i) => (d === null ? domain[i] : d));
  }
  return domain;
}

type CreateLayerCakeScaleOpts = {
  domain: number[];
  extents: Extents;
  scale: AnyScale & {
    interpolator?: () => { name: string };
    nice?: (nice?: number) => void;
  };
  padding: PaddingArray | undefined;
  nice: Nice;
  reverse: boolean;
  width: number;
  height: number;
  range: BaseRange | undefined;
  percentRange: boolean;
};

export function createLayerCakeScale(
  axis: AxisKey,
  {
    domain,
    extents,
    scale,
    padding,
    nice,
    reverse,
    width,
    height,
    range,
    percentRange,
  }: CreateLayerCakeScaleOpts
): AnyScale {
  const defaultRange = getDefaultRange(axis, width, height, reverse, range, percentRange);
  const trueScale = scale.copy();

  /* --------------------------------------------
   * Set the domain
   */
  trueScale.domain(domain);

  /* --------------------------------------------
   * Set the range of the scale to our default if
   * the scale doesn't have an interpolator function
   * or if it does, still set the range if that function
   * is the default identity function
   */
  if (
    !trueScale.interpolator ||
    (typeof trueScale.interpolator === 'function' &&
      trueScale.interpolator().name.startsWith('identity'))
  ) {
    trueScale.range(defaultRange);
  }

  if (padding) {
    trueScale.domain(padScale(scale, padding));
  }

  if (nice === true || typeof nice === 'number') {
    if (typeof trueScale.nice === 'function') {
      trueScale.nice(typeof nice === 'number' ? nice : undefined);
    } else {
      console.error(
        `[Layer Chart] You set \`${axis}Nice: true\` but the ${axis}Scale does not have a \`.nice\` method. Ignoring...`
      );
    }
  }

  return trueScale;
}

// These scales have a discrete range so they can't be padded
const unpaddable = ['scaleThreshold', 'scaleQuantile', 'scaleQuantize', 'scaleSequentialQuantile'];

export function padScale(scale: AnyScale, padding: PaddingArray | undefined) {
  if (typeof scale.range !== 'function') {
    throw new Error('Scale method `range` must be a function');
  }
  if (typeof scale.domain !== 'function') {
    throw new Error('Scale method `domain` must be a function');
  }

  if (!Array.isArray(padding) || unpaddable.includes(findScaleName(scale))) {
    return scale.domain();
  }

  if (isOrdinalDomain(scale) === true) return scale.domain();

  const { lift, ground } = getPadFunctions(scale);

  const d0 = scale.domain()[0];

  const isTime = Object.prototype.toString.call(d0) === '[object Date]';

  const [d1, d2] = scale.domain().map((d) => {
    return isTime ? lift(d.getTime()) : lift(d);
  });

  const [r1, r2] = scale.range();
  const paddingLeft = padding[0] || 0;
  const paddingRight = padding[1] || 0;

  const step = (d2 - d1) / (Math.abs(r2 - r1) - paddingLeft - paddingRight);

  return [d1 - paddingLeft * step, paddingRight * step + d2].map((d) => {
    return isTime ? ground(new Date(d).getTime()) : ground(d);
  });
}

function f(name: string, modifier = '') {
  return `scale${toTitleCase(modifier)}${toTitleCase(name)}`;
}

/**
 * Get a D3 scale name
 * https://svelte.dev/repl/ec6491055208401ca41120c9c8a67737?version=3.49.0
 */
export function findScaleName(scale: any) {
  /**
   * Ordinal scales
   */
  // scaleBand, scalePoint
  // @ts-ignore
  if (typeof scale.bandwidth === 'function') {
    // @ts-ignore
    if (typeof scale.paddingInner === 'function') {
      return f('band');
    }
    return f('point');
  }
  // scaleOrdinal
  if (arraysEqual(Object.keys(scale), ['domain', 'range', 'unknown', 'copy'])) {
    return f('ordinal');
  }

  /**
   * Sequential versus diverging
   */
  let modifier = '';
  // @ts-ignore
  if (scale.interpolator) {
    // @ts-ignore
    if (scale.domain().length === 3) {
      modifier = 'diverging';
    } else {
      modifier = 'sequential';
    }
  }

  /**
   * Continuous scales
   */
  // @ts-ignore
  if (scale.quantiles) {
    return f('quantile', modifier);
  }
  // @ts-ignore
  if (scale.thresholds) {
    return f('quantize', modifier);
  }
  // @ts-ignore
  if (scale.constant) {
    return f('symlog', modifier);
  }
  // @ts-ignore
  if (scale.base) {
    return f('log', modifier);
  }
  // @ts-ignore
  if (scale.exponent) {
    // @ts-ignore
    if (scale.exponent() === 0.5) {
      return f('sqrt', modifier);
    }
    return f('pow', modifier);
  }

  if (arraysEqual(Object.keys(scale), ['domain', 'range', 'invertExtent', 'unknown', 'copy'])) {
    return f('threshold');
  }

  if (
    arraysEqual(Object.keys(scale), [
      'invert',
      'range',
      'domain',
      'unknown',
      'copy',
      'ticks',
      'tickFormat',
      'nice',
    ])
  ) {
    return f('identity');
  }

  if (
    arraysEqual(Object.keys(scale), [
      'invert',
      'domain',
      'range',
      'rangeRound',
      'round',
      'clamp',
      'unknown',
      'copy',
      'ticks',
      'tickFormat',
      'nice',
    ])
  ) {
    return f('radial');
  }

  if (modifier) {
    return f(modifier);
  }

  /**
   * Test for scaleTime vs scaleUtc
   * https://github.com/d3/d3-scale/pull/274#issuecomment-1462935595
   */
  if (scale.domain()[0] instanceof Date) {
    const d = new Date();
    let s: string = '';
    // @ts-ignore
    d.getDay = () => (s = 'time');
    // @ts-ignore
    d.getUTCDay = () => (s = 'utc');

    scale.tickFormat(0, '%a')(d);
    return f(s);
  }

  return f('linear');
}

/** Determine whether a scale has an ordinal domain
 * https://svelte.dev/repl/ec6491055208401ca41120c9c8a67737?version=3.49.0
 * @param  scale A D3 scale
 * @returns Whether the scale is an ordinal scale
 */
export function isOrdinalDomain(scale: AnyScale) {
  // scaleBand, scalePoint
  if (typeof scale.bandwidth === 'function') return true;
  // scaleOrdinal
  if (arraysEqual(Object.keys(scale), ['domain', 'range', 'unknown', 'copy'])) {
    return true;
  }
  return false;
}

interface ScaleInfo {
  scale: AnyScale;
  sort?: boolean;
}

interface ActiveScales {
  [key: string]: ScaleInfo;
}

interface ScaleGroups<T> {
  ordinal: FieldAccessors<T> | false;
  other: FieldAccessors<T> | false;
}

/**
 * Calculates scale extents for given data and scales
 * @template T The type of data objects in the input array
 * @param {T[]} flatData Array of data objects
 * @param {FieldAccessors<T>} getters Field accessor functions
 * @param {ActiveScales} activeScales Object containing scale information
 * @returns {Extents} Calculated extents for each scale
 */
export function calcScaleExtents<T>(
  flatData: DataType<T>,
  getters: FieldAccessors<T>,
  activeScales: ActiveScales
): UniqueResults {
  // group scales by domain type (ordinal vs other)
  const scaleGroups = Object.entries(activeScales).reduce<ScaleGroups<T>>(
    (groups, [key, scaleInfo]) => {
      const domainType = isOrdinalDomain(scaleInfo.scale) ? 'ordinal' : 'other';

      if (!groups[domainType]) {
        groups[domainType] = {};
      }

      (groups[domainType] as FieldAccessors<T>)[key as keyof FieldAccessors<T>] =
        getters[key as keyof FieldAccessors<T>];

      return groups;
    },
    { ordinal: false, other: false }
  );

  let extents: UniqueResults = {};

  // ordinal scales
  if (scaleGroups.ordinal) {
    const sortOptions = Object.fromEntries(
      Object.entries(activeScales).map(([key, scaleInfo]) => [
        key,
        scaleInfo.sort ?? false, // default to false if sort is undefined
      ])
    );
    extents = calcUniques(flatData, scaleGroups.ordinal, sortOptions);
  }

  // other scales
  if (scaleGroups.other) {
    const otherExtents = calcExtents(flatData, scaleGroups.other);
    extents = { ...extents, ...otherExtents };
  }

  return extents;
}

interface SortOptions {
  sort?: boolean;
  x?: boolean;
  y?: boolean;
  z?: boolean;
  r?: boolean;
}

export interface UniqueResults {
  x?: (number | string)[];
  y?: (number | string)[];
  z?: (number | string)[];
  r?: (number | string)[];
}

/**
 * Calculate the unique values of desired fields
 * For example, data like this: [{ x: 0, y: -10 }, { x: 10, y: 0 }, { x: 5, y: 10 }]
 * and a fields object like this: {'x': d => d.x, 'y': d => d.y}
 * returns an object like this: { x: [0, 10, 5], y: [-10, 0, 10] }
 *
 * @template T The type of data objects in the input array
 * @param  data A flat array of data objects
 * @param  fields An object containing accessor functions for fields
 * @param  [sortOptions={}] Sorting options for the results
 * @returns  An object with unique values for each specified field
 * @throws {TypeError} If data is not an array or fields is not a valid object
 */
export function calcUniques<T>(
  data: DataType<T>,
  fields: FieldAccessors<T>,
  sortOptions: SortOptions = {}
): UniqueResults {
  if (!Array.isArray(data)) {
    throw new TypeError(
      `The first argument of calcUniques() must be an array. You passed in a ${typeof data}. If you got this error using the <LayerCake> component, consider passing a flat array to the \`flatData\` prop. More info: https://layercake.graphics/guide/#flatdata`
    );
  }

  if (Array.isArray(fields) || fields === undefined || fields === null) {
    throw new TypeError(
      'The second argument of calcUniques() must be an object with field names as keys and accessor functions as values.'
    );
  }

  const uniques: UniqueResults = {};
  const keys = Object.keys(fields) as (keyof FieldAccessors<T>)[];

  for (const key of keys) {
    const set = new InternSet<number | string>();
    const accessor = fields[key];

    if (!accessor) continue;

    for (const item of data) {
      const value = accessor(item);

      if (Array.isArray(value)) {
        value.forEach((val) => set.add(val));
      } else {
        set.add(value);
      }
    }

    const results = Array.from(set);
    if (sortOptions.sort === true || sortOptions[key as keyof SortOptions] === true) {
      results.sort((a, b) => {
        // type-safe sorting for both numbers and strings
        if (typeof a === 'number' && typeof b === 'number') {
          return a - b;
        }
        return String(a).localeCompare(String(b));
      });
    }

    uniques[key] = results;
  }

  return uniques;
}

function calcBaseRange(
  s: AxisKey,
  width: number,
  height: number,
  reverse: boolean,
  percentRange: boolean
): number[] {
  let min: number;
  let max: number;

  if (percentRange === true) {
    min = 0;
    max = 100;
  } else {
    min = s === 'r' ? 1 : 0;
    max = s === 'y' ? height : s === 'r' ? 25 : width;
  }

  return reverse === true ? [max, min] : [min, max];
}

export function getDefaultRange(
  s: AxisKey,
  width: number,
  height: number,
  reverse: boolean,
  range?: BaseRange,
  percentRange: boolean = false
): number[] | string[] {
  if (!range) {
    return calcBaseRange(s, width, height, reverse, percentRange);
  }

  if (typeof range === 'function') {
    return range({ width, height });
  }

  return range;
}

// Define possible scale types
type ScaleType = 'log' | 'symlog' | 'pow' | 'sqrt' | 'other';

export function identity<T>(d: T): T {
  return d;
}

type ScaleWithProps = AnyScale & {
  constant?: number;
  base?: () => number;
  exponent?: () => number;
  domain: () => number[];
};

export function findScaleType(scale: ScaleWithProps): ScaleType {
  if (typeof scale.constant === 'number') {
    return 'symlog';
  }
  if (typeof scale.base === 'function') {
    return 'log';
  }
  if (typeof scale.exponent === 'function') {
    const expValue = scale.exponent();
    if (expValue === 0.5) {
      return 'sqrt';
    }
    return 'pow';
  }
  return 'other';
}

// Type for transformation functions
interface TransformFunctions {
  lift: (x: number) => number;
  ground: (x: number) => number;
  scaleType: ScaleType;
}

// Helper functions with explicit types
function log(sign: number): (x: number) => number {
  return (x: number): number => Math.log(sign * x);
}

function exp(sign: number): (x: number) => number {
  return (x: number): number => sign * Math.exp(x);
}

function symlog(c: number): (x: number) => number {
  return (x: number): number => Math.sign(x) * Math.log1p(Math.abs(x / c));
}

function symexp(c: number): (x: number) => number {
  return (x: number): number => Math.sign(x) * Math.expm1(Math.abs(x)) * c;
}

function pow(exponent: number): (x: number) => number {
  return function powFn(x: number): number {
    return x < 0 ? -Math.pow(-x, exponent) : Math.pow(x, exponent);
  };
}

// Main function with proper typing
export function getPadFunctions(scale: ScaleWithProps): TransformFunctions {
  const scaleType = findScaleType(scale);

  switch (scaleType) {
    case 'log': {
      const domain = scale.domain();
      const sign = Math.sign(domain[0] || 1); // Default to 1 if domain[0] is 0
      return { lift: log(sign), ground: exp(sign), scaleType };
    }
    case 'pow': {
      const exponent = scale.exponent ? scale.exponent() : 1;
      return {
        lift: pow(exponent),
        ground: pow(1 / exponent),
        scaleType,
      };
    }
    case 'sqrt': {
      const exponent = 0.5;
      return {
        lift: pow(exponent),
        ground: pow(1 / exponent),
        scaleType,
      };
    }
    case 'symlog': {
      const constant = typeof scale.constant === 'number' ? scale.constant : 1;
      return {
        lift: symlog(constant),
        ground: symexp(constant),
        scaleType,
      };
    }
    default:
      return {
        lift: identity<number>,
        ground: identity<number>,
        scaleType,
      };
  }
}

export function createGetter<TData>(accessor: (d: TData) => any, scale: AnyScale | null) {
  return (d: TData) => {
    const val = accessor(d);
    if (!scale) return undefined;
    if (Array.isArray(val)) {
      return val.map((v) => scale(v));
    }
    return scale(val);
  };
}

/**
 * Calculate the extents of desired fields, skipping `false`, `undefined`, `null` and `NaN` values
 * For example, data like this:
 * [{ x: 0, y: -10 }, { x: 10, y: 0 }, { x: 5, y: 10 }]
 * and a fields object like this:
 * `{'x': d => d.x, 'y': d => d.y}`
 * returns an object like this:
 * `{ x: [0, 10], y: [-10, 10] }`
 * @param data A flat array of objects.
 * @param fields An object containing `x`, `y`, `r` or `z` keys that equal an accessor function.
 * @returns An object with the same structure as `fields` but with min/max arrays.
 */
export function calcExtents<T>(data: DataType<T>, fields: FieldAccessors<T>): UniqueResults {
  if (!Array.isArray(data)) {
    throw new TypeError(
      `The first argument of calcExtents() must be an array. You passed in a ${typeof data}. If you got this error using the <LayerCake> component, consider passing a flat array to the \`flatData\` prop. More info: https://layercake.graphics/guide/#flatdata`
    );
  }

  if (Array.isArray(fields) || fields === undefined || fields === null) {
    throw new TypeError(
      'The second argument of calcExtents() must be an ' +
        'object with field names as keys as accessor functions as values.'
    );
  }

  const extents: UniqueResults = {};

  const keys = Object.keys(fields) as (keyof FieldAccessors<T>)[];
  const kl = keys.length;
  let i: number;
  let j: number;
  let k: number;
  let s: keyof FieldAccessors<T>;
  let min: number | string | null;
  let max: number | string | null;
  let acc: ((d: T) => number | string | (number | string)[]) | undefined;
  let val: number | string | (number | string)[] | undefined;

  const dl = data.length;
  for (i = 0; i < kl; i += 1) {
    s = keys[i];
    acc = fields[s];
    min = null;
    max = null;

    if (!acc) continue; // Skip if accessor is undefined

    for (j = 0; j < dl; j += 1) {
      val = acc(data[j]);

      if (Array.isArray(val)) {
        const vl = val.length;
        for (k = 0; k < vl; k += 1) {
          if (
            val[k] !== undefined &&
            val[k] !== null &&
            (typeof val[k] === 'string' || Number.isNaN(val[k]) === false)
          ) {
            if (min === null || val[k] < min) {
              min = val[k];
            }
            if (max === null || val[k] > max) {
              max = val[k];
            }
          }
        }
      } else if (
        val !== undefined &&
        val !== null &&
        (typeof val === 'string' || Number.isNaN(val) === false)
      ) {
        if (min === null || val < min) {
          min = val;
        }
        if (max === null || val > max) {
          max = val;
        }
      }
    }
    extents[s] = [min as string | number, max as string | number];
  }

  return extents;
}

/**
 * Move an element to the last child of its parent.
 * Adapted from d3-selection `.raise`
 */
export function raise(node: Element) {
  if (node.nextSibling) {
    node.parentNode?.appendChild(node);
  }
}

/**
 * Flatten arrays of arrays one level deep
 * @param list The list to flatten
 * @param accessor An optional accessor function or string property key
 * @returns Flattened array
 */
export default function flatten<T, U>(
  list: T[],
  accessor: string | ((item: T) => U[]) = (d: T) => d as unknown as U[]
): U[] {
  // type the accessor function based on input
  const acc: (item: T) => U[] =
    typeof accessor === 'string' ? (d: T) => d[accessor as keyof T] as U[] : accessor;

  // check if list is array and first element through accessor is array
  const firstElement = list[0] && acc(list[0]);
  if (Array.isArray(list) && Array.isArray(firstElement)) {
    let flat: U[] = [];
    const l = list.length;
    for (let i = 0; i < l; i += 1) {
      flat = flat.concat(acc(list[i]));
    }
    return flat;
  }

  // type assertion here since we know list contains U[] if not flattened
  return list as unknown as U[];
}
