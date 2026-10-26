import { createContext } from 'svelte';

export type LayerContext = 'svg' | 'canvas' | 'html';

const [_getLayer, _setLayer] = createContext<LayerContext>();

export function getLayerContext(): LayerContext {
  return _getLayer();
}

export function setLayerContext(context: LayerContext): LayerContext {
  return _setLayer(context);
}
