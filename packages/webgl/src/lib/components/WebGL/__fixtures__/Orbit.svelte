<script lang="ts">
  import { Chart, Points, WebGL, perspective } from '../../../index.js';

  let { width = 400 }: { width?: number } = $props();

  let rotate = $state(-45);
  let tilt = $state(60);
</script>

<div style="width: {width}px; height: 300px">
  <Chart
    data={[{ x: 5, y: 5, z: 5 }]}
    x="x"
    y="y"
    z="z"
    view={perspective({ rotate, tilt })}
    transform={{ mode: 'canvas', drag: 'rotate' }}
    onTransform={({ rotation }) => {
      if (!rotation) return;
      rotate = rotation.x;
      tilt = rotation.y;
    }}
  >
    <WebGL>
      <Points />
    </WebGL>
  </Chart>
</div>
<span data-testid="angles">{rotate},{tilt}</span>
