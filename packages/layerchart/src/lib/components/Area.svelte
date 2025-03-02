<script lang="ts">
  import { onMount, onDestroy, type ComponentProps } from 'svelte';
  import type { tweened as tweenedStore } from 'svelte/motion';
  import { type Area, area as d3Area, areaRadial } from 'd3-shape';
  import type { CurveFactory } from 'd3-shape';
  import { max, min } from 'd3-array';
  import { interpolatePath } from 'd3-interpolate-path';
  import { merge } from 'lodash-es';

  import { cls } from '@layerstack/tailwind';
  import { uniqueId } from '@layerstack/utils';
  import { objectId } from '@layerstack/utils/object';

  import { motionStore } from '$lib/stores/motionStore.js';

  import { getRenderContext } from './Chart.svelte';
  import { chartContext } from './ChartContext.svelte';
  import Spline from './Spline.svelte';
  import { accessor, type Accessor } from '../utils/common.js';
  import { isScaleBand } from '../utils/scales.js';
  import { getCanvasContext } from './layout/Canvas.svelte';
  import { renderPathData, type ComputedStylesOptions } from '$lib/utils/canvas.js';
  const {
    data: contextData,
    xScale,
    yScale,
    x: contextX,
    y,
    yDomain,
    yRange,
    radial,
    config,
  } = chartContext();

  /** Override data instead of using context */
  export let data: any = undefined;

  /** Pass `<path d={...} />` explicitly instead of calculating from data / context */
  export let pathData: string | undefined | null = undefined;

  /** Override x accessor */
  export let x: Accessor = undefined;

  /** Override y0 accessor.  Defaults to max($yRange) */
  export let y0: Accessor = undefined;
  /** Override y1 accessor.  Defaults to y accessor */
  export let y1: Accessor = undefined;

  /** Interpolate path data using d3-interpolate-path */
  export let tweened: boolean | Parameters<typeof tweenedStore>[1] = undefined;

  export let clipPath: string | undefined = undefined;

  export let curve: CurveFactory | undefined = undefined;
  export let defined: Parameters<Area<any>['defined']>[0] | undefined = undefined;

  /** Enable showing line */
  export let line: boolean | Partial<ComponentProps<Spline>> = false;

  export let fill: string | undefined = undefined;
  export let fillOpacity: number | undefined = undefined;
  export let stroke: string | undefined = line ? "stroke-primary" : undefined;
  export let strokeWidth: number | undefined = undefined;

  let className: string | undefined = undefined;
  export { className as class };

  export let onclick: ((e: MouseEvent) => void) | undefined = undefined;
  export let onpointerenter: ((e: PointerEvent) => void) | undefined = undefined;
  export let onpointermove: ((e: PointerEvent) => void) | undefined = undefined;
  export let onpointerleave: ((e: PointerEvent) => void) | undefined = undefined;

  $: xAccessor = x ? accessor(x) : $contextX;
  $: y0Accessor = y0 ? accessor(y0) : (d: any) => min($yDomain);
  $: y1Accessor = y1 ? accessor(y1) : $y;

  $: xOffset = isScaleBand($xScale) ? $xScale.bandwidth() / 2 : 0;
  $: yOffset = isScaleBand($yScale) ? $yScale.bandwidth() / 2 : 0;

  /** Provide initial `0` horizontal baseline and initially hide/untrack scale changes so not reactive (only set on initial mount) */
  function defaultPathData() {
    const path = $radial
      ? areaRadial()
          .angle((d) => $xScale(xAccessor(d)))
          .innerRadius((d) => Math.min($yScale(0), $yRange[0]))
          .outerRadius((d) => Math.min($yScale(0), $yRange[0]))
      : d3Area()
          .x((d) => $xScale(xAccessor(d)) + xOffset)
          .y0((d) => Math.min($yScale(0), $yRange[0]))
          .y1((d) => Math.min($yScale(0), $yRange[0]));

    path.defined(defined ?? ((d) => xAccessor(d) != null && y1Accessor(d) != null));

    if (curve) path.curve(curve);

    return path(data ?? $contextData);
  }

  $: [firstPoint, lastPoint] = foo(data ?? $contextData)

  function foo(data) {
    const isPointDefined = defined ?? ((d) => xAccessor(d) != null && y1Accessor(d) != null)
    const definedPoints = data.filter(isPointDefined)

    return [
        definedPoints[0],
        definedPoints[definedPoints.length - 1]
    ];
  }

  $: defaultData = defaultPathData()

  const tweenedOptions = tweened
    ? { interpolate: interpolatePath, ...(typeof tweened === 'object' ? tweened : null) }
    : false;
  $: tweened_d = motionStore(defaultData, { tweened: tweenedOptions });
  $: {
    const path = $radial
      ? areaRadial()
          .angle((d) => $xScale(xAccessor(d)))
          .innerRadius((d) => $yScale(y0Accessor(d)))
          .outerRadius((d) => $yScale(y1Accessor(d)))
      : d3Area()
          .x((d) => $xScale(xAccessor(d)) + xOffset)
          .y0((d) => {
            let value = max<number>($yRange)!;
            if (y0) {
              value = $yScale(y0Accessor(d));
            } else if (Array.isArray($config.y) && $config.y[0] === 0) {
              // Use first value if `y` defined as an array (ex. `<Chart y={[0,1]}>`)
              // TODO: Would be nice if this also handled multi-series (<Chart y={['apples', 'bananas', 'oranges']}>) as well as delta values (<Chart y={['baseline', 'value']}>)
              value = $yScale($y(d)[0]);
            }

            return value + yOffset;
          })
          .y1((d) => {
            let value = max<number>($yRange)!;
            if (y1) {
              value = $yScale(y1Accessor(d));
            } else if (Array.isArray($config.y) && $config.y[1] === 1) {
              // Use second value if `y` defined as an array (ex. `<Chart y={[0,1]}>`)
              // TODO: Would be nice if this also handled multi-series (<Chart y={['apples', 'bananas', 'oranges']}>) as well as delta values (<Chart y={['baseline', 'value']}>)
              value = $yScale($y(d)[1]);
            } else {
              // Expect single value defined for `y` (ex. `<Chart y="value">`)
              value = $yScale($y(d));
            }

            return value + yOffset;
          });

    path.defined(defined ?? ((d) => xAccessor(d) != null && y1Accessor(d) != null));

    if (curve) path.curve(curve);

    const d = pathData ?? path(data ?? $contextData);
    tweened_d.set(d ?? '');
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
            styles: { fill, fillOpacity, stroke, strokeWidth },
            classes: className,
          }
    );
  }

  // TODO: Use objectId to work around Svelte 4 reactivity issue (even when memoizing gradients)
  $: fillKey = fill && typeof fill === 'object' ? objectId(fill) : fill;
  $: strokeKey = stroke && typeof stroke === 'object' ? objectId(stroke) : stroke;

  $: if (renderContext === 'canvas') {
    // Redraw when props change
    fillKey && fillOpacity && strokeKey && strokeWidth && className;
    canvasContext.invalidate();
  }

  let canvasUnregister: ReturnType<typeof canvasContext.register>;
  $: if (renderContext === 'canvas') {
    canvasUnregister = canvasContext.register({
      name: 'Area',
      render,
      events: {
        click: onclick,
        pointerenter: onpointerenter,
        pointermove: onpointermove,
        pointerleave: onpointerleave,
      },
    });

    tweened_d.subscribe(() => {
      canvasContext.invalidate();
    });
  }

  let pathEl;
  let pathLength = 0;

  $: cdata = data ?? $contextData
  $: leftLegLength = $yScale(y0Accessor(firstPoint)) - $yScale(y1Accessor(firstPoint))
  $: rightLegLength = $yScale(y0Accessor(lastPoint)) - $yScale(y1Accessor(lastPoint))
  $: bottomPathLength = $xScale($xScale.domain()[1]) - $xScale($xScale.domain()[0])
  $: topPathLength = pathLength - leftLegLength - rightLegLength - bottomPathLength

  onMount(()=>{
    pathLength = pathEl.getTotalLength();
  })

  onDestroy(() => {
    if (renderContext === 'canvas') {
      canvasUnregister();
    }
  });
</script>

{#if renderContext === 'svg'}
  <path bind:this={pathEl}
    d={$tweened_d}
    clip-path={clipPath}
    {fill}
    fill-opacity={fillOpacity}
    {stroke}
    stroke-width={strokeWidth}
    pathLength={pathLength}
    stroke-dasharray={line ? `${topPathLength} ${pathLength - topPathLength}` : undefined}
    {...$$restProps}
    class={cls('path-area', line && 'path-line stroke-2 stroke-primary', className)}
    on:click={onclick}
    on:pointerenter={onpointerenter}
    on:pointermove={onpointermove}
    on:pointerleave={onpointerleave}
  />
{:else if line}
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

