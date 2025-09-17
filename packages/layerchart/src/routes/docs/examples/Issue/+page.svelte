<script lang="ts">
  import { Axis, Chart, Svg } from 'layerchart';
  import { scaleTime, scaleLinear } from 'd3-scale';

  import Preview from '$lib/docs/Preview.svelte';

  export let data;
</script>

<h1>Date xScale, Number yScale</h1>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      xScale={scaleTime()}
      xDomain={[new Date('2020-01-01'), new Date('2020-01-31')]}
      yScale={scaleLinear()}
      yDomain={[0, 100]}
      padding={{ left: 16, bottom: 24 }}
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis placement="bottom" rule />
      </Svg>
    </Chart>
  </div>
</Preview>

<h1>Number xScale, Number yScale</h1>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      xScale={scaleLinear()}
      xDomain={[0, 100]}
      yScale={scaleLinear()}
      yDomain={[0, 100]}
      padding={{ left: 16, bottom: 24 }}
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis placement="bottom" rule />
      </Svg>
    </Chart>
  </div>
</Preview>
