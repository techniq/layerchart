<script lang="ts">
  import Preview from '$lib/docs/Preview.svelte';

  import { Axis, Chart, Line, Layer } from 'layerchart';
  import { shared } from '../../shared.svelte.js';
</script>

<h1>Examples</h1>

<Preview>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      xDomain={[0, 100]}
      yDomain={[0, 100]}
      padding={{ top: 10, bottom: 20, left: 20, right: 10 }}
    >
      <Layer type={shared.renderContext}>
        <Axis placement="bottom" rule />
        <Axis placement="left" rule />
        <Line
          x1={100}
          y1={100}
          x2={200}
          y2={200}
          strokeWidth={10}
          class="stroke-primary bg-primary"
        />
        <Line x1={50} y1={150} x2={400} y2={150} class="stroke-2 stroke-secondary bg-secondary" />
        <Line
          x1={50}
          y1={10}
          x2={400}
          y2={50}
          class="stroke-2 stroke-accent bg-accent"
          markerStart="circle"
          markerEnd="arrow"
        />
      </Layer>
    </Chart>
  </div>
</Preview>
