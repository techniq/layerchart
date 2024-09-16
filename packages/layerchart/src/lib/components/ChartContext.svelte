<!-- Wrapper to allow getting LayerCake context from <Chart> and exposing with a strongly type context getter -->
<script lang="ts" context="module">
  import { createScale, type AnyScale } from 'layerchart/utils/scales.js';

  import type { HierarchyNode } from 'd3-hierarchy';
  import {
    createEventDispatcher,
    getContext,
    onMount,
    setContext,
    type ComponentProps,
  } from 'svelte';
  import { writable, type Readable } from 'svelte/store';

  export const chartContextKey = Symbol();

  type LayerCakeContext<TData> = {
    activeGetters: Readable<{
      x: (d: TData) => any;
      y: (d: TData) => any;
      z: (d: TData) => any;
      r: (d: TData) => any;
    }>;
    width: Readable<number>;
    height: Readable<number>;
    percentRange: Readable<boolean>;
    aspectRatio: Readable<number>;
    containerWidth: Readable<number>;
    containerHeight: Readable<number>;
    x: Readable<(d: TData) => any>;
    y: Readable<(d: TData) => any>;
    z: Readable<(d: TData) => any>;
    r: Readable<(d: TData) => any>;
    x1: Readable<(d: TData) => any>;
    y1: Readable<(d: TData) => any>;
    custom: Readable<Object>;
    data: Readable<TData[] | HierarchyNode<TData> | SankeyGraph<any, any>>;
    xNice: Readable<number | boolean>;
    yNice: Readable<number | boolean>;
    zNice: Readable<number | boolean>;
    rNice: Readable<number | boolean>;
    xDomainSort: Readable<boolean>;
    yDomainSort: Readable<boolean>;
    zDomainSort: Readable<boolean>;
    rDomainSort: Readable<boolean>;
    xReverse: Readable<boolean>;
    yReverse: Readable<boolean>;
    zReverse: Readable<boolean>;
    rReverse: Readable<boolean>;
    xPadding: Readable<[number, number]>;
    yPadding: Readable<[number, number]>;
    zPadding: Readable<[number, number]>;
    rPadding: Readable<[number, number]>;
    padding: Readable<{
      top: number;
      bottom: number;
      left: number;
      right: number;
    }>;
    flatData: Readable<TData[]>;
    extents: Readable<{}>;
    xDomain: Readable<any>;
    yDomain: Readable<any>;
    zDomain: Readable<any>;
    rDomain: Readable<any>;
    x1Domain: Readable<any>;
    y1Domain: Readable<any>;
    xRange: Readable<any>;
    yRange: Readable<any>;
    zRange: Readable<any>;
    rRange: Readable<any>;
    x1Range: Readable<any>;
    y1Range: Readable<any>;
    config: Readable<any>;
    xScale: Readable<AnyScale>;
    xGet: Readable<any>;
    yScale: Readable<AnyScale>;
    yGet: Readable<any>;
    zScale: Readable<AnyScale>;
    zGet: Readable<any>;
    rScale: Readable<AnyScale>;
    rGet: Readable<any>;
    x1Scale: Readable<AnyScale | null>;
    y1Scale: Readable<AnyScale | null>;
  };

  export type ChartEvents = {
    resize: ChartResizeDetail;
  };

  export type ChartResizeDetail = {
    width: number;
    height: number;
    containerWidth: number;
    containerHeight: number;
  };

  export type ChartResizeEvent = CustomEvent<ChartResizeDetail>;

  export type ChartContext<TData> = LayerCakeContext<TData> & {
    // Additional context values
    radial: Readable<boolean>;
  };

  export function chartContext<TData = any>() {
    return getContext<ChartContext<TData>>(chartContextKey);
  }

  function setChartContext<TData = any>(context: ChartContext<TData>) {
    setContext(chartContextKey, context);
  }
</script>

<script lang="ts" generics="TData">
  import { extent } from 'd3-array';

  import type { SankeyGraph } from 'd3-sankey';

  import type Chart from './Chart.svelte';
  import { accessor, chartDataArray } from '../utils/common.js';

  type ChartProps = ComponentProps<Chart<TData>>;

  export let x1: ChartProps['x1'] = undefined;
  export let x1Scale: ChartProps['x1Scale'] = undefined;
  export let x1Domain: ChartProps['x1Domain'] = undefined;
  export let x1Range: ChartProps['x1Range'] = undefined;

  export let y1: ChartProps['y1'] = undefined;
  export let y1Scale: ChartProps['y1Scale'] = undefined;
  export let y1Domain: ChartProps['y1Domain'] = undefined;
  export let y1Range: ChartProps['y1Range'] = undefined;

  const layerCakeContext = getContext<LayerCakeContext<TData>>('LayerCake');
  const {
    data: contextData,
    width,
    height,
    containerWidth,
    containerHeight,
    xScale,
    yScale,
    config,
  } = layerCakeContext;

  /* --------------------------------------------
   * Make store versions of each parameter
   * Prefix these with `_` to keep things organized
   */
  const _x1 = writable(accessor(x1));
  const _x1Scale = writable<AnyScale | null>(null);
  const _x1Domain = writable<ChartProps['x1Domain']>(x1Domain);
  const _x1Range = writable<ChartProps['x1Range']>(x1Range);

  $: $_x1 = accessor(x1);
  $: $_x1Domain = x1Domain ?? extent(chartDataArray($contextData), $_x1);
  $: $_x1Scale =
    x1Scale && x1Range
      ? createScale(x1Scale, $_x1Domain, x1Range, { xScale: $xScale, $width, $height })
      : null;
  $: $_x1Range = x1Range;

  const _y1 = writable(accessor(y1));
  const _y1Scale = writable<AnyScale | null>(null);
  const _y1Domain = writable<ChartProps['y1Domain']>(y1Domain);
  const _y1Range = writable<ChartProps['y1Range']>(y1Range);

  $: $_y1 = accessor(y1);
  $: $_y1Domain = y1Domain ?? extent(chartDataArray($contextData), $_y1);
  $: $_y1Range = y1Range;
  $: $_y1Scale =
    y1Scale && y1Range
      ? createScale(y1Scale, $_y1Domain, y1Range, { yScale: $yScale, $width, $height })
      : null;

  /** Use radial instead of cartesian coordinates, mapping `x` to `angle` and `y`` to radial.  Radial lines are positioned relative to the origin, use transform (ex. `<Group center>`) to change the origin */
  export let radial = false;
  const _radial = writable(radial);
  $: $_radial = radial;

  const chartContext = {
    ...layerCakeContext,

    x1: _x1,
    x1Scale: _x1Scale,
    x1Domain: _x1Domain,
    x1Range: _x1Range,

    y1: _y1,
    y1Scale: _y1Scale,
    y1Domain: _y1Domain,
    y1Range: _y1Range,

    config: {
      ...layerCakeContext.config,
      ...(x1 && { x1 }),
      ...(x1Domain && { x1Domain }),
      ...(x1Range && { x1Range }),
    },
    radial: _radial,
  };
  setChartContext(chartContext);

  const dispatch = createEventDispatcher<ChartEvents>();
  $: if (isMounted) {
    dispatch('resize', {
      width: $width,
      height: $height,
      containerWidth: $containerWidth,
      containerHeight: $containerHeight,
    });
  }

  // Track when mounted since LayerCake initializes width/height with `100` until binded `clientWidth`/`clientWidth` can run
  let isMounted = false;
  onMount(() => {
    isMounted = true;
  });

  // Added to try to pass TData downward
  export let data: TData[] | HierarchyNode<TData> | SankeyGraph<any, any> = []; // Same as `ComponentProps<Chart<TData>>` but causes circular reference
</script>

<slot
  {data}
  flatData={chartContext.data}
  config={$config}
  x1Scale={$_x1Scale}
  y1Scale={$_y1Scale}
/>
