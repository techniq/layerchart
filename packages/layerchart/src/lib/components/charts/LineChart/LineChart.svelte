<script lang="ts" module>
  export type { LineChartProps } from './LineChart.shared.svelte.js';
</script>

<script lang="ts" generics="TData">
  import LineChartBase from './LineChart.base.svelte';
  import Chart from '../../Chart/Chart.svelte';
  import Spline from '../../Spline/Spline.svelte';
  import type { LineChartProps } from './LineChart.shared.svelte.js';

  let { context = $bindable(), ...props }: LineChartProps<TData> = $props();
</script>

<LineChartBase {Chart} {Spline} bind:context {...props} />
