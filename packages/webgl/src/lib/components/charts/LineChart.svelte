<script lang="ts" module>
  export type { LineChartProps } from 'layerchart';
</script>

<script lang="ts" generics="TData">
  import { LineChartBase } from 'layerchart/base';
  import type { LineChartProps } from 'layerchart';
  import Chart from '../Chart/Chart.svelte';
  import Spline from '../Spline/Spline.svelte';

  let { ref = $bindable(), context = $bindable(), ...props }: LineChartProps<TData> = $props();
</script>

<!-- LayerChart's `LineChart`, drawn with the marks here in whichever layer it's in -->
<LineChartBase {Chart} {Spline} bind:ref bind:context {...props} />
