<script lang="ts">
  import Preview from '$lib/docs/Preview.svelte';

  import { Axis, Chart, Line, Layer } from 'layerchart';
</script>

<h1>Examples</h1>

<h2>Styling using classes</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      xDomain={[0, 100]}
      yDomain={[0, 100]}
      padding={{ top: 10, bottom: 20, left: 20, right: 10 }}
    >
      <Layer>
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

<h2>Styling using attributes</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      xDomain={[0, 100]}
      yDomain={[0, 100]}
      padding={{ top: 10, bottom: 20, left: 20, right: 10 }}
    >
      <Layer>
        <Axis placement="bottom" rule />
        <Axis placement="left" rule />
        <Line x1={100} y1={100} x2={200} y2={200} strokeWidth={10} stroke="var(--color-primary)" />
        <Line x1={50} y1={150} x2={400} y2={150} strokeWidth={2} stroke="var(--color-secondary)" />
        <Line
          x1={50}
          y1={10}
          x2={400}
          y2={50}
          strokeWidth={2}
          stroke="var(--color-accent)"
          markerStart="circle"
          markerEnd="arrow"
        />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Styling using CSS variables</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      xDomain={[0, 100]}
      yDomain={[0, 100]}
      padding={{ top: 10, bottom: 20, left: 20, right: 10 }}
    >
      <Layer>
        <Axis placement="bottom" rule />
        <Axis placement="left" rule />
        <Line
          x1={100}
          y1={100}
          x2={200}
          y2={200}
          strokeWidth={10}
          style="--stroke-color:var(--color-primary)"
        />
        <Line
          x1={50}
          y1={150}
          x2={400}
          y2={150}
          strokeWidth={2}
          style="--stroke-color:var(--color-secondary)"
        />
        <Line
          x1={50}
          y1={10}
          x2={400}
          y2={50}
          strokeWidth={2}
          style="--stroke-color:var(--color-accent)"
          markerStart="circle"
          markerEnd="arrow"
        />
      </Layer>
    </Chart>
  </div>
</Preview>
