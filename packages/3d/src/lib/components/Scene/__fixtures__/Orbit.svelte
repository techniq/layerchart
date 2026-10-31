<script lang="ts">
  import { Chart, Points, Scene } from '../../../index.js';

  let { width = 400 }: { width?: number } = $props();

  let rotate = $state(-45);
  let tilt = $state(60);
</script>

<div style="width: {width}px; height: 300px">
  <Chart data={[{ x: 5, y: 5, z: 5 }]} x="x" y="y" z="z">
    <Scene bind:rotate bind:tilt>
      <Points />
    </Scene>
  </Chart>
</div>
<span data-testid="angles">{rotate},{tilt}</span>
