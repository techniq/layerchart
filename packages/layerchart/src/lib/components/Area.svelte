<script lang="ts" module>
  import { type Area, area as d3Area, areaRadial } from 'd3-shape';
  import type { SVGAttributes } from 'svelte/elements';
  import type { CommonStyleProps, Without } from 'layerchart/utils/types.js';
  import type { ComponentProps } from 'svelte';
  import { accessor, type Accessor } from '../utils/common.js';

  export type AreaPropsWithoutHTML = {
    /** Override data instead of using context */
    data?: any;

    /**
     * Pass `<path d={...} />` explicitly instead of calculating from data / context
     */
    pathData?: string | null;

    /**
     * Override x accessor
     */
    x?: Accessor;

    /**
     * Override y0 accessor. Defaults to max($yRange)
     */
    y0?: Accessor;

    /**
     * Override y1 accessor. Defaults to y accessor
     */
    y1?: Accessor;

    /**
     * Interpolate path data using d3-interpolate-path
     */
    tweened?: boolean | TweenedOptions;

    clipPath?: string;

    curve?: CurveFactory;

    defined?: Parameters<Area<any>['defined']>[0];

    /**
     * Enable showing line
     *
     * @default false
     */
    line?: boolean | Partial<ComponentProps<typeof Spline>>;
  } & CommonStyleProps;

  export type AreaProps = AreaPropsWithoutHTML &
    Without<SVGAttributes<SVGPathElement>, AreaPropsWithoutHTML>;
</script>

<script lang="ts">
  import type { CurveFactory } from 'd3-shape';
  import { max, min } from 'd3-array';
  import { interpolatePath } from 'd3-interpolate-path';
  import { merge } from 'lodash-es';

  import { cls } from '@layerstack/tailwind';

  import { getRenderContext } from './Chart.svelte';
  import Spline from './Spline.svelte';
  import { isScaleBand } from '../utils/scales.svelte.js';
  import { flattenPathData } from '../utils/path.js';
  import { getCanvasContext } from './layout/Canvas.svelte';
  import { renderPathData, type ComputedStylesOptions } from '$lib/utils/canvas.js';
  import { getChartContext } from './Chart.svelte';
  import { motionState, type TweenedOptions } from 'layerchart/stores/motionState.svelte.js';
  import { createKey } from 'layerchart/utils/key.svelte.js';

  const ctx = getChartContext();
  const renderCtx = getRenderContext();
  const canvasCtx = getCanvasContext();

  let {
    clipPath,
    curve,
    data,
    defined,
    fill,
    fillOpacity,
    line = false,
    opacity,
    pathData,
    stroke,
    strokeWidth,
    tweened,
    x,
    y0,
    y1,
    class: className,
    onclick,
    onpointerenter,
    onpointermove,
    onpointerleave,
    ...restProps
  }: AreaProps = $props();

  const xAccessor = $derived(x ? accessor(x) : ctx.x);
  const y0Accessor = $derived(y0 ? accessor(y0) : (d: any) => min(ctx.yDomain));
  const y1Accessor = $derived(y1 ? accessor(y1) : ctx.y);
  const xOffset = $derived(isScaleBand(ctx.xScale) ? ctx.xScale.bandwidth() / 2 : 0);
  const yOffset = $derived(isScaleBand(ctx.yScale) ? ctx.yScale.bandwidth() / 2 : 0);

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
        ? areaRadial()
            .angle((d) => ctx.xScale(xAccessor(d)))
            .innerRadius(() => Math.min(ctx.yScale(0), ctx.yRange[0]))
            .outerRadius(() => Math.min(ctx.yScale(0), ctx.yRange[0]))
        : d3Area()
            .x((d) => ctx.xScale(xAccessor(d)) + xOffset)
            .y0(() => Math.min(ctx.yScale(0), ctx.yRange[0]))
            .y1(() => Math.min(ctx.yScale(0), ctx.yRange[0]));

      path.defined(defined ?? ((d) => xAccessor(d) != null && y1Accessor(d) != null));

      if (curve) path.curve(curve);

      // TODO: type this appropriately otherwise we will have bugs in the future
      return path((data ?? Array.isArray(ctx.data)) ? (ctx.data as [number, number][]) : []);
    }
  }

  const tweenedOptions = $derived(
    tweened
      ? { interpolate: interpolatePath, ...(typeof tweened === 'object' ? tweened : null) }
      : false
  );

  const tweenedState = $derived(motionState(defaultPathData(), { tweened: tweenedOptions }));

  $effect(() => {
    const path = ctx.radial
      ? areaRadial()
          .angle((d) => ctx.xScale(xAccessor(d)))
          .innerRadius((d) => ctx.yScale(y0Accessor(d)))
          .outerRadius((d) => ctx.yScale(y1Accessor(d)))
      : d3Area()
          .x((d) => ctx.xScale(xAccessor(d)) + xOffset)
          .y0((d) => {
            let value = max<number>(ctx.yRange)!;
            if (y0) {
              value = ctx.yScale(y0Accessor(d));
            } else if (Array.isArray(ctx.config.y) && ctx.config.y[0] === 0) {
              // Use first value if `y` defined as an array (ex. `<Chart y={[0,1]}>`)
              // TODO: Would be nice if this also handled multi-series (<Chart y={['apples', 'bananas', 'oranges']}>) as well as delta values (<Chart y={['baseline', 'value']}>)
              value = ctx.yScale(ctx.y(d)[0]);
            }

            return value + yOffset;
          })
          .y1((d) => {
            let value = max<number>(ctx.yRange)!;
            if (y1) {
              value = ctx.yScale(y1Accessor(d));
            } else if (Array.isArray(ctx.config.y) && ctx.config.y[1] === 1) {
              // Use second value if `y` defined as an array (ex. `<Chart y={[0,1]}>`)
              // TODO: Would be nice if this also handled multi-series (<Chart y={['apples', 'bananas', 'oranges']}>) as well as delta values (<Chart y={['baseline', 'value']}>)
              value = ctx.yScale(ctx.y(d)[1]);
            } else {
              // Expect single value defined for `y` (ex. `<Chart y="value">`)
              value = ctx.yScale(ctx.y(d));
            }

            return value + yOffset;
          });

    path.defined(defined ?? ((d: any) => xAccessor(d) != null && y1Accessor(d) != null));

    if (curve) path.curve(curve);

    const d = pathData ?? path(data ?? ctx.data);
    tweenedState.set(d ?? '');
  });

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
            classes: className ?? '',
          }
    );
  }

  // TODO: Use objectId to work around Svelte 4 reactivity issue (even when memoizing gradients)
  const fillKey = createKey(() => fill);
  const strokeKey = createKey(() => stroke);

  $effect(() => {
    if (renderCtx !== 'canvas') return;
    [
      fillKey.current,
      fillOpacity,
      strokeKey.current,
      strokeWidth,
      opacity,
      className,
      tweenedState.current,
    ];
    canvasCtx.invalidate();
  });

  $effect(() => {
    return canvasCtx.register({
      name: 'Area',
      render,
      events: {
        click: onclick,
        pointerenter: onpointerenter,
        pointermove: onpointermove,
        pointerleave: onpointerleave,
      },
    });
  });
</script>

{#if line}
  <Spline
    {data}
    {x}
    y={y1}
    {curve}
    {defined}
    {tweened}
    {...typeof line === 'object' ? line : null}
  />
{/if}

{#if renderCtx === 'svg'}
  <path
    d={tweenedState.current}
    clip-path={clipPath}
    {fill}
    fill-opacity={fillOpacity}
    {stroke}
    stroke-width={strokeWidth}
    {opacity}
    {...restProps}
    class={cls('path-area', className)}
    {onclick}
    {onpointerenter}
    {onpointermove}
    {onpointerleave}
  />
{/if}
