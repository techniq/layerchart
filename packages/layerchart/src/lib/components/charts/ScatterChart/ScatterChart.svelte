<script lang="ts" module>
  export type { ScatterChartProps } from './ScatterChart.shared.svelte.js';
</script>

<script lang="ts" generics="TData">
  import ScatterChartBase from './ScatterChart.base.svelte';
  import Chart from '../../Chart/Chart.svelte';
  import Points from '../../Points/Points.svelte';
  import type { ScatterChartProps } from './ScatterChart.shared.svelte.js';

  let { context = $bindable(), ...props }: ScatterChartProps<TData> = $props();
</script>

<ScatterChartBase {Chart} {Points} bind:context {...props} />
