<script lang="ts" module>
  import { type ComponentProps, type Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import type { TimeInterval } from 'd3-time';
  import type { HierarchyNode } from 'd3-hierarchy';
  import type { SankeyGraph } from 'd3-sankey';

  import { getObjectOrNull, type Accessor } from '$lib/utils/common.js';
  import type { MotionProp } from '$lib/utils/motion.svelte.js';
  import { type AnyScale, type DomainType } from '$lib/utils/scales.svelte.js';
  import type {
    BaseRange,
    Nice,
    PaddingArray,
    Without,
    XRangeWithScale,
    YRangeWithScale,
  } from '$lib/utils/types.js';
  import type { GeoStateProps } from '$lib/states/geo.svelte.js';
  import TooltipContext from './tooltip/TooltipContext.svelte';

  import { geoFitObjectTransform } from '$lib/utils/geo.js';
  import TransformContext from './TransformContext.svelte';
  import BrushContext from './BrushContext.svelte';
  import { type BrushDomainType, type BrushState } from '$lib/states/brush.svelte.js';

  import { setChartContext } from '$lib/contexts/chart.js';
  import { ChartState } from '$lib/states/chart.svelte.js';
  import type { StackLayout } from '$lib/states/series.svelte.js';

  import type { ChartChildrenProps } from './ChartChildren.svelte';
  import type { SeriesData } from './charts/types.js';

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

    /**
     * The axis that represents the value dimension, typically based on the type and orientation of the chart
     *
     * @default 'y'
     */
    valueAxis?: 'x' | 'y';

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
     * Props passed to GeoState
     */
    geo?: Partial<GeoStateProps>;

    /**
     * Props passed to the `TooltipContext` component.
     */
    tooltipContext?: Partial<ComponentProps<typeof TooltipContext>> | boolean;

    /**
     * Props passed to TransformContext, with optional domain-space constraints.
     */
    transform?: Partial<ComponentProps<typeof TransformContext>> & {
      /**
       * Controls which projection properties are updated by transform state in `mode: 'projection'`.
       * Auto-detected from the projection type when not specified:
       * - Globe projections (e.g. `geoOrthographic`): `{ rotation: true, scale: false, translate: false }`
       * - Flat maps (e.g. `geoMercator`): `{ rotation: false, scale: true, translate: true }`
       *
       * `rotation` and `translate` are mutually exclusive.
       */
      apply?: {
        /** Apply transform translate as projection rotation (yaw/pitch). */
        rotation?: boolean;
        /** Apply transform scale to projection scale. */
        scale?: boolean;
        /** Apply transform translate to projection translate. */
        translate?: boolean;
      };

      /**
       * Domain-space constraints for pan/zoom in `mode: 'domain'`.
       * Expressed in data units (numbers, Dates) rather than pixel-space.
       * Converted internally to a `constrain` function on TransformState.
       */
      domainExtent?: {
        x?: {
          /** Minimum domain value. `'data'` = initial data bounds. */
          min?: number | Date | 'data';
          /** Maximum domain value. `'data'` = initial data bounds. */
          max?: number | Date | 'data';
          /** Minimum visible range (max zoom in). In data units (e.g., ms for dates). */
          minRange?: number;
        };
        y?: {
          min?: number | Date | 'data';
          max?: number | Date | 'data';
          minRange?: number;
        };
      };
    };

    /** Props passed to BrushContext */
    brush?:
      | (Partial<ComponentProps<typeof BrushContext>> & {
          /**
           * Zoom the chart domain to the brushed area on brush end.
           *
           * @default false
           */
          zoomOnBrush?: boolean;
        })
      | boolean;

    /** Series definitions for multi-series charts */
    series?: SeriesData<T, any>[];

    /** Layout mode for series: 'overlap', 'group', 'stack', 'stackExpand', 'stackDiverging' */
    seriesLayout?: StackLayout | 'group';

    /**
     * A callback function that is called when the chart is resized.
     */
    onResize?: (e: ChartResizeDetail) => void;

    /**
     * Whether to clip overflow content.
     * When true, sets `overflow: hidden` on the container.
     *
     * @default false
     */
    clip?: boolean;

    /**
     * Animate scale domain transitions with spring or tween motion.
     * Applies to all domain changes (data updates, brush zoom, transform, etc.)
     */
    motion?: MotionProp;

    // TransformContext callback events
    ondragstart?: ComponentProps<typeof TransformContext>['ondragstart'];
    ondragend?: ComponentProps<typeof TransformContext>['ondragend'];
    onTransform?: ComponentProps<typeof TransformContext>['onTransform'];

    /** Sets width of the chart container.  Uses parent width if not set (bind:clientWidth) */
    width?: number;

    /** Sets height of the chart container.  Uses parent height if not set (bind:clientHeight) */
    height?: number;
  } & ChartChildrenProps<T, XScale, YScale>;

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
  import { setGeoContext } from '$lib/contexts/geo.js';
  import { getSettings } from '$lib/contexts/settings.js';
  import ChartChildren from './ChartChildren.svelte';

  let {
    ref: refProp = $bindable(),
    context: contextProp = $bindable(),
    ...props
  }: ChartProps<TData, XScale, YScale> = $props();

  let {
    ssr = false,
    pointerEvents = true,
    width,
    height,
    position = 'relative',
    children,
    geo,
    tooltipContext,
    transform,
    onTransform,
    ondragend,
    ondragstart,
    brush,
    motion,
    debug = false,
    clip = false,
    onTooltipClick,
    class: className,
    ...restProps
  } = $derived(props);

  let brushXDomain = $state<BrushDomainType>();
  let brushYDomain = $state<BrushDomainType>();

  const chartState = new ChartState<TData, XScale, YScale>(() => ({
    ref: refProp,
    context: contextProp,
    ...props,
    xDomain: brushXDomain ?? props.xDomain,
    yDomain: brushYDomain ?? props.yDomain,
  }));

  let ref = $state<HTMLElement>();
  $effect.pre(() => {
    refProp = ref;
    chartState.containerRef = ref;
  });

  // Update bindable
  contextProp = chartState;

  setChartContext(chartState);
  setGeoContext(chartState.geoState);

  const settings = getSettings();
  $effect(() => {
    settings.debug = debug;
  });

  // Resolve which projection properties the transform state applies to
  const resolvedApply = $derived.by(() => {
    if (transform?.mode !== 'projection') return { rotation: false, scale: false, translate: false };

    // Auto-detect globe projections from clipAngle (flat projections return 0, globes return > 0)
    let isGlobe = false;
    if (geo?.projection) {
      const proj = geo.projection();
      isGlobe = (proj.clipAngle?.() ?? 0) > 0;
    }

    const defaults = isGlobe
      ? { rotation: true, scale: false, translate: false }
      : { rotation: false, scale: true, translate: true };

    // User overrides win; enforce mutual exclusion
    const result = { ...defaults, ...transform?.apply };
    if (transform?.apply?.rotation === true && transform?.apply?.translate == null) {
      result.translate = false;
    }
    if (transform?.apply?.translate === true && transform?.apply?.rotation == null) {
      result.rotation = false;
    }

    return result;
  });

  $effect.pre(() => {
    if (chartState.geoState) {
      chartState.geoState.transformApply = resolvedApply;
    }
  });

  const initialTransform = $derived(
    transform?.mode === 'projection' && (resolvedApply.translate || resolvedApply.scale) && geo?.fitGeojson && geo?.projection
      ? geoFitObjectTransform(
          geo.projection(),
          [chartState.width, chartState.height],
          geo.fitGeojson
        )
      : undefined
  );

  const processTranslate = $derived.by(() => {
    if (resolvedApply.rotation && chartState.geoState?.projection) {
      return (x: number, y: number, deltaX: number, deltaY: number) => {
        // When applying transform as rotation, invert `y` values and reduce sensitivity based on projection scale
        // see: https://observablehq.com/@benoldenburg/simple-globe and https://observablehq.com/@michael-keith/draggable-globe-in-d3
        const projectionScale = chartState.geoState.projection!.scale() ?? 0;
        const sensitivity = 75;
        return {
          x: x + deltaX * (sensitivity / projectionScale),
          y: y + deltaY * (sensitivity / projectionScale) * -1,
        };
      };
    }
    return undefined;
  });

  // Convert domainExtent to a constrain function on TransformState
  const domainExtentConstrain = $derived.by(() => {
    const de = transform?.domainExtent;
    if (!de) return undefined;

    return (t: { scale: number; translate: { x: number; y: number } }) => {
      let { scale, translate } = t;

      // Helper to resolve 'data' to base domain values
      const resolveValue = (
        val: number | Date | 'data' | undefined,
        baseDomainValue: unknown
      ): number | undefined => {
        if (val === undefined) return undefined;
        if (val === 'data') {
          if (baseDomainValue instanceof Date) return baseDomainValue.getTime();
          return baseDomainValue as number;
        }
        if (val instanceof Date) return val.getTime();
        return val;
      };

      // Constrain a single axis
      const constrainAxis = (
        axisTranslate: number,
        axisScale: number,
        dimension: number,
        baseDomain: number[],
        extent: { min?: number | Date | 'data'; max?: number | Date | 'data'; minRange?: number } | undefined
      ): number => {
        if (!extent || baseDomain.length < 2 || dimension <= 0) return axisTranslate;

        const d0 = baseDomain[0] as unknown;
        const d1 = baseDomain[1] as unknown;
        const isDate = d0 instanceof Date;
        const numMin = isDate ? (d0 as Date).getTime() : (d0 as number);
        const numMax = isDate ? (d1 as Date).getTime() : (d1 as number);
        const range = numMax - numMin;
        if (!isFinite(range) || range === 0) return axisTranslate;

        const minVal = resolveValue(extent.min, baseDomain[0]);
        const maxVal = resolveValue(extent.max, baseDomain[1]);

        // Current visible domain from translate/scale
        const f0 = -axisTranslate / axisScale / dimension;
        const f1 = (dimension - axisTranslate) / axisScale / dimension;
        let visMin = numMin + f0 * range;
        let visMax = numMin + f1 * range;
        const visRange = visMax - visMin;

        // Enforce minRange (max zoom in limit)
        if (extent.minRange != null && visRange < extent.minRange) {
          // Widen around center of current view
          const center = (visMin + visMax) / 2;
          visMin = center - extent.minRange / 2;
          visMax = center + extent.minRange / 2;
        }

        // Enforce domain min/max (pan boundaries)
        if (minVal != null && visMin < minVal) {
          visMin = minVal;
          visMax = visMin + (extent.minRange != null && visRange < extent.minRange ? extent.minRange : visRange);
        }
        if (maxVal != null && visMax > maxVal) {
          visMax = maxVal;
          visMin = visMax - (extent.minRange != null && visRange < extent.minRange ? extent.minRange : visRange);
          // Re-check min after adjusting
          if (minVal != null && visMin < minVal) visMin = minVal;
        }

        // Back-compute translate from corrected visible domain
        const newF0 = (visMin - numMin) / range;
        return -newF0 * axisScale * dimension;
      };

      const transformAxis = transform?.axis ?? 'both';

      if (de.x && (transformAxis === 'x' || transformAxis === 'both') && chartState.width > 0) {
        // Also enforce minRange via scale clamping
        if (de.x.minRange != null && chartState._baseXDomain.length >= 2) {
          const d0 = chartState._baseXDomain[0] as unknown;
          const d1 = chartState._baseXDomain[1] as unknown;
          const isDate = d0 instanceof Date;
          const numMin = isDate ? (d0 as Date).getTime() : (d0 as number);
          const numMax = isDate ? (d1 as Date).getTime() : (d1 as number);
          const fullRange = numMax - numMin;
          if (fullRange > 0) {
            const maxScale = fullRange / de.x.minRange;
            scale = Math.min(scale, maxScale);
          }
        }
        translate = {
          ...translate,
          x: constrainAxis(translate.x, scale, chartState.width, chartState._baseXDomain, de.x),
        };
      }

      if (de.y && (transformAxis === 'y' || transformAxis === 'both') && chartState.height > 0) {
        if (de.y.minRange != null && chartState._baseYDomain.length >= 2) {
          const d0 = chartState._baseYDomain[0] as unknown;
          const d1 = chartState._baseYDomain[1] as unknown;
          const isDate = d0 instanceof Date;
          const numMin = isDate ? (d0 as Date).getTime() : (d0 as number);
          const numMax = isDate ? (d1 as Date).getTime() : (d1 as number);
          const fullRange = numMax - numMin;
          if (fullRange > 0) {
            const maxScale = fullRange / de.y.minRange;
            scale = Math.min(scale, maxScale);
          }
        }
        translate = {
          ...translate,
          y: constrainAxis(translate.y, scale, chartState.height, chartState._baseYDomain, de.y),
        };
      }

      return { scale, translate };
    };
  });

  // Compose user-provided constrain with domainExtent constrain
  const composedConstrain = $derived.by(() => {
    const userConstrain = transform?.constrain;
    if (!domainExtentConstrain && !userConstrain) return undefined;
    if (!domainExtentConstrain) return userConstrain;
    if (!userConstrain) return domainExtentConstrain;
    // Domain extent first, then user constrain
    return (t: { scale: number; translate: { x: number; y: number } }) => {
      return userConstrain(domainExtentConstrain(t));
    };
  });

  const enhancedBrushProps = $derived.by(() => {
    if (!brush) return { disabled: true };
    const userProps = typeof brush === 'object' ? brush : {};

    const userOnBrushEnd = userProps.onBrushEnd;
    const zoomOnBrush = 'zoomOnBrush' in userProps ? userProps.zoomOnBrush : false;
    const needsEnhancement = transform?.mode === 'domain' || zoomOnBrush;
    if (!needsEnhancement) return userProps;

    return {
      ...userProps,
      onBrushEnd: (e: { brush: BrushState }) => {
        if (e.brush.active) {
          if (transform?.mode === 'domain') {
            chartState.zoomToBrush(e.brush, userProps.axis ?? 'x');
          } else if (zoomOnBrush) {
            const axis = userProps.axis ?? 'x';
            if (axis === 'x' || axis === 'both') brushXDomain = e.brush.x;
            if (axis === 'y' || axis === 'both') brushYDomain = e.brush.y;
          }
          e.brush.reset();
        } else {
          // Brush was cleared (click-to-reset) — reset transform/domain too
          if (transform?.mode === 'domain') {
            chartState.transform.reset();
          } else if (zoomOnBrush) {
            brushXDomain = undefined;
            brushYDomain = undefined;
          }
        }
        userOnBrushEnd?.(e);
      },
    };
  });
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
    style:overflow={clip ? 'hidden' : null}
    style:width={width ? `${width}px` : '100%'}
    style:height={height ? `${height}px` : '100%'}
    bind:clientWidth={chartState._containerWidth}
    bind:clientHeight={chartState._containerHeight}
    class={['lc-root-container', className]}
    {...restProps}
  >
    {#key chartState.isMounted}
      <!-- svelte-ignore ownership_invalid_binding -->
      {@const { domainExtent: _de, constrain: _uc, apply: _apply, ...transformProps } = transform ?? {}}
      <TransformContext
        bind:state={chartState.transformState}
        mode={transform?.mode ?? 'none'}
        initialTranslate={resolvedApply.translate ? initialTransform?.translate : undefined}
        initialScale={resolvedApply.scale ? initialTransform?.scale : undefined}
        {processTranslate}
        {...transformProps}
        constrain={composedConstrain}
        disablePointer={(brush === true || (typeof brush === 'object' && !brush.disabled)) || transform?.disablePointer}
        {ondragstart}
        {onTransform}
        {ondragend}
      >
        <!-- svelte-ignore ownership_invalid_binding -->
        <BrushContext {...enhancedBrushProps} bind:state={chartState.brushState}>
          <!-- svelte-ignore ownership_invalid_binding -->
          <TooltipContext onclick={onTooltipClick} {...getObjectOrNull(tooltipContext)} bind:state={chartState.tooltipState}>
            <ChartChildren {children} {tooltipContext} {...restProps} />
          </TooltipContext>
        </BrushContext>
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
