<script lang="ts" context="module">
  import { getContext, setContext } from 'svelte';
  import { writable, type Readable, type Writable, derived } from 'svelte/store';

  export const transformContextKey = Symbol();

  type TransformMode = 'canvas' | 'manual' | 'none';
  type TransformScrollMode = 'scale' | 'translate' | 'none';

  export type TransformContextValue = {
    mode: TransformMode;
    scale: Writable<number>;
    setScale(value: number, options?: MotionOptions): void;
    translate: Writable<{ x: number; y: number }>;
    setTranslate(point: { x: number; y: number }, options?: MotionOptions): void;
    moving: Readable<boolean>;
    dragging: Readable<boolean>;
    scrollMode: Readable<TransformScrollMode>;
    setScrollMode(mode: TransformScrollMode): void;
    reset(): void;
    zoomIn(): void;
    zoomOut(): void;
    translateCenter(): void;
    zoomTo(center: { x: number; y: number }, rect?: { width: number; height: number }): void;
  };

  export type TransformContext = TransformContextValue;

  const defaultTranslate = writable({ x: 0, y: 0 });
  const defaultScale = writable(1);
  const defaultContext: TransformContext = {
    mode: 'none',
    scale: defaultScale,
    setScale: defaultScale.set,
    translate: defaultTranslate,
    setTranslate: defaultTranslate.set,
    moving: writable(false),
    dragging: writable(false),
    scrollMode: writable('none'),
    setScrollMode: () => {},
    reset: () => {},
    zoomIn: () => {},
    zoomOut: () => {},
    translateCenter: () => {},
    zoomTo: () => {},
  };
  export function transformContext() {
    return getContext<TransformContext>(transformContextKey) ?? defaultContext;
  }

  function setTransformContext(transform: TransformContext) {
    setContext(transformContextKey, transform);
  }
</script>

<script lang="ts">
  import { chartContext } from './ChartContext.svelte';
  import { motionStore, type MotionOptions, motionFinishHandler } from '$lib/stores/motionStore.js';
  import { localPoint } from '@layerstack/utils';

  const { width, height } = chartContext();

  export let mode: TransformMode = 'none';

  export let spring: boolean | Parameters<typeof motionStore>[1]['spring'] = undefined;
  export let tweened: boolean | Parameters<typeof motionStore>[1]['tweened'] = undefined;

  export let processTranslate = (x: number, y: number, deltaX: number, deltaY: number) => {
    return {
      x: x + deltaX,
      y: y + deltaY,
    };
  };

  /** Disable pointer events including move/dragging.  Useful for `mode="canvas" but only want zoomTo() interactions */
  export let disablePointer = false;

  /** Action to take during wheel scroll */
  export let initialScrollMode: TransformScrollMode = 'none';

  /** Distance/threshold to consider drag vs click (disable click propagation) */
  export let clickDistance = 10;

  export let ondragstart: (() => void) | undefined = undefined;
  export let ondragend: (() => void) | undefined = undefined;
  export let ontransform:
    | ((e: { scale: number; translate: { x: number; y: number } }) => void)
    | undefined = undefined;

  let pointerDown = false;
  const dragging = writable(false);
  const scrollMode = writable<TransformScrollMode>(initialScrollMode);

  const DEFAULT_TRANSLATE = { x: 0, y: 0 };
  export let initialTranslate: { x: number; y: number } | undefined = undefined;
  export const translate = motionStore(initialTranslate ?? DEFAULT_TRANSLATE, { spring, tweened });

  const DEFAULT_SCALE = 1;
  export let initialScale: number | undefined = undefined;
  export const scale = motionStore(initialScale ?? DEFAULT_SCALE, { spring, tweened });

  let startPoint: { x: number; y: number } = { x: 0, y: 0 };
  let startTranslate: { x: number; y: number } = { x: 0, y: 0 };

  export function setScrollMode(mode: TransformScrollMode) {
    $scrollMode = mode;
  }

  export function reset() {
    $translate = initialTranslate ?? DEFAULT_TRANSLATE;
    $scale = initialScale ?? DEFAULT_SCALE;
  }

  export function zoomIn() {
    scaleTo(1.25, { x: $width / 2, y: $height / 2 });
  }

  export function zoomOut() {
    scaleTo(0.8, { x: $width / 2, y: $height / 2 });
  }

  export function translateCenter() {
    $translate = {
      x: 0,
      y: 0,
    };
  }

  export function zoomTo(
    center: { x: number; y: number },
    rect?: { width: number; height: number }
  ) {
    // TODO: Improve with geo/projection

    $translate = {
      x: $width / 2 - center.x,
      y: $height / 2 - center.y,
    };

    if (rect) {
      $scale = $width < $height ? $width / rect.width : $height / rect.height;
    }
  }

  function onPointerDown(e: PointerEvent & { currentTarget: HTMLDivElement }) {
    if (mode === 'none' || disablePointer) return;

    e.preventDefault();

    pointerDown = true;
    $dragging = false;
    startPoint = localPoint(e);
    startTranslate = $translate;

    ondragstart?.();
  }

  function onPointerMove(e: PointerEvent & { currentTarget: HTMLDivElement }) {
    if (!pointerDown) return;

    e.preventDefault(); // Stop text selection

    const endPoint = localPoint(e);
    const deltaX = endPoint.x - startPoint.x;
    const deltaY = endPoint.y - startPoint.y;

    if (!$dragging) {
      // If dragged beyond threshold, disable click propagation
      $dragging = deltaX * deltaX + deltaY * deltaY > clickDistance;
    }

    if ($dragging) {
      e.stopPropagation(); // Stop tooltip from trigging (along with `capture: true`)
      e.currentTarget?.setPointerCapture(e.pointerId);

      setTranslate(
        processTranslate(startTranslate.x, startTranslate.y, deltaX, deltaY),
        // @ts-expect-error
        spring ? { hard: true } : tweened ? { duration: 0 } : undefined
      );
    }
  }

  function onPointerUp(e: PointerEvent) {
    pointerDown = false;
    $dragging = false;
    ondragend?.();
  }

  function onClick(e: MouseEvent) {
    if ($dragging) {
      // Do not propagate click event to children if drag/moved.  Registered in capture phase (top-down)
      e.stopPropagation();
    }
  }

  function onDoubleClick(e: MouseEvent) {
    if (mode === 'none' || disablePointer) return;
    const point = localPoint(e);
    scaleTo(e.shiftKey ? 0.5 : 2, point);
  }

  function onWheel(e: WheelEvent) {
    if (mode === 'none' || disablePointer || $scrollMode === 'none') return;

    e.preventDefault();

    const point = (startPoint = localPoint(e));

    // Pinch to zoom is registered as a wheel event with control key
    const pinchToZoom = e.ctrlKey;

    if ($scrollMode === 'scale' || pinchToZoom) {
      // https://github.com/d3/d3-zoom#zoom_wheelDelta
      const scaleBy =
        -e.deltaY * (e.deltaMode === 1 ? 0.05 : e.deltaMode ? 1 : 0.002) * (e.ctrlKey ? 10 : 1);

      scaleTo(
        Math.pow(2, scaleBy),
        point,
        // @ts-expect-error
        spring ? { hard: true } : tweened ? { duration: 0 } : undefined
      );
    } else if ($scrollMode === 'translate') {
      translate.update(
        (startTranslate) =>
          processTranslate(startTranslate.x, startTranslate.y, -e.deltaX, -e.deltaY),
        // @ts-expect-error
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
    const currentScale = $scale;
    const newScale = $scale * value;
    setScale(newScale, options);

    // Translate towards point (ex. mouse cursor/center) while zooming in/out
    const invertTransformPoint = {
      x: (point.x - $translate.x) / currentScale,
      y: (point.y - $translate.y) / currentScale,
    };
    const newTranslate = {
      x: point.x - invertTransformPoint.x * newScale,
      y: point.y - invertTransformPoint.y * newScale,
    };
    setTranslate(newTranslate, options);
  }

  const translating = motionFinishHandler();
  const scaling = motionFinishHandler();
  const moving = derived(
    [dragging, translating, scaling],
    ([dragging, translating, scaling]) => dragging || translating || scaling
  );
  export function setTranslate(point: { x: number; y: number }, options?: MotionOptions) {
    // @ts-expect-error
    translating.handle(translate.set(point, options));
  }

  export function setScale(value: number, options?: MotionOptions) {
    // @ts-expect-error
    scaling.handle(scale.set(value, options));
  }

  $: center = { x: $width / 2, y: $height / 2 };

  $: viewportCenter = {
    x: center.x - $translate.x,
    y: center.y - $translate.y,
  };

  $: ontransform?.({ scale: $scale, translate: $translate });

  setTransformContext({
    mode,
    scale,
    setScale,
    translate,
    setTranslate,
    dragging,
    moving,
    reset,
    zoomIn,
    zoomOut,
    translateCenter,
    zoomTo,
    scrollMode,
    setScrollMode,
  });
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  on:wheel={onWheel}
  on:pointerdown={onPointerDown}
  on:pointermove={onPointerMove}
  on:touchmove={(e) => {
    // Touch events cause pointer events to be interrupted.
    // Typically `touch-action: none` works, but doesn't appear to with SVG, but `preventDefault()` works here
    // https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events#touch-action_css_property
    if (mode !== 'none' && !disablePointer) {
      e.preventDefault();
    }
  }}
  on:pointerup={onPointerUp}
  on:dblclick={onDoubleClick}
  on:click|capture={onClick}
  on:click
  on:keydown
  on:keyup
  on:keypress
  class="h-full"
>
  <slot
    transform={{
      scale: $scale,
      setScale,
      translate: $translate,
      setTranslate,
      zoomTo,
      reset,
    }}
  />
</div>
