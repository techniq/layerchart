import { Context } from 'runed';

export type LayerContext = 'svg' | 'canvas' | 'html';

const _LayerContext = new Context<LayerContext>('LayerContext');

export function getLayerContext(): LayerContext {
  return _LayerContext.get();
}

export function setLayerContext(context: LayerContext): LayerContext {
  return _LayerContext.set(context);
}
