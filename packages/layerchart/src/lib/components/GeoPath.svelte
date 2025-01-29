<script lang="ts">
  import { onDestroy } from 'svelte';
  import {
    geoTransform as d3geoTransform,
    type GeoIdentityTransform,
    type GeoPermissibleObjects,
    type GeoProjection,
    type GeoTransformPrototype,
  } from 'd3-geo';
  import { cls } from '@layerstack/tailwind';

  import { geoContext } from './GeoContext.svelte';
  import type { TooltipContextValue } from './tooltip/TooltipContext.svelte';
  import { curveLinearClosed, type CurveFactory, type CurveFactoryLineOnly } from 'd3-shape';
  import { geoCurvePath } from '$lib/utils/geo.js';
  import { renderPathData, type ComputedStylesOptions } from '$lib/utils/canvas.js';
  import { getCanvasContext } from './layout/Canvas.svelte';
  import { objectId } from '@layerstack/utils/object';

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
   * Tooltip context to setup pointer events to show tooltip for related data
   */
  export let tooltip: TooltipContextValue | undefined = undefined;

  export let onclick:
    | ((e: MouseEvent, geoPath: ReturnType<typeof geoCurvePath>) => void)
    | undefined = undefined;
  export let onpointerenter: ((e: PointerEvent) => void) | undefined = undefined;
  export let onpointermove: ((e: PointerEvent) => void) | undefined = undefined;
  export let onpointerleave: ((e: PointerEvent) => void) | undefined = undefined;

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
  $: {
    // Recreate `geoPath()` if `geojson` data changes (fixes ghosting issue when rendering to canvas)
    geojson;
    geoPath = geoCurvePath(_projection, curve);
  }

  const canvasContext = getCanvasContext();
  const renderContext = canvasContext ? 'canvas' : 'svg';

  function _render(
    ctx: CanvasRenderingContext2D,
    styleOverrides: ComputedStylesOptions | undefined
  ) {
    if (render) {
      render(ctx, { newGeoPath: () => geoCurvePath(_projection, curve) });
    } else {
      if (geojson) {
        const pathData = geoPath(geojson);
        renderPathData(
          ctx,
          pathData,
          styleOverrides ?? {
            styles: { fill, stroke, strokeWidth },
            classes: className,
          }
        );
      }
    }
  }

  // TODO: Use objectId to work around Svelte 4 reactivity issue (even when memoizing gradients)
  $: fillKey = fill && typeof fill === 'object' ? objectId(fill) : fill;
  $: strokeKey = stroke && typeof stroke === 'object' ? objectId(stroke) : stroke;

  $: if (renderContext === 'canvas') {
    // Redraw when geojson, projection, or class change
    geojson && _projection && fillKey && strokeKey && strokeWidth && className;
    canvasContext.invalidate();
  }

  // Hide `geoPath` and `tooltip` reactivity
  function _onClick(e: MouseEvent) {
    onclick?.(e, geoPath);
  }
  function _onPointerEnter(e: PointerEvent) {
    onpointerenter?.(e);
    tooltip?.show(e, geojson);
  }
  function _onPointerMove(e: PointerEvent) {
    onpointermove?.(e);
    tooltip?.show(e, geojson);
  }
  function _onPointerLeave(e: PointerEvent) {
    onpointerleave?.(e);
    tooltip?.hide();
  }

  let canvasUnregister: ReturnType<typeof canvasContext.register>;
  $: if (renderContext === 'canvas') {
    canvasUnregister = canvasContext.register({
      name: 'GeoPath',
      render: _render,
      events: {
        click: _onClick,
        pointerenter: _onPointerEnter,
        pointermove: _onPointerMove,
        pointerleave: _onPointerLeave,
      },
    });
  }

  onDestroy(() => {
    if (renderContext === 'canvas') {
      canvasUnregister();
    }
  });
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
      on:click={_onClick}
      on:pointerenter={_onPointerEnter}
      on:pointermove={_onPointerMove}
      on:pointerleave={_onPointerLeave}
      on:pointerdown
      class={cls(fill == null && 'fill-transparent', className)}
    />
  </slot>
{/if}
