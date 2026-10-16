<script lang="ts" module>
  export type { BarChartProps } from './BarChart.shared.svelte.js';
</script>

<script lang="ts" generics="TData">
  import BarChartBase from './BarChart.base.svelte';
  import Chart from '../../Chart/Chart.svelte';
  import Bars from '../../Bars/Bars.svelte';
  import type { BarChartProps } from './BarChart.shared.svelte.js';

  let { ref = $bindable(), context = $bindable(), ...props }: BarChartProps<TData> = $props();
</script>

<BarChartBase {Chart} {Bars} bind:ref bind:context {...props} />
