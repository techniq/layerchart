<script lang="ts" module>
  import type { Snippet } from 'svelte';
  import type { MarkerOptions } from './MarkerWrapper.svelte';
  import type { CommonStyleProps, Without } from '$lib/utils/types.js';
  import type { SVGAttributes } from 'svelte/elements';

  import {
    createControlledMotion,
    createMotion,
    extractTweenConfig,
    type MotionProp,
    type ResolvedMotion,
  } from '$lib/utils/motion.svelte.js';

  export type PathPropsWithoutHTML = {
    /**
     * Pass `<path d={...} />` explicitly instead of calculating
     * from data / context
     */
    pathData?: string | undefined | null;

    /**
     * Whether to animate the drawing of the path over time.
     * Pass either `true` or an object with transition options to
     * enable the transition.
     *
     * Works best with `tweened` disabled.
     */
    draw?: boolean | Parameters<typeof _drawTransition>[1];

    /**
     * Marker to attach to both start and end points of the line
     */
    marker?: MarkerOptions;

    /**
     * Marker to attach to the middle point of the line
     */
    markerMid?: MarkerOptions;

    /**
     * Marker to attach to the start point of the line
     */
    markerStart?: MarkerOptions;

    /**
     * Marker to attach to the end point of the line
     */
    markerEnd?: MarkerOptions;

    /**
     * Add additional content at the start of the line.
     *
     * Receives `{ point: DOMPoint; value: { x: number; y: number } }` as a snippet prop.
     */
    startContent?: Snippet<[{ point: DOMPoint; value: { x: number; y: number } }]>;

    /**
     * Add additional content at the end of the line.
     *
     * Receives `{ point: DOMPoint; value: { x: number; y: number } }` as a snippet prop.
     */
    endContent?: Snippet<[{ point: DOMPoint; value: { x: number; y: number } }]>;

    /**
     * A reference to the `<path>` element.
     *
     * @bindable
     */
    pathRef?: SVGPathElement;

    motion?: MotionProp;
  } & CommonStyleProps;

  export type PathProps = PathPropsWithoutHTML &
    Without<SVGAttributes<SVGPathElement>, PathPropsWithoutHTML>;
</script>

<script lang="ts">
  import { tick } from 'svelte';
  import { draw as _drawTransition } from 'svelte/transition';
  import { cubicInOut } from 'svelte/easing';
  import { merge } from '@layerstack/utils';

  import { interpolatePath } from 'd3-interpolate-path';
  import { cls } from '@layerstack/tailwind';

  import Group from './Group.svelte';
  import { flattenPathData } from '../utils/path.js';
  import { registerCanvasComponent } from './layers/Canvas.svelte';
  import { renderPathData, type ComputedStylesOptions } from '$lib/utils/canvas.js';
  import { getLayerContext } from '$lib/contexts/layer.js';
  import MarkerWrapper from './MarkerWrapper.svelte';
  import { getChartContext } from '$lib/contexts/chart.js';
  import { createKey } from '$lib/utils/key.svelte.js';
  import { createId } from '$lib/utils/createId.js';

  const ctx = getChartContext();

  const uid = $props.id();

  let {
    pathData,
    x,
    y,
    motion,
    draw,
    fill,
    stroke,
    strokeWidth,
    fillOpacity,
    class: className,
    marker,
    markerStart: markerStartProp,
    markerMid: markerMidProp,
    markerEnd: markerEndProp,
    startContent,
    endContent,
    opacity,
    pathRef: pathRefProp = $bindable(),
    ...restProps
  }: PathProps = $props();

  let pathRef = $state<SVGPathElement>();

  $effect.pre(() => {
    pathRefProp = pathRef;
  });

  const markerStart = $derived(markerStartProp ?? marker);
  const markerMid = $derived(markerMidProp ?? marker);
  const markerEnd = $derived(markerEndProp ?? marker);

  const markerStartId = $derived(markerStart ? createId('marker-start', uid) : '');
  const markerMidId = $derived(markerMid ? createId('marker-mid', uid) : '');
  const markerEndId = $derived(markerEnd ? createId('marker-end', uid) : '');

  const extractedTween = extractTweenConfig(motion);

  const tweenedOptions: ResolvedMotion | undefined = extractedTween
    ? {
        type: extractedTween.type,
        options: { interpolate: interpolatePath, ...extractedTween.options },
      }
    : undefined;

  /** Provide initial `0` horizontal baseline and initially hide/untrack scale changes so not reactive (only set on initial mount) */
  function defaultPathData() {
    if (!tweenedOptions) {
      // If not tweened, return empty string (faster initial render)
      return '';
    } else if (pathData) {
      // Flatten all `y` coordinates of pre-defined `pathData`
      return flattenPathData(pathData, Math.min(ctx.yScale(0) ?? ctx.yRange[0], ctx.yRange[0]));
    }
  }

  const d = $derived.by(() => {
    return pathData;
  });

  const tweenedState = createMotion(defaultPathData(), () => d, tweenedOptions);

  const drawTransition = $derived(draw ? _drawTransition : () => ({}));

  let key = $state(Symbol());

  const layerCtx = getLayerContext();

  function render(
    ctx: CanvasRenderingContext2D,
    styleOverrides: ComputedStylesOptions | undefined
  ) {
    renderPathData(
      ctx,
      tweenedState.current,
      styleOverrides
        ? merge({ styles: { strokeWidth } }, styleOverrides)
        : {
            styles: { fill, fillOpacity, stroke, strokeWidth, opacity },
            classes: cls('lc-path', className),
          }
    );
  }

  // TODO: Use objectId to work around Svelte 4 reactivity issue (even when memoizing gradients)
  const fillKey = createKey(() => fill);
  const strokeKey = createKey(() => stroke);

  if (layerCtx === 'canvas') {
    registerCanvasComponent({
      name: 'Path',
      render,
      events: {
        click: restProps.onclick,
        pointerenter: restProps.onpointerenter,
        pointermove: restProps.onpointermove,
        pointerleave: restProps.onpointerleave,
        pointerdown: restProps.onpointerdown,
        pointerover: restProps.onpointerover,
        pointerout: restProps.onpointerout,
        touchmove: restProps.ontouchmove,
      },
      deps: () => [
        fillKey.current,
        fillOpacity,
        strokeKey.current,
        strokeWidth,
        opacity,
        className,
        tweenedState.current,
      ],
    });
  }

  let startPoint = $state<DOMPoint | undefined>();

  const endPointDuration = $derived.by(() => {
    if (
      typeof draw === 'object' &&
      draw.duration !== undefined &&
      typeof draw.duration !== 'function'
    ) {
      return draw.duration;
    }
    return 800;
  });

  const endPoint = createControlledMotion<DOMPoint | undefined>(
    undefined,
    draw
      ? {
          type: 'tween',
          duration: () => endPointDuration,
          easing: typeof draw === 'object' && draw.easing ? draw.easing : cubicInOut,
          interpolate() {
            return (t: number) => {
              const totalLength = pathRef?.getTotalLength() ?? 0;
              const point = pathRef?.getPointAtLength(totalLength * t);
              return point;
            };
          },
        }
      : { type: 'none' }
  );

  $effect(() => {
    if (!startContent && !endContent) return;
    d;
    if (!pathRef) return;

    // Wait for DOM to update before querying path geometry
    tick().then(() => {
      if (!pathRef) return;
      const totalLength = pathRef.getTotalLength();
      if (!totalLength) return;

      startPoint = pathRef.getPointAtLength(0);
      endPoint.target = pathRef.getPointAtLength(totalLength);
    });
  });

  $effect(() => {
    if (!draw) return;
    // Anytime the path data changes, redraw
    [pathData /*, data, ctx.data*/];
    key = Symbol();
  });
</script>

{#if layerCtx === 'svg'}
  {#key key}
    <path
      d={tweenedState.current}
      {...restProps}
      class={cls('lc-path', className)}
      {fill}
      fill-opacity={fillOpacity}
      {stroke}
      stroke-width={strokeWidth}
      {opacity}
      marker-start={markerStartId ? `url(#${markerStartId})` : undefined}
      marker-mid={markerMidId ? `url(#${markerMidId})` : undefined}
      marker-end={markerEndId ? `url(#${markerEndId})` : undefined}
      in:drawTransition|global={typeof draw === 'object' ? draw : undefined}
      bind:this={pathRef}
    />
    <MarkerWrapper id={markerStartId} marker={markerStart} />
    <MarkerWrapper id={markerMidId} marker={markerMid} />
    <MarkerWrapper id={markerEndId} marker={markerEnd} />

    {#if startContent && startPoint}
      <Group x={startPoint.x} y={startPoint.y} class="lc-path-g-start">
        {@render startContent({
          point: startPoint,
          value: {
            x: ctx.xScale?.invert?.(startPoint.x),
            y: ctx.yScale?.invert?.(startPoint.y),
          },
        })}
      </Group>
    {/if}

    {#if endContent && endPoint.current}
      <Group x={endPoint.current.x} y={endPoint.current.y} class="lc-path-g-end">
        {@render endContent({
          point: endPoint.current,
          value: {
            x: ctx.xScale?.invert?.(endPoint.current.x),
            y: ctx.yScale?.invert?.(endPoint.current.y),
          },
        })}
      </Group>
    {/if}
  {/key}
{/if}

<style>
  @layer base {
    :global(:where(.lc-path)) {
      /* Use transparent to enable pointer events */
      --fill-color: transparent;
      --stroke-color: var(--color-surface-content, currentColor);
    }

    /* Svg | Canvas layers */
    :global(:where(.lc-layout-svg .lc-path, svg.lc-path):not([fill])) {
      fill: var(--fill-color);
    }
    :global(:where(.lc-layout-svg .lc-path, svg.lc-path):not([stroke])) {
      stroke: var(--stroke-color);
    }

    /* Html layers */
    :global(:where(.lc-layout-html .lc-path):not([background-color])) {
      background-color: var(--fill-color);
    }
    :global(:where(.lc-layout-html .lc-path):not([border-color])) {
      border-color: var(--stroke-color);
    }
  }
</style>
