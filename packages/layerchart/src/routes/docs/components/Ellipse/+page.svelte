<script lang="ts">
  import { Axis, Chart, Ellipse, Layer } from 'layerchart';
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
        <Ellipse cx={100} cy={100} rx={20} ry={10} />
        <Ellipse cx={200} cy={200} rx={20} ry={10} class="fill-primary" />
        <Ellipse
          cx={300}
          cy={150}
          rx={20}
          ry={10}
          class="stroke-2 stroke-primary fill-primary/10"
        />
      </Layer>
    </Chart>
  </div>
</Preview>
