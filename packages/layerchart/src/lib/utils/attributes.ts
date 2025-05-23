import { cls } from '@layerstack/tailwind';

/**
 * Creates a string containing a class name that can be used by
 * developers to target a specific layer/element within a LayerChart.
 *
 * This is a function so that the class names remain consistent and the
 * prefix/structure can be changed in the future if needed
 *
 * @param layerName - the name of the layer to be appended to the generated class name
 * @returns a string to be used as a class on an element
 */
export function layerClass(layerName: string) {
  return `lc-${layerName}`;
}

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
 * @param layerName The name of the layer used to apply a layer classname for targeting styling
 * @param extraClasses Additional classes to be applied to the layer if they don't exist in the props already
 * @returns a typed spreadable object with props for the layer
 */
export function extractLayerProps<T>(
  props: T,
  layerName: string,
  extraClasses?: string
): WithClass<ExtractObjectType<T> extends never ? DefaultProps : ExtractObjectType<T>> {
  const className = layerClass(layerName);

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
