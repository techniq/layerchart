<script context="module" lang="ts">
  // import { LayerCake, Svg, Html } from 'layercake';
  // export { Svg, Html };

  // TODO: Workaround for sveld error: `Cannot read properties of null (reading 'type')` in `ComponentParser`
  // See: https://github.com/carbon-design-system/sveld/issues/104
  import {
    LayerCake,
    // Canvas as _Canvas,
    Html as _Html,
    // Svg as _Svg,
    WebGL as _WebGL,
  } from 'layercake';
  import _Canvas from './layout/Canvas.svelte';
  import _Svg from './layout/Svg.svelte';

  export const Canvas = _Canvas;
  export const Html = _Html;
  export const Svg = _Svg;
  export const WebGL = _WebGL;
</script>

<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { max, min } from 'd3-array';
  import { get } from 'lodash-es';
  import { isScaleBand } from '$lib/utils/scales.js';

  import GeoContext from './GeoContext.svelte';
  import TooltipContext from './TooltipContext.svelte';
  import TransformContext from './TransformContext.svelte';

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

  /** Props passed to GeoContext */
  export let geo: Partial<ComponentProps<GeoContext>> | undefined = undefined;

  /** Props passed to TooltipContext */
  export let tooltip: Partial<ComponentProps<TooltipContext>> | boolean | undefined = undefined;

  /** Props passed to TransformContext */
  export let transform: Partial<ComponentProps<TransformContext>> | undefined = undefined;
  export let transformContext: TransformContext = undefined;

  let geoProjection: ComponentProps<GeoContext>['geo'] = undefined;
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
  let:xGet
  let:yScale
  let:yGet
  let:zScale
  let:zGet
  let:rScale
  let:rGet
  let:padding
  let:data
  let:flatData
>
  <TransformContext
    bind:this={transformContext}
    processTranslate={geo
      ? (x, y, deltaX, deltaY, scale) => {
          if (geo.applyTransform?.includes('rotate')) {
            // When applying transform to rotate, invert `y` values and reduce sensitivity based on projection scale
            // see: https://observablehq.com/@benoldenburg/simple-globe and https://observablehq.com/@michael-keith/draggable-globe-in-d3
            const projectionScale = $geoProjection.scale();
            const sensitivity = 75;
            return {
              x: x + deltaX * (sensitivity / projectionScale),
              y: y + deltaY * (sensitivity / projectionScale) * -1,
            };
          } else if (geo.applyTransform?.includes('translate')) {
            // When applying to `translate`, use pointer values as is (with no `scale` adjustment)
            return { x: x + deltaX, y: y + deltaY };
          } else {
            // Apply default TransformContext.processTransform (passing `undefined` below appears to not work when checking for `geo?.applyTransform` exists)
            return { x: x + deltaX / scale, y: y + deltaY / scale };
          }
        }
      : undefined}
    {...transform}
    let:transform={_transform}
    on:transform
    on:dragstart
    on:dragend
  >
    <GeoContext {...geo} bind:geo={geoProjection} let:projection>
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
          transform={_transform}
          {tooltip}
          {xScale}
          {xGet}
          {yScale}
          {yGet}
          {zScale}
          {zGet}
          {rScale}
          {rGet}
          {padding}
          {data}
          {flatData}
        />
      </TooltipContext>
    </GeoContext>
  </TransformContext>
</LayerCake>
