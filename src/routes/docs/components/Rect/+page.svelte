<script lang="ts">
  import Preview from '$lib/docs/Preview.svelte';

  import Chart, { Svg } from '$lib/components/Chart.svelte';
  import Axis from '$lib/components/Axis.svelte';
  import Rect from '$lib/components/Rect.svelte';
</script>

<h1>Examples</h1>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart xDomain={[0, 100]} yDomain={[0, 100]} padding={{ bottom: 20, left: 20 }}>
      <Svg>
        <Axis placement="bottom" rule />
        <Axis placement="left" rule />
        <Rect x={50} y={50} width={100} height={150} />
        <Rect x={90} y={80} width={200} height={100} class="fill-accent-500" />
        <Rect x={125} y={40} width={200} height={100} class="stroke-accent-500 fill-none" />
      </Svg>
    </Chart>
  </div>
</Preview>
