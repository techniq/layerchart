<script lang="ts">
  import Preview from '$lib/docs/Preview.svelte';

  import { Axis, Chart, Line, Svg } from 'layerchart';
</script>

<h1>Examples</h1>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart xDomain={[0, 100]} yDomain={[0, 100]} padding={{ bottom: 20, left: 20 }}>
      <Svg>
        <Axis placement="bottom" rule />
        <Axis placement="left" rule />
        <Line x1={100} y1={100} x2={200} y2={200} class="stroke-2 stroke-primary" />
        <Line x1={50} y1={150} x2={400} y2={150} class="stroke-2 stroke-secondary" />
      </Svg>
    </Chart>
  </div>
</Preview>
