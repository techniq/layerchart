import { accessor } from 'layerchart';

/**
 * A prop that's a value, a function of the row, or the name of the row's field holding it, as
 * LayerChart's `DataProp`s: `tilt="tilt"` reads each row's `tilt`, as `tilt={(d) => d.tilt}` does
 */
export type ValueProp<T> = T | string | ((d: any) => T);

/** Each field name's reader, made once rather than per row */
const readers = new Map<string, (d: any) => any>();
function field(name: string) {
  let read = readers.get(name);
  if (!read) readers.set(name, (read = accessor(name)));
  return read;
}

/** `prop` for row `d`: called with it when a function, the row's field when a string, else as is */
export function valueOf<T>(prop: ValueProp<T>, d: any): T {
  if (typeof prop === 'function') return (prop as (d: any) => T)(d);
  if (typeof prop === 'string') return field(prop)(d);
  return prop;
}

/**
 * `prop` for row `d`, where a value can itself be a string (ex. an image's URL): a string is the
 * row's field when the row has one by that name, else the value itself when `isValue` says it
 * looks like one (`"earth.jpg"`), else nothing (`"image"`, on a row without that field)
 */
export function fieldOrValueOf<T>(
  prop: ValueProp<T>,
  d: any,
  isValue: (value: string) => boolean
): T | undefined {
  if (typeof prop === 'string') {
    const value = field(prop)(d);
    if (value !== undefined) return value;
    return isValue(prop) ? (prop as T) : undefined;
  }
  return valueOf(prop, d);
}

/**
 * Whether a string looks like an image's URL rather than a field name (or a path to one, ex.
 * `planet.image`): a path, a scheme, or an image file's name
 */
export function isUrl(value: string) {
  return /[/:]|\.(png|jpe?g|gif|webp|avif|svg|bmp)$/i.test(value);
}

/**
 * A `z` prop as `[base, top]` heights in pixels: a number is a height from the floor, and a pair
 * floats between two
 */
export function heights(z: number | [number, number]): [number, number] {
  return Array.isArray(z) ? [Math.min(z[0], z[1]), Math.max(z[0], z[1])] : [0, z];
}
