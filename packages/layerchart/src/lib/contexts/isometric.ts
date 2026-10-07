import { Context } from 'runed';

import type { AffineMatrix } from '$lib/utils/isometric.js';

/**
 * A getter for the `isometric` matrix the enclosing layer draws through, `null` when the chart is
 * flat or the layer has `ignoreTransform`.
 */
const _LayerIsometricContext = new Context<() => AffineMatrix | null>('LayerIsometricContext');

export function getLayerIsometric(): () => AffineMatrix | null {
  return _LayerIsometricContext.getOr(() => null);
}

export function setLayerIsometric(getMatrix: () => AffineMatrix | null) {
  return _LayerIsometricContext.set(getMatrix);
}
