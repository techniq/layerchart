<script lang="ts">
  import { Axis, Chart, Circle, Group, Text, Layer } from 'layerchart';
  import Preview from '$lib/docs/Preview.svelte';
</script>

<h1>Examples</h1>

<Preview>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart xDomain={[0, 100]} yDomain={[0, 100]} padding={{ bottom: 20, left: 20 }}>
      <Layer>
        <Axis placement="bottom" rule />
        <Axis placement="left" rule />
        <Group center>
          <Circle r={20} class="fill-surface-content" />
        </Group>
        <Group x={100} y={100}>
          <Circle r={10} class="fill-surface-content" />
          <Text value="point" textAnchor="middle" verticalAnchor="start" class="text-xs" dy={12} />
        </Group>
      </Layer>
    </Chart>
  </div>
</Preview>
