/**
 * Creates a spreadable object containing a data attribute for a
 * layer/element within a LayerChart.
 *
 * @example
 * ```ts
 * const rootAttr = createDataAttribute('root-container');
 * console.log(rootAttr) // { "data-lc-root-container": "" }
 *```

 * @param layerName - the name of the layer to be used as the data attribute
 * @returns a string to be used as a data attribute
 */
export function createDataAttr(layerName: string) {
  return {
    [`data-lc-${layerName}`]: '',
  };
}
