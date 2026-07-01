<script lang="ts" module>
  export type { LineChartProps } from './LineChart.shared.svelte.js';
</script>

<script lang="ts" generics="TData">
  import LineChartBase from './LineChart.base.svelte';
  import Chart from '../../Chart/Chart.canvas.svelte';
  import Spline from '../../Spline/Spline.canvas.svelte';
  import type { LineChartProps } from './LineChart.shared.svelte.js';

  let props: LineChartProps<TData> = $props();
</script>

<LineChartBase {Chart} {Spline} {...props} />
