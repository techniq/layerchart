<script lang="ts" module>
  export type { BarChartProps } from './BarChart.shared.svelte.js';
</script>

<script lang="ts" generics="TData">
  import BarChartBase from './BarChart.base.svelte';
  import Chart from '../../Chart/Chart.canvas.svelte';
  import Bars from '../../Bars/Bars.canvas.svelte';
  import type { BarChartProps } from './BarChart.shared.svelte.js';

  let props: BarChartProps<TData> = $props();
</script>

<BarChartBase {Chart} {Bars} {...props} />
