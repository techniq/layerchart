<script lang="ts">
  import { Axis, Chart, Points, Tooltip, Scene } from '../../../index.js';

  let { data }: { data: any[] } = $props();
</script>

<div style="width: 400px; height: 300px; --color-primary: rgb(255, 0, 0)">
  <Chart
    {data}
    x="x"
    y="y"
    z="z"
    xDomain={[0, 10]}
    yDomain={[0, 10]}
    zDomain={[0, 10]}
    tooltipContext
  >
    <Scene controls={false}>
      <Axis placement="bottom" ticks={[0, 5, 10]} />
      <Points r={40} tooltip />
    </Scene>
    <Tooltip.Root>
      {#snippet children({ data })}
        <span data-testid="tooltip">{data.name}</span>
      {/snippet}
    </Tooltip.Root>
  </Chart>
</div>
