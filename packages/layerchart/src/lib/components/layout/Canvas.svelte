<script lang="ts" module>
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

  // TODO: consider adding a dependency array option here, which would trigger
  // invalidate when any of those values change, rather than needing to do it in every
  // component
  type ComponentRender<T extends Element = Element> = {
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
    // @ts-expect-error - shh
    register: () => {},
    invalidate: () => {},
  };

  export function getCanvasContext() {
    return CanvasContext.getOr(defaultCanvasContext);
  }

  function setCanvasContext(context: CanvasContextValue) {
    return CanvasContext.set(context);
  }
</script>

<script lang="ts">
  import { onMount, type Snippet } from 'svelte';
  import { cls } from '@layerstack/tailwind';
  import { Logger, localPoint } from '@layerstack/utils';
  import { darkColorScheme } from '@layerstack/svelte-stores';

  import { setRenderContext } from '../Chart.svelte';
  import { getTransformContext } from '../TransformContext.svelte';
  import { getPixelColor, scaleCanvas, type ComputedStylesOptions } from '../../utils/canvas.js';
  import { getColorStr, rgbColorGenerator } from '../../utils/color.js';
  import { Context, watch } from 'runed';
  import type {
    HTMLCanvasAttributes,
    MouseEventHandler,
    PointerEventHandler,
    TouchEventHandler,
  } from 'svelte/elements';
  import type { Without } from 'layerchart/utils/types.js';
  import { getChartContext } from '../Chart.svelte';
  import { createDataAttr } from 'layerchart/utils/attributes.js';

  let {
    ref = $bindable(),
    canvasContext: context = $bindable(),
    willReadFrequently = false,
    debug = false,
    zIndex = 0,
    pointerEvents = true,
    fallback,
    center = false,
    ignoreTransform = false,
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

  const ctx = getChartContext();
  const transformCtx = getTransformContext();

  const logger = new Logger('Canvas');

  let components = new Map<Symbol, ComponentRender<Element>>();
  let pendingInvalidation = false;
  let frameId: number | undefined;

  /**
   * HitCanvas
   */
  let hitCanvasElement = $state<HTMLCanvasElement>();
  let hitCanvasContext = $state<CanvasRenderingContext2D>();
  let colorGenerator = rgbColorGenerator();
  let activeCanvas = $state(false);
  let lastActiveComponent = $state<ComponentRender | null | undefined>();

  const componentByColor = new Map<string, ComponentRender>();

  function getPointerComponent(e: PointerEvent | MouseEvent | TouchEvent) {
    const { x, y } = localPoint(e);
    const color = getPixelColor(hitCanvasContext!, x, y);
    const colorKey = getColorStr(color);
    const component = componentByColor.get(colorKey);
    logger.debug({ colorKey, component, componentByColor });
    return component;
  }

  const onPointerMove: PointerEventHandler<Element> = (e) => {
    activeCanvas = true;
    const component = getPointerComponent(e);

    if (component != lastActiveComponent) {
      // TODO: Should `pointerleave`/`pointerout` and `pointerenter`/`pointerover` be handled differently?
      if (lastActiveComponent) {
        lastActiveComponent.events?.pointerleave?.(e);
        lastActiveComponent.events?.pointerout?.(e);
      }

      component?.events?.pointerenter?.(e);
      component?.events?.pointerover?.(e);
    }
    component?.events?.pointermove?.(e);

    lastActiveComponent = component;
  };

  const onPointerLeave: PointerEventHandler<Element> = (e) => {
    // Pointer outside of canvas

    // Call last active component `pointerleave` event in case it was not triggered by hit canvas (quickly exiting canvas element before `pointermove` is triggered)
    lastActiveComponent?.events?.pointerleave?.(e);
    lastActiveComponent?.events?.pointerout?.(e);

    lastActiveComponent = null;
    activeCanvas = false;
  };
  /**
   * end HitCanvas
   */

  onMount(() => {
    context = ref?.getContext('2d', { willReadFrequently }) as CanvasRenderingContext2D;

    hitCanvasContext = hitCanvasElement?.getContext('2d', {
      willReadFrequently: false, // Explicitly set to `false` to resolve pixel artifacts between fill and stroke with the same color (issue #372)
    }) as CanvasRenderingContext2D;

    // Invalidate/redraw if color scheme changes, either via browser `prefers-color-scheme` (including emulation) or by changing `<html class="dark">` or `<html data-theme="...">`
    darkColorScheme.subscribe(() => {
      canvasContext.invalidate();
    });

    const observer = new MutationObserver(() => {
      canvasContext.invalidate();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    });

    return () => {
      observer.disconnect();
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  });

  function update() {
    if (!context) return;
    // TODO: only `scaleCanvas()` when containerWidth/Height change (not all invalidations)
    // scaleCanvas in `update()` to fix `requestAnimationFrame()` timing causing flash of blank canvas
    scaleCanvas(context, ctx.containerWidth, ctx.containerHeight);

    context.clearRect(0, 0, ctx.containerWidth, ctx.containerHeight);

    context.translate(ctx.padding.left ?? 0, ctx.padding.top ?? 0);

    if (center) {
      const newTranslate = {
        x: center === 'x' || center === true ? ctx.width / 2 : 0,
        y: center === 'y' || center === true ? ctx.height / 2 : 0,
      };
      context.translate(newTranslate.x, newTranslate.y);
    } else if (transformCtx.mode === 'canvas' && !ignoreTransform) {
      context.translate(transformCtx.translate.x, transformCtx.translate.y);
      context.scale(transformCtx.scale, transformCtx.scale);
    }

    // Sync hit canvas transform with main canvas
    if (hitCanvasContext) {
      scaleCanvas(hitCanvasContext, ctx.containerWidth, ctx.containerHeight);
      hitCanvasContext.clearRect(0, 0, ctx.containerWidth, ctx.containerHeight);
      hitCanvasContext.setTransform(context.getTransform());

      // Reset color generator whenever updated so always reusing same colors (and not exhausting)
      colorGenerator = rgbColorGenerator();
    }

    for (const [_, c] of components) {
      if (c.retainState) {
        // Do not call save/restore canvas draw state (https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/save) (ex. Group ctx.translate() affecting children)
        c.render(context);
      } else {
        context.save();
        c.render(context);
        context.restore();
      }

      // Delayed rendering using `activeCanvas` can cause a delay for tooltip interactivity for complex canvases (ex. country choropleth) so only ignore while moving/animating programmatically (ex. clicking on countries on Animated Globe)
      const inactiveMoving = !activeCanvas && transformCtx.moving;

      const componentHasEvents = c.events && Object.values(c.events).filter((d) => d).length > 0;

      if (hitCanvasContext && componentHasEvents && !inactiveMoving && !transformCtx.dragging) {
        const color = getColorStr(colorGenerator.next().value);
        // Stroking shape seems to help with dark border, but there is still antialising and thus gaps
        const styleOverrides = { styles: { fill: color, stroke: color, _fillOpacity: 0.1 } };

        if (c.retainState) {
          c.render(hitCanvasContext, styleOverrides);
        } else {
          hitCanvasContext.save();
          c.render(hitCanvasContext, styleOverrides);
          hitCanvasContext.restore();
        }

        componentByColor.set(color, c);
      }
    }

    pendingInvalidation = false;
  }

  const canvasContext: CanvasContextValue = {
    register(component) {
      const key = Symbol();
      components.set(key, component as ComponentRender<Element>);
      this.invalidate();

      // Unregister
      return () => {
        components.delete(key);
        this.invalidate();
      };
    },
    invalidate() {
      if (pendingInvalidation) return;
      pendingInvalidation = true;
      frameId = requestAnimationFrame(update);
    },
  };

  watch.pre(
    [() => ctx.containerHeight, () => ctx.containerWidth, () => transformCtx.dragging],
    () => {
      canvasContext.invalidate();
    }
  );

  setCanvasContext(canvasContext);
  setRenderContext('canvas');
</script>

<canvas
  bind:this={ref}
  {...createDataAttr('layout-canvas')}
  style:z-index={zIndex}
  class={cls(
    'absolute top-0 left-0 w-full h-full',
    pointerEvents === false && 'pointer-events-none',
    className
  )}
  onclick={(e) => {
    const component = getPointerComponent(e);
    component?.events?.click?.(e);
    onclick?.(e);
  }}
  ondblclick={(e) => {
    const component = getPointerComponent(e);
    component?.events?.dblclick?.(e);
    ondblclick?.(e);
  }}
  onpointerdown={(e) => {
    const component = getPointerComponent(e);
    component?.events?.pointerdown?.(e);
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
    ontouchmove?.(e);
    // Prevent touch from interfering with pointer if over data
    if (lastActiveComponent) {
      e.preventDefault();
    }

    const component = getPointerComponent(e);
    component?.events?.touchmove?.(e);
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
<canvas
  bind:this={hitCanvasElement}
  class={cls(
    'layerchart-hitcanvas',
    'absolute top-0 left-0 w-full h-full',
    'pointer-events-none', // events all handled by main canvas
    // '[image-rendering:pixelated]', // https://developer.mozilla.org/en-US/docs/Web/CSS/image-rendering
    'border border-danger',
    !debug && 'opacity-0'
  )}
></canvas>

{@render children?.({ ref, canvasContext: context })}
