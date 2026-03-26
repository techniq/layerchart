<script lang="ts" module>
  import type { ComponentNode } from '$lib/contexts/chart.js';

  export type CanvasPropsWithoutHTML = {
    /**
     * The `<canvas>` tag. Useful for bindings.
     *
     * @bindable
     */
    ref?: HTMLCanvasElement;

    /**
     * The `<canvas>`'s 2d context. Useful for bindings.
     *
     * @bindable
     */
    canvasContext?: CanvasRenderingContext2D;

    /**
     * Force the use of a software (instead of hardware accelerated) 2D canvas, which can
     * save memory when calling getImageData() frequently.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext#willreadfrequently
     *
     * @default false
     */
    willReadFrequently?: boolean;

    /**
     * The `z-index` style to apply to the layer.
     *
     * @default 0
     */
    zIndex?: number;

    /**
     *
     * Whether pointer events should be enabled on the canvas.
     *
     * - `false`: `pointer-events: none;` will be set on the entire layer.
     * - `true`: pointer events will operate normally.
     *
     * @default true
     */
    pointerEvents?: boolean;

    /**
     * The content to display if canvas is not supported or cannot be rendered.
     * This can either be a string or a snippet with custom markup.
     */
    fallback?: string | Snippet;

    /**
     * Translate children to center of the canvas (useful for radial layouts).
     *
     * @default false
     */
    center?: boolean | 'x' | 'y';

    /**
     * Ignore TransformContext.
     *
     * Useful to add static elements such as legends.
     *
     * @default false
     */
    ignoreTransform?: boolean;

    /**
     * Disable the hit canvas (useful when animations are playing)
     *
     * @default false
     */
    disableHitCanvas?: boolean;

    /**
     * Show the hit canvas for debugging purposes.
     *
     * @default false
     */
    debug?: boolean;

    children?: Snippet<
      [{ ref: HTMLCanvasElement; canvasContext: CanvasRenderingContext2D | undefined }]
    >;
  };

  export type CanvasProps = CanvasPropsWithoutHTML &
    Without<HTMLCanvasAttributes, CanvasPropsWithoutHTML>;

</script>

<script lang="ts">
  import { onMount, untrack, type Snippet } from 'svelte';
  import { Logger, localPoint } from '@layerstack/utils';
  import { MediaQueryPresets } from '@layerstack/svelte-state';

  import { getChartContext } from '$lib/contexts/chart.js';
  import { setLayerContext } from '$lib/contexts/layer.js';
  import { getPixelColor, scaleCanvas } from '../../utils/canvas.js';
  import { getColorStr, rgbColorGenerator } from '../../utils/color.js';
  import { useMutationObserver, watch } from 'runed';
  import type { HTMLCanvasAttributes, PointerEventHandler } from 'svelte/elements';
  import type { Without } from '$lib/utils/types.js';
  import {
    setCanvasContext,
    type CanvasContextValue,
    type ComponentRender,
  } from '$lib/contexts/canvas.js';

  let {
    ref: refProp = $bindable(),
    canvasContext: canvasContextProp = $bindable(),
    willReadFrequently = false,
    debug = false,
    zIndex = 0,
    pointerEvents = true,
    fallback,
    center = false,
    ignoreTransform = false,
    disableHitCanvas = false,
    class: className,
    children,
    onclick,
    ondblclick,
    onpointerenter,
    onpointermove,
    onpointerleave,
    onpointerdown,
    ontouchmove,
    ...restProps
  }: CanvasProps = $props();

  let ref = $state<HTMLCanvasElement>();
  let context = $state<CanvasRenderingContext2D>();

  $effect.pre(() => {
    refProp = ref;
  });

  $effect.pre(() => {
    canvasContextProp = context;
  });

  const ctx = getChartContext();

  const logger = new Logger('Canvas');

  // Root node for the component tree — children register via ctx.registerComponentNode
  const rootNode = ctx.registerComponentNode({ name: 'Canvas', kind: 'group' });
  let pendingInvalidation = false;
  let frameId: number | undefined;

  /**
   * HitCanvas
   */
  let hitCanvasElement = $state<HTMLCanvasElement>();
  let hitCanvasContext = $state<CanvasRenderingContext2D>();
  let colorGenerator = rgbColorGenerator();
  let activeCanvas = $state(false);
  let lastActiveNode: ComponentNode | null | undefined = null;

  const nodeByColor = new Map<string, ComponentNode>();

  function getPointerNode(e: PointerEvent | MouseEvent | TouchEvent) {
    const { x, y } = localPoint(e);
    const color = getPixelColor(hitCanvasContext!, x, y);
    const colorKey = getColorStr(color);
    const node = nodeByColor.get(colorKey);
    logger.debug({ colorKey, node, nodeByColor });
    return node;
  }

  type EventName = keyof NonNullable<ComponentRender['events']>;

  /**
   * Walk up the component tree from a node and call the given event on any
   * ancestor groups that have a handler for it, simulating DOM event bubbling.
   */
  function bubbleEvent(node: ComponentNode | null | undefined, eventName: EventName, e: Event) {
    // Fire event on the hit node itself
    (node?.canvasRender?.events?.[eventName] as ((e: Event) => void) | null | undefined)?.(e);
    // Bubble up to ancestor groups
    let ancestor = node?.parent;
    while (ancestor) {
      const handler = ancestor.kind === 'group'
        ? ancestor.canvasRender?.events?.[eventName] as ((e: Event) => void) | null | undefined
        : undefined;
      handler?.(e);
      ancestor = ancestor.parent;
    }
  }

  const onPointerMove: PointerEventHandler<Element> = (e) => {
    activeCanvas = true;
    const node = getPointerNode(e);

    if (node != lastActiveNode) {
      // TODO: Should `pointerleave`/`pointerout` and `pointerenter`/`pointerover` be handled differently?
      if (lastActiveNode) {
        bubbleEvent(lastActiveNode, 'pointerleave', e);
        bubbleEvent(lastActiveNode, 'pointerout', e);
      }

      bubbleEvent(node, 'pointerenter', e);
      bubbleEvent(node, 'pointerover', e);
    }
    bubbleEvent(node, 'pointermove', e);

    lastActiveNode = node;
  };

  const onPointerLeave: PointerEventHandler<Element> = (e) => {
    // Pointer outside of canvas

    // Call last active component `pointerleave` event in case it was not triggered by hit canvas (quickly exiting canvas element before `pointermove` is triggered)
    bubbleEvent(lastActiveNode, 'pointerleave', e);
    bubbleEvent(lastActiveNode, 'pointerout', e);

    lastActiveNode = null;
    activeCanvas = false;
  };
  /**
   * end HitCanvas
   */

  // Invalidate/redraw if color scheme changes, either via browser `prefers-color-scheme` (including emulation) or by changing `<html class="dark">` or `<html data-theme="...">`
  const { dark } = new MediaQueryPresets();
  watch(
    () => dark.current,
    () => {
      canvasContext.invalidate();
    }
  );
  useMutationObserver(
    () => document.documentElement,
    () => canvasContext.invalidate(),
    {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    }
  );

  onMount(() => {
    context = ref?.getContext('2d', { willReadFrequently }) as CanvasRenderingContext2D;

    hitCanvasContext = hitCanvasElement?.getContext('2d', {
      willReadFrequently: false, // Explicitly set to `false` to resolve pixel artifacts between fill and stroke with the same color (issue #372)
    }) as CanvasRenderingContext2D;

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  });

  function update() {
    if (!context) return;

    // scale main canvas
    scaleCanvas(context, ctx.containerWidth, ctx.containerHeight);
    context.clearRect(0, 0, ctx.containerWidth, ctx.containerHeight);

    // apply padding translation
    context.translate(ctx.padding.left ?? 0, ctx.padding.top ?? 0);

    let newTranslate: undefined | { x: number; y: number };

    // apply centering or transform
    if (center) {
      newTranslate = {
        x: center === 'x' || center === true ? ctx.width / 2 : 0,
        y: center === 'y' || center === true ? ctx.height / 2 : 0,
      };
      context.translate(newTranslate.x, newTranslate.y);
    } else if (ctx.transform.mode === 'canvas' && !ignoreTransform) {
      context.translate(ctx.transform.translate.x, ctx.transform.translate.y);
      context.scale(ctx.transform.scale, ctx.transform.scale);
    }

    // Recursively render the component tree with proper save/restore scoping
    renderTree(context, rootNode);

    /*
     * Sync hit canvas with main canvas
     */
    if (hitCanvasContext) {
      const inactiveMoving = !activeCanvas && ctx.transform.moving;
      if (disableHitCanvas || ctx.transform.dragging || inactiveMoving) {
        // Skip rendering hit canvas
        hitCanvasContext.clearRect(0, 0, ctx.containerWidth, ctx.containerHeight);
      } else {
        // scale hit canvas to match main canvas
        scaleCanvas(hitCanvasContext, ctx.containerWidth, ctx.containerHeight);
        hitCanvasContext.clearRect(0, 0, ctx.containerWidth, ctx.containerHeight);

        // sync transform with main canvas (padding, center, zoom already applied)
        hitCanvasContext.setTransform(context.getTransform());

        // reset color generator and node map
        colorGenerator = rgbColorGenerator();
        nodeByColor.clear();

        // render hit canvas tree
        renderHitTree(hitCanvasContext, rootNode);
      }
    }

    pendingInvalidation = false;
  }

  /**
   * Recursively render the component tree.
   * Group nodes: save → render (translate/opacity) → recurse children → restore
   * Leaf nodes: save → render → restore
   */
  function renderTree(canvasCtx: CanvasRenderingContext2D, node: ComponentNode) {
    if (node.kind === 'group' && node.canvasRender) {
      // Group: save state, apply transform, render children, restore
      canvasCtx.save();
      node.canvasRender.render(canvasCtx);
      for (const child of node.children) {
        renderTree(canvasCtx, child);
      }
      canvasCtx.restore();
    } else if (node.canvasRender) {
      // Leaf mark: save, render, restore
      canvasCtx.save();
      node.canvasRender.render(canvasCtx);
      canvasCtx.restore();
    } else {
      // Non-rendering node (e.g. root, composite-mark): just recurse children
      for (const child of node.children) {
        renderTree(canvasCtx, child);
      }
    }
  }

  function nodeHasEvents(node: ComponentNode) {
    return node.canvasRender?.events && Object.values(node.canvasRender.events).some((d) => d);
  }

  /**
   * Recursively render the hit canvas tree for pointer event detection.
   * Renders components that have event handlers (or whose ancestor group does), using unique colors.
   */
  function renderHitTree(hitCtx: CanvasRenderingContext2D, node: ComponentNode, ancestorHasEvents = false) {
    if (node.kind === 'group' && node.canvasRender) {
      const groupHasEvents = ancestorHasEvents || nodeHasEvents(node);
      // Group: apply transform, recurse children (scoped by save/restore)
      hitCtx.save();
      node.canvasRender.render(hitCtx);
      for (const child of node.children) {
        renderHitTree(hitCtx, child, groupHasEvents);
      }
      hitCtx.restore();
    } else if (node.canvasRender) {
      if (nodeHasEvents(node) || ancestorHasEvents) {
        const color = getColorStr(colorGenerator.next().value);
        const styleOverrides = { styles: { fill: color, stroke: color, _fillOpacity: 0.1 } };

        hitCtx.save();
        node.canvasRender.render(hitCtx, styleOverrides);
        hitCtx.restore();

        nodeByColor.set(color, node);
      }
    } else {
      // Non-rendering node: recurse children
      for (const child of node.children) {
        renderHitTree(hitCtx, child, ancestorHasEvents);
      }
    }
  }

  function createCanvasContext(): CanvasContextValue {
    // Legacy register method — registration is now handled by the component tree
    // via registerComponentNode. Keep for interface compatibility.
    function register<T extends Element>(_component: ComponentRender<T>) {
      return () => {};
    }

    function invalidate() {
      if (pendingInvalidation) return;
      pendingInvalidation = true;
      frameId = requestAnimationFrame(update);
    }

    return { register, invalidate };
  }

  const canvasContext = createCanvasContext();

  $effect.pre(() => {
    [ctx.height, ctx.width, ctx.containerHeight, ctx.containerWidth, ctx.transform.dragging];
    canvasContext.invalidate();
  });

  setCanvasContext(canvasContext);
  setLayerContext('canvas');
</script>

<canvas
  bind:this={ref}
  style:z-index={zIndex}
  class={['lc-layout-canvas', className]}
  class:disablePointerEvents={pointerEvents === false}
  onclick={(e) => {
    const node = getPointerNode(e);
    bubbleEvent(node, 'click', e);
    onclick?.(e);
  }}
  ondblclick={(e) => {
    const node = getPointerNode(e);
    bubbleEvent(node, 'dblclick', e);
    ondblclick?.(e);
  }}
  onpointerdown={(e) => {
    const node = getPointerNode(e);
    bubbleEvent(node, 'pointerdown', e);
    onpointerdown?.(e);
  }}
  onpointerenter={(e) => {
    onpointerenter?.(e);
    onPointerMove(e);
  }}
  onpointermove={(e) => {
    onpointermove?.(e);
    onPointerMove(e);
  }}
  onpointerleave={(e) => {
    onpointerleave?.(e);
    onPointerLeave(e);
  }}
  ontouchmove={(e) => {
    // Prevent touch from interfering with pointer if over data
    if (lastActiveNode) {
      e.preventDefault();
    }

    const node = getPointerNode(e);
    bubbleEvent(node, 'touchmove', e);
  }}
  {...restProps}
>
  {#if fallback}
    {#if typeof fallback === 'function'}
      {@render fallback()}
    {:else}
      {fallback}
    {/if}
  {/if}
</canvas>

<!-- Hit canvas used for hidden context -->
<canvas bind:this={hitCanvasElement} class="lc-hit-canvas" class:debug></canvas>

{@render children?.({ ref, canvasContext: context })}

<style>
  @layer base {
    :where(.lc-layout-canvas) {
      position: absolute;
      inset: 0;

      &.disablePointerEvents {
        pointer-events: none;
      }
    }

    :where(.lc-hit-canvas) {
      position: absolute;
      inset: 0;
      pointer-events: none; /* events handled by main canvas */
      image-rendering: pixelated; /* https://developer.mozilla.org/en-US/docs/Web/CSS/image-rendering */

      opacity: 0;
      &.debug {
        border: 1px solid var(--color-danger, red);
        opacity: 1;
      }
    }
  }
</style>
