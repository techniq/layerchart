<script lang="ts" module>
  export type { AreaChartProps } from './AreaChart.shared.svelte.js';
</script>

<script lang="ts" generics="TData">
  import AreaChartBase from './AreaChart.base.svelte';
  import Chart from '../../Chart/Chart.canvas.svelte';
  import Area from '../../Area/Area.canvas.svelte';
  import type { AreaChartProps } from './AreaChart.shared.svelte.js';

  let props: AreaChartProps<TData> = $props();
</script>

<AreaChartBase {Chart} {Area} {...props} />
