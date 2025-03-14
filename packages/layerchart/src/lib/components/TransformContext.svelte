<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements';

  const DEFAULT_TRANSLATE = { x: 0, y: 0 };
  const DEFAULT_SCALE = 1;

  type TransformMode = 'canvas' | 'manual' | 'none';
  type TransformScrollMode = 'scale' | 'translate' | 'none';

  export type TransformContextValue = {
    mode: TransformMode;
    scale: number;
    setScale(value: number, options?: MotionOptions): void;
    translate: { x: number; y: number };
    setTranslate(point: { x: number; y: number }, options?: MotionOptions): void;
    moving: boolean;
    dragging: boolean;
    scrollMode: TransformScrollMode;
    setScrollMode(mode: TransformScrollMode): void;
    reset(): void;
    zoomIn(): void;
    zoomOut(): void;
    translateCenter(): void;
    zoomTo(center: { x: number; y: number }, rect?: { width: number; height: number }): void;
  };

  let defaultTranslate = $state(DEFAULT_TRANSLATE);
  let defaultScale = $state(DEFAULT_SCALE);

  const defaultContext: TransformContextValue = {
    mode: 'none',
    get scale() {
      return defaultScale;
    },
    setScale: (value: number) => {
      defaultScale = value;
    },
    get translate() {
      return defaultTranslate;
    },
    setTranslate: (value: { x: 0; y: 0 }) => {
      defaultTranslate = value;
    },
    moving: false,
    dragging: false,
    scrollMode: 'none',
    setScrollMode: () => {},
    reset: () => {},
    zoomIn: () => {},
    zoomOut: () => {},
    translateCenter: () => {},
    zoomTo: () => {},
  };

  const TransformContext = new Context<TransformContextValue>('TransformContext');

  export function transformContext() {
    return TransformContext.getOr(defaultContext);
  }

  function setTransformContext(transform: TransformContextValue) {
    return TransformContext.set(transform);
  }

  type TransformContextPropsWithoutHTML = {
    mode?: TransformMode;
    spring?: boolean | SpringOptions;
    tweened?: boolean | TweenedOptions;
    processTranslate?: (
      x: number,
      y: number,
      deltaX: number,
      deltaY: number
    ) => {
      x: number;
      y: number;
    };
    /**
     * Disable pointer events including move/dragging.  Useful for `mode="canvas" but only want
     * zoomTo() interactions
     *
     * @default false
     */
    disablePointer?: boolean;

    /**
     * Initial scroll mode.
     * This is set to `none` by default, but can be set to `scale` or `translate`
     *
     * @default 'none'
     */
    initialScrollMode?: TransformScrollMode;

    /**
     * Distance/threshold to consider drag vs click (disable click propagation)
     *
     * @default 10
     */
    clickDistance?: number;

    /**
     * Initial translate value
     */
    initialTranslate?: { x: number; y: number };

    /**
     *  Initial scale value
     */
    initialScale?: number;
    onTransform?: (e: { scale: number; translate: { x: number; y: number } }) => void;
    ondragstart?: () => void;
    ondragend?: () => void;
    ref?: HTMLElement | null;
    children?: Snippet<[{ transform: TransformContextValue }]>;
  };

  type TransformContextProps = TransformContextPropsWithoutHTML &
    Without<HTMLAttributes<HTMLElement>, TransformContextPropsWithoutHTML>;
</script>

<script lang="ts">
  import {
    motionStore,
    type MotionOptions,
    type SpringOptions,
    type TweenedOptions,
    motionState,
    MotionFinishState,
  } from '$lib/stores/motionStore.js';
  import { localPoint } from '@layerstack/utils';
  import { Context, watch } from 'runed';
  import type { Without } from 'layerchart/utils/types.js';
  import { getChartContext } from './Chart-Next.svelte';
  import type { Snippet } from 'svelte';
  import { cls } from '@layerstack/tailwind';

  let {
    mode = 'none',
    spring,
    tweened,
    processTranslate = (x: number, y: number, deltaX: number, deltaY: number) => ({
      x: x + deltaX,
      y: y + deltaY,
    }),
    disablePointer = false,
    initialScrollMode = 'none',
    clickDistance = 10,
    ondragend = () => {},
    ondragstart = () => {},
    onTransform = () => {},
    initialTranslate,
    initialScale,
    onwheel = () => {},
    onpointerdown = () => {},
    onpointermove = () => {},
    ontouchmove = () => {},
    onpointerup = () => {},
    ondblclick = () => {},
    onclickcapture = () => {},
    ref = $bindable(),
    children,
    class: className,
    ...restProps
  }: TransformContextProps = $props();

  const ctx = getChartContext();

  let pointerDown = false;
  let dragging = $state(false);
  let scrollMode = $state<TransformScrollMode>(initialScrollMode);

  export const translate = motionState(initialTranslate ?? DEFAULT_TRANSLATE, { spring, tweened });
  export const scale = motionState(initialScale ?? DEFAULT_SCALE, { spring, tweened });

  let startPoint: { x: number; y: number } = { x: 0, y: 0 };
  let startTranslate: { x: number; y: number } = { x: 0, y: 0 };

  export function setScrollMode(mode: TransformScrollMode) {
    scrollMode = mode;
  }

  export function reset() {
    translate.set(initialTranslate ?? DEFAULT_TRANSLATE);
    scale.set(initialScale ?? DEFAULT_SCALE);
  }

  export function zoomIn() {
    scaleTo(1.25, { x: (ctx.width + ctx.padding.left) / 2, y: (ctx.height + ctx.padding.top) / 2 });
  }

  export function zoomOut() {
    scaleTo(0.8, { x: (ctx.width + ctx.padding.left) / 2, y: (ctx.height + ctx.padding.top) / 2 });
  }

  export function translateCenter() {
    translate.set({
      x: 0,
      y: 0,
    });
  }

  export function zoomTo(
    center: { x: number; y: number },
    rect?: { width: number; height: number }
  ) {
    const newScale = rect
      ? ctx.width < ctx.height
        ? ctx.width / rect.width
        : ctx.height / rect.height
      : 1;

    translate.set({
      x: ctx.width / 2 - center.x * newScale,
      y: ctx.height / 2 - center.y * newScale,
    });

    if (rect) {
      scale.set(newScale);
    }
  }

  function onPointerDown(e: PointerEvent & { currentTarget: HTMLElement }) {
    onpointerdown?.(e);
    if (e.defaultPrevented) return;
    if (mode === 'none' || disablePointer) return;

    e.preventDefault();

    pointerDown = true;
    dragging = false;
    startPoint = localPoint(e);
    startTranslate = translate.current;

    ondragstart?.();
  }

  function onPointerMove(e: PointerEvent & { currentTarget: HTMLElement }) {
    onpointermove?.(e);
    if (e.defaultPrevented) return;
    if (!pointerDown) return;

    e.preventDefault(); // Stop text selection

    const endPoint = localPoint(e);
    const deltaX = endPoint.x - startPoint.x;
    const deltaY = endPoint.y - startPoint.y;

    if (!dragging) {
      // If dragged beyond threshold, disable click propagation
      dragging = deltaX * deltaX + deltaY * deltaY > clickDistance;
    }

    if (dragging) {
      e.stopPropagation(); // Stop tooltip from trigging (along with `capture: true`)
      e.currentTarget?.setPointerCapture(e.pointerId);

      setTranslate(
        processTranslate(startTranslate.x, startTranslate.y, deltaX, deltaY),
        // @ts-expect-error
        spring ? { hard: true } : tweened ? { duration: 0 } : undefined
      );
    }
  }

  function onPointerUp(e: PointerEvent & { currentTarget: HTMLElement }) {
    onpointerup?.(e);
    if (e.defaultPrevented) return;
    pointerDown = false;
    dragging = false;
    ondragend?.();
  }

  function onClick(e: MouseEvent & { currentTarget: HTMLElement }) {
    onclickcapture?.(e);
    if (e.defaultPrevented) return;
    if (dragging) {
      // Do not propagate click event to children if drag/moved.  Registered in capture phase (top-down)
      e.stopPropagation();
    }
  }

  function onDoubleClick(e: MouseEvent & { currentTarget: HTMLElement }) {
    ondblclick?.(e);
    if (e.defaultPrevented) return;
    if (mode === 'none' || disablePointer) return;
    const point = localPoint(e);
    scaleTo(e.shiftKey ? 0.5 : 2, point);
  }

  function onWheel(e: WheelEvent & { currentTarget: HTMLElement }) {
    onwheel?.(e);
    if (e.defaultPrevented) return;
    if (mode === 'none' || disablePointer || scrollMode === 'none') return;

    e.preventDefault();

    const point = (startPoint = localPoint(e));

    // Pinch to zoom is registered as a wheel event with control key
    const pinchToZoom = e.ctrlKey;

    if (scrollMode === 'scale' || pinchToZoom) {
      // https://github.com/d3/d3-zoom#zoom_wheelDelta
      const scaleBy =
        -e.deltaY * (e.deltaMode === 1 ? 0.05 : e.deltaMode ? 1 : 0.002) * (e.ctrlKey ? 10 : 1);

      scaleTo(
        Math.pow(2, scaleBy),
        point,
        // @ts-expect-error
        spring ? { hard: true } : tweened ? { duration: 0 } : undefined
      );
    } else if (scrollMode === 'translate') {
      const startTranslate = translate.current;
      translate.set(
        processTranslate(startTranslate.x, startTranslate.y, -e.deltaX, -e.deltaY),
        spring ? { hard: true } : tweened ? { duration: 0 } : undefined
      );
    }
  }

  /**
   * Apply scale and translate towards point
   */
  function scaleTo(
    value: number,
    point: { x: number; y: number },
    options: Parameters<typeof motionStore>[1] | undefined = undefined
  ) {
    const currentScale = scale.current;
    const newScale = scale.current * value;
    setScale(newScale, options);

    // Translate towards point (ex. mouse cursor/center) while zooming in/out
    const invertTransformPoint = {
      x: (point.x - ctx.padding.left - translate.current.x) / currentScale,
      y: (point.y - ctx.padding.top - translate.current.y) / currentScale,
    };
    const newTranslate = {
      x: point.x - ctx.padding.left - invertTransformPoint.x * newScale,
      y: point.y - ctx.padding.top - invertTransformPoint.y * newScale,
    };
    setTranslate(newTranslate, options);
  }

  const translating = new MotionFinishState();
  const scaling = new MotionFinishState();

  const moving = $derived(dragging || translating.current || scaling.current);

  export function setTranslate(point: { x: number; y: number }, options?: MotionOptions) {
    translating.handle(translate.set(point, options));
  }

  export function setScale(value: number, options?: MotionOptions) {
    scaling.handle(scale.set(value, options));
  }

  watch([() => scale.current, () => translate.current], () => {
    onTransform({
      scale: scale.current,
      translate: translate.current,
    });
  });

  const transformContext = {
    get mode() {
      return mode;
    },
    get scale() {
      return scale.current;
    },
    setScale,
    get translate() {
      return translate.current;
    },
    setTranslate,
    get dragging() {
      return dragging;
    },
    get moving() {
      return moving;
    },
    reset,
    zoomIn,
    zoomOut,
    translateCenter,
    zoomTo,
    get scrollMode() {
      return scrollMode;
    },
    setScrollMode,
  };

  setTransformContext(transformContext);
</script>

<div
  onwheel={onWheel}
  onpointerdown={onPointerDown}
  onpointermove={onPointerMove}
  ontouchmove={(e) => {
    ontouchmove?.(e);
    if (e.defaultPrevented) return;
    // Touch events cause pointer events to be interrupted.
    // Typically `touch-action: none` works, but doesn't appear to with SVG, but `preventDefault()` works here
    // https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events#touch-action_css_property
    if (mode !== 'none' && !disablePointer) {
      e.preventDefault();
    }
  }}
  onpointerup={onPointerUp}
  ondblclick={onDoubleClick}
  onclickcapture={onClick}
  class={cls('h-full layerchart-transform-context', className)}
  bind:this={ref}
  {...restProps}
>
  {@render children?.({ transform: transformContext })}
</div>
