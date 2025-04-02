<script lang="ts" module>
  // this is the LayerCake replacement component
  import { scaleLinear, scaleOrdinal, scaleSqrt } from 'd3-scale';
  import { type Accessor, accessor, chartDataArray } from '$lib/utils/common.js';
  import { printDebug } from '$lib/utils/debug.js';
  import { filterObject } from '$lib/utils/filterObject.js';
  import {
    createScale,
    getRange,
    isScaleBand,
    makeAccessor,
    type AnyScale,
    type DomainType,
  } from '$lib/utils/scales.svelte.js';
  import { Context, useDebounce } from 'runed';
  import type {
    AxisKey,
    BaseRange,
    DataType,
    Extents,
    Nice,
    Padding,
    PaddingArray,
    XRangeWithScale,
    YRangeWithScale,
  } from '$lib/utils/types.js';
  import {
    calcDomain,
    calcScaleExtents,
    createGetter,
    createLayerCakeScale,
  } from '$lib/utils/chart.js';
  import { onMount, type ComponentProps, type Snippet } from 'svelte';
  import GeoContext, { type GeoContextValue } from './GeoContext.svelte';
  import TooltipContext, { type TooltipContextValue } from './tooltip/TooltipContext.svelte';
  import { extent, max, min } from 'd3-array';
  import type { HierarchyNode } from 'd3-hierarchy';
  import type { SankeyGraph } from 'd3-sankey';
  import { unique } from '@layerstack/utils';
  import { geoFitObjectTransform } from '$lib/utils/geo.js';
  import TransformContext, { type TransformContextValue } from './TransformContext.svelte';
  import BrushContext, { type BrushContextValue } from './BrushContext.svelte';
  import { layerClass } from '$lib/utils/attributes.js';

  const defaultPadding = { top: 0, right: 0, bottom: 0, left: 0 };

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

  export type ChartContextValue<
    T = any,
    XScale extends AnyScale = AnyScale,
    YScale extends AnyScale = AnyScale,
  > = {
    activeGetters: Record<AxisKey, (d: T) => any>;
    width: number;
    height: number;
    percentRange: boolean;
    aspectRatio: number;
    containerRef: HTMLElement | undefined;
    containerWidth: number;
    containerHeight: number;
    config: PreservedChartConfig<T, XScale, YScale>;
    x: (d: T) => any;
    y: (d: T) => any;
    z: (d: T) => any;
    r: (d: T) => any;
    x1: (d: T) => any;
    y1: (d: T) => any;
    c: (d: T) => any;
    data: DataType<T>;
    xNice: Nice;
    yNice: Nice;
    zNice: Nice;
    rNice: Nice;
    xDomainSort: boolean;
    yDomainSort: boolean;
    zDomainSort: boolean;
    rDomainSort: boolean;
    xReverse: boolean;
    yReverse: boolean;
    zReverse: boolean;
    rReverse: boolean;
    xPadding: PaddingArray;
    yPadding: PaddingArray;
    zPadding: PaddingArray;
    rPadding: PaddingArray;
    padding: Padding;
    flatData: T[];
    extents: Extents;
    xDomain: number[];
    yDomain: number[];
    zDomain: DomainType;
    rDomain: DomainType;
    cDomain: DomainType;
    x1Domain: DomainType;
    y1Domain: DomainType;
    xRange: any[];
    yRange: any[];
    zRange: any[];
    rRange: any[];
    cRange: readonly string[] | string[] | undefined;
    x1Range: XRangeWithScale<XScale> | undefined;
    y1Range: YRangeWithScale<YScale> | undefined;
    meta: Record<string, any>;
    xScale: AnyScale;
    yScale: AnyScale;
    zScale: AnyScale;
    rScale: AnyScale;
    cScale: AnyScale | null;
    x1Scale: AnyScale | null;
    y1Scale: AnyScale | null;
    yGet: (d: T) => any;
    xGet: (d: T) => any;
    zGet: (d: T) => any;
    rGet: (d: T) => any;
    cGet: (d: T) => any;
    x1Get: (d: T) => any;
    y1Get: (d: T) => any;
    radial: boolean;
    tooltip: TooltipContextValue<T>;
    geo: GeoContextValue;
    brush: BrushContextValue;
    transform: TransformContextValue;
  };

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

  const _ChartContext = new Context<ChartContextValue<any, AnyScale, AnyScale>>('ChartContext');

  export function getChartContext<
    T,
    XScale extends AnyScale = AnyScale,
    YScale extends AnyScale = AnyScale,
  >(): ChartContextValue<T, XScale, YScale> {
    return _ChartContext.getOr({} as ChartContextValue<T, XScale, YScale>);
  }

  export function setChartContext<
    T,
    XScale extends AnyScale = AnyScale,
    YScale extends AnyScale = AnyScale,
  >(context: ChartContextValue<T, XScale, YScale>): ChartContextValue<T, XScale, YScale> {
    // @ts-expect-error - shh
    return _ChartContext.set(context);
  }

  export type RenderContext = 'svg' | 'canvas' | 'html';

  const _RenderContext = new Context<RenderContext>('RenderContext');

  export function getRenderContext(): RenderContext {
    return _RenderContext.get();
  }

  export function setRenderContext(context: RenderContext): RenderContext {
    return _RenderContext.set(context);
  }

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
     * Set this to `'absolute'` when you want to stack cakes.
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
     * @default scaleLinear
     */
    xScale?: XScale;

    /**
     * The D3 scale that should be used for the x-dimension. Pass in an instantiated D3 scale if
     * you want to override the default or you want to extra options.
     * @default scaleLinear
     */
    yScale?: YScale;

    /**
     * The D3 scale that should be used for the x-dimension. Pass in an instantiated D3 scale if
     * you want to override the default or you want to extra options.
     * @default scaleLinear
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
     * @default scaleLinear
     */
    x1Scale?: AnyScale;

    /**
     * The D3 scale that should be used for the y1-dimension. Pass in an instantiated D3 scale if
     * you want to override the default or you want to extra options.
     * @default scaleLinear
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

    /* Props passed to ChartContext */

    /**
     * Use radial instead of cartesian coordinates, mapping `x` to `angle` and `y`` to radial.
     * Radial lines are positioned relative to the origin, use transform (ex. `<Group center>`)
     * to change the origin
     *
     * @default false
     */
    radial?: boolean;

    children?: Snippet<[{ context: ChartContextValue<T, XScale, YScale> }]>;

    /**
     * A bindable reference to the chart context.
     */
    context?: ChartContextValue<T, XScale, YScale>;

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
  };
</script>

<script
  lang="ts"
  generics="TData = any, XScale extends AnyScale = AnyScale, YScale extends AnyScale = AnyScale"
>
  let {
    ssr = false,
    pointerEvents = true,
    position = 'relative',
    percentRange = false,
    ref = $bindable(),
    x: xProp,
    y: yProp,
    z: zProp,
    r: rProp,
    data = [],
    xDomain: xDomainProp,
    yDomain: yDomainProp,
    zDomain: zDomainProp,
    rDomain: rDomainProp,
    xNice = false,
    yNice = false,
    zNice = false,
    rNice = false,
    xPadding,
    yPadding,
    zPadding,
    rPadding,
    // @ts-expect-error shh
    xScale: xScaleProp = scaleLinear(),
    // @ts-expect-error shh
    yScale: yScaleProp = scaleLinear(),
    zScale: zScaleProp = scaleLinear(),
    rScale: rScaleProp = scaleSqrt(),
    flatData: flatDataProp,
    padding: paddingProp = {},
    verbose = true,
    debug = false,
    extents: extentsProp = {},
    xDomainSort = false,
    yDomainSort = false,
    zDomainSort = false,
    rDomainSort = false,
    xReverse = false,
    zReverse = false,
    rReverse = false,
    yRange: _yRangeProp,
    zRange: zRangeProp,
    rRange: rRangeProp,
    xBaseline = null,
    yBaseline = null,
    meta = {},
    children: _children,
    radial = false,
    xRange: _xRangeProp,
    x1: x1Prop,
    x1Domain: x1DomainProp,
    x1Range: x1RangeProp,
    x1Scale: x1ScaleProp,
    y1: y1Prop,
    y1Domain: y1DomainProp,
    y1Range: y1RangeProp,
    y1Scale: y1ScaleProp,
    c: cProp,
    cScale: cScaleProp,
    cDomain: cDomainProp,
    cRange: cRangeProp,
    onResize,
    geo,
    context: contextProp = $bindable(),
    tooltip,
    transform,
    onTransform,
    ondragend,
    ondragstart,
    brush,
  }: ChartPropsWithoutHTML<TData, XScale, YScale> = $props();

  const xRangeProp = $derived(_xRangeProp ? _xRangeProp : radial ? [0, 2 * Math.PI] : undefined);

  let containerWidth = $state(100);
  let containerHeight = $state(100);

  const logDebug = useDebounce(printDebug, 200);

  const _xDomain: DomainType | undefined = $derived.by(() => {
    if (xDomainProp !== undefined) return xDomainProp;
    if (xBaseline != null && Array.isArray(data)) {
      const xValues = data.flatMap(accessor(xProp));
      return [min([xBaseline, ...xValues]), max([xBaseline, ...xValues])];
    }
  });

  const _yDomain: DomainType | undefined = $derived.by(() => {
    if (yDomainProp !== undefined) return yDomainProp;
    if (yBaseline != null && Array.isArray(data)) {
      const yValues = data.flatMap(accessor(yProp));
      return [min([yBaseline, ...yValues]), max([yBaseline, ...yValues])];
    }
  });

  const yRangeProp = $derived(
    _yRangeProp ?? (radial ? ({ height }: { height: number }) => [0, height / 2] : undefined)
  );

  const yReverse = $derived(yScaleProp ? !isScaleBand(yScaleProp) : true);

  const x = $derived(makeAccessor(xProp));
  const y = $derived(makeAccessor(yProp));
  const z = $derived(makeAccessor(zProp));
  const r = $derived(makeAccessor(rProp));
  const c = $derived(accessor(cProp));
  const x1 = $derived(accessor(x1Prop));
  const y1 = $derived(accessor(y1Prop));

  const flatData = $derived(flatDataProp ?? data) as TData[];

  const filteredExtents = $derived(filterObject($state.snapshot(extentsProp)));

  const activeGetters = $derived({
    x,
    y,
    z,
    r,
  });

  const padding = $derived.by(() => {
    if (typeof paddingProp === 'number') {
      return {
        ...defaultPadding,
        top: paddingProp,
        right: paddingProp,
        bottom: paddingProp,
        left: paddingProp,
      };
    }
    return { ...defaultPadding, ...paddingProp };
  });

  let isMounted = $state(false);

  const box = $derived.by(() => {
    const top = padding.top;
    const right = containerWidth - padding.right;
    const bottom = containerHeight - padding.bottom;
    const left = padding.left;
    const width = right - left;
    const height = bottom - top;
    if (verbose === true) {
      if (width <= 0 && isMounted === true) {
        console.warn(
          '[LayerChart] Target div has zero or negative width. Did you forget to set an explicit width in CSS on the container?'
        );
      }
      if (height <= 0 && isMounted === true) {
        console.warn(
          '[LayerChart] Target div has zero or negative height. Did you forget to set an explicit height in CSS on the container?'
        );
      }
    }

    return {
      top,
      left,
      bottom,
      right,
      width,
      height,
    };
  });

  const width = $derived(box.width);
  const height = $derived(box.height);

  interface ScaleEntry {
    scale: AnyScale;
    sort?: boolean;
  }

  /* --------------------------------------------
   * Calculate extents by taking the extent of the data
   * and filling that in with anything set by the user
   * Note that this is different from an "extent" passed
   * in as a domain, which can be a partial domain
   */
  const extents: Extents = $derived.by(() => {
    const scaleLookup: Record<string, ScaleEntry> = {
      x: { scale: xScaleProp, sort: xDomainSort },
      y: { scale: yScaleProp, sort: yDomainSort },
      z: { scale: zScaleProp, sort: zDomainSort },
      r: { scale: rScaleProp, sort: rDomainSort },
    };

    const getters = filterObject(activeGetters, filteredExtents);
    const activeScales: Record<string, ScaleEntry> = Object.fromEntries(
      Object.keys(getters).map((k) => [k, scaleLookup[k]])
    );

    if (Object.keys(getters).length > 0) {
      const calculatedExtents = calcScaleExtents(flatData, getters, activeScales);
      return { ...calculatedExtents, ...filteredExtents };
    } else {
      return {};
    }
  });

  const xDomain = $derived(calcDomain('x', extents, _xDomain));
  const yDomain = $derived(calcDomain('y', extents, _yDomain));
  const zDomain = $derived(calcDomain('z', extents, zDomainProp));
  const rDomain = $derived(calcDomain('r', extents, rDomainProp));

  const x1Domain = $derived(x1DomainProp ?? extent(chartDataArray(data), x1));
  const y1Domain = $derived(y1DomainProp ?? extent(chartDataArray(data), y1));
  const cDomain = $derived(cDomainProp ?? unique(chartDataArray(data).map(c)));

  const snappedPadding = $derived($state.snapshot(xPadding));
  const snappedExtents = $derived($state.snapshot(extents));

  const xScale = $derived(
    createLayerCakeScale('x', {
      scale: xScaleProp,
      domain: xDomain,
      padding: snappedPadding,
      nice: xNice,
      reverse: xReverse,
      percentRange,
      range: xRangeProp,
      height,
      width,
      extents: snappedExtents,
    })
  );

  const xGet = $derived(createGetter(x, xScale));

  const yScale = $derived(
    createLayerCakeScale('y', {
      scale: yScaleProp,
      domain: yDomain,
      padding: yPadding,
      nice: yNice,
      reverse: yReverse,
      percentRange,
      range: yRangeProp,
      height,
      width,
      extents: filteredExtents,
    })
  );

  const yGet = $derived(createGetter(y, yScale));

  const zScale = $derived(
    createLayerCakeScale('z', {
      scale: zScaleProp,
      domain: zDomain,
      padding: zPadding,
      nice: zNice,
      reverse: zReverse,
      percentRange,
      range: zRangeProp,
      height,
      width,
      extents: filteredExtents,
    })
  );
  const zGet = $derived(createGetter(z, zScale));

  const rScale = $derived(
    createLayerCakeScale('r', {
      scale: rScaleProp,
      domain: rDomain,
      padding: rPadding,
      nice: rNice,
      reverse: rReverse,
      percentRange,
      range: rRangeProp,
      height,
      width,
      extents: filteredExtents,
    })
  );

  const rGet = $derived(createGetter(r, rScale));

  const x1Scale = $derived(
    x1ScaleProp && x1RangeProp
      ? createScale(x1ScaleProp, x1Domain, x1RangeProp, {
          xScale: xScale,
          width,
          height,
        })
      : null
  );

  const x1Get = $derived(createGetter(x1, x1Scale));

  const y1Scale = $derived(
    y1ScaleProp && y1RangeProp
      ? createScale(y1ScaleProp, y1Domain, y1RangeProp, {
          yScale: yScale,
          width,
          height,
        })
      : null
  );

  const y1Get = $derived(createGetter(y1, y1Scale));

  const cScale = $derived(
    cRangeProp
      ? createScale(cScaleProp ?? scaleOrdinal(), cDomain, cRangeProp, { width, height })
      : null
  );

  const cGet = $derived((d: any) => cScale?.(c(d)));

  const xDomainPossiblyNice = $derived(xScale.domain());
  const yDomainPossiblyNice = $derived(yScale.domain());
  const zDomainPossiblyNice = $derived(zScale.domain());
  const rDomainPossiblyNice = $derived(rScale.domain());

  const xRange = $derived(getRange(xScale));
  const yRange = $derived(getRange(yScale));
  const zRange = $derived(getRange(zScale));
  const rRange = $derived(getRange(rScale));

  const aspectRatio = $derived(width / height);

  const config: PreservedChartConfig<TData, XScale, YScale> = $derived({
    x: xProp,
    y: yProp,
    z: zProp,
    r: rProp,
    c: cProp,
    x1: x1Prop,
    y1: y1Prop,
    xDomain: _xDomain,
    yDomain: _yDomain,
    zDomain: zDomainProp,
    rDomain: rDomainProp,
    x1Domain: x1DomainProp,
    y1Domain: y1DomainProp,
    cDomain: cDomainProp,
    xRange: _xRangeProp,
    yRange: _yRangeProp,
    zRange: zRangeProp,
    rRange: rRangeProp,
    cRange: cRangeProp,
    x1Range: x1RangeProp,
    y1Range: y1RangeProp,
  });

  let geoContext = $state<GeoContextValue>(null!);
  let transformContext = $state<TransformContextValue>(null!);
  let tooltipContext = $state<TooltipContextValue>(null!);
  let brushContext = $state<BrushContextValue>(null!);

  const context: ChartContextValue<TData, XScale, YScale> = {
    get activeGetters() {
      return activeGetters;
    },
    get config() {
      return config;
    },
    get width() {
      return width;
    },
    get height() {
      return height;
    },
    get percentRange() {
      return percentRange;
    },
    get aspectRatio() {
      return aspectRatio;
    },
    get containerWidth() {
      return containerWidth;
    },
    get containerHeight() {
      return containerHeight;
    },
    get x() {
      return x;
    },
    get y() {
      return y;
    },
    get z() {
      return z;
    },
    get r() {
      return r;
    },
    get c() {
      return c;
    },
    get x1() {
      return x1;
    },
    get y1() {
      return y1;
    },
    get data() {
      return data;
    },
    get xNice() {
      return xNice;
    },
    get yNice() {
      return yNice;
    },
    get zNice() {
      return zNice;
    },
    get rNice() {
      return rNice;
    },
    get xDomainSort() {
      return xDomainSort;
    },
    get yDomainSort() {
      return yDomainSort;
    },
    get zDomainSort() {
      return zDomainSort;
    },
    get rDomainSort() {
      return rDomainSort;
    },
    get xReverse() {
      return xReverse;
    },
    get yReverse() {
      return yReverse;
    },
    get zReverse() {
      return zReverse;
    },
    get rReverse() {
      return rReverse;
    },
    get xPadding() {
      return xPadding;
    },
    get yPadding() {
      return yPadding;
    },
    get zPadding() {
      return zPadding;
    },
    get rPadding() {
      return rPadding;
    },
    get padding() {
      return padding;
    },
    get flatData() {
      return flatData;
    },
    get extents() {
      return extents;
    },
    get xDomain() {
      return xDomainPossiblyNice;
    },
    get yDomain() {
      return yDomainPossiblyNice;
    },
    get zDomain() {
      return zDomainPossiblyNice;
    },
    get rDomain() {
      return rDomainPossiblyNice;
    },
    get cDomain() {
      return cDomain;
    },
    get x1Domain() {
      return x1Domain;
    },
    get y1Domain() {
      return y1Domain;
    },
    get xRange() {
      return xRange;
    },
    get yRange() {
      return yRange;
    },
    get zRange() {
      return zRange;
    },
    get rRange() {
      return rRange;
    },
    get cRange() {
      return cRangeProp;
    },
    get x1Range() {
      return x1RangeProp;
    },
    get y1Range() {
      return y1RangeProp;
    },
    get meta() {
      return meta;
    },
    set meta(v: Record<string, any>) {
      meta = v;
    },
    get xScale() {
      return xScale;
    },
    get yScale() {
      return yScale;
    },
    get zScale() {
      return zScale;
    },
    get rScale() {
      return rScale;
    },
    get yGet() {
      return yGet;
    },
    get xGet() {
      return xGet;
    },
    get zGet() {
      return zGet;
    },
    get rGet() {
      return rGet;
    },
    get cGet() {
      return cGet;
    },
    get x1Get() {
      return x1Get;
    },
    get y1Get() {
      return y1Get;
    },
    get cScale() {
      return cScale;
    },
    get x1Scale() {
      return x1Scale;
    },
    get y1Scale() {
      return y1Scale;
    },
    get radial() {
      return radial;
    },
    get containerRef() {
      return ref;
    },
    get geo() {
      return geoContext;
    },
    get transform() {
      return transformContext;
    },
    get tooltip() {
      return tooltipContext;
    },
    get brush() {
      return brushContext;
    },
  };

  contextProp = context;

  setChartContext(context);

  $effect(() => {
    isMounted = true;
  });

  onMount(() => {
    if (box && debug === true && (ssr === true || typeof window !== 'undefined')) {
      logDebug({
        data,
        flatData: typeof flatData !== 'undefined' ? flatData : null,
        boundingBox: box,
        activeGetters,
        x: xProp,
        y: yProp,
        z: zProp,
        r: rProp,
        xScale,
        yScale,
        zScale,
        rScale,
      });
    }
  });

  $effect(() => {
    if (!isMounted) return;
    onResize?.({
      width: context.width,
      height: context.height,
      containerWidth: context.containerWidth,
      containerHeight: context.containerHeight,
    });
  });

  const initialTransform = $derived(
    geo?.applyTransform?.includes('translate') && geo?.fitGeojson && geo?.projection
      ? geoFitObjectTransform(geo.projection(), [width, height], geo.fitGeojson)
      : undefined
  );

  const processTranslate = $derived.by(() => {
    if (!geo) return undefined;
    return (x: number, y: number, deltaX: number, deltaY: number) => {
      if (geo.applyTransform?.includes('rotate') && geoContext?.projection) {
        // When applying transform to rotate, invert `y` values and reduce sensitivity based on projection scale
        // see: https://observablehq.com/@benoldenburg/simple-globe and https://observablehq.com/@michael-keith/draggable-globe-in-d3
        const projectionScale = geoContext.projection.scale() ?? 0;
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
    style:top={position === 'absolute' ? '0' : null}
    style:right={position === 'absolute' ? '0' : null}
    style:bottom={position === 'absolute' ? '0' : null}
    style:left={position === 'absolute' ? '0' : null}
    style:pointer-events={pointerEvents === false ? 'none' : null}
    bind:clientWidth={containerWidth}
    bind:clientHeight={containerHeight}
    class={layerClass('root-container')}
  >
    {#key isMounted}
      <!-- svelte-ignore ownership_invalid_binding -->
      <TransformContext
        bind:transformContext
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
        <GeoContext {...geo} bind:geoContext>
          <!-- svelte-ignore ownership_invalid_binding -->
          <BrushContext {...brushProps} bind:brushContext>
            <!-- svelte-ignore ownership_invalid_binding -->
            <TooltipContext {...tooltipProps} bind:tooltipContext>
              {@render _children?.({
                context,
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
  .lc-root-container {
    width: 100%;
    height: 100%;
  }
</style>
