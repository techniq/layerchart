<script lang="ts">
  import Preview from '$lib/docs/Preview.svelte';

  import Chart, { Svg } from '$lib/components/Chart.svelte';
  import Axis from '$lib/components/Axis.svelte';
  import Circle from '$lib/components/Circle.svelte';
</script>

<h1>Examples</h1>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart xDomain={[0, 100]} yDomain={[0, 100]} padding={{ bottom: 20, left: 20 }}>
      <Svg>
        <Axis placement="bottom" rule />
        <Axis placement="left" rule />
        <Circle cx={100} cy={100} r={20} />
        <Circle cx={200} cy={200} r={20} class="fill-blue-500" />
        <Circle cx={300} cy={150} r={20} class="stroke-2 stroke-blue-500 fill-blue-100" />
      </Svg>
    </Chart>
  </div>
</Preview>
