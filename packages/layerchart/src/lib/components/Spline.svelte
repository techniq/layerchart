<script lang="ts" module>
  import type { Snippet } from 'svelte';
  import type { MarkerOptions } from './MarkerWrapper.svelte';
  import type { CommonStyleProps, Without } from '$lib/utils/types.js';
  import type { SVGAttributes } from 'svelte/elements';
  import type { CurveFactory, CurveFactoryLineOnly, Line } from 'd3-shape';

  import {
    createControlledMotion,
    createMotion,
    extractTweenConfig,
    type MotionProp,
  } from '$lib/utils/motion.svelte.js';
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
     * Whether to animate the drawing of the path over time.
     * Pass either `true` or an object with transition options to
     * enable the transition.
     *
     * Works best with `tweened` disabled.
     */
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
     * Add additional content at the start of the line.
     *
     * Receives `{ point: DOMPoint }` as a snippet prop.
     */
    startContent?: Snippet<[{ point: DOMPoint }]>;

    /**
     * Add additional content at the end of the line.
     *
     * Receives `{ point: DOMPoint }` as a snippet prop.
     */
    endContent?: Snippet<[{ point: DOMPoint }]>;

    /**
     * A reference to the `<path>` element.
     *
     * @bindable
     */
    splineRef?: SVGPathElement;

    motion?: MotionProp;
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

  import Group from './Group.svelte';
  import { isScaleBand } from '../utils/scales.svelte.js';
  import { flattenPathData } from '../utils/path.js';
  import { registerCanvasComponent } from './layout/Canvas.svelte';
  import { renderPathData, type ComputedStylesOptions } from 'layerchart/utils/canvas.js';
  import { getRenderContext } from './Chart.svelte';
  import MarkerWrapper from './MarkerWrapper.svelte';
  import { getChartContext } from './Chart.svelte';
  import { createKey } from '$lib/utils/key.svelte.js';
  import { createId } from '$lib/utils/createId.js';
  import { layerClass } from '$lib/utils/attributes.js';

  const ctx = getChartContext();

  const uid = $props.id();

  let {
    data,
    pathData,
    x,
    y,
    motion,
    draw,
    curve,
    defined,
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
    splineRef = $bindable(),
    ...restProps
  }: SplineProps = $props();

  const markerStart = $derived(markerStartProp ?? marker);
  const markerMid = $derived(markerMidProp ?? marker);
  const markerEnd = $derived(markerEndProp ?? marker);

  const markerStartId = $derived(markerStart ? createId('marker-start', uid) : '');
  const markerMidId = $derived(markerMid ? createId('marker-mid', uid) : '');
  const markerEndId = $derived(markerEnd ? createId('marker-end', uid) : '');

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

  const xOffset = $derived(isScaleBand(ctx.xScale) ? ctx.xScale.bandwidth() / 2 : 0);
  const yOffset = $derived(isScaleBand(ctx.yScale) ? ctx.yScale.bandwidth() / 2 : 0);

  const extractedTween = extractTweenConfig(motion);

  const tweenedOptions = extractedTween
    ? { interpolate: interpolatePath, ...extractedTween }
    : undefined;

  /** Provide initial `0` horizontal baseline and initially hide/untrack scale changes so not reactive (only set on initial mount) */
  function defaultPathData() {
    if (!tweenedOptions) {
      // If not tweened, return empty string (faster initial render)
      return '';
    } else if (pathData) {
      // Flatten all `y` coordinates of pre-defined `pathData`
      return flattenPathData(pathData, Math.min(ctx.yScale(0) ?? ctx.yRange[0], ctx.yRange[0]));
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

    const result = pathData ?? path(data ?? ctx.data) ?? '';
    return result;
  });

  const tweenedState = createMotion(defaultPathData(), () => d, tweenedOptions);

  const drawTransition = $derived(draw ? _drawTransition : () => ({}));

  let key = $state(Symbol());

  const renderCtx = getRenderContext();

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

  if (renderCtx === 'canvas') {
    registerCanvasComponent({
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
      deps: () => [
        fillKey.current,
        fillOpacity,
        strokeKey.current,
        strokeWidth,
        opacity,
        className,
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
              const totalLength = splineRef?.getTotalLength() ?? 0;
              const point = splineRef?.getPointAtLength(totalLength * t);
              return point;
            };
          },
        }
      : { type: 'none' }
  );

  $effect(() => {
    if (!startContent && !endContent) return;
    d;
    if (!splineRef || !splineRef.pathLength) return;
    startPoint = splineRef.getPointAtLength(0);
    const totalLength = splineRef.getTotalLength();
    endPoint.target = splineRef.getPointAtLength(totalLength);
  });

  $effect(() => {
    if (!draw) return;
    [tweenedState.current];
    // Anytime the path data changes, redraw
    key = Symbol();
  });
</script>

{#if renderCtx === 'svg'}
  {#key key}
    <path
      d={tweenedState.current}
      {...restProps}
      class={cls(
        layerClass('spline-path'),
        !fill && 'fill-none',
        !stroke && 'stroke-surface-content',
        className
      )}
      {fill}
      fill-opacity={fillOpacity}
      {stroke}
      stroke-width={strokeWidth}
      {opacity}
      marker-start={markerStartId ? `url(#${markerStartId})` : undefined}
      marker-mid={markerMidId ? `url(#${markerMidId})` : undefined}
      marker-end={markerEndId ? `url(#${markerEndId})` : undefined}
      in:drawTransition|global={typeof draw === 'object' ? draw : undefined}
      bind:this={splineRef}
    />
    <MarkerWrapper id={markerStartId} marker={markerStart} />
    <MarkerWrapper id={markerMidId} marker={markerMid} />
    <MarkerWrapper id={markerEndId} marker={markerEnd} />

    {#if startContent && startPoint}
      <Group x={startPoint.x} y={startPoint.y} class={layerClass('spline-g-start')}>
        {@render startContent({ point: startPoint })}
      </Group>
    {/if}

    {#if endContent && endPoint.current}
      <Group x={endPoint.current.x} y={endPoint.current.y} class={layerClass('spline-g-end')}>
        {@render endContent({ point: endPoint.current })}
      </Group>
    {/if}
  {/key}
{/if}
