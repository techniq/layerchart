<script lang="ts" module>
  export type { BarChartProps } from 'layerchart';
</script>

<script lang="ts" generics="TData">
  import { BarChartBase } from 'layerchart/base';
  import type { BarChartProps } from 'layerchart';
  import Chart from '../Chart/Chart.svelte';
  import Bars from '../Bars/Bars.svelte';

  let { ref = $bindable(), context = $bindable(), ...props }: BarChartProps<TData> = $props();
</script>

<!-- LayerChart's `BarChart`, drawn with the marks here in whichever layer it's in -->
<BarChartBase {Chart} {Bars} bind:ref bind:context {...props} />
