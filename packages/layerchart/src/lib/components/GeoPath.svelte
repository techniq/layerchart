<script lang="ts" module>
  import type { CommonStyleProps, Without } from '$lib/utils/types.js';
  import type { Snippet } from 'svelte';
  import type { PointerEventHandler, SVGAttributes } from 'svelte/elements';
  import type { TooltipContextValue } from './tooltip/TooltipContext.svelte';
  import { curveLinearClosed, type CurveFactory, type CurveFactoryLineOnly } from 'd3-shape';
  import {
    geoPath as d3GeoPath,
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
  import { merge } from 'lodash-es';

  import { getLayerContext } from '$lib/contexts/layer.js';
  import { registerCanvasComponent } from './layout/Canvas.svelte';
  import { geoCurvePath } from '$lib/utils/geo.js';
  import { getGeoContext } from '$lib/contexts/geo.js';
  import { createKey } from '$lib/utils/key.svelte.js';

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
    ref: refProp = $bindable(),
    children,
    ...restProps
  }: GeoPathProps = $props();

  let ref = $state<SVGPathElement>();
  $effect.pre(() => {
    refProp = ref;
  });

  const geo = getGeoContext();

  const projection = $derived(
    geoTransform && geo.projection ? d3geoTransform(geoTransform(geo.projection)) : geo.projection
  );

  const geoPath = $derived.by(() => {
    geojson;
    if (!projection) return;
    // Only use geoCurvePath for custom curves (performance impact)
    if (curve === curveLinearClosed) {
      return d3GeoPath(projection);
    }
    return geoCurvePath(projection, curve);
  });

  const layerCtx = getLayerContext();

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

  if (layerCtx === 'canvas') {
    registerCanvasComponent({
      name: 'GeoPath',
      render,
      events: {
        // Only register events if they are defined (so they are not registered with hit canvas unnecessarily)
        click: onclick ? _onClick : undefined,
        pointerenter: restProps.onpointerenter || tooltipContext ? _onPointerEnter : undefined,
        pointermove: restProps.onpointermove || tooltipContext ? _onPointerMove : undefined,
        pointerleave: restProps.onpointerleave || tooltipContext ? _onPointerLeave : undefined,
        pointerdown: restProps.onpointerdown,
        touchmove: restProps.ontouchmove,
      },
      deps: () => [
        projection,
        geojson,
        curve,
        fillKey.current,
        strokeKey.current,
        strokeWidth,
        opacity,
        className,
      ],
    });
  }
</script>

{#if children}
  {@render children({ geoPath })}
{:else if layerCtx === 'svg'}
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
    class={['lc-geo-path', className]}
  />
{/if}

<style>
  @layer base {
    :global(:where(.lc-geo-path)) {
      --fill-color: transparent;
      --stroke-color: initial;
    }

    /* Svg | Canvas layers */
    :global(:where(.lc-layout-svg .lc-geo-path, svg.lc-geo-path):not([fill])) {
      fill: var(--fill-color);
    }
    :global(:where(.lc-layout-svg .lc-geo-path, svg.lc-geo-path):not([stroke])) {
      stroke: var(--stroke-color);
    }
  }
</style>
