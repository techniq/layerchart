<script lang="ts">
  import { Axis, Chart, Circle, Svg } from 'layerchart';
  import Preview from '$lib/docs/Preview.svelte';
</script>

<h1>Examples</h1>

<Preview>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart xDomain={[0, 100]} yDomain={[0, 100]} padding={{ bottom: 20, left: 20 }}>
      <Svg>
        <Axis placement="bottom" rule />
        <Axis placement="left" rule />
        <Circle cx={100} cy={100} r={20} />
        <Circle cx={200} cy={200} r={20} class="fill-primary" />
        <Circle cx={300} cy={150} r={20} class="stroke-2 stroke-primary fill-primary/10" />
      </Svg>
    </Chart>
  </div>
</Preview>
