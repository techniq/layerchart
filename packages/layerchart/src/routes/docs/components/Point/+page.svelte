<script lang="ts">
  import { Axis, Chart, Circle, Point, Layer } from 'layerchart';
  import Preview from '$lib/docs/Preview.svelte';
  import { shared } from '../../shared.svelte.js';

  let data: Array<{ x: number; y: number }> = [];
</script>

<h1>Examples</h1>

<Preview>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      {data}
      x={(d) => d.x}
      y={(d) => d.y}
      xDomain={[0, 100]}
      yDomain={[0, 100]}
      padding={{ bottom: 20, left: 20 }}
    >
      <Layer type={shared.renderContext}>
        <Axis placement="bottom" rule />
        <Axis placement="left" rule />
        <Point d={{ x: 50, y: 50 }}>
          {#snippet children({ x, y })}
            <Circle cx={x} cy={y} r={10} class="fill-surface-content" />
          {/snippet}
        </Point>
        <Point d={{ x: 20, y: 20 }}>
          {#snippet children({ x, y })}
            <Circle cx={x} cy={y} r={15} class="fill-primary" />
          {/snippet}
        </Point>
      </Layer>
    </Chart>
  </div>
</Preview>
