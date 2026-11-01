/** A prop that's a value, or a function of the row */
export type ValueProp<T> = T | ((d: any) => T);

/** `prop` for row `d`: called with it when a function, else as is */
export function valueOf<T>(prop: ValueProp<T>, d: any): T {
  return typeof prop === 'function' ? (prop as (d: any) => T)(d) : prop;
}

/**
 * A `z` prop as `[base, top]` heights in pixels: a number is a height from the floor, and a pair
 * floats between two
 */
export function heights(z: number | [number, number]): [number, number] {
  return Array.isArray(z) ? [Math.min(z[0], z[1]), Math.max(z[0], z[1])] : [0, z];
}
