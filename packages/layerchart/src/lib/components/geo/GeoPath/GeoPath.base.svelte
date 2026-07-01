<script lang="ts" module>
  import type { Component } from 'svelte';
  import type { GeoPathProps } from './GeoPath.shared.svelte.js';

  export type GeoPathBaseLayerComponents = {
    Path: Component<any>;
  };

  export type GeoPathBaseProps = GeoPathProps & GeoPathBaseLayerComponents;
</script>

<script lang="ts">
  import { geoPath as d3GeoPath, geoTransform as d3geoTransform } from 'd3-geo';
  import { curveLinearClosed } from 'd3-shape';
  import { cls } from '@layerstack/tailwind';

  import { geoCurvePath } from '$lib/utils/geo.js';
  import { getChartContext } from '$lib/contexts/chart.js';
  import { getGeoContext } from '$lib/contexts/geo.js';

  let {
    Path,
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
  }: GeoPathBaseProps = $props();

  const ctx = getChartContext();
  const geo = getGeoContext();

  const projection = $derived(
    geoTransform && geo.projection ? d3geoTransform(geoTransform(geo.projection)) : geo.projection
  );

  const geoPath = $derived.by(() => {
    geojson;
    if (!projection) return;
    if (curve === curveLinearClosed) {
      return d3GeoPath(projection);
    }
    return geoCurvePath(projection, curve);
  });

  const pathData = $derived(geojson ? geoPath?.(geojson) ?? '' : '');

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
    {...onclick && { onclick: _onClick }}
    {...(tooltip || onpointerenter) && { onpointerenter: _onPointerEnter }}
    {...(tooltip || onpointermove) && { onpointermove: _onPointerMove }}
    {...(tooltip || onpointerleave) && { onpointerleave: _onPointerLeave }}
    class={cls('lc-geo-path', className)}
    pathRef={refProp}
  />
{/if}
