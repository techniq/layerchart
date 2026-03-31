<script lang="ts" module>
  import type { Snippet } from 'svelte';
  import type { SVGAttributes } from 'svelte/elements';
  import {
    geoPath as d3GeoPath,
    geoTransform as d3geoTransform,
    type GeoIdentityTransform,
    type GeoPermissibleObjects,
    type GeoProjection,
    type GeoTransformPrototype,
  } from 'd3-geo';
  import { curveLinearClosed, type CurveFactory, type CurveFactoryLineOnly } from 'd3-shape';

  import type { CommonStyleProps, Without } from '$lib/utils/types.js';
  import type { PathProps } from './Path.svelte';

  export type GeoPathPropsWithoutHTML = {
    /**
     * GeoJSON data to render
     */
    geojson?: GeoPermissibleObjects | null;

    /**
     * Setup pointer events to show tooltip for related data
     */
    tooltip?: boolean;

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
  } & CommonStyleProps &
    Pick<
      PathProps,
      | 'motion'
      | 'draw'
      | 'marker'
      | 'markerStart'
      | 'markerMid'
      | 'markerEnd'
      | 'startContent'
      | 'endContent'
    >;

  export type GeoPathProps = GeoPathPropsWithoutHTML &
    Without<SVGAttributes<SVGPathElement>, GeoPathPropsWithoutHTML>;
</script>

<script lang="ts">
  import { cls } from '@layerstack/tailwind';

  import { geoCurvePath } from '$lib/utils/geo.js';
  import { getChartContext } from '$lib/contexts/chart.js';
  import { getGeoContext } from '$lib/contexts/geo.js';
  import Path from './Path.svelte';

  let {
    geoTransform,
    geojson,
    tooltip,
    curve = curveLinearClosed,
    onclick,
    onpointerenter,
    onpointermove,
    onpointerleave,
    class: className,
    ref: refProp = $bindable(),
    children,
    ...restProps
  }: GeoPathProps = $props();

  const ctx = getChartContext();
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

  const pathData = $derived(geojson ? (geoPath?.(geojson) ?? '') : '');

  // Hide `geoPath` reactivity from onclick handler
  function _onClick(e: MouseEvent) {
    onclick?.(e, geoPath);
  }

  function _onPointerEnter(e: PointerEvent & { currentTarget: EventTarget & SVGPathElement }) {
    onpointerenter?.(e);
    if (tooltip) {
      ctx?.tooltip.show(e, geojson);
    }
  }

  function _onPointerMove(e: PointerEvent & { currentTarget: EventTarget & SVGPathElement }) {
    onpointermove?.(e);
    if (tooltip) {
      ctx.tooltip.show(e, geojson);
    }
  }

  function _onPointerLeave(e: PointerEvent & { currentTarget: EventTarget & SVGPathElement }) {
    onpointerleave?.(e);
    if (tooltip) {
      ctx.tooltip.hide();
    }
  }
</script>

{#if children}
  {@render children({ geoPath })}
{:else}
  <Path
    {pathData}
    {...restProps}
    onclick={_onClick}
    onpointerenter={tooltip || onpointerenter ? _onPointerEnter : undefined}
    onpointermove={tooltip || onpointermove ? _onPointerMove : undefined}
    onpointerleave={tooltip || onpointerleave ? _onPointerLeave : undefined}
    class={cls('lc-geo-path', className)}
    pathRef={refProp}
  />
{/if}
