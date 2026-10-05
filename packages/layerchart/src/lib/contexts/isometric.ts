import { Context } from 'runed';

import type { AffineMatrix } from '$lib/utils/isometric.js';

/**
 * The `isometric` matrix the enclosing layer draws through — `null` when the chart is flat, or the
 * layer opts out with `ignoreTransform`.  A getter, as the matrix follows the chart's size.
 *
 * Internal: lets marks that undo the view (ex. `<Text viewport>`) know whether there's one to undo.
 */
const _LayerIsometricContext = new Context<() => AffineMatrix | null>('LayerIsometricContext');

export function getLayerIsometric(): () => AffineMatrix | null {
  return _LayerIsometricContext.getOr(() => null);
}

export function setLayerIsometric(getMatrix: () => AffineMatrix | null) {
  return _LayerIsometricContext.set(getMatrix);
}
