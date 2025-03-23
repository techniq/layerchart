<script lang="ts" module>
  import type { CommonStyleProps, Without } from '$lib/utils/types.js';
  import type { Snippet } from 'svelte';
  import type { PointerEventHandler, SVGAttributes } from 'svelte/elements';
  import type { TooltipContextValue } from './tooltip/TooltipContext.svelte';
  import { curveLinearClosed, type CurveFactory, type CurveFactoryLineOnly } from 'd3-shape';
  import {
    geoTransform as d3geoTransform,
    type GeoIdentityTransform,
    type GeoPermissibleObjects,
    type GeoProjection,
    type GeoTransformPrototype,
  } from 'd3-geo';
  import { renderPathData, type ComputedStylesOptions } from '$lib/utils/canvas.js';

  export type GeoPathPropsWithoutHTML = {
    /**
     * GeoJSON data to render
     */
    geojson?: GeoPermissibleObjects | null;

    /**
     * Tooltip context to setup pointer events to show tooltip for related data
     */
    tooltipContext?: TooltipContextValue | undefined;

    /**
     * Click event handler
     */
    onclick?:
      | ((e: MouseEvent, geoPath: ReturnType<typeof geoCurvePath> | undefined) => void)
      | undefined;

    /**
     * Curve of path drawn. Imported via d3-shape.
     *
     * @example
     * import { curveCatmullRom } from 'd3-shape';
     * <GeoPath curve={curveCatmullRom} />
     *
     * @default curveLinearClosed
     */
    curve?: CurveFactory | CurveFactoryLineOnly;

    /**
     * Apply geo transform to projection.
     * Useful to draw straight lines with `geoMercator` projection.
     *
     * @see https://d3js.org/d3-geo/projection#geoTransform
     * @see https://stackoverflow.com/a/56409480/191902
     **/
    geoTransform?: (projection: GeoProjection | GeoIdentityTransform) => GeoTransformPrototype;

    /**
     * A reference to the underlying `<path>` element
     * @bindable
     */
    ref?: SVGPathElement;

    children?: Snippet<[{ geoPath: ReturnType<typeof geoCurvePath> | undefined }]>;
  } & CommonStyleProps;

  export type GeoPathProps = GeoPathPropsWithoutHTML &
    Without<SVGAttributes<SVGPathElement>, GeoPathPropsWithoutHTML>;
</script>

<script lang="ts">
  import { cls } from '@layerstack/tailwind';
  import { merge } from 'lodash-es';

  import { getRenderContext } from './Chart.svelte';
  import { getCanvasContext } from './layout/Canvas.svelte';
  import { geoCurvePath } from '$lib/utils/geo.js';
  import { getGeoContext } from './GeoContext.svelte';
  import { createKey } from '$lib/utils/key.svelte.js';
  import { layerClass } from '$lib/utils/attributes.js';

  let {
    fill,
    stroke,
    strokeWidth,
    opacity,
    geoTransform,
    geojson,
    tooltipContext,
    curve = curveLinearClosed,
    onclick,
    class: className,
    ref = $bindable(),
    children,
    ...restProps
  }: GeoPathProps = $props();

  const geo = getGeoContext();

  const projection = $derived(
    geoTransform && geo.projection ? d3geoTransform(geoTransform(geo.projection)) : geo.projection
  );

  const geoPath = $derived.by(() => {
    geojson;
    if (!projection) return;
    return geoCurvePath(projection, curve);
  });

  const renderCtx = getRenderContext();
  const canvasCtx = getCanvasContext();

  function render(
    ctx: CanvasRenderingContext2D,
    styleOverrides: ComputedStylesOptions | undefined
  ) {
    if (!geojson) return;
    const pathData = geoPath?.(geojson);
    renderPathData(
      ctx,
      pathData,
      styleOverrides
        ? merge({ styles: { strokeWidth } }, styleOverrides)
        : {
            styles: { fill, stroke, strokeWidth, opacity },
            classes: className,
          }
    );
  }

  // TODO: Use objectId to work around Svelte 4 reactivity issue (even when memoizing gradients)
  const fillKey = createKey(() => fill);
  const strokeKey = createKey(() => stroke);

  $effect(() => {
    if (renderCtx !== 'canvas') return;
    // Redraw when geojson, projection, or class change
    [
      geojson &&
        projection &&
        fillKey.current &&
        strokeKey.current &&
        strokeWidth &&
        opacity &&
        className,
    ];
    canvasCtx.invalidate();
  });

  $effect(() => {
    if (renderCtx !== 'canvas') return;
    return canvasCtx.register({
      name: 'GeoPath',
      render,
      events: {
        click: _onClick,
        pointerenter: _onPointerEnter,
        pointermove: _onPointerMove,
        pointerleave: _onPointerLeave,
        pointerdown: restProps.onpointerdown,
        touchmove: restProps.ontouchmove,
      },
    });
  });

  // Hide `geoPath` and `tooltip` reactivity
  function _onClick(e: MouseEvent) {
    onclick?.(e, geoPath);
  }

  const _onPointerEnter: PointerEventHandler<SVGPathElement> = (e) => {
    restProps.onpointerenter?.(e);
    tooltipContext?.show(e, geojson);
  };

  const _onPointerMove: PointerEventHandler<SVGPathElement> = (e) => {
    restProps.onpointermove?.(e);
    tooltipContext?.show(e, geojson);
  };

  const _onPointerLeave: PointerEventHandler<SVGPathElement> = (e) => {
    restProps.onpointerleave?.(e);
    tooltipContext?.hide();
  };
</script>

{#if children}
  {@render children({ geoPath })}
{:else if renderCtx === 'svg'}
  <path
    bind:this={ref}
    {...restProps}
    d={geojson ? geoPath?.(geojson) : ''}
    {fill}
    {stroke}
    stroke-width={strokeWidth}
    {opacity}
    onclick={_onClick}
    onpointerenter={_onPointerEnter}
    onpointermove={_onPointerMove}
    onpointerleave={_onPointerLeave}
    class={cls(layerClass('geo-path'), fill == null && 'fill-transparent', className)}
  />
{/if}
