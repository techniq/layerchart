import { get } from '@layerstack/utils';
import type { AnyScale } from './scales.svelte.js';
import type { CommonStyleProps } from './types.js';

/**
 * A prop that can be a direct pixel value, a data property name (resolved via scale),
 * or an accessor function (whose result is passed through a scale).
 *
 * - `number` → pixel value (direct, no scale applied)
 * - `string` → data property path, resolved via accessor then passed through scale
 * - `function(d)` → called with data item, result passed through scale
 */
export type DataProp<T = any> = number | string | ((d: T) => any);

/**
 * Returns true if the value is a data-space prop (string or function),
 * meaning it needs scale resolution rather than being a direct pixel value.
 */
export function isDataProp(value: any): value is string | Function {
  return typeof value === 'string' || typeof value === 'function';
}

/**
 * Returns true if ANY of the provided values is a data-space prop.
 * Used to detect whether a component should enter "data mode".
 */
export function hasAnyDataProp(...values: any[]): boolean {
  return values.some((v) => v !== undefined && isDataProp(v));
}

/**
 * Resolves a DataProp value for a specific data item through a scale.
 *
 * - `number`: returned directly (pixel value, no scale)
 * - `string`: used as property path on data item, result passed through scale
 * - `function`: called with data item, result passed through scale
 * - `undefined`/`null`: returns defaultValue
 *
 * If no scale is provided and the raw value is numeric, it passes through directly.
 */
export function resolveDataProp<T>(
  value: DataProp<T> | undefined | null,
  d: T,
  scale: AnyScale | null | undefined,
  defaultValue: number = 0
): number {
  if (value === undefined || value === null) return defaultValue;
  if (typeof value === 'number') return value;

  let rawValue: any;
  if (typeof value === 'string') {
    rawValue = get(d, value);
  } else if (typeof value === 'function') {
    rawValue = value(d);
  } else {
    return defaultValue;
  }

  if (scale) {
    const result = scale(rawValue);
    return typeof result === 'number' && isFinite(result) ? result : defaultValue;
  }

  // No scale: if raw value is a number, use it directly
  return typeof rawValue === 'number' ? rawValue : defaultValue;
}

/**
 * Extract the raw value from a DataProp without applying any scale.
 * Numbers pass through, strings do property lookup, functions are called.
 */
export function extractRawDataValue<T>(
  value: DataProp<T> | undefined | null,
  d: T
): any {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return get(d, value);
  if (typeof value === 'function') return value(d);
  return undefined;
}

/**
 * Resolve a pair of x/y DataProps through a geo projection.
 * x = longitude, y = latitude → projection([lon, lat]) → [px, py]
 */
export function resolveGeoDataPair<T>(
  xProp: DataProp<T> | undefined | null,
  yProp: DataProp<T> | undefined | null,
  d: T,
  projection: (coords: [number, number]) => [number, number] | null,
  defaults: [number, number] = [0, 0]
): [number, number] {
  const rawX = extractRawDataValue(xProp, d);
  const rawY = extractRawDataValue(yProp, d);
  if (rawX == null || rawY == null) return defaults;
  const result = projection([rawX, rawY]);
  return result ?? defaults;
}

/**
 * A color prop that can be a literal CSS color string, a data property name
 * (resolved through cScale), or an accessor function (result passed through cScale).
 *
 * - `string` → in data mode, if it matches a data property, the value is extracted
 *   and passed through cScale. Otherwise used as a literal CSS color.
 * - `function(d)` → called per data item, result passed through cScale.
 */
export type ColorProp<T = any> = string | ((d: T) => any);

/**
 * A style prop that can be a static value or a per-item accessor function.
 * In data mode, if a function is provided, it is called with the data item.
 */
export type StyleProp<V, T = any> = V | ((d: T) => V);

/**
 * Style props for primitives that support data-driven styling.
 * All style props accept either a static value or a per-item accessor function.
 */
export type DataDrivenStyleProps<T = any> = {
  /**
   * The fill color.
   * - `string`: in data mode, if it matches a data property name, the value is
   *   extracted and passed through cScale. Otherwise used as a literal CSS color.
   * - `function(d)`: accessor called per data item, result passed through cScale.
   */
  fill?: ColorProp<T>;

  /**
   * The stroke color.
   * - `string`: in data mode, if it matches a data property name, the value is
   *   extracted and passed through cScale. Otherwise used as a literal CSS color.
   * - `function(d)`: accessor called per data item, result passed through cScale.
   */
  stroke?: ColorProp<T>;

  /**
   * The fill opacity (0 to 1).
   * - `number`: static value
   * - `function(d)`: accessor called per data item
   */
  fillOpacity?: StyleProp<number | undefined, T>;

  /**
   * The stroke opacity (0 to 1).
   * - `number`: static value
   * - `function(d)`: accessor called per data item
   */
  strokeOpacity?: StyleProp<number | undefined, T>;

  /**
   * The stroke width.
   * - `number`: static value
   * - `function(d)`: accessor called per data item
   */
  strokeWidth?: StyleProp<number | undefined, T>;

  /**
   * The opacity (0 to 1).
   * - `number`: static value
   * - `function(d)`: accessor called per data item
   */
  opacity?: StyleProp<number | undefined, T>;

  /**
   * CSS class name(s).
   * - `string`: static class string
   * - `function(d)`: accessor called per data item, returns class string
   */
  class?: StyleProp<string | undefined, T>;
};

/**
 * Resolves a ColorProp for a specific data item, optionally through a color scale.
 *
 * - `string`: checks if `get(d, value)` is defined → data property, passed through cScale.
 *   Otherwise returns the string as a literal CSS color.
 * - `function`: called with data item, result passed through cScale.
 * - `undefined`/`null`: returns undefined.
 */
/**
 * Returns true if the string looks like a CSS color value rather than a data property name.
 * Matches: `#hex`, and functional notation like `rgb(...)`, `hsl(...)`, `var(...)`,
 * `url(...)`, `color-mix(...)`, etc.
 */
function isCSSColor(value: string): boolean {
  return value.startsWith('#') || value.includes('(');
}

export function resolveColorProp<T>(
  value: ColorProp<T> | undefined | null,
  d: T,
  cScale: AnyScale | null | undefined,
  ...args: any[]
): string | undefined {
  if (value === undefined || value === null) return undefined;

  if (typeof value === 'function') {
    const rawValue = (value as Function)(d, ...args);
    if (rawValue === undefined || rawValue === null) return undefined;
    return cScale ? String(cScale(rawValue)) : String(rawValue);
  }

  if (typeof value === 'string') {
    // CSS color literals are never data property lookups
    if (isCSSColor(value)) return value;

    const dataValue = get(d, value);
    if (dataValue !== undefined) {
      // Data property — resolve through cScale
      return cScale ? String(cScale(dataValue)) : String(dataValue);
    }
    // Not a data property — treat as literal CSS color (e.g. named colors like 'red')
    return value;
  }

  return undefined;
}

/**
 * Resolves a StyleProp for a specific data item.
 * If the value is a function, calls it with the data item.
 * Otherwise returns the static value.
 */
export function resolveStyleProp<V, T>(
  value: StyleProp<V, T> | undefined,
  d: T,
  ...args: any[]
): V | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'function') return (value as Function)(d, ...args);
  return value;
}
