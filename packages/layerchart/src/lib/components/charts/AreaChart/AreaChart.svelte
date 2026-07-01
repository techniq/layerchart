<script lang="ts" module>
  export type { AreaChartProps } from './AreaChart.shared.svelte.js';
</script>

<script lang="ts" generics="TData">
  import AreaChartBase from './AreaChart.base.svelte';
  import Chart from '../../Chart/Chart.svelte';
  import Area from '../../Area/Area.svelte';
  import type { AreaChartProps } from './AreaChart.shared.svelte.js';

  let { context = $bindable(), ...props }: AreaChartProps<TData> = $props();
</script>

<AreaChartBase {Chart} {Area} bind:context {...props} />
