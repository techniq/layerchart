<script lang="ts" module>
  export type { ScatterChartProps } from 'layerchart';
</script>

<script lang="ts" generics="TData">
  import { ScatterChartBase } from 'layerchart/base';
  import type { ScatterChartProps } from 'layerchart';
  import Chart from '../Chart/Chart.svelte';
  import Points from '../Points/Points.svelte';

  let { ref = $bindable(), context = $bindable(), ...props }: ScatterChartProps<TData> = $props();
</script>

<!-- LayerChart's `ScatterChart`, drawn with the marks here in whichever layer it's in -->
<ScatterChartBase {Chart} {Points} bind:ref bind:context {...props} />
