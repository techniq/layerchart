<script lang="ts">
  import { onDestroy, tick, type ComponentProps, type Snippet } from 'svelte';
  import { writable } from 'svelte/store';
  import { draw as _drawTransition } from 'svelte/transition';
  import { cubicInOut } from 'svelte/easing';
  import { merge } from 'lodash-es';

  import { line as d3Line, lineRadial } from 'd3-shape';
  import type { CurveFactory, CurveFactoryLineOnly, Line } from 'd3-shape';
  // import { interpolateString } from 'd3-interpolate';
  import { interpolatePath } from 'd3-interpolate-path';
  import { max } from 'd3-array';
  import { cls } from '@layerstack/tailwind';
  import { uniqueId } from '@layerstack/utils';
  import { objectId } from '@layerstack/utils/object';

  import { chartContext } from './ChartContext.svelte';
  import Group from './Group.svelte';
  import Marker from './Marker.svelte';

  import { motionStore, type TweenedOptions } from '$lib/stores/motionStore.js';
  import { accessor, type Accessor } from '../utils/common.js';
  import { isScaleBand } from '../utils/scales.js';
  import { flattenPathData } from '../utils/path.js';
  import { getCanvasContext } from './layout/Canvas.svelte';
  import { renderPathData, type ComputedStylesOptions } from '$lib/utils/canvas.js';
  import { getRenderContext } from './Chart.svelte';

  const {
    data: contextData,
    xScale,
    yScale,
    x: contextX,
    y: contextY,
    yRange,
    radial,
    config,
  } = chartContext();

  type MarkerOptions = ComponentProps<typeof Marker>['type'] | ComponentProps<typeof Marker>;

  let {
    data,
    pathData,
    x,
    y,
    tweened,
    draw,
    curve,
    defined,
    fill,
    stroke,
    strokeWidth,
    fillOpacity,
    class: className,
    markerOptions,
    markerStartOptions,
    markerMidOptions,
    markerEndOptions,
    markerStart,
    markerMid,
    markerEnd,
    opacity,
    ...restProps
  }: {
    /** Override data instead of using context */
    data?: any;
    /** Pass `<path d={...} />` explicitly instead of calculating from data / context */
    pathData?: string | undefined | null;
    /** Override `x` accessor from Chart context */
    x?: Accessor;
    /** Override `y` accessor from Chart context */
    y?: Accessor;
    /** Interpolate path data using d3-interpolate-path.  Works best without `draw` enabled */
    tweened?: boolean | TweenedOptions;
    /** Draw path over time.  Works best without `tweened` enabled */
    draw?: boolean | Parameters<typeof _drawTransition>[1];
    /**
     * Curve of spline drawn. Imported via d3-shape.
     *
     * @example
     * import { curveNatural } from 'd3-shape';
     * <Spline curve={curveNatrual} />
     *
     * @type {CurveFactory | CurveFactoryLineOnly | undefined}
     */
    curve?: CurveFactory | CurveFactoryLineOnly;
    defined?: Parameters<Line<any>['defined']>[0];
    fill?: string;
    fillOpacity?: number;
    stroke?: string;
    strokeWidth?: number;
    class?: string;
    onclick?: (e: MouseEvent) => void;
    onpointerenter?: (e: PointerEvent) => void;
    onpointermove?: (e: PointerEvent) => void;
    onpointerleave?: (e: PointerEvent) => void;
    onpointerdown?: (e: PointerEvent) => void;
    ontouchmove?: (e: TouchEvent) => void;
    onpointerover?: (e: PointerEvent) => void;
    onpointerout?: (e: PointerEvent) => void;
    markerOptions?: MarkerOptions;
    markerStartOptions?: MarkerOptions;
    markerMidOptions?: MarkerOptions;
    markerEndOptions?: MarkerOptions;
    /** Marker to attach to start point of path */
    markerStart?: Snippet<[{ id: string }]>;
    /** Marker to attach to all mid points of path */
    markerMid?: Snippet<[{ id: string }]>;
    /** Marker to attach to end point of path */
    markerEnd?: Snippet<[{ id: string }]>;
    opacity?: number | string;
  } = $props();

  const markerStartId = $derived(markerStartOptions || markerStart ? uniqueId('marker-') : '');
  const markerMidId = $derived(markerMidOptions || markerMid ? uniqueId('marker-') : '');
  const markerEndId = $derived(markerEndOptions || markerEnd ? uniqueId('marker-') : '');

  function getScaleValue(data: any, scale: typeof $xScale | typeof $yScale, accessor: Function) {
    let value = accessor(data);

    if (Array.isArray(value)) {
      value = max(value);
    }

    if (scale.domain().length) {
      // If scale is defined with domain, map value
      return scale(value);
    } else {
      // Use raw value
      return value;
    }
  }

  const xAccessor = $derived(x ? accessor(x) : $contextX);
  const yAccessor = $derived(y ? accessor(y) : $contextY);

  const yOffset = $derived(isScaleBand($xScale) ? $xScale.bandwidth() / 2 : 0);
  const xOffset = $derived(isScaleBand($yScale) ? $yScale.bandwidth() / 2 : 0);

  /** Provide initial `0` horizontal baseline and initially hide/untrack scale changes so not reactive (only set on initial mount) */
  function defaultPathData() {
    if (!tweenedOptions) {
      // If not tweened, return empty string (faster initial render)
      return '';
    } else if (pathData) {
      // Flatten all `y` coordinates of pre-defined `pathData`
      return flattenPathData(pathData, Math.min($yScale(0), $yRange[0]));
    } else if ($config.x) {
      // Only use default line if `x` accessor is defined (cartesian chart)
      const path = $radial
        ? lineRadial()
            .angle((d) => $xScale(xAccessor(d)))
            .radius((d) => Math.min($yScale(0), $yRange[0]))
        : d3Line()
            .x((d) => $xScale(xAccessor(d)) + xOffset)
            .y((d) => Math.min($yScale(0), $yRange[0]));

      path.defined(defined ?? ((d) => xAccessor(d) != null && yAccessor(d) != null));

      if (curve) path.curve(curve);

      return path(data ?? $contextData);
    }
  }

  let d: string | null = '';
  const tweenedOptions = tweened
    ? { interpolate: interpolatePath, ...(typeof tweened === 'object' ? tweened : null) }
    : false;
  $: tweened_d = motionStore(defaultPathData(), { tweened: tweenedOptions });
  $: {
    const path = $radial
      ? lineRadial()
          .angle((d) => getScaleValue(d, $xScale, xAccessor))
          .radius((d) => getScaleValue(d, $yScale, yAccessor))
      : d3Line()
          .x((d) => getScaleValue(d, $xScale, xAccessor) + xOffset)
          .y((d) => getScaleValue(d, $yScale, yAccessor) + yOffset);

    path.defined(defined ?? ((d) => xAccessor(d) != null && yAccessor(d) != null));

    if (curve) path.curve(curve);

    d = pathData ?? path(data ?? $contextData) ?? '';
    tweened_d.set(d);
  }

  $: drawTransition = draw ? _drawTransition : () => ({});

  let key = Symbol();
  $: if (draw) {
    // Anytime the path data changes, redraw
    $tweened_d;
    key = Symbol();
  }

  const renderContext = getRenderContext();
  const canvasContext = getCanvasContext();

  function render(
    ctx: CanvasRenderingContext2D,
    styleOverrides: ComputedStylesOptions | undefined
  ) {
    renderPathData(
      ctx,
      $tweened_d,
      styleOverrides
        ? merge({ styles: { strokeWidth } }, styleOverrides)
        : {
            styles: { fill, fillOpacity, stroke, strokeWidth, opacity },
            classes: className,
          }
    );
  }

  // TODO: Use objectId to work around Svelte 4 reactivity issue (even when memoizing gradients)
  $: fillKey = fill && typeof fill === 'object' ? objectId(fill) : fill;
  $: strokeKey = stroke && typeof stroke === 'object' ? objectId(stroke) : stroke;

  $: if (renderContext === 'canvas') {
    // Redraw when props change
    $tweened_d && fillKey && fillOpacity && strokeKey && strokeWidth && className;
    canvasContext.invalidate();
  }

  let canvasUnregister: ReturnType<typeof canvasContext.register>;
  $: if (renderContext === 'canvas') {
    canvasUnregister = canvasContext.register({
      name: 'Spline',
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
    });
  }

  onDestroy(() => {
    if (renderContext === 'canvas') {
      canvasUnregister();
    }
  });

  let pathEl: SVGPathElement | undefined = undefined;
  const startPoint = writable<DOMPoint | undefined>(undefined);
  $: endPoint = motionStore<DOMPoint | undefined>(undefined, {
    tweened: draw
      ? {
          duration: (typeof draw === 'object' && draw.duration) || 800,
          easing: (typeof draw === 'object' && draw.easing) || cubicInOut,
          interpolate(a, b) {
            return (t: number) => {
              const totalLength = pathEl?.getTotalLength() ?? 0;
              const point = pathEl?.getPointAtLength(totalLength * t);
              return point;
            };
          },
        }
      : false,
  });

  $: {
    if ($$slots.start || $$slots.end) {
      // Wait for path data to update DOM, then update
      d;
      tick().then(() => {
        if (pathEl) {
          startPoint.set(pathEl.getPointAtLength(0));

          const totalLength = pathEl.getTotalLength();
          endPoint.set(pathEl.getPointAtLength(totalLength));
        }
      });
    }
  }
</script>

{#if renderContext === 'svg'}
  {#key key}
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <path
      d={$tweened_d}
      {...$$restProps}
      class={cls('path-line', !fill && 'fill-none', !stroke && 'stroke-surface-content', className)}
      {fill}
      fill-opacity={fillOpacity}
      {stroke}
      stroke-width={strokeWidth}
      {opacity}
      marker-start={markerStartId ? `url(#${markerStartId})` : undefined}
      marker-mid={markerMidId ? `url(#${markerMidId})` : undefined}
      marker-end={markerEndId ? `url(#${markerEndId})` : undefined}
      in:drawTransition|global={typeof draw === 'object' ? draw : undefined}
      on:click={onclick}
      on:pointerenter={onpointerenter}
      on:pointermove={onpointermove}
      on:pointerleave={onpointerleave}
      on:pointerdown={onpointerdown}
      on:pointerover={onpointerover}
      on:pointerout={onpointerout}
      on:touchmove={ontouchmove}
      bind:this={pathEl}
    />

    <slot name="markerStart" id={markerStartId}>
      {#if markerStart}
        <Marker
          id={markerStartId}
          type={typeof markerStart === 'string' ? markerStart : undefined}
          {...typeof markerStart === 'object' ? markerStart : null}
        />
      {/if}
    </slot>

    <slot name="markerMid" id={markerMidId}>
      <Marker
        id={markerMidId}
        type={typeof markerMid === 'string' ? markerMid : undefined}
        {...typeof markerMid === 'object' ? markerMid : null}
      />
    </slot>

    <slot name="markerEnd" id={markerEndId}>
      <Marker
        id={markerEndId}
        type={typeof markerEnd === 'string' ? markerEnd : undefined}
        {...typeof markerEnd === 'object' ? markerEnd : null}
      />
    </slot>

    {#if $$slots.start && $startPoint}
      <Group x={$startPoint.x} y={$startPoint.y}>
        <slot name="start" point={$startPoint} />
      </Group>
    {/if}

    {#if $$slots.end && $endPoint}
      <Group x={$endPoint.x} y={$endPoint.y}>
        <slot name="end" point={$endPoint} />
      </Group>
    {/if}
  {/key}
{/if}
