import type { AnyScale } from './scales.js';

export function createGetter<TData>(accessor: (d: TData) => any, scale: AnyScale) {
  return (d: TData) => {
    const val = accessor(d);
    if (Array.isArray(val)) {
      return val.map((v) => scale(v));
    }
    return scale(val);
  };
}
