<script context="module" lang="ts">
  // import { LayerCake, Svg, Html } from 'layercake';
  // export { Svg, Html };

  // TODO: Workaround for sveld error: `Cannot read properties of null (reading 'type')` in `ComponentParser`
  // See: https://github.com/carbon-design-system/sveld/issues/104
  import {
    LayerCake,
    // Canvas as _Canvas,
    // Html as _Html,
    // Svg as _Svg,
    WebGL as _WebGL,
  } from 'layercake';
  import _Canvas from './layout/Canvas.svelte';
  import _Html from './layout/Html.svelte';
  import _Svg from './layout/Svg.svelte';

  export const Canvas = _Canvas;
  export const Html = _Html;
  export const Svg = _Svg;
  export const WebGL = _WebGL;
</script>

<script lang="ts" generics="TData">
  import { accessor, type Accessor } from 'layerchart/utils/common.js';

  import type { HierarchyNode } from 'd3-hierarchy';
  import type { SankeyGraph } from 'd3-sankey';

  import { onMount, type ComponentProps } from 'svelte';
  import { max, min } from 'd3-array';
  import { isScaleBand, type AnyScale } from '$lib/utils/scales.js';

  import ChartContext from './ChartContext.svelte';
  import GeoContext from './GeoContext.svelte';
  import TooltipContext from './TooltipContext.svelte';
  import TransformContext from './TransformContext.svelte';
  import { geoFitObjectTransform } from '$lib/utils/geo.js';

  type DomainType =
    | [number | Date | null, number | Date | null]
    | string[]
    | (number | null)[]
    | Date[]
    | Function
    // 'null' useful for Brush component
    | null[]
    | null;

  interface $$Props {
    /** Whether this chart should be rendered server side. @default false */
    ssr?: boolean;

    /** Whether to allow pointer events via CSS. Set this to `false` to set `pointer-events: none;` on all components, disabling all mouse interaction. @default true */
    pointerEvents?: boolean;

    /** Determine the positioning of the wrapper div. Set this to `'absolute'` when you want to stack cakes. @default 'relative' */
    position?: string;

    /** If `true`, set all scale ranges to `[0, 100]`. Ranges reversed via `xReverse`, `yReverse`, `zReverse` or `rReverse` props will continue to be reversed as usual. @default false */
    percentRange?: boolean;

    /** Override the automated width.  */
    width?: number;
    /** Override the automated height.  */
    height?: number;

    /** The bound container width. */
    containerWidth?: number;
    /**The bound container height. */
    containerHeight?: number;

    /**	The .layercake-container `<div>` tag. Useful for bindings. */
    element?: HTMLDivElement;

    /** If `data` is not a flat array of objects and you want to use any of the scales, set a flat version of the data via the `flatData` prop. */
    data?: typeof data;

    /** A flat version of data. */
    flatData?: any[];

    /** The x accessor. The key in each row of data that corresponds to the x-field. This can be a string, an accessor function, a number or an array of any combination of those types. This property gets converted to a function when you access it through the context. */
    x?: Accessor<TData>;
    /** The y accessor. The key in each row of data that corresponds to the y-field. This can be a string, an accessor function, a number or an array of any combination of those types. This property gets converted to a function when you access it through the context. */
    y?: Accessor<TData>;
    /** The z accessor. The key in each row of data that corresponds to the z-field. This can be a string, an accessor function, a number or an array of any combination of those types. This property gets converted to a function when you access it through the context. */
    z?: Accessor<TData>;
    /** The r accessor. The key in each row of data that corresponds to the r-field. This can be a string, an accessor function, a number or an array of any combination of those types. This property gets converted to a function when you access it through the context. */
    r?: Accessor<TData>;

    /** Set a min or max. For linear scales, if you want to inherit the value from the data's extent, set that value to `null`. This value can also be an array because sometimes your scales are [piecewise](https://github.com/d3/d3-scale#continuous_domain) or are a list of discrete values such as in [ordinal scales](https://github.com/d3/d3-scale#ordinal-scales), useful for color series. Set it to a function that receives the computed domain and lets you return a modified domain, useful for sorting values. */
    xDomain?: DomainType;
    /** Set a min or max. For linear scales, if you want to inherit the value from the data's extent, set that value to `null`.  Set it to a function that receives the computed domain and lets you return a modified domain, useful for sorting values. */
    yDomain?: DomainType;
    /** Set a min or max. For linear scales, if you want to inherit the value from the data's extent, set that value to `null`. This value can also be an array because sometimes your scales are [piecewise](https://github.com/d3/d3-scale#continuous_domain) or are a list of discrete values such as in [ordinal scales](https://github.com/d3/d3-scale#ordinal-scales), useful for color series. Set it to a function that receives the computed domain and lets you return a modified domain, useful for sorting values. */
    zDomain?: DomainType;
    /** Set a min or max. For linear scales, if you want to inherit the value from the data's extent, set that value to `null`. This value can also be an array because sometimes your scales are [piecewise](https://github.com/d3/d3-scale#continuous_domain) or are a list of discrete values such as in [ordinal scales](https://github.com/d3/d3-scale#ordinal-scales), useful for color series. Set it to a function that receives the computed domain and lets you return a modified domain, useful for sorting values. */
    rDomain?: DomainType;

    /** Applies D3's [scale.nice()](https://github.com/d3/d3-scale#continuous_nice) to the x domain. @default false */
    xNice?: boolean | number;
    /** Applies D3's [scale.nice()](https://github.com/d3/d3-scale#continuous_nice) to the y domain. @default false */
    yNice?: boolean | number;
    /**  Applies D3's [scale.nice()](https://github.com/d3/d3-scale#continuous_nice) to the z domain. @default false */
    zNice?: boolean | number;
    /**  Applies D3's [scale.nice()](https://github.com/d3/d3-scale#continuous_nice) to the r domain. @default false */
    rNice?: boolean | number;

    /** @type Assign a pixel value to add to the min or max of the scale. This will increase the scales domain by the scale unit equivalent of the provided pixels. */
    xPadding?: [number, number];
    /** @type Assign a pixel value to add to the min or max of the scale. This will increase the scales domain by the scale unit equivalent of the provided pixels. */
    yPadding?: [number, number];
    /** @type Assign a pixel value to add to the min or max of the scale. This will increase the scales domain by the scale unit equivalent of the provided pixels. */
    zPadding?: [number, number];
    /** @type Assign a pixel value to add to the min or max of the scale. This will increase the scales domain by the scale unit equivalent of the provided pixels. */
    rPadding?: [number, number];

    /** @type {Function} [xScale=d3.scaleLinear] The D3 scale that should be used for the x-dimension. Pass in an instantiated D3 scale if you want to override the default or you want to extra options. */
    xScale?: AnyScale;
    /** @type {Function} [yScale=d3.scaleLinear] The D3 scale that should be used for the x-dimension. Pass in an instantiated D3 scale if you want to override the default or you want to extra options. */
    yScale?: AnyScale;
    /** @type {Function} [zScale=d3.scaleLinear] The D3 scale that should be used for the x-dimension. Pass in an instantiated D3 scale if you want to override the default or you want to extra options. */
    zScale?: AnyScale;
    /** @type {Function} [rScale=d3.scaleSqrt] The D3 scale that should be used for the x-dimension. Pass in an instantiated D3 scale if you want to override the default or you want to extra options. */
    rScale?: AnyScale;

    /** @type Override the default x range of `[0, width]` by setting an array or function with argument `({ width, height})` that returns an array. Setting this prop overrides `xReverse`. This can also be a list of numbers or strings for scales with discrete ranges like [scaleThreshhold](https://github.com/d3/d3-scale#threshold-scales) or [scaleQuantize](https://github.com/d3/d3-scale#quantize-scales). */
    xRange?:
      | number[]
      | string[]
      | ((args: { width: number; height: number }) => number[] | string[]);
    /** Override the default y range of `[0, height]` by setting an array or function with argument `({ width, height})` that returns an array. Setting this prop overrides `yReverse`. This can also be a list of numbers or strings for scales with discrete ranges like [scaleThreshhold](https://github.com/d3/d3-scale#threshold-scales) or [scaleQuantize](https://github.com/d3/d3-scale#quantize-scales). */
    yRange?:
      | number[]
      | string[]
      | ((args: { width: number; height: number }) => number[] | string[]);
    /** Override the default z range of `[0, width]` by setting an array or function with argument `({ width, height})` that returns an array. Setting this prop overrides `zReverse`. This can also be a list of numbers or strings for scales with discrete ranges like [scaleThreshhold](https://github.com/d3/d3-scale#threshold-scales) or [scaleQuantize](https://github.com/d3/d3-scale#quantize-scales). */
    zRange?:
      | number[]
      | string[]
      | ((args: { width: number; height: number }) => number[] | string[]);
    /** Override the default r range of `[1, 25]` by setting an array or function with argument `({ width, height})` that returns an array. Setting this prop overrides `rReverse`. This can also be a list of numbers or strings for scales with discrete ranges like [scaleThreshhold](https://github.com/d3/d3-scale#threshold-scales) or [scaleQuantize](https://github.com/d3/d3-scale#quantize-scales). */
    rRange?:
      | number[]
      | string[]
      | ((args: { width: number; height: number }) => number[] | string[]);

    /** Reverse the default x range. By default this is `false` and the range is `[0, width]`. Ignored if you set the xRange prop. @default false */
    xReverse?: boolean;
    /** Reverse the default y range. By default this is `true` and the range is `[height, 0]` unless using an ordinal scale with a `.bandwidth` method for `yScale`. Ignored if you set the `yRange` prop. @default true */
    yReverse?: boolean;
    /** @type {Boolean} [zReverse=false] Reverse the default z range. By default this is `false` and the range is `[0, width]`. Ignored if you set the zRange prop. @default false */
    zReverse?: boolean;
    /** @type {Boolean} [rReverse=false] Reverse the default r range. By default this is `false` and the range is `[1, 25]`. Ignored if you set the rRange prop. @default false */
    rReverse?: boolean;

    /** @type {Boolean} [xDomainSort=true] Only used when scale is ordinal. Set whether the calculated unique items come back sorted. */
    xDomainSort?: boolean;
    /** @type {Boolean} [yDomainSort=true] Only used when scale is ordinal. Set whether the calculated unique items come back sorted. */
    yDomainSort?: boolean;
    /** @type {Boolean} [zDomainSort=true] Only used when scale is ordinal. Set whether the calculated unique items come back sorted. */
    zDomainSort?: boolean;
    /** @type {Boolean} [rDomainSort=true] Only used when scale is ordinal. Set whether the calculated unique items come back sorted. */
    rDomainSort?: boolean;

    /** The amount of padding to put around your chart. It operates like CSS box-sizing: border-box; where values are subtracted from the parent container's width and height, the same as a [D3 margin convention](https://bl.ocks.org/mbostock/3019563). */
    padding?: { top?: Number; right?: Number; bottom?: Number; left?: Number };

    /** Manually set the extents of the x, y or r scale as a two-dimensional array of the min and max you want. Setting values here will skip any dynamic extent calculation of the data for that dimension. */
    extents?: {
      x?: [min: Number, max: Number];
      y?: [min: Number, max: Number];
      r?: [min: Number, max: Number];
      z?: [min: Number, max: Number];
    };

    /** Any extra configuration values you want available on the LayerCake context. This could be useful for color lookups or additional constants. */
    custom?: Record<string, any>;

    /** @type {Boolean} debug Enable debug printing to the console. Useful to inspect your scales and dimensions. */
    debug?: boolean;

    /** @type {Boolean} [verbose=true] Show warnings in the console. */
    verbose?: boolean;

    /** x value guaranteed to be visible in xDomain.  Useful with optional negative values since `xDomain={[0, null]}` would ignore negative values */
    xBaseline?: typeof xBaseline;

    /** y value guaranteed to be visible in yDomain.  Useful with optional negative values since `yDomain={[0, null]}` would ignore negative values */
    yBaseline?: typeof xBaseline;

    /** Props passed to GeoContext */
    geo?: typeof geo;

    /** Props passed to TooltipContext */
    tooltip?: typeof tooltip;

    /** Props passed to TransformContext */
    transform?: typeof transform;

    /** Expose to support `bind:transformContext` for imperative control (`transformContext.translate(...)`) */
    transformContext?: typeof transformContext;
  }

  export let data: TData[] | HierarchyNode<TData> | SankeyGraph<any, any> = [];

  export let x: Accessor<TData> = undefined;
  export let y: Accessor<TData> = undefined;
  export let yScale: AnyScale | undefined = undefined;

  /**
   * x value guaranteed to be visible in xDomain.  Useful with optional negative values since `xDomain={[0, null]}` would ignore negative values
   */
  export let xBaseline: number | null = null;

  let xDomain: [number, number] | undefined = undefined;
  $: if (xBaseline != null && Array.isArray(data)) {
    const xValues = data.flatMap(accessor(x));
    xDomain = [min([xBaseline, ...xValues]), max([xBaseline, ...xValues])];
  }

  /**
   * y value guaranteed to be visible in yDomain.  Useful with optional negative values since `yDomain={[0, null]}` would ignore negative values
   */
  export let yBaseline: number | null = null;

  let yDomain: [number, number] | undefined = undefined;
  $: if (yBaseline != null && Array.isArray(data)) {
    const yValues = data.flatMap(accessor(y));
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
  // @ts-expect-error will only be undefined until bind:transformContext runs
  export let transformContext: TransformContext = undefined;

  // Binded for access within TransformContext
  let geoProjection: ComponentProps<GeoContext>['geo'] = undefined;

  // Track when mounted since LayerCake initializes width/height with `100` until binded `clientWidth`/`clientWidth` can run
  // Useful to key/remount TransformContext with correct `initialTranslate` / `initialScale` values
  let isMounted = false;
  onMount(() => {
    isMounted = true;
  });
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
>
  <!-- Apply `fitGeojson` using TransformContext instead of GeoContext if `applyTransform` is used -->
  {@const initialTransform =
    geo?.applyTransform?.includes('translate') && geo?.fitGeojson && geo?.projection
      ? geoFitObjectTransform(geo.projection(), [width, height], geo.fitGeojson)
      : undefined}

  <ChartContext {data} let:data let:flatData>
    {#key isMounted}
      <TransformContext
        bind:this={transformContext}
        mode={transform?.mode ?? geo?.applyTransform?.length ? 'manual' : 'none'}
        initialTranslate={initialTransform?.translate}
        initialScale={initialTransform?.scale}
        processTranslate={geo
          ? (x, y, deltaX, deltaY, scale) => {
              if (geo.applyTransform?.includes('rotate')) {
                // When applying transform to rotate, invert `y` values and reduce sensitivity based on projection scale
                // see: https://observablehq.com/@benoldenburg/simple-globe and https://observablehq.com/@michael-keith/draggable-globe-in-d3
                // @ts-expect-error
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
    {/key}
  </ChartContext>
</LayerCake>
