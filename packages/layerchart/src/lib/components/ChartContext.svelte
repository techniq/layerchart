<!-- Wrapper to allow getting LayerCake context from <Chart> and exposing with a strongly type context getter -->
<script lang="ts" context="module">
  import type { AnyScale } from 'layerchart/utils/scales.js';

  import type { HierarchyNode } from 'd3-hierarchy';
  import { createEventDispatcher, getContext, onMount, setContext } from 'svelte';
  import { derived, type Readable } from 'svelte/store';

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
    xRange: Readable<any>;
    yRange: Readable<any>;
    zRange: Readable<any>;
    rRange: Readable<any>;
    config: Readable<any>;
    xScale: Readable<AnyScale>;
    xGet: Readable<any>;
    yScale: Readable<AnyScale>;
    yGet: Readable<any>;
    zScale: Readable<AnyScale>;
    zGet: Readable<any>;
    rScale: Readable<AnyScale>;
    rGet: Readable<any>;
  };

  export type ChartEvents = {
    resize: ChartResizeDetail;
  };

  export type ChartResizeDetail = {
    chart: { width: number; height: number };
    container: { width: number; height: number };
  };

  export type ChartResizeEvent = CustomEvent<ChartResizeDetail>;

  export type ChartContext<TData> = LayerCakeContext<TData> & {
    // TODO: consider extending with additional values
  };

  export function chartContext<TData = any>() {
    return getContext<ChartContext<TData>>(chartContextKey);
  }

  function setChartContext<TData = any>(context: ChartContext<TData>) {
    setContext(chartContextKey, context);
  }
</script>

<script lang="ts" generics="TData">
  import type { SankeyGraph } from 'd3-sankey';

  const dispatch = createEventDispatcher<ChartEvents>();

  const layerCakeContext = getContext<LayerCakeContext<TData>>('LayerCake');
  setChartContext(layerCakeContext);

  const { width, height, containerWidth, containerHeight } = layerCakeContext;

  $: if (isMounted) {
    dispatch('resize', {
      chart: { width: $width, height: $height },
      container: { width: $containerWidth, height: $containerHeight },
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

<slot {data} flatData={layerCakeContext.data} />
