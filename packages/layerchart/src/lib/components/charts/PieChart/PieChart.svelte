<script lang="ts" module>
  export type { PieChartProps } from './PieChart.shared.svelte.js';
</script>

<script lang="ts" generics="TData">
  import PieChartBase from './PieChart.base.svelte';
  import Chart from '../../Chart/Chart.svelte';
  import Arc from '../../Arc/Arc.svelte';
  import ArcLabel from '../../ArcLabel/ArcLabel.svelte';
  import Group from '../../Group/Group.svelte';
  import Pie from '../../Pie/Pie.svelte';
  import type { PieChartProps } from './PieChart.shared.svelte.js';

  let { context = $bindable(), ...props }: PieChartProps<TData> = $props();
</script>

<PieChartBase {Chart} {Arc} {ArcLabel} {Group} {Pie} bind:context {...props} />
