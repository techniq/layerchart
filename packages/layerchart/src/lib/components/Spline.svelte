<script lang="ts" module>
  import { tick, type Snippet } from 'svelte';
  import type { MarkerOptions } from './MarkerWrapper.svelte';
  import type { CommonStyleProps, Without } from 'layerchart/utils/types.js';
  import type { SVGAttributes } from 'svelte/elements';
  import type { CurveFactory, CurveFactoryLineOnly, Line } from 'd3-shape';

  import { motionState, type TweenedProp } from '$lib/stores/motionStore.js';
  import { accessor, type Accessor } from '../utils/common.js';

  export type SplinePropsWithoutHTML = {
    /**
     * Override data instead of using context
     */
    data?: any;

    /**
     * Pass `<path d={...} />` explicitly instead of calculating
     * from data / context
     */
    pathData?: string | undefined | null;

    /**
     * Override `x` accessor from Chart context
     */
    x?: Accessor;

    /**
     * Override `y` accessor from Chart context
     */
    y?: Accessor;

    /**
     * Interpolate path data using d3-interpolate-path.
     * Works best without `draw` enabled
     */
    tweened?: TweenedProp;

    /** Draw path over time.  Works best without `tweened` enabled */
    draw?: boolean | Parameters<typeof _drawTransition>[1];

    /**
     * Curve of spline drawn. Imported via d3-shape.
     *
     * @example
     * import { curveNatural } from 'd3-shape';
     * <Spline curve={curveNatural} />
     *
     * @type {CurveFactory | CurveFactoryLineOnly | undefined}
     */
    curve?: CurveFactory | CurveFactoryLineOnly;

    /**
     * Function to determine if a point is defined
     *
     * @example
     * <Spline defined={(d) => d.value !== null} />
     */
    defined?: Parameters<Line<any>['defined']>[0];

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
     * Insert content inside the start group
     */
    startContent?: Snippet<[{ point: DOMPoint }]>;

    /**
     * Insert content inside the end group
     */
    endContent?: Snippet<[{ point: DOMPoint }]>;

    /**
     * A reference to the `<path>` element.
     *
     * @bindable
     */
    ref?: SVGPathElement;
  } & CommonStyleProps;

  export type SplineProps = SplinePropsWithoutHTML &
    Without<SVGAttributes<SVGPathElement>, SplinePropsWithoutHTML>;
</script>

<script lang="ts">
  import { draw as _drawTransition } from 'svelte/transition';
  import { cubicInOut } from 'svelte/easing';
  import { merge } from 'lodash-es';

  import { line as d3Line, lineRadial } from 'd3-shape';
  import { interpolatePath } from 'd3-interpolate-path';
  import { max } from 'd3-array';
  import { cls } from '@layerstack/tailwind';
  import { uniqueId } from '@layerstack/utils';

  import Group from './Group.svelte';
  import { isScaleBand } from '../utils/scales.js';
  import { flattenPathData } from '../utils/path.js';
  import { getCanvasContext } from './layout/Canvas.svelte';
  import { renderPathData, type ComputedStylesOptions } from '$lib/utils/canvas.js';
  import { getRenderContext } from './Chart.svelte';
  import MarkerWrapper from './MarkerWrapper.svelte';
  import { getChartContext } from './Chart-Next.svelte';
  import { createKey } from 'layerchart/utils/key.svelte.js';

  const ctx = getChartContext();

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
    marker,
    markerStart = marker,
    markerMid = marker,
    markerEnd = marker,
    startContent,
    endContent,
    opacity,
    ref = $bindable(),
    ...restProps
  }: SplineProps = $props();

  const markerStartId = $derived(markerStart ? uniqueId('marker-') : '');
  const markerMidId = $derived(markerMid ? uniqueId('marker-') : '');
  const markerEndId = $derived(markerEnd ? uniqueId('marker-') : '');

  function getScaleValue(
    data: any,
    scale: typeof ctx.xScale | typeof ctx.yScale,
    accessor: Function
  ) {
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

  const xAccessor = $derived(x ? accessor(x) : ctx.x);
  const yAccessor = $derived(y ? accessor(y) : ctx.y);

  const yOffset = $derived(isScaleBand(ctx.xScale) ? ctx.xScale.bandwidth() / 2 : 0);
  const xOffset = $derived(isScaleBand(ctx.yScale) ? ctx.yScale.bandwidth() / 2 : 0);

  const tweenedOptions = $derived(
    tweened
      ? { interpolate: interpolatePath, ...(typeof tweened === 'object' ? tweened : null) }
      : false
  );

  /** Provide initial `0` horizontal baseline and initially hide/untrack scale changes so not reactive (only set on initial mount) */
  function defaultPathData() {
    if (!tweenedOptions) {
      // If not tweened, return empty string (faster initial render)
      return '';
    } else if (pathData) {
      // Flatten all `y` coordinates of pre-defined `pathData`
      return flattenPathData(pathData, Math.min(ctx.yScale(0), ctx.yRange[0]));
    } else if (ctx.config.x) {
      // Only use default line if `x` accessor is defined (cartesian chart)
      const path = ctx.radial
        ? lineRadial()
            .angle((d) => ctx.xScale(xAccessor(d)))
            .radius((d) => Math.min(ctx.yScale(0), ctx.yRange[0]))
        : d3Line()
            .x((d) => ctx.xScale(xAccessor(d)) + xOffset)
            .y((d) => Math.min(ctx.yScale(0), ctx.yRange[0]));

      path.defined(defined ?? ((d) => xAccessor(d) != null && yAccessor(d) != null));

      if (curve) path.curve(curve);

      return path(data ?? ctx.data);
    }
  }

  const tweenedState = $derived(
    motionState(defaultPathData(), {
      tweened: tweenedOptions,
    })
  );

  const d = $derived.by(() => {
    const path = ctx.radial
      ? lineRadial()
          .angle((d) => getScaleValue(d, ctx.xScale, xAccessor))
          .radius((d) => getScaleValue(d, ctx.yScale, yAccessor))
      : d3Line()
          .x((d) => getScaleValue(d, ctx.xScale, xAccessor) + xOffset)
          .y((d) => getScaleValue(d, ctx.yScale, yAccessor) + yOffset);

    path.defined(defined ?? ((d) => xAccessor(d) != null && yAccessor(d) != null));
    if (curve) path.curve(curve);

    return pathData ?? path(data ?? ctx.data) ?? '';
  });

  $effect(() => {
    tweenedState.set(d);
  });

  const drawTransition = $derived(draw ? _drawTransition : () => ({}));

  let key = $state(Symbol());

  $effect(() => {
    if (!draw) return;
    [tweenedState.current];
    // Anytime the path data changes, redraw
    key = Symbol();
  });

  const renderContext = getRenderContext();
  const canvasContext = getCanvasContext();

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
            classes: className,
          }
    );
  }

  // TODO: Use objectId to work around Svelte 4 reactivity issue (even when memoizing gradients)
  const fillKey = createKey(() => fill);
  const strokeKey = createKey(() => stroke);

  $effect(() => {
    if (renderContext !== 'canvas') return;
    return canvasContext.register({
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
  });

  $effect(() => {
    if (renderContext !== 'canvas') return;
    // Redraw when props change
    [fillKey.current, fillOpacity, strokeKey.current, strokeWidth, opacity, className];
    canvasContext.invalidate();
  });

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

  const endPoint = motionState<DOMPoint | undefined>(undefined, {
    tweened: draw
      ? {
          duration: () => endPointDuration,
          easing: typeof draw === 'object' && draw.easing ? draw.easing : cubicInOut,
          interpolate() {
            return (t: number) => {
              const totalLength = ref?.getTotalLength() ?? 0;
              const point = ref?.getPointAtLength(totalLength * t);
              return point;
            };
          },
        }
      : false,
  });

  $effect(() => {
    if (!startContent || !endContent) return;
    d;
    tick().then(() => {
      if (!ref) return;
      startPoint = ref.getPointAtLength(0);
      const totalLength = ref.getTotalLength();
      endPoint.set(ref.getPointAtLength(totalLength));
    });
  });
</script>

{#if renderContext === 'svg'}
  {#key key}
    <path
      d={tweenedState.current}
      {...restProps}
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
      {...restProps}
      bind:this={ref}
    />
    <MarkerWrapper id={markerStartId} marker={markerStart} />
    <MarkerWrapper id={markerMidId} marker={markerMid} />
    <MarkerWrapper id={markerEndId} marker={markerEnd} />

    {#if startContent && startPoint}
      <Group x={startPoint.x} y={startPoint.y}>
        {@render startContent({ point: startPoint })}
      </Group>
    {/if}

    {#if endContent && endPoint.current}
      <Group x={endPoint.current.x} y={endPoint.current.y}>
        {@render endContent({ point: endPoint.current })}
      </Group>
    {/if}
  {/key}
{/if}
