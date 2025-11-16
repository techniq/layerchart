<script lang="ts" module>
  import { type ComponentProps, type Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import type { TimeInterval } from 'd3-time';
  import type { HierarchyNode } from 'd3-hierarchy';
  import type { SankeyGraph } from 'd3-sankey';

  import { type Accessor } from '$lib/utils/common.js';
  import { type AnyScale, type DomainType } from '$lib/utils/scales.svelte.js';
  import type {
    BaseRange,
    Nice,
    PaddingArray,
    Without,
    XRangeWithScale,
    YRangeWithScale,
  } from '$lib/utils/types.js';
  import GeoContext from './GeoContext.svelte';
  import TooltipContext from './tooltip/TooltipContext.svelte';

  import { geoFitObjectTransform } from '$lib/utils/geo.js';
  import TransformContext from './TransformContext.svelte';
  import BrushContext from './BrushContext.svelte';
  import { type BrushState } from '$lib/states/brush.svelte.js';

  import { setChartContext } from '$lib/contexts/chart.js';
  import { ChartState } from '$lib/states/chart.svelte.js';

  export type ChartResizeDetail = {
    width: number;
    height: number;
    containerWidth: number;
    containerHeight: number;
  };

  export type PreservedChartConfig<
    T,
    XScale extends AnyScale = AnyScale,
    YScale extends AnyScale = AnyScale,
  > = Pick<
    ChartPropsWithoutHTML<T, XScale, YScale>,
    | 'x'
    | 'y'
    | 'z'
    | 'r'
    | 'c'
    | 'x1'
    | 'y1'
    | 'xRange'
    | 'yRange'
    | 'cDomain'
    | 'zDomain'
    | 'xDomain'
    | 'yDomain'
    | 'rDomain'
    | 'x1Domain'
    | 'y1Domain'
    | 'zRange'
    | 'rRange'
    | 'cRange'
    | 'x1Range'
    | 'y1Range'
  >;

  export type LayerChartInternalMeta = {
    /**
     * The current chart type.
     * The default is `'default'` which is any chart being composed
     * that isn't a "simplified chart".
     */
    type:
      | 'default'
      | 'simplified-area'
      | 'simplified-bar'
      | 'simplified-line'
      | 'simplified-pie'
      | 'simplified-scatter';
  };

  export type ChartPropsWithoutHTML<
    T,
    XScale extends AnyScale = AnyScale,
    YScale extends AnyScale = AnyScale,
  > = {
    /**
     * Whether this chart should be rendered server side
     *
     * @default false
     */
    ssr?: boolean;

    /**
     * Whether to allow pointer events via CSS.
     * Set this to `false` to set `pointer-events: none;` on all components, disabling
     * all mouse interactions.
     *
     * @default true
     */
    pointerEvents?: boolean;

    /**
     * Determine the positioning of the wrapper div.
     * Set this to `'absolute'` when you want to stack layers.
     *
     * @default 'relative'
     */
    position?: string;

    /**
     * If `true`, set all scale ranges to `[0, 100]`.
     * Ranges reversed via `xReverse`, `yReverse`, or `rReverse` props will
     * continue to be reversed as usual.
     * @default false
     */
    percentRange?: boolean;

    /**
     * A bindable reference to the root container element.
     */
    ref?: HTMLElement;

    /**
     * If `data` is not a flat array of objects and you want to use any of the scales, set a flat
     * version of the data via the `flatData` prop.
     */
    data?: T[] | readonly T[] | HierarchyNode<T> | SankeyGraph<any, any>;

    /**
     * A flat version of data.
     */
    flatData?: T[] | readonly T[] | HierarchyNode<T> | SankeyGraph<any, any>;

    /**
     * The x accessor. The key in each row of data that corresponds to the x-field. This can be a
     * string, an accessor function, a number or an array of any combination of those types. This
     * property gets converted to a function when you access it through the context.
     */
    x?: Accessor<T>;

    /**
     * The y accessor. The key in each row of data that corresponds to the y-field. This can be a
     * string, an accessor function, a number or an array of any combination of those types. This
     * property gets converted to a function when you access it through the context.
     */
    y?: Accessor<T>;

    /**
     * The z accessor. The key in each row of data that corresponds to the z-field. This can be a
     * string, an accessor function, a number or an array of any combination of those types. This
     * property gets converted to a function when you access it through the context.
     */
    z?: Accessor<T>;

    /**
     * The r accessor. The key in each row of data that corresponds to the r-field. This can be a
     * string, an accessor function, a number or an array of any combination of those types. This
     * property gets converted to a function when you access it through the context.
     */
    r?: Accessor<T>;

    /**
     * The x1 accessor. The key in each row of data that corresponds to the x1-field. This can be a
     * string, an accessor function, a number or an array of any combination of those types. This
     * property gets converted to a function when you access it through the context.
     */
    x1?: Accessor<T>;

    /**
     * The y1 accessor. The key in each row of data that corresponds to the y1-field. This can be
     * a string, an accessor function, a number or an array of any combination of those types. This
     * property gets converted to a function when you access it through the context.
     */
    y1?: Accessor<T>;

    /**
     * The c (color) accessor. The key in each row of data that corresponds to the color. This can
     * be a string or an accessor function. This property gets converted to a function when you
     * access it through the context.
     */
    c?: Accessor<T>;

    /**
     * Set a min or max. For linear scales, if you want to inherit the value from the data's
     * extent, set that value to `null`. This value can also be an array because sometimes your
     * scales are [piecewise](https://github.com/d3/d3-scale#continuous_domain) or are a list of
     * discrete values such as in [ordinal scales](https://github.com/d3/d3-scale#ordinal-scales),
     * useful for color series. Set it to a function that receives the computed domain and lets you
     * return a modified domain, useful for sorting values.
     */
    xDomain?: DomainType;

    /**
     * Set a min or max. For linear scales, if you want to inherit the value from the data's
     * extent, set that value to `null`. This value can also be an array because sometimes your
     * scales are [piecewise](https://github.com/d3/d3-scale#continuous_domain) or are a list of
     * discrete values such as in [ordinal scales](https://github.com/d3/d3-scale#ordinal-scales),
     * useful for color series. Set it to a function that receives the computed domain and lets you
     * return a modified domain, useful for sorting values.
     */
    yDomain?: DomainType;

    /**
     * Set a min or max. For linear scales, if you want to inherit the value from the data's
     * extent, set that value to `null`. This value can also be an array because sometimes your
     * scales are [piecewise](https://github.com/d3/d3-scale#continuous_domain) or are a list of
     * discrete values such as in [ordinal scales](https://github.com/d3/d3-scale#ordinal-scales),
     * useful for color series. Set it to a function that receives the computed domain and lets you
     * return a modified domain, useful for sorting values.
     */
    zDomain?: DomainType;

    /**
     * Set a min or max. For linear scales, if you want to inherit the value from the data's
     * extent, set that value to `null`. This value can also be an array because sometimes your
     * scales are [piecewise](https://github.com/d3/d3-scale#continuous_domain) or are a list of
     * discrete values such as in [ordinal scales](https://github.com/d3/d3-scale#ordinal-scales),
     * useful for color series. Set it to a function that receives the computed domain and lets you
     * return a modified domain, useful for sorting values.
     */
    rDomain?: DomainType;

    /**
     * Set a min or max. For linear scales, if you want to inherit the value from the data's
     * extent, set that value to `null`. This value can also be an array because sometimes your
     * scales are [piecewise](https://github.com/d3/d3-scale#continuous_domain) or are a list of
     * discrete values such as in [ordinal scales](https://github.com/d3/d3-scale#ordinal-scales),
     * useful for color series. Set it to a function that receives the computed domain and lets you
     * return a modified domain, useful for sorting values.
     */
    x1Domain?: DomainType;

    /**
     * Set a min or max. For linear scales, if you want to inherit the value from the data's
     * extent, set that value to `null`. This value can also be an array because sometimes your
     * scales are [piecewise](https://github.com/d3/d3-scale#continuous_domain) or are a list of
     * discrete values such as in [ordinal scales](https://github.com/d3/d3-scale#ordinal-scales),
     * useful for color series. Set it to a function that receives the computed domain and lets you
     * return a modified domain, useful for sorting values.
     */
    y1Domain?: DomainType;

    /**
     * Set the list of color values.
     */
    cDomain?: DomainType;

    /**
     * Applies D3's [scale.nice()](https://github.com/d3/d3-scale#continuous_nice) to the x domain.
     * @default false
     */
    xNice?: Nice;

    /**
     * Applies D3's [scale.nice()](https://github.com/d3/d3-scale#continuous_nice) to the y domain.
     * @default false
     */
    yNice?: Nice;

    /**
     * Applies D3's [scale.nice()](https://github.com/d3/d3-scale#continuous_nice) to the z domain.
     * @default false
     */
    zNice?: Nice;

    /**
     * Applies D3's [scale.nice()](https://github.com/d3/d3-scale#continuous_nice) to the r domain.
     * @default false
     */
    rNice?: Nice;

    /**
     * Assign a pixel value to add to the min or max of the scale. This will increase the scales
     * domain by the scale unit equivalent of the provided pixels.
     */
    xPadding?: PaddingArray;
    /**
     * Assign a pixel value to add to the min or max of the scale. This will increase the scales
     * domain by the scale unit equivalent of the provided pixels.
     */
    yPadding?: PaddingArray;
    /**
     * Assign a pixel value to add to the min or max of the scale. This will increase the scales
     * domain by the scale unit equivalent of the provided pixels.
     */
    zPadding?: PaddingArray;
    /**
     * Assign a pixel value to add to the min or max of the scale. This will increase the scales
     * domain by the scale unit equivalent of the provided pixels.
     */
    rPadding?: PaddingArray;

    /**
     * The D3 scale that should be used for the x-dimension. Pass in an instantiated D3 scale if
     * you want to override the default or you want to extra options.
     * @default autoScale
     */
    xScale?: XScale;

    /**
     * The D3 scale that should be used for the x-dimension. Pass in an instantiated D3 scale if
     * you want to override the default or you want to extra options.
     * @default autoScale
     */
    yScale?: YScale;

    /**
     * The D3 scale that should be used for the x-dimension. Pass in an instantiated D3 scale if
     * you want to override the default or you want to extra options.
     * @default autoScale
     */
    zScale?: AnyScale;

    /**
     * The D3 scale that should be used for the x-dimension. Pass in an instantiated D3 scale if
     * you want to override the default or you want to extra options.
     * @default scaleSqrt
     */
    rScale?: AnyScale;

    /**
     * The D3 scale that should be used for the x1-dimension. Pass in an instantiated D3 scale if
     * you want to override the default or you want to extra options.
     * @default autoScale
     */
    x1Scale?: AnyScale;

    /**
     * The D3 scale that should be used for the y1-dimension. Pass in an instantiated D3 scale if
     * you want to override the default or you want to extra options.
     * @default autoScale
     */
    y1Scale?: AnyScale;

    /**
     * The D3 scale that should be used for the  color dimension. Pass in an instantiated D3 scale
     * if you want to override the default or you want to extra options.
     * @default scaleOrdinal
     */
    cScale?: AnyScale;

    /** Override the default x range of `[0, width]` by setting an array or function with argument
     * `({ width, height})` that returns an array. Setting this prop overrides `xReverse`. This can
     * also be a list of numbers or strings for scales with discrete ranges like
     * [scaleThreshold](https://github.com/d3/d3-scale#threshold-scales) or
     * [scaleQuantize](https://github.com/d3/d3-scale#quantize-scales).
     */
    xRange?: BaseRange;

    /**
     * Override the default y range of `[0, height]` by setting an array or function with argument
     * `({ width, height})` that returns an array. Setting this prop overrides `yReverse`. This can
     * also be a list of numbers or strings for scales with discrete ranges like
     * [scaleThreshold](https://github.com/d3/d3-scale#threshold-scales) or
     * [scaleQuantize](https://github.com/d3/d3-scale#quantize-scales).
     */
    yRange?: BaseRange;

    /** Override the default z range of `[0, width]` by setting an array or function with argument
     * `({ width, height})` that returns an array. Setting this prop overrides `zReverse`. This can
     * also be a list of numbers or strings for scales with discrete ranges like
     * [scaleThreshold](https://github.com/d3/d3-scale#threshold-scales) or
     * [scaleQuantize](https://github.com/d3/d3-scale#quantize-scales).
     */
    zRange?: BaseRange;

    /** Override the default r range of `[1, 25]` by setting an array or function with argument
     * `({ width, height})` that returns an array. Setting this prop overrides `rReverse`. This can
     * also be a list of numbers or strings for scales with discrete ranges like
     * [scaleThreshold](https://github.com/d3/d3-scale#threshold-scales) or
     * [scaleQuantize](https://github.com/d3/d3-scale#quantize-scales).
     */
    rRange?: BaseRange;

    /**
     * Set the x1 range by setting an array or function with argument `({ xScale, width, height})`
     * that returns an array. This can also be a list of numbers or strings for scales with
     * discrete ranges like [scaleThreshold](https://github.com/d3/d3-scale#threshold-scales) or
     * [scaleQuantize](https://github.com/d3/d3-scale#quantize-scales).
     */
    x1Range?: XRangeWithScale<XScale>;

    /**
     * Set the y1 range by setting an array or function with argument `({ yScale, width, height})`
     * that returns an array. This can also be a list of numbers or strings for scales with
     * discrete ranges like [scaleThreshold](https://github.com/d3/d3-scale#threshold-scales) or
     * [scaleQuantize](https://github.com/d3/d3-scale#quantize-scales).
     */
    y1Range?: YRangeWithScale<YScale>;

    /**
     * Override the default y1 range of `[0, width]` by setting an array or function with argument
     * `({ yScale, width, height})` that returns an array. Setting this prop overrides `x1Reverse`.
     * This can also be a list of numbers or strings for scales with discrete ranges like
     * [scaleThreshold](https://github.com/d3/d3-scale#threshold-scales) or
     * [scaleQuantize](https://github.com/d3/d3-scale#quantize-scales).
     */
    cRange?: string[] | readonly string[];

    /**
     * Reverse the default x range. By default this is `false` and the range is `[0, width]`.
     * Ignored if you set the xRange prop.
     * @default false
     */
    xReverse?: boolean;

    /**
     * Reverse the default y range. By default this is `true` and the range is `[height, 0]` unless
     * using an ordinal scale with a `.bandwidth` method for `yScale`.
     * Ignored if you set the `yRange` prop.
     * @default true
     */
    yReverse?: boolean;

    /**
     * Reverse the default z range. By default this is `false` and the range is `[0, width]`.
     * Ignored if you set the zRange prop.
     * @default false
     */
    zReverse?: boolean;

    /**
     * Reverse the default r range. By default this is `false` and the range is `[1, 25]`.
     * Ignored if you set the rRange prop.
     * @default false
     */
    rReverse?: boolean;

    /**
     * ***Only used when scale is ordinal.***
     * Set whether the calculated unique items come back sorted.
     *
     * @default false
     */
    xDomainSort?: boolean;

    /**
     * ***Only used when scale is ordinal.***
     * Set whether the calculated unique items come back sorted.
     *
     * @default false
     */
    yDomainSort?: boolean;

    /**
     * ***Only used when scale is ordinal.***
     * Set whether the calculated unique items come back sorted.
     *
     * @default false
     */
    zDomainSort?: boolean;

    /**
     * ***Only used when scale is ordinal.***
     * Set whether the calculated unique items come back sorted.
     *
     * @default false
     */
    rDomainSort?: boolean;

    /**
     * The amount of padding to put around your chart. It operates like CSS
     * box-sizing: border-box; where values are subtracted from the parent container's width
     * and height, the same as a [D3 margin convention](https://bl.ocks.org/mbostock/3019563).
     *
     * If a number is passed, it will be applied to all sides.
     */
    padding?: { top?: number; right?: number; bottom?: number; left?: number } | number;

    /**
     * Manually set the extents of the x, y or r scale as a two-dimensional array of the min and
     * max you want. Setting values here will skip any dynamic extent calculation of the data for
     * that dimension.
     */
    extents?: {
      x?: [min: number, max: number];
      y?: [min: number, max: number];
      r?: [min: number, max: number];
      z?: [min: number, max: number];
    };

    /**
     * Any extra configuration values you want available on the Chart context.
     * This could be useful for color lookups or additional constants.
     */
    meta?: Record<string, any>;

    /**
     * Enable debug printing to the console.
     * Useful to inspect your scales and dimensions.
     *
     * @default false
     */
    debug?: boolean;

    /**
     * Show warnings in the console.
     *
     * @default true
     */
    verbose?: boolean;

    /**
     * x value guaranteed to be visible in xDomain.  Useful with optional negative values since
     * `xDomain={[0, null]}` would ignore negative values
     *
     * @default null
     */
    xBaseline?: number | null;

    /**
     * y value guaranteed to be visible in yDomain.  Useful with optional negative values since
     * `yDomain={[0, null]}` would ignore negative values
     *
     * @default null
     */
    yBaseline?: number | null;

    /**
     * Time interval to use for the x-axis when using a time scale.
     */
    xInterval?: TimeInterval | null;

    /**
     * Time interval to use for the y-axis when using a time scale.
     */
    yInterval?: TimeInterval | null;

    /* Props passed to ChartContext */

    /**
     * Use radial instead of cartesian coordinates, mapping `x` to `angle` and `y`` to radial.
     * Radial lines are positioned relative to the origin, use transform (ex. `<Group center>`)
     * to change the origin
     *
     * @default false
     */
    radial?: boolean;

    children?: Snippet<[{ context: ChartState<T, XScale, YScale> }]>;

    /**
     * A bindable reference to the chart context.
     */
    context?: ChartState<T, XScale, YScale>;

    /**
     * Props passed to GeoContext
     */
    geo?: Partial<ComponentProps<typeof GeoContext>>;

    /**
     * Props passed to the `TooltipContext` component.
     */
    tooltip?: Partial<ComponentProps<typeof TooltipContext>> | boolean;

    /**
     * Props passed to TransformContext
     */
    transform?: Partial<ComponentProps<typeof TransformContext>>;

    /** Props passed to BrushContext */
    brush?: Partial<ComponentProps<typeof BrushContext>> | boolean;

    /**
     * A callback function that is called when the chart is resized.
     */
    onResize?: (e: ChartResizeDetail) => void;

    // TransformContext callback events
    ondragstart?: ComponentProps<typeof TransformContext>['ondragstart'];
    ondragend?: ComponentProps<typeof TransformContext>['ondragend'];
    onTransform?: ComponentProps<typeof TransformContext>['onTransform'];

    /** Sets width of the chart container.  Uses parent width if not set (bind:clientWidth) */
    width?: number;

    /** Sets height of the chart container.  Uses parent height if not set (bind:clientHeight) */
    height?: number;
  };

  export type ChartProps<
    T,
    XScale extends AnyScale = AnyScale,
    YScale extends AnyScale = AnyScale,
  > = ChartPropsWithoutHTML<T, XScale, YScale> &
    Without<HTMLAttributes<HTMLDivElement>, ChartPropsWithoutHTML<T, XScale, YScale>>;
</script>

<script
  lang="ts"
  generics="TData = any, XScale extends AnyScale = AnyScale, YScale extends AnyScale = AnyScale"
>
  let {
    ref: refProp = $bindable(),
    context: contextProp = $bindable(),
    ...props
  }: ChartPropsWithoutHTML<TData, XScale, YScale> &
    Omit<HTMLAttributes<HTMLDivElement>, 'children'> = $props();

  let {
    ssr = false,
    pointerEvents = true,
    width,
    height,
    position = 'relative',
    children,
    geo,
    tooltip,
    transform,
    onTransform,
    ondragend,
    ondragstart,
    brush,
    class: className,
  } = $derived(props);

  const chartState = new ChartState<TData, XScale, YScale>(() => ({
    ref: refProp,
    context: contextProp,
    ...props,
  }));

  let ref = $state<HTMLElement>();
  $effect.pre(() => {
    refProp = ref;
    chartState.containerRef = ref;
  });

  // Update bindable
  contextProp = chartState;

  setChartContext(chartState);

  const initialTransform = $derived(
    geo?.applyTransform?.includes('translate') && geo?.fitGeojson && geo?.projection
      ? geoFitObjectTransform(
          geo.projection(),
          [chartState.width, chartState.height],
          geo.fitGeojson
        )
      : undefined
  );

  const processTranslate = $derived.by(() => {
    if (!geo) return undefined;
    return (x: number, y: number, deltaX: number, deltaY: number) => {
      if (geo.applyTransform?.includes('rotate') && chartState.geoContext?.projection) {
        // When applying transform to rotate, invert `y` values and reduce sensitivity based on projection scale
        // see: https://observablehq.com/@benoldenburg/simple-globe and https://observablehq.com/@michael-keith/draggable-globe-in-d3
        const projectionScale = chartState.geoContext.projection.scale() ?? 0;
        const sensitivity = 75;
        return {
          x: x + deltaX * (sensitivity / projectionScale),
          y: y + deltaY * (sensitivity / projectionScale) * -1,
        };
      } else {
        // Apply default TransformContext.processTransform (passing `undefined` below appears to not work when checking for `geo?.applyTransform` exists)
        return { x: x + deltaX, y: y + deltaY };
      }
    };
  });

  const brushProps = $derived(typeof brush === 'object' ? brush : { disabled: !brush });
  const tooltipProps = $derived(typeof tooltip === 'object' ? tooltip : {});
</script>

{#if ssr === true || typeof window !== 'undefined'}
  <div
    bind:this={ref}
    style:position
    style:top={position === 'absolute' ? 0 : null}
    style:right={position === 'absolute' ? 0 : null}
    style:bottom={position === 'absolute' ? 0 : null}
    style:left={position === 'absolute' ? 0 : null}
    style:pointer-events={pointerEvents === false ? 'none' : null}
    style:width={width ? `${width}px` : '100%'}
    style:height={height ? `${height}px` : '100%'}
    bind:clientWidth={chartState._containerWidth}
    bind:clientHeight={chartState._containerHeight}
    class={['lc-root-container', className]}
  >
    {#key chartState.isMounted}
      <!-- svelte-ignore ownership_invalid_binding -->
      <TransformContext
        bind:transformContext={chartState.transformContext}
        mode={(transform?.mode ?? geo?.applyTransform?.length) ? 'manual' : 'none'}
        initialTranslate={initialTransform?.translate}
        initialScale={initialTransform?.scale}
        {processTranslate}
        {...transform}
        {ondragstart}
        {onTransform}
        {ondragend}
      >
        <!-- svelte-ignore ownership_invalid_binding -->
        <GeoContext {...geo} bind:geoContext={chartState.geoContext}>
          <!-- svelte-ignore ownership_invalid_binding -->
          <BrushContext {...brushProps} bind:brushContext={chartState.brushContext}>
            <!-- svelte-ignore ownership_invalid_binding -->
            <TooltipContext {...tooltipProps} bind:tooltipContext={chartState.tooltipContext}>
              {@render children?.({
                context: chartState,
              })}
            </TooltipContext>
          </BrushContext>
        </GeoContext>
      </TransformContext>
    {/key}
  </div>
{/if}

<style>
  .lc-root-container,
  .lc-root-container :global(*) {
    box-sizing: border-box;
  }
</style>
