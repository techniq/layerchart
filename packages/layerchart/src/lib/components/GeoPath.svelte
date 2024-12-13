<script lang="ts">
  import { createEventDispatcher, getContext } from 'svelte';
  import type { Readable } from 'svelte/store';
  import {
    geoTransform as d3geoTransform,
    type GeoIdentityTransform,
    type GeoPermissibleObjects,
    type GeoProjection,
    type GeoTransformPrototype,
  } from 'd3-geo';
  import { cls } from '@layerstack/tailwind';

  import { chartContext } from './ChartContext.svelte';
  import { geoContext } from './GeoContext.svelte';
  import type { TooltipContextValue } from './tooltip/TooltipContext.svelte';
  import { curveLinearClosed, type CurveFactory, type CurveFactoryLineOnly } from 'd3-shape';
  import { geoCurvePath } from '$lib/utils/geo.js';
  import { clearCanvasContext, renderPathData } from '$lib/utils/canvas.js';

  export let geojson: GeoPermissibleObjects | null | undefined = undefined;

  /** Render to canvas */
  export let render:
    | ((
        ctx: CanvasRenderingContext2D,
        options: { newGeoPath: () => ReturnType<typeof geoCurvePath> }
      ) => any)
    | undefined = undefined;

  export let fill: string | undefined = undefined;
  export let stroke: string | undefined = undefined;
  export let strokeWidth: number | undefined = undefined;

  /**
   * Tooltip context to setup mouse events to show tooltip for related data
   */
  export let tooltip: TooltipContextValue | undefined = undefined;

  /**
   * Curve of path drawn. Imported via d3-shape.
   *
   * @example
   * import { curveCatmullRom } from 'd3-shape';
   * <GeoPath curve={curveCatmullRom} />
   *
   * @type {CurveFactory | CurveFactoryLineOnly | undefined}
   */
  export let curve: CurveFactory | CurveFactoryLineOnly = curveLinearClosed;

  let className: string | undefined = undefined;
  export { className as class };

  const dispatch = createEventDispatcher<{
    click: { geoPath: ReturnType<typeof geoCurvePath>; event: MouseEvent };
  }>();

  const { containerWidth, containerHeight, padding } = chartContext();
  const canvas = getContext<{ ctx: Readable<CanvasRenderingContext2D> }>('canvas');
  const geo = geoContext();

  /**
   * Apply geo transform to projection.  Useful to draw straight lines with `geoMercator` projection.
   * See: https://d3js.org/d3-geo/projection#geoTransform and https://stackoverflow.com/a/56409480/191902
   **/
  export let geoTransform:
    | ((projection: GeoProjection | GeoIdentityTransform) => GeoTransformPrototype)
    | undefined = undefined;

  $: _projection = geoTransform ? d3geoTransform(geoTransform($geo)) : $geo;

  $: geoPath = geoCurvePath(_projection, curve);

  $: renderContext = canvas ? 'canvas' : 'svg';
  $: canvasCtx = canvas?.ctx;

  $: if (renderContext === 'canvas' && $canvasCtx) {
    clearCanvasContext($canvasCtx, {
      padding: $padding,
      containerWidth: $containerWidth,
      containerHeight: $containerHeight,
    });

    if (render) {
      // geoPath = geoCurvePath(_projection, curve, $canvasCtx);
      geoPath = geoCurvePath(_projection, curve);
      render($canvasCtx, { newGeoPath: () => geoCurvePath(_projection, curve) });
    } else {
      // Set the context here since setting it in `$: geoPath` is a circular reference
      geoPath = geoCurvePath(_projection, curve);

      if (geojson) {
        const pathData = geoPath(geojson);
        renderPathData($canvasCtx, pathData, { fill, stroke, strokeWidth, class: $$props.class });
      }
    }
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
{#if renderContext === 'svg'}
  <slot {geoPath}>
    <path
      {...$$restProps}
      d={geojson ? geoPath(geojson) : ''}
      {fill}
      {stroke}
      stroke-width={strokeWidth}
      on:pointerenter={(e) => tooltip?.show(e, geojson)}
      on:pointerenter
      on:pointermove={(e) => tooltip?.show(e, geojson)}
      on:pointermove
      on:pointerleave={(e) => tooltip?.hide()}
      on:pointerleave
      on:pointerdown
      on:click={(event) => dispatch('click', { geoPath, event })}
      class={cls(fill == null && 'fill-transparent', className)}
    />
  </slot>
{/if}
