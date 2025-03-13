<script lang="ts">
  import { Canvas, Chart, ChartClipPath, Circle, Points, Svg, Voronoi } from 'layerchart';

  import Preview from '$lib/docs/Preview.svelte';
  import { getSpiral } from '$lib/utils/genData.js';

  const data = getSpiral({ angle: 137.5, radius: 10, count: 100, width: 500, height: 500 });

  let point = { x: 0, y: 0 };
  function onPointerMove(e: PointerEvent) {
    point = {
      x: e.offsetX,
      y: e.offsetY,
    };
  }
</script>

<h2>Svg</h2>

<Preview {data}>
  <div class="h-[400px] p-4 border rounded-sm relative" on:pointermove={onPointerMove}>
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

<h2>Canvas</h2>

<Preview {data}>
  <div class="h-[400px] p-4 border rounded-sm relative" on:pointermove={onPointerMove}>
    <Chart {data} x="x" y="y" let:xScale let:yScale>
      <Canvas>
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
      </Canvas>
    </Chart>
  </div>
</Preview>
