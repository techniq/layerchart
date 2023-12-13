<script lang="ts">
  import Preview from '$lib/docs/Preview.svelte';

  import Chart, { Svg } from '$lib/components/Chart.svelte';
  import Axis from '$lib/components/Axis.svelte';
  import Point from '$lib/components/Point.svelte';
</script>

<h1>Examples</h1>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      x={(d) => d.x}
      y={(d) => d.y}
      xDomain={[0, 100]}
      yDomain={[0, 100]}
      padding={{ bottom: 20, left: 20 }}
    >
      <Svg>
        <Axis placement="bottom" rule />
        <Axis placement="left" rule />
        <Point d={{ x: 50, y: 50 }} let:x let:y>
          <circle cx={x} cy={y} r={10} />
        </Point>
        <Point d={{ x: 20, y: 20 }} let:x let:y>
          <circle cx={x} cy={y} r={15} class="fill-primary" />
        </Point>
      </Svg>
    </Chart>
  </div>
</Preview>
