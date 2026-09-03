<script lang="ts">
  import Chart from '$lib/components/Chart/Chart.svelte';
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
    width: 400,
    height: 200,
    ...chartProps,
  });
</script>

<!--
  Real pointer input is disabled because these tests drive the tooltip programmatically.  Vitest's
  browser mode tiles every test file's iframe into a single page sharing one cursor, so a `hover()`
  in another file can leave that cursor sitting where this chart later mounts.  The boundary event
  the browser fires when an element appears under a stationary cursor would then show a tooltip the
  test never asked for.  Synthetic events handed straight to `show()` are unaffected.
-->
<div style="pointer-events: none">
  <Chart {...mergedChartProps} bind:context={chartContext} />
</div>
