<script lang="ts">
  import { tick, type ComponentProps } from 'svelte';
  import { writable } from 'svelte/store';
  import { tweened as tweenedStore } from 'svelte/motion';
  import { draw as _drawTransition } from 'svelte/transition';
  import { cubicInOut } from 'svelte/easing';

  import { line as d3Line, lineRadial } from 'd3-shape';
  import type { CurveFactory, CurveFactoryLineOnly, Line } from 'd3-shape';
  // import { interpolateString } from 'd3-interpolate';
  import { interpolatePath } from 'd3-interpolate-path';
  import { max } from 'd3-array';
  import { cls } from '@layerstack/tailwind';
  import { uniqueId } from '@layerstack/utils';

  import { chartContext } from './ChartContext.svelte';
  import Group from './Group.svelte';
  import Marker from './Marker.svelte';

  import { motionStore } from '$lib/stores/motionStore.js';
  import { accessor, type Accessor } from '../utils/common.js';
  import { isScaleBand } from '../utils/scales.js';

  const { data: contextData, xScale, yScale, x: contextX, y: contextY, radial } = chartContext();

  /** Override data instead of using context */
  export let data: any = undefined;

  /** Pass `<path d={...} />` explicitly instead of calculating from data / context */
  export let pathData: string | undefined | null = undefined;

  /** Override `x` accessor from Chart context */
  export let x: Accessor = undefined;
  /** Override `y` accessor from Chart context */
  export let y: Accessor = undefined;

  /** Interpolate path data using d3-interpolate-path.  Works best without `draw` enabled */
  export let tweened: boolean | Parameters<typeof tweenedStore>[1] = undefined;
  /** Draw path over time.  Works best without `tweened` enabled */
  export let draw: boolean | Parameters<typeof _drawTransition>[1] = undefined;

  /**
   * Curve of spline drawn. Imported via d3-shape.
   *
   * @example
   * import { curveNatural } from 'd3-shape';
   * <Spline curve={curveNatrual} />
   *
   * @type {CurveFactory | CurveFactoryLineOnly | undefined}
   */
  export let curve: CurveFactory | CurveFactoryLineOnly | undefined = undefined;
  export let defined: Parameters<Line<any>['defined']>[0] | undefined = undefined;

  /** Marker to attach to start, mid, and end points of path */
  export let marker: ComponentProps<Marker>['type'] | ComponentProps<Marker> | undefined =
    undefined;
  /** Marker to attach to start point of path */
  export let markerStart: ComponentProps<Marker>['type'] | ComponentProps<Marker> | undefined =
    marker;
  /** Marker to attach to all mid points of path */
  export let markerMid: ComponentProps<Marker>['type'] | ComponentProps<Marker> | undefined =
    marker;
  /** Marker to attach to end point of path */
  export let markerEnd: ComponentProps<Marker>['type'] | ComponentProps<Marker> | undefined =
    marker;

  $: markerStartId = markerStart || $$slots['markerStart'] ? uniqueId('marker-') : '';
  $: markerMidId = markerMid || $$slots['markerMid'] ? uniqueId('marker-') : '';
  $: markerEndId = markerEnd || $$slots['markerEnd'] ? uniqueId('marker-') : '';

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

  const xAccessor = x ? accessor(x) : $contextX;
  const yAccessor = y ? accessor(y) : $contextY;

  $: xOffset = isScaleBand($xScale) ? $xScale.bandwidth() / 2 : 0;
  $: yOffset = isScaleBand($yScale) ? $yScale.bandwidth() / 2 : 0;

  let d: string | null = '';
  // @ts-expect-error
  $: tweenedOptions = tweened ? { interpolate: interpolatePath, ...tweened } : false;
  $: tweened_d = motionStore('', { tweened: tweenedOptions });
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

{#key key}
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <path
    d={$tweened_d}
    {...$$restProps}
    class={cls(
      'path-line',
      !$$props.fill && 'fill-none',
      !$$props.stroke && 'stroke-surface-content',
      $$props.class
    )}
    marker-start={markerStartId ? `url(#${markerStartId})` : undefined}
    marker-mid={markerMidId ? `url(#${markerMidId})` : undefined}
    marker-end={markerEndId ? `url(#${markerEndId})` : undefined}
    in:drawTransition|global={typeof draw === 'object' ? draw : undefined}
    on:click
    on:pointerenter
    on:pointermove
    on:pointerleave
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
