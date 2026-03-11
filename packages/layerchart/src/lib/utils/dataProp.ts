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
 * A color prop that can be a literal CSS color string, a data property name
 * (resolved through cScale), or an accessor function (result passed through cScale).
 *
 * - `string` → in data mode, if it matches a data property, the value is extracted
 *   and passed through cScale. Otherwise used as a literal CSS color.
 * - `function(d)` → called per data item, result passed through cScale.
 */
export type ColorProp<T = any> = string | ((d: T) => any);

/**
 * Style props for primitives that support data-driven fill/stroke.
 * Overrides `fill` and `stroke` from CommonStyleProps to accept ColorProp.
 */
export type DataDrivenStyleProps<T = any> = Omit<CommonStyleProps, 'fill' | 'stroke'> & {
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
};

/**
 * Resolves a ColorProp for a specific data item, optionally through a color scale.
 *
 * - `string`: checks if `get(d, value)` is defined → data property, passed through cScale.
 *   Otherwise returns the string as a literal CSS color.
 * - `function`: called with data item, result passed through cScale.
 * - `undefined`/`null`: returns undefined.
 */
export function resolveColorProp<T>(
  value: ColorProp<T> | undefined | null,
  d: T,
  cScale: AnyScale | null | undefined
): string | undefined {
  if (value === undefined || value === null) return undefined;

  if (typeof value === 'function') {
    const rawValue = value(d);
    if (rawValue === undefined || rawValue === null) return undefined;
    return cScale ? String(cScale(rawValue)) : String(rawValue);
  }

  if (typeof value === 'string') {
    const dataValue = get(d, value);
    if (dataValue !== undefined) {
      // Data property — resolve through cScale
      return cScale ? String(cScale(dataValue)) : String(dataValue);
    }
    // Not a data property — literal CSS color
    return value;
  }

  return undefined;
}
