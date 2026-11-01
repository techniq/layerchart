<script lang="ts">
  import { Chart, Points, Scene, perspective } from '../../../index.js';

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
    <Scene>
      <Points />
    </Scene>
  </Chart>
</div>
<span data-testid="angles">{rotate},{tilt}</span>
