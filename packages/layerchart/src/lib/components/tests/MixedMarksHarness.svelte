<script lang="ts">
  import Chart from '../Chart/Chart.svelte';
  import Layer from '../layers/Layer.svelte';
  import Bars from '../Bars/Bars.svelte';
  import Spline from '../Spline/Spline.svelte';
  import type { ChartState } from '$lib/states/chart.svelte.js';

  let {
    chartProps = {},
    splineProps = {},
    oncontext,
  }: {
    chartProps?: any;
    splineProps?: any;
    oncontext?: (c: ChartState<any, any, any>) => void;
  } = $props();

  let context = $state<ChartState<any, any, any>>();
  $effect(() => {
    if (context) oncontext?.(context);
  });
</script>

<Chart {...chartProps} bind:context>
  <Layer>
    <Bars />
    <Spline {...splineProps} />
  </Layer>
</Chart>
