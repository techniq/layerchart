<!-- Wrapper to allow getting LayerCake context from <Chart> and exposing with a strongly type context getter -->
<script lang="ts" context="module">
  import { getContext, setContext } from 'svelte';
  import { type Readable } from 'svelte/store';

  export const chartContextKey = Symbol();

  type LayerCakeContext<TData = any[]> = {
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
    data: Readable<TData>;
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
    flatData: Readable<any[]>;
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
    xScale: Readable<any>;
    xGet: Readable<any>;
    yScale: Readable<any>;
    yGet: Readable<any>;
    zScale: Readable<any>;
    zGet: Readable<any>;
    rScale: Readable<any>;
    rGet: Readable<any>;
  };

  export type ChartContext = LayerCakeContext & {
    // TODO: consider extending with additional values
  };

  export function chartContext() {
    return getContext<ChartContext>(chartContextKey);
  }

  function setChartContext(context: ChartContext) {
    setContext(chartContextKey, context);
  }
</script>

<script lang="ts">
  const layerCakeContext = getContext<LayerCakeContext>('LayerCake');
  setChartContext(layerCakeContext);
</script>

<slot />
