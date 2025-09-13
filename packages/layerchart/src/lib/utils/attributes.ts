import { cls } from '@layerstack/tailwind';

type ExtractObjectType<T> = T extends object ? (T extends Function ? never : T) : never;
type WithClass<T> = T & { class?: string };
type DefaultProps = WithClass<{ [key: string]: any }>;

// type guard to narrow props to an object with optional class
// for extractLayerProps
function isObjectWithClass(val: any): val is { class?: string } {
  return typeof val === 'object' && val !== null && typeof val !== 'function';
}

/**
 * Pulls out the props from an arbitrary object/function/boolean and appends
 * a class name to its class property to identify the layer for CSS targeting.
 *
 * @param props The props to be extracted, can be an object, function or any other type
 * @param className The class name to be applied to the layer for targeting styling (e.g. 'lc-layer')
 * @param extraClasses Additional classes to be applied to the layer if they don't exist in the props already
 * @returns a typed spreadable object with props for the layer
 */
export function extractLayerProps<T>(
  props: T,
  className: string,
  extraClasses?: string
): WithClass<ExtractObjectType<T> extends never ? DefaultProps : ExtractObjectType<T>> {
  if (isObjectWithClass(props)) {
    return {
      ...props,
      class: cls(className, props.class ?? '', extraClasses),
    } as WithClass<ExtractObjectType<T>>;
  }

  return {
    class: cls(className, extraClasses),
  } as WithClass<ExtractObjectType<T> extends never ? DefaultProps : ExtractObjectType<T>>;
}
