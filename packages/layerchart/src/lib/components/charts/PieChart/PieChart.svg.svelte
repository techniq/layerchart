<script lang="ts" module>
  export type { PieChartProps } from './PieChart.shared.svelte.js';
</script>

<script lang="ts" generics="TData">
  import PieChartBase from './PieChart.base.svelte';
  import Chart from '../../Chart/Chart.svg.svelte';
  import Arc from '../../Arc/Arc.svg.svelte';
  import ArcLabel from '../../ArcLabel/ArcLabel.svg.svelte';
  import Group from '../../Group/Group.svg.svelte';
  import Pie from '../../Pie/Pie.svg.svelte';
  import type { PieChartProps } from './PieChart.shared.svelte.js';

  let props: PieChartProps<TData> = $props();
</script>

<PieChartBase {Chart} {Arc} {ArcLabel} {Group} {Pie} {...props} />
