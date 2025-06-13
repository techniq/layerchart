<script lang="ts">
  import { Axis, Chart, Rect, Layer } from 'layerchart';
  import Preview from '$lib/docs/Preview.svelte';
  import { shared } from '../../shared.svelte.js';
</script>

<h1>Examples</h1>

<Preview>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart xDomain={[0, 100]} yDomain={[0, 100]} padding={{ bottom: 20, left: 20 }}>
      <Layer type={shared.renderContext}>
        <Axis placement="bottom" rule />
        <Axis placement="left" rule />
        <Rect x={50} y={50} width={100} height={150} />
        <Rect x={90} y={80} width={200} height={100} class="fill-primary" />
        <Rect x={125} y={40} width={200} height={100} class="stroke-primary fill-none" />
      </Layer>
    </Chart>
  </div>
</Preview>
