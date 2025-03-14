<script lang="ts" module>
  // this is the LayerCake replacement component
  import { scaleLinear, scaleSqrt } from 'd3-scale';
  import { type Accessor, accessor } from '$lib/utils/common.js';
  import { printDebug } from '$lib/utils/debug.js';
  import { filterObject } from '$lib/utils/filter-object.js';
  import type { AnyScale, DomainType } from '$lib/utils/scales.js';
  import { Context, useDebounce } from 'runed';
  import type {
    AxisKey,
    BaseRange,
    Extents,
    Nice,
    Padding,
    PaddingArray,
    XRangeWithScale,
    YRangeWithScale,
  } from 'layerchart/utils/types.js';
  import {
    calcDomain,
    calcScaleExtents,
    createGetter,
    createScale,
    getRange,
  } from '$lib/utils/layout.js';
  import type { Snippet } from 'svelte';

  const defaultPadding = { top: 0, right: 0, bottom: 0, left: 0 };

  type ContextType<T> = {
    activeGetters: Record<AxisKey, (d: T) => any>;
    width: number;
    height: number;
    percentRange: boolean;
    aspectRatio: number;
    containerWidth: number;
    containerHeight: number;
    x: (d: T) => number;
    y: (d: T) => number;
    z: (d: T) => number;
    r: (d: T) => number;
    data: T;
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
    flatData: any[];
    extents: Extents;
    xDomain: DomainType;
    yDomain: DomainType;
    zDomain: DomainType;
    rDomain: DomainType;
    xRange: any[] | null;
    yRange: any[] | null;
    zRange: any[] | null;
    rRange: any[] | null;
    custom: Record<string, any>;
    xScale: AnyScale;
    yScale: AnyScale;
    zScale: AnyScale;
    rScale: AnyScale;
    yGet: (d: T) => number;
    xGet: (d: T) => number;
    zGet: (d: T) => number;
    rGet: (d: T) => number;
  };

  const ChartContext = new Context<ContextType<any>>('ChartContext');

  export function getChartContext<T>(): ContextType<T> {
    return ChartContext.get();
  }

  export function setChartContext<T>(context: ContextType<T>): ContextType<T> {
    return ChartContext.set(context);
  }

  export type ChartPropsWithoutHTML<T> = {
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
     * Override the automated width.
     *
     * @default containerWidth
     */
    width?: number;

    /**
     * Override the automated height.
     *
     * @default containerHeight
     */
    height?: number;

    /**
     * The bound container width.
     *
     * @default width || 100
     */
    containerWidth?: number;

    /**
     * The bound container height.
     *
     * @default height || 100
     */
    containerHeight?: number;

    /**
     * The .layerchart-container `<div>` tag. Useful for bindings.
     */
    ref?: HTMLElement | null;

    /**
     * x The x accessor. The key in each row of data that corresponds to the x-field.
     * This can be a string, an accessor function, a number or an array of any combination of those
     * types. This property gets converted to a function when you access it through the context.
     *
     * If `data` is not a flat array of objects and you want to use any of the scales, set a flat
     * version of the data via the `flatData` prop.
     */
    data?: T;

    /**
     * A flat version of data.
     */
    flatData?: any[];

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
     * extent, set that value to `null`.  Set it to a function that receives the computed domain
     * and lets you return a modified domain, useful for sorting values.
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
    xScale?: AnyScale;

    /**
     * The D3 scale that should be used for the x-dimension. Pass in an instantiated D3 scale if
     * you want to override the default or you want to extra options.
     * @default scaleLinear
     */
    yScale?: AnyScale;

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
    x1Range?: XRangeWithScale;

    /**
     * Set the y1 range by setting an array or function with argument `({ yScale, width, height})`
     * that returns an array. This can also be a list of numbers or strings for scales with
     * discrete ranges like [scaleThreshold](https://github.com/d3/d3-scale#threshold-scales) or
     * [scaleQuantize](https://github.com/d3/d3-scale#quantize-scales).
     */
    y1Range?: YRangeWithScale;

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
     */
    xDomainSort?: boolean;

    /**
     * ***Only used when scale is ordinal.***
     * Set whether the calculated unique items come back sorted.
     */
    yDomainSort?: boolean;

    /**
     * ***Only used when scale is ordinal.***
     * Set whether the calculated unique items come back sorted.
     */
    zDomainSort?: boolean;

    /**
     * ***Only used when scale is ordinal.***
     * Set whether the calculated unique items come back sorted.
     */
    rDomainSort?: boolean;

    /**
     * The amount of padding to put around your chart. It operates like CSS box-sizing: border-box;
     *  where values are subtracted from the parent container's width and height, the same as a
     * [D3 margin convention](https://bl.ocks.org/mbostock/3019563).
     */
    padding?: { top?: Number; right?: Number; bottom?: Number; left?: Number };

    /**
     * Manually set the extents of the x, y or r scale as a two-dimensional array of the min and
     * max you want. Setting values here will skip any dynamic extent calculation of the data for
     * that dimension.
     */
    extents?: {
      x?: [min: Number, max: Number];
      y?: [min: Number, max: Number];
      r?: [min: Number, max: Number];
      z?: [min: Number, max: Number];
    };

    /**
     * Any extra configuration values you want available on the Chart context. This could be
     * useful for color lookups or additional constants.
     */
    custom?: Record<string, any>;

    /**
     * Enable debug printing to the console. Useful to inspect your scales and dimensions.
     */
    debug?: boolean;

    /**
     * Show warnings in the console.
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
     */
    radial?: boolean;

    children?: Snippet<[{ context: ContextType<T> }]>;

    /** Props passed to GeoContext */
    // geo?: typeof geo;

    // /** Exposed via bind: to support `bind:geoProjection` for external access */
    // geoProjection?: typeof geoProjection;

    // /** Props passed to TooltipContext */
    // tooltip?: typeof tooltip;

    // /** Exposed via bind: to support `bind:tooltipContext` for external access (ex. `tooltipContext.data) */
    // tooltipContext?: typeof tooltipContext;

    // /** Props passed to TransformContext */
    // transform?: typeof transform;

    // /** Expose to support `bind:transformContext` for imperative control (`transformContext.translate(...)`) */
    // transformContext?: typeof transformContext;

    // /** Props passed to BrushContext */
    // brush?: typeof brush;

    // /** Exposed via bind: to support `bind:brushContext` for external access (ex. `brushContext.xDomain) */
    // brushContext?: typeof brushContext;

    // ChartContext callback events
    // onresize?: typeof onresize;

    // TransformContext callback events
    // ondragstart?: typeof ondragstart;
    // ondragend?: typeof ondragend;
    // ontransform?: typeof ontransform;
  };
</script>

<script lang="ts" generics="TData">
  let {
    ssr = false,
    pointerEvents = true,
    position = 'relative',
    percentRange = false,
    width: widthProp,
    height: heightProp,
    containerWidth = widthProp || 100,
    containerHeight = heightProp || 100,
    ref = $bindable(null),
    x: xProp,
    y: yProp,
    z: zProp,
    r: rProp,
    data = [] as TData,
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
    // @ts-expect-error - shh
    xScale: xScaleProp = scaleLinear(),
    // @ts-expect-error - shh
    yScale: yScaleProp = scaleLinear(),
    // @ts-expect-error - shh
    zScale: zScaleProp = scaleLinear(),
    // @ts-expect-error - shh
    rScale: rScaleProp = scaleSqrt(),
    // @ts-expect-error - shh
    flatData: flatDataProp = data,
    padding: paddingProp = {},
    verbose = true,
    debug = false,
    extents: extentsProp = {},
    xDomainSort = true,
    yDomainSort = true,
    zDomainSort = true,
    rDomainSort = true,
    xReverse = false,
    yReverse = false,
    zReverse = false,
    rReverse = false,
    xRange: xRangeProp,
    yRange: yRangeProp,
    zRange: zRangeProp,
    rRange: rRangeProp,
    custom = {},
    children,
  }: ChartPropsWithoutHTML<TData> = $props();

  const logDebug = useDebounce(printDebug, 200);

  const x = $derived(accessor(xProp));
  const y = $derived(accessor(yProp));
  const z = $derived(accessor(zProp));
  const r = $derived(accessor(rProp));
  const flatData = $derived(flatDataProp || data);
  const filteredExtents = $derived(filterObject(extentsProp));

  const activeGetters = {
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
  };

  const padding = $derived(Object.assign(defaultPadding, paddingProp));

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

  const xDomain = $derived(calcDomain('x', extents, xDomainProp));
  const yDomain = $derived(calcDomain('y', extents, yDomainProp));
  const zDomain = $derived(calcDomain('z', extents, zDomainProp));
  const rDomain = $derived(calcDomain('r', extents, rDomainProp));

  const xScale = $derived(
    createScale('x', {
      scale: xScaleProp,
      domain: xDomain,
      extents,
      padding: xPadding,
      nice: xNice,
      reverse: xReverse,
      percentRange,
      range: xRangeProp,
      height,
      width,
    })
  );

  const xGet = $derived(createGetter(x, xScale));

  const yScale = $derived(
    createScale('y', {
      scale: yScaleProp,
      domain: yDomain,
      extents,
      padding: yPadding,
      nice: yNice,
      reverse: yReverse,
      percentRange,
      range: yRangeProp,
      height,
      width,
    })
  );

  const yGet = $derived(createGetter(y, yScale));

  const zScale = $derived(
    createScale('z', {
      scale: zScaleProp,
      domain: zDomain,
      extents,
      padding: zPadding,
      nice: zNice,
      reverse: zReverse,
      percentRange,
      range: zRangeProp,
      height,
      width,
    })
  );
  const zGet = $derived(createGetter(z, zScale));

  const rScale = $derived(
    createScale('r', {
      scale: rScaleProp,
      domain: rDomain,
      extents,
      padding: rPadding,
      nice: rNice,
      reverse: rReverse,
      percentRange,
      range: rRangeProp,
      height,
      width,
    })
  );

  const rGet = $derived(createGetter(r, rScale));

  const xDomainPossiblyNice = $derived(xScale.domain());
  const yDomainPossiblyNIce = $derived(yScale.domain());
  const zDomainPossiblyNice = $derived(zScale.domain());
  const rDomainPossiblyNice = $derived(rScale.domain());

  const xRange = $derived(getRange(xScale));
  const yRange = $derived(getRange(yScale));
  const zRange = $derived(getRange(zScale));
  const rRange = $derived(getRange(rScale));

  const aspectRatio = $derived(width / height);

  const context: ContextType<TData> = {
    get activeGetters() {
      return activeGetters;
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
      return xDomain;
    },
    get yDomain() {
      return yDomain;
    },
    get zDomain() {
      return zDomain;
    },
    get rDomain() {
      return rDomain;
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
    get custom() {
      return custom;
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
  };

  setChartContext(context);

  $effect(() => {
    isMounted = true;
  });
</script>

{#if ssr === true || typeof window !== 'undefined'}
  <div
    bind:this={ref}
    class="layerchart-container"
    style:position
    style:top={position === 'absolute' ? '0' : null}
    style:right={position === 'absolute' ? '0' : null}
    style:bottom={position === 'absolute' ? '0' : null}
    style:left={position === 'absolute' ? '0' : null}
    style:pointer-events={pointerEvents === false ? 'none' : null}
    bind:clientWidth={containerWidth}
    bind:clientHeight={containerHeight}
  >
    {@render children?.({ context })}
  </div>
{/if}

<style>
  .layerchart-container,
  .layerchart-container :global(*) {
    box-sizing: border-box;
  }
  .layerchart-container {
    width: 100%;
    height: 100%;
  }
</style>
