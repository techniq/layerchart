<script lang="ts" module>
  import type { Component } from 'svelte';
  import type { RibbonProps } from './Ribbon.shared.svelte.js';

  export type RibbonBaseLayerComponents = {
    Path: Component<any>;
  };

  export type RibbonBaseProps = RibbonProps & RibbonBaseLayerComponents;
</script>

<script lang="ts">
  import type { PointerEventHandler } from 'svelte/elements';
  import { ribbon as d3ribbon, ribbonArrow as d3ribbonArrow } from 'd3-chord';

  import { getChartContext } from '$lib/contexts/chart.js';
  import { cls } from '@layerstack/tailwind';

  let {
    Path,
    chord,
    radius,
    directed = false,
    headRadius,
    fill,
    fillOpacity,
    stroke,
    strokeWidth,
    opacity,
    data,
    onpointerenter,
    onpointermove,
    onpointerleave,
    ontouchmove,
    tooltip,
    motion,
    class: className,
    ...restProps
  }: RibbonBaseProps = $props();

  const ctx = getChartContext();

  const ribbonGenerator = $derived.by(() => {
    if (directed) {
      const gen = d3ribbonArrow();
      if (radius != null) gen.radius(radius);
      if (headRadius != null) gen.headRadius(headRadius);
      return gen;
    } else {
      const gen = d3ribbon();
      if (radius != null) gen.radius(radius);
      return gen;
    }
  });

  // @ts-expect-error - Chord type is compatible with Ribbon at runtime; radius is set on the generator
  const pathData = $derived(ribbonGenerator(chord) ?? undefined);

  const onPointerEnter: PointerEventHandler<SVGPathElement> = (e) => {
    onpointerenter?.(e);
    if (tooltip) ctx.tooltip.show(e, data);
  };

  const onPointerMove: PointerEventHandler<SVGPathElement> = (e) => {
    onpointermove?.(e);
    if (tooltip) ctx.tooltip.show(e, data);
  };

  const onPointerLeave: PointerEventHandler<SVGPathElement> = (e) => {
    onpointerleave?.(e);
    if (tooltip) ctx.tooltip.hide();
  };
</script>

<Path
  {pathData}
  {fill}
  {fillOpacity}
  {stroke}
  {strokeWidth}
  {opacity}
  {motion}
  {...restProps}
  class={cls('lc-ribbon', className)}
  onpointerenter={onPointerEnter}
  onpointermove={onPointerMove}
  onpointerleave={onPointerLeave}
  ontouchmove={(e: TouchEvent & { currentTarget: SVGPathElement }) => {
    ontouchmove?.(e);
    if (tooltip) {
      e.preventDefault();
    }
  }}
/>
