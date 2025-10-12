<script lang="ts">
  import { Chart, ChartClipPath, Circle, Layer, Points, Voronoi } from 'layerchart';

  import Preview from '$lib/docs/Preview.svelte';
  import { getSpiral } from '$lib/utils/genData.js';
  import { RangeField } from 'svelte-ux';
  import { shared } from '../../shared.svelte.js';

  const data = getSpiral({ angle: 137.5, radius: 10, count: 100, width: 500, height: 500 });

  let point = $state({ x: 0, y: 0 });
  function onPointerMove(e: PointerEvent) {
    point = {
      x: e.offsetX,
      y: e.offsetY,
    };
  }

  let radius = $state(0);
</script>

<h2>Example</h2>

<RangeField label="Radius" bind:value={radius} max={100} />

<Preview {data}>
  <div class="h-[400px] p-4 border rounded-sm relative" onpointermove={onPointerMove}>
    <Chart {data} x="x" y="y">
      {#snippet children({ context })}
        <Layer type={shared.layer}>
          <ChartClipPath>
            <Points r={2} class="fill-primary stroke-primary" />
            <Voronoi
              data={[
                { x: context.xScale?.invert?.(point.x), y: context.yScale?.invert?.(point.y) },
                ...data,
              ]}
              r={radius}
              classes={{
                path: 'pointer-events-none stroke-primary fill-primary/10 first:fill-primary/50',
              }}
            />
            <Circle cx={point.x} cy={point.y} r={4} class="fill-primary" />
          </ChartClipPath>
        </Layer>
      {/snippet}
    </Chart>
  </div>
</Preview>
