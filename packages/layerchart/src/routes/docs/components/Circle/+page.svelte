<script lang="ts">
  import { Axis, Chart, Circle, Layer } from 'layerchart';
  import Preview from '$lib/docs/Preview.svelte';
</script>

<h1>Examples</h1>

<h2>Styling using classes</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      xDomain={[0, 100]}
      yDomain={[0, 100]}
      padding={{ top: 10, bottom: 20, left: 24, right: 10 }}
    >
      <Layer>
        <Axis placement="bottom" rule />
        <Axis placement="left" rule />
        <Circle cx={100} cy={100} r={20} />
        <Circle cx={200} cy={200} r={20} class="fill-primary bg-primary" />
        <Circle cx={200} cy={50} r={20} fill="var(--color-secondary)" />
        <Circle
          cx={300}
          cy={150}
          r={20}
          class="stroke-2 stroke-primary fill-primary/10 bg-primary/10 border-2 border-primary"
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
      padding={{ top: 10, bottom: 20, left: 24, right: 10 }}
    >
      <Layer>
        <Axis placement="bottom" rule />
        <Axis placement="left" rule />
        <Circle cx={100} cy={100} r={20} fill="var(--color-surface-content)" />
        <Circle cx={200} cy={200} r={20} fill="var(--color-primary)" />
        <Circle cx={200} cy={50} r={20} fill="var(--color-secondary)" />
        <Circle
          cx={300}
          cy={150}
          r={20}
          stroke="var(--color-primary)"
          strokeWidth={2}
          fill="var(--color-primary)"
          fillOpacity={0.1}
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
      padding={{ top: 10, bottom: 20, left: 24, right: 10 }}
    >
      <Layer>
        <Axis placement="bottom" rule />
        <Axis placement="left" rule />
        <Circle cx={100} cy={100} r={20} />
        <Circle cx={200} cy={200} r={20} style="--fill-color:var(--color-primary)" />
        <Circle cx={200} cy={50} r={20} style="--fill-color:var(--color-secondary)" />
        <Circle
          cx={300}
          cy={150}
          r={20}
          style="--fill-color:var(--color-primary); --stroke-color:var(--color-primary)"
          strokeWidth={2}
          fillOpacity={0.1}
        />
      </Layer>
    </Chart>
  </div>
</Preview>
