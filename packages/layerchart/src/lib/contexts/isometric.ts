import { createContext } from 'svelte';

import type { AffineMatrix } from '$lib/utils/isometric.js';

/**
 * A getter for the `isometric` matrix the enclosing layer draws through, `null` when the chart is
 * flat or the layer has `ignoreTransform`.
 */
const [_getLayerIsometric, _setLayerIsometric, _hasLayerIsometric] =
  createContext<() => AffineMatrix | null>();

export function getLayerIsometric(): () => AffineMatrix | null {
  return _hasLayerIsometric() ? _getLayerIsometric() : () => null;
}

export function setLayerIsometric(getMatrix: () => AffineMatrix | null) {
  return _setLayerIsometric(getMatrix);
}
