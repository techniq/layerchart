<script lang="ts" context="module">
  import { getContext, setContext } from 'svelte';

  export const renderContextKey = Symbol();

  type RenderContext = 'canvas' | 'svg' | 'html';

  /** Get render context.  Useful to conditionally render components based on the render context. */
  export function getRenderContext() {
    return getContext<RenderContext>(renderContextKey);
  }

  /** Set by Canavs, Html, or Svg render/layout component */
  export function setRenderContext(context: RenderContext) {
    setContext(renderContextKey, context);
  }
</script>

<script lang="ts" generics="TData">
  import { onMount, type ComponentProps } from 'svelte';
  import { LayerCake } from 'layercake';
  import type { HierarchyNode } from 'd3-hierarchy';
  import type { SankeyGraph } from 'd3-sankey';
  import { max, min } from 'd3-array';

  import ChartContext from './ChartContext.svelte';
  import GeoContext from './GeoContext.svelte';
  import TooltipContext from './tooltip/TooltipContext.svelte';
  import TransformContext from './TransformContext.svelte';
  import BrushContext from './BrushContext.svelte';

  import { accessor, type Accessor } from '$lib/utils/common.js';
  import { isScaleBand, type AnyScale, type DomainType } from '$lib/utils/scales.js';
  import { geoFitObjectTransform } from '$lib/utils/geo.js';

  type LayerCakeProps = ComponentProps<LayerCake>;

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
    /** The x1 accessor. The key in each row of data that corresponds to the x1-field. This can be a string, an accessor function, a number or an array of any combination of those types. This property gets converted to a function when you access it through the context. */
    x1?: Accessor<TData>;
    /** The y1 accessor. The key in each row of data that corresponds to the y1-field. This can be a string, an accessor function, a number or an array of any combination of those types. This property gets converted to a function when you access it through the context. */
    y1?: Accessor<TData>;
    /** The c (color) accessor. The key in each row of data that corresponds to the color. This can be a string or an accessor function. This property gets converted to a function when you access it through the context. */
    c?: Accessor<TData>;

    /** Set a min or max. For linear scales, if you want to inherit the value from the data's extent, set that value to `null`. This value can also be an array because sometimes your scales are [piecewise](https://github.com/d3/d3-scale#continuous_domain) or are a list of discrete values such as in [ordinal scales](https://github.com/d3/d3-scale#ordinal-scales), useful for color series. Set it to a function that receives the computed domain and lets you return a modified domain, useful for sorting values. */
    xDomain?: DomainType;
    /** Set a min or max. For linear scales, if you want to inherit the value from the data's extent, set that value to `null`.  Set it to a function that receives the computed domain and lets you return a modified domain, useful for sorting values. */
    yDomain?: DomainType;
    /** Set a min or max. For linear scales, if you want to inherit the value from the data's extent, set that value to `null`. This value can also be an array because sometimes your scales are [piecewise](https://github.com/d3/d3-scale#continuous_domain) or are a list of discrete values such as in [ordinal scales](https://github.com/d3/d3-scale#ordinal-scales), useful for color series. Set it to a function that receives the computed domain and lets you return a modified domain, useful for sorting values. */
    zDomain?: DomainType;
    /** Set a min or max. For linear scales, if you want to inherit the value from the data's extent, set that value to `null`. This value can also be an array because sometimes your scales are [piecewise](https://github.com/d3/d3-scale#continuous_domain) or are a list of discrete values such as in [ordinal scales](https://github.com/d3/d3-scale#ordinal-scales), useful for color series. Set it to a function that receives the computed domain and lets you return a modified domain, useful for sorting values. */
    rDomain?: DomainType;
    /** Set a min or max. For linear scales, if you want to inherit the value from the data's extent, set that value to `null`. This value can also be an array because sometimes your scales are [piecewise](https://github.com/d3/d3-scale#continuous_domain) or are a list of discrete values such as in [ordinal scales](https://github.com/d3/d3-scale#ordinal-scales), useful for color series. Set it to a function that receives the computed domain and lets you return a modified domain, useful for sorting values. */
    x1Domain?: DomainType;
    /** Set a min or max. For linear scales, if you want to inherit the value from the data's extent, set that value to `null`. This value can also be an array because sometimes your scales are [piecewise](https://github.com/d3/d3-scale#continuous_domain) or are a list of discrete values such as in [ordinal scales](https://github.com/d3/d3-scale#ordinal-scales), useful for color series. Set it to a function that receives the computed domain and lets you return a modified domain, useful for sorting values. */
    y1Domain?: DomainType;
    /** Set the list of color values. */
    cDomain?: DomainType;

    /** Applies D3's [scale.nice()](https://github.com/d3/d3-scale#continuous_nice) to the x domain. @default false */
    xNice?: boolean | number;
    /** Applies D3's [scale.nice()](https://github.com/d3/d3-scale#continuous_nice) to the y domain. @default false */
    yNice?: boolean | number;
    /**  Applies D3's [scale.nice()](https://github.com/d3/d3-scale#continuous_nice) to the z domain. @default false */
    zNice?: boolean | number;
    /**  Applies D3's [scale.nice()](https://github.com/d3/d3-scale#continuous_nice) to the r domain. @default false */
    rNice?: boolean | number;

    /** Assign a pixel value to add to the min or max of the scale. This will increase the scales domain by the scale unit equivalent of the provided pixels. */
    xPadding?: [number, number];
    /** Assign a pixel value to add to the min or max of the scale. This will increase the scales domain by the scale unit equivalent of the provided pixels. */
    yPadding?: [number, number];
    /** Assign a pixel value to add to the min or max of the scale. This will increase the scales domain by the scale unit equivalent of the provided pixels. */
    zPadding?: [number, number];
    /** Assign a pixel value to add to the min or max of the scale. This will increase the scales domain by the scale unit equivalent of the provided pixels. */
    rPadding?: [number, number];

    /** The D3 scale that should be used for the x-dimension. Pass in an instantiated D3 scale if you want to override the default or you want to extra options. @default scaleLinear */
    xScale?: AnyScale;
    /** The D3 scale that should be used for the x-dimension. Pass in an instantiated D3 scale if you want to override the default or you want to extra options. @default scaleLinear */
    yScale?: AnyScale;
    /** The D3 scale that should be used for the x-dimension. Pass in an instantiated D3 scale if you want to override the default or you want to extra options. @default scaleLinear */
    zScale?: AnyScale;
    /** The D3 scale that should be used for the x-dimension. Pass in an instantiated D3 scale if you want to override the default or you want to extra options. @default scaleSqrt */
    rScale?: AnyScale;
    /** The D3 scale that should be used for the x1-dimension. Pass in an instantiated D3 scale if you want to override the default or you want to extra options. @default scaleLinear */
    x1Scale?: AnyScale;
    /** The D3 scale that should be used for the y1-dimension. Pass in an instantiated D3 scale if you want to override the default or you want to extra options. @default scaleLinear */
    y1Scale?: AnyScale;
    /** The D3 scale that should be used for the  color dimension. Pass in an instantiated D3 scale if you want to override the default or you want to extra options. @default scaleOrdinal */
    cScale?: AnyScale;

    /** Override the default x range of `[0, width]` by setting an array or function with argument `({ width, height})` that returns an array. Setting this prop overrides `xReverse`. This can also be a list of numbers or strings for scales with discrete ranges like [scaleThreshold](https://github.com/d3/d3-scale#threshold-scales) or [scaleQuantize](https://github.com/d3/d3-scale#quantize-scales). */
    xRange?:
      | number[]
      | string[]
      | ((args: { width: number; height: number }) => number[] | string[]);
    /** Override the default y range of `[0, height]` by setting an array or function with argument `({ width, height})` that returns an array. Setting this prop overrides `yReverse`. This can also be a list of numbers or strings for scales with discrete ranges like [scaleThreshold](https://github.com/d3/d3-scale#threshold-scales) or [scaleQuantize](https://github.com/d3/d3-scale#quantize-scales). */
    yRange?:
      | number[]
      | string[]
      | ((args: { width: number; height: number }) => number[] | string[]);
    /** Override the default z range of `[0, width]` by setting an array or function with argument `({ width, height})` that returns an array. Setting this prop overrides `zReverse`. This can also be a list of numbers or strings for scales with discrete ranges like [scaleThreshold](https://github.com/d3/d3-scale#threshold-scales) or [scaleQuantize](https://github.com/d3/d3-scale#quantize-scales). */
    zRange?:
      | number[]
      | string[]
      | ((args: { width: number; height: number }) => number[] | string[]);
    /** Override the default r range of `[1, 25]` by setting an array or function with argument `({ width, height})` that returns an array. Setting this prop overrides `rReverse`. This can also be a list of numbers or strings for scales with discrete ranges like [scaleThreshold](https://github.com/d3/d3-scale#threshold-scales) or [scaleQuantize](https://github.com/d3/d3-scale#quantize-scales). */
    rRange?:
      | number[]
      | string[]
      | ((args: { width: number; height: number }) => number[] | string[]);
    /** Set the x1 range by setting an array or function with argument `({ xScale, width, height})` that returns an array. This can also be a list of numbers or strings for scales with discrete ranges like [scaleThreshold](https://github.com/d3/d3-scale#threshold-scales) or [scaleQuantize](https://github.com/d3/d3-scale#quantize-scales). */
    x1Range?:
      | number[]
      | string[]
      | ((args: { xScale: AnyScale; width: number; height: number }) => number[] | string[]);
    /** Set the y1 range by setting an array or function with argument `({ yScale, width, height})` that returns an array. This can also be a list of numbers or strings for scales with discrete ranges like [scaleThreshold](https://github.com/d3/d3-scale#threshold-scales) or [scaleQuantize](https://github.com/d3/d3-scale#quantize-scales). */
    y1Range?:
      | number[]
      | string[]
      | ((args: { yScale: AnyScale; width: number; height: number }) => number[] | string[]);
    /** Override the default y1 range of `[0, width]` by setting an array or function with argument `({ yScale, width, height})` that returns an array. Setting this prop overrides `x1Reverse`. This can also be a list of numbers or strings for scales with discrete ranges like [scaleThreshold](https://github.com/d3/d3-scale#threshold-scales) or [scaleQuantize](https://github.com/d3/d3-scale#quantize-scales). */
    cRange?: string[] | readonly string[];

    /** Reverse the default x range. By default this is `false` and the range is `[0, width]`. Ignored if you set the xRange prop. @default false */
    xReverse?: boolean;
    /** Reverse the default y range. By default this is `true` and the range is `[height, 0]` unless using an ordinal scale with a `.bandwidth` method for `yScale`. Ignored if you set the `yRange` prop. @default true */
    yReverse?: boolean;
    /** Reverse the default z range. By default this is `false` and the range is `[0, width]`. Ignored if you set the zRange prop. @default false */
    zReverse?: boolean;
    /** Reverse the default r range. By default this is `false` and the range is `[1, 25]`. Ignored if you set the rRange prop. @default false */
    rReverse?: boolean;

    /** Only used when scale is ordinal. Set whether the calculated unique items come back sorted. */
    xDomainSort?: boolean;
    /** Only used when scale is ordinal. Set whether the calculated unique items come back sorted. */
    yDomainSort?: boolean;
    /** Only used when scale is ordinal. Set whether the calculated unique items come back sorted. */
    zDomainSort?: boolean;
    /** Only used when scale is ordinal. Set whether the calculated unique items come back sorted. */
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

    /** Enable debug printing to the console. Useful to inspect your scales and dimensions. */
    debug?: boolean;

    /** Show warnings in the console. */
    verbose?: boolean;

    /** x value guaranteed to be visible in xDomain.  Useful with optional negative values since `xDomain={[0, null]}` would ignore negative values */
    xBaseline?: typeof xBaseline;

    /** y value guaranteed to be visible in yDomain.  Useful with optional negative values since `yDomain={[0, null]}` would ignore negative values */
    yBaseline?: typeof xBaseline;

    /* Props passed to ChartContext */
    /** Use radial instead of cartesian coordinates, mapping `x` to `angle` and `y`` to radial.  Radial lines are positioned relative to the origin, use transform (ex. `<Group center>`) to change the origin */
    radial?: typeof radial;

    /** Props passed to GeoContext */
    geo?: typeof geo;

    /** Exposed via bind: to support `bind:geoProjection` for external access */
    geoProjection?: typeof geoProjection;

    /** Props passed to TooltipContext */
    tooltip?: typeof tooltip;

    /** Exposed via bind: to support `bind:tooltipContext` for external access (ex. `tooltipContext.data) */
    tooltipContext?: typeof tooltipContext;

    /** Props passed to TransformContext */
    transform?: typeof transform;

    /** Expose to support `bind:transformContext` for imperative control (`transformContext.translate(...)`) */
    transformContext?: typeof transformContext;

    /** Props passed to BrushContext */
    brush?: typeof brush;

    /** Exposed via bind: to support `bind:brushContext` for external access (ex. `brushContext.xDomain) */
    brushContext?: typeof brushContext;

    // ChartContext callback events
    onresize?: typeof onresize;

    // TransformContext callback events
    ondragstart?: typeof ondragstart;
    ondragend?: typeof ondragend;
    ontransform?: typeof ontransform;
  }

  export let data: TData[] | HierarchyNode<TData> | SankeyGraph<any, any> = [];

  export let x: Accessor<TData> = undefined;
  export let xRange: $$Props['xRange'] = undefined;

  export let y: Accessor<TData> = undefined;
  export let yScale: AnyScale | undefined = undefined;
  export let yRange: $$Props['yRange'] = undefined;

  export let x1: $$Props['x1'] = undefined;
  export let x1Scale: $$Props['x1Scale'] = undefined;
  export let x1Domain: $$Props['x1Domain'] = undefined;
  export let x1Range: $$Props['x1Range'] = undefined;

  export let y1: $$Props['y1'] = undefined;
  export let y1Scale: $$Props['y1Scale'] = undefined;
  export let y1Domain: $$Props['y1Domain'] = undefined;
  export let y1Range: $$Props['y1Range'] = undefined;

  export let c: $$Props['c'] = undefined;
  export let cScale: $$Props['cScale'] = undefined;
  export let cDomain: $$Props['cDomain'] = undefined;
  export let cRange: $$Props['cRange'] = undefined;

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

  /** Use radial instead of cartesian coordinates, mapping `x` to `angle` and `y`` to radial.  Radial lines are positioned relative to the origin, use transform (ex. `<Group center>`) to change the origin */
  export let radial = false;

  /** Props passed to GeoContext */
  export let geo: Partial<ComponentProps<GeoContext>> | undefined = undefined;

  /** Expose bound geo projection context */
  export let geoProjection: ComponentProps<GeoContext>['geo'] = undefined;

  /** Props passed to TooltipContext */
  export let tooltip: Partial<ComponentProps<TooltipContext>> | boolean | undefined = undefined;

  /** Expose bound tooltip context */
  export let tooltipContext: ComponentProps<TooltipContext>['tooltip'] = undefined;

  /** Props passed to TransformContext */
  export let transform: Partial<ComponentProps<TransformContext>> | undefined = undefined;
  // @ts-expect-error will only be undefined until bind:transformContext runs
  export let transformContext: TransformContext = undefined;

  /** Props passed to BrushContext */
  export let brush: Partial<ComponentProps<BrushContext>> | boolean | undefined = undefined;

  /** Expose bound brush context */
  export let brushContext: ComponentProps<BrushContext>['brush'] = undefined;

  export let onresize: ComponentProps<ChartContext<TData>>['onresize'] = undefined;
  export let ondragstart: ComponentProps<TransformContext>['ondragstart'] = undefined;
  export let ondragend: ComponentProps<TransformContext>['ondragend'] = undefined;
  export let ontransform: ComponentProps<TransformContext>['ontransform'] = undefined;

  // Track when mounted since LayerCake initializes width/height with `100` until bound `clientWidth`/`clientWidth` can run
  // Useful to key/remount TransformContext with correct `initialTranslate` / `initialScale` values
  let isMounted = false;
  onMount(() => {
    isMounted = true;
  });

  // TODO: Hacks until LayerCake has better typings (`Accessor<TData>`)
  $: _x = x as LayerCakeProps['x'];
  $: _y = y as LayerCakeProps['y'];
  $: _yRange =
    yRange ??
    ((radial
      ? ({ height }: { height: number }) => [0, height / 2]
      : undefined) as LayerCakeProps['yRange']);
</script>

<!-- Remove domain sorting by default: https://github.com/mhkeller/layercake/issues/147  -->
<LayerCake
  {data}
  x={_x}
  {xDomain}
  xRange={xRange ?? (radial ? [0, 2 * Math.PI] : undefined)}
  y={_y}
  {yScale}
  {yDomain}
  yRange={_yRange}
  {yReverse}
  xDomainSort={false}
  yDomainSort={false}
  zDomainSort={false}
  rDomainSort={false}
  {...$$restProps}
  let:aspectRatio
  let:containerHeight
  let:containerWidth
  let:height
  let:width
  let:element
  let:x
  let:xScale
  let:xGet
  let:y
  let:yScale
  let:yGet
  let:z
  let:zScale
  let:zGet
  let:r
  let:rScale
  let:rGet
  let:padding
>
  <!-- Apply `fitGeojson` using TransformContext instead of GeoContext if `applyTransform` is used -->
  {@const initialTransform =
    geo?.applyTransform?.includes('translate') && geo?.fitGeojson && geo?.projection
      ? geoFitObjectTransform(geo.projection(), [width, height], geo.fitGeojson)
      : undefined}

  <ChartContext
    {data}
    {radial}
    {x1}
    {x1Scale}
    {x1Domain}
    {x1Range}
    {y1}
    {y1Scale}
    {y1Domain}
    {y1Range}
    {c}
    {cScale}
    {cDomain}
    {cRange}
    let:data
    let:flatData
    let:config
    let:x1
    let:x1Scale
    let:x1Get
    let:y1
    let:y1Scale
    let:y1Get
    let:c
    let:cScale
    let:cGet
    {onresize}
  >
    {#key isMounted}
      <TransformContext
        bind:this={transformContext}
        mode={(transform?.mode ?? geo?.applyTransform?.length) ? 'manual' : 'none'}
        initialTranslate={initialTransform?.translate}
        initialScale={initialTransform?.scale}
        processTranslate={geo
          ? (x, y, deltaX, deltaY) => {
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
              } else {
                // Apply default TransformContext.processTransform (passing `undefined` below appears to not work when checking for `geo?.applyTransform` exists)
                return { x: x + deltaX, y: y + deltaY };
              }
            }
          : undefined}
        {...transform}
        let:transform={_transform}
        {ondragstart}
        {ontransform}
        {ondragend}
      >
        <GeoContext {...geo} bind:geo={geoProjection} let:projection>
          {@const brushProps = typeof brush === 'object' ? brush : { disabled: !brush }}
          <BrushContext {...brushProps} bind:brush={brushContext} let:brush>
            {@const tooltipProps = typeof tooltip === 'object' ? tooltip : {}}
            <TooltipContext {...tooltipProps} bind:tooltip={tooltipContext} let:tooltip>
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
                {brush}
                {x}
                {xScale}
                {xGet}
                {y}
                {yScale}
                {yGet}
                {z}
                {zScale}
                {zGet}
                {r}
                {rScale}
                {rGet}
                {x1}
                {x1Scale}
                {x1Get}
                {y1}
                {y1Scale}
                {y1Get}
                {c}
                {cScale}
                {cGet}
                {padding}
                {data}
                {flatData}
                {config}
              />
            </TooltipContext>
          </BrushContext>
        </GeoContext>
      </TransformContext>
    {/key}
  </ChartContext>
</LayerCake>
