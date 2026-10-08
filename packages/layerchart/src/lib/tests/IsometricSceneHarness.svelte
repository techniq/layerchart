<script lang="ts">
  import Chart from '$lib/components/Chart/Chart.svelte';
  import Layer from '$lib/components/layers/Layer.svelte';
  import Frame from '$lib/components/Frame/Frame.svelte';
  import Grid from '$lib/components/Grid/Grid.svelte';
  import Axis from '$lib/components/Axis/Axis.svelte';
  import Circle from '$lib/components/Circle/Circle.svelte';
  import Highlight from '$lib/components/Highlight/Highlight.svelte';
  import type { ChartState } from '$lib/states/chart.svelte.js';

  let {
    chartProps = {},
    circleProps = {},
    highlights = [],
    layer,
    oncontext,
  }: {
    chartProps?: Record<string, any>;
    circleProps?: Record<string, any>;
    highlights?: Record<string, any>[];
    layer?: 'svg' | 'canvas' | 'html';
    oncontext?: (ctx: ChartState<any, any, any>) => void;
  } = $props();

  let context = $state<ChartState<any, any, any>>();
  $effect(() => {
    if (context) oncontext?.(context);
  });
</script>

<!-- Pointer input off: these tests drive the tooltip programmatically (see TooltipTestHarness) -->
<div style="pointer-events: none">
  <Chart width={500} height={400} padding={30} {...chartProps} bind:context>
    <Layer type={layer}>
      <Frame />
      <Grid x y z />
      <Axis placement="back" />
      <Circle cx="x" cy="y" r={5} {...circleProps} />
      {#each highlights as props}
        <Highlight motion="none" {...props} />
      {/each}
    </Layer>
  </Chart>
</div>
