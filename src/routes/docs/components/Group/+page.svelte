<script lang="ts">
  import Preview from '$lib/docs/Preview.svelte';

  import Chart, { Svg } from '$lib/components/Chart.svelte';
  import Axis from '$lib/components/Axis.svelte';
  import Group from '$lib/components/Group.svelte';
  import Text from '$lib/components/Text.svelte';
</script>

<h1>Examples</h1>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart xDomain={[0, 100]} yDomain={[0, 100]} padding={{ bottom: 20, left: 20 }}>
      <Svg>
        <Axis placement="bottom" rule />
        <Axis placement="left" rule />
        <Group center>
          <circle r={20} />
        </Group>
        <Group x={100} y={100}>
          <circle r={10} />
          <Text value="point" textAnchor="middle" verticalAnchor="start" class="text-xs" dy={12} />
        </Group>
      </Svg>
    </Chart>
  </div>
</Preview>
