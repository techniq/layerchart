import { Context } from 'runed';

import {} from '$lib/components/TransformContext.svelte';
import {
  createDefaultTransformContext,
  type TransformMode,
  type TransformScrollMode,
} from '$lib/states/transform.svelte.js';
import type { MotionProp } from '$lib/utils/motion.svelte.js';

export type TransformContextValue = {
  /**
   * The current transform mode.
   *
   * - `canvas`: The transform is applied to the canvas element.
   * - `manual`: The transform is applied manually.
   * - `none`: No transform is applied.
   */
  mode: TransformMode;

  /**
   * The current scale of the transform.
   */
  scale: number;

  /**
   * Set the scale of the transform
   * @param value - the scale value to set
   * @param options - motion options to apply to the transform (defaults to the motion options passed to the component)
   */
  setScale(value: number, options?: MotionProp): void;

  /**
   * The current translate of the transform.
   */
  translate: { x: number; y: number };

  /**
   * Set the translate of the transform
   * @param point - the point to translate to
   * @param options - motion options to apply to the transform (defaults to the motion options passed to the component)
   */
  setTranslate(point: { x: number; y: number }, options?: MotionProp): void;

  /**
   * Whether the transform is currently being moved
   */
  moving: boolean;

  /**
   * Whether the transform is currently being dragged
   */
  dragging: boolean;

  /**
   * The scroll mode of the transform.
   *
   * - `scale`: Scrolling will zoom in/out the canvas.
   * - `translate`: Scrolling will pan the canvas.
   * - `none`: No scroll mode is applied.
   */
  scrollMode: TransformScrollMode;

  /**
   * Set the scroll mode of the transform
   *
   * @param mode - the scroll mode to set
   */
  setScrollMode(mode: TransformScrollMode): void;

  /**
   * Reset the transform to its initial state
   */
  reset(): void;

  /**
   * Zoom in the transform
   */
  zoomIn(): void;

  /**
   * Zoom out the transform
   *
   */
  zoomOut(): void;

  /**
   * Translate the transform to the center of the canvas
   */
  translateCenter(): void;

  /**
   * Zoom to a specific point in the canvas
   *
   * @param center - The point (in chart coordinates) that should become the new
   * center of the view after zooming.
   *
   * @param rect - A rectangular region (in chart coordinates) that the view should scale to fit.
   * If omitted, the scale defaults to 1 (no zoom).
   */
  zoomTo(center: { x: number; y: number }, rect?: { width: number; height: number }): void;
};

const _TransformContext = new Context<TransformContextValue>('TransformContext');

export function getTransformContext() {
  return _TransformContext.getOr(createDefaultTransformContext());
}

export function setTransformContext(transform: TransformContextValue) {
  return _TransformContext.set(transform);
}
