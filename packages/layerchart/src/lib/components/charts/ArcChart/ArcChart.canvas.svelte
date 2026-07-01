<script lang="ts" module>
  export type { ArcChartProps } from './ArcChart.shared.svelte.js';
</script>

<script lang="ts" generics="TData">
  import ArcChartBase from './ArcChart.base.svelte';
  import Chart from '../../Chart/Chart.canvas.svelte';
  import Arc from '../../Arc/Arc.canvas.svelte';
  import ArcLabel from '../../ArcLabel/ArcLabel.canvas.svelte';
  import Group from '../../Group/Group.canvas.svelte';
  import type { ArcChartProps } from './ArcChart.shared.svelte.js';

  let props: ArcChartProps<TData> = $props();
</script>

<ArcChartBase {Chart} {Arc} {ArcLabel} {Group} {...props} />
