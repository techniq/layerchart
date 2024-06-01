<script lang="ts" context="module">
  import { getContext, setContext } from 'svelte';
  import { writable, type Readable, type Writable } from 'svelte/store';

  export const transformContextKey = Symbol();

  export type TransformContextValue = {
    mode: 'canvas' | 'manual' | 'none';
    scale: Writable<number>;
    translate: Writable<{ x: number; y: number }>;
    dragging: Readable<boolean>;
    reset(): void;
    zoomIn(): void;
    zoomOut(): void;
    translateCenter(): void;
    zoomTo(center: { x: number; y: number }, rect?: { width: number; height: number }): void;
  };

  export type TransformContext = TransformContextValue;

  const defaultContext: TransformContext = {
    mode: 'none',
    scale: writable(1),
    translate: writable({ x: 0, y: 0 }),
    dragging: writable(false),
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
  import { createEventDispatcher } from 'svelte';

  import { motionStore } from '$lib/stores/motionStore.js';

  const { width, height } = getContext('LayerCake');

  export let mode: TransformContextValue['mode'] = 'none';
  export let translateOnScale = false;
  export let spring: boolean | Parameters<typeof motionStore>[1]['spring'] = undefined;
  export let tweened: boolean | Parameters<typeof motionStore>[1]['tweened'] = undefined;

  export let processTranslate = (
    x: number,
    y: number,
    deltaX: number,
    deltaY: number,
    scale: number
  ) => {
    return {
      x: x + deltaX / scale,
      y: y + deltaY / scale,
    };
  };

  /** Disable pointer events including move/dragging.  Useful for `mode="canvas" but only want zoomTo() interactions */
  export let disablePointer = false;

  /** Action to take during wheel scroll */
  export let scroll: 'scale' | 'translate' | 'none' = 'none';

  /** Distance/threshold to consider drag vs click (disable click propagation) */
  export let clickDistance = 10;

  const dispatch = createEventDispatcher<{
    dragstart: null;
    dragend: null;
    transform: { scale: number; translate: { x: number; y: number } };
  }>();

  let pointerDown = false;
  const dragging = writable(false);

  const DEFAULT_TRANSLATE = { x: 0, y: 0 };
  export let initialTranslate: { x: number; y: number } | undefined = undefined;
  export const translate = motionStore(initialTranslate ?? DEFAULT_TRANSLATE, { spring, tweened });

  const DEFAULT_SCALE = 1;
  export let initialScale: number | undefined = undefined;
  export const scale = motionStore(initialScale ?? DEFAULT_SCALE, { spring, tweened });

  let startPoint: { x: number; y: number } = { x: 0, y: 0 };
  let startTranslate: { x: number; y: number } = { x: 0, y: 0 };

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

  setTransformContext({
    mode,
    scale,
    translate,
    dragging,
    reset,
    zoomIn,
    zoomOut,
    translateCenter,
    zoomTo,
  });

  function onPointerDown(e: PointerEvent & { currentTarget: HTMLDivElement }) {
    if (mode === 'none' || disablePointer) return;

    e.preventDefault();

    pointerDown = true;
    $dragging = false;
    startPoint = localPoint(e);
    startTranslate = $translate;

    dispatch('dragstart');
  }

  function onPointerMove(e: PointerEvent) {
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
      e.currentTarget.setPointerCapture(e.pointerId);

      translate.set(
        processTranslate(startTranslate.x, startTranslate.y, deltaX, deltaY, $scale),
        spring ? { hard: true } : tweened ? { duration: 0 } : undefined
      );
    }
  }

  function onPointerUp(e: PointerEvent) {
    pointerDown = false;
    dispatch('dragend');
  }

  function onClick(e: MouseEvent) {
    if ($dragging) {
      // Do not propagate click event to children if drag/moved.  Registered in capture phase (top-down)
      e.stopPropagation();
    }
  }

  function onDoubleClick(e) {
    if (mode === 'none' || disablePointer) return;
    const point = localPoint(e);
    scaleTo(e.shiftKey ? 0.5 : 2, point);
  }

  function onWheel(e: WheelEvent) {
    if (mode === 'none' || disablePointer || scroll === 'none') return;

    e.preventDefault();

    const point = (startPoint = localPoint(e));

    // Pinch to zoom is registered as a wheel event with control key
    const pinchToZoom = e.ctrlKey;

    if (scroll === 'scale' || pinchToZoom) {
      // https://github.com/d3/d3-zoom#zoom_wheelDelta
      const scaleBy =
        -e.deltaY * (e.deltaMode === 1 ? 0.05 : e.deltaMode ? 1 : 0.002) * (e.ctrlKey ? 10 : 1);

      scaleTo(
        Math.pow(2, scaleBy),
        point,
        spring ? { hard: true } : tweened ? { duration: 0 } : undefined
      );
    } else if (scroll === 'translate') {
      translate.update(
        (startTranslate) =>
          processTranslate(startTranslate.x, startTranslate.y, -e.deltaX, -e.deltaY, $scale),
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
    scale.set(newScale, options);

    if (translateOnScale) {
      // Translate towards point (ex. mouse cursor/center) while zooming in/out
      const invertTransformPoint = {
        x: (point.x - $translate.x) / currentScale,
        y: (point.y - $translate.y) / currentScale,
      };
      const newTranslate = {
        x: point.x - invertTransformPoint.x * newScale,
        y: point.y - invertTransformPoint.y * newScale,
      };
      translate.set(newTranslate, options);
    }
  }

  function localPoint(e: PointerEvent | WheelEvent) {
    return {
      x: e.offsetX,
      y: e.offsetY,
    };
  }

  $: center = { x: $width / 2, y: $height / 2 };

  $: viewportCenter = {
    x: center.x - $translate.x,
    y: center.y - $translate.y,
  };

  $: dispatch('transform', { scale: $scale, translate: $translate });
</script>

<div
  on:mousewheel={onWheel}
  on:pointerdown={onPointerDown}
  on:pointermove={onPointerMove}
  on:touchmove={(e) => {
    // Touch events cause pointer events to be interrupted.
    // Typically `touch-action: none` works, but doesn't appear to with SVG, but `preventDefault()` works here
    // https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events#touch-action_css_property
    e.preventDefault();
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
      setScale: scale.set,
      translate: $translate,
      setTranslate: translate.set,
      zoomTo,
      reset,
    }}
  />
</div>
