<script lang="ts" module>
  export type { ScatterChartProps } from './ScatterChart.shared.svelte.js';
</script>

<script lang="ts" generics="TData">
  import ScatterChartBase from './ScatterChart.base.svelte';
  import Chart from '../../Chart/Chart.svg.svelte';
  import Points from '../../Points/Points.svg.svelte';
  import type { ScatterChartProps } from './ScatterChart.shared.svelte.js';

  let props: ScatterChartProps<TData> = $props();
</script>

<ScatterChartBase {Chart} {Points} {...props} />
