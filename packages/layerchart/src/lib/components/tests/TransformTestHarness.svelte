<script lang="ts">
  import Chart from '../Chart.svelte';
  import type { ChartState } from '$lib/states/chart.svelte.js';

  let {
    chartProps = {},
    oncontext,
  }: {
    chartProps?: Record<string, any>;
    oncontext?: (ctx: ChartState<any, any, any>) => void;
  } = $props();

  let chartContext = $state<ChartState<any, any, any>>();

  $effect(() => {
    if (chartContext) {
      oncontext?.(chartContext);
    }
  });

  const mergedChartProps = $derived({
    height: 300,
    ...chartProps,
  });
</script>

<Chart {...mergedChartProps} bind:context={chartContext} />
