import { get } from 'lodash-es';

export type Accessor<TData = any> =
  | number
  | string
  | ((d: TData) => any)
  | undefined
  | Accessor<TData>[];

export function accessor<TData = any>(prop: Accessor<TData>): (d: TData) => any {
  if (Array.isArray(prop)) {
    return (d: TData) => prop.map((p) => accessor<TData>(p)(d));
  } else if (typeof prop === 'function') {
    // function
    return prop;
  } else if (typeof prop === 'string') {
    // path
    return (d: TData) => get(d, prop);
  } else {
    // return full object
    return (d: TData) => d;
  }
}
