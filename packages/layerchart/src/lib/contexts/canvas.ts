import { Context } from 'runed';
import type { MouseEventHandler, PointerEventHandler, TouchEventHandler } from 'svelte/elements';

import type { ComputedStylesOptions } from '$lib/utils/canvas.js';

export type ComponentRender<T extends Element = Element> = {
  name: string;
  render: (ctx: CanvasRenderingContext2D, styleOverrides?: ComputedStylesOptions) => any;
  retainState?: boolean;
  events?: {
    click?: MouseEventHandler<T> | null;
    dblclick?: MouseEventHandler<T> | null;
    pointerenter?: PointerEventHandler<T> | null;
    pointerover?: PointerEventHandler<T> | null;
    pointermove?: PointerEventHandler<T> | null;
    pointerleave?: PointerEventHandler<T> | null;
    pointerout?: PointerEventHandler<T> | null;
    pointerdown?: PointerEventHandler<T> | null;
    touchmove?: TouchEventHandler<T> | null;
  };
  /**
   * Optional dependencies to track and invalidate the canvas context when they change.
   */
  deps?: () => any[];
};

export type CanvasContextValue = {
  /**
   * Register component to render.
   *
   * Returns method to unregister on component destroy
   */
  register<T extends Element>(component: ComponentRender<T>): () => void;
  invalidate(): void;
};

const CanvasContext = new Context<CanvasContextValue>('CanvasContext');

const defaultCanvasContext: CanvasContextValue = {
  register: <T extends Element>(_: ComponentRender<T>) => {
    return () => {};
  },
  invalidate: () => {},
};

export function getCanvasContext() {
  return CanvasContext.getOr(defaultCanvasContext);
}

export function setCanvasContext(context: CanvasContextValue) {
  return CanvasContext.set(context);
}
