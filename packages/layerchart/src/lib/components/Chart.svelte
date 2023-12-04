<script context="module" lang="ts">
  // import { LayerCake, Svg, Html } from 'layercake';
  // export { Svg, Html };

  // TODO: Workaround for sveld error: `Cannot read properties of null (reading 'type')` in `ComponentParser`
  // See: https://github.com/carbon-design-system/sveld/issues/104
  import {
    LayerCake,
    Svg as _Svg,
    Html as _Html,
    Canvas as _Canvas,
    WebGL as _WebGL,
  } from 'layercake';

  export const Svg = _Svg;
  export const Html = _Html;
  export const Canvas = _Canvas;
  export const WebGL = _WebGL;
</script>

<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { max, min } from 'd3-array';
  import { get } from 'lodash-es';
  import { isScaleBand } from '$lib/utils/scales';
  import TooltipContext from './TooltipContext.svelte';
  import GeoContext from './GeoContext.svelte';

  type Accessor = string | ((d: any) => number);

  /**
   *  Resolve a value from data based on the accessor type
   */
  function getValue(accessor: Accessor | Accessor[], d) {
    if (Array.isArray(accessor)) {
      return accessor.map((a) => getValue(a, d));
    } else if (typeof accessor === 'function') {
      return accessor(d) || 0;
    } else if (typeof accessor === 'string') {
      return get(d, accessor);
    } else {
      throw new Error('Unexpected accessor: ' + accessor);
    }
  }

  export let data: any[] = [];

  export let x: Accessor | Accessor[] | undefined = undefined;
  export let y: Accessor | Accessor[] | undefined = undefined;
  export let yScale: Function | undefined = undefined;

  /**
   * x value guaranteed to be visible in xDomain.  Useful with optional negative values since `xDomain={[0, null]}` would ignore negative values
   */
  export let xBaseline: number | null = null;

  let xDomain: [number, number] | undefined = undefined;
  $: if (xBaseline != null) {
    const xValues = data.flatMap((d) => getValue(x, d));
    xDomain = [min([xBaseline, ...xValues]), max([xBaseline, ...xValues])];
  }

  /**
   * y value guaranteed to be visible in yDomain.  Useful with optional negative values since `yDomain={[0, null]}` would ignore negative values
   */
  export let yBaseline: number | null = null;

  let yDomain: [number, number] | undefined = undefined;
  $: if (yBaseline != null) {
    const yValues = data.flatMap((d) => getValue(y, d));
    yDomain = [min([yBaseline, ...yValues]), max([yBaseline, ...yValues])];
  }

  /**
   * Reverse the default y range ([0, height] becomes [height, 0]). By default this is `true` unless using scaleBand y scale.
   * see: https://layercake.graphics/guide#yreverse
   * see: https://github.com/mhkeller/layercake/issues/83
   */
  $: yReverse = yScale ? !isScaleBand(yScale) : true;

  export let tooltip: ComponentProps<TooltipContext> | boolean | undefined = undefined;

  export let geo: ComponentProps<GeoContext> | undefined = undefined;
</script>

<LayerCake
  {data}
  {x}
  {xDomain}
  {y}
  {yScale}
  {yDomain}
  {yReverse}
  {...$$restProps}
  let:aspectRatio
  let:containerHeight
  let:containerWidth
  let:height
  let:width
  let:element
  let:xScale
  let:yScale
  let:zScale
  let:rScale
  let:padding
  let:data
  let:flatData
>
  <GeoContext {...geo} let:projection>
    {#if tooltip}
      {@const tooltipProps = typeof tooltip === 'object' ? tooltip : {}}
      <TooltipContext {...tooltipProps} let:tooltip>
        <slot
          {aspectRatio}
          {containerHeight}
          {containerWidth}
          {height}
          {width}
          {element}
          {projection}
          {tooltip}
          {xScale}
          {yScale}
          {zScale}
          {rScale}
          {padding}
          {data}
          {flatData}
        />
      </TooltipContext>
    {:else}
      <slot
        {aspectRatio}
        {containerHeight}
        {containerWidth}
        {height}
        {width}
        {element}
        {projection}
        {xScale}
        {yScale}
        {zScale}
        {rScale}
        {padding}
        {data}
        {flatData}
      />
    {/if}
  </GeoContext>
</LayerCake>
