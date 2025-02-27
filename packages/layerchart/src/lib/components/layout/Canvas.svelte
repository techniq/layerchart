<script lang="ts" context="module">
  import { getContext, setContext } from 'svelte';

  type ComponentRender = {
    name: string;
    render: (ctx: CanvasRenderingContext2D, styleOverrides?: ComputedStylesOptions) => any;
    retainState?: boolean;
    events?: {
      click?: (e: MouseEvent) => void;
      dblclick?: (e: MouseEvent) => void;
      pointerenter?: (e: PointerEvent) => void;
      pointerover?: (e: PointerEvent) => void;
      pointermove?: (e: PointerEvent) => void;
      pointerleave?: (e: PointerEvent) => void;
      pointerout?: (e: PointerEvent) => void;
      pointerdown?: (e: PointerEvent) => void;
      touchmove?: (e: TouchEvent) => void;
    };
  };

  export type CanvasContext = {
    /** Register component to render.  Returns method to unregister on component destory */
    register(component: ComponentRender): () => void;
    invalidate(): void;
  };

  export const canvasContextKey = Symbol();

  export function getCanvasContext() {
    return getContext<CanvasContext>(canvasContextKey);
  }

  function setCanvasContext(context: CanvasContext) {
    setContext(canvasContextKey, context);
  }
</script>

<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { cls } from '@layerstack/tailwind';
  import { Logger, localPoint } from '@layerstack/utils';

  import { setRenderContext } from '../Chart.svelte';
  import { chartContext } from '../ChartContext.svelte';
  import { transformContext } from '../TransformContext.svelte';
  import { getPixelColor, scaleCanvas, type ComputedStylesOptions } from '../../utils/canvas.js';
  import { getColorStr, rgbColorGenerator } from '../../utils/color.js';
  const { width, height, containerWidth, containerHeight, padding } = chartContext();

  /** The `<canvas>` tag. Useful for bindings. */
  export let element: HTMLCanvasElement | undefined = undefined;

  /** The `<canvas>`'s 2d context. Useful for bindings. */
  // @ts-expect-error: set during onMount()
  export let context: CanvasRenderingContext2D = undefined;

  /** Force the use of a software (instead of hardware accelerated) 2D canvas and can save memory when calling getImageData() frequently.
   * see: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext#willreadfrequently */
  export let willReadFrequently = false;

  /** The layer's z-index. */
  export let zIndex = undefined;

  /** Set this to `false` to set `pointer-events: none;` on the entire layer. */
  export let pointerEvents: boolean | undefined = undefined;

  /** Text to display if the browser won't render a canvas tag. You can also set arbitrary HTML via the "fallback" slot but this is fine if you just need text. If you use the "fallback" slot, this prop is ignored. */
  export let fallback = '';

  /** A string passed to the `aria-label` on the `<canvas>` tag. */
  export let label: string | undefined = undefined;

  /** A string passed to the `aria-labelledby` on the `<canvas>` tag. */
  export let labelledBy: string | undefined = undefined;

  /** A string passed to `aria-describedby` property on the `<canvas>` tag. */
  export let describedBy: string | undefined = undefined;

  /**
   * Translate children to center (useful for radial layouts)
   */
  export let center: boolean | 'x' | 'y' = false;

  /** Show hit canvas for debugging */
  export let debug = false;

  const logger = new Logger('Canvas');

  let components = new Map<Symbol, ComponentRender>();
  let pendingInvalidation = false;
  let frameId: number | undefined;

  const { mode, scale, translate, dragging, moving } = transformContext();

  /**
   * HitCanvas
   */
  let hitCanvasElement: HTMLCanvasElement | undefined = undefined;
  let hitCanvasContext: CanvasRenderingContext2D | undefined = undefined;
  let colorGenerator = rgbColorGenerator();
  let activeCanvas = false;
  let lastActiveComponent: ComponentRender | undefined | null;
  const componentByColor = new Map<string, ComponentRender>();

  function getPointerComponent(e: PointerEvent | MouseEvent | TouchEvent) {
    const { x, y } = localPoint(e);
    const color = getPixelColor(hitCanvasContext!, x, y);
    const colorKey = getColorStr(color);
    const component = componentByColor.get(colorKey);
    logger.debug({ colorKey, component, componentByColor });
    return component;
  }

  function onPointerMove(e: PointerEvent) {
    activeCanvas = true;
    const component = getPointerComponent(e);

    if (lastActiveComponent == null) {
      // TODO: Should these be handled differently
      component?.events?.pointerenter?.(e);
      component?.events?.pointerover?.(e);
    } else if (lastActiveComponent != component) {
      // TODO: Should these be handled differently
      lastActiveComponent?.events?.pointerleave?.(e);
      lastActiveComponent?.events?.pointerout?.(e);

      component?.events?.pointermove?.(e);
    } else {
      component?.events?.pointermove?.(e);
    }

    lastActiveComponent = component;
  }

  function onPointerLeave(e: PointerEvent) {
    // Pointer outside of canvas

    // Call last active component `pointerleave` event in case it was not triggered by hit canvas (quickly exiting canvas element before `pointermove` is triggered)
    lastActiveComponent?.events?.pointerleave?.(e);
    lastActiveComponent?.events?.pointerout?.(e);

    lastActiveComponent = null;
    activeCanvas = false;
  }
  /**
   * end HitCanvas
   */

  onMount(() => {
    context = element?.getContext('2d', { willReadFrequently }) as CanvasRenderingContext2D;

    hitCanvasContext = hitCanvasElement?.getContext('2d', {
      willReadFrequently: false, // Explicitly set to `false` to resolve pixel artifacts between fill and stroke with the same color (issue #372)
    }) as CanvasRenderingContext2D;
  });

  onDestroy(() => {
    if (frameId) {
      cancelAnimationFrame(frameId);
    }
  });

  function update() {
    if (!context) return;
    // TODO: only `scaleCanvas()` when containerWidth/Height change (not all invalidations)
    // scaleCanvas in `update()` to fix `requestAnimationFrame()` timing causing flash of blank canvas
    scaleCanvas(context, $containerWidth, $containerHeight);

    context.clearRect(0, 0, $containerWidth, $containerHeight);

    context.translate($padding.left ?? 0, $padding.top ?? 0);

    if (center) {
      const newTranslate = {
        x: center === 'x' || center === true ? $width / 2 : 0,
        y: center === 'y' || center === true ? $height / 2 : 0,
      };
      context.translate(newTranslate.x, newTranslate.y);
    } else if (mode === 'canvas') {
      context.translate($translate.x, $translate.y);
      context.scale($scale, $scale);
    }

    // Sync hit canvas transform with main canvas
    if (hitCanvasContext) {
      scaleCanvas(hitCanvasContext, $containerWidth, $containerHeight);
      hitCanvasContext.clearRect(0, 0, $containerWidth, $containerHeight);
      hitCanvasContext.setTransform(context.getTransform());

      // Reset color generator whenever updated so always reusing same colors (and not exhausting)
      colorGenerator = rgbColorGenerator();
    }

    components.forEach((c) => {
      if (c.retainState) {
        // Do not call save/restore canvas draw state (https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/save) (ex. Group ctx.translate() affecting children)
        c.render(context);
      } else {
        context.save();
        c.render(context);
        context.restore();
      }

      // Delayed rendering using `activeCanvas` can cause a delay for tooltip interactivity for complex canvases (ex. country choropleth) so only ignore while moving/animating programmatically (ex. clicking on countries on Animated Globe)
      const inactiveMoving = !activeCanvas && $moving;

      const componentHasEvents = c.events && Object.values(c.events).filter((d) => d).length > 0;

      if (hitCanvasContext && componentHasEvents && !inactiveMoving && !$dragging) {
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
    });

    pendingInvalidation = false;
  }

  const canvasContext: CanvasContext = {
    register(component) {
      const key = Symbol();
      components.set(key, component);
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

  $: {
    // Redraw when resized or transform dragging changes.  Note: adding `activeCanvas` (pointer enters/exits canvas) causes initial interactivity issues while canvas is rendering and is not needed
    $containerWidth, $containerHeight && $dragging;
    canvasContext.invalidate();
  }

  setCanvasContext(canvasContext);
  setRenderContext('canvas');
</script>

<canvas
  bind:this={element}
  style:z-index={zIndex}
  class={cls(
    'layercake-layout-canvas',
    'absolute top-0 left-0 w-full h-full',
    pointerEvents === false && 'pointer-events-none',
    $$props.class
  )}
  aria-label={label}
  aria-labelledby={labelledBy}
  aria-describedby={describedBy}
  on:click={(e) => {
    const component = getPointerComponent(e);
    component?.events?.click?.(e);
  }}
  on:click
  on:dblclick={(e) => {
    const component = getPointerComponent(e);
    component?.events?.dblclick?.(e);
  }}
  on:pointerdown={(e) => {
    const component = getPointerComponent(e);
    component?.events?.pointerdown?.(e);
  }}
  on:pointerenter={onPointerMove}
  on:pointerenter
  on:pointermove={onPointerMove}
  on:pointermove
  on:pointerleave={onPointerLeave}
  on:pointerleave
  on:touchmove={(e) => {
    // Prevent touch from interfering with pointer if over data
    if (lastActiveComponent) {
      e.preventDefault();
    }

    const component = getPointerComponent(e);
    component?.events?.touchmove?.(e);
  }}
  on:touchmove
>
  <slot name="fallback">
    {fallback || ''}
  </slot>
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

<slot {element} {context}></slot>
