import { createContext } from 'svelte';

export type LayerContext = 'svg' | 'canvas' | 'html';

const [_getLayer, _setLayer, _hasLayer] = createContext<LayerContext>();

/**
 * The layer marks here draw in, or `undefined` outside `Svg`, `Canvas`, and `Html` (ex. in a
 * layer of another package's, where a mark of LayerChart's then draws nothing rather than throw)
 */
export function getLayerContext(): LayerContext | undefined {
  return _hasLayer() ? _getLayer() : undefined;
}

export function setLayerContext(context: LayerContext): LayerContext {
  return _setLayer(context);
}
