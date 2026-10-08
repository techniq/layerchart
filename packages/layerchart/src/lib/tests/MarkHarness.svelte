<script lang="ts">
  import type { Component } from 'svelte';
  import Chart from '$lib/components/Chart/Chart.svelte';
  import Layer from '$lib/components/layers/Layer.svelte';
  import type { ChartState } from '$lib/states/chart.svelte.js';

  let {
    chartProps = {},
    layerProps = {},
    component: Mark,
    componentProps = {},
    oncontext,
  }: {
    chartProps?: Record<string, any>;
    layerProps?: Record<string, any>;
    component: Component<any>;
    componentProps?: Record<string, any>;
    oncontext?: (ctx: ChartState<any, any, any>) => void;
  } = $props();

  let context = $state<ChartState<any, any, any>>();
  $effect(() => {
    if (context) oncontext?.(context);
  });
</script>

<!--
  A mark without the `children` snippet `TestHarness` always passes, for marks that otherwise render
  `children` in place of their own pieces (`Bars`, `Pie`, `Calendar`)
-->
<Chart {...chartProps} bind:context data-testid="test-lc-chart">
  <Layer {...layerProps}>
    <Mark {...componentProps} />
  </Layer>
</Chart>
