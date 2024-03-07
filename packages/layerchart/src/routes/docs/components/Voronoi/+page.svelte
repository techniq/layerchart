<script lang="ts">
  import Chart, { Svg } from '$lib/components/Chart.svelte';
  import ChartClipPath from '$lib/components/ChartClipPath.svelte';
  import Circle from '$lib/components/Circle.svelte';
  import Points from '$lib/components/Points.svelte';
  import Voronoi from '$lib/components/Voronoi.svelte';

  import Preview from '$lib/docs/Preview.svelte';
  import { getSpiral } from '$lib/utils/genData.js';

  const data = getSpiral({ angle: 137.5, radius: 10, count: 100, width: 500, height: 500 });

  let point = { x: 0, y: 0 };
  function onMouseMove(e: MouseEvent) {
    point = {
      x: e.offsetX,
      y: e.offsetY,
    };
  }
</script>

<Preview {data}>
  <div class="h-[400px] p-4 border rounded relative" on:mousemove={onMouseMove}>
    <Chart {data} x="x" y="y" let:xScale let:yScale>
      <Svg>
        <ChartClipPath>
          <Points r={2} class="fill-primary stroke-primary" />
          <Voronoi
            data={[{ x: xScale.invert(point.x), y: yScale.invert(point.y) }, ...data]}
            classes={{
              path: 'pointer-events-none stroke-primary fill-primary/10 first:fill-primary/50',
            }}
          />
          <Circle cx={point.x} cy={point.y} r={4} class="fill-primary" />
        </ChartClipPath>
      </Svg>
    </Chart>
  </div>
</Preview>
