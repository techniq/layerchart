import { createContext } from 'svelte';
import type { MouseEventHandler, PointerEventHandler, TouchEventHandler } from 'svelte/elements';

import type { ComputedStylesOptions } from '$lib/utils/canvas.js';
import type { ComponentNode } from '$lib/states/chart.svelte.js';

export type ComponentRender<T extends Element = Element> = {
  render: (ctx: CanvasRenderingContext2D, styleOverrides?: ComputedStylesOptions) => any;
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
  /**
   * How far back the mark stands on an isometric floor, for a parent registered with
   * `paintByDepth` to paint its children back to front whatever order they mounted in
   */
  depth?: () => number | undefined;
};

export type CanvasContextValue = {
  /**
   * Register component to render.
   *
   * Returns method to unregister on component destroy
   */
  register<T extends Element>(component: ComponentRender<T>): () => void;
  invalidate(): void;
  /** Get the root ComponentNode of the canvas render tree. Used for server-side rendering. */
  getRootNode?: () => ComponentNode;
};

const [_getCanvasContext, _setCanvasContext, _hasCanvasContext] =
  createContext<CanvasContextValue>();

const defaultCanvasContext: CanvasContextValue = {
  register: <T extends Element>(_: ComponentRender<T>) => {
    return () => {};
  },
  invalidate: () => {},
};

export function getCanvasContext() {
  return _hasCanvasContext() ? _getCanvasContext() : defaultCanvasContext;
}

export function setCanvasContext(context: CanvasContextValue) {
  return _setCanvasContext(context);
}
